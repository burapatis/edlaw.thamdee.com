import type { Metadata } from "next";
import "./globals.css";

const title = "EduLex Atlas — หอดูดาวกฎหมายแม่บทการศึกษา";
const description =
  "อ่านกฎหมายแม่บทการศึกษาเป็นชั้นของตัวบท เพื่อการเรียนรู้ การเทียบที่ถูกชั้น และการพัฒนากฎหมายแม่บทของไทย ไม่จัดอันดับระบบการศึกษา";

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
      <body>{children}</body>
    </html>
  );
}
