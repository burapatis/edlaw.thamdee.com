"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_COMPARE,
  allThemes,
  comparePresets,
  findLaw,
  frameworkDimensions,
  glossary,
  jurisdictionCount,
  laws,
  parseCompareIds,
  regionCount,
  regions,
  systems,
  type Law,
} from "./data/laws";

type RegionFilter = (typeof regions)[number];
type SystemFilter = (typeof systems)[number];

function Mark({ label }: { label: string }) {
  return <span className="mark" aria-hidden="true">{label}</span>;
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    law: findLaw(params.get("law")),
    selected: parseCompareIds(params.get("compare")),
    viewCompare: params.get("view") === "compare",
  };
}

function writeUrlState(next: {
  lawId?: string | null;
  selected?: string[];
  viewCompare?: boolean;
}) {
  const url = new URL(window.location.href);
  if (next.lawId) url.searchParams.set("law", next.lawId);
  else url.searchParams.delete("law");
  if (next.selected && next.selected.length > 0) {
    url.searchParams.set("compare", next.selected.join(","));
  } else {
    url.searchParams.delete("compare");
  }
  if (next.viewCompare) url.searchParams.set("view", "compare");
  else url.searchParams.delete("view");
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function scrollToLibrary() {
  document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionFilter>("ทั้งหมด");
  const [system, setSystem] = useState<SystemFilter>("ทั้งหมด");
  const [theme, setTheme] = useState("ทั้งหมด");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeLaw, setActiveLaw] = useState<Law | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const lawDialogRef = useRef<HTMLDialogElement>(null);
  const compareDialogRef = useRef<HTMLDialogElement>(null);
  const noticeTimer = useRef<number | null>(null);
  const skipUrlWrite = useRef(true);
  const compareReady = useRef(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return laws.filter((law) => {
      const regionMatch = region === "ทั้งหมด" || law.region === region;
      const systemMatch = system === "ทั้งหมด" || law.system === system;
      const themeMatch = theme === "ทั้งหมด" || law.themes.includes(theme);
      const searchMatch = !q || [law.country, law.title, law.localTitle, law.summary, law.system, law.kind, ...law.themes]
        .join(" ")
        .toLowerCase()
        .includes(q);
      return regionMatch && systemMatch && themeMatch && searchMatch;
    });
  }, [query, region, system, theme]);

  const selectedLaws = selected
    .map((id) => findLaw(id))
    .filter((law): law is Law => law !== null);

  const announce = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const openLaw = (law: Law) => {
    setActiveLaw(law);
    writeUrlState({ lawId: law.id, selected, viewCompare: false });
  };

  const closeLaw = () => {
    setActiveLaw(null);
    writeUrlState({ lawId: null, selected, viewCompare: compareDialogRef.current?.open ?? false });
  };

  const toggleCompare = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= MAX_COMPARE) {
        announce(`เลือกได้สูงสุด ${MAX_COMPARE} รายการ กรุณานำรายการอื่นออกก่อน`);
        return current;
      }
      return [...current, id];
    });
  };

  const resetFilters = () => {
    setQuery("");
    setRegion("ทั้งหมด");
    setSystem("ทั้งหมด");
    setTheme("ทั้งหมด");
  };

  const openCompare = () => {
    if (selected.length < 2) return;
    compareDialogRef.current?.showModal();
    writeUrlState({ lawId: activeLaw?.id ?? null, selected, viewCompare: true });
  };

  const applyPreset = (ids: string[]) => {
    setMobileMenu(false);
    setActiveLaw(null);
    setSelected(ids);
    window.setTimeout(() => {
      compareDialogRef.current?.showModal();
      writeUrlState({ lawId: null, selected: ids, viewCompare: true });
    }, 0);
  };

  const copyLawLink = async (id: string) => {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("law", id);
    try {
      await navigator.clipboard.writeText(url.toString());
      announce("คัดลอกลิงก์รายการนี้แล้ว");
    } catch {
      announce("คัดลอกลิงก์ไม่สำเร็จ กรุณาคัดลอกจากแถบที่อยู่");
    }
  };

  useEffect(() => {
    const apply = (openCompareIfRequested: boolean) => {
      const next = readUrlState();
      skipUrlWrite.current = true;
      setActiveLaw(next.law);
      setSelected(next.selected);
      if (openCompareIfRequested && next.viewCompare && next.selected.length >= 2) {
        compareDialogRef.current?.showModal();
      }
    };
    apply(true);
    const onPop = () => apply(true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (skipUrlWrite.current) {
      skipUrlWrite.current = false;
      return;
    }
    writeUrlState({
      lawId: activeLaw?.id ?? null,
      selected,
      viewCompare: compareDialogRef.current?.open ?? false,
    });
  }, [selected, activeLaw]);

  useEffect(() => {
    const dialog = lawDialogRef.current;
    if (!dialog) return;
    const dismissOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", dismissOnBackdrop);
    return () => dialog.removeEventListener("click", dismissOnBackdrop);
  }, []);

  useEffect(() => {
    const dialog = lawDialogRef.current;
    if (!dialog) return;
    if (activeLaw && !dialog.open) dialog.showModal();
    if (!activeLaw && dialog.open) dialog.close();
  }, [activeLaw]);

  useEffect(() => {
    if (!compareReady.current) {
      compareReady.current = true;
      return;
    }
    if (selected.length < 2) compareDialogRef.current?.close();
  }, [selected]);

  useEffect(() => {
    if (!mobileMenu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenu]);

  useEffect(() => () => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
  }, []);

  return (
    <main>
      <a className="skip-link" href="#library">ข้ามไปยังคลังกฎหมาย</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="หน้าแรก EduLex Atlas">
          <span className="brand-seal"><span>EA</span></span>
          <span className="brand-copy"><b>EduLex Atlas</b><small>คลังกฎหมายการศึกษาโลก</small></span>
        </a>
        <nav className={mobileMenu ? "nav open" : "nav"} id="site-nav" aria-label="เมนูหลัก">
          <a href="#library" onClick={() => setMobileMenu(false)}>คลังกฎหมาย</a>
          <a href="#framework" onClick={() => setMobileMenu(false)}>กรอบเปรียบเทียบ</a>
          <a href="#glossary" onClick={() => setMobileMenu(false)}>คำศัพท์</a>
          <a href="#about" onClick={() => setMobileMenu(false)}>เกี่ยวกับโครงการ</a>
        </nav>
        <a className="header-cta" href="#library">เริ่มค้นคว้า <span>↗</span></a>
        <button
          type="button"
          className="menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="เปิดหรือปิดเมนู"
          aria-expanded={mobileMenu}
          aria-controls="site-nav"
        >
          <i></i><i></i>
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        <div className="hero-content">
          <div className="eyebrow"><span></span> Comparative Education Law Observatory</div>
          <h1>เข้าใจกฎหมายการศึกษา<br/><em>ผ่านมุมมองของโลก</em></h1>
          <p className="hero-lead">แหล่งรวมกฎหมายแม่บทและข้อมูลอ้างอิงจากระบบการศึกษาชั้นนำ เพื่อการศึกษา ค้นคว้า วิเคราะห์ เปรียบเทียบ และต่อยอดสู่บริบทไทย</p>
          <form
            className="hero-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              scrollToLibrary();
            }}
          >
            <Mark label="⌕" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาประเทศ ชื่อกฎหมาย หรือประเด็นสำคัญ…"
              aria-label="ค้นหากฎหมายการศึกษา"
            />
            <button type="submit">ค้นหา</button>
          </form>
          <div className="hero-notes"><span>{jurisdictionCount} เขตอำนาจ</span><span>{regionCount} ภูมิภาค</span><span>แหล่งข้อมูลภาครัฐ</span></div>
        </div>
        <aside className="hero-feature" aria-label="กฎหมายแนะนำ">
          <div className="feature-top"><span>เอกสารแนะนำ</span><span className="live-dot">ตรวจสอบแล้ว</span></div>
          <div className="feature-country"><span className="flag-disc">FI</span><div><small>FINLAND</small><h2>Basic Education Act</h2></div></div>
          <blockquote>“การศึกษาที่มีคุณภาพ คือสิทธิที่ทุกคนเข้าถึงได้ ไม่ใช่สิทธิพิเศษ”</blockquote>
          <div className="feature-meta"><div><small>ประกาศใช้</small><b>1998</b></div><div><small>ฉบับแปล</small><b>English</b></div></div>
          <button type="button" onClick={() => openLaw(laws[0])}>สำรวจสาระสำคัญ <span>→</span></button>
        </aside>
      </section>

      <section className="purpose-strip" aria-label="แนวทางการใช้คลัง">
        <div><Mark label="01"/><span><b>รวบรวม</b><small>ต้นฉบับจากแหล่งทางการ</small></span></div>
        <div><Mark label="02"/><span><b>ทำความเข้าใจ</b><small>สาระสำคัญอย่างเป็นระบบ</small></span></div>
        <div><Mark label="03"/><span><b>เปรียบเทียบ</b><small>โครงสร้างและแนวคิดเชิงนโยบาย</small></span></div>
        <div><Mark label="04"/><span><b>ประยุกต์ใช้</b><small>ต่อยอดสู่การพัฒนากฎหมายไทย</small></span></div>
      </section>

      <section className="glossary-section" id="glossary">
        <div className="section-heading">
          <div>
            <span className="kicker">GLOSSARY</span>
            <h2>คำศัพท์ที่ใช้ในคลังนี้</h2>
            <p>อ่านความหมายสั้น ๆ ก่อนเทียบระบบ จะได้ไม่ปะปนกฎหมายแม่บทกับประมวลทั้งฉบับ หรือสหพันธรัฐกับระบบรวมศูนย์</p>
          </div>
        </div>
        <dl className="glossary-list">
          {glossary.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.definition}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="library-section" id="library">
        <div className="section-heading">
          <div><span className="kicker">CURATED LIBRARY</span><h2>คลังกฎหมายการศึกษา</h2><p>คัดสรรจากฐานข้อมูลกฎหมายของรัฐและแหล่งอ้างอิงที่เชื่อถือได้</p></div>
          <div className="result-count"><strong>{String(filtered.length).padStart(2, "0")}</strong><span>รายการ<br/>ที่ค้นพบ</span></div>
        </div>
        <div className="library-toolbar">
          <div className="filter-tabs" role="group" aria-label="กรองตามภูมิภาค">
            {regions.map((item) => (
              <button
                type="button"
                key={item}
                className={region === item ? "active" : ""}
                aria-pressed={region === item}
                onClick={() => setRegion(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="small-search">
            <Mark label="⌕"/>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาในคลัง…"
              aria-label="ค้นหาในคลังกฎหมาย"
            />
          </label>
        </div>
        <div className="library-filters">
          <div className="filter-tabs" role="group" aria-label="กรองตามระบบบริหาร">
            {systems.map((item) => (
              <button
                type="button"
                key={item}
                className={system === item ? "active" : ""}
                aria-pressed={system === item}
                onClick={() => setSystem(item)}
              >
                {item === "ทั้งหมด" ? "ทุกระบบบริหาร" : item}
              </button>
            ))}
          </div>
          <label className="theme-filter">
            <span>ประเด็น</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} aria-label="กรองตามประเด็นสำคัญ">
              <option value="ทั้งหมด">ทุกประเด็น</option>
              {allThemes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="law-grid">
          {filtered.map((law, index) => {
            const isSelected = selected.includes(law.id);
            const compareFull = selected.length >= MAX_COMPARE && !isSelected;
            return (
              <article className="law-card" key={law.id} style={{"--accent": law.color} as React.CSSProperties}>
                <div className="card-head">
                  <span className="flag-disc small">{law.flag}</span>
                  <button
                    type="button"
                    className={isSelected ? "compare active" : "compare"}
                    onClick={() => toggleCompare(law.id)}
                    disabled={compareFull}
                    title={compareFull ? `เลือกได้สูงสุด ${MAX_COMPARE} รายการ` : undefined}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "ยกเลิก" : "เลือก"} ${law.country} เพื่อเปรียบเทียบ`}
                  >
                    <span>{isSelected ? "✓" : "+"}</span> เปรียบเทียบ
                  </button>
                </div>
                <div className="card-country">{law.country}<span>{law.region}</span></div>
                <h3>{law.title}</h3>
                <p className="local-title">{law.localTitle}</p>
                <p className="card-kind">{law.kind}</p>
                <p className="card-summary">{law.summary}</p>
                <div className="tags">{law.themes.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div>
                <div className="card-foot">
                  <span><small>ปีประกาศใช้</small><b>{law.year}</b></span>
                  <button type="button" onClick={() => openLaw(law)}>ดูรายละเอียด <span>↗</span></button>
                </div>
                <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
              </article>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <span>⌕</span>
            <h3>ยังไม่พบรายการที่ตรงกัน</h3>
            <p>ลองใช้คำค้นอื่น หรือล้างตัวกรองภูมิภาค ระบบบริหาร และประเด็น</p>
            <button type="button" onClick={resetFilters}>ล้างตัวกรอง</button>
          </div>
        )}
      </section>

      <section className="compare-framework" id="framework">
        <div className="framework-title">
          <span className="kicker light">COMPARATIVE FRAMEWORK</span>
          <h2>มองให้ลึกกว่า<br/>ตัวบทกฎหมาย</h2>
          <p>เลือกชุดเทียบสำเร็จรูป หรือกดแต่ละมิติเพื่อเปิดเปรียบเทียบ 3 เขตอำนาจที่เหมาะกับการอ่านเรื่องนั้น คำตอบรายประเทศอยู่ในหน้ารายละเอียดด้วย</p>
          <div className="preset-list">
            {comparePresets.map((preset) => (
              <button type="button" className="preset-chip" key={preset.id} onClick={() => applyPreset(preset.ids)}>
                <b>{preset.title}</b>
                <small>{preset.blurb}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="framework-list">
          {frameworkDimensions.map((item) => {
            const presets = comparePresets.filter((entry) => entry.dimension === item.key);
            const primary = presets[0];
            return (
              <button
                type="button"
                className="framework-item"
                key={item.key}
                onClick={() => primary && applyPreset(primary.ids)}
              >
                <span>{item.no}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.question}</p>
                  {presets.map((preset) => (
                    <em key={preset.id}>ชุดเทียบ: {preset.title}</em>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-portrait">
          <img src="/curator.jpg" alt="Boorapatis Ploysuwan ผู้จัดทำ EduLex Atlas" />
          <span className="portrait-note">Independent Researcher<br/>Bangkok, Thailand</span>
        </div>
        <div className="about-copy">
          <span className="kicker">ABOUT THE CURATOR</span>
          <h2>พื้นที่แลกเปลี่ยนความรู้<br/>เพื่อกฎหมายการศึกษาที่ดีกว่า</h2>
          <p className="about-lead">จัดทำโดย <strong>Boorapatis Ploysuwan</strong> นักวิจัยอิสระ ผู้สนใจการแลกเปลี่ยนเรียนรู้และพัฒนากฎหมายการศึกษาของประเทศให้สอดคล้องกับบริบทและความเปลี่ยนแปลงของสังคม เศรษฐกิจ และเทคโนโลยี</p>
          <p>โครงการนี้ตั้งใจเชื่อมโยงตัวบทกฎหมายเข้ากับแนวคิด นโยบาย และประสบการณ์ของประเทศต่าง ๆ เพื่อสร้างฐานความรู้ที่เข้าถึงง่ายและสนับสนุนการพัฒนามาตรฐานการศึกษาไทยให้เป็นที่ยอมรับในระดับสากล</p>
          <a className="curator-email" href="mailto:burapatis@gmail.com">burapatis@gmail.com</a>
          <div className="principles"><span>อิสระ</span><span>อ้างอิงได้</span><span>เปิดกว้าง</span><span>เรียนรู้ร่วมกัน</span></div>
        </div>
      </section>

      <section className="note-section">
        <div><span className="kicker">RESEARCH NOTE</span><h2>กฎหมายคือจุดเริ่มต้น<br/>ไม่ใช่คำตอบทั้งหมด</h2></div>
        <p>ข้อมูลสรุปในเว็บไซต์จัดทำเพื่อการศึกษาและเปรียบเทียบ ไม่ใช่คำแนะนำทางกฎหมาย ผู้ใช้ควรตรวจสอบตัวบทฉบับปัจจุบันจากฐานข้อมูลทางการ และพิจารณาบริบททางประวัติศาสตร์ สถาบัน และวัฒนธรรมของแต่ละประเทศประกอบเสมอ</p>
      </section>

      <footer>
        <div className="footer-brand"><span className="brand-seal inverse"><span>EA</span></span><div><b>EduLex Atlas</b><small>Global Education Law Reference</small></div></div>
        <div className="footer-links">
          <a href="#library">คลังกฎหมาย</a>
          <a href="#framework">กรอบเปรียบเทียบ</a>
          <a href="#glossary">คำศัพท์</a>
          <a href="#about">ผู้จัดทำ</a>
        </div>
        <div className="footer-meta"><span>© 2026 Boorapatis Ploysuwan</span><a href="mailto:burapatis@gmail.com">burapatis@gmail.com</a><span>สร้างขึ้นเพื่อการศึกษาและการวิจัย</span></div>
      </footer>

      <div className="notice" role="status" aria-live="polite">{notice}</div>

      {selected.length > 0 && (
        <div className="compare-dock">
          <div>
            <span className="dock-icon">≋</span>
            <p><b>รายการเปรียบเทียบ</b><small>เลือกได้สูงสุด {MAX_COMPARE} รายการ</small></p>
          </div>
          <div className="dock-items">
            {selectedLaws.map((law) => (
              <span key={law.id}>
                <i>{law.flag}</i>{law.country}
                <button type="button" onClick={() => toggleCompare(law.id)} aria-label={`นำ ${law.country} ออกจากรายการ`}>×</button>
              </span>
            ))}
          </div>
          <button type="button" className="dock-action" onClick={openCompare} disabled={selected.length < 2}>
            เปรียบเทียบ {selected.length} รายการ <span>→</span>
          </button>
        </div>
      )}

      <dialog
        ref={compareDialogRef}
        className="comparison-dialog"
        aria-labelledby="comparison-title"
        onClose={() => writeUrlState({ lawId: activeLaw?.id ?? null, selected, viewCompare: false })}
      >
        <form method="dialog"><button type="submit" className="dialog-close" aria-label="ปิดตารางเปรียบเทียบ">×</button></form>
        <span className="kicker">SIDE-BY-SIDE VIEW</span>
        <h2 id="comparison-title">เปรียบเทียบระบบกฎหมายการศึกษา</h2>
        <div
          className="comparison-table"
          style={{ "--compare-count": Math.max(selectedLaws.length, 1) } as React.CSSProperties}
        >
          <div className="compare-row labels">
            <b>มิติ</b>
            {selectedLaws.map((law) => <b key={law.id}>{law.flag} {law.country}</b>)}
          </div>
          {([
            ["ประเภทเอกสาร", "kind"],
            ["ระบบการบริหาร", "system"],
            ["ขอบเขต", "level"],
            ["ปีประกาศใช้", "year"],
            ["ภาษาที่เข้าถึงได้", "language"],
          ] as const).map(([label, key]) => (
            <div className="compare-row" key={key}>
              <span>{label}</span>
              {selectedLaws.map((law) => <p key={law.id}>{law[key]}</p>)}
            </div>
          ))}
          <div className="compare-row">
            <span>บริบทสถาบัน</span>
            {selectedLaws.map((law) => <p key={law.id}>{law.context}</p>)}
          </div>
          {frameworkDimensions.map((item) => (
            <div className="compare-row" key={item.key}>
              <span>{item.title}</span>
              {selectedLaws.map((law) => <p key={law.id}>{law.framework[item.key]}</p>)}
            </div>
          ))}
          <div className="compare-row">
            <span>ข้อควรระวังเมื่อเทียบกับไทย</span>
            {selectedLaws.map((law) => <p key={law.id}>{law.caution}</p>)}
          </div>
          <div className="compare-row">
            <span>ประเด็นเด่น</span>
            {selectedLaws.map((law) => <p key={law.id}>{law.themes.join(" · ")}</p>)}
          </div>
          <div className="compare-row">
            <span>แหล่งข้อมูล</span>
            {selectedLaws.map((law) => (
              <p key={law.id}>
                <a href={law.url} target="_blank" rel="noopener noreferrer">{law.source}</a>
              </p>
            ))}
          </div>
        </div>
      </dialog>

      <dialog
        ref={lawDialogRef}
        className="law-dialog"
        aria-labelledby="law-modal-title"
        onClose={closeLaw}
      >
        {activeLaw && (
          <section className="law-modal">
            <button type="button" className="modal-close" onClick={() => lawDialogRef.current?.close()} aria-label="ปิดรายละเอียด">×</button>
            <div className="modal-hero" style={{"--modal-accent": activeLaw.color} as React.CSSProperties}>
              <span className="flag-disc">{activeLaw.flag}</span>
              <span className="kicker light">{activeLaw.region} · {activeLaw.kind} · {activeLaw.year}</span>
              <h2 id="law-modal-title">{activeLaw.title}</h2>
              <p>{activeLaw.localTitle}</p>
            </div>
            <div className="modal-body">
              <div className="modal-summary"><span>สาระสำคัญโดยสรุป</span><p>{activeLaw.summary}</p></div>
              <div className="modal-summary"><span>บริบทสถาบัน</span><p>{activeLaw.context}</p></div>
              <div className="framework-answers">
                <span>ตอบกรอบเปรียบเทียบ {frameworkDimensions.length} มิติ</span>
                <ol>
                  {frameworkDimensions.map((item) => (
                    <li key={item.key}>
                      <b>{item.title}</b>
                      <p>{activeLaw.framework[item.key]}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="caution-box">
                <span>ข้อควรระวังเมื่อเทียบกับไทย</span>
                <p>{activeLaw.caution}</p>
              </div>
              {activeLaw.related && (
                <div className="related-laws">
                  <span>กฎหมายสำคัญที่ควรอ่านร่วมกัน</span>
                  <ul>
                    {activeLaw.related.map((item) => (
                      <li key={item.title}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <dl>
                <div><dt>ประเภทเอกสาร</dt><dd>{activeLaw.kind}</dd></div>
                <div><dt>ระบบบริหาร</dt><dd>{activeLaw.system}</dd></div>
                <div><dt>ขอบเขต</dt><dd>{activeLaw.level}</dd></div>
                <div><dt>ปีประกาศใช้</dt><dd>{activeLaw.year}</dd></div>
                <div><dt>ภาษา</dt><dd>{activeLaw.language}</dd></div>
                <div><dt>สถานะที่ตรวจสอบ</dt><dd>{activeLaw.updated}</dd></div>
              </dl>
              <div className="modal-tags">{activeLaw.themes.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="modal-actions">
                <a className="source-link" href={activeLaw.url} target="_blank" rel="noopener noreferrer">
                  <span><small>แหล่งข้อมูลทางการ</small><b>{activeLaw.source}</b></span>
                  <strong>เปิดเอกสารต้นฉบับ ↗</strong>
                </a>
                <button type="button" className="copy-link" onClick={() => copyLawLink(activeLaw.id)}>คัดลอกลิงก์รายการนี้</button>
              </div>
            </div>
          </section>
        )}
      </dialog>
    </main>
  );
}
