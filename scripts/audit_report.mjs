import { readFileSync } from "fs";

const content = readFileSync("src/data/courses.ts", "utf8");
const blocks = content.split(/\n\s+id: "/).slice(1);

const required = ["本课导入", "历史背景", "核心知识", "核心原理拆解", "与传统方法比较", "真实研究案例一", "真实研究案例二", "科研避坑提示", "科研应用路径", "学完本课你将能够", "本课总结", "思考题", "延伸阅读"];

for (const b of blocks) {
  const id = b.match(/^([^"]+)/)?.[1];
  if (!id || !id.startsWith("edunlp-")) continue;

  const chars = (b.match(/[\u4e00-\u9fff]/g) || []).length;
  const missing = required.filter((s) => !b.includes(s));
  const cases = (b.match(/# 真实研究案例/g) || []).length;
  const quizzes = (b.match(/question: "/g) || []).length;
  const visuals = (b.match(/type: "/g) || []).length;
  const rm = b.match(/relatedKnowledge:\s*\[([^\]]+)\]/);
  const relCount = rm ? (rm[1].match(/["']/g) || []).length / 2 : 0;

  const s = [];
  if (missing.length) s.push("S-缺失章节: " + missing.join(", "));
  if (chars < 4000) s.push("S-字数严重不足: " + chars);
  if (cases === 0) s.push("S-无研究案例");

  const a = [];
  if (chars >= 4000 && chars < 5000) a.push("A-字数偏少: " + chars);
  if (cases === 1) a.push("A-仅1个研究案例");
  if (quizzes < 3) a.push("A-Quiz不足: " + quizzes);
  if (relCount < 2) a.push("A-知识点不足: " + relCount);

  const all = [...s, ...a];
  if (all.length) {
    console.log("=== " + id + " (" + chars + "字) ===");
    all.forEach((i) => console.log("  " + i));
    console.log();
  }
}
