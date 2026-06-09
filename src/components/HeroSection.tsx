"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─── Particle-heart canvas ───────────────────────────── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
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

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#93C5FD", "#60A5FA", "#3B82F6", "#BFDBFE", "#7DD3FC", "#2563EB"];
    const N = 140;

    const buildHeart = (scale: number): [number, number][] =>
      Array.from({ length: N }, (_, i) => {
        const t = (i / N) * 2 * Math.PI;
        return [
          w / 2 + 16 * Math.pow(Math.sin(t), 3) * scale,
          h / 2 - (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale,
        ];
      });

    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * (w || 800),
      y: Math.random() * (h || 600),
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 2.2 + 1,
      opacity: Math.random() * 0.35 + 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    /* ambient drifters */
    const ambient: Particle[] = Array.from({ length: 25 }, () => ({
      x: Math.random() * (w || 800), y: Math.random() * (h || 600),
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.2 + 0.4, opacity: Math.random() * 0.2 + 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)], phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0, animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      const conv = Math.min(1, frame / 180);
      const breath = 1 + Math.sin(frame * 0.022) * 0.055;
      const scale = Math.min(w, h) / 22;
      const heart = buildHeart(scale * breath);

      particles.forEach((p, i) => {
        const [tx, ty] = heart[i];
        const pull = conv * 0.055;
        p.x += (tx - p.x) * pull + p.vx * (1 - conv);
        p.y += (ty - p.y) * pull + p.vy * (1 - conv);
        p.vx = p.vx * 0.97 + (Math.random() - 0.5) * 0.1;
        p.vy = p.vy * 0.97 + (Math.random() - 0.5) * 0.1;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const op = Math.max(0, Math.min(1, p.opacity + Math.sin(frame * 0.04 + p.phase) * 0.15));

        /* glow halo */
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4.5);
        gr.addColorStop(0, p.color);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = op * 0.3;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();

        /* core */
        ctx.globalAlpha = op;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.globalAlpha = 1;

        /* constellation edges */
        if (conv > 0.25) {
          for (let j = i + 1; j < Math.min(i + 5, N); j++) {
            const q = particles[j];
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < 50) {
              ctx.globalAlpha = (1 - d / 50) * 0.4 * conv;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = p.color; ctx.lineWidth = 0.6; ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
      });

      /* ambient */
      ambient.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.opacity + Math.sin(frame * 0.02 + p.phase) * 0.08;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.globalAlpha = 1;
      });

      /* pulse rings */
      if (conv > 0.65) {
        const cx = w / 2, cy = h / 2;
        [0, 55].forEach((offset) => {
          const age = (frame + offset) % 110;
          if (age < 85) {
            ctx.globalAlpha = (1 - age / 85) * 0.3 * conv;
            ctx.beginPath(); ctx.arc(cx, cy, (age / 85) * Math.min(w, h) * 0.44, 0, Math.PI * 2);
            ctx.strokeStyle = "#3B82F6"; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.72 }}
    />
  );
}

/* ─── Typewriter ──────────────────────────────────────── */
function Typewriter({ text, delay = 0, className = "", style = {} }: {
  text: string; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const [chars, setChars] = useState(0);
  useEffect(() => {
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        setChars((c) => { if (c >= text.length) { clearInterval(iv); return c; } return c + 1; });
      }, 42);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay]);

  return (
    <span className={className} style={style}>
      {text.slice(0, chars)}
      {chars < text.length && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "0.85em",
            background: "var(--blue-600)",
            marginLeft: "2px",
            verticalAlign: "middle",
            animation: "pulse 0.6s step-end infinite",
          }}
        />
      )}
    </span>
  );
}

/* ─── Hero ────────────────────────────────────────────── */
export default function HeroSection() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section
      className="hero-bg relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ paddingTop: "60px" }}
    >
      <HeartCanvas />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(30,64,175,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto py-24">

        {/* Logo mark */}
        <div
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "scale(1)" : "scale(0.8)",
            transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.4,0.64,1)",
            marginBottom: "24px",
          }}
        >
          <div
            className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden"
            style={{
              boxShadow: "var(--shadow-lg), 0 0 0 4px rgba(147,197,253,0.25)",
              border: "1px solid rgba(147,197,253,0.5)",
              animation: phase >= 2 ? "heartbeat 2.2s ease-in-out infinite" : "none",
            }}
          >
            <Image src="/logo.png" alt="HeartTalks" fill className="object-cover" priority />
          </div>
        </div>

        {/* Eyebrow */}
        {phase >= 2 && (
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{
              color: "var(--blue-600)",
              opacity: 0,
              animation: "revealUp 0.5s ease forwards",
              animationDelay: "0.05s",
            }}
          >
            Youth-Led Cardiovascular Education
          </p>
        )}

        {/* Headline */}
        <h1
          className="font-bold mb-5"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(36px, 6vw, 68px)",
            lineHeight: 1.15,
            color: "var(--gray-900)",
            letterSpacing: "-0.02em",
            minHeight: "2.4em",
          }}
        >
          {phase >= 2 && (
            <>
              <Typewriter text="Youth Empowering," delay={100} />
              <br />
              <span style={{ color: "var(--blue-700)" }}>
                <Typewriter text="Raising World Standards" delay={1000} />
              </span>
            </>
          )}
        </h1>

        {/* Subheading */}
        {phase >= 2 && (
          <p
            className="max-w-xl mx-auto mb-8 text-base leading-relaxed"
            style={{
              color: "var(--gray-600)",
              opacity: 0,
              animation: "revealUp 0.6s ease forwards",
              animationDelay: "2.3s",
              fontSize: "17px",
            }}
          >
            HeartTalks is a youth-led organization spreading knowledge about
            cardiovascular health and the heart–mind connection — one lecture
            and one bp machine at a time.
          </p>
        )}

        {/* CTAs */}
        {phase >= 2 && (
          <div
            className="flex flex-wrap gap-3 justify-center"
            style={{ opacity: 0, animation: "revealUp 0.6s ease forwards", animationDelay: "2.6s" }}
          >
            <Link href="/hearts-across-borders" className="btn-primary">
              Hearts Across Borders
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06L7.28 12.78a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            </Link>
            <a href="#about" className="btn-secondary">Learn More</a>
          </div>
        )}

        {/* Scroll cue */}
        {phase >= 2 && (
          <div
            className="mt-16 flex flex-col items-center gap-1.5"
            style={{ opacity: 0, animation: "fadeIn 0.8s ease forwards", animationDelay: "3s" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{
                color: "var(--blue-400)",
                animation: "scrollBounce 1.6s ease-in-out infinite",
              }}
            >
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
