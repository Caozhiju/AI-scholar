import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");
const courseId = process.argv[2] || "edunlp-007";

const allIds = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
                "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
                "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015","edunlp","llm"];

const idx = allIds.indexOf(courseId);
const nextId = allIds[idx + 1];
const s = c.indexOf(`id: "${courseId}"`);
const e = c.indexOf(`id: "${nextId}"`, s + 5);
const b = c.slice(s, e);

const qi = b.indexOf("quiz: [");
if (qi < 0) {
  console.log("NO QUIZ found in", courseId);
  process.exit(1);
}

// Show first 500 chars of quiz area
const quizText = b.slice(qi, qi + 1500);
console.log(quizText);
