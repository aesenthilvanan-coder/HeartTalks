"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────── */
interface ContactMember {
  name: string;
  email: string;
  phone: string;
  role: string;
  initial: string;
  color: string;
  bio?: string;
  isFounder?: boolean;
}

/* ─── Data ────────────────────────────────────────────── */
const team: ContactMember[] = [
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

/* ─── Scroll reveal hook ─────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Contact Card ───────────────────────────────────── */
function ContactCard({ member, index }: { member: ContactMember; index: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className="contact-card rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(147,197,253,0.3)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(30,64,175,0.06)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.93)",
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.7s cubic-bezier(0.34,1.4,0.64,1) ${index * 0.1}s`,
      }}
    >
      {/* Subtle corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-bl-[60px] opacity-10"
        style={{ background: member.color }}
      />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md"
          style={{
            background: `linear-gradient(135deg, ${member.color}, ${member.color}aa)`,
          }}
        >
          {member.initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-base">{member.name}</h3>
            {member.isFounder && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                style={{ background: member.color }}
              >
                Founder
              </span>
            )}
          </div>
          <p className="text-xs text-blue-500 font-medium mt-0.5 mb-3">{member.role}</p>

          <div className="space-y-2">
            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 text-[10px]"
                style={{ background: member.color }}
              >
                @
              </span>
              <span className="truncate group-hover:underline">{member.email}</span>
            </a>
            <a
              href={`tel:${member.phone.replace(/-/g, "")}`}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 text-[10px]"
                style={{ background: member.color }}
              >
                ☎
              </span>
              {member.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Founder Bio Card ───────────────────────────────── */
function FounderBioCard() {
  const { ref, visible } = useScrollReveal();
  const founder = team[0];
  return (
    <div
      ref={ref}
      className="rounded-3xl overflow-hidden shadow-2xl"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(50px)",
        transition: "opacity 0.9s ease, transform 0.9s cubic-bezier(0.34,1.3,0.64,1)",
      }}
    >
      <div
        className="p-8 md:p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #0891B2 100%)" }}
      >
        {/* Decorative hearts */}
        <div className="absolute top-4 right-6 text-white opacity-10 text-8xl pointer-events-none select-none">♥</div>
        <div className="absolute bottom-4 left-4 text-white opacity-5 text-5xl pointer-events-none select-none">♥</div>

        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-white/30"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                animation: "heartbeat 3s ease-in-out infinite",
              }}
            >
              J
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3
                className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {founder.name}
              </h3>
              <span className="text-2xl" style={{ animation: "heartbeat 2s ease-in-out infinite" }}>❤️</span>
            </div>
            <p className="text-blue-200 font-medium mb-1 text-sm uppercase tracking-wide">
              Founder, HeartTalks
            </p>
            <p className="text-blue-100 font-medium mb-6 text-sm">
              {founder.role} · Aspiring Cardiothoracic Surgeon
            </p>

            <blockquote className="relative">
              <span className="absolute -top-4 -left-2 text-6xl text-white/20 font-serif leading-none">&ldquo;</span>
              <p className="text-white text-lg md:text-xl leading-relaxed italic pl-4">
                {founder.bio}
              </p>
              <span className="text-white/20 text-6xl font-serif leading-none">&rdquo;</span>
            </blockquote>

            <div className="flex flex-wrap gap-4 mt-6">
              <a
                href={`mailto:${founder.email}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                ✉ {founder.email}
              </a>
              <a
                href={`tel:${founder.phone.replace(/-/g, "")}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                ☎ {founder.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Animated floating hearts background ─────────────── */
function FloatingHeartsBackground() {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 12 }, () => ({
        left: `${Math.random() * 100}%`,
        bottom: `${Math.random() * 10}%`,
        fontSize: `${Math.random() * 16 + 8}px`,
        animationDuration: `${Math.random() * 6 + 7}s`,
        animationDelay: `${Math.random() * 8}s`,
        color: "rgba(147,197,253,0.35)",
      }))
    );
  }, []);
  return (
    <>
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ ...style, animation: `floatHeart ${style.animationDuration} ease-in-out infinite`, animationDelay: style.animationDelay as string }}
        >
          ♥
        </div>
      ))}
    </>
  );
}

/* ─── Page ────────────────────────────────────────────── */
export default function HeartsAcrossBordersPage() {
  const heroReveal = useScrollReveal();

  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="hero-bg relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden"
        style={{ paddingTop: "100px", paddingBottom: "80px" }}
      >
        <FloatingHeartsBackground />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #1E40AF 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Orbs */}
        <div
          className="absolute top-10 left-10 w-80 h-80 rounded-full opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)", animation: "orbFloat 10s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-10 right-10 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #60A5FA, transparent 70%)", animation: "orbFloat 8s ease-in-out -4s infinite" }}
        />

        <div
          ref={heroReveal.ref}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          style={{
            opacity: heroReveal.visible ? 1 : 0,
            transform: heroReveal.visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4 block">
            Flagship Initiative
          </span>
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}
          >
            Hearts{" "}
            <span className="gradient-text">Across Borders</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A heart health equipment donation initiative — bridging gaps in
            cardiovascular care across local and international communities.
          </p>

          {/* EKG ornament */}
          <div className="mt-10 flex justify-center">
            <svg viewBox="0 0 400 40" className="w-64 opacity-40">
              <polyline
                className="ekg-line"
                points="0,20 60,20 80,20 90,5 100,35 108,2 116,32 124,20 200,20 220,20 230,10 240,30 248,5 256,28 264,20 340,20 360,20 368,12 376,28 382,6 390,26 398,20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="wave-bottom">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", height: "60px", width: "100%" }}>
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,60 L0,60 Z" fill="#EFF6FF" />
          </svg>
        </div>
      </section>

      {/* ── About Initiative ── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl p-8 md:p-12 shadow-xl" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(147,197,253,0.3)" }}>
            <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}>
              About the Initiative
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg mb-4">
              We are currently implementing a Heart Health Equipment Donation Initiative,
              called <strong className="text-blue-700">&ldquo;HeartTalks: Hearts Across Borders&rdquo;</strong>,
              which involves the collection of vital cardiovascular or rehabilitation equipment.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              This equipment will be distributed to hospitals and health organizations that
              serve marginalized communities within the local and international environment —
              bridging healthcare gaps one donation at a time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Team Contacts ── */}
      <section className="py-20" style={{ background: "#DBEAFE" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3 block">
              The Team
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}
            >
              Meet Our Team
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Passionate students dedicated to making cardiovascular health knowledge accessible to all.
            </p>
            <div className="w-12 h-1 rounded-full mx-auto mt-4" style={{ background: "linear-gradient(90deg, #2563EB, #0891B2)" }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <ContactCard key={i} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder Bio (bottom) ── */}
      <section className="py-20" style={{ background: "#EFF6FF" }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3 block">
              Meet the Visionary
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}
            >
              Founder&apos;s Message
            </h2>
            <div className="w-12 h-1 rounded-full mx-auto mt-4" style={{ background: "linear-gradient(90deg, #2563EB, #0891B2)" }} />
          </div>
          <FounderBioCard />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative py-12 overflow-hidden"
        style={{ background: "#1E3A5F" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #93C5FD, transparent)" }}
        />
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="text-4xl mb-4" style={{ animation: "heartbeat 2s ease-in-out infinite" }}>❤️</div>
          <p className="text-blue-200 text-sm">
            Together, we raise the standard of cardiovascular care — one heart, one community at a time.
          </p>
          <p className="text-blue-400/60 text-xs mt-4">
            © {new Date().getFullYear()} HeartTalks. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
