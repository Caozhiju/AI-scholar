import { stages } from "@/data/courses"
import { ContentIssue } from "./types"

export function auditSystemIntegrity(): {
  courseResults: Map<string, { score: number; max: number; issues: ContentIssue[] }>
  totalScore: number
  totalMax: number
  summary: { type: string; count: number; courses: string[] }[]
} {
  const courses = stages.flatMap((s) => s.courses).filter((c) => c.status === "published")
  const courseResults = new Map()
  let totalScore = 0
  const totalMax = courses.length * 15

  const missingQuiz: string[] = []
  const missingKnowledge: string[] = []
  const missingVisual: string[] = []
  const missingTasks: string[] = []

  for (const course of courses) {
    const issues: ContentIssue[] = []
    let score = 15

    const hasQuiz = course.quiz && course.quiz.length >= 3
    if (!hasQuiz) {
      missingQuiz.push(course.id)
      score -= 4
      issues.push({ type: "无Quiz", severity: "error", message: "缺少Quiz或Quiz不足3题，扣4分" })
    }

    const hasKnowledge = (course.relatedKnowledge || []).length >= 2
    if (!hasKnowledge) {
      missingKnowledge.push(course.id)
      score -= 4
      issues.push({ type: "知识点关联不足", severity: "error", message: "知识点关联少于2个，扣4分" })
    }

    const hasVisual = course.visualAssets && course.visualAssets.length > 0
    if (!hasVisual) {
      missingVisual.push(course.id)
      score -= 4
      issues.push({ type: "无图解", severity: "warning", message: "缺少visualAssets图解，扣4分" })
    }

    if (hasQuiz && hasKnowledge && hasVisual) {
      score += 1
    }

    totalScore += Math.max(0, score)
    courseResults.set(course.id, { score: Math.max(0, score), max: 15, issues })
  }

  const summary = [
    { type: "无Quiz课程", count: missingQuiz.length, courses: missingQuiz },
    { type: "无知识点课程", count: missingKnowledge.length, courses: missingKnowledge },
    { type: "无图解课程", count: missingVisual.length, courses: missingVisual },
  ].filter((s) => s.count > 0)

  return { courseResults, totalScore, totalMax, summary }
}
