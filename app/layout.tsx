import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeffrey's Jukebox",
  description: "A custom neighborhood-bar jukebox by Darling Jukebox Co.",
};

export const viewport: Viewport = {
  themeColor: "#24130d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
