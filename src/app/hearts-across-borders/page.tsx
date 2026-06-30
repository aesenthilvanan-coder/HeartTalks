"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── math helpers ─────────────────────────────────── */
const D2R = Math.PI / 180;

function ll2v(lat: number, lng: number) {
  const φ = lat * D2R, λ = lng * D2R;
  return [Math.cos(φ) * Math.cos(λ), Math.sin(φ), Math.cos(φ) * Math.sin(λ)] as const;
}

function rotY([x, y, z]: readonly number[], a: number) {
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)] as const;
}

function slerp(A: readonly number[], B: readonly number[], t: number) {
  const dot = Math.max(-1, Math.min(1, A[0]*B[0] + A[1]*B[1] + A[2]*B[2]));
  const th  = Math.acos(dot);
  if (th < 1e-6) return A;
  const s = Math.sin(th);
  const w1 = Math.sin((1 - t) * th) / s;
  const w2 = Math.sin(t * th) / s;
  return [w1*A[0]+w2*B[0], w1*A[1]+w2*B[1], w1*A[2]+w2*B[2]] as const;
}

/* ─── city list ─────────────────────────────────────── */
const CITIES = [
  { lat: 40.71, lng: -74.01 }, { lat: 51.51, lng:  -0.13 },
  { lat: 48.86, lng:   2.35 }, { lat: 55.75, lng:  37.62 },
  { lat: 28.61, lng:  77.21 }, { lat: 39.91, lng: 116.39 },
  { lat: 35.68, lng: 139.65 }, { lat:  1.35, lng: 103.82 },
  { lat:-33.87, lng: 151.21 }, { lat:-23.55, lng: -46.63 },
  { lat: 19.43, lng: -99.13 }, { lat:  9.06, lng:   7.50 },
  { lat: -1.29, lng:  36.82 }, { lat:-33.92, lng:  18.42 },
  { lat: 30.04, lng:  31.24 }, { lat: 25.20, lng:  55.27 },
  { lat: 41.01, lng:  28.97 }, { lat: 59.33, lng:  18.07 },
  { lat: 37.57, lng: 126.98 }, { lat:-34.60, lng: -58.38 },
];

/* ─── globe canvas ──────────────────────────────────── */
function GlobeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* dimensions — read from parent section */
    let W = 0, H = 0;
    const measure = () => {
      const p = canvas.parentElement;
      W = (p ? p.offsetWidth  : 0) || window.innerWidth  || 900;
      H = (p ? p.offsetHeight : 0) || window.innerHeight || 700;
      canvas.width  = W;
      canvas.height = H;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(canvas.parentElement ?? canvas);

    /* country polygons fetched async */
    type Pt = [number, number]; // [lng, lat]
    const polys: Pt[][]     = [];
    const centroids: number[][] = [];

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((topo: {
        transform: { scale: [number,number]; translate: [number,number] };
        arcs: number[][][];
        objects: { countries: { geometries: { type: string; arcs: unknown }[] } };
      }) => {
        const [sx, sy] = topo.transform.scale;
        const [tx, ty] = topo.transform.translate;

        const decoded: Pt[][] = topo.arcs.map(arc => {
          let px = 0, py = 0;
          return arc.map(([dx, dy]) => { px += dx; py += dy; return [px*sx+tx, py*sy+ty] as Pt; });
        });

        const ring = (idx: number): Pt[] =>
          idx >= 0 ? decoded[idx] : [...decoded[~idx]].reverse() as Pt[];

        const buildPoly = (ringIdxs: number[]): Pt[] =>
          ringIdxs.flatMap((i: number) => ring(i).slice(0, -1));

        for (const g of topo.objects.countries.geometries) {
          if (g.type === "Polygon") {
            const rings = g.arcs as number[][];
            polys.push(buildPoly(rings[0]));
          } else if (g.type === "MultiPolygon") {
            for (const poly of g.arcs as number[][][]) {
              polys.push(buildPoly(poly[0]));
            }
          }
        }

        /* centroid per polygon for back-face culling */
        for (const p of polys) {
          let sx2 = 0, sy2 = 0, sz = 0;
          for (const [lng, lat] of p) { const v = ll2v(lat, lng); sx2 += v[0]; sy2 += v[1]; sz += v[2]; }
          const n = p.length || 1;
          const l = Math.hypot(sx2, sy2, sz) || 1;
          centroids.push([sx2/(n*l), sy2/(n*l), sz/(n*l)]);
        }
      })
      .catch(() => {});

    /* starfield */
    const STARS = Array.from({ length: 280 }, () => ({
      rx: Math.random(), ry: Math.random(),
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.55 + 0.15,
      ph: Math.random() * Math.PI * 2,
    }));

    /* arcs */
    interface Arc {
      A: readonly number[]; B: readonly number[];
      born: number; life: number; delay: number;
    }
    const arcs: Arc[] = [];
    let lastSpawn = -9999;

    const spawn = (born: number) => {
      const a = Math.floor(Math.random() * CITIES.length);
      let b = Math.floor(Math.random() * CITIES.length);
      while (b === a) b = Math.floor(Math.random() * CITIES.length);
      arcs.push({
        A: ll2v(CITIES[a].lat, CITIES[a].lng),
        B: ll2v(CITIES[b].lat, CITIES[b].lng),
        born, life: 3000 + Math.random() * 2000, delay: 0.08 + Math.random() * 0.12,
      });
    };

    /* animation */
    let aid = 0;
    const T0 = performance.now();
    const SEGS = 80;

    const tick = (now: number) => {
      try {
        const E   = now - T0;
        const rot = E * 0.0009; // one full spin ≈ 7 seconds — obviously visible

        if (W < 10) { aid = requestAnimationFrame(tick); return; }

        const cx = W / 2, cy = H / 2;
        const R  = Math.min(W, H) * 0.39;

        ctx.clearRect(0, 0, W, H);

        /* — stars — */
        for (const s of STARS) {
          ctx.globalAlpha = Math.max(0, s.a + Math.sin(E * 0.001 + s.ph) * 0.15);
          ctx.beginPath(); ctx.arc(s.rx * W, s.ry * H, s.r, 0, Math.PI * 2);
          ctx.fillStyle = "#fff"; ctx.fill();
        }
        ctx.globalAlpha = 1;

        /* — atmosphere — */
        const atm = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.3);
        atm.addColorStop(0,    "rgba(59,130,246,0)");
        atm.addColorStop(0.35, "rgba(59,130,246,0.20)");
        atm.addColorStop(1,    "rgba(30,64,175,0)");
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = atm; ctx.fill();

        /* — globe fill — */
        const gf = ctx.createRadialGradient(cx - R*0.28, cy - R*0.3, 0, cx, cy, R);
        gf.addColorStop(0, "#16335a"); gf.addColorStop(1, "#060d1e");
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = gf; ctx.fill();

        /* — clip everything to globe circle — */
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2); ctx.clip();

        /* — country fills & borders — */
        for (let pi = 0; pi < polys.length; pi++) {
          const p = polys[pi];
          if (!p.length) continue;
          const c = centroids[pi];
          if (!c) continue;
          const rc = rotY(c, rot);
          if (rc[2] < -0.1) continue; // back face

          ctx.beginPath();
          let first = true;
          for (const [lng, lat] of p) {
            const v = rotY(ll2v(lat, lng), rot);
            if (v[2] < 0) { first = true; continue; }
            const sx = cx + v[0] * R, sy = cy - v[1] * R;
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          const vis = Math.max(0.2, rc[2]);
          ctx.fillStyle   = `rgba(22,64,120,${(vis * 0.6).toFixed(2)})`;  ctx.fill();
          ctx.strokeStyle = `rgba(147,197,253,${(vis * 0.8).toFixed(2)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }

        /* — lat / meridian grid — */
        ctx.lineWidth = 0.4;
        for (const lat of [-66.5, -23.5, 0, 23.5, 66.5]) {
          ctx.strokeStyle = lat === 0 ? "rgba(147,197,253,0.22)" : "rgba(147,197,253,0.09)";
          ctx.beginPath(); let go = false;
          for (let lng = -180; lng <= 181; lng += 3) {
            const v = rotY(ll2v(lat, lng), rot);
            if (v[2] > 0) { const sx=cx+v[0]*R,sy=cy-v[1]*R; if(!go){ctx.moveTo(sx,sy);}else{ctx.lineTo(sx,sy);} go=true; }
            else { if (go) { ctx.stroke(); ctx.beginPath(); go=false; } }
          }
          if (go) ctx.stroke();
        }
        ctx.strokeStyle = "rgba(147,197,253,0.07)";
        for (let lng = -150; lng < 180; lng += 30) {
          ctx.beginPath(); let go = false;
          for (let lat = -88; lat <= 88; lat += 3) {
            const v = rotY(ll2v(lat, lng), rot);
            if (v[2] > 0) { const sx=cx+v[0]*R,sy=cy-v[1]*R; if(!go){ctx.moveTo(sx,sy);}else{ctx.lineTo(sx,sy);} go=true; }
            else { if (go) { ctx.stroke(); ctx.beginPath(); go=false; } }
          }
          if (go) ctx.stroke();
        }

        /* — spawn / prune arcs — */
        if (E - lastSpawn > 420 && arcs.length < 10) { spawn(E); lastSpawn = E; }
        for (let i = arcs.length - 1; i >= 0; i--) {
          if (E - arcs[i].born > arcs[i].life + 700) arcs.splice(i, 1);
        }

        /* — draw arcs with elevated curve + heart heads — */
        for (const arc of arcs) {
          const age  = E - arc.born;
          if (age < 0) continue;
          const t    = Math.min(1, age / arc.life);
          const fade = age > arc.life ? Math.max(0, 1 - (age - arc.life) / 700) : 1;
          if (fade <= 0) continue;

          /* draw trail (glow + core) */
          for (let pass = 0; pass < 2; pass++) {
            ctx.beginPath(); let go = false;
            for (let i = 0; i <= Math.floor(SEGS * t); i++) {
              const s = i / SEGS;
              const base = slerp(arc.A, arc.B, s);
              /* lift the arc above the sphere — peaks 35% at midpoint */
              const lift = 1 + 0.35 * Math.sin(s * Math.PI);
              const v = rotY([base[0]*lift, base[1]*lift, base[2]*lift], rot);
              /* visibility: lifted points can be in front even if base is behind */
              if (v[2] > -0.05) {
                const px = cx + v[0] * R, py = cy - v[1] * R;
                if (!go) { ctx.moveTo(px, py); go = true; } else ctx.lineTo(px, py);
              } else {
                if (go) { ctx.stroke(); ctx.beginPath(); go = false; }
              }
            }
            if (go) ctx.stroke();
            if (pass === 0) {
              ctx.lineWidth = 7; ctx.strokeStyle = `rgba(248,113,113,${(fade * 0.22).toFixed(2)})`;
            } else {
              ctx.lineWidth = 2.2; ctx.globalAlpha = fade * 0.95;
              ctx.strokeStyle = "#F87171"; ctx.globalAlpha = 1;
            }
          }

          /* heart head */
          if (t > arc.delay) {
            const ht = Math.min(1, (t - arc.delay) / (1 - arc.delay));
            const base = slerp(arc.A, arc.B, ht);
            const lift = 1 + 0.35 * Math.sin(ht * Math.PI);
            const v = rotY([base[0]*lift, base[1]*lift, base[2]*lift], rot);
            if (v[2] > -0.1) {
              const hx = cx + v[0] * R, hy = cy - v[1] * R;

              /* glow halo */
              const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 28);
              hg.addColorStop(0, `rgba(255,80,80,${(fade * 0.7).toFixed(2)})`);
              hg.addColorStop(1,  "rgba(0,0,0,0)");
              ctx.globalAlpha = fade;
              ctx.beginPath(); ctx.arc(hx, hy, 28, 0, Math.PI * 2);
              ctx.fillStyle = hg; ctx.fill();

              /* heart symbol — large and red */
              ctx.font = "22px serif";
              ctx.textAlign = "center"; ctx.textBaseline = "middle";
              ctx.fillStyle = "#FF3B3B";
              ctx.fillText("♥", hx, hy);
              ctx.globalAlpha = 1;

              /* arrival burst */
              if (ht > 0.88) {
                const p2 = (ht - 0.88) / 0.12;
                for (let i = 0; i < 12; i++) {
                  const ang = (i / 12) * Math.PI * 2;
                  const sr  = p2 * 28;
                  ctx.globalAlpha = fade * (1 - p2) * 0.85;
                  ctx.beginPath();
                  ctx.arc(hx + Math.cos(ang)*sr, hy + Math.sin(ang)*sr, 2.5, 0, Math.PI * 2);
                  ctx.fillStyle = "#FCA5A5"; ctx.fill();
                }
                ctx.globalAlpha = 1;
              }
            }
          }
        }

        /* — city dots — */
        for (const city of CITIES) {
          const v = rotY(ll2v(city.lat, city.lng), rot);
          if (v[2] <= 0) continue;
          const px = cx + v[0] * R, py = cy - v[1] * R;
          const ph = (E * 0.0012 + city.lat * 0.05 + city.lng * 0.03) % 1;
          ctx.globalAlpha = (1 - ph) * 0.65 * v[2];
          ctx.beginPath(); ctx.arc(px, py, ph * 14, 0, Math.PI * 2);
          ctx.strokeStyle = "#60A5FA"; ctx.lineWidth = 1; ctx.stroke();
          ctx.globalAlpha = v[2];
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#BAE6FD"; ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.restore(); /* end clip */

        /* rim */
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(96,165,250,0.18)"; ctx.lineWidth = 1.2; ctx.stroke();

        /* specular sheen */
        const sp = ctx.createRadialGradient(cx-R*0.38, cy-R*0.38, 0, cx-R*0.1, cy-R*0.1, R*0.88);
        sp.addColorStop(0, "rgba(255,255,255,0.10)");
        sp.addColorStop(0.6, "rgba(255,255,255,0.015)");
        sp.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = sp; ctx.fill();

      } catch {
        /* never let an error kill the animation loop */
      }
      aid = requestAnimationFrame(tick);
    };

    requestAnimationFrame(() => {
      measure();
      /* pre-seed arcs spread around the timeline */
      for (let i = 0; i < 6; i++) spawn(i * 500);
      aid = requestAnimationFrame(tick);
    });

    return () => { cancelAnimationFrame(aid); ro.disconnect(); };
  }, []);

  return (
    <canvas ref={ref}
      style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }} />
  );
}

/* ─── page data ─────────────────────────────────────── */
interface Member {
  name: string; email: string; phone: string;
  role: string; initial: string; color: string;
  isFounder?: boolean; bio?: string;
}

const TEAM: Member[] = [
  { name:"Jia Ginjupalli", email:"hearttalks.initiative@gmail.com", phone:"947-955-5790",
    role:"Founder & Director", initial:"J", color:"#1D4ED8", isFounder:true,
    bio:"I'm Jia! Aspiring to be a Cardiothoracic Surgeon, I hope to aid in raising the standards of healthcare around the world, trying to make a difference one lecture, one event, and one bp machine at a time." },
  { name:"Hansini Dhulipalla", email:"dhulipalla.hansini41@bloomfield.org", phone:"248-495-1389", role:"Co-Founder", initial:"H", color:"#0891B2" },
  { name:"Divya Shah",         email:"shah.divya28@bloomfield.org",         phone:"248-410-5206", role:"Co-Founder", initial:"D", color:"#7C3AED" },
  { name:"Caden Gao",          email:"gao.xiaolin94@bloomfield.org",        phone:"248-410-9723", role:"Co-Founder", initial:"C", color:"#059669" },
  { name:"Luka Lev",           email:"lev.luka32@bloomfield.org",           phone:"248-892-0367", role:"Co-Founder", initial:"L", color:"#DC2626" },
  { name:"Dev Shah",           email:"shah.dev27@bloomfield.org",           phone:"248-392-0562", role:"Co-Founder", initial:"D", color:"#D97706" },
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

function MemberRow({ m, i }: { m: Member; i: number }) {
  const { ref, v } = useReveal();
  return (
    <div ref={ref} className="flex items-center gap-4 py-4 px-5 rounded-xl"
      style={{ background:"var(--white)", border:"1px solid var(--gray-200)",
        opacity:v?1:0, transform:v?"translateY(0)":"translateY(10px)",
        transition:`opacity 0.45s ease ${i*0.06}s, transform 0.45s ease ${i*0.06}s` }}>
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
  const f = TEAM[0];
  return (
    <div ref={ref} style={{ opacity:v?1:0, transform:v?"translateY(0)":"translateY(16px)", transition:"opacity 0.6s ease, transform 0.6s ease" }}>
      <div className="rounded-xl p-8 md:p-10" style={{ background:"var(--blue-700)", border:"1px solid var(--blue-800)" }}>
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

/* ─── page ───────────────────────────────────────────── */
export default function HeartsAcrossBordersPage() {
  return (
    <main style={{ background:"var(--white)" }}>

      {/* HERO */}
      <section className="relative overflow-hidden"
        style={{ minHeight:"100vh", background:"linear-gradient(160deg,#040810 0%,#08142a 60%,#0a1d42 100%)" }}>

        <GlobeCanvas />

        {/* vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"radial-gradient(ellipse at center,transparent 42%,rgba(4,8,16,0.60) 100%)" }} />

        {/* text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ paddingTop:"64px" }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color:"rgba(147,197,253,0.8)", opacity:0,
              animation:"revealUp 0.6s ease forwards", animationDelay:"0.3s" }}>
            Flagship Initiative
          </p>
          <h1 className="font-bold mb-5"
            style={{ fontFamily:"Georgia,serif", fontSize:"clamp(36px,6vw,72px)",
              lineHeight:1.1, letterSpacing:"-0.02em", color:"#fff",
              textShadow:"0 4px 40px rgba(0,0,0,0.8)",
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
            {[["🌍","Global Reach"],["❤️","6-Member Team"],["⚡","Active Now"]].map(([icon,label]) => (
              <span key={label} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium"
                style={{ background:"rgba(255,255,255,0.08)", color:"rgba(191,219,254,0.9)",
                  border:"1px solid rgba(147,197,253,0.2)", backdropFilter:"blur(6px)" }}>
                {icon} {label}
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

        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background:"linear-gradient(to bottom,transparent,var(--white))" }}/>
      </section>

      {/* About */}
      <section className="py-16"><div className="max-w-6xl mx-auto px-6"><div className="max-w-3xl">
        <h2 className="text-xl font-semibold mb-4" style={{ color:"var(--gray-900)" }}>About the Initiative</h2>
        <div className="space-y-3 text-base leading-relaxed" style={{ color:"var(--gray-600)" }}>
          <p>We are currently implementing a Heart Health Equipment Donation Initiative,
            called <strong style={{ color:"var(--gray-800)" }}>&ldquo;HeartTalks: Hearts Across Borders&rdquo;</strong>,
            which involves the collection of vital cardiovascular or rehabilitation equipment.</p>
          <p>This equipment will be distributed to hospitals and health organizations that serve
            marginalized communities within the local and international environment —
            bridging healthcare gaps one donation at a time.</p>
        </div>
      </div></div></section>

      <hr className="section-divider"/>

      {/* Team */}
      <section className="py-16" style={{ background:"var(--gray-50)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-1" style={{ color:"var(--gray-900)" }}>Team Contacts</h2>
            <p className="text-sm" style={{ color:"var(--gray-500)" }}>{TEAM.length} members · Bloomfield, Michigan</p>
          </div>
          <div className="flex flex-col gap-3">
            {TEAM.map((m,idx) => <MemberRow key={idx} m={m} i={idx}/>)}
          </div>
        </div>
      </section>

      <hr className="section-divider"/>

      {/* Founder */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color:"var(--blue-600)" }}>Founder&apos;s Message</p>
            <h2 className="text-xl font-semibold" style={{ color:"var(--gray-900)" }}>From the Desk of Jia Ginjupalli</h2>
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
            <Link href="/" className="text-sm transition-colors hover:text-white" style={{ color:"var(--gray-500)" }}>
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
