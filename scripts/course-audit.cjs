const fs = require("fs");

// ── Helpers ──
function countChinese(s) {
  return (s.match(/[\u4e00-\u9fff]/g) || []).length;
}

function countHeader(s, pattern) {
  return (s.match(new RegExp(pattern, "g")) || []).length;
}

// ── Parse all courses from phase files ──
const phaseFiles = [
  { file: "src/data/courses.phase1.ts", label: "Phase 1 · Python\u79D1\u7814\u57FA\u7840" },
  { file: "src/data/courses.phase2.ts", label: "Phase 2 · \u8BA1\u7B97\u8BED\u8A00\u5B66AI" },
  { file: "src/data/courses.phase3.ts", label: "Phase 3 · \u5927\u6A21\u578BLLM" },
  { file: "src/data/courses.phase4.ts", label: "Phase 4 · AI\u7814\u7A76\u521B\u65B0\u5B9E\u8DF5" },
];

// Extract courses by finding their ID and then bracket-matching the content
function extractCourses(content) {
  const courses = [];
  const idRegex = /id:\s*"(python-\d+|edunlp-\d+|llm-\d+|phase4-\d+)"/g;
  let m;
  while ((m = idRegex.exec(content)) !== null) {
    const id = m[1];
    const start = m.index;

    // Find title
    const seg = content.substring(start, start + 400);
    const titleMatch = seg.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : "(unknown)";

    // Find the enclosing { } block
    let bracePos = start;
    for (let i = start; i >= 0; i--) {
      if (content[i] === "{") { bracePos = i; break; }
    }

    // Extract the entire course block
    let depth = 0, inS = false, inT = false, sc = "";
    let endPos = -1;
    for (let i = bracePos; i < content.length; i++) {
      const ch = content[i], pr = i > 0 ? content[i - 1] : "";
      if (ch === "/" && content[i + 1] === "/" && !inS && !inT) { while (i < content.length && content[i] !== "\n") i++; continue; }
      if (!inT) {
        if (!inS && (ch === '"' || ch === "'")) { inS = true; sc = ch; continue; }
        else if (inS && ch === sc && pr !== "\\") { inS = false; continue; }
      }
      if (!inS) {
        if (!inT && ch === "`") { inT = true; continue; }
        else if (inT && ch === "`" && pr !== "\\") { inT = false; continue; }
      }
      if (inS || inT) continue;
      if (ch === "{" || ch === "[") depth++;
      if (ch === "}" || ch === "]") { depth--; if (depth === 0) { endPos = i + 1; break; } }
    }

    if (endPos < 0) continue;

    const block = content.substring(bracePos, endPos);

    // Extract metrics from block
    const contentMatch = block.match(/content:\s*`([\s\S]*?)`/);
    const contentText = contentMatch ? contentMatch[1] : "";

    const quizMatch = block.match(/quiz:\s*\[/);
    let quizCount = 0;
    if (quizMatch) {
      const quizStart = quizMatch.index;
      let qDepth = 0, qEnd = quizStart;
      for (let i = quizStart; i < block.length; i++) {
        const ch = block[i];
        if (ch === "[") qDepth++;
        if (ch === "]") { qDepth--; if (qDepth === 0) { qEnd = i; break; } }
      }
      const quizBlock = block.substring(quizStart, qEnd);
      quizCount = (quizBlock.match(/\{/g) || []).length;
    }

    const vaMatch = block.match(/visualAssets:\s*\[/);
    let vaCount = 0;
    if (vaMatch) {
      const vaStart = vaMatch.index;
      let vDepth = 0, vEnd = vaStart;
      for (let i = vaStart; i < block.length; i++) {
        const ch = block[i];
        if (ch === "[") vDepth++;
        if (ch === "]") { vDepth--; if (vDepth === 0) { vEnd = i; break; } }
      }
      const vaBlock = block.substring(vaStart, vEnd);
      vaCount = (vaBlock.match(/\{/g) || []).length;
    }

    const kMatch = block.match(/relatedKnowledge:\s*\[([^\]]*)\]/);
    const kCount = kMatch ? (kMatch[1].match(/"[^"]+"/g) || []).length : 0;

    const tMatch = block.match(/researchTasks:\s*\[([^\]]*)\]/);
    const tCount = tMatch ? (tMatch[1].match(/"[^"]+"/g) || []).length : 0;

    const chars = countChinese(contentText);

    // Red line checks
    const reasons = [];
    if (chars < 5000) reasons.push(`\u5B57\u6570${chars}<5000`);
    const cases = Math.max(
      countHeader(contentText, "# \u771F\u5B9E\u7814\u7A76\u6848\u4F8B|# \u771F\u5B9E\u7814\u7A76\u6848\u4F8B\u4E00"),
      countHeader(contentText, "## \u6848\u4F8B")
    );
    if (cases < 2) reasons.push(`\u6848\u4F8B${cases}<2`);
    if (quizCount < 3) reasons.push(`Quiz${quizCount}<3`);
    if (vaCount === 0) reasons.push("\u65E0\u56FE\u89E3");
    if (kCount < 2) reasons.push(`\u77E5\u8BC6\u70B9${kCount}<2`);

    // Risk flags (non-blocking)
    const flags = [];
    if (chars < 3000) flags.push("\u5B57\u6570\u5F02\u5E38\u4F4E");
    if (quizCount < 3) flags.push("Quiz\u4E0D\u8DB3");
    if (vaCount === 0) flags.push("\u65E0\u56FE\u89E3");
    if (kCount === 0) flags.push("\u65E0\u77E5\u8BC6\u70B9\u5173\u8054");

    courses.push({
      id, title, chars, quizCount, vaCount, kCount, tCount, cases,
      score: Math.round((chars >= 5000 ? 50 : chars / 100) + (quizCount >= 3 ? 20 : quizCount * 5) + (vaCount > 0 ? 15 : 0) + (kCount >= 2 ? 15 : kCount * 5)),
      reasons, flags,
    });
  }
  return courses;
}

// ── Main ──
console.log("=".repeat(90));
console.log("LingAI Scholar — \u5B8C\u6574\u8BFE\u7A0B\u8D28\u91CF\u5BA1\u8BA1\u62A5\u544A");
console.log("\u5BA1\u8BA1\u6807\u51C6: \u5B57\u6570\u22655000, \u6848\u4F8B\u22652, Quiz\u22653, \u56FE\u89E3\u22651, \u77E5\u8BC6\u70B9\u22652");
console.log("=".repeat(90));

let totalRedLines = 0;
const reasonCounts = {};
const redLineCourses = [];
const possibleFalsePositives = [];

for (const pf of phaseFiles) {
  const raw = fs.readFileSync(pf.file, "utf8");
  const courses = extractCourses(raw);
  const phaseRedLines = courses.filter(c => c.reasons.length > 0);

  console.log(`\n${"=".repeat(90)}`);
  console.log(pf.label);
  console.log("ID".padEnd(16) + "\u6807\u9898".padEnd(34) + "\u5B57\u6570".padEnd(8) + "\u5F97\u5206".padEnd(8) + "Quiz".padEnd(6) + "\u56FE\u89E3".padEnd(6) + "\u77E5\u8BC6".padEnd(6) + "\u4EFB\u52A1".padEnd(6) + "\u7EA2\u7EBF");
  console.log("-".repeat(90));

  for (const c of courses) {
    const hasRedLine = c.reasons.length > 0;
    const redLineStr = hasRedLine ? c.reasons.join("; ") : "";
    console.log(
      c.id.padEnd(16) +
      (c.title || "").substring(0, 28).padEnd(34) +
      String(c.chars).padEnd(8) +
      String(c.score).padEnd(8) +
      String(c.quizCount).padEnd(6) +
      String(c.vaCount).padEnd(6) +
      String(c.kCount).padEnd(6) +
      String(c.tCount).padEnd(6) +
      (hasRedLine ? "\u274C " + redLineStr : "\u2705")
    );

    // Tally reasons
    for (const r of c.reasons) {
      reasonCounts[r] = (reasonCounts[r] || 0) + 1;
    }

    if (hasRedLine) {
      totalRedLines++;
      redLineCourses.push({ id: c.id, title: c.title, reasons: c.reasons, chars: c.chars, quizCount: c.quizCount, vaCount: c.vaCount, kCount: c.kCount });

      // Check for possible false positives
      if (c.chars < 5000 && c.chars >= 2000 && c.chars < 5000 && c.quizCount >= 3 && c.vaCount > 0) {
        possibleFalsePositives.push({ id: c.id, reason: "\u5B57\u6570" + c.chars + "<5000\u4F46\u5176\u4ED6\u6307\u6807\u826F\u597D" });
      }
      if (c.kCount < 2 && c.kCount >= 1 && c.chars >= 5000) {
        possibleFalsePositives.push({ id: c.id, reason: "\u77E5\u8BC6\u70B9" + c.kCount + "<2\u4F46\u5B57\u6570\u5408\u683C" });
      }
    }
  }
}

console.log(`\n${"=".repeat(90)}`);
console.log("\u7EDF\u8BA1\u603B\u7ED3");
console.log("-".repeat(90));
console.log(`\u7EA2\u7EBF\u8BFE\u7A0B\u603B\u6570: ${totalRedLines}`);
console.log(`\u5404\u7EA2\u7EBF\u539F\u56E0\u51FA\u73B0\u6B21\u6570:`);
const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
for (const [reason, count] of sortedReasons) {
  console.log(`  ${reason}: ${count} \u8BFE\u7A0B`);
}

console.log(`\n\u7591\u4F3C\u8BEF\u5224\u68C0\u67E5:`);
console.log(`  \u4EE5\u4E0B\u7EA2\u7EBF\u53EF\u80FD\u662F\u8BEF\u5224\uFF08\u5176\u4ED6\u6307\u6807\u826F\u597D\uFF09:`);
for (const fp of possibleFalsePositives) {
  console.log(`  ${fp.id}: ${fp.reason}`);
}

console.log(`\n\u7EA2\u7EBF\u8BFE\u7A0B\u8BE6\u7EC6\u5217\u8868:`);
for (const rc of redLineCourses) {
  console.log(`  ${rc.id} [${rc.title}]: ${rc.reasons.join(", ")}`);
}
