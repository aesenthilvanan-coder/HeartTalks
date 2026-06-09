"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/hearts-across-borders", label: "Hearts Across Borders" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "navbar-glass" : "bg-transparent"
      }`}
    >
      <div
        className="max-w-6xl mx-auto px-6 flex items-center justify-between"
        style={{ height: "60px" }}
      >
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
            style={{ border: "1px solid var(--gray-200)" }}
          >
            <Image src="/logo.png" alt="HeartTalks" fill className="object-cover" />
          </div>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "var(--navy)", fontFamily: "Georgia, serif" }}
          >
            HeartTalks
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
              style={{
                color: pathname === l.href ? "var(--blue-600)" : "var(--gray-600)",
                background: pathname === l.href ? "var(--blue-50)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="mailto:ginjupalli.jia05@bloomfield.org"
            className="btn-primary ml-4"
            style={{ padding: "7px 16px", fontSize: "13px" }}
          >
            Contact
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md"
          style={{ color: "var(--gray-600)" }}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{
            background: "var(--white)",
            borderColor: "var(--gray-200)",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-md text-sm font-medium"
              style={{
                color: pathname === l.href ? "var(--blue-600)" : "var(--gray-700)",
                background: pathname === l.href ? "var(--blue-50)" : "transparent",
              }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="mailto:ginjupalli.jia05@bloomfield.org"
            className="btn-primary mt-2 justify-center"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
