"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────── */
interface Member {
  name: string;
  email: string;
  phone: string;
  role: string;
  initial: string;
  color: string;
  isFounder?: boolean;
  bio?: string;
}

/* ─── Data ────────────────────────────────────────────── */
const team: Member[] = [
  {
    name: "Jia Ginjupalli",
    email: "ginjupalli.jia05@bloomfield.org",
    phone: "947-955-5790",
    role: "Founder & Director",
    initial: "J",
    color: "#1D4ED8",
    isFounder: true,
    bio: "I'm Jia! Aspiring to be a Cardiothoracic Surgeon, I hope to aid in raising the standards of healthcare around the world, trying to make a difference one lecture, one event, and one bp machine at a time.",
  },
  {
    name: "Hansini Dhulipalla",
    email: "dhulipalla.hansini41@bloomfield.org",
    phone: "248-495-1389",
    role: "Co-Founder",
    initial: "H",
    color: "#0891B2",
  },
  {
    name: "Divya Shah",
    email: "shah.divya28@bloomfield.org",
    phone: "248-410-5206",
    role: "Team Member",
    initial: "D",
    color: "#7C3AED",
  },
  {
    name: "Caden Gao",
    email: "gao.xiaolin94@bloomfield.org",
    phone: "248-410-9723",
    role: "Team Member",
    initial: "C",
    color: "#059669",
  },
  {
    name: "Luka Lev",
    email: "lev.luka32@bloomfield.org",
    phone: "248-892-0367",
    role: "Team Member",
    initial: "L",
    color: "#DC2626",
  },
  {
    name: "Dev Shah",
    email: "shah.dev27@bloomfield.org",
    phone: "248-392-0562",
    role: "Team Member",
    initial: "D",
    color: "#D97706",
  },
];

/* ─── Scroll reveal ───────────────────────────────────── */
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

/* ─── Contact row (list style) ────────────────────────── */
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
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
        style={{ background: m.color, boxShadow: `0 2px 8px ${m.color}40` }}
      >
        {m.initial}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: "var(--gray-900)" }}>
            {m.name}
          </span>
          {m.isFounder && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: "var(--blue-50)",
                color: "var(--blue-700)",
                border: "1px solid var(--blue-200)",
              }}
            >
              Founder
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: "var(--gray-400)" }}>{m.role}</span>
      </div>

      {/* Contact links */}
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
        <a
          href={`mailto:${m.email}`}
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: "var(--gray-600)" }}
          title={m.email}
        >
          {m.email}
        </a>
        <span style={{ color: "var(--gray-200)" }}>·</span>
        <a
          href={`tel:${m.phone.replace(/-/g, "")}`}
          className="text-xs transition-colors duration-150 hover:text-gray-900"
          style={{ color: "var(--gray-500)" }}
        >
          {m.phone}
        </a>
      </div>

      {/* Mobile: email only */}
      <div className="flex sm:hidden flex-col items-end gap-0.5 flex-shrink-0">
        <a
          href={`mailto:${m.email}`}
          className="text-xs"
          style={{ color: "var(--blue-600)" }}
        >
          Email ↗
        </a>
      </div>
    </div>
  );
}

/* ─── Founder bio card ────────────────────────────────── */
function FounderCard() {
  const { ref, v } = useReveal();
  const founder = team[0];
  return (
    <div
      ref={ref}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div
        className="rounded-xl p-8 md:p-10"
        style={{
          background: "var(--blue-700)",
          border: "1px solid var(--blue-800)",
        }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                animation: "heartbeat 2.5s ease-in-out infinite",
              }}
            >
              J
            </div>
          </div>

          {/* Bio text */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-white text-lg" style={{ fontFamily: "Georgia, serif" }}>
                {founder.name}
              </h3>
            </div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
              Founder · HeartTalks
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
              Aspiring Cardiothoracic Surgeon
            </p>

            <blockquote className="border-l-2 pl-4 mb-6" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
              <p className="text-white text-base leading-relaxed italic">
                &ldquo;{founder.bio}&rdquo;
              </p>
            </blockquote>

            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${founder.email}`}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                ✉ {founder.email}
              </a>
              <a
                href={`tel:${founder.phone.replace(/-/g, "")}`}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {founder.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────── */
export default function HeartsAcrossBordersPage() {
  return (
    <main style={{ background: "var(--white)" }}>

      {/* ── Page header ── */}
      <section
        className="hero-bg"
        style={{ paddingTop: "96px", paddingBottom: "72px" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{
                color: "var(--blue-600)",
                opacity: 0,
                animation: "revealUp 0.5s ease forwards",
                animationDelay: "0.1s",
              }}
            >
              Flagship Initiative
            </p>
            <h1
              className="font-bold mb-4"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(32px, 5vw, 52px)",
                color: "var(--gray-900)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                opacity: 0,
                animation: "revealUp 0.6s ease forwards",
                animationDelay: "0.2s",
              }}
            >
              Hearts Across Borders
            </h1>
            <p
              className="text-base leading-relaxed"
              style={{
                color: "var(--gray-600)",
                maxWidth: "520px",
                opacity: 0,
                animation: "revealUp 0.6s ease forwards",
                animationDelay: "0.35s",
              }}
            >
              A heart health equipment donation initiative — bridging gaps in cardiovascular
              care across local and international communities.
            </p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── About initiative ── */}
      <section className="py-16" style={{ background: "var(--white)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--gray-900)" }}
            >
              About the Initiative
            </h2>
            <div className="space-y-3 text-base leading-relaxed" style={{ color: "var(--gray-600)" }}>
              <p>
                We are currently implementing a Heart Health Equipment Donation Initiative,
                called <strong style={{ color: "var(--gray-800)" }}>&ldquo;HeartTalks: Hearts Across Borders&rdquo;</strong>,
                which involves the collection of vital cardiovascular or rehabilitation equipment.
              </p>
              <p>
                This equipment will be distributed to hospitals and health organizations that
                serve marginalized communities within the local and international environment —
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
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--gray-900)" }}
            >
              Team Contacts
            </h2>
            <p className="text-sm" style={{ color: "var(--gray-500)" }}>
              {team.length} members · Bloomfield, Michigan
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {team.map((m, i) => (
              <MemberRow key={i} m={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Founder bio (bottom) ── */}
      <section className="py-16" style={{ background: "var(--white)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "var(--blue-600)" }}
            >
              Founder&apos;s Message
            </p>
            <h2 className="text-xl font-semibold" style={{ color: "var(--gray-900)" }}>
              From the Desk of Jia Ginjupalli
            </h2>
          </div>
          <div className="max-w-3xl">
            <FounderCard />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--gray-900)", color: "var(--gray-400)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white" style={{ fontFamily: "Georgia, serif" }}>
                HeartTalks
              </span>
              <span style={{ color: "var(--gray-700)" }}>·</span>
              <span className="text-sm">Hearts Across Borders</span>
            </div>
            <Link
              href="/"
              className="text-sm transition-colors duration-150 hover:text-white"
              style={{ color: "var(--gray-500)" }}
            >
              ← Back to Home
            </Link>
          </div>
          <div
            className="mt-6 pt-6 text-xs text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "var(--gray-600)" }}
          >
            © {new Date().getFullYear()} HeartTalks. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
