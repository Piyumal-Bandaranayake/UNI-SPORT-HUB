import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "UniSportHub | University Sports Management",
  description: "Advanced Sports Management System for Universities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <SessionWrapper>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
            {children}
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}
