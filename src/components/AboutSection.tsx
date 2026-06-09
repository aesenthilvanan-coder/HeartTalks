"use client";

import { useEffect, useRef, useState } from "react";

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

const facts = [
  { num: "6+",   label: "Team Members" },
  { num: "2",    label: "Active Programs" },
  { num: "100%", label: "Youth-Led" },
  { num: "∞",    label: "Hearts Reached" },
];

export default function AboutSection() {
  const left  = useReveal();
  const right = useReveal();

  return (
    <section className="py-24" style={{ background: "var(--gray-50)" }}>
      <hr className="section-divider" />
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Copy */}
          <div
            ref={left.ref}
            style={{
              opacity: left.v ? 1 : 0,
              transform: left.v ? "translateX(0)" : "translateX(-16px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "var(--blue-600)" }}
            >
              About HeartTalks
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{
                fontFamily: "Georgia, serif",
                color: "var(--gray-900)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Connecting Hearts,<br />Changing Lives
            </h2>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--gray-600)" }}>
              <p>
                HeartTalks is a new education organization devoted to spreading knowledge
                about the health of the cardiovascular system and the connection between
                mental and physical well-being.
              </p>
              <p>
                The purpose of HeartTalks is to inform people of different age groups
                about special heart diseases, mechanisms of their development, and the
                influences of everyday behavior and mental states on heart functions.
              </p>
              <p>
                We believe every person — regardless of background — deserves access to
                life-saving cardiovascular knowledge.
              </p>
            </div>
          </div>

          {/* Right: Stats */}
          <div
            ref={right.ref}
            style={{
              opacity: right.v ? 1 : 0,
              transform: right.v ? "translateX(0)" : "translateX(16px)",
              transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
            }}
          >
            <div
              className="rounded-xl p-8"
              style={{
                background: "var(--white)",
                border: "1px solid var(--gray-200)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3
                className="font-semibold mb-1 text-base"
                style={{ color: "var(--gray-900)" }}
              >
                Our Mission
              </h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--gray-600)" }}>
                Empower communities with cardiovascular knowledge and provide vital equipment
                to those who need it most — bridging healthcare gaps one donation at a time.
              </p>

              <div className="grid grid-cols-2 gap-px" style={{ background: "var(--gray-200)", border: "1px solid var(--gray-200)", borderRadius: "10px", overflow: "hidden" }}>
                {facts.map((f, i) => (
                  <div
                    key={i}
                    className="px-6 py-5"
                    style={{ background: "var(--white)" }}
                  >
                    <div
                      className="text-3xl font-bold mb-1"
                      style={{ color: "var(--blue-700)", fontFamily: "Georgia, serif" }}
                    >
                      {f.num}
                    </div>
                    <div className="text-xs" style={{ color: "var(--gray-600)" }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
