import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");
const ids = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
             "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
             "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015"];

function hasSection(content, required) {
  if (content.includes(required)) return true;
  const aliases = {
    "核心原理拆解": ["核心原理"],
    "与传统方法比较": ["NLP vs 传统语言学", "与传统语言学比较", "传统方法比较", "与传统方法", "与传统语言学方法", "与传统研究"],
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

for (let i = 0; i < ids.length; i++) {
  const s = c.indexOf(`id: "${ids[i]}"`);
  const nextId = i < ids.length - 1 ? ids[i + 1] : "edunlp";
  const e = c.indexOf(`id: "${nextId}"`, s + 5);
  const b = c.slice(s, e);
  
  const chars = (b.match(/[\u4e00-\u9fff]/g) || []).length;
  const missing = allSections.filter((sec) => !b.includes(sec) && !hasSection(b, sec));
  const quizCount = (b.match(/id: "q\d+"/g) || []).length;
  
  console.log(ids[i] + " (" + chars + "字, quiz:" + quizCount + ") 缺[" + missing.join(",") + "]");
}
