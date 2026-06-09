import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeartTalks — Youth Empowering, Raising World Standards",
  description:
    "HeartTalks is an education organization devoted to spreading knowledge about cardiovascular health and the connection between mental and physical well-being.",
  openGraph: {
    title: "HeartTalks",
    description: "Youth Empowering, Raising World Standards",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <img
          src="/logo.png"
          alt=""
          className="watermark"
          aria-hidden="true"
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
