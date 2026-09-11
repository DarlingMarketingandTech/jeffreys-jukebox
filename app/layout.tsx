import type { Metadata, Viewport } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";
import "./jukebox-effects.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jeffreys-jukebox.vercel.app"),
  title: "J&J Jukebox · Private Pressings",
  description: "Jacob and Jeffrey's private recording archive inside an interactive Indianapolis dive-bar jukebox.",
  applicationName: "J&J Jukebox",
  robots: { index: false, follow: false },
  openGraph: {
    title: "J&J Jukebox · Private Pressings",
    description: "Jacob + Jeffrey. Real recordings. One old machine. A private listening room built by Darling Juke Joint Works.",
    url: "/",
    siteName: "J&J Jukebox",
    type: "website",
    images: [
      {
        url: "/images/intro-screen.png",
        width: 1454,
        height: 1301,
        alt: "A glowing jukebox inside a gritty Indianapolis bar room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "J&J Jukebox · Private Pressings",
    description: "A private recording archive for Jacob and Jeffrey.",
    images: ["/images/intro-screen.png"],
  },
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
