"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════
   TYPES & MATH
═══════════════════════════════════════════════════ */
interface Vec3 { x: number; y: number; z: number }

const toRad = (d: number) => (d * Math.PI) / 180;

function ll2v(lat: number, lng: number): Vec3 {
  const φ = toRad(lat), λ = toRad(lng);
  return { x: Math.cos(φ) * Math.cos(λ), y: Math.sin(φ), z: Math.cos(φ) * Math.sin(λ) };
}

function rotY(v: Vec3, a: number): Vec3 {
  return { x: v.x * Math.cos(a) + v.z * Math.sin(a), y: v.y, z: -v.x * Math.sin(a) + v.z * Math.cos(a) };
}

function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a.x*b.x + a.y*b.y + a.z*b.z));
  const th  = Math.acos(dot);
  if (th < 1e-5) return { ...a };
  const s = Math.sin(th);
  return {
    x: (Math.sin((1-t)*th)/s)*a.x + (Math.sin(t*th)/s)*b.x,
    y: (Math.sin((1-t)*th)/s)*a.y + (Math.sin(t*th)/s)*b.y,
    z: (Math.sin((1-t)*th)/s)*a.z + (Math.sin(t*th)/s)*b.z,
  };
}

/* ═══════════════════════════════════════════════════
   CITIES — well spread around the globe
═══════════════════════════════════════════════════ */
const CITIES = [
  { lat: 40.71, lng: -74.01 }, { lat: 51.51, lng:  -0.13 },
  { lat: 48.86, lng:   2.35 }, { lat: 52.52, lng:  13.40 },
  { lat: 55.75, lng:  37.62 }, { lat: 28.61, lng:  77.21 },
  { lat: 39.91, lng: 116.39 }, { lat: 35.68, lng: 139.65 },
  { lat:  1.35, lng: 103.82 }, { lat:-33.87, lng: 151.21 },
  { lat:-23.55, lng: -46.63 }, { lat: 19.43, lng: -99.13 },
  { lat:  9.06, lng:   7.50 }, { lat:-1.29,  lng:  36.82 },
  { lat:-33.92, lng:  18.42 }, { lat: 30.04, lng:  31.24 },
  { lat: 25.20, lng:  55.27 }, { lat: 41.01, lng:  28.97 },
  { lat: 59.33, lng:  18.07 }, { lat: 37.57, lng: 126.98 },
];

interface Arc {
  from: Vec3; to: Vec3;
  born: number; life: number; headDelay: number;
  hue: number;
}

/* ═══════════════════════════════════════════════════
   GLOBE CANVAS
═══════════════════════════════════════════════════ */
function GlobeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const measure = () => {
      const p = canvas.parentElement;
      W = (p?.offsetWidth  || window.innerWidth  || 900);
      H = (p?.offsetHeight || window.innerHeight || 700);
      canvas.width  = W;
      canvas.height = H;
    };

    const ro = new ResizeObserver(measure);
    ro.observe(canvas.parentElement ?? canvas);

    /* ── Country polygon data ── */
    type Ring = [number, number][]; // [lng, lat][]
    const polys: Ring[][] = [];      // [polygon][ring][[lng,lat]]
    const polyCentroids: Vec3[] = [];

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: {
        transform: { scale: [number,number]; translate: [number,number] };
        arcs: number[][][];
        objects: { countries: { geometries: { type: string; arcs: number[][][] | number[][][][] }[] } };
      }) => {
        const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;

        /* Decode delta-quantized arcs → [lng, lat] */
        const decoded: Ring[] = topo.arcs.map(arc => {
          let px = 0, py = 0;
          return arc.map(([dx, dy]) => {
            px += dx; py += dy;
            return [px * sx + tx, py * sy + ty] as [number, number];
          });
        });

        const ringOf = (idx: number): Ring =>
          idx >= 0 ? decoded[idx] : ([...decoded[~idx]].reverse() as Ring);

        // ring = array of arc indices; returns concatenated [lng,lat] points
        const buildRing = (ring: number[]): Ring =>
          ring.flatMap((idx: number) => ringOf(idx).slice(0, -1)) as Ring;

        for (const geom of topo.objects.countries.geometries) {
          if (geom.type === "Polygon") {
            // arcs: number[][] — array of rings
            polys.push((geom.arcs as unknown as number[][]).map(buildRing));
          } else if (geom.type === "MultiPolygon") {
            // arcs: number[][][] — array of polygons, each polygon is array of rings
            for (const polygon of (geom.arcs as unknown as number[][][])) {
              polys.push(polygon.map(buildRing));
            }
          }
        }

        /* Pre-compute centroid for quick front/back test */
        polyCentroids.push(...polys.map(poly => {
          const outer = poly[0];
          if (!outer?.length) return { x: 0, y: 0, z: 1 };
          let sx2 = 0, sy2 = 0, sz = 0;
          for (const [lng, lat] of outer) { const v = ll2v(lat, lng); sx2 += v.x; sy2 += v.y; sz += v.z; }
          const n = outer.length;
          const len = Math.hypot(sx2, sy2, sz) || 1;
          return { x: sx2/(n*len), y: sy2/(n*len), z: sz/(n*len) };
        }));
      })
      .catch(() => { /* graceful degrade to grid-only */ });

    /* ── Starfield ── */
    const STARS = Array.from({ length: 300 }, () => ({
      rx: Math.random(), ry: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.6 + 0.15,
      ph: Math.random() * Math.PI * 2,
    }));

    /* ── Arc pool ── */
    const arcs: Arc[] = [];
    let lastSpawn = -9999;

    const spawnArc = (now: number) => {
      const a = Math.floor(Math.random() * CITIES.length);
      let b = Math.floor(Math.random() * CITIES.length);
      while (b === a) b = Math.floor(Math.random() * CITIES.length);
      arcs.push({
        from: ll2v(CITIES[a].lat, CITIES[a].lng),
        to:   ll2v(CITIES[b].lat, CITIES[b].lng),
        born: now,
        life: 3200 + Math.random() * 2000,
        headDelay: 0.1 + Math.random() * 0.15,
        hue: Math.random() * 40 - 10, // -10 to 30 → pinkish-red range
      });
    };

    /* ── Animation loop ── */
    let aid = 0;
    const T0 = performance.now();

    const draw = (now: number) => {
      const E    = now - T0;
      const rot  = E * 0.00028; // faster spin — one rev ≈ 22 sec
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.5;
      const R  = Math.min(W, H) * 0.40;

      /* Stars */
      STARS.forEach(s => {
        ctx.globalAlpha = Math.max(0, s.a + Math.sin(E * 0.001 + s.ph) * 0.15);
        ctx.beginPath(); ctx.arc(s.rx * W, s.ry * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* Atmosphere glow — behind globe */
      const atm = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
      atm.addColorStop(0,   "rgba(56,130,246,0)");
      atm.addColorStop(0.3, "rgba(56,130,246,0.18)");
      atm.addColorStop(1,   "rgba(30,64,175,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();

      /* Globe base fill */
      const gf = ctx.createRadialGradient(cx - R*0.3, cy - R*0.3, 0, cx, cy, R);
      gf.addColorStop(0, "#162a52");
      gf.addColorStop(1, "#070e1e");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = gf; ctx.fill();

      /* ── CLIP to globe circle ── */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R - 1, 0, Math.PI * 2); ctx.clip();

      /* Country fills */
      if (polys.length > 0) {
        polys.forEach((poly, pi) => {
          const outer = poly[0];
          if (!outer?.length) return;
          const centroid = polyCentroids[pi];
          if (!centroid) return;
          const rc = rotY(centroid, rot);
          if (rc.z < -0.05) return; // fully on back side

          ctx.beginPath();
          let penDown = false;
          for (const [lng, lat] of outer) {
            const v = rotY(ll2v(lat, lng), rot);
            if (v.z < 0) { penDown = false; continue; }
            const sx = cx + v.x * R, sy2 = cy - v.y * R;
            if (!penDown) { ctx.moveTo(sx, sy2); penDown = true; }
            else ctx.lineTo(sx, sy2);
          }
          ctx.closePath();
          /* fill */
          ctx.fillStyle = `rgba(30,78,140,${Math.max(0.25, rc.z * 0.55)})`;
          ctx.fill();
          /* border */
          ctx.strokeStyle = `rgba(96,180,250,${Math.max(0.35, rc.z * 0.75)})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        });
      }

      /* Lat grid (equator + tropics) */
      [0, 23.5, -23.5, 66.5, -66.5].forEach(lat => {
        ctx.beginPath(); let go = false;
        ctx.lineWidth = lat === 0 ? 0.7 : 0.3;
        ctx.strokeStyle = lat === 0 ? "rgba(148,210,255,0.3)" : "rgba(148,210,255,0.12)";
        for (let lng2 = -180; lng2 <= 181; lng2 += 2) {
          const v = rotY(ll2v(lat, lng2), rot);
          if (v.z > 0) { const sx=cx+v.x*R,sy2=cy-v.y*R; if(go)ctx.lineTo(sx,sy2); else ctx.moveTo(sx,sy2); go=true; }
          else { if (go) { ctx.stroke(); ctx.beginPath(); go=false; } }
        }
        if (go) ctx.stroke();
      });

      /* Meridians */
      ctx.lineWidth = 0.3; ctx.strokeStyle = "rgba(148,210,255,0.1)";
      for (let lng2 = -180; lng2 < 180; lng2 += 30) {
        ctx.beginPath(); let go = false;
        for (let lat2 = -88; lat2 <= 88; lat2 += 2) {
          const v = rotY(ll2v(lat2, lng2), rot);
          if (v.z > 0) { const sx=cx+v.x*R,sy2=cy-v.y*R; if(go)ctx.lineTo(sx,sy2); else ctx.moveTo(sx,sy2); go=true; }
          else { if (go) { ctx.stroke(); ctx.beginPath(); go=false; } }
        }
        if (go) ctx.stroke();
      }

      /* Spawn arcs */
      if (E - lastSpawn > 550 && arcs.length < 8) { spawnArc(E); lastSpawn = E; }
      for (let i = arcs.length - 1; i >= 0; i--) {
        if (E - arcs[i].born > arcs[i].life + 800) arcs.splice(i, 1);
      }

      /* Draw arcs + heart heads */
      arcs.forEach(arc => {
        const age  = E - arc.born;
        const t    = Math.min(1, age / arc.life);
        const fade = age > arc.life ? Math.max(0, 1 - (age - arc.life) / 800) : 1;
        if (fade <= 0) return;

        const SEGS = 90;
        const drawT = t;

        /* Glow pass */
        ctx.lineWidth = 4; ctx.strokeStyle = `rgba(248,113,113,${fade * 0.15})`;
        ctx.beginPath(); let go = false;
        for (let i = 0; i <= SEGS * drawT; i++) {
          const v = rotY(slerp(arc.from, arc.to, i / SEGS), rot);
          if (v.z > 0) {
            const sx=cx+v.x*R, sy2=cy-v.y*R;
            if (!go) { ctx.moveTo(sx,sy2); go=true; } else ctx.lineTo(sx,sy2);
          } else { if (go) { ctx.stroke(); ctx.beginPath(); go=false; } }
        }
        if (go) ctx.stroke();

        /* Core pass */
        ctx.lineWidth = 1.6; ctx.globalAlpha = fade * 0.95;
        ctx.strokeStyle = `hsl(${350 + arc.hue},90%,72%)`;
        ctx.beginPath(); go = false;
        for (let i = 0; i <= SEGS * drawT; i++) {
          const v = rotY(slerp(arc.from, arc.to, i / SEGS), rot);
          if (v.z > 0) {
            const sx=cx+v.x*R, sy2=cy-v.y*R;
            if (!go) { ctx.moveTo(sx,sy2); go=true; } else ctx.lineTo(sx,sy2);
          } else { if (go) { ctx.stroke(); ctx.beginPath(); go=false; } }
        }
        if (go) ctx.stroke();
        ctx.globalAlpha = 1;

        /* Heart head */
        const hd = arc.headDelay;
        if (t > hd) {
          const ht = Math.min(1, (t - hd) / (1 - hd));
          const hv = rotY(slerp(arc.from, arc.to, ht), rot);
          if (hv.z > 0) {
            const hx = cx + hv.x * R, hy = cy - hv.y * R;
            /* glow halo */
            const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 18);
            hg.addColorStop(0, `rgba(252,100,100,${fade * 0.6})`);
            hg.addColorStop(1, "rgba(0,0,0,0)");
            ctx.beginPath(); ctx.arc(hx, hy, 18, 0, Math.PI * 2);
            ctx.fillStyle = hg; ctx.fill();
            /* heart symbol */
            ctx.globalAlpha = fade;
            ctx.font = "bold 16px serif";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillStyle = "#FF6B6B";
            ctx.shadowColor = "#FF6B6B"; ctx.shadowBlur = 8;
            ctx.fillText("♥", hx, hy);
            ctx.shadowBlur = 0; ctx.globalAlpha = 1;

            /* arrival sparkle */
            if (ht > 0.9) {
              const p2 = (ht - 0.9) / 0.1;
              for (let i = 0; i < 10; i++) {
                const ang = (i / 10) * Math.PI * 2;
                const sr  = p2 * 22;
                ctx.globalAlpha = fade * (1 - p2) * 0.9;
                ctx.beginPath();
                ctx.arc(hx + Math.cos(ang)*sr, hy + Math.sin(ang)*sr, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = "#FCA5A5"; ctx.fill();
              }
              ctx.globalAlpha = 1;
            }
          }
        }
      });

      /* City dots */
      CITIES.forEach(city => {
        const v = rotY(ll2v(city.lat, city.lng), rot);
        if (v.z <= 0) return;
        const sx = cx + v.x * R, sy2 = cy - v.y * R;
        const ph = (E * 0.001 + city.lat * 0.05 + city.lng * 0.03) % 1;
        /* pulse */
        ctx.globalAlpha = (1 - ph) * 0.7 * v.z;
        ctx.beginPath(); ctx.arc(sx, sy2, ph * 12, 0, Math.PI * 2);
        ctx.strokeStyle = "#60A5FA"; ctx.lineWidth = 0.8; ctx.stroke();
        /* core dot */
        ctx.globalAlpha = v.z;
        ctx.beginPath(); ctx.arc(sx, sy2, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "#BAE6FD"; ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.restore(); /* end clip */

      /* Rim / terminator */
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(96,165,250,0.2)"; ctx.lineWidth = 1; ctx.stroke();

      /* Specular sheen */
      const sp = ctx.createRadialGradient(cx-R*0.4, cy-R*0.4, 0, cx-R*0.15, cy-R*0.15, R*0.85);
      sp.addColorStop(0, "rgba(255,255,255,0.10)");
      sp.addColorStop(0.55, "rgba(255,255,255,0.02)");
      sp.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sp; ctx.fill();

      aid = requestAnimationFrame(draw);
    };

    requestAnimationFrame(() => {
      measure();
      /* Pre-seed arcs */
      for (let i = 0; i < 5; i++) spawnArc(i * 700);
      aid = requestAnimationFrame(draw);
    });

    return () => { cancelAnimationFrame(aid); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   PAGE DATA
═══════════════════════════════════════════════════ */
interface Member {
  name: string; email: string; phone: string;
  role: string; initial: string; color: string;
  isFounder?: boolean; bio?: string;
}

const team: Member[] = [
  { name: "Jia Ginjupalli",     email: "ginjupalli.jia05@bloomfield.org",    phone: "947-955-5790", role: "Founder & Director", initial: "J", color: "#1D4ED8", isFounder: true,
    bio: "I'm Jia! Aspiring to be a Cardiothoracic Surgeon, I hope to aid in raising the standards of healthcare around the world, trying to make a difference one lecture, one event, and one bp machine at a time." },
  { name: "Hansini Dhulipalla", email: "dhulipalla.hansini41@bloomfield.org", phone: "248-495-1389", role: "Co-Founder",        initial: "H", color: "#0891B2" },
  { name: "Divya Shah",         email: "shah.divya28@bloomfield.org",         phone: "248-410-5206", role: "Team Member",       initial: "D", color: "#7C3AED" },
  { name: "Caden Gao",          email: "gao.xiaolin94@bloomfield.org",        phone: "248-410-9723", role: "Team Member",       initial: "C", color: "#059669" },
  { name: "Luka Lev",           email: "lev.luka32@bloomfield.org",           phone: "248-892-0367", role: "Team Member",       initial: "L", color: "#DC2626" },
  { name: "Dev Shah",           email: "shah.dev27@bloomfield.org",           phone: "248-392-0562", role: "Team Member",       initial: "D", color: "#D97706" },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return { ref, v };
}

function MemberRow({ m, index }: { m: Member; index: number }) {
  const { ref, v } = useReveal();
  return (
    <div ref={ref} className="flex items-center gap-4 py-4 px-5 rounded-xl"
      style={{ background:"var(--white)", border:"1px solid var(--gray-200)",
        opacity:v?1:0, transform:v?"translateY(0)":"translateY(10px)",
        transition:`opacity 0.45s ease ${index*0.06}s, transform 0.45s ease ${index*0.06}s` }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        style={{ background:m.color, boxShadow:`0 2px 8px ${m.color}40` }}>{m.initial}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color:"var(--gray-900)" }}>{m.name}</span>
          {m.isFounder && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background:"var(--blue-50)", color:"var(--blue-700)", border:"1px solid var(--blue-200)" }}>
              Founder
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color:"var(--gray-400)" }}>{m.role}</span>
      </div>
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
        <a href={`mailto:${m.email}`} className="text-xs hover:underline" style={{ color:"var(--gray-600)" }}>{m.email}</a>
        <span style={{ color:"var(--gray-200)" }}>·</span>
        <a href={`tel:${m.phone.replace(/-/g,"")}`} className="text-xs" style={{ color:"var(--gray-500)" }}>{m.phone}</a>
      </div>
      <div className="flex sm:hidden flex-shrink-0">
        <a href={`mailto:${m.email}`} className="text-xs" style={{ color:"var(--blue-600)" }}>Email ↗</a>
      </div>
    </div>
  );
}

function FounderCard() {
  const { ref, v } = useReveal();
  const f = team[0];
  return (
    <div ref={ref} style={{ opacity:v?1:0, transform:v?"translateY(0)":"translateY(16px)", transition:"opacity 0.6s ease, transform 0.6s ease" }}>
      <div className="rounded-xl p-8 md:p-10"
        style={{ background:"var(--blue-700)", border:"1px solid var(--blue-800)" }}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", animation:"heartbeat 2.5s ease-in-out infinite" }}>J</div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg mb-1" style={{ fontFamily:"Georgia,serif" }}>{f.name}</h3>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color:"rgba(255,255,255,0.5)" }}>Founder · HeartTalks</p>
            <p className="text-sm mb-6" style={{ color:"rgba(255,255,255,0.55)" }}>Aspiring Cardiothoracic Surgeon</p>
            <blockquote className="border-l-2 pl-4 mb-6" style={{ borderColor:"rgba(255,255,255,0.3)" }}>
              <p className="text-white text-base leading-relaxed italic">&ldquo;{f.bio}&rdquo;</p>
            </blockquote>
            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${f.email}`} className="text-xs font-medium px-3 py-1.5 rounded-md"
                style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.9)", border:"1px solid rgba(255,255,255,0.2)" }}>
                ✉ {f.email}
              </a>
              <a href={`tel:${f.phone.replace(/-/g,"")}`} className="text-xs font-medium px-3 py-1.5 rounded-md"
                style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.9)", border:"1px solid rgba(255,255,255,0.2)" }}>
                {f.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
export default function HeartsAcrossBordersPage() {
  return (
    <main style={{ background:"var(--white)" }}>

      {/* HERO */}
      <section className="relative overflow-hidden"
        style={{ minHeight:"100vh", background:"linear-gradient(160deg,#04090f 0%,#08142a 50%,#0a1c40 100%)" }}>
        <GlobeCanvas />

        {/* vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"radial-gradient(ellipse at center,transparent 45%,rgba(4,9,15,0.65) 100%)" }} />

        {/* text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ paddingTop:"64px" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color:"rgba(147,197,253,0.8)", opacity:0, animation:"revealUp 0.6s ease forwards", animationDelay:"0.3s" }}>
            Flagship Initiative
          </p>
          <h1 className="font-bold mb-5"
            style={{ fontFamily:"Georgia,serif", fontSize:"clamp(36px,6vw,72px)", lineHeight:1.1,
              letterSpacing:"-0.02em", color:"#fff", textShadow:"0 4px 40px rgba(0,0,0,0.8)",
              opacity:0, animation:"revealUp 0.7s ease forwards", animationDelay:"0.5s" }}>
            Hearts Across Borders
          </h1>
          <p className="max-w-lg mx-auto text-base leading-relaxed mb-8"
            style={{ color:"rgba(191,219,254,0.85)", opacity:0,
              animation:"revealUp 0.7s ease forwards", animationDelay:"0.75s" }}>
            Collecting vital cardiovascular equipment and delivering it to hospitals
            serving marginalized communities — across borders, across the world.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-12"
            style={{ opacity:0, animation:"revealUp 0.6s ease forwards", animationDelay:"1s" }}>
            {[{ label:"Global Reach", icon:"🌍" },{ label:"6-Member Team", icon:"❤️" },{ label:"Active Now", icon:"⚡" }].map(c => (
              <span key={c.label} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium"
                style={{ background:"rgba(255,255,255,0.08)", color:"rgba(191,219,254,0.9)",
                  border:"1px solid rgba(147,197,253,0.2)", backdropFilter:"blur(6px)" }}>
                <span>{c.icon}</span>{c.label}
              </span>
            ))}
          </div>
          <div style={{ opacity:0, animation:"fadeIn 1s ease forwards", animationDelay:"1.4s" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
              style={{ color:"rgba(147,197,253,0.5)", animation:"scrollBounce 1.8s ease-in-out infinite" }}>
              <path d="M5 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background:"linear-gradient(to bottom,transparent,var(--white))" }} />
      </section>

      {/* About */}
      <section className="py-16" style={{ background:"var(--white)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold mb-4" style={{ color:"var(--gray-900)" }}>About the Initiative</h2>
            <div className="space-y-3 text-base leading-relaxed" style={{ color:"var(--gray-600)" }}>
              <p>We are currently implementing a Heart Health Equipment Donation Initiative,
                called <strong style={{ color:"var(--gray-800)" }}>&ldquo;HeartTalks: Hearts Across Borders&rdquo;</strong>,
                which involves the collection of vital cardiovascular or rehabilitation equipment.</p>
              <p>This equipment will be distributed to hospitals and health organizations that serve
                marginalized communities within the local and international environment —
                bridging healthcare gaps one donation at a time.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider"/>

      {/* Team */}
      <section className="py-16" style={{ background:"var(--gray-50)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-1" style={{ color:"var(--gray-900)" }}>Team Contacts</h2>
            <p className="text-sm" style={{ color:"var(--gray-500)" }}>{team.length} members · Bloomfield, Michigan</p>
          </div>
          <div className="flex flex-col gap-3">
            {team.map((m,i) => <MemberRow key={i} m={m} index={i}/>)}
          </div>
        </div>
      </section>

      <hr className="section-divider"/>

      {/* Founder */}
      <section className="py-16" style={{ background:"var(--white)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color:"var(--blue-600)" }}>
              Founder&apos;s Message
            </p>
            <h2 className="text-xl font-semibold" style={{ color:"var(--gray-900)" }}>
              From the Desk of Jia Ginjupalli
            </h2>
          </div>
          <div className="max-w-3xl"><FounderCard/></div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:"var(--gray-900)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-white" style={{ fontFamily:"Georgia,serif" }}>
              HeartTalks <span style={{ color:"var(--gray-600)", fontWeight:400 }}>· Hearts Across Borders</span>
            </span>
            <Link href="/" className="text-sm transition-colors duration-150 hover:text-white" style={{ color:"var(--gray-500)" }}>
              ← Back to Home
            </Link>
          </div>
          <div className="mt-6 pt-6 text-xs text-center"
            style={{ borderTop:"1px solid rgba(255,255,255,0.07)", color:"var(--gray-600)" }}>
            © {new Date().getFullYear()} HeartTalks. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
