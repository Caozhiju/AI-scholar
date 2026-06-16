import { stages } from "@/data/courses"
import { knowledge } from "@/data/knowledgeGraph"
import { ContentIssue } from "./types"

export function auditKnowledgeCourse(courseId: string): { score: number; max: number; issues: ContentIssue[] } {
  const issues: ContentIssue[] = []
  let score = 25
  const max = 25

  const course = stages.flatMap((s) => s.courses).find((c) => c.id === courseId)
  if (!course) return { score: 0, max, issues: [{ type: "课程未找到", severity: "error", message: "课程不存在" }] }

  const related = course.relatedKnowledge || []

  if (related.length === 0) {
    score -= 8
    issues.push({ type: "无知识点关联", severity: "error", message: "未关联任何知识点，扣8分" })
  } else {
    const valid = related.filter((id) => knowledge.some((k) => k.id === id))
    if (valid.length < related.length) {
      const invalid = related.filter((id) => !knowledge.some((k) => k.id === id))
      score -= Math.min(4, invalid.length * 2)
      issues.push({ type: "无效知识点", severity: "error", message: `${invalid.join("、")}在knowledgeGraph.ts中不存在，扣${Math.min(4, invalid.length * 2)}分` })
    }

    if (related.length < 2) {
      score -= 3
      issues.push({ type: "知识点过少", severity: "warning", message: `仅关联${related.length}个知识点，建议至少2个，扣3分` })
    }
  }

  const kn = knowledge.filter((k) => related.includes(k.id))
  const prereqs = kn.flatMap((k) => k.prerequisites || [])
  const missingPrereqs = prereqs.filter((p) => !related.includes(p))

  if (missingPrereqs.length > 0) {
    const missingCourses = stages
      .flatMap((s) => s.courses)
      .filter((c) => {
        if (c.status !== "published") return false
        const cKn = c.relatedKnowledge || []
        return missingPrereqs.some((mp) => cKn.includes(mp))
      })
    if (missingCourses.length === 0) {
      score -= Math.min(5, missingPrereqs.length * 2)
      issues.push({ type: "前置知识缺失", severity: "warning", message: `知识点前置要求 ${missingPrereqs.join("、")} 未被任何已发布课程覆盖，扣${Math.min(5, missingPrereqs.length * 2)}分` })
    }
  }

  const downstream = knowledge.filter((k) => k.prerequisites?.some((p) => related.includes(p)))
  if (downstream.length === 0) {
    score -= 3
    issues.push({ type: "无后继知识", severity: "warning", message: "当前知识点没有后续课程承接，扣3分" })
  }

  const isolated = kn.filter((k) => {
    if (!k.prerequisites || k.prerequisites.length === 0) return false
    return !k.prerequisites.some((p) => knowledge.some((kp) => kp.id === p))
  })
  if (isolated.length > 0) {
    score -= 2
    issues.push({ type: "孤立知识点", severity: "warning", message: `${isolated.map((k) => k.label).join("、")}前置知识在知识图谱中不存在，扣2分` })
  }

  return {
    score: Math.max(0, score),
    max,
    issues: issues.sort((a, b) => (a.severity === "error" ? -1 : 1)),
  }
}

export function auditAllKnowledge(): { courseResults: Map<string, { score: number; max: number; issues: ContentIssue[] }>; totalScore: number; totalMax: number } {
  const courses = stages.flatMap((s) => s.courses).filter((c) => c.status === "published")
  const courseResults = new Map()
  let totalScore = 0
  let totalMax = 0

  for (const course of courses) {
    const result = auditKnowledgeCourse(course.id)
    courseResults.set(course.id, result)
    totalScore += result.score
    totalMax += result.max
  }

  return { courseResults, totalScore, totalMax }
}
