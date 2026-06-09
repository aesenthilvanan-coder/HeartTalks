"use client";

import { useEffect, useRef, useState } from "react";

const circles = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
      </svg>
    ),
    label: "Heart Education",
    desc: "Learn about cardiovascular mechanisms, heart diseases, and how your lifestyle shapes your heart health.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Community Outreach",
    desc: "We host lectures, workshops, and events for all age groups to raise awareness of cardiovascular well-being.",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    label: "Equipment Donation",
    desc: "Collecting vital cardiovascular equipment distributed to hospitals and health organizations serving marginalized communities.",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    label: "Global Impact",
    desc: "Bridging the gap in cardiovascular healthcare across local and international communities around the world.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

function CircleCard({
  circle,
  index,
}: {
  circle: (typeof circles)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="circle-card flex flex-col items-center text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(60px) scale(0.85)",
        transition: `opacity 0.7s ease ${index * 0.15}s, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.15}s`,
      }}
    >
      {/* Circle */}
      <div
        className="relative w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-white"
        style={{
          background: circle.bg,
          color: circle.color,
          boxShadow: `0 12px 40px ${circle.color}30, 0 4px 16px rgba(0,0,0,0.08)`,
        }}
      >
        <div style={{ color: circle.color }}>{circle.icon}</div>
        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${circle.color}`,
            animation: `heartbeat 2.5s ease-in-out ${index * 0.3}s infinite`,
            opacity: 0.4,
          }}
        />
      </div>

      {/* Label button */}
      <div
        className="px-5 py-2 rounded-full text-sm font-semibold text-white mb-4 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${circle.color}, ${circle.color}cc)`,
        }}
      >
        {circle.label}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 max-w-[200px] leading-relaxed">
        {circle.desc}
      </p>
    </div>
  );
}

export default function CirclesSection() {
  return (
    <section className="relative py-20 overflow-hidden" style={{ background: "#EFF6FF" }}>
      {/* Subtle background teal wave top */}
      <div
        className="absolute top-0 left-0 right-0 h-2 rounded-b-full"
        style={{ background: "linear-gradient(90deg, #BFDBFE, #93C5FD, #60A5FA, #93C5FD, #BFDBFE)" }}
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3 block"
            style={{ letterSpacing: "0.2em" }}
          >
            What We Do
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}
          >
            Empowering Community
          </h2>
          <div className="w-16 h-1 rounded-full mx-auto" style={{ background: "linear-gradient(90deg, #2563EB, #0891B2)" }} />
        </div>

        {/* Circles Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {circles.map((circle, i) => (
            <CircleCard key={i} circle={circle} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom wave into about section */}
      <div className="wave-bottom" style={{ bottom: "-2px" }}>
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", height: "60px", width: "100%" }}
        >
          <path
            d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z"
            fill="#DBEAFE"
          />
        </svg>
      </div>
    </section>
  );
}
