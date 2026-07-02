import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Perubahan pada Metadata untuk Judul & Icon Browser
export const metadata = {
  title: "RSUD Pasirian Lumajang - Virtual Assistant",
  description: "Layanan Asisten Virtual Pintar RSUD Pasirian Kabupaten Lumajang",
  icons: {
    // CUKUP GANTI BAGIAN INI SAJA:
    icon: "/logo-rs-removebg-preview.png", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}