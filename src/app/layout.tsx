import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Tumbuzz — Belanja Kebutuhan Sehari-hari",
  description: "Platform belanja bahan masak, alat mandi, sembako dan kebutuhan rumah tangga.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${dmSans.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}