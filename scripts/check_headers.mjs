import { readFileSync } from "fs";
const c = readFileSync("src/data/courses.ts", "utf8");
const courseId = process.argv[2] || "edunlp-012";

const allIds = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
                "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
                "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015","edunlp","llm"];

const idx = allIds.indexOf(courseId);
const nextId = allIds[idx + 1];
const s = c.indexOf(`id: "${courseId}"`);
const e = c.indexOf(`id: "${nextId}"`, s + 5);
const b = c.slice(s, e);

const headers = b.match(/# [^\n]+/g) || [];
console.log(`Headers for ${courseId}:`);
headers.forEach(h => console.log("  " + h));
