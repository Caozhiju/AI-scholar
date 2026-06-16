import { readFileSync } from "fs";

const content = readFileSync("src/data/courses.ts", "utf8");
const blocks = content.split(/\n\s+id: "/).slice(1);

const required = ["本课导入", "历史背景", "核心知识", "核心原理拆解", "与传统方法比较", "真实研究案例一", "真实研究案例二", "科研避坑提示", "科研应用路径", "学完本课你将能够", "本课总结", "思考题", "延伸阅读"];

for (const b of blocks) {
  const id = b.match(/^([^"]+)/)?.[1];
  if (!id) continue;
  const chars = (b.match(/[\u4e00-\u9fff]/g) || []).length;
  const missing = required.filter((s) => !b.includes(s));
  const cases = (b.match(/# 真实研究案例/g) || []).length;
  const quizzes = (b.match(/question: "/g) || []).length;
  console.log(id + " (" + chars + "字) 案例:" + cases + " Quiz:" + quizzes + " 缺:" + missing.length + " -> " + missing.join("|"));
}
