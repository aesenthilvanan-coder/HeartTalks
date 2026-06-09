"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════
   GLOBE CANVAS — rotating 3‑D sphere with great‑circle arcs
   and traveling heart particles
══════════════════════════════════════════════════════════ */

interface Vec3 { x: number; y: number; z: number }
interface City { lat: number; lng: number; name: string }
interface Conn {
  from: number; to: number
  born: number          // ms since anim start when created
  life: number          // total ms this connection lives
  offset: number        // 0..1 fractional delay before heart departs
}

const CITIES: City[] = [
  { lat: 42.36, lng: -71.06, name: "Boston" },
  { lat: 51.51, lng: -0.13,  name: "London" },
  { lat: 28.61, lng:  77.21, name: "New Delhi" },
  { lat:  9.06, lng:   7.50, name: "Abuja" },
  { lat: -1.29, lng:  36.82, name: "Nairobi" },
  { lat:-23.55, lng: -46.63, name: "São Paulo" },
  { lat:  1.35, lng: 103.82, name: "Singapore" },
  { lat: 48.86, lng:   2.35, name: "Paris" },
  { lat: 35.68, lng: 139.65, name: "Tokyo" },
  { lat:-33.92, lng:  18.42, name: "Cape Town" },
  { lat: 30.04, lng:  31.24, name: "Cairo" },
  { lat: 19.43, lng: -99.13, name: "Mexico City" },
];

const toRad = (d: number) => (d * Math.PI) / 180;

function toVec(lat: number, lng: number): Vec3 {
  const phi = toRad(lat), lam = toRad(lng);
  return {
    x: Math.cos(phi) * Math.cos(lam),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.sin(lam),
  };
}

function rotY(v: Vec3, a: number): Vec3 {
  return {
    x: v.x * Math.cos(a) + v.z * Math.sin(a),
    y: v.y,
    z: -v.x * Math.sin(a) + v.z * Math.cos(a),
  };
}

function proj(v: Vec3, cx: number, cy: number, R: number) {
  return { sx: cx + v.x * R, sy: cy - v.y * R, vis: v.z > 0 };
}

function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a.x*b.x + a.y*b.y + a.z*b.z));
  const th  = Math.acos(dot);
  if (th < 1e-4) return { x: a.x, y: a.y, z: a.z };
  const s   = Math.sin(th);
  const ta  = Math.sin((1 - t) * th) / s;
  const tb  = Math.sin(t * th) / s;
  return { x: ta*a.x + tb*b.x, y: ta*a.y + tb*b.y, z: ta*a.z + tb*b.z };
}

function GlobeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ── Static background stars ── */
    const STARS = Array.from({ length: 260 }, () => ({
      rx: Math.random(), ry: Math.random(),
      r:  Math.random() * 1.1 + 0.25,
      a:  Math.random() * 0.55 + 0.15,
      ph: Math.random() * Math.PI * 2,
    }));

    /* ── Connection queue ── */
    const conns: Conn[] = [];
    let lastSpawn = -9999;
    const spawnConn = (now: number) => {
      const f = Math.floor(Math.random() * CITIES.length);
      let t = Math.floor(Math.random() * CITIES.length);
      while (t === f) t = Math.floor(Math.random() * CITIES.length);
      conns.push({ from: f, to: t, born: now, life: 4500 + Math.random() * 2000, offset: 0.12 + Math.random() * 0.2 });
    };

    const T0 = performance.now();
    let aid: number;

    const frame = (now: number) => {
      const E = now - T0;          // elapsed ms
      const rot = E * 0.000135;    // globe rotation angle
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.5;
      const R  = Math.min(W, H) * 0.36;

      /* ── Stars ── */
      STARS.forEach(s => {
        ctx.globalAlpha = Math.max(0, s.a + Math.sin(E * 0.0009 + s.ph) * 0.18);
        ctx.beginPath();
        ctx.arc(s.rx * W, s.ry * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* ── Atmosphere halo ── */
      const atm = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.22);
      atm.addColorStop(0,   "rgba(37,99,235,0)");
      atm.addColorStop(0.35,"rgba(37,99,235,0.22)");
      atm.addColorStop(1,   "rgba(30,64,175,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();

      /* ── Globe fill ── */
      const gf = ctx.createRadialGradient(cx - R*0.28, cy - R*0.32, 0, cx, cy, R);
      gf.addColorStop(0, "#1e3a6e");
      gf.addColorStop(1, "#0b1221");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = gf; ctx.fill();

      /* ── Latitude grid ── */
      ctx.lineWidth = 0.6;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.strokeStyle = lat === 0 ? "rgba(147,197,253,0.22)" : "rgba(147,197,253,0.1)";
        ctx.beginPath(); let go = false;
        for (let lng = -180; lng <= 181; lng += 2) {
          const v = rotY(toVec(lat, lng), rot);
          const p = proj(v, cx, cy, R);
          if (p.vis) { if (go) { ctx.lineTo(p.sx, p.sy); } else { ctx.moveTo(p.sx, p.sy); } go = true; }
          else { if (go) { ctx.stroke(); ctx.beginPath(); go = false; } }
        }
        if (go) ctx.stroke();
      }

      /* ── Longitude grid ── */
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(147,197,253,0.08)";
      for (let lng = -180; lng < 180; lng += 20) {
        ctx.beginPath(); let go = false;
        for (let lat = -88; lat <= 88; lat += 2) {
          const v = rotY(toVec(lat, lng), rot);
          const p = proj(v, cx, cy, R);
          if (p.vis) { if (go) { ctx.lineTo(p.sx, p.sy); } else { ctx.moveTo(p.sx, p.sy); } go = true; }
          else { if (go) { ctx.stroke(); ctx.beginPath(); go = false; } }
        }
        if (go) ctx.stroke();
      }

      /* ── Specular highlight ── */
      const sp = ctx.createRadialGradient(cx - R*0.42, cy - R*0.42, 0, cx - R*0.2, cy - R*0.2, R*0.9);
      sp.addColorStop(0, "rgba(255,255,255,0.09)");
      sp.addColorStop(0.6,"rgba(255,255,255,0.02)");
      sp.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sp; ctx.fill();

      /* ── Spawn connections ── */
      if (E - lastSpawn > 1100 && conns.length < 4) {
        spawnConn(E); lastSpawn = E;
      }
      for (let i = conns.length - 1; i >= 0; i--) {
        if (E - conns[i].born > conns[i].life + 900) conns.splice(i, 1);
      }

      /* ── Draw arcs + hearts ── */
      conns.forEach(conn => {
        const age  = E - conn.born;
        const t    = Math.min(1, age / conn.life);
        const fade = age > conn.life ? Math.max(0, 1 - (age - conn.life) / 900) : 1;
        if (fade <= 0) return;

        const VA = toVec(CITIES[conn.from].lat, CITIES[conn.from].lng);
        const VB = toVec(CITIES[conn.to].lat,   CITIES[conn.to].lng);
        const SEGS = 80;
        const drawTo = t;

        const drawArc = (lw: number, alpha: number, color: string) => {
          ctx.lineWidth = lw; let go = false;
          for (let i = 0; i <= SEGS * drawTo; i++) {
            const v = rotY(slerp(VA, VB, i / SEGS), rot);
            const p = proj(v, cx, cy, R);
            if (p.vis) { if (go) { ctx.lineTo(p.sx, p.sy); } else { ctx.beginPath(); ctx.moveTo(p.sx, p.sy); } go = true; }
            else { if (go) { ctx.globalAlpha = fade * alpha; ctx.strokeStyle = color; ctx.stroke(); ctx.globalAlpha = 1; ctx.beginPath(); go = false; } }
          }
          if (go) { ctx.globalAlpha = fade * alpha; ctx.strokeStyle = color; ctx.stroke(); ctx.globalAlpha = 1; }
        };

        drawArc(5, 0.18, "#93C5FD");   // wide glow
        drawArc(1.8, 0.9, "#60A5FA");  // core

        /* ── Traveling heart ── */
        const hDelay = conn.offset;
        if (t > hDelay) {
          const ht = Math.min(1, (t - hDelay) / (1 - hDelay));
          const hv = rotY(slerp(VA, VB, ht), rot);
          const hp = proj(hv, cx, cy, R);
          if (hp.vis) {
            /* glow halo */
            const hg = ctx.createRadialGradient(hp.sx, hp.sy, 0, hp.sx, hp.sy, 16);
            hg.addColorStop(0, "rgba(252,165,165,0.55)");
            hg.addColorStop(1, "rgba(0,0,0,0)");
            ctx.globalAlpha = fade;
            ctx.beginPath(); ctx.arc(hp.sx, hp.sy, 16, 0, Math.PI * 2);
            ctx.fillStyle = hg; ctx.fill();

            /* heart symbol */
            ctx.fillStyle = "#F87171";
            ctx.font = "bold 13px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("♥", hp.sx, hp.sy);
            ctx.globalAlpha = 1;

            /* arrival burst */
            if (ht > 0.92) {
              const boom = (ht - 0.92) / 0.08;
              for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2;
                const sr  = boom * 18;
                ctx.globalAlpha = fade * (1 - boom) * 0.75;
                ctx.beginPath(); ctx.arc(hp.sx + Math.cos(ang)*sr, hp.sy + Math.sin(ang)*sr, 2, 0, Math.PI * 2);
                ctx.fillStyle = "#FCA5A5"; ctx.fill();
              }
              ctx.globalAlpha = 1;
            }
          }
        }
      });

      /* ── City dots ── */
      CITIES.forEach((city) => {
        const v = rotY(toVec(city.lat, city.lng), rot);
        const p = proj(v, cx, cy, R);
        if (!p.vis) return;

        /* pulse ring — each city has its own phase */
        const ph = (E * 0.0009 + city.lat * 0.047 + city.lng * 0.031) % 1;
        ctx.globalAlpha = (1 - ph) * 0.55;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, ph * 14, 0, Math.PI * 2);
        ctx.strokeStyle = "#60A5FA"; ctx.lineWidth = 1; ctx.stroke();
        ctx.globalAlpha = 1;

        /* dot glow */
        const dg = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, 9);
        dg.addColorStop(0, "rgba(147,197,253,0.6)");
        dg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(p.sx, p.sy, 9, 0, Math.PI * 2);
        ctx.fillStyle = dg; ctx.fill();

        /* core */
        ctx.beginPath(); ctx.arc(p.sx, p.sy, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = "#E0F2FE"; ctx.fill();
      });

      aid = requestAnimationFrame(frame);
    };

    /* stagger initial connections */
    const t0 = T0;
    setTimeout(() => spawnConn(performance.now() - t0),  200);
    setTimeout(() => spawnConn(performance.now() - t0), 1400);
    setTimeout(() => spawnConn(performance.now() - t0), 2800);

    aid = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(aid); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

/* ══════════════════════════════════════════════════════════
   PAGE DATA (same as before)
══════════════════════════════════════════════════════════ */

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

/* ── Scroll reveal hook ── */
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

/* ── Contact row ── */
function MemberRow({ m, index }: { m: Member; index: number }) {
  const { ref, v } = useReveal();
  return (
    <div
      ref={ref}
      className="contact-card flex items-center gap-4 py-4 px-5 rounded-xl"
      style={{
        background: "var(--white)",
        border: "1px solid var(--gray-200)",
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.45s ease ${index * 0.06}s, transform 0.45s ease ${index * 0.06}s`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        style={{ background: m.color, boxShadow: `0 2px 8px ${m.color}40` }}
      >
        {m.initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: "var(--gray-900)" }}>{m.name}</span>
          {m.isFounder && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "var(--blue-50)", color: "var(--blue-700)", border: "1px solid var(--blue-200)" }}>
              Founder
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: "var(--gray-400)" }}>{m.role}</span>
      </div>
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
        <a href={`mailto:${m.email}`} className="text-xs hover:underline" style={{ color: "var(--gray-600)" }}>{m.email}</a>
        <span style={{ color: "var(--gray-200)" }}>·</span>
        <a href={`tel:${m.phone.replace(/-/g,"")}`} className="text-xs hover:text-gray-900" style={{ color: "var(--gray-500)" }}>{m.phone}</a>
      </div>
      <div className="flex sm:hidden flex-shrink-0">
        <a href={`mailto:${m.email}`} className="text-xs" style={{ color: "var(--blue-600)" }}>Email ↗</a>
      </div>
    </div>
  );
}

/* ── Founder card ── */
function FounderCard() {
  const { ref, v } = useReveal();
  const f = team[0];
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
      <div className="rounded-xl p-8 md:p-10" style={{ background: "var(--blue-700)", border: "1px solid var(--blue-800)" }}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", animation: "heartbeat 2.5s ease-in-out infinite" }}>
              J
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-white text-lg" style={{ fontFamily: "Georgia, serif" }}>{f.name}</h3>
            </div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Founder · HeartTalks</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>Aspiring Cardiothoracic Surgeon</p>
            <blockquote className="border-l-2 pl-4 mb-6" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
              <p className="text-white text-base leading-relaxed italic">&ldquo;{f.bio}&rdquo;</p>
            </blockquote>
            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${f.email}`} className="text-xs font-medium px-3 py-1.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                ✉ {f.email}
              </a>
              <a href={`tel:${f.phone.replace(/-/g,"")}`} className="text-xs font-medium px-3 py-1.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                {f.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function HeartsAcrossBordersPage() {
  return (
    <main style={{ background: "var(--white)" }}>

      {/* ── HERO — full‑viewport globe animation ── */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #060d1f 0%, #0b1630 45%, #0f2050 100%)",
        }}
      >
        {/* Canvas fills the entire hero */}
        <GlobeCanvas />

        {/* Subtle vignette around edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(6,13,31,0.7) 100%)",
          }}
        />

        {/* Text — sits over globe, centered */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ paddingTop: "64px" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              color: "rgba(147,197,253,0.8)",
              opacity: 0,
              animation: "revealUp 0.6s ease forwards",
              animationDelay: "0.3s",
            }}
          >
            Flagship Initiative
          </p>

          <h1
            className="font-bold mb-5"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              textShadow: "0 4px 32px rgba(0,0,0,0.6)",
              opacity: 0,
              animation: "revealUp 0.7s ease forwards",
              animationDelay: "0.5s",
            }}
          >
            Hearts Across Borders
          </h1>

          <p
            className="max-w-lg mx-auto text-base leading-relaxed mb-8"
            style={{
              color: "rgba(191,219,254,0.85)",
              opacity: 0,
              animation: "revealUp 0.7s ease forwards",
              animationDelay: "0.75s",
            }}
          >
            Collecting vital cardiovascular equipment and delivering it to hospitals
            serving marginalized communities — across borders, across the world.
          </p>

          {/* Live counter chips */}
          <div
            className="flex flex-wrap gap-3 justify-center mb-12"
            style={{
              opacity: 0,
              animation: "revealUp 0.6s ease forwards",
              animationDelay: "1s",
            }}
          >
            {[
              { label: "12 Cities", icon: "🌍" },
              { label: "6-Member Team", icon: "❤️" },
              { label: "Active Now", icon: "⚡" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(191,219,254,0.9)",
                  border: "1px solid rgba(147,197,253,0.2)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span>{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>

          {/* Scroll cue */}
          <div
            style={{
              opacity: 0,
              animation: "fadeIn 1s ease forwards",
              animationDelay: "1.4s",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              style={{ color: "rgba(147,197,253,0.5)", animation: "scrollBounce 1.8s ease-in-out infinite" }}
            >
              <path d="M5 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Fade to white at the bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--white))" }}
        />
      </section>

      {/* ── About initiative ── */}
      <section className="py-16" style={{ background: "var(--white)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--gray-900)" }}>About the Initiative</h2>
            <div className="space-y-3 text-base leading-relaxed" style={{ color: "var(--gray-600)" }}>
              <p>
                We are currently implementing a Heart Health Equipment Donation Initiative,
                called <strong style={{ color: "var(--gray-800)" }}>&ldquo;HeartTalks: Hearts Across Borders&rdquo;</strong>,
                which involves the collection of vital cardiovascular or rehabilitation equipment.
              </p>
              <p>
                This equipment will be distributed to hospitals and health organizations that serve
                marginalized communities within the local and international environment —
                bridging healthcare gaps one donation at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Team ── */}
      <section className="py-16" style={{ background: "var(--gray-50)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--gray-900)" }}>Team Contacts</h2>
            <p className="text-sm" style={{ color: "var(--gray-500)" }}>{team.length} members · Bloomfield, Michigan</p>
          </div>
          <div className="flex flex-col gap-3">
            {team.map((m, i) => <MemberRow key={i} m={m} index={i} />)}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Founder bio (bottom) ── */}
      <section className="py-16" style={{ background: "var(--white)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--blue-600)" }}>
              Founder&apos;s Message
            </p>
            <h2 className="text-xl font-semibold" style={{ color: "var(--gray-900)" }}>
              From the Desk of Jia Ginjupalli
            </h2>
          </div>
          <div className="max-w-3xl"><FounderCard /></div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--gray-900)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-white" style={{ fontFamily: "Georgia, serif" }}>
              HeartTalks <span style={{ color: "var(--gray-600)", fontWeight: 400 }}>· Hearts Across Borders</span>
            </span>
            <Link href="/" className="text-sm transition-colors duration-150 hover:text-white" style={{ color: "var(--gray-500)" }}>
              ← Back to Home
            </Link>
          </div>
          <div className="mt-6 pt-6 text-xs text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "var(--gray-600)" }}>
            © {new Date().getFullYear()} HeartTalks. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
