import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
