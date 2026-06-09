"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

const steps = [
  {
    icon: "📦",
    title: "Collect Equipment",
    desc: "Gathering vital cardiovascular and rehabilitation equipment from donors across the community.",
  },
  {
    icon: "🔍",
    title: "Assess Need",
    desc: "Identifying hospitals and health organizations that serve marginalized communities locally and internationally.",
  },
  {
    icon: "🚚",
    title: "Distribute Impact",
    desc: "Delivering life-saving equipment where it's needed most — no barrier too great.",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className="rounded-3xl p-8 text-center shadow-xl"
      style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.8)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
        transition: `opacity 0.7s ease ${index * 0.15}s, transform 0.7s cubic-bezier(0.34,1.4,0.64,1) ${index * 0.15}s`,
      }}
    >
      <div className="text-5xl mb-4">{step.icon}</div>
      <h3 className="text-xl font-bold mb-3" style={{ color: "#1E40AF" }}>
        {step.title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
    </div>
  );
}

export default function InitiativeSection() {
  const heading = useScrollReveal();

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #BFDBFE 0%, #93C5FD 50%, #DBEAFE 100%)" }}
    >
      {/* Background orb */}
      <div
        className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, white, transparent 70%)" }}
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div
          ref={heading.ref}
          className="text-center mb-16"
          style={{
            opacity: heading.visible ? 1 : 0,
            transform: heading.visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-3 block">
            Flagship Initiative
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}
          >
            HeartTalks:{" "}
            <span className="gradient-text">Hearts Across Borders</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed mt-4">
            A Heart Health Equipment Donation Initiative — collecting vital cardiovascular and
            rehabilitation equipment distributed to hospitals and health organizations serving
            marginalized communities worldwide.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/hearts-across-borders"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-white shadow-2xl hover:-translate-y-1 hover:shadow-blue-400/30 transition-all duration-300 text-lg"
            style={{ background: "linear-gradient(135deg, #1D4ED8, #0891B2)" }}
          >
            <span style={{ animation: "heartbeat 1.5s ease-in-out infinite", display: "inline-block" }}>❤️</span>
            Learn About Hearts Across Borders
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="wave-bottom">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{ display: "block", height: "60px", width: "100%" }}
        >
          <path
            d="M0,40 C360,0 720,60 1080,20 C1260,5 1380,40 1440,30 L1440,60 L0,60 Z"
            fill="#1E3A5F"
          />
        </svg>
      </div>
    </section>
  );
}
