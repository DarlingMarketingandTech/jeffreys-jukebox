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
  title: "Jeffrey's Jukebox · Private Pressings",
  description: "A playable private archive of real Jacob Darling and Jeffrey Taylor recordings inside an interactive Indianapolis jukebox.",
  applicationName: "Jeffrey's Jukebox",
  openGraph: {
    title: "Jeffrey's Jukebox · Private Pressings",
    description: "Real recordings. One old machine. An interactive listening room built by Darling Juke Joint Works.",
    url: "/",
    siteName: "Jeffrey's Jukebox",
    type: "website",
    images: [
      {
        url: "/images/intro-screen.png",
        width: 1454,
        height: 1301,
        alt: "Jeffrey's Jukebox glowing inside the Alley Cat back room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jeffrey's Jukebox · Private Pressings",
    description: "A playable private archive of real recordings inside an interactive jukebox.",
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
