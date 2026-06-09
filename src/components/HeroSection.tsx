"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─── Particle Heart Canvas ───────────────────────────── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number;
  size: number; opacity: number;
  color: string; phase: number;
}

function HeartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      return { w: canvas.width, h: canvas.height };
    };
    let { w, h } = resize();
    window.addEventListener("resize", () => { const d = resize(); w = d.w; h = d.h; });

    const COLORS = ["#93C5FD", "#60A5FA", "#3B82F6", "#BFDBFE", "#38BDF8", "#7DD3FC", "#2563EB"];
    const N = 160;

    const buildHeart = (cx: number, cy: number, s: number): [number, number][] =>
      Array.from({ length: N }, (_, i) => {
        const t = (i / N) * 2 * Math.PI;
        return [
          cx + 16 * Math.pow(Math.sin(t), 3) * s,
          cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s,
        ];
      });

    let heart = buildHeart(w / 2, h / 2, Math.min(w, h) / 22);

    const particles: Particle[] = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      tx: heart[i][0],
      ty: heart[i][1],
      size: Math.random() * 2.5 + 1.2,
      opacity: Math.random() * 0.4 + 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    /* Extra ambient drifters */
    const drifters: Particle[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      tx: 0, ty: 0,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.25 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      /* Recompute heart targets so it breathes */
      const breath = 1 + Math.sin(frame * 0.022) * 0.06;
      const cx = w / 2, cy = h / 2;
      heart = buildHeart(cx, cy, (Math.min(w, h) / 22) * breath);

      const conv = Math.min(1, frame / 200);   // 0→1 over ~200 frames

      /* ── heart particles ── */
      particles.forEach((p, i) => {
        p.tx = heart[i][0];
        p.ty = heart[i][1];

        const pull = conv * 0.06;
        p.x += (p.tx - p.x) * pull + p.vx * (1 - conv);
        p.y += (p.ty - p.y) * pull + p.vy * (1 - conv);
        p.vx = p.vx * 0.97 + (Math.random() - 0.5) * 0.12;
        p.vy = p.vy * 0.97 + (Math.random() - 0.5) * 0.12;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const op = p.opacity + Math.sin(frame * 0.04 + p.phase) * 0.18;

        /* Glow */
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        gr.addColorStop(0, p.color);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = op * 0.35;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();

        /* Core dot */
        ctx.globalAlpha = op;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.globalAlpha = 1;

        /* Constellation lines */
        if (conv > 0.3) {
          for (let j = i + 1; j < Math.min(i + 6, N); j++) {
            const q = particles[j];
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < 52) {
              ctx.globalAlpha = (1 - d / 52) * 0.45 * conv;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = p.color; ctx.lineWidth = 0.7; ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
      });

      /* ── ambient drifters ── */
      drifters.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        const op = p.opacity + Math.sin(frame * 0.025 + p.phase) * 0.1;
        ctx.globalAlpha = op;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.globalAlpha = 1;
      });

      /* ── pulse rings from heart center ── */
      if (conv > 0.6) {
        const beat = frame % 110;
        [0, 55].forEach((offset) => {
          const age = (beat + offset) % 110;
          if (age < 90) {
            const r = (age / 90) * Math.min(w, h) * 0.45;
            const a = (1 - age / 90) * 0.35 * conv;
            ctx.globalAlpha = a;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = "#3B82F6"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => { cancelAnimationFrame(animId); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.75 }}
    />
  );
}

/* ─── Typewriter text ─────────────────────────────────── */
function TypewriterText({ text, delay = 0, className = "", style = {} }: {
  text: string; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span className={className} style={style}>
      {displayed}
      {displayed.length < text.length && started && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "1em",
            background: "#2563EB",
            marginLeft: "2px",
            verticalAlign: "middle",
            animation: "waveFloat 0.6s ease-in-out infinite",
          }}
        />
      )}
    </span>
  );
}

/* ─── Word stagger reveal ─────────────────────────────── */
function StaggerReveal({ text, delay = 0, className = "" }: {
  text: string; delay?: number; className?: string;
}) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity: 0,
            animation: "revealUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
            animationDelay: `${delay + i * 0.1}s`,
          }}
        >
          {w}&nbsp;
        </span>
      ))}
    </span>
  );
}

/* ─── Main Hero ───────────────────────────────────────── */
export default function HeroSection() {
  const [phase, setPhase] = useState<"canvas" | "logo" | "text">("canvas");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 600);
    const t2 = setTimeout(() => setPhase("text"), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section
      className="hero-bg relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ paddingTop: "80px" }}
    >
      {/* Particle heart canvas */}
      <HeartCanvas />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #1E40AF 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">

        {/* Logo */}
        <div
          style={{
            opacity: phase !== "canvas" ? 1 : 0,
            transform: phase !== "canvas" ? "scale(1) translateY(0)" : "scale(0.5) translateY(20px)",
            transition: "opacity 0.9s cubic-bezier(0.34,1.6,0.64,1), transform 0.9s cubic-bezier(0.34,1.6,0.64,1)",
            marginBottom: "28px",
          }}
        >
          <div
            className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 shadow-2xl"
            style={{
              borderColor: "rgba(147,197,253,0.7)",
              boxShadow:
                "0 0 0 6px rgba(147,197,253,0.18), 0 0 0 14px rgba(147,197,253,0.09), 0 24px 64px rgba(30,64,175,0.35)",
              animation: phase === "text" ? "heartbeat 2s ease-in-out infinite" : "none",
            }}
          >
            <Image src="/logo.png" alt="HeartTalks" fill className="object-cover" priority />
          </div>
        </div>

        {/* Badge */}
        {phase === "text" && (
          <div
            className="mb-6"
            style={{ opacity: 0, animation: "revealUp 0.5s ease forwards", animationDelay: "0.1s" }}
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase px-5 py-2 rounded-full"
              style={{
                background: "rgba(147,197,253,0.3)",
                color: "#1E40AF",
                border: "1px solid rgba(147,197,253,0.55)",
                backdropFilter: "blur(10px)",
              }}
            >
              Empowering Communities Through Knowledge
            </span>
          </div>
        )}

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "Georgia, serif", minHeight: "3em" }}
        >
          {phase === "text" ? (
            <>
              <span
                style={{
                  color: "#0F172A",
                  textShadow: "0 2px 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6)",
                  display: "block",
                }}
              >
                <TypewriterText text="Youth Empowering," delay={200} />
              </span>
              <span
                style={{
                  display: "block",
                  color: "#1D4ED8",
                  textShadow: "0 2px 24px rgba(255,255,255,0.95), 0 0 50px rgba(255,255,255,0.8), 0 4px 8px rgba(255,255,255,0.7)",
                  WebkitTextStroke: "0.5px rgba(30,64,175,0.4)",
                }}
              >
                <TypewriterText text="Raising World Standards" delay={1100} />
              </span>
            </>
          ) : (
            <span style={{ opacity: 0 }}>Youth Empowering,<br />Raising World Standards</span>
          )}
        </h1>

        {/* Sub */}
        {phase === "text" && (
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{
              color: "#334155",
              opacity: 0,
              animation: "revealUp 0.8s ease forwards",
              animationDelay: "2.4s",
            }}
          >
            HeartTalks is a youth-led education organization spreading knowledge
            about cardiovascular health, the heart–mind connection, and empowering
            communities one lecture and one bp machine at a time.
          </p>
        )}

        {/* CTAs */}
        {phase === "text" && (
          <div
            className="flex flex-wrap gap-4 justify-center"
            style={{ opacity: 0, animation: "revealUp 0.7s ease forwards", animationDelay: "2.7s" }}
          >
            <Link
              href="/hearts-across-borders"
              className="px-8 py-4 rounded-full font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
              style={{ background: "linear-gradient(135deg, #1D4ED8, #0891B2)" }}
            >
              Hearts Across Borders →
            </Link>
            <a
              href="#about"
              className="px-8 py-4 rounded-full font-semibold hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
              style={{
                background: "rgba(255,255,255,0.75)",
                color: "#1E40AF",
                border: "2px solid rgba(147,197,253,0.6)",
                backdropFilter: "blur(10px)",
              }}
            >
              Learn More
            </a>
          </div>
        )}

        {/* Scroll cue */}
        {phase === "text" && (
          <div
            className="mt-14 flex flex-col items-center gap-2"
            style={{ opacity: 0, animation: "fadeIn 1s ease forwards", animationDelay: "3.2s" }}
          >
            <span className="text-xs tracking-widest text-blue-400 uppercase">Scroll</span>
            <div
              className="w-px h-8 rounded-full"
              style={{
                background: "linear-gradient(to bottom, #60A5FA, transparent)",
                animation: "waveFloat 1.5s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>

      {/* Wave */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", height: "80px", width: "100%" }}>
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#EFF6FF" />
        </svg>
      </div>
    </section>
  );
}
