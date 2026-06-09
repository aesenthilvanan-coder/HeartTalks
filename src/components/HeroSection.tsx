"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─── Floating heart particle ─────────────────────────── */
function HeartParticle({
  style,
}: {
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        ...style,
        animation: `floatHeart ${style.animationDuration ?? "6s"} ease-in-out infinite`,
        animationDelay: style.animationDelay ?? "0s",
        fontSize: style.fontSize ?? "18px",
        color: style.color ?? "rgba(147,197,253,0.5)",
      }}
    >
      ♥
    </div>
  );
}

/* ─── EKG SVG ─────────────────────────────────────────── */
function EKGLine() {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      style={{ top: "55%", height: "80px" }}
    >
      <polyline
        className="ekg-line"
        points="0,60 80,60 100,60 110,20 120,100 130,5 145,90 155,60 250,60 280,60 295,30 305,90 315,15 325,80 335,60 500,60 530,60 545,35 555,85 565,20 575,75 585,60 750,60 780,60 795,40 805,80 815,25 825,75 835,60 1000,60 1030,60 1040,45 1050,75 1060,30 1070,80 1080,60 1200,60"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Animated Orb ────────────────────────────────────── */
function Orb({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        animation: `orbFloat ${(Math.random() * 4 + 8).toFixed(1)}s ease-in-out infinite`,
        ...style,
      }}
    />
  );
}

/* ─── Word reveal animation ───────────────────────────── */
function AnimatedQuote({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity: 0,
            animation: `revealUp 0.7s ease forwards`,
            animationDelay: `${0.8 + i * 0.12}s`,
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
}

/* ─── Main Hero Component ─────────────────────────────── */
export default function HeroSection() {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const generated: React.CSSProperties[] = Array.from({ length: 22 }, () => ({
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 20}%`,
      fontSize: `${Math.random() * 20 + 10}px`,
      animationDuration: `${Math.random() * 6 + 6}s`,
      animationDelay: `${Math.random() * 8}s`,
      color: [
        "rgba(147,197,253,0.45)",
        "rgba(96,165,250,0.4)",
        "rgba(59,130,246,0.35)",
        "rgba(8,145,178,0.4)",
      ][Math.floor(Math.random() * 4)],
    }));
    setParticles(generated);
  }, []);

  return (
    <section
      className="hero-bg relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ paddingTop: "80px" }}
    >
      {/* Animated blobs */}
      <Orb
        className="w-96 h-96 opacity-30"
        style={{
          background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)",
          top: "5%",
          left: "-10%",
        }}
      />
      <Orb
        className="w-80 h-80 opacity-25"
        style={{
          background: "radial-gradient(circle, #60A5FA 0%, transparent 70%)",
          bottom: "10%",
          right: "-8%",
          animationDelay: "-3s",
        }}
      />
      <Orb
        className="w-64 h-64 opacity-20"
        style={{
          background: "radial-gradient(circle, #0891B2 0%, transparent 70%)",
          top: "30%",
          right: "15%",
          animationDelay: "-5s",
        }}
      />

      {/* EKG line */}
      <EKGLine />

      {/* Floating hearts */}
      {mounted &&
        particles.map((style, i) => (
          <HeartParticle key={i} style={style} />
        ))}

      {/* Grid dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1E40AF 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Logo */}
        <div
          className="mb-8"
          style={{
            opacity: 0,
            animation: "fadeIn 1s ease forwards",
            animationDelay: "0.2s",
          }}
        >
          <div
            className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 shadow-2xl"
            style={{
              borderColor: "rgba(147,197,253,0.6)",
              boxShadow:
                "0 0 0 8px rgba(147,197,253,0.2), 0 0 0 16px rgba(147,197,253,0.1), 0 20px 60px rgba(30,64,175,0.3)",
              animation: "heartbeat 2s ease-in-out 1.5s infinite",
            }}
          >
            <Image
              src="/logo.png"
              alt="HeartTalks"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Tag */}
        <div
          className="mb-6"
          style={{
            opacity: 0,
            animation: "revealUp 0.6s ease forwards",
            animationDelay: "0.5s",
          }}
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full"
            style={{
              background: "rgba(147,197,253,0.35)",
              color: "#1E40AF",
              border: "1px solid rgba(147,197,253,0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            Empowering Communities Through Knowledge
          </span>
        </div>

        {/* Main quote */}
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}
        >
          <AnimatedQuote text="Youth Empowering," />
          <br />
          <span className="gradient-text">
            <AnimatedQuote text="Raising World Standards" />
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{
            color: "#334155",
            opacity: 0,
            animation: "revealUp 0.8s ease forwards",
            animationDelay: "1.8s",
          }}
        >
          HeartTalks is a youth-led education organization devoted to spreading
          knowledge about cardiovascular health, the heart–mind connection, and
          empowering communities one lecture and one bp machine at a time.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-wrap gap-4 justify-center"
          style={{
            opacity: 0,
            animation: "revealUp 0.8s ease forwards",
            animationDelay: "2.1s",
          }}
        >
          <Link
            href="/hearts-across-borders"
            className="px-8 py-4 rounded-full font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
            style={{
              background: "linear-gradient(135deg, #1D4ED8, #0891B2)",
            }}
          >
            Hearts Across Borders →
          </Link>
          <a
            href="#about"
            className="px-8 py-4 rounded-full font-semibold hover:-translate-y-1 transition-all duration-300 text-sm md:text-base"
            style={{
              background: "rgba(255,255,255,0.8)",
              color: "#1E40AF",
              border: "2px solid rgba(147,197,253,0.6)",
              backdropFilter: "blur(8px)",
            }}
          >
            Learn More
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-16 flex flex-col items-center gap-2"
          style={{
            opacity: 0,
            animation: "fadeIn 1s ease forwards",
            animationDelay: "2.5s",
          }}
        >
          <span className="text-xs tracking-widest text-blue-400 uppercase">Scroll</span>
          <div
            className="w-0.5 h-8 rounded-full"
            style={{
              background: "linear-gradient(to bottom, #60A5FA, transparent)",
              animation: "waveFloat 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Wave bottom transition */}
      <div className="wave-bottom">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", height: "80px", width: "100%" }}
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="#EFF6FF"
          />
        </svg>
      </div>
    </section>
  );
}
