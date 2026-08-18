import Link from "next/link";

export default function NotFound() {
  return (
    <main className="library-section" style={{ minHeight: "70vh" }}>
      <span className="kicker">404</span>
      <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: "42px", margin: "12px 0" }}>
        ไม่พบหน้าที่ต้องการ
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "42rem", lineHeight: 1.8 }}>
        ลิงก์นี้อาจหมดอายุหรือพิมพ์ไม่ถูกต้อง กลับไปคลังกฎหมายเพื่อค้นหาเขตอำนาจที่ต้องการได้ทันที
      </p>
      <p style={{ marginTop: "28px" }}>
        <Link href="/" style={{ color: "var(--orange)", fontWeight: 600 }}>กลับหน้าแรก EduLex Atlas</Link>
      </p>
    </main>
  );
}

