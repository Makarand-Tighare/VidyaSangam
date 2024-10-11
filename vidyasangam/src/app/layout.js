import { Comfortaa, Poppins, Roboto } from "next/font/google";
import "./globals.css";

// Load the Google Fonts with specific weights and subsets
const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-comfortaa",
  adjustFontFallback: false,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  adjustFontFallback: false,
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  adjustFontFallback: false,
});

// Metadata for the Vidyasangam platform
export const metadata = {
  title: "Vidya Sangam",
  description:
    "Empowering students to bridge the gap between academia and industry.",
  icons: {
    icon: [
      {
        url: "./vidyasangam-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "./vidyasangam-logo.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

// RootLayout component for wrapping the entire app
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      {/* <body className={`${poppins.variable} ${comfortaa.variable} ${roboto.variable} bg-gradient-to-r from-orange-50 from-10% via-violet-100 via-30% mb-0 pb-0`}> */}
      <body
        className={`${poppins.variable} ${comfortaa.variable} ${roboto.variable} bg-gradient-to-r from-[#e6f3ff] via-[#f0f8ff] to-[#f5faff] h-full mb-0 pb-0`}
      >
        {children}
      </body>
    </html>
  );
}
