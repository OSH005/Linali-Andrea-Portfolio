import type { Metadata } from "next";
import { Bodoni_Moda, Courier_Prime, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: "400",
});

const sinhala = Noto_Serif_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["sinhala"],
});

export const metadata: Metadata = {
  title: "Linali Andrea · Womenswear designer",
  description: "Womenswear designer · Sri Lanka · Slow craft",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoni.variable} ${courier.variable} ${sinhala.variable}`}>
      <body>{children}</body>
    </html>
  );
}
