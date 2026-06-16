const fs = require("fs");
const c = fs.readFileSync("src/data/phase4Blueprint.ts", "utf8");

const courseRegex = /id:\s*"(phase4-\d+)",[\s\S]*?relatedKnowledge:\s*\[([^\]]*)\][\s\S]*?researchTasks:\s*\[([^\]]*)\]/g;
const courses = [];
let m;
while ((m = courseRegex.exec(c))) {
  const id = m[1], num = parseInt(id.split("-")[1]);
  courses.push({
    id, num, module: num <= 4 ? "M1" : num <= 8 ? "M2" : num <= 12 ? "M3" : num <= 16 ? "M4" : num <= 20 ? "M5" : "M6",
    kps: [...m[2].matchAll(/"([^"]+)"/g)].map(x => x[1]),
    tasks: [...m[3].matchAll(/"([^"]+)"/g)].map(x => x[1]),
  });
}

const audit = courses.filter(c => c.num >= 9);
console.log("Phase 4 Modules 3-6 Overlap Audit\n");

// Per-module KP sets
const modKPs = {};
for (const c of audit) {
  if (!modKPs[c.module]) modKPs[c.module] = { kps: new Set(), courses: [] };
  c.kps.forEach(k => modKPs[c.module].kps.add(k));
  modKPs[c.module].courses.push(c.id);
}

// Cross-module KP sharing
console.log("Cross-module knowledge sharing:");
const mods = Object.keys(modKPs);
let crossShared = 0;
let totalCrossAssign = 0;
for (let i = 0; i < mods.length; i++) {
  for (let j = i + 1; j < mods.length; j++) {
    const shared = [...modKPs[mods[i]].kps].filter(k => modKPs[mods[j]].kps.has(k));
    if (shared.length > 0) {
      console.log(`  ${mods[i]} & ${mods[j]}: ${shared.join(", ")}`);
      crossShared += shared.length;
    }
  }
}
console.log(crossShared === 0 ? "  None — modules are cleanly separated ✓" : "");

// Intra-module KP sharing
console.log("\nIntra-module knowledge sharing (by design):");
for (const mod of mods) {
  const moduleCourses = courses.filter(c => c.module === mod);
  const kmap = {};
  for (const c of moduleCourses) {
    for (const k of c.kps) {
      if (!kmap[k]) kmap[k] = [];
      kmap[k].push(c.id);
    }
  }
  const shared = Object.entries(kmap).filter(([_, ids]) => ids.length >= 2);
  if (shared.length > 0) {
    console.log(`  ${mod}: ${shared.map(([k, ids]) => k + "(" + ids.join(",") + ")").join(", ")}`);
  }
}

// Calculate REAL cross-module rate
const allCourses = audit;
let crossHits = 0;
let totalHits = 0;
for (const c of allCourses) {
  for (const k of c.kps) {
    totalHits++;
    // Check if this KP is used in a different module
    const otherMods = new Set();
    for (const oc of allCourses) {
      if (oc.id !== c.id && oc.kps.includes(k)) otherMods.add(oc.module);
    }
    // Remove own module
    otherMods.delete(c.module);
    if (otherMods.size > 0) crossHits++;
  }
}
const crossRate = totalHits > 0 ? Math.round(crossHits / totalHits * 100) : 0;

console.log(`\n\nCross-module overlap rate: ${crossRate}% (target < 15%)`);
console.log("Intra-module overlap rate: N/A (expected and intentional)");
console.log("\n=== FINAL VERDICT ===");
console.log(crossRate < 15 ? "✓ PASS: Module boundaries are clean. Proceed with M3-M6 content generation." : "⚠ Review needed: Cross-module overlap exceeds 15%");
