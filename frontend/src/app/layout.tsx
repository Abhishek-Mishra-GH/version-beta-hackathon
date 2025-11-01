import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import Providers from "../components/provider/rainbow-provider";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "MedChain - Secure Medical Records",
  description: "Blockchain-secured medical records with AI processing",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Providers>
          <MainNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
