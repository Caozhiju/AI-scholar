import { readFileSync } from "fs";

const c = readFileSync("src/data/courses.ts", "utf8");
const s = c.indexOf('id: "edunlp-006"');
const e = c.indexOf('id: "edunlp-007"', s + 5);
const b = c.slice(s, e);

// Find the content closing backtick + comma
// The content is a template literal ending with `,
const btEnd = b.lastIndexOf("`,");
console.log("Content backtick+comma at:", btEnd);
console.log("Context:", b.slice(btEnd - 300, btEnd + 20));
