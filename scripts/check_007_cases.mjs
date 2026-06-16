import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");
const s = c.indexOf('id: "edunlp-007"');
const e = c.indexOf('id: "edunlp-008"', s + 5);
const b = c.slice(s, e);

// Find sections between 核心知识 and 科研避坑提示
const sections = b.match(/# [^\n]+/g);
console.log("All headers in edunlp-007:");
sections.forEach(h => console.log("  " + h));

// Check for case-related headers
const caseHeader = b.match(/## 案例[^\n]*/g);
if (caseHeader) {
  console.log("\nCase headers:");
  caseHeader.forEach(h => console.log("  " + h));
}
