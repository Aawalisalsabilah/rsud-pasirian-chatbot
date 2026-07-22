import { Poppins } from "next/font/google";
import "./globals.css";

const fraunces = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const inter = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata = {
  title: "RSUD Pasirian Lumajang - Virtual Assistant",
  description: "Layanan Asisten Virtual Pintar RSUD Pasirian Kabupaten Lumajang",
  icons: {
    icon: "/logo-rs-removebg-preview.png",
  },
};

export const viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-inter)">
        {children}
      </body>
    </html>
  );
}