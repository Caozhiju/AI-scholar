import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");
const courseId = process.argv[2] || "edunlp-006";

// Find next course ID
const allIds = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
                "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
                "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015",
                "edunlp","llm"];

const idx = allIds.indexOf(courseId);
if (idx === -1 || idx === allIds.length - 1) {
  console.log("Cannot find next course for", courseId);
  process.exit(1);
}

const nextId = allIds[idx + 1];
const s = c.indexOf(`id: "${courseId}"`);
const e = c.indexOf(`id: "${nextId}"`, s + 5);
const b = c.slice(s, e);

const hasExt = b.includes("延伸阅读");
const qi = b.indexOf("quiz:");
const chars = (b.match(/[\u4e00-\u9fff]/g) || []).length;
const last300 = b.slice(-300);

console.log(`Course: ${courseId} (${chars}字)`);
console.log(`Has 延伸阅读: ${hasExt}`);
console.log(`Quiz index: ${qi}`);
console.log(`---Last 300 chars---`);
console.log(last300);
