import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");
const ids = ["edunlp-001","edunlp-002","edunlp-003","edunlp-004","edunlp-005",
             "edunlp-006","edunlp-007","edunlp-008","edunlp-009","edunlp-010",
             "edunlp-011","edunlp-012","edunlp-013","edunlp-014","edunlp-015"];

for (let i = 0; i < ids.length; i++) {
  const start = c.indexOf('id: "' + ids[i] + '"');
  const nextId = i < ids.length - 1 ? ids[i + 1] : "llm";
  const end = c.indexOf('id: "' + nextId + '"', start + 5);
  const block = c.slice(start, end);
  
  const chars = (block.match(/[\u4e00-\u9fff]/g) || []).length;
  const sections = {
    "核心原理拆解": block.includes("核心原理"),
    "与传统方法比较": block.includes("与传统方法"),
    "真实研究案例一": block.includes("真实研究案例一") || block.includes("案例一："),
    "真实研究案例二": block.includes("真实研究案例二") || block.includes("案例二："),
    "延伸阅读": block.includes("延伸阅读"),
    "历史背景": block.includes("历史背景"),
    "核心知识": block.includes("核心知识"),
    "本课导入": block.includes("本课导入"),
    "科研避坑提示": block.includes("科研避坑提示"),
    "科研应用路径": block.includes("科研应用路径"),
    "学完本课你将能够": block.includes("学完本课你将能够"),
    "本课总结": block.includes("本课总结"),
    "思考题": block.includes("思考题"),
  };
  
  const quizCount = (block.match(/id: "q\d+"/g) || []).length;
  const missing = Object.entries(sections).filter(([,v]) => !v).map(([k]) => k);
  
  console.log(ids[i] + " (" + chars + "字) quiz:" + quizCount + " 缺:[" + (missing.length ? missing.join(",") : "") + "]");
}
