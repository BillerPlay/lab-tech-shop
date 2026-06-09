import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import AdBanner from "./components/AdBanner";
import { PremiumProvider } from "./components/PremiumContext.js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TechCart: gadgets & ads",
  description: "The best tech gadgets on the internet. Also the most ads.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PremiumProvider>
          <Navbar />
          <AdBanner />
          {children}
        </PremiumProvider>
      </body>
    </html>
  );
}