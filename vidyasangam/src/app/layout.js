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
  title: "VidyaSangam",
  description: "Empowering students to bridge the gap between academia and industry.",
  icons: {
    icon: [
      {
        url: './vidyasangam-logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: './vidyasangam-logo.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

// RootLayout component for wrapping the entire app
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" />
      <body className={`${poppins.variable} ${comfortaa.variable} ${roboto.variable} bg-gradient-to-r from-[#6cb2eb] to-[#a0d6f1] via-[#e1f5fe] h-full mb-0 pb-0`}>
        {children}
      </body>
    </html>
  );
}
