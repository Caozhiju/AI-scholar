import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");

const ids = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
             "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
             "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015"];

for (let i = 0; i < ids.length; i++) {
  const start = c.indexOf(`id: "${ids[i]}"`);
  const nextId = i < ids.length - 1 ? ids[i + 1] : "llm";
  const end = c.indexOf(`id: "${nextId}"`, start + 10);
  const block = c.slice(start, end);
  
  const quizIdx = block.indexOf("quiz: [");
  const chars = (block.match(/[\u4e00-\u9fff]/g) || []).length;
  
  if (quizIdx === -1) {
    console.log(`${ids[i]} (${chars}字): NO quiz array`);
    continue;
  }
  
  // Find the matching closing bracket
  let depth = 0;
  let quizEnd = quizIdx + 7;
  let qCount = 0;
  for (let j = quizIdx; j < block.length; j++) {
    if (block[j] === "{") qCount += (block.slice(j, j+5) === `{id: "` || block.slice(j, j+3) === `{\n` || block.slice(j, j+4) === `{\r\n`) ? 0 : 0;
    if (block[j] === "{") depth++;
    if (block[j] === "}") depth--;
    if (depth === 0 && block[j] === "]") { quizEnd = j; break; }
  }
  
  const quizBlock = block.slice(quizIdx, quizEnd + 1);
  const qMatches = quizBlock.match(/\{/g);
  const itemCount = qMatches ? qMatches.length - 1 : 0;
  
  console.log(`${ids[i]} (${chars}字): Quiz items = ${itemCount}`);
}
