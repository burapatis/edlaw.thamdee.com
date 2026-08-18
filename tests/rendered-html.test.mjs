import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function quotedValues(source, key) {
  return [...source.matchAll(new RegExp(`${key}: "([^"]+)"`, "g"))].map((match) => match[1]);
}

test("server-renders EduLex Atlas in Thai", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /lang="th"/);
  assert.match(html, /<title>EduLex Atlas — หอดูดาวกฎหมายแม่บทการศึกษา<\/title>/);
  assert.match(html, /EduLex Atlas/);
  assert.match(html, /คลังกฎหมายการศึกษา/);
  assert.match(html, /กำลังถือเอกสารชนิดใด/);
  assert.match(html, /แผนที่ความเงียบเรื่องจุดมุ่งหมาย/);
  assert.match(html, /กฎหมายเงียบเรื่องจุดมุ่งหมาย/);
  assert.match(html, /id="how-to-read"/);
  assert.match(html, /id="silence-map"/);
  assert.match(html, /id="reading-paths"/);
  assert.match(html, /id="traps"/);
  assert.match(html, /เส้นทางอ่านสามแบบ/);
  assert.match(html, /ห้ามรวมอังกฤษและเวลส์กับสกอตแลนด์/);
  assert.match(html, /จากคลังสู่ พ\.ร\.บ\. 2542/);
  assert.match(html, /แผนภาพชั้นกฎหมายของประเทศที่ไทยมักอ้าง/);
  assert.match(html, /ช่องว่างระหว่างหลักกับกลไก/);
  assert.match(html, /มรดกในตัวบท/);
  assert.match(html, /เส้นเวลาการเขียนใหม่ของแม่บท/);
  assert.match(html, /คลังประโยคสำหรับผู้ร่าง/);
  assert.match(html, /ใบงานผู้ร่าง/);
  assert.match(html, /เรียนจบรอบหนึ่ง/);
  assert.match(html, /คลังนี้ตอบอะไรไม่ได้/);
  assert.match(html, /id="nea-map"/);
  assert.match(html, /id="drafter-brief"/);
  assert.match(html, /id="one-pass"/);
  assert.match(html, /id="catalog-limits"/);
  assert.match(html, /อังกฤษและเวลส์/);
  assert.match(html, /ข้ามไปยังคลังกฎหมาย/);
  assert.doesNotMatch(html, /ระบบการศึกษาชั้นนำ/);
  assert.doesNotMatch(html, /Your site is taking shape/);
  assert.doesNotMatch(html, /SkeletonPreview/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});

test("catalog data is complete and uses unique jurisdiction codes", async () => {
  const [data, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/data/laws.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  const lawBlock = data.slice(data.indexOf("export const laws"), data.indexOf("export const allThemes"));
  const ids = quotedValues(lawBlock, "id");
  const flags = quotedValues(lawBlock, "flag");
  assert.equal(ids.length, 29);
  assert.equal(new Set(ids).size, 29);
  assert.equal(flags.length, 29);
  assert.equal(new Set(flags).size, 29);
  assert.equal([...lawBlock.matchAll(/context: "/g)].length, 29);
  assert.equal([...lawBlock.matchAll(/caution: "/g)].length, 29);
  assert.equal([...lawBlock.matchAll(/framework: \{/g)].length, 29);
  assert.equal([...lawBlock.matchAll(/aims: "/g)].length, 29);
  assert.match(data, /key: "aims"/);
  assert.match(data, /id: "aims-declared"/);
  assert.match(data, /id: "aims-duty"/);
  assert.match(data, /id: "access-rights"/);
  assert.match(data, /id: "devolution-gap"/);
  assert.match(data, /id: "teachers-layers"/);
  assert.match(data, /id: "thai-instruments"/);
  assert.match(data, /id: "aims-civic"/);
  assert.match(data, /id: "uk-split"/);
  assert.match(data, /id: "funding-as-classroom"/);
  assert.match(data, /export const comparisonTraps/);
  assert.match(data, /export const readingPaths/);
  const trapBlock = data.slice(data.indexOf("export const comparisonTraps"), data.indexOf("export const readingPaths"));
  const trapIdArrays = [...trapBlock.matchAll(/ids: \[([^\]]+)\]/g)];
  assert.equal(trapIdArrays.length, 5);
  for (const match of trapIdArrays) {
    const trapIds = match[1].split(",").map((item) => item.trim().replace(/"/g, "")).filter(Boolean);
    assert.ok(trapIds.length >= 2 && trapIds.length <= 3, trapIds.join(","));
    for (const id of trapIds) assert.ok(ids.includes(id), `unknown trap id ${id}`);
  }
  assert.ok(flags.includes("ON"));
  assert.ok(flags.includes("US-CA"));
  assert.ok(flags.includes("US-NY"));
  assert.ok(flags.includes("US-MA"));
  assert.ok(flags.includes("ENG"));
  assert.ok(flags.includes("MY"));
  assert.ok(flags.includes("ID"));
  assert.ok(flags.includes("VN"));
  assert.ok(flags.includes("PH"));
  assert.ok(flags.includes("SCT"));
  assert.ok(flags.includes("ZA"));
  assert.ok(flags.includes("BR"));
  assert.ok(flags.includes("TH-CE"));
  assert.ok(flags.includes("TH-TC"));
  assert.ok(flags.includes("TH-EEF"));
  assert.ok(flags.includes("NO"));
  assert.ok(ids.includes("thai-compulsory"));
  assert.ok(ids.includes("thai-teachers"));
  assert.ok(ids.includes("thai-eef"));
  assert.ok(ids.includes("norway"));
  assert.doesNotMatch(data, /country: "สหราชอาณาจักร"/);
  assert.match(data, /kind: "บทบัญญัติรัฐธรรมนูญ"/);
  assert.match(data, /kind: "กฎหมายลำดับรอง"/);
  assert.match(data, /catalogId: "thai-compulsory"/);
  assert.match(data, /lovdata\.no\/dokument\/NLE\/lov\/2023-06-09-30/);
  assert.match(data, /www\.riigiteataja\.ee\/en\/eli\/501092025002\/consolide/);
  assert.match(data, /subsites\.chinadaily\.com\.cn\/npc/);
  assert.match(data, /eef\.or\.th\/about\/law/);
  assert.match(data, /id: "asean"/);
  assert.match(data, /region: "แอฟริกา"/);
  assert.match(data, /region: "ละตินอเมริกา"/);
  assert.match(data, /term: "สหพันธรัฐ"/);
  assert.match(data, /term: "กฎหมายเงียบเรื่องจุดมุ่งหมาย"/);
  assert.match(data, /term: "กฎหมายลำดับรอง"/);
  assert.match(data, /term: "กับดักการเทียบสหพันธรัฐ"/);
  const readingBlock = data.slice(data.indexOf("export const documentReadings"), data.indexOf("export function documentReading"));
  for (const id of ids) {
    assert.ok(readingBlock.includes(`${id}:`) || readingBlock.includes(`"${id}":`), `missing reading for ${id}`);
  }

  assert.match(page, /writeUrlState/);
  assert.match(page, /law-dialog/);
  assert.match(page, /id="glossary"/);
  assert.match(page, /id="how-to-read"/);
  assert.match(page, /id="silence-map"/);
  assert.match(page, /id="reading-paths"/);
  assert.match(page, /id="traps"/);
  assert.match(page, /id="nea-map"/);
  assert.match(page, /id="law-stacks"/);
  assert.match(page, /id="principle-gap"/);
  assert.match(page, /id="heritage"/);
  assert.match(page, /id="rewrite-timeline"/);
  assert.match(page, /id="drafter-phrases"/);
  assert.match(page, /id="drafter-brief"/);
  assert.match(page, /id="one-pass"/);
  assert.match(page, /id="catalog-limits"/);
  assert.match(data, /export const neaTopics/);
  assert.match(data, /export const citedStacks/);
  assert.match(data, /export const principleGaps/);
  assert.match(data, /export const heritageReadings/);
  assert.match(data, /export const rewriteTimeline/);
  assert.match(data, /export const drafterPhrases/);
  assert.match(data, /export const drafterBriefs/);
  assert.match(data, /export const onePassSteps/);
  assert.match(data, /export const catalogLimits/);
  assert.match(data, /export const librarySorts/);
  assert.match(page, /sortLaws/);
  const passBlock = data.slice(data.indexOf("export const onePassSteps"), data.indexOf("export const catalogLimits"));
  assert.equal([...passBlock.matchAll(/no: "/g)].length, 5);
  assert.match(passBlock, /lawId: "thailand"/);
  const limitBlock = data.slice(data.indexOf("export const catalogLimits"), data.indexOf("export const librarySorts"));
  assert.equal(quotedValues(limitBlock, "id").length, 5);
  const briefBlock = data.slice(data.indexOf("export const drafterBriefs"), data.indexOf("export function findNeaTopic"));
  const briefTopics = quotedValues(briefBlock, "topicId");
  assert.equal(briefTopics.length, 6);
  assert.equal(new Set(briefTopics).size, 6);
  for (const id of ["aims", "rights", "devolution", "quality", "teachers", "lifelong"]) {
    assert.ok(briefTopics.includes(id), `missing brief for ${id}`);
  }
  for (const trapId of quotedValues(briefBlock, "trapId")) {
    assert.ok(data.includes(`id: "${trapId}"`), `unknown trap ${trapId}`);
  }
  for (const stackId of quotedValues(briefBlock, "stackLawId")) {
    assert.ok(ids.includes(stackId), `unknown stack law ${stackId}`);
  }
  for (const mechanismId of quotedValues(briefBlock, "catalogId").concat(
    [...briefBlock.matchAll(/thaiMechanismIds: \[([^\]]*)\]/g)].flatMap((match) =>
      match[1].split(",").map((item) => item.trim().replace(/"/g, "")).filter(Boolean),
    ),
  )) {
    assert.ok(ids.includes(mechanismId), `unknown mechanism ${mechanismId}`);
  }
  assert.match(page, /applyPreset/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /const title = "EduLex Atlas/);
  assert.match(layout, /siteName: "EduLex Atlas"/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /drizzle-orm|drizzle-kit/);

  await assert.rejects(access(new URL("app/chatgpt-auth.ts", templateRoot)));
  await assert.rejects(access(new URL("examples", templateRoot)));
  await assert.rejects(access(new URL("db", templateRoot)));
  await assert.rejects(access(new URL("drizzle", templateRoot)));
  await assert.rejects(access(new URL("app/_sites-preview", templateRoot)));
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
