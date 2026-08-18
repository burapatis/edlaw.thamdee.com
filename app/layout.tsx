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

const title = "EduLex Atlas — คลังอ้างอิงกฎหมายการศึกษาโลก";
const description =
  "แหล่งรวมกฎหมายแม่บทและข้อมูลอ้างอิงทางการศึกษาจากประเทศต่าง ๆ เพื่อการค้นคว้า วิเคราะห์ เปรียบเทียบ และประยุกต์ใช้";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "EduLex Atlas",
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title,
    description,
    locale: "th_TH",
    type: "website",
    siteName: "EduLex Atlas",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
