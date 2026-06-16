import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");

// Find edunlp-015 and next course
const s = c.indexOf('id: "edunlp-015"');
const e = c.indexOf('id: "edunlp"', s + 5); // "edunlp" without -015 is the stage divider
// But edunlp (stage) comes right after, so find it
const e2 = c.indexOf('id: "llm"', s + 5); // fallback
const endPos = e2;

const b = c.slice(s, endPos);

// Find the content closing backtick+comma
const btEnd = b.lastIndexOf("`,");
console.log("Content backtick+comma at:", btEnd);
console.log("Context (300 before):", b.slice(btEnd - 300, btEnd));
console.log("Context after:", b.slice(btEnd, btEnd + 100));
