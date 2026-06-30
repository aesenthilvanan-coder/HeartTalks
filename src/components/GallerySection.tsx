"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const photos = [
  { src: "/team-photo-1.jpg", alt: "HeartTalks event — Share Detroit" },
  { src: "/team-photo-2.jpg", alt: "HeartTalks initiative workshop" },
  { src: "/team-photo-3.jpg", alt: "HeartTalks community outreach fair" },
];

function PhotoCard({ photo, index }: { photo: (typeof photos)[0]; index: number }) {
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
      className="relative overflow-hidden rounded-xl"
      style={{
        aspectRatio: "16/10",
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s`,
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--gray-200)",
      }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  );
}

export default function GallerySection() {
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
    <section className="py-24" style={{ background: "var(--gray-50)" }}>
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
            In Action
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
            HeartTalks in the Community
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {photos.map((photo, i) => (
            <PhotoCard key={i} photo={photo} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
