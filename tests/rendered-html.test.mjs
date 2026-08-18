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
  assert.match(html, /<title>EduLex Atlas — คลังอ้างอิงกฎหมายการศึกษาโลก<\/title>/);
  assert.match(html, /EduLex Atlas/);
  assert.match(html, /คลังกฎหมายการศึกษา/);
  assert.match(html, /อังกฤษและเวลส์/);
  assert.match(html, /ข้ามไปยังคลังกฎหมาย/);
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
  assert.equal(ids.length, 25);
  assert.equal(new Set(ids).size, 25);
  assert.equal(flags.length, 25);
  assert.equal(new Set(flags).size, 25);
  assert.equal([...lawBlock.matchAll(/context: "/g)].length, 25);
  assert.equal([...lawBlock.matchAll(/caution: "/g)].length, 25);
  assert.equal([...lawBlock.matchAll(/framework: \{/g)].length, 25);
  assert.equal([...lawBlock.matchAll(/aims: "/g)].length, 25);
  assert.match(data, /key: "aims"/);
  assert.match(data, /id: "aims-declared"/);
  assert.match(data, /id: "aims-duty"/);
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
  assert.doesNotMatch(data, /country: "สหราชอาณาจักร"/);
  assert.match(data, /kind: "บทบัญญัติรัฐธรรมนูญ"/);
  assert.match(data, /www\.riigiteataja\.ee\/en\/eli\/501092025002\/consolide/);
  assert.match(data, /subsites\.chinadaily\.com\.cn\/npc/);
  assert.match(data, /eef\.or\.th\/about\/law/);
  assert.match(data, /id: "asean"/);
  assert.match(data, /region: "แอฟริกา"/);
  assert.match(data, /region: "ละตินอเมริกา"/);
  assert.match(data, /term: "สหพันธรัฐ"/);

  assert.match(page, /writeUrlState/);
  assert.match(page, /law-dialog/);
  assert.match(page, /id="glossary"/);
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
