"use client";

import { useEffect, useRef, useState } from "react";

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

export default function AboutSection() {
  const heading = useScrollReveal();
  const text = useScrollReveal();
  const card = useScrollReveal();

  return (
    <section
      id="about"
      className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #DBEAFE 0%, #EFF6FF 100%)" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-10 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)", transform: "translate(30%, 0)" }}
      />
      <div
        className="absolute bottom-10 left-0 w-72 h-72 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #60A5FA, transparent 70%)", transform: "translate(-30%, 0)" }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div
              ref={heading.ref}
              style={{
                opacity: heading.visible ? 1 : 0,
                transform: heading.visible ? "translateX(0)" : "translateX(-40px)",
                transition: "opacity 0.8s ease, transform 0.8s ease",
              }}
            >
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3 block">
                About Us
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                style={{ fontFamily: "Georgia, serif", color: "#1E3A5F" }}
              >
                Connecting Hearts,{" "}
                <span className="gradient-text">Changing Lives</span>
              </h2>
              <div className="w-12 h-1 rounded-full mb-8" style={{ background: "linear-gradient(90deg, #2563EB, #0891B2)" }} />
            </div>

            <div
              ref={text.ref}
              style={{
                opacity: text.visible ? 1 : 0,
                transform: text.visible ? "translateX(0)" : "translateX(-30px)",
                transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
              }}
            >
              <p className="text-slate-600 leading-relaxed mb-6 text-base md:text-lg">
                HeartTalks is a new education organization devoted to spreading
                knowledge about the health of the cardiovascular system and the
                connection between mental and physical well-being.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6 text-base md:text-lg">
                The purpose of HeartTalks is to inform people of different age
                groups about special heart diseases, mechanisms of their
                development, and the influences of everyday behavior and mental
                states on heart functions.
              </p>
              <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                We believe every person — regardless of background — deserves
                access to life-saving cardiovascular knowledge. Youth leading
                the charge, one conversation at a time.
              </p>
            </div>
          </div>

          {/* Right: Mission card */}
          <div
            ref={card.ref}
            style={{
              opacity: card.visible ? 1 : 0,
              transform: card.visible ? "translateX(0) scale(1)" : "translateX(40px) scale(0.95)",
              transition: "opacity 0.9s ease 0.3s, transform 0.9s cubic-bezier(0.34,1.3,0.64,1) 0.3s",
            }}
          >
            <div
              className="rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1E40AF 0%, #0891B2 100%)",
                color: "white",
              }}
            >
              {/* Floating hearts */}
              <div className="absolute top-4 right-4 text-white opacity-10 text-6xl pointer-events-none">
                ♥
              </div>
              <div className="absolute bottom-6 left-4 text-white opacity-10 text-4xl pointer-events-none">
                ♥
              </div>

              <div className="text-5xl mb-4" style={{ animation: "heartbeat 2s ease-in-out infinite" }}>
                ❤️
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Our Mission
              </h3>
              <p className="text-blue-100 leading-relaxed mb-6">
                To empower communities with cardiovascular knowledge and provide
                vital equipment to those who need it most — bridging gaps in
                healthcare one heartbeat at a time.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: "6+", label: "Team Members" },
                  { num: "∞", label: "Hearts Reached" },
                  { num: "2", label: "Core Programs" },
                  { num: "100%", label: "Youth-Led" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4 text-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <div className="text-3xl font-bold">{stat.num}</div>
                    <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            d="M0,20 C480,60 960,0 1440,40 L1440,60 L0,60 Z"
            fill="#BFDBFE"
          />
        </svg>
      </div>
    </section>
  );
}
