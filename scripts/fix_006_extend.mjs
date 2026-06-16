import { readFileSync, writeFileSync } from "fs";

const fp = "src/data/courses.ts";
const c = readFileSync(fp, "utf8");

// Find edunlp-006 content end
const s = c.indexOf('id: "edunlp-006"');
const e = c.indexOf('id: "edunlp-007"', s + 5);
const b = c.slice(s, e);

// Find the content closing backtick+comma
const btEnd = b.lastIndexOf("`,");
const beforeBt = b.slice(btEnd - 30, btEnd);

console.log("Context before backtick:", JSON.stringify(beforeBt));
console.log("Context after:", JSON.stringify(b.slice(btEnd, btEnd + 50)));

// Now find the last 思考题 answer that ends content
const lastThinkEnd = b.lastIndexOf("> 参考答案提示：");
const answerBlock = b.slice(lastThinkEnd, btEnd);
console.log("Last answer block:", answerBlock.slice(0, 200));
