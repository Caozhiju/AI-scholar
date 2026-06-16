import { Course, stages } from "@/data/courses"
import { REQUIRED_SECTIONS, ContentIssue } from "./types"

const RESEARCH_KEYWORDS = [
  "HSK", "教材", "学习者", "作文", "偏误", "课堂",
  "国际中文教育", "二语习得", "教学",
]

function countChineseChars(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length
}

function hasSection(content: string, required: string): boolean {
  if (content.includes(required)) return true
  const aliases: Record<string, string[]> = {
    "核心原理拆解": [],
    "与传统方法比较": ["NLP vs 传统语言学", "与传统语言学比较", "传统方法比较", "与传统方法", "与传统语言学方法", "与传统研究"],
    "真实研究案例一": ["案例一：", "案例一:"],
    "真实研究案例二": ["案例二：", "案例二:"],
    "延伸阅读": [],
    "历史背景": [],
    "核心知识": [],
    "科研避坑提示": ["常见误区"],
    "本课导入": [],
    "学完本课你将能够": [],
    "本课总结": [],
    "思考题": [],
    "科研应用路径": [],
  }
  const alts = aliases[required]
  if (!alts) return false
  return alts.some((a) => content.includes(a))
}

function findMissingSections(content: string): string[] {
  return REQUIRED_SECTIONS.filter((s) => !content.includes(s) && !hasSection(content, s))
}

function countKeywords(text: string): number {
  return RESEARCH_KEYWORDS.filter((kw) => text.includes(kw)).length
}

function countSection(title: string, content: string): number {
  const idx = content.indexOf(title)
  if (idx === -1) return 0
  const rest = content.slice(idx + title.length)
  const lines = rest.split("\n")
  let count = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("**") && trimmed.includes("**")) count++
  }
  return count
}

export function auditContentCourse(course: Course): { score: number; max: number; issues: ContentIssue[] } {
  const issues: ContentIssue[] = []
  let score = 30
  const max = 30

  const chineseCharCount = countChineseChars(course.content)

  if (chineseCharCount < 5000) {
    const penalty = Math.min(10, Math.floor((5000 - chineseCharCount) / 500))
    score -= penalty
    issues.push({ type: "字数不足", severity: "error", message: `中文字数 ${chineseCharCount}，低于5000，扣${penalty}分` })
  }

  const missing = findMissingSections(course.content)
  if (missing.length > 0) {
    const penalty = missing.length * 2
    score -= Math.min(penalty, 10)
    issues.push({ type: "缺失章节", severity: "error", message: `缺少 ${missing.join("、")}，扣${Math.min(penalty, 10)}分` })
  }

  const case1Count = (course.content.match(/# 真实研究案例/g) || []).length
  const case2Count = (course.content.match(/## 案例/g) || []).length
  const totalCaseCount = Math.max(case1Count, case2Count)
  if (totalCaseCount < 2) {
    const penalty = (2 - totalCaseCount) * 3
    score -= Math.min(penalty, 6)
    issues.push({ type: "案例不足", severity: "error", message: `科研案例 ${totalCaseCount}个，需要至少2个，扣${Math.min(penalty, 6)}分` })
  }

  const researchKeywordDensity = countKeywords(course.content)
  if (researchKeywordDensity < 10) {
    const penalty = Math.min(4, Math.floor((10 - researchKeywordDensity) * 0.5))
    score -= penalty
    issues.push({ type: "科研覆盖率低", severity: "warning", message: `科研关键词仅${researchKeywordDensity}次，扣${penalty}分` })
  }

  if (!course.quiz || course.quiz.length < 3) {
    const count = course.quiz?.length || 0
    const penalty = (3 - count) * 2
    score -= Math.min(penalty, 4)
    issues.push({ type: "Quiz不足", severity: "error", message: `Quiz ${count}题，需要至少3题，扣${Math.min(penalty, 4)}分` })
  }

  const thinkCount = countSection("思考题", course.content)
  if (thinkCount < 3) {
    const penalty = (3 - thinkCount) * 1
    score -= Math.min(penalty, 3)
    issues.push({ type: "思考题不足", severity: "warning", message: `思考题 ${thinkCount}道，需要至少3道，扣${Math.min(penalty, 3)}分` })
  }

  return {
    score: Math.max(0, score),
    max,
    issues: issues.sort((a, b) => (a.severity === "error" ? -1 : 1)),
  }
}

export function auditAllContent(): { courseResults: Map<string, { score: number; max: number; issues: ContentIssue[] }>; totalScore: number; totalMax: number } {
  const courses = stages.flatMap((s) => s.courses).filter((c) => c.status === "published")
  const courseResults = new Map()
  let totalScore = 0
  let totalMax = 0

  for (const course of courses) {
    const result = auditContentCourse(course)
    courseResults.set(course.id, result)
    totalScore += result.score
    totalMax += result.max
  }

  return { courseResults, totalScore, totalMax }
}
