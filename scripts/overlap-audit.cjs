const fs = require("fs");
const c = fs.readFileSync("src/data/phase4Blueprint.ts", "utf8");

// Extract course data
const courseRegex = /id:\s*"(phase4-\d+)",[\s\S]*?relatedKnowledge:\s*\[([^\]]*)\][\s\S]*?researchTasks:\s*\[([^\]]*)\]/g;
const courses = [];
let match;
while ((match = courseRegex.exec(c)) !== null) {
  const id = match[1];
  const num = parseInt(id.split("-")[1]);
  const kps = [...match[2].matchAll(/"([^"]+)"/g)].map(m => m[1]);
  const tasks = [...match[3].matchAll(/"([^"]+)"/g)].map(m => m[1]);
  courses.push({ id, num, kps, tasks });
}

const audit = courses.filter(c => c.num >= 9 && c.num <= 24);
console.log("Auditing " + audit.length + " courses (009-024)\n");

// Knowledge overlap
const kmap = {};
for (const c of audit) {
  for (const k of c.kps) {
    if (!kmap[k]) kmap[k] = [];
    kmap[k].push(c.id);
  }
}
const shared = Object.entries(kmap).filter(([_, ids]) => ids.length >= 2);
console.log("=== A. Shared Knowledge Points ===");
if (shared.length === 0) {
  console.log("  None — each KP is unique to one course");
} else {
  for (const [k, ids] of shared) {
    console.log("  " + k + ": " + ids.join(", "));
  }
}

// Task overlap
const tmap = {};
for (const c of audit) {
  for (const t of c.tasks) {
    if (!tmap[t]) tmap[t] = [];
    tmap[t].push(c.id);
  }
}
const tShared = Object.entries(tmap).filter(([_, ids]) => ids.length >= 2);
console.log("\n=== B. Shared Research Tasks ===");
if (tShared.length === 0) {
  console.log("  None — each task is unique to one course");
} else {
  for (const [t, ids] of tShared) {
    console.log("  " + t + ": " + ids.join(", "));
  }
}

// Coverage
const allKP = [
  "kw-phase4-cross-lingual", "kw-phase4-speech-analysis", "kw-phase4-knowledge-graph", "kw-phase4-learning-analytics",
  "kw-phase4-statistical-test", "kw-phase4-ablation-study", "kw-phase4-human-ai-collab", "kw-phase4-longitudinal-study",
  "kw-phase4-literature-review", "kw-phase4-academic-writing", "kw-phase4-paper-structure", "kw-phase4-publication",
  "kw-phase4-curriculum-design", "kw-phase4-adaptive-assessment", "kw-phase4-intelligent-resource", "kw-phase4-frontier-research",
];
const allTasks = [
  "task-cross-lingual-study", "task-speech-error-analysis", "task-knowledge-graph-study",
  "task-ablation-experiment", "task-human-ai-comparison", "task-longitudinal-tracking",
  "task-literature-review", "task-ai-writing-practice", "task-paper-submission",
  "task-curriculum-innovation", "task-adaptive-test-design", "task-intelligent-textbook", "task-research-proposal",
];

const coveredKP = new Set();
const coveredT = new Set();
for (const c of audit) {
  c.kps.forEach(k => coveredKP.add(k));
  c.tasks.forEach(t => coveredT.add(t));
}
const missingKP = allKP.filter(k => !coveredKP.has(k));
const missingT = allTasks.filter(t => !coveredT.has(t));

console.log("\n=== C. Coverage Gaps ===");
if (missingKP.length > 0) console.log("  Missing KPs: " + missingKP.join(", "));
if (missingT.length > 0) console.log("  Missing tasks: " + missingT.join(", "));
if (missingKP.length === 0 && missingT.length === 0) console.log("  All knowledge and tasks covered");

// Overlap rate
const totalKAssign = audit.reduce((s, c) => s + c.kps.length, 0);
const overlapKAssign = audit.reduce((s, c) => s + c.kps.filter(k => kmap[k].length > 1).length, 0);
const rate = totalKAssign > 0 ? Math.round(overlapKAssign / totalKAssign * 100) : 0;

console.log("\n=== D. Overlap Metrics ===");
console.log("  Knowledge coverage: " + coveredKP.size + "/" + allKP.length + " = " + Math.round(coveredKP.size / allKP.length * 100) + "%");
console.log("  Task coverage: " + coveredT.size + "/" + allTasks.length + " = " + Math.round(coveredT.size / allTasks.length * 100) + "%");
console.log("  Overlap rate: " + rate + "% (target < 15%)");

// Matrix
console.log("\n\n=== Coverage Matrix: Course x Knowledge ===");
const kpShort = allKP.map(k => k.replace("kw-phase4-", "").substring(0, 10).padEnd(12));
console.log("".padEnd(16) + kpShort.join(""));
for (const c of audit) {
  console.log(c.id.padEnd(16) + allKP.map(k => c.kps.includes(k) ? " ■" : " .").join("".padEnd(11)));
}

console.log("\n\n=== Coverage Matrix: Course x Tasks ===");
const tShort = allTasks.map(t => t.replace("task-", "").substring(0, 10).padEnd(12));
console.log("".padEnd(16) + tShort.join(""));
for (const c of audit) {
  console.log(c.id.padEnd(16) + allTasks.map(t => c.tasks.includes(t) ? " ■" : " .").join("".padEnd(11)));
}

console.log("\n\n=== Final Report ===");
console.log("Overlap rate: " + rate + "% — " + (rate < 15 ? "✓ PASS" : "⚠ EXCEEDS 15%"));
console.log("KP coverage: " + Math.round(coveredKP.size / allKP.length * 100) + "% — " + (coveredKP.size / allKP.length >= 0.95 ? "✓ PASS" : "⚠ BELOW 95%"));
console.log("Task coverage: " + Math.round(coveredT.size / allTasks.length * 100) + "% — " + (coveredT.size / allTasks.length >= 0.95 ? "✓ PASS" : "⚠ BELOW 95%"));
console.log("Courses: " + audit.length + " across M3/M4/M5/M6");
console.log("No course has shared KPs: " + (shared.length === 0 ? "✓ TRUE" : "⚠ SHARED EXISTS"));
console.log("No course has shared tasks: " + (tShared.length === 0 ? "✓ TRUE" : "⚠ SHARED EXISTS"));
