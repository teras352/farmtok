import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🔥 IMPORTS ΠΟΥ ΠΡΟΣΘΕΤΟΥΜΕ
import Navbar from "./components/Navbar";
import PushNotifications from "./components/PushNotifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarmTok 🌱",
  description: "Marketplace για παραγωγούς",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="el"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        
        {/* 🔔 Push Notifications */}
        <PushNotifications />

        {/* 📱 MAIN CONTENT */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {children}
        </div>

        {/* 🔻 Navbar */}
        <Navbar />

      </body>
    </html>
  );
}