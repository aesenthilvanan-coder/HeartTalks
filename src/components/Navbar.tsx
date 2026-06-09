"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/hearts-across-borders", label: "Hearts Across Borders" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "navbar-glass shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-300/60 group-hover:border-blue-400 transition-all duration-300 shadow-md">
            <Image
              src="/logo.png"
              alt="HeartTalks Logo"
              fill
              className="object-cover"
            />
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif", color: "#1E40AF" }}
          >
            Heart<span style={{ color: "#0891B2" }}>Talks</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300 ${
                pathname === link.href
                  ? "text-blue-700 after:w-full"
                  : "text-slate-600 hover:text-blue-700 after:w-0 hover:after:w-full"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="mailto:ginjupalli.jia05@bloomfield.org"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #2563EB, #0891B2)" }}
          >
            Contact Us
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-blue-700 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-blue-700 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-blue-700 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ background: "rgba(239, 246, 255, 0.97)", backdropFilter: "blur(16px)" }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-blue-800 font-medium text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="mailto:ginjupalli.jia05@bloomfield.org"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white text-center"
            style={{ background: "linear-gradient(135deg, #2563EB, #0891B2)" }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </nav>
  );
}
