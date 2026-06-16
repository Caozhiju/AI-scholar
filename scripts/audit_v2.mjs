import { readFileSync } from "fs";

const content = readFileSync("src/data/courses.ts", "utf8");
const blocks = content.split(/\n\s+id: "/).slice(1);

function hasSection(content, required) {
  if (content.includes(required)) return true;
  const aliases = {
    "核心原理拆解": [],
    "与传统方法比较": ["NLP vs 传统语言学", "与传统语言学比较", "传统方法比较", "与传统方法"],
    "真实研究案例一": ["案例一：", "案例一:"],
    "真实研究案例二": ["案例二：", "案例二:"],
    "延伸阅读": [],
    "科研避坑提示": ["常见误区"],
  };
  const alts = aliases[required];
  if (!alts) return false;
  return alts.some((a) => content.includes(a));
}

const allSections = ["本课导入", "历史背景", "核心知识", "核心原理拆解", "与传统方法比较", "真实研究案例一", "真实研究案例二", "科研避坑提示", "科研应用路径", "学完本课你将能够", "本课总结", "思考题", "延伸阅读"];

for (const b of blocks) {
  const id = b.match(/^([^"]+)/)?.[1];
  if (!id || !id.startsWith("edunlp-")) continue;

  const chars = (b.match(/[\u4e00-\u9fff]/g) || []).length;
  const missing = allSections.filter((s) => !b.includes(s) && !hasSection(b, s));
  const casePattern1 = (b.match(/# 真实研究案例/g) || []).length;
  const casePattern2 = (b.match(/## 案例/g) || []).length;
  const totalCases = Math.max(casePattern1, casePattern2);
  const hasQuiz = b.includes("quiz: [");
  const quizCount = (b.match(/id: "q/g) || []).length;
  const visualCount = (b.match(/type: "/g) || []).length;
  const rm = b.match(/relatedKnowledge:\s*\[([^\]]+)\]/);
  const relCount = rm ? (rm[1].match(/["']/g) || []).length / 2 : 0;
  const hasTable = b.includes("| 维度 |") || b.includes("|------|") || b.includes("| 维度");

  const sIssues = [];
  if (missing.length > 0) sIssues.push("S-缺: " + missing.join(", "));
  if (chars < 4000) sIssues.push("S-字数严重不足: " + chars);
  if (totalCases === 0) sIssues.push("S-无案例");

  const aIssues = [];
  if (chars >= 4000 && chars < 5000) aIssues.push("A-字数偏少: " + chars);
  if (totalCases === 1) aIssues.push("A-仅1案例");
  if (!hasQuiz || quizCount < 3) aIssues.push("A-Quiz问题");

  const all = [...sIssues, ...aIssues];
  const status = all.length === 0 ? "✓ PASS" : "✗ FAIL";
  console.log(`${status} ${id} (${chars}字) 案例:${totalCases} Quiz:${quizCount} 图解:${visualCount} 关联:${relCount}` + (all.length ? " " + all.join(" | ") : ""));
}
