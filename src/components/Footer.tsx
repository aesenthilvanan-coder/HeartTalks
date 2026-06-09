import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="relative py-16 overflow-hidden"
      style={{ background: "#1E3A5F" }}
    >
      {/* Decorative */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #93C5FD, transparent)" }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400/40">
                <Image src="/logo.png" alt="HeartTalks" fill className="object-cover" />
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                Heart<span className="text-blue-300">Talks</span>
              </span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Youth Empowering, Raising World Standards — one heartbeat at a time.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Navigation</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/hearts-across-borders", label: "Hearts Across Borders" },
                { href: "/#about", label: "About HeartTalks" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blue-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Contact</h4>
            <p className="text-blue-200 text-sm mb-3">Reach out to our team:</p>
            <a
              href="mailto:ginjupalli.jia05@bloomfield.org"
              className="text-blue-300 hover:text-white text-sm transition-colors duration-200 block mb-2"
            >
              ginjupalli.jia05@bloomfield.org
            </a>
            <div className="mt-4 flex gap-2 text-2xl">
              <span style={{ animation: "heartbeat 2s ease-in-out infinite", display: "inline-block" }}>❤️</span>
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-8 text-center text-blue-400/60 text-xs"
          style={{ borderTop: "1px solid rgba(147,197,253,0.15)" }}
        >
          © {new Date().getFullYear()} HeartTalks. All rights reserved. Made with ❤️ for healthier communities.
        </div>
      </div>
    </footer>
  );
}
