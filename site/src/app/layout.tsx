import type { Metadata } from "next";
import { Gloock, Hanken_Grotesk, DM_Mono, Special_Elite, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import SmoothScroll from "@/lib/motion/SmoothScroll";
import { HeaderProvider } from "@/components/header/HeaderContext";
import SiteHeader from "@/components/header/SiteHeader";
import { getBrand } from "@/lib/media";
import { getSite } from "@/lib/site";

const gloock = Gloock({ variable: "--font-gloock", subsets: ["latin"], weight: "400" });
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"], weight: ["400", "500"] });
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400", "500"] });
const specialElite = Special_Elite({ variable: "--font-special-elite", subsets: ["latin"], weight: "400" });
const sinhala = Noto_Serif_Sinhala({ variable: "--font-noto-sinhala", subsets: ["sinhala"] });

export const metadata: Metadata = {
  title: "Linali Andrea · Fashion designer",
  description: "Fashion designer · Sri Lanka",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [gloock, hanken, dmMono, specialElite, sinhala].map((f) => f.variable).join(" ");
  const { monogramCream: m } = getBrand();
  const mark = { src: m.srcset.webp.split(" ")[0], width: m.width, height: m.height };
  return (
    <html lang="en" className={fonts}>
      <body>
        <SmoothScroll>
          <HeaderProvider>
            <SiteHeader mark={mark} linkedin={getSite().links.linkedin} />
            {children}
          </HeaderProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
