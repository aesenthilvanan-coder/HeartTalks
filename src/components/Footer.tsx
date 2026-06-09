import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ background: "var(--gray-900)", color: "var(--gray-400)" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <Image src="/logo.png" alt="HeartTalks" fill className="object-cover" />
              </div>
              <span className="text-sm font-semibold text-white" style={{ fontFamily: "Georgia, serif" }}>
                HeartTalks
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--gray-400)" }}>
              Youth Empowering, Raising World Standards — one heartbeat at a time.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-white">
              Navigation
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/hearts-across-borders", label: "Hearts Across Borders" },
                { href: "/#about", label: "About" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors duration-150 hover:text-white"
                    style={{ color: "var(--gray-400)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-white">
              Contact
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:ginjupalli.jia05@bloomfield.org"
                  className="text-sm transition-colors duration-150 hover:text-white"
                  style={{ color: "var(--gray-400)" }}
                >
                  ginjupalli.jia05@bloomfield.org
                </a>
              </li>
              <li>
                <span className="text-sm" style={{ color: "var(--gray-400)" }}>
                  Bloomfield, Michigan
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "var(--gray-600)" }}
        >
          <span>© {new Date().getFullYear()} HeartTalks. All rights reserved.</span>
          <span>
            Made with ❤️ for healthier communities &nbsp;·&nbsp;{" "}
            <a
              href="mailto:aesenthilvanan@gmail.com"
              className="transition-colors duration-150 hover:text-white"
              style={{ color: "var(--gray-500)" }}
            >
              Website by Aaryan Senthilvanan
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
