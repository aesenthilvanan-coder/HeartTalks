"use client";

import { useEffect, useRef, useState } from "react";

const pillars = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    color: "#DC2626",
    bg: "#FEF2F2",
    label: "Heart Education",
    desc: "Age-appropriate lectures on cardiovascular disease, risk factors, and the science behind a healthy heart.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "#059669",
    bg: "#ECFDF5",
    label: "Community Outreach",
    desc: "Events, workshops, and partnerships that bring cardiovascular health awareness directly to communities.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    color: "#2563EB",
    bg: "#EFF6FF",
    label: "Equipment Donation",
    desc: "Collecting and distributing vital cardiovascular equipment to hospitals serving marginalized communities.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    color: "#7C3AED",
    bg: "#F5F3FF",
    label: "Global Impact",
    desc: "Bridging cardiovascular healthcare gaps across local and international communities worldwide.",
  },
];

function PillarCard({ item, index }: { item: (typeof pillars)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: item.bg, color: item.color }}
      >
        {item.icon}
      </div>

      <h3
        className="font-semibold mb-2 text-base"
        style={{ color: "var(--gray-900)" }}
      >
        {item.label}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--gray-600)" }}>
        {item.desc}
      </p>
    </div>
  );
}

export default function CirclesSection() {
  return (
    <section id="about" className="py-24" style={{ background: "var(--white)" }}>
      <hr className="section-divider" />
      <div className="max-w-6xl mx-auto px-6 pt-24">
        {/* Section header */}
        <div className="mb-14 max-w-2xl">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--blue-600)" }}
          >
            What We Do
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: "Georgia, serif",
              color: "var(--gray-900)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Empowering Community
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "var(--gray-600)" }}>
            HeartTalks is devoted to spreading knowledge about cardiovascular
            health and the connection between mental and physical well-being —
            informing people of all ages about heart disease, prevention, and care.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {pillars.map((item, i) => (
            <PillarCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
