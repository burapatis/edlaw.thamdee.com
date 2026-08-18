# EduLex Atlas

คลังอ้างอิงกฎหมายการศึกษาเปรียบเทียบ ครอบคลุมยุโรป เอเชียแปซิฟิก อเมริกาเหนือ แอฟริกา และละตินอเมริกา รวมอาเซียนและสกอตแลนด์
จัดทำเพื่อการศึกษา ค้นคว้า และเปรียบเทียบ ไม่ใช่คำแนะนำทางกฎหมาย

เว็บนี้รันบน [vinext](https://github.com/cloudflare/vinext) สำหรับโฮสต์แบบ ChatGPT Sites

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
npm test
```

## โครงสร้างที่แก้ไขบ่อย

- `app/data/laws.ts` — ข้อมูลกฎหมาย แหล่งอ้างอิง และธีม
- `app/page.tsx` — หน้าคลัง ค้นหา กรอง เปรียบเทียบ และ permalink
- `app/layout.tsx` — metadata ภาษาไทยและ Open Graph
- `app/globals.css` — เลย์เอาต์และสไตล์ของไซต์

ลิงก์รายกฎหมายใช้พารามิเตอร์ เช่น `/?law=thailand` และ `/?compare=finland,japan,thailand&view=compare`

## Useful Commands

- `npm run dev`: เริ่มพัฒนาในเครื่อง
- `npm run build`: ตรวจผล build ของ vinext
- `npm test`: build แล้วตรวจ HTML และความครบของคลังกฎหมาย
- `npm run lint`: ตรวจ ESLint

## Research Note

ผู้ใช้ควรตรวจสอบตัวบทฉบับปัจจุบันจากฐานข้อมูลทางการเสมอ สรุปในเว็บเป็นจุดตั้งต้นสำหรับการเปรียบเทียบเท่านั้น
