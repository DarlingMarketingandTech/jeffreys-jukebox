import type { Metadata, Viewport } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Jeffrey's Jukebox",
  description: "Jeffrey Taylor's private listening room, built by Darling Juke Joint Works.",
};

export const viewport: Viewport = {
  themeColor: "#100706",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={caveat.variable}>
      <body>{children}</body>
    </html>
  );
}
