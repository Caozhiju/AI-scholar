const fs = require("fs");

console.log("=".repeat(90));
console.log("LingAI Scholar \u2014 \u5168\u8BFE\u7A0B\u603B\u89C8");
console.log("=".repeat(90));

const phases = {};
for (const n of [1, 2, 3, 4]) {
  const fn = "src/data/courses.phase" + n + ".ts";
  if (!fs.existsSync(fn)) continue;
  const c = fs.readFileSync(fn, "utf8");
  const courses = new Map(); // id -> { title, difficulty, minutes }
  
  // Extract courses by finding blocks that have id matching course pattern
  // Split into course blocks by finding `id: "xxx-nnn"`
  const regex = /id:\s*"(python-\d+|cli-\d+|edunlp-\d+|llm-\d+|phase4-\d+)"/g;
  let m;
  while ((m = regex.exec(c)) !== null) {
    const id = m[1];
    const start = m.index;
    // Get the surrounding block (find the { before and } after by bracket count)
    const before = c.substring(Math.max(0, start - 200), start);
    const braceStart = before.lastIndexOf("{");
    const blockStart = start - (200 - braceStart);
    
    // Walk from id to find status, title, difficulty
    const seg = c.substring(start, start + 300);
    const titleM = seg.match(/title:\s*"([^"]+)"/);
    const title = titleM ? titleM[1] : "(unknown)";
    const diffM = seg.match(/difficulty:\s*"([^"]+)"/);
    const diff = diffM ? diffM[1] : "";
    const minM = seg.match(/estimatedMinutes:\s*(\d+)/);
    const min = minM ? minM[1] : "";
    // Match both status: "published" and "status": "published"
    const statusM = seg.match(/["']?status["']?\s*:\s*"(draft|published)"/);
    const status = statusM ? statusM[1] : "unknown";
    
    // Only take the first occurrence of each ID
    if (!courses.has(id)) {
      courses.set(id, { title, diff, min, status });
    }
  }
  
  phases[n] = Array.from(courses.values());
  phases[n].forEach((c, i) => { c.id = Array.from(courses.keys())[i]; });
  // Actually, let's store as array of objects with id
  const result = [];
  for (const [id, data] of courses) {
    result.push({ id, ...data });
  }
  phases[n] = result;
}

const phaseNames = {
  1: "Phase 1 | Python\u79D1\u7814\u57FA\u7840",
  2: "Phase 2 | \u8BA1\u7B97\u8BED\u8A00\u5B66AI",
  3: "Phase 3 | \u5927\u6A21\u578BLLM",
  4: "Phase 4 | AI\u7814\u7A76\u521B\u65B0\u5B9E\u8DF5",
};

const header = "ID".padEnd(16) + "Title".padEnd(42) + "Diff".padEnd(8) + "Min".padEnd(6) + "Status";

for (const [n, courses] of Object.entries(phases)) {
  console.log("\n" + "=".repeat(90));
  console.log(phaseNames[n] + " (" + courses.length + " courses)");
  console.log(header);
  console.log("-".repeat(90));
  for (const c of courses) {
    const mark = c.status === "published" ? "\u2705" : "\u23F3";
    console.log("  " + c.id.padEnd(14) + " " + (c.title || "").padEnd(40) + " " + c.diff.padEnd(6) + " " + c.min.padEnd(4) + " " + mark);
  }
}

console.log("\n" + "=".repeat(90));
console.log("SUMMARY");
console.log("-".repeat(90));
let total = 0, pub = 0;
for (const [n, courses] of Object.entries(phases)) {
  const p = courses.filter(c => c.status === "published").length;
  console.log("  " + phaseNames[n] + ": " + courses.length + " courses (" + p + " published)");
  total += courses.length;
  pub += p;
}
console.log("-".repeat(90));
console.log("  TOTAL: " + total + " courses (" + pub + " published, " + (total - pub) + " draft)");
console.log("  Publish rate: " + Math.round(pub / total * 100) + "%");
console.log("=".repeat(90));
