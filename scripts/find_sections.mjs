import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");
const courseId = process.argv[2] || "edunlp-007";

const allIds = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
                "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
                "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015",
                "edunlp","llm"];

const idx = allIds.indexOf(courseId);
const nextId = allIds[idx + 1];
const s = c.indexOf(`id: "${courseId}"`);
const e = c.indexOf(`id: "${nextId}"`, s + 5);
const b = c.slice(s, e);

const sections = [
  "# 本课导入", "# 历史背景", "# 核心知识", "# 核心原理拆解",
  "# 与传统方法比较", "# 真实研究案例一", "# 真实研究案例二",
  "# 科研避坑提示", "# 科研应用路径", "# 学完本课你将能够",
  "# 本课总结", "# 思考题", "# 延伸阅读"
];

console.log(`=== ${courseId} sections ===`);
for (const sec of sections) {
  const pos = b.indexOf(sec);
  console.log(pos >= 0 ? `✓ ${sec}` : `✗ ${sec}`);
}

// Find the right insertion point for 核心原理拆解
// Should go after 核心知识 and before the comparison section or case study
const coreKnowEnd = b.indexOf("# 核心知识") + "# 核心知识".length;
const nextSecAfterCore = b.indexOf("# ", coreKnowEnd + 100);
console.log(`\n核心知识 starts at: ${b.indexOf("# 核心知识")}`);
console.log(`Next section after 核心知识: ${b.slice(nextSecAfterCore, nextSecAfterCore + 30)}`);
