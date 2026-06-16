/**
 * Phase 3 Audit Report — standalone (no ts/alias deps)
 * Run: node scripts/p3-audit-report.mjs
 */
import { readFileSync } from "fs"

const SRC = "src/data/courses.ts"
const src = readFileSync(SRC, "utf8")
const lines = src.split("\n")

// Parse all llm course objects by extracting content from between backtick pairs
function parseLLMCourses(src) {
  const courses = []
  // Find each llm course by id, then extract content between backticks
  const idPattern = /id: "(llm-\d+)"/g
  let idMatch
  while ((idMatch = idPattern.exec(src)) !== null) {
    const id = idMatch[1]
    const pos = idMatch.index
    
    // Find the title
    const titleMatch = src.slice(pos, pos + 200).match(/title: "([^"]+)"/)
    if (!titleMatch) continue
    const title = titleMatch[1]
    
    // Find status (search up to 20000 chars since content can be huge)
    const statusMatch = src.slice(pos, pos + 20000).match(/status: "([^"]+)"/)
    const status = statusMatch ? statusMatch[1] : "draft"
    
    // Extract content between backticks — find "content: `" then matching closing backtick+comma
    const fromPos = src.indexOf("content: `", pos)
    if (fromPos === -1) { courses.push({ id, title, status, content: "", cn: 0, quizCount: 0, vaCount: 0, rkCount: 0, caseCount: 0, thinkCount: 0, pitfallCount: 0, keywordCount: 0, hasAppPath: false, hasCases: false, taskCount: 0 }); continue }
    
    const contentStart = fromPos + 10 // skip "content: `"
    // Find the closing backtick followed by comma and newline
    let depth = 0, contentEnd = contentStart
    for (let i = contentStart; i < src.length; i++) {
      if (src[i] === "`" && (src[i+1] === "," || src[i+1] === "\n")) {
        contentEnd = i
        break
      }
    }
    const content = src.slice(contentStart, contentEnd)
    const cn = (content.match(/[\u4e00-\u9fff]/g) || []).length
    
    // Get block from id to end of course object (find the matching closing })
    const endPattern = src.indexOf("    },\n", pos)
    const block = endPattern >= 0 ? src.slice(pos, endPattern + 10) : ""
    
    // Quiz count: count quiz id entries
    const quizSection = block.match(/quiz: \[([\s\S]*?)\],/)
    const quizCount = quizSection ? (quizSection[1].match(/{ id:/g) || []).length : 0
    
    // Visual asset count from block
    const vaCount = (block.match(/type: "/g) || []).length
    
    // Related knowledge count
    const rk = block.match(/relatedKnowledge: \[([^\]]*)\]/)
    const rkCount = rk ? (rk[1].match(/,/g) || []).length + (rk[1].trim().length > 0 ? 1 : 0) : 0
    
    // Case count
    const caseCount = Math.max(
      (content.match(/# 真实研究案例/g) || []).length,
      (content.match(/## 案例/g) || []).length
    )
    
    // Thinking questions
    const thinkCount = (content.match(/Q\d/g) || []).length
    
    // Research keywords
    const keywordCount = (content.match(/HSK|教材|学习者|作文|偏误|课堂|国际中文教育|二语习得|教学|中介语|汉语水平|留学生|语法|词汇|口语|写作|阅读|听说|文化|交际/g) || []).length
    
    const hasAppPath = content.includes("科研应用路径")
    const hasCases = content.includes("真实研究案例")
    
    const tasksMatch = block.match(/researchTasks: \[([^\]]*)\]/)
    const taskCount = tasksMatch ? (tasksMatch[1].match(/"/g) || []).length / 2 : 0
    
    courses.push({ id, title, status, content, cn, quizCount, vaCount, rkCount, caseCount, thinkCount, keywordCount, hasAppPath, hasCases, taskCount, block })
  }
  return courses
}

const courses = parseLLMCourses(src).filter(c => c.status === "published")

// Audit scoring (mirroring contentAudit.ts + researchAudit.ts + systemAudit.ts + knowledgeAudit.ts)
const REQUIRED_SECTIONS = ["本课导入","历史背景","核心知识","核心原理拆解","与传统方法比较","真实研究案例一","真实研究案例二","科研避坑提示","科研应用路径","学完本课你将能够","本课总结","思考题","延伸阅读"]

function auditCourse(c) {
  const issues = { content: [], knowledge: [], system: [], research: [] }
  const { content, cn, quizCount, vaCount, rkCount, caseCount, thinkCount, keywordCount, hasAppPath, hasCases, taskCount, block } = c
  
  // Content (max 30)
  let cs = 30
  if (cn < 5000) { const p = Math.min(10, Math.floor((5000 - cn) / 500)); cs -= p; issues.content.push(`字数${cn}<5000，扣${p}分`) }
  let missingSections = REQUIRED_SECTIONS.filter(s => !block.includes(s) && !(s === "真实研究案例一" && block.includes("案例一：")) && !(s === "真实研究案例二" && block.includes("案例二：")) && !(s === "科研避坑提示" && block.includes("常见误区")))
  if (missingSections.length > 0) { const p = Math.min(missingSections.length * 2, 10); cs -= p; issues.content.push(`缺失${missingSections.join("、")}，扣${p}分`) }
  if (caseCount < 2) { const p = (2 - caseCount) * 3; cs -= Math.min(p, 6); issues.content.push(`案例${caseCount}<2，扣${Math.min(p,6)}分`) }
  if (keywordCount < 10) { const p = Math.min(4, Math.floor((10 - keywordCount) * 0.5)); cs -= p; issues.content.push(`科研关键词${keywordCount}<10，扣${p}分`) }
  if (quizCount < 3) { const p = (3 - quizCount) * 2; cs -= Math.min(p, 4); issues.content.push(`Quiz${quizCount}<3，扣${Math.min(p,4)}分`) }
  if (thinkCount < 3) { const p = (3 - thinkCount); cs -= Math.min(p, 3); issues.content.push(`思考题${thinkCount}<3，扣${Math.min(p,3)}分`) }
  cs = Math.max(0, cs)
  
  // Knowledge (max 25) — simplified: checks rk count, assumes valid
  let ks = 25
  if (rkCount === 0) { ks -= 8; issues.knowledge.push("无知识点关联，扣8分") }
  else if (rkCount < 2) { ks -= 3; issues.knowledge.push(`仅${rkCount}个知识点，扣3分`) }
  // Check if downstream knowledge exists (simplified: assume yes)
  ks = Math.max(0, ks)
  
  // System (max 15)
  let ss = 15
  if (quizCount < 3) { ss -= 4; issues.system.push(`Quiz不足3题，扣4分`) }
  if (rkCount < 2) { ss -= 4; issues.system.push(`知识点不足2个，扣4分`) }
  if (vaCount < 1) { ss -= 4; issues.system.push("无图解，扣4分") }
  if (quizCount >= 3 && rkCount >= 2 && vaCount >= 1) ss += 1 // bonus
  ss = Math.max(0, ss)
  
  // Research (max 10)
  let rs = 10
  if (keywordCount < 5) { const p = Math.min(3, Math.floor((5 - keywordCount) * 0.6)); rs -= p; issues.research.push(`TCSL关键词${keywordCount}<5，扣${p}分`) }
  if (taskCount === 0) { rs -= 3; issues.research.push("无科研任务关联，扣3分") }
  if (!hasAppPath) { rs -= 2; issues.research.push("缺少科研应用路径，扣2分") }
  if (!hasCases) { rs -= 2; issues.research.push("缺少真实研究案例，扣2分") }
  if (keywordCount >= 8 && taskCount >= 2) rs = Math.min(10, rs + 1)
  rs = Math.max(0, Math.min(10, rs))
  
  const total = cs + ks + ss + rs
  const max = 80
  
  const redReasons = []
  if (cn < 5000) redReasons.push(`字数${cn}<5000`)
  if (caseCount < 2) redReasons.push("案例<2")
  if (quizCount < 3) redReasons.push(`Quiz${quizCount}<3`)
  if (vaCount < 1) redReasons.push("无图解")
  if (rkCount < 2) redReasons.push(`知识点${rkCount}<2`)
  
  return { id: c.id, title: c.title, cs, ks, ss, rs, total, max, cn, quizCount, vaCount, rkCount, caseCount, thinkCount, keywordCount, taskCount, issues, redReasons, needsImprovement: redReasons.length > 0 }
}

const results = courses.map(auditCourse)

// ===== Report =====
console.log("=".repeat(64))
console.log("        Phase 3 \u5927\u6A21\u578BLLM\u4E0E\u56FD\u9645\u4E2D\u6587\u6559\u80B2 \u00B7 \u5BA1\u8BA1\u62A5\u544A")
console.log("=".repeat(64))
console.log()

const totalScore = results.reduce((s, r) => s + r.total, 0)
const totalMax = results.length * 80
const avgScore = totalScore / results.length
const avgPct = Math.round(totalScore / totalMax * 100)
const sorted = [...results].sort((a, b) => a.total - b.total)
const lowest = sorted[0]
const highest = sorted[sorted.length - 1]

console.log(`  \u5BA1\u8BA1\u65E5\u671F: 2026-06-11`)
console.log(`  \u8BFE\u7A0B\u6570: ${results.length} \u95E8`)
console.log(`  \u603B\u5F97\u5206: ${totalScore}/${totalMax} (${avgPct}%)`)
console.log(`  \u8BFE\u7A0B\u5E73\u5747\u5206: ${avgScore.toFixed(1)}/80`)
console.log(`  \u6700\u4F4E\u5206\u8BFE\u7A0B: ${lowest.id} "${lowest.title}" \u2014 ${lowest.total}/${lowest.max}`)
console.log(`  \u6700\u9AD8\u5206\u8BFE\u7A0B: ${highest.id} "${highest.title}" \u2014 ${highest.total}/${highest.max}`)
console.log()

// Grade
const grade = avgPct >= 90 ? "\u4F18\u79C0" : avgPct >= 80 ? "\u826F\u597D" : avgPct >= 70 ? "\u5408\u683C" : avgPct >= 60 ? "\u9700\u6539\u8FDB" : "\u9700\u91CD\u6784"

console.log(`  \u7EFC\u5408\u7B49\u7EA7: ${grade} (${avgPct}%)`)
console.log()

// Dimension breakdown
const dims = [
  { name: "\u5185\u5BB9\u8D28\u91CF(30)", total: results.reduce((s, r) => s + r.cs, 0), max: results.length * 30 },
  { name: "\u5B66\u4E60\u903B\u8F91(25)", total: results.reduce((s, r) => s + r.ks, 0), max: results.length * 25 },
  { name: "\u6559\u5B66\u8BBE\u8BA1(15)", total: results.reduce((s, r) => s + r.ss, 0), max: results.length * 15 },
  { name: "\u79D1\u7814\u9002\u914D\u5EA6(10)", total: results.reduce((s, r) => s + r.rs, 0), max: results.length * 10 },
]

console.log("  \u5404\u7EF4\u5EA6\u5F97\u5206\u7387:")
console.log("  " + "-".repeat(40))
for (const d of dims) {
  console.log(`    ${d.name.padEnd(18)} ${d.total}/${d.max} (${Math.round(d.total/d.max*100)}%)`)
}
console.log()

// Risk summary
const redLine = results.filter(r => r.needsImprovement)
console.log(`  \u7EA2\u7EBF\u8BFE\u7A0B: ${redLine.length} \u95E8`)
if (redLine.length > 0) {
  console.log("  " + "-".repeat(56))
  for (const r of redLine) {
    console.log(`    ${r.id} "${r.title}": ${r.redReasons.join("; ")}`)
  }
}
console.log()

// Per-course detail
console.log("  \u5355\u8BFE\u7A0B\u8BC4\u5206\u660E\u7EC6:")
console.log("  " + "-".repeat(60))
for (const r of sorted) {
  const pct = Math.round(r.total / 80 * 100)
  const flag = r.needsImprovement ? " \uD83D\uDD34" : r.total >= 72 ? " \u2705" : " \u26A0\uFE0F"
  console.log(`  ${r.id} ${r.title.slice(0, 20).padEnd(22)} ${pct}% (${r.total}/80)${flag}`)
  // Show issues
  for (const [key, list] of Object.entries(r.issues)) {
    for (const msg of list) {
      console.log(`         [${key}] ${msg}`)
    }
  }
}
console.log()

// Improvement plan
console.log("  \u6574\u6539\u5EFA\u8BAE:")
console.log("  " + "-".repeat(56))
const needFix = results.filter(r => r.needsImprovement || r.total < 72)
for (const r of needFix) {
  console.log(`\n  ${r.id} "${r.title}" (${r.total}/80):`)
  const all = [...r.issues.content, ...r.issues.knowledge, ...r.issues.system, ...r.issues.research]
  for (const msg of all) {
    console.log(`    - ${msg}`)
  }
}
if (needFix.length === 0) {
  console.log("  \u65E0 \u2014 \u6240\u6709\u8BFE\u7A0B\u5747\u8FBE\u6807")
}
console.log()

// ===== Quality Sprint Plan =====
console.log("=".repeat(64))
console.log("        Phase 3 Quality Sprint Plan")
console.log("=".repeat(64))
console.log()

// Identify improvements
console.log("  [Sprint 1] \u7EA2\u7EBF\u6574\u6539 (S-Level)")
console.log("  " + "-".repeat(40))
if (redLine.length > 0) {
  for (const r of redLine) {
    console.log(`    ${r.id}: ${r.redReasons.join(", ")}`)
  }
} else {
  console.log("    (\u65E0\u7EA2\u7EBF\u8BFE\u7A0B)")
}
console.log()

console.log("  [Sprint 2] \u5E94\u7528\u578B\u9898\u76EE\u8D28\u91CF\u63D0\u5347 (A-Level)")
console.log("  " + "-".repeat(40))
const lowQuizApp = results.filter(r => r.quizCount < 5)
if (lowQuizApp.length > 0) {
  for (const r of lowQuizApp) {
    console.log(`    ${r.id}: Quiz ${r.quizCount} \u9898\uFF0C\u76EE\u6807 5+`)
  }
} else {
  console.log("    (\u6BCF\u8BFE\u5747\u5DF25\u9898Quiz)")
}
console.log()

console.log("  [Sprint 3] \u77E5\u8BC6\u56FE\u8C31\u4E0E\u79D1\u7814\u4EFB\u52A1\u5B8C\u5584 (K-Level)")
console.log("  " + "-".repeat(40))
const lowTask = results.filter(r => r.taskCount === 0)
if (lowTask.length > 0) {
  for (const r of lowTask) {
    console.log(`    ${r.id}: \u65E0researchTasks\u5173\u8054`)
  }
} else {
  console.log("    (\u6BCF\u8BFE\u5747\u5DF2\u5173\u8054researchTasks)")
}
console.log()

console.log("  [Sprint 4] \u53EF\u89C6\u5316\u4E0E\u591A\u5A92\u4F53\u589E\u5F3A (V-Level)")
console.log("  " + "-".repeat(40))
const lowVA = results.filter(r => r.vaCount < 2)
if (lowVA.length > 0) {
  for (const r of lowVA) {
    console.log(`    ${r.id}: VisualAssets ${r.vaCount} \u4E2A\uFF0C\u76EE\u6807 2+`)
  }
} else {
  console.log("    (\u6BCF\u8BFE\u5747\u5DF22\u4E2AVisualAssets)")
}
console.log()

console.log("  [Sprint 5] \u5B66\u672F\u5B8C\u6574\u6027\u5BA1\u67E5 (C-Level)")
console.log("  " + "-".repeat(40))
const lowChars = results.filter(r => r.cn < 6000)
if (lowChars.length > 0) {
  for (const r of lowChars) {
    console.log(`    ${r.id}: ${r.cn} \u5B57\uFF0C\u76EE\u6807 6000+`)
  }
} else {
  console.log("    (\u6BCF\u8BFE\u57476000+\u5B57)")
}
console.log()

console.log("=".repeat(64))
