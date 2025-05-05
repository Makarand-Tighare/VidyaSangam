import { Comfortaa, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "./lib/useAuth";
import { Toaster } from "sonner";

// Load the Google Fonts with specific weights and subsets
const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-comfortaa",
  display: "swap", // Optimize font loading
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap", // Optimize font loading
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap", // Optimize font loading
});

// Metadata for the Vidyasangam platform
export const metadata = {
  title: "VidyaSangam - Mentor-Mentee Platform",
  description:
    "Empowering mentors to guide, and mentees to grow in a collaborative ecosystem designed for academic excellence.",
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
      <body
        className={`${poppins.variable} ${comfortaa.variable} ${roboto.variable} bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 min-h-screen`}
        style={{
          backgroundImage: `
            linear-gradient(to bottom right, rgba(238, 242, 255, 0.9), rgba(224, 231, 255, 0.9), rgba(238, 242, 255, 0.9)), 
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
          backgroundAttachment: "fixed"
        }}
      >
        {/* Sonner Toast Container with themed colors */}
        <Toaster 
          position="top-right" 
          richColors 
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5edff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)'
            },
            success: {
              style: {
                background: 'linear-gradient(to right, #4f46e5, #3b82f6)',
                color: 'white'
              }
            }
          }}
        />

        {/* Google Analytics Scripts */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EFG5FKTN9J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EFG5FKTN9J');
          `}
        </Script>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
