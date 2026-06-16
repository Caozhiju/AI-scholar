// Dynamically import and run the remediation plan check
// Since we can't directly import TS, let's check the generated plan data
// by looking at the remediation plan output

import { readFileSync } from "fs";

// Check knowledge links per course
const c = readFileSync("src/data/courses.ts", "utf8");
const ids = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
             "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
             "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015"];

console.log("=== Knowledge Links Check ===");
for (let i = 0; i < ids.length; i++) {
  const s = c.indexOf(`id: "${ids[i]}"`);
  const nextId = i < ids.length - 1 ? ids[i + 1] : "edunlp";
  const e = c.indexOf(`id: "${nextId}"`, s + 5);
  const b = c.slice(s, e);
  
  const rm = b.match(/relatedKnowledge:\s*\[([^\]]+)\]/);
  const relCount = rm ? (rm[1].match(/["']/g) || []).length / 2 : 0;
  
  if (relCount < 2) console.log(`  ${ids[i]}: Only ${relCount} knowledge links`);
}

console.log("\n=== Quiz Depth Check ===");
// Check if quizzes are all definition-type by looking for "分析", "比较", "设计", "评估" keywords
for (let i = 0; i < ids.length; i++) {
  const s = c.indexOf(`id: "${ids[i]}"`);
  const nextId = i < ids.length - 1 ? ids[i + 1] : "edunlp";
  const e = c.indexOf(`id: "${nextId}"`, s + 5);
  const b = c.slice(s, e);
  
  const qi = b.indexOf("quiz: [");
  if (qi < 0) { console.log(`  ${ids[i]}: No quiz`); continue; }
  
  const appKeywords = ["分析", "比较", "设计", "评估", "你自己", "你会", "你的研究"];
  let appCount = 0;
  let qTotal = 0;
  
  // Count questions by finding "question:" 
  let pos = qi;
  while (true) {
    const qPos = b.indexOf('question: "', pos);
    if (qPos < 0 || qPos > qi + 4000) break;
    const qEnd = b.indexOf('",', qPos);
    const question = b.slice(qPos, qEnd);
    const hasApp = appKeywords.some(kw => question.includes(kw));
    if (hasApp) appCount++;
    qTotal++;
    pos = qEnd + 2;
  }
  
  if (qTotal >= 3 && appCount < 2) {
    console.log(`  ${ids[i]}: ${qTotal} quizzes, ${appCount} application-type (may be definition-only)`);
  } else {
    console.log(`  ${ids[i]}: ${qTotal} quizzes, ${appCount} application-type ✓`);
  }
}

console.log("\n=== Word Count Check ===");
for (let i = 0; i < ids.length; i++) {
  const s = c.indexOf(`id: "${ids[i]}"`);
  const nextId = i < ids.length - 1 ? ids[i + 1] : "edunlp";
  const e = c.indexOf(`id: "${nextId}"`, s + 5);
  const b = c.slice(s, e);
  const chars = (b.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chars < 5000) console.log(`  ${ids[i]}: ${chars} chars - BELOW 5000`);
}

console.log("\n=== Case Count Check ===");
for (let i = 0; i < ids.length; i++) {
  const s = c.indexOf(`id: "${ids[i]}"`);
  const nextId = i < ids.length - 1 ? ids[i + 1] : "edunlp";
  const e = c.indexOf(`id: "${nextId}"`, s + 5);
  const b = c.slice(s, e);
  const c1 = (b.match(/# 真实研究案例/g) || []).length;
  const c2 = (b.match(/## 案例/g) || []).length;
  const total = Math.max(c1, c2);
  if (total < 2) console.log(`  ${ids[i]}: ${total} cases`);
}
