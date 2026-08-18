"use client";

import { useMemo, useState } from "react";

type Law = {
  id: string;
  country: string;
  flag: string;
  region: "ยุโรป" | "เอเชียแปซิฟิก" | "อเมริกาเหนือ";
  title: string;
  localTitle: string;
  year: string;
  updated: string;
  system: "รวมศูนย์" | "กระจายอำนาจ" | "สหพันธรัฐ";
  level: string;
  language: string;
  source: string;
  url: string;
  summary: string;
  themes: string[];
  related?: string[];
  color: string;
};

const laws: Law[] = [
  {
    id: "finland",
    country: "ฟินแลนด์",
    flag: "FI",
    region: "ยุโรป",
    title: "Basic Education Act 628/1998",
    localTitle: "Perusopetuslaki",
    year: "1998",
    updated: "ตรวจสอบแหล่งข้อมูล ส.ค. 2026",
    system: "กระจายอำนาจ",
    level: "การศึกษาขั้นพื้นฐาน",
    language: "ฟินแลนด์ / อังกฤษ",
    source: "Finlex",
    url: "https://www.finlex.fi/en/legislation/translations/1998/eng/628",
    summary: "วางหลักสิทธิในการได้รับการศึกษาขั้นพื้นฐานโดยไม่เสียค่าใช้จ่าย ความเสมอภาค การสนับสนุนผู้เรียน และหน้าที่ของเทศบาลในการจัดการศึกษา",
    themes: ["สิทธิทางการศึกษา", "ความเสมอภาค", "การสนับสนุนผู้เรียน"],
    color: "#365d9d",
  },
  {
    id: "korea",
    country: "สาธารณรัฐเกาหลี",
    flag: "KR",
    region: "เอเชียแปซิฟิก",
    title: "Framework Act on Education",
    localTitle: "교육기본법",
    year: "1997",
    updated: "แก้ไขล่าสุดตามฐานข้อมูล 2025",
    system: "รวมศูนย์",
    level: "ทุกระดับการศึกษา",
    language: "เกาหลี / อังกฤษ",
    source: "Korea Legislation Research Institute",
    url: "https://elaw.klri.re.kr/eng_service/lawView.do?hseq=2376&lang=ENG",
    summary: "กำหนดอุดมการณ์การศึกษา สิทธิและหน้าที่ของประชาชน ตลอดจนความรับผิดชอบของรัฐและองค์กรปกครองส่วนท้องถิ่น",
    themes: ["ปรัชญาการศึกษา", "หน้าที่ของรัฐ", "การเรียนรู้ตลอดชีวิต"],
    color: "#8d4b63",
  },
  {
    id: "singapore",
    country: "สิงคโปร์",
    flag: "SG",
    region: "เอเชียแปซิฟิก",
    title: "Education Act 1957",
    localTitle: "2020 Revised Edition",
    year: "1957",
    updated: "ฉบับปัจจุบัน ส.ค. 2026",
    system: "รวมศูนย์",
    level: "สถานศึกษาและวิชาชีพครู",
    language: "อังกฤษ",
    source: "Singapore Statutes Online",
    url: "https://sso.agc.gov.sg/Act/87",
    summary: "กรอบกำกับการจดทะเบียนและบริหารโรงเรียน ผู้บริหาร ครู การตรวจสถานศึกษา และกลไกอุทธรณ์ภายใต้การกำกับของรัฐ",
    themes: ["กำกับสถานศึกษา", "มาตรฐานครู", "ธรรมาภิบาล"],
    color: "#9b3b43",
  },
  {
    id: "japan",
    country: "ญี่ปุ่น",
    flag: "JP",
    region: "เอเชียแปซิฟิก",
    title: "Basic Act on Education",
    localTitle: "教育基本法",
    year: "2006",
    updated: "ฉบับกฎหมายเลขที่ 120",
    system: "กระจายอำนาจ",
    level: "ทุกระดับการศึกษา",
    language: "ญี่ปุ่น / อังกฤษ",
    source: "Japanese Law Translation",
    url: "https://www.japaneselawtranslation.go.jp/en/laws/view/2442/en",
    summary: "บัญญัติเป้าหมายและหลักการพื้นฐานของการศึกษา ความเสมอภาค การศึกษาภาคบังคับ การเรียนรู้ตลอดชีวิต และความร่วมมือระหว่างโรงเรียน ครอบครัว และชุมชน",
    themes: ["เป้าหมายการศึกษา", "ครอบครัวและชุมชน", "การศึกษาภาคบังคับ"],
    color: "#b34a3d",
  },
  {
    id: "new-zealand",
    country: "นิวซีแลนด์",
    flag: "NZ",
    region: "เอเชียแปซิฟิก",
    title: "Education and Training Act 2020",
    localTitle: "Public Act 2020 No 38",
    year: "2020",
    updated: "ฐานกฎหมายฉบับรวม",
    system: "กระจายอำนาจ",
    level: "การศึกษาและการฝึกอบรม",
    language: "อังกฤษ",
    source: "New Zealand Legislation",
    url: "https://www.legislation.govt.nz/act/public/2020/0038/latest/LMS170676.html",
    summary: "รวมกฎหมายการศึกษาไว้ในกรอบเดียว ครอบคลุมสิทธิของผู้เรียน การบริหารโรงเรียน อุดมศึกษา การฝึกอบรม และการให้ความสำคัญกับภาษาและวัฒนธรรมเมารี",
    themes: ["สิทธิผู้เรียน", "พหุวัฒนธรรม", "การฝึกอบรม"],
    color: "#326678",
  },
  {
    id: "england",
    country: "สหราชอาณาจักร",
    flag: "GB",
    region: "ยุโรป",
    title: "Education Act 1996",
    localTitle: "1996 Chapter 56",
    year: "1996",
    updated: "ฐานกฎหมายฉบับปรับปรุง",
    system: "กระจายอำนาจ",
    level: "อังกฤษและเวลส์",
    language: "อังกฤษ",
    source: "UK Legislation",
    url: "https://www.legislation.gov.uk/ukpga/1996/56/contents",
    summary: "กฎหมายแกนกลางเกี่ยวกับหน้าที่ของรัฐและองค์กรท้องถิ่น การศึกษาภาคบังคับ หลักสูตร การรับเข้าเรียน และการศึกษาสำหรับผู้มีความต้องการพิเศษ",
    themes: ["หน้าที่ท้องถิ่น", "การศึกษาภาคบังคับ", "การศึกษาแบบเรียนรวม"],
    color: "#584f88",
  },
  {
    id: "germany",
    country: "เยอรมนี",
    flag: "DE",
    region: "ยุโรป",
    title: "Basic Law — Article 7",
    localTitle: "Grundgesetz, Artikel 7",
    year: "1949",
    updated: "แก้ไขล่าสุด มี.ค. 2025",
    system: "สหพันธรัฐ",
    level: "หลักรัฐธรรมนูญและกฎหมายมลรัฐ",
    language: "เยอรมัน / อังกฤษ",
    source: "Federal Ministry of Justice",
    url: "https://www.gesetze-im-internet.de/englisch_gg/englisch_gg.html",
    summary: "รับรองการกำกับระบบโรงเรียนโดยรัฐ สิทธิของผู้ปกครอง การสอนศาสนา และเสรีภาพของโรงเรียนเอกชน โดยรายละเอียดสำคัญอยู่ในกฎหมายของแต่ละมลรัฐ",
    themes: ["สหพันธรัฐ", "สิทธิผู้ปกครอง", "โรงเรียนเอกชน"],
    color: "#785d35",
  },
  {
    id: "ontario",
    country: "แคนาดา — ออนแทรีโอ",
    flag: "CA",
    region: "อเมริกาเหนือ",
    title: "Education Act, R.S.O. 1990",
    localTitle: "Chapter E.2",
    year: "1990",
    updated: "ฉบับรวม พ.ค. 2026",
    system: "สหพันธรัฐ",
    level: "ระดับมณฑล",
    language: "อังกฤษ / ฝรั่งเศส",
    source: "Ontario e-Laws",
    url: "https://www.ontario.ca/laws/statute/90e02",
    summary: "กำหนดระบบการศึกษาของมณฑล บทบาทรัฐมนตรีและคณะกรรมการการศึกษา สิทธิและหน้าที่ของนักเรียน ครู และการจัดการศึกษาพิเศษ",
    themes: ["การบริหารระดับมณฑล", "ผลสัมฤทธิ์ผู้เรียน", "การศึกษาพิเศษ"],
    color: "#47734e",
  },
  {
    id: "estonia",
    country: "เอสโตเนีย",
    flag: "EE",
    region: "ยุโรป",
    title: "Basic Schools and Upper Secondary Schools Act",
    localTitle: "Põhikooli- ja gümnaasiumiseadus",
    year: "2010",
    updated: "ฐานกฎหมายฉบับรวม",
    system: "กระจายอำนาจ",
    level: "ขั้นพื้นฐานและมัธยมศึกษา",
    language: "เอสโตเนีย / อังกฤษ",
    source: "Riigi Teataja",
    url: "https://www.riigiteataja.ee/en/eli/ee/Riigikogu/act/501022018002/consolide",
    summary: "ครอบคลุมการจัดตั้งและดำเนินงานโรงเรียน หลักสูตรแห่งชาติ การประกันคุณภาพ การสนับสนุนผู้เรียน และการใช้ระบบสารสนเทศทางการศึกษา",
    themes: ["รัฐบาลดิจิทัล", "ประกันคุณภาพ", "หลักสูตรแห่งชาติ"],
    color: "#3c6688",
  },
  {
    id: "australia",
    country: "ออสเตรเลีย",
    flag: "AU",
    region: "เอเชียแปซิฟิก",
    title: "Australian Education Act 2013",
    localTitle: "Act No. 67 of 2013",
    year: "2013",
    updated: "ฐานกฎหมายเครือรัฐฉบับปัจจุบัน",
    system: "สหพันธรัฐ",
    level: "เงินอุดหนุนและมาตรฐานระดับชาติ",
    language: "อังกฤษ",
    source: "Federal Register of Legislation",
    url: "https://www.legislation.gov.au/C2013A00067/latest/text",
    summary: "วางกรอบเงินอุดหนุนการศึกษา เป้าหมายระดับชาติ ความโปร่งใส และความรับผิดรับชอบ โดยการบริหารโรงเรียนส่วนใหญ่อยู่ในอำนาจรัฐและดินแดน",
    themes: ["ความเสมอภาคด้านทุน", "ความโปร่งใส", "มาตรฐานชาติ"],
    color: "#4f6f62",
  },
  {
    id: "switzerland",
    country: "สวิตเซอร์แลนด์",
    flag: "CH",
    region: "ยุโรป",
    title: "Federal Constitution — Articles 19 & 62",
    localTitle: "Bundesverfassung / Constitution fédérale",
    year: "1999",
    updated: "ฐานกฎหมายสหพันธรัฐฉบับปัจจุบัน",
    system: "สหพันธรัฐ",
    level: "หลักรัฐธรรมนูญและกฎหมาย 26 รัฐ",
    language: "เยอรมัน / ฝรั่งเศส / อิตาลี / อังกฤษ",
    source: "Fedlex",
    url: "https://www.fedlex.admin.ch/eli/cc/1999/404/en",
    summary: "รับรองสิทธิในการศึกษาขั้นพื้นฐานที่เพียงพอและไม่เสียค่าใช้จ่าย ขณะที่รัฐทั้ง 26 รัฐเป็นผู้รับผิดชอบระบบโรงเรียน และต้องประสานโครงสร้างสำคัญในระดับประเทศ",
    themes: ["สิทธิขั้นพื้นฐาน", "อำนาจของรัฐ", "พหุภาษา"],
    color: "#a3423f",
  },
  {
    id: "france",
    country: "ฝรั่งเศส",
    flag: "FR",
    region: "ยุโรป",
    title: "Code de l’éducation",
    localTitle: "ประมวลกฎหมายการศึกษา",
    year: "2000",
    updated: "ฉบับรวมจาก Légifrance ส.ค. 2026",
    system: "รวมศูนย์",
    level: "ทุกระดับการศึกษา",
    language: "ฝรั่งเศส",
    source: "Légifrance",
    url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071191/",
    summary: "ประมวลหลักสิทธิทางการศึกษา ภารกิจบริการสาธารณะ การศึกษาภาคบังคับ ความเป็นฆราวาส การจัดองค์กรสถานศึกษา บุคลากร และการอุดมศึกษาไว้ในกรอบเดียว",
    themes: ["บริการสาธารณะ", "ความเป็นฆราวาส", "ความเสมอภาค"],
    color: "#465a8b",
  },
  {
    id: "china",
    country: "สาธารณรัฐประชาชนจีน",
    flag: "CN",
    region: "เอเชียแปซิฟิก",
    title: "Education Law of the PRC",
    localTitle: "中华人民共和国教育法",
    year: "1995",
    updated: "แก้ไขครั้งล่าสุด เม.ย. 2021",
    system: "รวมศูนย์",
    level: "ทุกประเภทและทุกระดับการศึกษา",
    language: "จีน / อังกฤษ",
    source: "Official Government English Portal",
    url: "https://english.beijing.gov.cn/studyinginbeijing/lawsandpolicies/202005/t20200510_1893571.html",
    summary: "กฎหมายแม่บทที่กำหนดระบบการศึกษาของรัฐ สิทธิและหน้าที่ในการศึกษา โครงสร้างสถานศึกษา ครู ผู้เรียน การลงทุน การสอบระดับชาติ และความรับผิดทางกฎหมาย",
    themes: ["ระบบการศึกษาแห่งชาติ", "หน้าที่ของรัฐ", "ความเสมอภาค"],
    color: "#a44b3e",
  },
  {
    id: "taiwan",
    country: "ไต้หวัน",
    flag: "TW",
    region: "เอเชียแปซิฟิก",
    title: "Educational Fundamental Act",
    localTitle: "教育基本法",
    year: "1999",
    updated: "ฐานข้อมูลกระทรวงศึกษาธิการ",
    system: "รวมศูนย์",
    level: "หลักพื้นฐานของระบบการศึกษา",
    language: "จีนตัวเต็ม / อังกฤษ",
    source: "Ministry of Education Laws Database",
    url: "https://edu.law.moe.gov.tw/EngLawContent.aspx?id=53&lan=E",
    summary: "รับรองประชาชนเป็นประธานแห่งสิทธิทางการศึกษา เน้นประชาธิปไตย นิติธรรม สิทธิมนุษยชน ความหลากหลาย ความเป็นกลางทางการเมือง และการคุ้มครองกลุ่มผู้เรียนที่เสียเปรียบ",
    themes: ["สิทธิในการเรียนรู้", "ประชาธิปไตย", "ความหลากหลาย"],
    color: "#42716b",
  },
  {
    id: "usa-california",
    country: "สหรัฐฯ — แคลิฟอร์เนีย",
    flag: "CA",
    region: "อเมริกาเหนือ",
    title: "California Education Code",
    localTitle: "EDC — Titles 1–3",
    year: "1976",
    updated: "ฐานกฎหมายรัฐฉบับปัจจุบัน",
    system: "สหพันธรัฐ",
    level: "อนุบาลถึงอุดมศึกษา ระดับรัฐ",
    language: "อังกฤษ",
    source: "California Legislative Information",
    url: "https://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=EDC&tocTitle=+Education+Code+-+EDC",
    summary: "ประมวลกฎหมายการศึกษาขนาดใหญ่ ครอบคลุมการกำกับระดับรัฐและท้องถิ่น หลักสูตร การเงิน บุคลากร สิทธิผู้เรียน การศึกษาพิเศษ และสถาบันอุดมศึกษา",
    themes: ["สิทธิผู้เรียน", "เขตการศึกษา", "การศึกษาพิเศษ"],
    color: "#87643f",
  },
  {
    id: "usa-new-york",
    country: "สหรัฐฯ — นิวยอร์ก",
    flag: "NY",
    region: "อเมริกาเหนือ",
    title: "New York Education Law",
    localTitle: "Chapter 16 of the Consolidated Laws",
    year: "1909",
    updated: "Open Legislation ฉบับล่าสุด",
    system: "สหพันธรัฐ",
    level: "การศึกษาทุกระดับของรัฐ",
    language: "อังกฤษ",
    source: "New York State Senate",
    url: "https://www.nysenate.gov/legislation/laws/EDN/T1",
    summary: "กำหนดอำนาจคณะผู้สำเร็จราชการและกรรมาธิการการศึกษา การบริหารเขตโรงเรียน หลักสูตร ความปลอดภัย วิชาชีพที่รัฐกำกับ และระบบอุดมศึกษาของรัฐ",
    themes: ["Board of Regents", "การกำกับมาตรฐาน", "ศักดิ์ศรีผู้เรียน"],
    color: "#4b6385",
  },
  {
    id: "usa-massachusetts",
    country: "สหรัฐฯ — แมสซาชูเซตส์",
    flag: "MA",
    region: "อเมริกาเหนือ",
    title: "General Laws — Title XII Education",
    localTitle: "Chapters 69–78A",
    year: "1993",
    updated: "ฐานกฎหมายสภานิติบัญญัติฉบับปัจจุบัน",
    system: "สหพันธรัฐ",
    level: "การศึกษาของรัฐและความช่วยเหลือทางการเงิน",
    language: "อังกฤษ",
    source: "Massachusetts Legislature",
    url: "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXII",
    summary: "กรอบการศึกษาที่เชื่อมมาตรฐานและความรับผิดรับชอบเข้ากับเงินอุดหนุนของรัฐ ครอบคลุมโรงเรียนของรัฐ โอกาสทางการศึกษา ผู้เรียนที่มีความต้องการพิเศษ และอาชีวศึกษา",
    themes: ["มาตรฐานและความรับผิด", "School Finance", "โอกาสที่เท่าเทียม"],
    color: "#66784c",
  },
  {
    id: "thailand",
    country: "ประเทศไทย",
    flag: "TH",
    region: "เอเชียแปซิฟิก",
    title: "พระราชบัญญัติการศึกษาแห่งชาติ พ.ศ. 2542",
    localTitle: "National Education Act B.E. 2542 (1999)",
    year: "2542",
    updated: "แก้ไขเพิ่มเติมถึงฉบับที่ 4 พ.ศ. 2562",
    system: "รวมศูนย์",
    level: "ทุกระดับและทุกรูปแบบการศึกษา",
    language: "ไทย",
    source: "กระทรวงศึกษาธิการ",
    url: "https://www.moe.go.th/%E0%B8%9E%E0%B8%A3%E0%B8%9A-%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%A8%E0%B8%B6%E0%B8%81%E0%B8%A9%E0%B8%B2%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4-%E0%B8%9E-%E0%B8%A8-2542/",
    summary: "กฎหมายแม่บทที่วางหลักการศึกษาตลอดชีวิต สิทธิและความเสมอภาค การมีส่วนร่วมของครอบครัว ชุมชน และเอกชน การกระจายอำนาจสู่เขตพื้นที่และสถานศึกษา มาตรฐานและการประกันคุณภาพ ตลอดจนทรัพยากรเพื่อการศึกษา",
    themes: ["การศึกษาตลอดชีวิต", "การกระจายอำนาจ", "ประกันคุณภาพ"],
    related: [
      "รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ. 2560 — มาตรา 54",
      "พระราชบัญญัติการศึกษาภาคบังคับ พ.ศ. 2545",
      "พระราชบัญญัติกองทุนเพื่อความเสมอภาคทางการศึกษา พ.ศ. 2561",
      "พระราชบัญญัติการพัฒนาเด็กปฐมวัย พ.ศ. 2562",
    ],
    color: "#8b5340",
  },
];

const regions = ["ทั้งหมด", "ยุโรป", "เอเชียแปซิฟิก", "อเมริกาเหนือ"] as const;

function Mark({ label }: { label: string }) {
  return <span className="mark" aria-hidden="true">{label}</span>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<(typeof regions)[number]>("ทั้งหมด");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeLaw, setActiveLaw] = useState<Law | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return laws.filter((law) => {
      const regionMatch = region === "ทั้งหมด" || law.region === region;
      const searchMatch = !q || [law.country, law.title, law.localTitle, law.summary, law.system, ...law.themes]
        .join(" ").toLowerCase().includes(q);
      return regionMatch && searchMatch;
    });
  }, [query, region]);

  const toggleCompare = (id: string) => {
    setSelected((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length < 3 ? [...current, id] : current);
  };

  const selectedLaws = selected.map((id) => laws.find((law) => law.id === id)).filter(Boolean) as Law[];

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="หน้าแรก EduLex Atlas">
          <span className="brand-seal"><span>EA</span></span>
          <span className="brand-copy"><b>EduLex Atlas</b><small>คลังกฎหมายการศึกษาโลก</small></span>
        </a>
        <nav className={mobileMenu ? "nav open" : "nav"} aria-label="เมนูหลัก">
          <a href="#library" onClick={() => setMobileMenu(false)}>คลังกฎหมาย</a>
          <a href="#framework" onClick={() => setMobileMenu(false)}>กรอบเปรียบเทียบ</a>
          <a href="#about" onClick={() => setMobileMenu(false)}>เกี่ยวกับโครงการ</a>
        </nav>
        <a className="header-cta" href="#library">เริ่มค้นคว้า <span>↗</span></a>
        <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="เปิดหรือปิดเมนู" aria-expanded={mobileMenu}>
          <i></i><i></i>
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        <div className="hero-content">
          <div className="eyebrow"><span></span> Comparative Education Law Observatory</div>
          <h1>เข้าใจกฎหมายการศึกษา<br/><em>ผ่านมุมมองของโลก</em></h1>
          <p className="hero-lead">แหล่งรวมกฎหมายแม่บทและข้อมูลอ้างอิงจากระบบการศึกษาชั้นนำ เพื่อการศึกษา ค้นคว้า วิเคราะห์ เปรียบเทียบ และต่อยอดสู่บริบทไทย</p>
          <div className="hero-search" role="search">
            <Mark label="⌕" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาประเทศ ชื่อกฎหมาย หรือประเด็นสำคัญ…" aria-label="ค้นหากฎหมายการศึกษา" />
            <a href="#library" aria-label="ไปยังผลการค้นหา">ค้นหา</a>
          </div>
          <div className="hero-notes"><span>18 เขตอำนาจ</span><span>3 ภูมิภาค</span><span>แหล่งข้อมูลภาครัฐ</span></div>
        </div>
        <aside className="hero-feature" aria-label="กฎหมายแนะนำ">
          <div className="feature-top"><span>เอกสารแนะนำ</span><span className="live-dot">ตรวจสอบแล้ว</span></div>
          <div className="feature-country"><span className="flag-disc">FI</span><div><small>FINLAND</small><h2>Basic Education Act</h2></div></div>
          <blockquote>“การศึกษาที่มีคุณภาพ คือสิทธิที่ทุกคนเข้าถึงได้ ไม่ใช่สิทธิพิเศษ”</blockquote>
          <div className="feature-meta"><div><small>ประกาศใช้</small><b>1998</b></div><div><small>ฉบับแปล</small><b>English</b></div></div>
          <button onClick={() => setActiveLaw(laws[0])}>สำรวจสาระสำคัญ <span>→</span></button>
        </aside>
        <div className="hero-index">01 <span>/ 04</span></div>
      </section>

      <section className="purpose-strip">
        <div><Mark label="01"/><span><b>รวบรวม</b><small>ต้นฉบับจากแหล่งทางการ</small></span></div>
        <div><Mark label="02"/><span><b>ทำความเข้าใจ</b><small>สาระสำคัญอย่างเป็นระบบ</small></span></div>
        <div><Mark label="03"/><span><b>เปรียบเทียบ</b><small>โครงสร้างและแนวคิดเชิงนโยบาย</small></span></div>
        <div><Mark label="04"/><span><b>ประยุกต์ใช้</b><small>ต่อยอดสู่การพัฒนากฎหมายไทย</small></span></div>
      </section>

      <section className="library-section" id="library">
        <div className="section-heading">
          <div><span className="kicker">CURATED LIBRARY</span><h2>คลังกฎหมายการศึกษา</h2><p>คัดสรรจากฐานข้อมูลกฎหมายของรัฐและแหล่งอ้างอิงที่เชื่อถือได้</p></div>
          <div className="result-count"><strong>{String(filtered.length).padStart(2, "0")}</strong><span>รายการ<br/>ที่ค้นพบ</span></div>
        </div>
        <div className="library-toolbar">
          <div className="filter-tabs" aria-label="กรองตามภูมิภาค">
            {regions.map((item) => <button key={item} className={region === item ? "active" : ""} onClick={() => setRegion(item)}>{item}</button>)}
          </div>
          <label className="small-search"><Mark label="⌕"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาในคลัง…" /></label>
        </div>

        <div className="law-grid">
          {filtered.map((law, index) => (
            <article className="law-card" key={law.id} style={{"--accent": law.color} as React.CSSProperties}>
              <div className="card-head">
                <span className="flag-disc small">{law.flag}</span>
                <button className={selected.includes(law.id) ? "compare active" : "compare"} onClick={() => toggleCompare(law.id)} aria-label={`${selected.includes(law.id) ? "ยกเลิก" : "เลือก"} ${law.country} เพื่อเปรียบเทียบ`}>
                  <span>{selected.includes(law.id) ? "✓" : "+"}</span> เปรียบเทียบ
                </button>
              </div>
              <div className="card-country">{law.country}<span>{law.region}</span></div>
              <h3>{law.title}</h3><p className="local-title">{law.localTitle}</p>
              <p className="card-summary">{law.summary}</p>
              <div className="tags">{law.themes.slice(0, 2).map((theme) => <span key={theme}>{theme}</span>)}</div>
              <div className="card-foot">
                <span><small>ปีประกาศใช้</small><b>{law.year}</b></span>
                <button onClick={() => setActiveLaw(law)}>ดูรายละเอียด <span>↗</span></button>
              </div>
              <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <div className="empty-state"><span>⌕</span><h3>ยังไม่พบรายการที่ตรงกัน</h3><p>ลองใช้คำค้นอื่น หรือเลือกดูทุกภูมิภาค</p><button onClick={() => {setQuery(""); setRegion("ทั้งหมด");}}>ล้างตัวกรอง</button></div>}
      </section>

      <section className="compare-framework" id="framework">
        <div className="framework-title"><span className="kicker light">COMPARATIVE FRAMEWORK</span><h2>มองให้ลึกกว่า<br/>ตัวบทกฎหมาย</h2><p>กรอบคำถามสำหรับอ่านกฎหมายต่างประเทศอย่างเข้าใจบริบท และนำบทเรียนมาประยุกต์ใช้อย่างระมัดระวัง</p><a href="#library">เลือกประเทศเพื่อเปรียบเทียบ <span>→</span></a></div>
        <div className="framework-list">
          {[
            ["01", "สิทธิและความเสมอภาค", "ใครมีสิทธิได้รับการศึกษา รัฐมีหน้าที่เพียงใด และมีกลไกลดความเหลื่อมล้ำอย่างไร"],
            ["02", "โครงสร้างอำนาจ", "บทบาทของรัฐบาลกลาง ท้องถิ่น สถานศึกษา และชุมชน ถูกจัดวางและถ่วงดุลอย่างไร"],
            ["03", "คุณภาพและความรับผิดรับชอบ", "ใครกำหนดมาตรฐาน ประเมินผล เปิดเผยข้อมูล และรับผิดเมื่อเป้าหมายไม่บรรลุ"],
            ["04", "ความพร้อมต่ออนาคต", "กฎหมายรองรับการเรียนรู้ตลอดชีวิต เทคโนโลยี และการเปลี่ยนแปลงของสังคมเพียงใด"],
          ].map(([no, title, desc]) => <div className="framework-item" key={no}><span>{no}</span><div><h3>{title}</h3><p>{desc}</p></div><b>↗</b></div>)}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-portrait"><div className="portrait-monogram">BP</div><span className="portrait-note">Independent Researcher<br/>Bangkok, Thailand</span></div>
        <div className="about-copy">
          <span className="kicker">ABOUT THE CURATOR</span>
          <h2>พื้นที่แลกเปลี่ยนความรู้<br/>เพื่อกฎหมายการศึกษาที่ดีกว่า</h2>
          <p className="about-lead">จัดทำโดย <strong>Boorapatis Ploysuwan</strong> นักวิจัยอิสระ ผู้สนใจการแลกเปลี่ยนเรียนรู้และพัฒนากฎหมายการศึกษาของประเทศให้สอดคล้องกับบริบทและความเปลี่ยนแปลงของสังคม เศรษฐกิจ และเทคโนโลยี</p>
          <p>โครงการนี้ตั้งใจเชื่อมโยงตัวบทกฎหมายเข้ากับแนวคิด นโยบาย และประสบการณ์ของประเทศต่าง ๆ เพื่อสร้างฐานความรู้ที่เข้าถึงง่ายและสนับสนุนการพัฒนามาตรฐานการศึกษาไทยให้เป็นที่ยอมรับในระดับสากล</p>
          <div className="principles"><span>อิสระ</span><span>อ้างอิงได้</span><span>เปิดกว้าง</span><span>เรียนรู้ร่วมกัน</span></div>
        </div>
      </section>

      <section className="note-section">
        <div><span className="kicker">RESEARCH NOTE</span><h2>กฎหมายคือจุดเริ่มต้น<br/>ไม่ใช่คำตอบทั้งหมด</h2></div>
        <p>ข้อมูลสรุปในเว็บไซต์จัดทำเพื่อการศึกษาและเปรียบเทียบ ไม่ใช่คำแนะนำทางกฎหมาย ผู้ใช้ควรตรวจสอบตัวบทฉบับปัจจุบันจากฐานข้อมูลทางการ และพิจารณาบริบททางประวัติศาสตร์ สถาบัน และวัฒนธรรมของแต่ละประเทศประกอบเสมอ</p>
      </section>

      <footer>
        <div className="footer-brand"><span className="brand-seal inverse"><span>EA</span></span><div><b>EduLex Atlas</b><small>Global Education Law Reference</small></div></div>
        <div className="footer-links"><a href="#library">คลังกฎหมาย</a><a href="#framework">กรอบเปรียบเทียบ</a><a href="#about">ผู้จัดทำ</a></div>
        <div className="footer-meta"><span>© 2026 Boorapatis Ploysuwan</span><span>สร้างขึ้นเพื่อการศึกษาและการวิจัย</span></div>
      </footer>

      {selected.length > 0 && <div className="compare-dock">
        <div><span className="dock-icon">≋</span><p><b>รายการเปรียบเทียบ</b><small>เลือกได้สูงสุด 3 ประเทศ</small></p></div>
        <div className="dock-items">{selectedLaws.map((law) => <span key={law.id}><i>{law.flag}</i>{law.country}<button onClick={() => toggleCompare(law.id)} aria-label={`นำ ${law.country} ออกจากรายการ`}>×</button></span>)}</div>
        <button className="dock-action" onClick={() => document.getElementById("comparison-dialog")?.showModal()} disabled={selected.length < 2}>เปรียบเทียบ {selected.length} ประเทศ <span>→</span></button>
      </div>}

      <dialog id="comparison-dialog" className="comparison-dialog">
        <form method="dialog"><button className="dialog-close" aria-label="ปิด">×</button></form>
        <span className="kicker">SIDE-BY-SIDE VIEW</span><h2>เปรียบเทียบระบบกฎหมายการศึกษา</h2>
        <div className="comparison-table">
          <div className="compare-row labels"><b>มิติ</b>{selectedLaws.map((law) => <b key={law.id}>{law.flag} {law.country}</b>)}</div>
          {([['ระบบการบริหาร','system'],['ขอบเขต','level'],['ปีประกาศใช้','year'],['ภาษาที่เข้าถึงได้','language']] as const).map(([label,key]) => <div className="compare-row" key={key}><span>{label}</span>{selectedLaws.map((law) => <p key={law.id}>{law[key]}</p>)}</div>)}
          <div className="compare-row"><span>ประเด็นเด่น</span>{selectedLaws.map((law) => <p key={law.id}>{law.themes.join(" · ")}</p>)}</div>
        </div>
      </dialog>

      {activeLaw && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setActiveLaw(null)}>
        <section className="law-modal" role="dialog" aria-modal="true" aria-labelledby="law-modal-title">
          <button className="modal-close" onClick={() => setActiveLaw(null)} aria-label="ปิดรายละเอียด">×</button>
          <div className="modal-hero" style={{"--modal-accent": activeLaw.color} as React.CSSProperties}>
            <span className="flag-disc">{activeLaw.flag}</span><span className="kicker light">{activeLaw.region} · {activeLaw.year}</span>
            <h2 id="law-modal-title">{activeLaw.title}</h2><p>{activeLaw.localTitle}</p>
          </div>
          <div className="modal-body">
            <div className="modal-summary"><span>สาระสำคัญโดยสรุป</span><p>{activeLaw.summary}</p></div>
            {activeLaw.related && <div className="related-laws"><span>กฎหมายสำคัญที่ควรอ่านร่วมกัน</span><ul>{activeLaw.related.map((item) => <li key={item}>{item}</li>)}</ul></div>}
            <dl><div><dt>ระบบบริหาร</dt><dd>{activeLaw.system}</dd></div><div><dt>ขอบเขต</dt><dd>{activeLaw.level}</dd></div><div><dt>ภาษา</dt><dd>{activeLaw.language}</dd></div><div><dt>สถานะข้อมูล</dt><dd>{activeLaw.updated}</dd></div></dl>
            <div className="modal-tags">{activeLaw.themes.map((theme) => <span key={theme}>{theme}</span>)}</div>
            <a className="source-link" href={activeLaw.url} target="_blank" rel="noreferrer"><span><small>แหล่งข้อมูลทางการ</small><b>{activeLaw.source}</b></span><strong>เปิดเอกสารต้นฉบับ ↗</strong></a>
          </div>
        </section>
      </div>}
    </main>
  );
}
