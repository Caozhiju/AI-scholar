import { readFileSync } from "fs";
const c = readFileSync("src/data/courses.ts", "utf8");
const s = c.indexOf('id: "edunlp-002"');
const e = c.indexOf('id: "edunlp-003"', s + 5);
const b = c.slice(s, e);
const qi = b.indexOf("quiz:");
console.log("quiz index:", qi, "block length:", e - s);
if (qi >= 0) console.log("quiz block:", b.slice(qi, qi + 400));
else console.log("NO quiz found");
