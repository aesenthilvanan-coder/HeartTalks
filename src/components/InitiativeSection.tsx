"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return { ref, v };
}

const steps = [
  {
    num: "01",
    title: "Collect Equipment",
    desc: "Gather vital cardiovascular and rehabilitation equipment from donors across the community.",
  },
  {
    num: "02",
    title: "Assess Need",
    desc: "Identify hospitals and health organizations serving marginalized communities locally and internationally.",
  },
  {
    num: "03",
    title: "Distribute Impact",
    desc: "Deliver life-saving equipment directly to healthcare providers where it's needed most.",
  },
];

function StepRow({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const { ref, v } = useReveal();
  return (
    <div
      ref={ref}
      className="flex gap-6 items-start py-8"
      style={{
        borderBottom: index < steps.length - 1 ? "1px solid var(--gray-200)" : "none",
        opacity: v ? 1 : 0,
        transform: v ? "translateX(0)" : "translateX(-12px)",
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      <span
        className="text-4xl font-bold flex-shrink-0 w-12 leading-none"
        style={{
          color: "var(--blue-100)",
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.03em",
        }}
      >
        {step.num}
      </span>
      <div>
        <h3 className="font-semibold mb-1 text-base" style={{ color: "var(--gray-900)" }}>
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--gray-600)" }}>
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function InitiativeSection() {
  const header = useReveal();

  return (
    <section className="py-24" style={{ background: "var(--white)" }}>
      <hr className="section-divider" />
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Header + CTA */}
          <div
            ref={header.ref}
            style={{
              opacity: header.v ? 1 : 0,
              transform: header.v ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--blue-600)" }}
            >
              Flagship Initiative
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-5"
              style={{
                fontFamily: "Georgia, serif",
                color: "var(--gray-900)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              HeartTalks:{" "}
              <span style={{ color: "var(--blue-700)" }}>Hearts Across Borders</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "var(--gray-600)" }}>
              A Heart Health Equipment Donation Initiative — collecting vital cardiovascular and
              rehabilitation equipment distributed to hospitals and health organizations serving
              marginalized communities worldwide.
            </p>
            <Link href="/hearts-across-borders" className="btn-primary">
              Learn More
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06L7.28 12.78a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            </Link>
          </div>

          {/* Right: Steps */}
          <div>
            {steps.map((step, i) => (
              <StepRow key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
