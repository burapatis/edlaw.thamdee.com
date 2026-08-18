import type { Metadata } from "next";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  display: "swap",
});

const serif = Noto_Serif_Thai({
  variable: "--font-serif",
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduLex Atlas — คลังอ้างอิงกฎหมายการศึกษาโลก",
  description: "แหล่งรวมกฎหมายแม่บทและข้อมูลอ้างอิงทางการศึกษาจากประเทศต่าง ๆ เพื่อการค้นคว้า วิเคราะห์ เปรียบเทียบ และประยุกต์ใช้",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>;
}
