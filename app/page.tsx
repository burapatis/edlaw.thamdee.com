"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_COMPARE,
  aimsLocusGuides,
  aimsLocusLabel,
  allThemes,
  catalogLimits,
  citedStacks,
  comparePresets,
  comparisonTraps,
  documentKindGuides,
  documentReading,
  drafterBriefs,
  drafterPhrases,
  findBrief,
  findGap,
  findHeritage,
  findLaw,
  findNeaTopic,
  findPhrase,
  findPreset,
  findStack,
  findTrap,
  frameworkDimensions,
  glossary,
  heritageReadings,
  jurisdictionCount,
  kindFilters,
  kindLayer,
  laws,
  lawsByAimsLocus,
  lawsByKindLayer,
  librarySorts,
  matchesKindFilter,
  neaTopics,
  onePassSteps,
  parseBriefId,
  parseCompareIds,
  principleGaps,
  readingPaths,
  regions,
  rewriteTimeline,
  sortLaws,
  systems,
  type KindFilter,
  type Law,
  type LibrarySort,
  type StackLayer,
} from "./data/laws";

type RegionFilter = (typeof regions)[number];
type SystemFilter = (typeof systems)[number];

function Mark({ label }: { label: string }) {
  return <span className="mark" aria-hidden="true">{label}</span>;
}

function stackLayerContent(law: Law, layer: StackLayer) {
  if ("current" in layer && layer.current) {
    return { title: law.title, href: null, current: true as const, catalogId: undefined };
  }
  if ("relatedIndex" in layer) {
    const related = law.related?.[layer.relatedIndex];
    return related
      ? { title: related.title, href: related.url, current: false as const, catalogId: undefined }
      : { title: layer.label, href: null, current: false as const, catalogId: undefined };
  }
  if ("catalogId" in layer) {
    const entry = findLaw(layer.catalogId);
    return {
      title: entry?.title ?? layer.label,
      href: null,
      current: false as const,
      catalogId: layer.catalogId,
    };
  }
  return { title: layer.note, href: null, current: false as const, catalogId: undefined };
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    law: findLaw(params.get("law")),
    selected: parseCompareIds(params.get("compare")),
    viewCompare: params.get("view") === "compare",
    brief: parseBriefId(params.get("brief")),
  };
}

function writeUrlState(next: {
  lawId?: string | null;
  selected?: string[];
  viewCompare?: boolean;
  brief?: string;
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
  if (next.brief) url.searchParams.set("brief", next.brief);
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function scrollToLibrary() {
  document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<RegionFilter>("ทั้งหมด");
  const [system, setSystem] = useState<SystemFilter>("ทั้งหมด");
  const [kind, setKind] = useState<KindFilter>("ทั้งหมด");
  const [theme, setTheme] = useState("ทั้งหมด");
  const [librarySort, setLibrarySort] = useState<LibrarySort>("catalog");
  const [selected, setSelected] = useState<string[]>([]);
  const [briefTopic, setBriefTopic] = useState(drafterBriefs[0]?.topicId ?? "aims");
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
      const kindMatch = matchesKindFilter(law, kind);
      const themeMatch = theme === "ทั้งหมด" || law.themes.includes(theme);
      const searchMatch = !q || [law.country, law.title, law.localTitle, law.summary, law.system, law.kind, ...law.themes]
        .join(" ")
        .toLowerCase()
        .includes(q);
      return regionMatch && systemMatch && kindMatch && themeMatch && searchMatch;
    });
  }, [query, region, system, kind, theme]);

  const visibleLaws = useMemo(() => sortLaws(filtered, librarySort), [filtered, librarySort]);

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (region !== "ทั้งหมด") chips.push({ key: "region", label: region, clear: () => setRegion("ทั้งหมด") });
    if (system !== "ทั้งหมด") chips.push({ key: "system", label: system, clear: () => setSystem("ทั้งหมด") });
    if (kind !== "ทั้งหมด") chips.push({ key: "kind", label: kind, clear: () => setKind("ทั้งหมด") });
    if (theme !== "ทั้งหมด") chips.push({ key: "theme", label: theme, clear: () => setTheme("ทั้งหมด") });
    const q = query.trim();
    if (q) chips.push({ key: "query", label: `ค้นหา: ${q}`, clear: () => setQuery("") });
    return chips;
  }, [region, system, kind, theme, query]);

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
    setKind("ทั้งหมด");
    setTheme("ทั้งหมด");
  };

  const showKindInLibrary = (next: KindFilter) => {
    setKind(next);
    window.setTimeout(scrollToLibrary, 0);
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

  const followPathStep = (step: {
    presetId?: string;
    lawId?: string;
    href?: string;
  }) => {
    if (step.presetId) {
      const preset = findPreset(step.presetId);
      if (preset) applyPreset(preset.ids);
      return;
    }
    if (step.lawId) {
      const law = findLaw(step.lawId);
      if (law) openLaw(law);
      return;
    }
    if (step.href) {
      document.getElementById(step.href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  const openBrief = (topicId: string) => {
    setBriefTopic(parseBriefId(topicId));
    window.setTimeout(() => {
      document.getElementById("drafter-brief")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const copyBrief = async () => {
    const brief = findBrief(briefTopic);
    const topic = findNeaTopic(brief?.topicId);
    if (!brief || !topic) return;
    const trap = findTrap(brief.trapId);
    const gap = findGap(brief.gapId);
    const stack = findStack(brief.stackLawId);
    const stackLaw = findLaw(brief.stackLawId);
    const heritage = findHeritage(brief.heritageLawId);
    const heritageLaw = findLaw(brief.heritageLawId);
    const mechanisms = brief.thaiMechanismIds
      .map((id) => findLaw(id))
      .filter((law): law is Law => Boolean(law));
    const sameLayer = topic.sameLayerIds
      .map((id) => findLaw(id))
      .filter((law): law is Law => Boolean(law));
    const phrases = brief.phraseVerbs
      .map((verb) => findPhrase(verb))
      .filter((phrase): phrase is NonNullable<ReturnType<typeof findPhrase>> => Boolean(phrase));
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "drafter-brief";
    url.searchParams.set("brief", brief.topicId);
    const text = [
      "EduLex Atlas — ใบงานผู้ร่าง",
      topic.title,
      "",
      "สิ่งที่ พ.ร.บ. 2542 เขียน",
      topic.thaiWrites,
      "",
      "ฉบับต่างประเทศที่พูดชั้นเดียวกัน",
      ...sameLayer.map((law) => `- ${law.flag} ${law.country} — ${law.title}`),
      "",
      "ห้ามลอก",
      topic.doNotCopy,
      "",
      mechanisms.length > 0 ? "กลไกไทยในคลัง" : "",
      ...mechanisms.map((law) => `- ${law.flag} ${law.country} — ${law.title}`),
      mechanisms.length > 0 ? "" : "",
      trap ? "กับดักการเทียบ" : "",
      trap ? `${trap.title}: ${trap.whyThai}` : "",
      trap ? "" : "",
      gap ? "ช่องว่างระหว่างหลักกับกลไก" : "",
      gap ? `${gap.principle} / ${gap.mechanism}` : "",
      gap ? "" : "",
      stack && stackLaw ? `แผนภาพชั้น: ${stackLaw.flag} ${stackLaw.country}` : "",
      stack ? stack.role : "",
      stack ? "" : "",
      heritage && heritageLaw ? `มรดกในตัวบท: ${heritageLaw.flag} ${heritageLaw.country}` : "",
      heritage ? heritage.heritage : "",
      heritage ? "" : "",
      phrases.length > 0 ? "กริยาที่ใช้ร่าง" : "",
      ...phrases.map((phrase) => `- ${phrase.verb}: ${phrase.clause}`),
      phrases.length > 0 ? "" : "",
      "คำถามสำหรับผู้ร่าง",
      topic.drafterQuestion,
      "",
      "สิ่งที่ควรทำต่อ",
      brief.takeaway,
      "",
      url.toString(),
    ]
      .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
      .join("\n")
      .trim();
    try {
      await navigator.clipboard.writeText(text);
      announce("คัดลอกใบงานนี้แล้ว");
    } catch {
      announce("คัดลอกใบงานไม่สำเร็จ กรุณาคัดลอกจากหน้าเว็บ");
    }
  };

  useEffect(() => {
    const apply = (openCompareIfRequested: boolean) => {
      const next = readUrlState();
      skipUrlWrite.current = true;
      setActiveLaw(next.law);
      setSelected(next.selected);
      setBriefTopic(next.brief);
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
      brief: briefTopic,
    });
  }, [selected, activeLaw, briefTopic]);

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

  const activeBrief = findBrief(briefTopic);
  const activeBriefTopic = findNeaTopic(activeBrief?.topicId);
  const activeBriefTrap = findTrap(activeBrief?.trapId);
  const activeBriefGap = findGap(activeBrief?.gapId);
  const activeBriefStack = findStack(activeBrief?.stackLawId);
  const activeBriefStackLaw = findLaw(activeBrief?.stackLawId);
  const activeBriefHeritage = findHeritage(activeBrief?.heritageLawId);
  const activeBriefHeritageLaw = findLaw(activeBrief?.heritageLawId);

  return (
    <main>
      <a className="skip-link" href="#library">ข้ามไปยังคลังกฎหมาย</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="หน้าแรก EduLex Atlas">
          <span className="brand-seal"><span>EA</span></span>
          <span className="brand-copy"><b>EduLex Atlas</b><small>หอดูดาวกฎหมายแม่บทการศึกษา</small></span>
        </a>
        <nav className={mobileMenu ? "nav open" : "nav"} id="site-nav" aria-label="เมนูหลัก">
          <a href="#one-pass" onClick={() => setMobileMenu(false)}>รอบหนึ่ง</a>
          <a href="#how-to-read" onClick={() => setMobileMenu(false)}>วิธีอ่าน</a>
          <a href="#drafter-brief" onClick={() => setMobileMenu(false)}>ใบงานผู้ร่าง</a>
          <a href="#library" onClick={() => setMobileMenu(false)}>คลังกฎหมาย</a>
          <a href="#about" onClick={() => setMobileMenu(false)}>เกี่ยวกับโครงการ</a>
        </nav>
        <a className="header-cta" href="#drafter-brief">ใบงานผู้ร่าง <span>↗</span></a>
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
          <div className="eyebrow"><span></span> Framework Education Law Observatory</div>
          <h1>อ่านกฎหมายแม่บทการศึกษา<br/><em>เป็นชั้นของตัวบท</em></h1>
          <p className="hero-lead">คลังนี้ไม่ได้เล่าว่าระบบการศึกษาประเทศใดเก่งกว่า แต่เปิดกฎหมายแม่บทในฐานะเครื่องมือจัดอำนาจ หน้าที่ และจุดมุ่งหมาย แล้วเทียบกับพระราชบัญญัติการศึกษาแห่งชาติไทยทีละชั้นของเอกสาร</p>
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
          <div className="hero-paths" aria-label="ทางเข้าคลัง">
            <a href="#one-pass">เรียนจบรอบหนึ่ง</a>
            <a href="#path-learner">ผู้เรียน</a>
            <a href="#path-policy">ผู้บริหาร</a>
            <a href="#path-drafter">ผู้พัฒนากฎหมายไทย</a>
          </div>
          <div className="hero-notes"><span>{jurisdictionCount} เขตอำนาจ</span><span>แยกชนิดเอกสาร</span><span>ไม่จัดอันดับประเทศ</span></div>
        </div>
        <aside className="hero-feature" aria-label="ขั้วเทียบหลัก">
          <div className="feature-top"><span>ขั้วเทียบหลัก</span><span className="live-dot">ไม่จัดอันดับ</span></div>
          <div className="feature-country"><span className="flag-disc">TH</span><div><small>THAILAND</small><h2>พ.ร.บ.การศึกษาแห่งชาติ</h2></div></div>
          <blockquote>คลังนี้เทียบต่างประเทศกับกฎหมายแม่บทไทย ถอดจากฉบับที่เลือก ไม่เติมชื่อเสียงประเทศลงในคำตอบ</blockquote>
          <div className="feature-meta"><div><small>ประกาศใช้</small><b>พ.ศ. 2542</b></div><div><small>ชนิดเอกสาร</small><b>กฎหมายแม่บท</b></div></div>
          <button type="button" onClick={() => { const law = findLaw("thailand"); if (law) openLaw(law); }}>อ่านฉบับไทย <span>→</span></button>
        </aside>
      </section>

      <section className="purpose-strip" aria-label="หลักการอ่านคลังนี้">
        <a href="#how-to-read"><Mark label="01"/><span><b>ชนิดเอกสาร</b><small>แม่บท ประมวล รัฐธรรมนูญ หรือกฎหมายท้องถิ่น</small></span></a>
        <a href="#silence-map"><Mark label="02"/><span><b>จุดมุ่งหมาย</b><small>กฎหมายประกาศว่าการศึกษาเพื่ออะไร หรือเงียบ</small></span></a>
        <a href="#traps"><Mark label="03"/><span><b>กับดักการเทียบ</b><small>ห้ามอ่านฉบับหนึ่งแทนทั้งระบบหรือทั้งประเทศ</small></span></a>
        <a href="#nea-map"><Mark label="04"/><span><b>ต่อยอดสู่ พ.ร.บ. ไทย</b><small>เทียบทีละชั้น แล้วออกด้วยใบงานผู้ร่าง</small></span></a>
      </section>

      <section className="one-pass-section" id="one-pass">
        <div className="section-heading">
          <div>
            <span className="kicker">ONE COMPLETE PASS</span>
            <h2>เรียนจบรอบหนึ่งบนเว็บนี้</h2>
            <p>ถ้ามีเวลาครั้งเดียว เดินห้าขั้นนี้ จะได้คำตอบสามข้อ: กำลังถือเอกสารชนิดใด ห้ามเทียบกับอะไร และประเด็นนี้สัมพันธ์กับ พ.ร.บ. 2542 ตรงไหน</p>
          </div>
        </div>
        <ol className="one-pass-steps">
          {onePassSteps.map((step) => (
            <li key={step.no}>
              <span>{step.no}</span>
              <h3>{step.label}</h3>
              <p>{step.detail}</p>
              <button type="button" onClick={() => followPathStep(step)}>ไปขั้นนี้</button>
            </li>
          ))}
        </ol>
      </section>

      <section className="learn-section" id="how-to-read">
        <div className="section-heading">
          <div>
            <span className="kicker">HOW TO HOLD A DOCUMENT</span>
            <h2>กำลังถือเอกสารชนิดใด</h2>
            <p>ป้ายชนิดเอกสารในคลังนี้เป็นชั้นอ่าน ไม่ใช่แค่หมวดหมู่ คำถามแรกคือฉบับนี้ตอบอะไรได้ และห้ามอ่านแทนอะไร</p>
          </div>
        </div>
        <div className="kind-guide-grid">
          {documentKindGuides.map((guide) => {
            const count = lawsByKindLayer(guide.layer).length;
            return (
              <article key={guide.layer}>
                <span>{String(count).padStart(2, "0")} ฉบับ</span>
                <h3>{guide.title}</h3>
                <p><b>ตอบได้</b> {guide.can}</p>
                <p><b>ตอบไม่ได้</b> {guide.cannot}</p>
                <button type="button" onClick={() => showKindInLibrary(guide.filter)}>ดูในคลัง</button>
              </article>
            );
          })}
        </div>

        <div className="silence-map" id="silence-map">
          <div className="section-heading">
            <div>
              <span className="kicker">AIMS SILENCE MAP</span>
              <h2>แผนที่ความเงียบเรื่องจุดมุ่งหมาย</h2>
              <p>คลังนี้ไม่เติมปรัชญาให้ประเทศจากสโลแกนกระทรวง หากฉบับที่เปิดไม่มีมาตราว่าการศึกษาเพื่ออะไร จะติดป้ายว่าเงียบหรืออยู่คนละชั้น</p>
            </div>
          </div>
          <div className="silence-grid">
            {aimsLocusGuides.map((group) => {
              const groupLaws = lawsByAimsLocus(group.key);
              const preset = findPreset(group.presetId);
              return (
                <article key={group.key}>
                  <span>{String(groupLaws.length).padStart(2, "0")} ฉบับ</span>
                  <h3>{group.title}</h3>
                  <p>{group.question}</p>
                  <small>{group.blurb}</small>
                  <ul>
                    {groupLaws.map((law) => (
                      <li key={law.id}>
                        <button type="button" onClick={() => openLaw(law)}>
                          <i>{law.flag}</i>
                          {law.country}
                        </button>
                      </li>
                    ))}
                  </ul>
                  {preset && (
                    <button type="button" className="silence-preset" onClick={() => applyPreset(preset.ids)}>
                      เทียบชุด: {preset.title}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <div className="learn-glossary" id="glossary">
          <div className="section-heading">
            <div>
              <span className="kicker">GLOSSARY</span>
              <h2>คำศัพท์ที่ใช้ตอนเทียบ</h2>
              <p>อ่านความหมายสั้น ๆ ในเส้นทางเดียวกันกับชนิดเอกสาร จะได้ไม่ปะปนแม่บทกับประมวล หรือสหพันธรัฐกับระบบรวมศูนย์</p>
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
        </div>
      </section>

      <section className="guide-section" id="reading-paths">
        <div className="section-heading">
          <div>
            <span className="kicker">READING PATHS</span>
            <h2>เส้นทางอ่านสามแบบ</h2>
            <p>เว็บนี้ไม่เริ่มจากการค้นประเทศ ให้เลือกเส้นตามคำถามของตน แล้วเดินทีละขั้น</p>
          </div>
        </div>
        <div className="reading-path-grid">
          {readingPaths.map((path) => (
            <article key={path.id} id={`path-${path.id}`}>
              <span>{path.audience}</span>
              <h3>{path.title}</h3>
              <p>{path.blurb}</p>
              <ol>
                {path.steps.map((step) => (
                  <li key={step.no}>
                    <button type="button" onClick={() => followPathStep(step)}>
                      <b>{step.no} {step.label}</b>
                      <small>{step.detail}</small>
                    </button>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="traps-section" id="traps">
        <div className="section-heading">
          <div>
            <span className="kicker">COMPARISON TRAPS</span>
            <h2>กับดักการเทียบ</h2>
            <p>รวบจากข้อควรระวังในคลัง เป็นเรื่องสอน ไม่ใช่เชิงอรรถท้ายบัตร แต่ละกับดักมีคู่เทียบที่ถูกชั้น และบอกว่าทำไมพาให้ร่างกฎหมายไทยผิดทาง</p>
          </div>
        </div>
        <div className="traps-grid">
          {comparisonTraps.map((trap) => (
            <article key={trap.id}>
              <h3>{trap.title}</h3>
              <p><b>กับดัก</b> {trap.mistake}</p>
              <p><b>คู่เทียบที่ถูกชั้น</b> {trap.correctPair}</p>
              <p><b>ทำไมพาไทยผิดทาง</b> {trap.whyThai}</p>
              <div className="trap-flags">
                {trap.ids.map((id) => {
                  const law = findLaw(id);
                  return law ? <span key={id}>{law.flag} {law.country}</span> : null;
                })}
              </div>
              <button type="button" onClick={() => applyPreset(trap.ids)}>เปิดคู่เทียบนี้</button>
            </article>
          ))}
        </div>
      </section>

      <section className="thai-path-section" id="thai-path">
        <div className="section-heading">
          <div>
            <span className="kicker">FOR THAI LAWMAKING</span>
            <h2>แนวทางสำหรับผู้พัฒนากฎหมายแม่บทไทย</h2>
            <p>เริ่มจากพระราชบัญญัติการศึกษาแห่งชาติ พ.ศ. 2542 แล้วเปิดฉบับต่างประเทศที่พูดชั้นเดียวกัน อย่าเริ่มจากประเทศที่มักถูกยกเป็นแบบอย่าง</p>
          </div>
        </div>
        <ol className="thai-path-steps">
          <li>
            <span>01</span>
            <h3>เปิดฉบับไทยก่อน</h3>
            <p>ยึด พ.ร.บ. 2542 เป็นขั้วเทียบ ดูชนิดเอกสาร สาระ และกรอบทั้งหกมิติ ก่อนหยิบกฎหมายต่างประเทศ</p>
            <button type="button" onClick={() => { const law = findLaw("thailand"); if (law) openLaw(law); }}>เปิด พ.ร.บ. 2542</button>
          </li>
          <li>
            <span>02</span>
            <h3>อ่านข้อควรระวังของฉบับนั้น</h3>
            <p>แต่ละรายการบอกว่าห้ามอ่านแทนอะไร เช่น ห้ามรวมสกอตแลนด์กับอังกฤษ หรือห้ามใช้กฎหมายรัฐแทนทั้งสหพันธ์</p>
            <a href="#traps">ไปคู่มือกับดักการเทียบ</a>
          </li>
          <li>
            <span>03</span>
            <h3>ออกด้วยใบงานผู้ร่าง</h3>
            <p>รวมสิ่งที่กฎหมายไทยเขียน ฉบับชั้นเดียวกัน กับดัก และกริยาที่ใช้ร่าง เป็นชุดที่คัดลอกได้ ไม่ใช่รายชื่อประเทศที่น่าเลียน</p>
            <a href="#drafter-brief">ไปใบงานผู้ร่าง</a>
          </li>
        </ol>
      </section>

      <section className="nea-section" id="nea-map">
        <div className="section-heading">
          <div>
            <span className="kicker">FROM CATALOG TO THE THAI ACT</span>
            <h2>จากคลังสู่ พ.ร.บ. 2542</h2>
            <p>ไทยเป็นขั้วเทียบถาวร แต่ละประเด็นมีสิ่งที่กฎหมายไทยเขียน ฉบับต่างประเทศที่พูดชั้นเดียวกัน สิ่งที่ห้ามลอก และคำถามสำหรับผู้ร่างครั้งต่อไป</p>
          </div>
        </div>
        <div className="nea-grid">
          {neaTopics.map((topic) => (
            <article key={topic.id}>
              <h3>{topic.title}</h3>
              <p><b>กฎหมายไทยเขียน</b> {topic.thaiWrites}</p>
              <p><b>ห้ามลอก</b> {topic.doNotCopy}</p>
              <p><b>คำถามผู้ร่าง</b> {topic.drafterQuestion}</p>
              <div className="trap-flags">
                {topic.sameLayerIds.map((id) => {
                  const law = findLaw(id);
                  return law ? (
                    <button type="button" key={id} onClick={() => openLaw(law)}>
                      {law.flag} {law.country}
                    </button>
                  ) : null;
                })}
              </div>
              <div className="nea-actions">
                <button type="button" onClick={() => applyPreset(topic.sameLayerIds)}>เปิดคู่เทียบชั้นนี้</button>
                <button type="button" onClick={() => openBrief(topic.id)}>เปิดใบงานนี้</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stacks-section" id="law-stacks">
        <div className="section-heading">
          <div>
            <span className="kicker">LAW STACKS</span>
            <h2>แผนภาพชั้นกฎหมายของประเทศที่ไทยมักอ้าง</h2>
            <p>ใช้ช่องกฎหมายที่ควรอ่านร่วมกันในคลัง แสดงว่าแม่บทอยู่ตรงไหนของกอง กันการลอกโครงองค์กรทั้งระบบจากฉบับเดียว</p>
          </div>
        </div>
        <div className="stacks-grid">
          {citedStacks.map((stack) => {
            const law = findLaw(stack.lawId);
            if (!law) return null;
            return (
              <article key={stack.lawId}>
                <span>{law.flag} {law.country}</span>
                <h3>{law.title}</h3>
                <p>{stack.role}</p>
                <ol className="law-stack">
                  {stack.layers.map((layer, index) => {
                    const content = stackLayerContent(law, layer);
                    return (
                      <li key={`${stack.lawId}-${index}`} className={content.current ? "current" : ""}>
                        <b>{layer.label}</b>
                        {content.catalogId ? (
                          <button
                            type="button"
                            onClick={() => {
                              const next = findLaw(content.catalogId);
                              if (next) openLaw(next);
                            }}
                          >
                            {content.title}
                          </button>
                        ) : content.href ? (
                          <a href={content.href} target="_blank" rel="noopener noreferrer">{content.title}</a>
                        ) : (
                          <span>{content.title}</span>
                        )}
                        {content.current && <em>ฉบับที่คลังเปิดเทียบ</em>}
                      </li>
                    );
                  })}
                </ol>
                <button type="button" onClick={() => openLaw(law)}>เปิดฉบับที่คลังเทียบ</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="gaps-section" id="principle-gap">
        <div className="section-heading">
          <div>
            <span className="kicker">PRINCIPLE AND MECHANISM</span>
            <h2>ช่องว่างระหว่างหลักกับกลไก</h2>
            <p>เริ่มจากไทย แล้วเทียบระบบที่แม่บทประกาศหลักไว้สูง แต่รายละเอียดไปอยู่กฎหมายเฉพาะ ไม่ขยายเป็นวิจัยภาคสนาม</p>
          </div>
        </div>
        <div className="gaps-grid">
          {principleGaps.map((gap) => {
            const law = findLaw(gap.lawId);
            return (
              <article key={gap.id}>
                <span>{law ? `${law.flag} ${law.country}` : gap.lawId}</span>
                <h3>{gap.title}</h3>
                <p><b>หลักในแม่บท</b> {gap.principle}</p>
                <p><b>กลไกอยู่ที่อื่น</b> {gap.mechanism}</p>
                {law && <button type="button" onClick={() => openLaw(law)}>เปิดฉบับนี้</button>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="library-section" id="library">
        <div className="section-heading">
          <div>
            <span className="kicker">CURATED LIBRARY</span>
            <h2>คลังกฎหมายการศึกษา</h2>
            <p>ปีบนการ์ดเป็นปีประกาศใช้หรือปีฉบับที่คลังเปิดเทียบ ไม่ใช่ปีที่ระบบมีชื่อเสียง คัดสรรจากฐานข้อมูลกฎหมายของรัฐและแหล่งอ้างอิงที่เชื่อถือได้</p>
          </div>
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
        <div className="library-filters kind-filters">
          <div className="filter-tabs" role="group" aria-label="กรองตามชนิดเอกสาร">
            {kindFilters.map((item) => (
              <button
                type="button"
                key={item}
                className={kind === item ? "active" : ""}
                aria-pressed={kind === item}
                onClick={() => setKind(item)}
              >
                {item === "ทั้งหมด" ? "ทุกชนิดเอกสาร" : item}
              </button>
            ))}
          </div>
        </div>
        <div className="library-sortbar">
          <div className="filter-tabs" role="group" aria-label="เรียงรายการในคลัง">
            {librarySorts.map((item) => (
              <button
                type="button"
                key={item.id}
                className={librarySort === item.id ? "active" : ""}
                aria-pressed={librarySort === item.id}
                onClick={() => setLibrarySort(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="active-filters" aria-label="ตัวกรองที่เปิดอยู่">
            {activeFilters.map((chip) => (
              <button type="button" key={chip.key} onClick={chip.clear}>
                {chip.label} <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" className="clear-filters" onClick={resetFilters}>ล้างทั้งหมด</button>
          </div>
        )}

        <div className="law-grid">
          {visibleLaws.map((law, index) => {
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
                <p className="card-locus">{aimsLocusLabel[documentReading(law).aimsLocus]}</p>
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
            <p>ลองใช้คำค้นอื่น หรือล้างตัวกรองภูมิภาค ระบบบริหาร ชนิดเอกสาร และประเด็น</p>
            <button type="button" onClick={resetFilters}>ล้างตัวกรอง</button>
          </div>
        )}
      </section>

      <section className="compare-framework" id="framework">
        <div className="framework-title">
          <span className="kicker light">COMPARATIVE FRAMEWORK</span>
          <h2>มองให้ลึกกว่า<br/>ตัวบทกฎหมาย</h2>
          <p>ชุดเทียบสำเร็จรูปเป็นทางเข้าตามคำถาม ไม่ใช่คำตอบทั้งระบบ ชุดด้านล่างแยกมิติทั่วไปกับคำถามของไทย</p>
          <div className="preset-group">
            <span>ตามมิติ</span>
            <div className="preset-list">
              {comparePresets.filter((preset) => !preset.forThai).map((preset) => (
                <button type="button" className="preset-chip" key={preset.id} onClick={() => applyPreset(preset.ids)}>
                  <b>{preset.title}</b>
                  <small>{preset.blurb}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="preset-group">
            <span>สำหรับคำถามไทย</span>
            <div className="preset-list">
              {comparePresets.filter((preset) => preset.forThai).map((preset) => (
                <button type="button" className="preset-chip" key={preset.id} onClick={() => applyPreset(preset.ids)}>
                  <b>{preset.title}</b>
                  <small>{preset.blurb}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="framework-list">
          {frameworkDimensions.map((item) => {
            const presets = comparePresets.filter((entry) => entry.dimension === item.key);
            const primary = presets.find((entry) => !entry.forThai) ?? presets[0];
            return (
              <button
                type="button"
                className="framework-item"
                key={item.key}
                onClick={() => {
                  if (item.key === "aims") {
                    document.getElementById("silence-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    return;
                  }
                  if (primary) applyPreset(primary.ids);
                }}
              >
                <span>{item.no}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.question}</p>
                  {item.key === "aims" ? (
                    <em>ทางเข้า: แผนที่ความเงียบเรื่องจุดมุ่งหมาย</em>
                  ) : (
                    presets.map((preset) => (
                      <em key={preset.id}>ชุดเทียบ: {preset.title}</em>
                    ))
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="heritage-section" id="heritage">
        <div className="section-heading">
          <div>
            <span className="kicker">HERITAGE IN THE TEXT</span>
            <h2>มรดกในตัวบท</h2>
            <p>เล่าเป็นเหตุที่กฎหมายเขียนหน้าที่ต่างกัน ไม่ใช่สีสันประกอบ แต่ละเรื่องอ้างฉบับในคลังได้</p>
          </div>
        </div>
        <div className="heritage-grid">
          {heritageReadings.map((item) => {
            const law = findLaw(item.lawId);
            if (!law) return null;
            return (
              <article key={item.lawId}>
                <span>{law.flag} {law.country}</span>
                <h3>{law.title}</h3>
                <p><b>มรดก</b> {item.heritage}</p>
                <p><b>หน้าที่จึงเขียนว่า</b> {item.howItWritesDuty}</p>
                <button type="button" onClick={() => openLaw(law)}>เปิดฉบับนี้</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="timeline-section" id="rewrite-timeline">
        <div className="section-heading">
          <div>
            <span className="kicker">WHEN AIMS WERE REWRITTEN</span>
            <h2>เส้นเวลาการเขียนใหม่ของแม่บท</h2>
            <p>ดูว่าประเทศเขียนการศึกษาเพื่ออะไรใหม่เมื่อใด ไม่ใช่เส้นเวลาผลสัมฤทธิ์</p>
          </div>
        </div>
        <ol className="rewrite-timeline">
          {rewriteTimeline.map((entry, index) => {
            const law = findLaw(entry.lawId);
            return (
              <li key={`${entry.year}-${entry.lawId}-${index}`}>
                <time>{entry.year}</time>
                <div>
                  <h3>{law ? `${law.flag} ${law.country}` : entry.lawId}</h3>
                  <p>{entry.event}</p>
                  {law && <button type="button" onClick={() => openLaw(law)}>เปิดฉบับนี้</button>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="phrases-section" id="drafter-phrases">
        <div className="section-heading">
          <div>
            <span className="kicker">DRAFTER PHRASES</span>
            <h2>คลังประโยคสำหรับผู้ร่าง</h2>
            <p>ถอดกริยาในตัวบทอย่างสั้น เป็นเครื่องมือร่าง ไม่ใช่คำคมนโยบาย แต่ละประโยคอ้างฉบับในคลัง</p>
          </div>
        </div>
        <div className="phrases-grid">
          {drafterPhrases.map((phrase) => {
            const law = findLaw(phrase.lawId);
            return (
              <article key={phrase.verb}>
                <h3>{phrase.verb}</h3>
                <p>{phrase.clause}</p>
                <small>{phrase.useWhen}</small>
                {law && (
                  <button type="button" onClick={() => openLaw(law)}>
                    จาก {law.flag} {law.country}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="brief-section" id="drafter-brief">
        <div className="section-heading">
          <div>
            <span className="kicker">DRAFTER BRIEF</span>
            <h2>ใบงานผู้ร่าง</h2>
            <p>ออกจากคลังด้วยชุดเทียบและคำถามร่างของประเด็นหนึ่ง ไม่ใช่ด้วยรายชื่อประเทศที่น่าเลียน เลือกเรื่องแล้วคัดลอกไปใช้ต่อได้</p>
          </div>
        </div>
        <div className="brief-shell">
          <div className="brief-topics" role="tablist" aria-label="ประเด็นใน พ.ร.บ. 2542">
            {drafterBriefs.map((item) => {
              const topic = findNeaTopic(item.topicId);
              if (!topic) return null;
              return (
                <button
                  type="button"
                  key={item.topicId}
                  role="tab"
                  aria-selected={briefTopic === item.topicId}
                  className={briefTopic === item.topicId ? "active" : ""}
                  onClick={() => setBriefTopic(item.topicId)}
                >
                  {topic.title}
                </button>
              );
            })}
          </div>
          {activeBrief && activeBriefTopic && (
            <article className="brief-sheet" role="tabpanel">
              <span>ออกจากคลังด้วยใบนี้</span>
              <h3>{activeBriefTopic.title}</h3>
              <p><b>สิ่งที่ พ.ร.บ. 2542 เขียน</b> {activeBriefTopic.thaiWrites}</p>
              <div className="brief-block">
                <b>ฉบับที่พูดชั้นเดียวกัน</b>
                <ul>
                  {activeBriefTopic.sameLayerIds.map((id) => {
                    const law = findLaw(id);
                    return law ? (
                      <li key={id}>
                        <button type="button" onClick={() => openLaw(law)}>
                          {law.flag} {law.country} — {law.title}
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
              <p><b>ห้ามลอก</b> {activeBriefTopic.doNotCopy}</p>
              {activeBrief.thaiMechanismIds.length > 0 && (
                <div className="brief-block">
                  <b>กลไกไทยในคลัง</b>
                  <ul>
                    {activeBrief.thaiMechanismIds.map((id) => {
                      const law = findLaw(id);
                      return law ? (
                        <li key={id}>
                          <button type="button" onClick={() => openLaw(law)}>
                            {law.flag} {law.country} — {law.title}
                          </button>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
              {activeBriefTrap && (
                <p>
                  <b>กับดักที่ต้องกัน</b> {activeBriefTrap.title} {activeBriefTrap.whyThai}
                </p>
              )}
              {activeBriefGap && (
                <p>
                  <b>ช่องว่างหลักกับกลไก</b> {activeBriefGap.principle} {activeBriefGap.mechanism}
                </p>
              )}
              {activeBriefStack && activeBriefStackLaw && (
                <div className="brief-block">
                  <b>แผนภาพชั้นที่ควรเปิดคู่</b>
                  <p>{activeBriefStackLaw.flag} {activeBriefStackLaw.country} — {activeBriefStack.role}</p>
                  <ol className="law-stack">
                    {activeBriefStack.layers.map((layer, index) => {
                      const content = stackLayerContent(activeBriefStackLaw, layer);
                      return (
                        <li key={`${activeBriefStack.lawId}-${index}`} className={content.current ? "current" : ""}>
                          <b>{layer.label}</b>
                          {content.catalogId ? (
                            <button
                              type="button"
                              onClick={() => {
                                const next = findLaw(content.catalogId);
                                if (next) openLaw(next);
                              }}
                            >
                              {content.title}
                            </button>
                          ) : content.href ? (
                            <a href={content.href} target="_blank" rel="noopener noreferrer">{content.title}</a>
                          ) : (
                            <span>{content.title}</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
              {activeBriefHeritage && activeBriefHeritageLaw && (
                <p>
                  <b>มรดกในตัวบท</b> {activeBriefHeritageLaw.flag} {activeBriefHeritageLaw.country}: {activeBriefHeritage.heritage}
                </p>
              )}
              {activeBrief.phraseVerbs.length > 0 && (
                <div className="brief-block">
                  <b>กริยาที่ใช้ร่าง</b>
                  <ul>
                    {activeBrief.phraseVerbs.map((verb) => {
                      const phrase = findPhrase(verb);
                      return phrase ? (
                        <li key={verb}>
                          <strong>{phrase.verb}</strong> {phrase.clause}
                          <small>{phrase.useWhen}</small>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
              <p><b>คำถามสำหรับผู้ร่าง</b> {activeBriefTopic.drafterQuestion}</p>
              <p className="brief-takeaway"><b>สิ่งที่ควรทำต่อ</b> {activeBrief.takeaway}</p>
              <div className="brief-actions">
                <button type="button" onClick={() => applyPreset(activeBriefTopic.sameLayerIds)}>เปิดคู่เทียบชั้นนี้</button>
                <button type="button" onClick={copyBrief}>คัดลอกใบงานนี้</button>
                {activeBriefTrap && (
                  <button type="button" onClick={() => applyPreset(activeBriefTrap.ids)}>เปิดคู่กับดักนี้</button>
                )}
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="limits-section" id="catalog-limits">
        <div className="section-heading">
          <div>
            <span className="kicker">WHAT THIS CATALOG CANNOT ANSWER</span>
            <h2>คลังนี้ตอบอะไรไม่ได้</h2>
            <p>เว็บนี้ไม่แข่งกับฐานตัวบทเต็มฉบับ และไม่แข่งกับเว็บจัดอันดับผลสัมฤทธิ์ เมื่อคำถามอยู่นอกชั้นของฉบับที่เปิด ให้ลงชั้นกลไกหรือออกไปแหล่งทางการ</p>
          </div>
        </div>
        <div className="limits-grid">
          {catalogLimits.map((limit) => (
            <article key={limit.id}>
              <h3>{limit.cannot}</h3>
              <p><b>ให้ทำแทน</b> {limit.goInstead}</p>
              {limit.href && (
                <a href={limit.href}>{limit.linkLabel ?? "ไปชั้นที่ถูก"}</a>
              )}
            </article>
          ))}
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
          <p>โครงการนี้ตั้งใจให้อ่านกฎหมายแม่บทเป็นชั้นของตัวบท เพื่อการเรียนรู้ การเทียบที่ถูกชั้น และการพัฒนากฎหมายแม่บทของไทย ไม่ใช่เพื่อจัดอันดับว่าระบบการศึกษาใดดีกว่า</p>
          <a className="curator-email" href="mailto:burapatis@gmail.com">burapatis@gmail.com</a>
          <div className="principles"><span>อิสระ</span><span>อ้างอิงได้</span><span>เปิดกว้าง</span><span>เรียนรู้ร่วมกัน</span></div>
        </div>
      </section>

      <section className="note-section">
        <div><span className="kicker">RESEARCH NOTE</span><h2>กฎหมายคือจุดเริ่มต้น<br/>ไม่ใช่คำตอบทั้งหมด</h2></div>
        <p>ข้อมูลสรุปในเว็บไซต์จัดทำเพื่อการศึกษาและเปรียบเทียบ ไม่ใช่คำแนะนำทางกฎหมาย ผู้ใช้ควรตรวจสอบตัวบทฉบับปัจจุบันจากฐานข้อมูลทางการ และพิจารณาบริบททางประวัติศาสตร์ สถาบัน และวัฒนธรรมของแต่ละประเทศประกอบเสมอ</p>
      </section>

      <footer>
        <div className="footer-brand"><span className="brand-seal inverse"><span>EA</span></span><div><b>EduLex Atlas</b><small>หอดูดาวกฎหมายแม่บทการศึกษา</small></div></div>
        <div className="footer-links">
          <a href="#one-pass">เรียนจบรอบหนึ่ง</a>
          <a href="#how-to-read">วิธีอ่าน</a>
          <a href="#reading-paths">แนวทาง</a>
          <a href="#traps">กับดักการเทียบ</a>
          <a href="#nea-map">สู่ พ.ร.บ. 2542</a>
          <a href="#drafter-brief">ใบงานผู้ร่าง</a>
          <a href="#catalog-limits">ขอบเขตคลัง</a>
          <a href="#library">คลังกฎหมาย</a>
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
            <span>กำลังถือเอกสารชนิดใด</span>
            {selectedLaws.map((law) => <p key={law.id}>{documentReading(law).kindReading}</p>)}
          </div>
          <div className="compare-row">
            <span>ความเงียบเรื่องจุดมุ่งหมาย</span>
            {selectedLaws.map((law) => <p key={law.id}>{aimsLocusLabel[documentReading(law).aimsLocus]}</p>)}
          </div>
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
              <div className="kind-panel">
                <span>กำลังถือเอกสารชนิดใด</span>
                <div className="kind-panel-badges">
                  <b>{kindLayer(activeLaw.kind)}</b>
                  <b>{activeLaw.kind}</b>
                  <b>{aimsLocusLabel[documentReading(activeLaw).aimsLocus]}</b>
                </div>
                <p>{documentReading(activeLaw).kindReading}</p>
              </div>
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
                <div><dt>ปีประกาศใช้</dt><dd>{activeLaw.year}<small> ปีบนการ์ดเป็นปีประกาศใช้หรือปีฉบับที่คลังเปิดเทียบ ไม่ใช่ปีที่ระบบมีชื่อเสียง</small></dd></div>
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
