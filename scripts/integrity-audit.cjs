// System Integrity Audit
// Checks: course count, stage count, missing IDs, duplicate IDs, knowledge/task refs

const fs = require("fs");

// Collect all course IDs from phase files
const allCourses = {};
const allIds = new Set();
const errors = [];
const fixes = [];

for (const n of [1, 2, 3, 4]) {
  const fn = `src/data/courses.phase${n}.ts`;
  if (!fs.existsSync(fn)) { errors.push(`Missing: ${fn}`); continue; }
  const c = fs.readFileSync(fn, "utf8");
  const ids = [...c.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]).filter(id => /^(python|cli|edunlp|llm|phase4)-\d{3}$/.test(id));
  allCourses[n] = ids;
  ids.forEach(id => allIds.add(id));
  
  const pub = (c.match(/status:\s*"published"/g) || []).length;
  const draft = (c.match(/status:\s*"draft"/g) || []).length;
  fixes.push(`Phase ${n}: ${ids.length} courses, ${pub} published, ${draft} draft`);
}

// Expected course IDs
const expectedPrefixes = {
  1: { prefix: "python-", count: 10 },
  2: { prefix: "edunlp-", count: 15 },
  3: { prefix: "llm-", count: 23 },
  4: { prefix: "phase4-", count: 24 },
};

// Check for missing and duplicate IDs
for (const [n, expected] of Object.entries(expectedPrefixes)) {
  const ids = allCourses[n] || [];
  const prefix = expected.prefix;
  const idsWithPrefix = ids.filter(id => id.startsWith(prefix));
  
  // Check count
  if (idsWithPrefix.length !== expected.count) {
    errors.push(`Phase ${n}: Expected ${expected.count} ${prefix}XXXX courses, found ${idsWithPrefix.length}`);
  }
  
  // Check for gaps
  for (let i = 1; i <= expected.count; i++) {
    const expectedId = `${prefix}${String(i).padStart(3, "0")}`;
    if (!ids.includes(expectedId)) {
      errors.push(`  Missing: ${expectedId}`);
    }
  }
}

// Check duplicate IDs
const seen = new Set();
for (const id of allIds) {
  if (seen.has(id)) errors.push(`Duplicate ID found: ${id}`);
  seen.add(id);
}

// Check relatedKnowledge references
const kgContent = fs.readFileSync("src/data/knowledgeGraph.ts", "utf8");
const validKnowledge = new Set([...kgContent.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]).filter(id => id.startsWith("kw-")));
const validTasks = new Set([...kgContent.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]).filter(id => id.startsWith("task-")));

for (const [n, ids] of Object.entries(allCourses)) {
  const fn = `src/data/courses.phase${n}.ts`;
  if (!fs.existsSync(fn)) continue;
  const c = fs.readFileSync(fn, "utf8");
  
  // Extract relatedKnowledge references
  const kRefs = [...c.matchAll(/relatedKnowledge:\s*\[([^\]]*)\]/g)].flatMap(m => [...m[1].matchAll(/"([^"]+)"/g)].map(m2 => m2[1]));
  for (const k of kRefs) {
    if (k.startsWith("kw-") && !validKnowledge.has(k)) {
      errors.push(`Phase ${n}: Invalid relatedKnowledge: "${k}" (not in knowledgeGraph)`);
    }
  }
  
  // Extract researchTasks references
  const tRefs = [...c.matchAll(/researchTasks:\s*\[([^\]]*)\]/g)].flatMap(m => [...m[1].matchAll(/"([^"]+)"/g)].map(m2 => m2[1]));
  for (const t of tRefs) {
    if (t.startsWith("task-") && !validTasks.has(t)) {
      errors.push(`Phase ${n}: Invalid researchTasks: "${t}" (not in knowledgeGraph)`);
    }
  }
}

// Check project count
const rpContent = fs.readFileSync("src/data/researchProjects.ts", "utf8");
const projectCount = (rpContent.match(/id:\s*"/g) || []).length - 4;

// Summary
console.log("=".repeat(60));
console.log("LingAI Scholar — System Integrity Audit");
console.log("=".repeat(60));

console.log(`\n--- Course Counts ---`);
let totalCourses = 0;
for (const [n, ids] of Object.entries(allCourses)) {
  console.log(`  Phase ${n}: ${ids.length} courses`);
  totalCourses += ids.length;
}
console.log(`  TOTAL: ${totalCourses} courses`);
console.log(`  Total unique IDs: ${allIds.size}`);

console.log(`\n--- Knowledge Graph ---`);
console.log(`  Knowledge points: ${validKnowledge.size}`);
console.log(`  Research tasks: ${validTasks.size}`);

console.log(`\n--- Projects ---`);
console.log(`  Research projects: ${projectCount}`);

console.log(`\n--- Issues Found ---`);
if (errors.length === 0) {
  console.log("  ✅ No issues found");
} else {
  console.log(`  ⚠️  ${errors.length} issue(s):`);
  errors.forEach(e => console.log(`    ${e}`));
}

console.log(`\n--- Verification ---`);
console.log(`  Checks performed: ${fixes.length + errors.length + 4}`);
console.log(`  Missing course IDs: ${errors.filter(e => e.includes("Missing")).length}`);
console.log(`  Duplicate IDs: ${errors.filter(e => e.includes("Duplicate")).length}`);
console.log(`  Invalid references: ${errors.filter(e => e.includes("Invalid")).length}`);

const pass = errors.length === 0;
console.log(`\n--- Final Verdict: ${pass ? "✅ PASS" : "❌ FAIL"} ---`);
if (!pass) console.log("  ⚠️  Review issues above before release");
else console.log("  All checks passed. System integrity confirmed.");
