import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "Gestion clients ATS", template: "%s | Gestion clients ATS" },
  description: "Espace sécurisé de gestion des clients ATS",
  icons: { icon: "/images/ats-logo-transparent.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className={manrope.variable}>{children}</body></html>;
}
