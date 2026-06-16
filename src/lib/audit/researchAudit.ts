import { stages } from "@/data/courses"
import { getRelatedTasks } from "@/data/knowledgeGraph"
import { ContentIssue } from "./types"

const TCSL_KEYWORDS = [
  "HSK", "教材", "学习者", "作文", "偏误", "课堂",
  "国际中文教育", "二语习得", "教学", "中介语",
  "汉语水平", "留学生", "语法", "词汇", "口语",
  "写作", "阅读", "听说", "文化", "交际",
]

export function auditResearchCourse(courseId: string): { score: number; max: number; issues: ContentIssue[] } {
  const issues: ContentIssue[] = []
  let score = 10
  const max = 10

  const course = stages.flatMap((s) => s.courses).find((c) => c.id === courseId)
  if (!course) return { score: 0, max, issues: [{ type: "课程未找到", severity: "error", message: "课程不存在" }] }

  const content = course.content

  const keywordCount = TCSL_KEYWORDS.filter((kw) => content.includes(kw)).length
  if (keywordCount < 5) {
    const penalty = Math.min(3, Math.floor((5 - keywordCount) * 0.6))
    score -= penalty
    issues.push({ type: "TCSL关键词不足", severity: "warning", message: `仅含${keywordCount}个TCSL关键词，建议至少5个，扣${penalty}分` })
  }

  const relatedKn = course.relatedKnowledge || []
  const tasks = getRelatedTasks(relatedKn)
  if (tasks.length === 0) {
    score -= 3
    issues.push({ type: "无科研任务关联", severity: "warning", message: "知识点未关联任何科研任务，扣3分" })
  }

  const hasResearchPath = content.includes("科研应用路径")
  if (!hasResearchPath) {
    score -= 2
    issues.push({ type: "缺少应用路径", severity: "error", message: "未包含科研应用路径章节，扣2分" })
  }

  const hasCaseStudy = content.includes("真实研究案例")
  if (!hasCaseStudy) {
    score -= 2
    issues.push({ type: "缺少案例", severity: "error", message: "未包含真实研究案例，扣2分" })
  }

  if (keywordCount >= 8 && tasks.length >= 2) {
    score += 1
  }

  return {
    score: Math.max(0, Math.min(score, max)),
    max,
    issues: issues.sort((a, b) => (a.severity === "error" ? -1 : 1)),
  }
}

export function auditAllResearch(): { courseResults: Map<string, { score: number; max: number; issues: ContentIssue[] }>; totalScore: number; totalMax: number } {
  const courses = stages.flatMap((s) => s.courses).filter((c) => c.status === "published")
  const courseResults = new Map()
  let totalScore = 0
  let totalMax = 0

  for (const course of courses) {
    const result = auditResearchCourse(course.id)
    courseResults.set(course.id, result)
    totalScore += result.score
    totalMax += result.max
  }

  return { courseResults, totalScore, totalMax }
}
