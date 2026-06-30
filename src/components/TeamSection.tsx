"use client";

import { useEffect, useRef, useState } from "react";

const members = [
  { name: "Aaryan Senthilvanan", role: "Co-Founder" },
  { name: "Team Member 2",       role: "Co-Founder" },
  { name: "Team Member 3",       role: "Co-Founder" },
  { name: "Jia Ginjupalli",      role: "Member" },
];

function MemberCard({ member, index }: { member: (typeof members)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center p-6 rounded-xl"
      style={{
        background: "var(--white)",
        border: "1px solid var(--gray-200)",
        boxShadow: "var(--shadow-sm)",
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      {/* Avatar placeholder */}
      <div
        className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold"
        style={{ background: "var(--blue-100)", color: "var(--blue-700)" }}
      >
        {member.name.charAt(0)}
      </div>
      <h3 className="font-semibold text-base mb-1" style={{ color: "var(--gray-900)" }}>
        {member.name}
      </h3>
      <span
        className="text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full"
        style={{
          background: member.role === "Co-Founder" ? "var(--blue-100)" : "var(--gray-100)",
          color:      member.role === "Co-Founder" ? "var(--blue-700)" : "var(--gray-600)",
        }}
      >
        {member.role}
      </span>
    </div>
  );
}

export default function TeamSection() {
  const header = useRef<HTMLDivElement>(null);
  const [hv, setHv] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHv(true); ob.disconnect(); } },
      { threshold: 0.1 }
    );
    if (header.current) ob.observe(header.current);
    return () => ob.disconnect();
  }, []);

  return (
    <section className="py-24" style={{ background: "var(--white)" }}>
      <hr className="section-divider" />
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div
          ref={header}
          className="mb-12"
          style={{
            opacity: hv ? 1 : 0,
            transform: hv ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--blue-600)" }}
          >
            Our Team
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{
              fontFamily: "Georgia, serif",
              color: "var(--gray-900)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            The People Behind HeartTalks
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((m, i) => (
            <MemberCard key={i} member={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
