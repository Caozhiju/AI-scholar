import { stages } from "@/data/courses"
import { knowledge, researchTasks } from "@/data/knowledgeGraph"
import { researchProjects } from "@/data/researchProjects"
import { auditContentCourse } from "./contentAudit"
import { auditKnowledgeCourse } from "./knowledgeAudit"
import { auditResearchCourse } from "./researchAudit"
import { auditSystemIntegrity } from "./systemAudit"
import { ContentIssue, CourseAudit, StageAudit, SystemAudit, getGrade, type ProjectCoverage } from "./types"
import { generateRemediationPlan } from "@/data/remediationPlan"

function countChineseChars(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length
}

export function runFullAudit(): SystemAudit {
  const published = stages.flatMap((s) => s.courses).filter((c) => c.status === "published")
  const courseReports: CourseAudit[] = []

  const systemResult = auditSystemIntegrity()

  for (const course of published) {
    const content = auditContentCourse(course)
    const knowledge = auditKnowledgeCourse(course.id)
    const research = auditResearchCourse(course.id)
    const system = systemResult.courseResults.get(course.id) || { score: 0, max: 15, issues: [] as ContentIssue[] }

    const total = content.score + knowledge.score + system.score + research.score
    const totalMax = content.max + knowledge.max + system.max + research.max

    const riskFlags: string[] = []
    const redLineReasons: string[] = []
    const chars = countChineseChars(course.content)
    if (chars < 3000) riskFlags.push("字数异常低")
    if (!course.quiz || course.quiz.length < 3) riskFlags.push("Quiz不足")
    if (!course.visualAssets || course.visualAssets.length === 0) riskFlags.push("无图解")
    if ((course.relatedKnowledge || []).length === 0) riskFlags.push("无知识点关联")

    if (chars < 5000) redLineReasons.push(`字数${chars}<5000`)
    const casePattern1 = (course.content.match(/# 真实研究案例/g) || []).length
    const casePattern2 = (course.content.match(/## 案例/g) || []).length
    const totalCases = Math.max(casePattern1, casePattern2)
    if (totalCases < 2) redLineReasons.push("案例<2")
    if (!course.quiz || course.quiz.length < 3) redLineReasons.push(`Quiz${course.quiz?.length||0}<3`)
    if (!course.visualAssets || course.visualAssets.length < 1) redLineReasons.push("无图解")
    if ((course.relatedKnowledge || []).length < 2) redLineReasons.push(`知识点${course.relatedKnowledge?.length||0}<2`)

    courseReports.push({
      courseId: course.id,
      title: course.title,
      stageId: stages.find((s) => s.courses.some((c) => c.id === course.id))?.id || "",
      contentScore: content.score,
      contentMax: content.max,
      contentIssues: content.issues,
      knowledgeScore: knowledge.score,
      knowledgeMax: knowledge.max,
      knowledgeIssues: knowledge.issues,
      designScore: system.score,
      designMax: system.max,
      designIssues: system.issues,
      integrityScore: system.score,
      integrityMax: system.max,
      integrityIssues: system.issues,
      researchScore: research.score,
      researchMax: research.max,
      researchIssues: research.issues,
      totalScore: total,
      totalMax,
      riskFlags,
      needsImprovement: redLineReasons.length > 0,
      redLineReasons,
    })
  }

  const stageReports: StageAudit[] = stages
    .filter((s) => s.courses.some((c) => c.status === "published"))
    .map((stage) => {
      const stageCourses = stage.courses.filter((c) => c.status === "published")
      const reports = stageCourses.map((c) => courseReports.find((r) => r.courseId === c.id)!)
      const totalChars = stageCourses.reduce((sum, c) => sum + countChineseChars(c.content), 0)
      const publishedCount = stageCourses.length
      const totalCount = stage.courses.length
      const avgScore = reports.length > 0 ? reports.reduce((s, r) => s + r.totalScore, 0) / reports.length : 0

      return {
        stageId: stage.id,
        title: stage.title,
        courseCount: publishedCount,
        totalChars,
        avgChars: publishedCount > 0 ? Math.round(totalChars / publishedCount) : 0,
        completionRate: Math.round((publishedCount / totalCount) * 100),
        avgScore: Math.round(avgScore * 10) / 10,
      }
    })

  let totalScore = courseReports.reduce((s, r) => s + r.totalScore, 0)
  let totalMax = courseReports.reduce((s, r) => s + r.totalMax, 0)
  const count = courseReports.length

  const dims = [
    { name: "内容质量", score: courseReports.reduce((s, r) => s + r.contentScore, 0), max: courseReports.reduce((s, r) => s + r.contentMax, 0) },
    { name: "学习逻辑", score: courseReports.reduce((s, r) => s + r.knowledgeScore, 0), max: courseReports.reduce((s, r) => s + r.knowledgeMax, 0) },
    { name: "教学设计", score: courseReports.reduce((s, r) => s + r.designScore, 0), max: courseReports.reduce((s, r) => s + r.designMax, 0) },
    { name: "系统完整性", score: courseReports.reduce((s, r) => s + r.integrityScore, 0), max: courseReports.reduce((s, r) => s + r.integrityMax, 0) },
    { name: "科研适配度", score: courseReports.reduce((s, r) => s + r.researchScore, 0), max: courseReports.reduce((s, r) => s + r.researchMax, 0) },
  ].map((d) => ({ ...d, pct: d.max > 0 ? Math.round((d.score / d.max) * 100) : 0 }))

  // ── Project Coverage ──
  const allCourseIds = new Set(stages.flatMap(s => s.courses.map(c => c.id)))
  const allKnowledgeIds = new Set(knowledge.map(k => k.id))
  const allTaskIds = new Set(researchTasks.map(t => t.id))
  const coveredCourseIds = new Set<string>()
  const coveredKnowledgeIds = new Set<string>()
  const coveredTaskIds = new Set<string>()
  for (const p of researchProjects) {
    p.relatedCourseIds.forEach(id => coveredCourseIds.add(id))
    p.relatedKnowledgeIds.forEach(id => coveredKnowledgeIds.add(id))
    p.relatedTaskIds.forEach(id => coveredTaskIds.add(id))
  }
  const covMax = 100
  const covKnowledgeScore = allKnowledgeIds.size > 0 ? Math.round((coveredKnowledgeIds.size / allKnowledgeIds.size) * covMax) : 0
  const covTaskScore = allTaskIds.size > 0 ? Math.round((coveredTaskIds.size / allTaskIds.size) * covMax) : 0
  const covCourseScore = allCourseIds.size > 0 ? Math.round((coveredCourseIds.size / allCourseIds.size) * covMax) : 0
  const researchCovScore = Math.round((covKnowledgeScore + covTaskScore + covCourseScore) / 3)
  dims.push({ name: "科研覆盖率", score: researchCovScore, max: covMax, pct: researchCovScore })
  totalScore += researchCovScore
  totalMax += covMax

  const riskSummary: { type: string; count: number; courses: string[] }[] = []
  const riskMap = new Map<string, string[]>()
  for (const report of courseReports) {
    for (const flag of report.riskFlags) {
      if (!riskMap.has(flag)) riskMap.set(flag, [])
      riskMap.get(flag)!.push(report.courseId)
    }
  }
  for (const [type, courses] of riskMap) {
    riskSummary.push({ type, count: courses.length, courses })
  }

  const remediationPlan = generateRemediationPlan()

  const projectCoverage: ProjectCoverage = {
    totalProjects: researchProjects.length,
    coveredCourses: coveredCourseIds.size,
    coveredKnowledge: coveredKnowledgeIds.size,
    coveredTasks: coveredTaskIds.size,
    courseCoverageRate: allCourseIds.size > 0 ? Math.round((coveredCourseIds.size / allCourseIds.size) * 100) : 0,
    knowledgeCoverageRate: allKnowledgeIds.size > 0 ? Math.round((coveredKnowledgeIds.size / allKnowledgeIds.size) * 100) : 0,
    taskCoverageRate: allTaskIds.size > 0 ? Math.round((coveredTaskIds.size / allTaskIds.size) * 100) : 0,
  }

  return {
    totalScore,
    totalMax,
    grade: getGrade(totalScore, totalMax),
    dimensions: dims,
    stageReports,
    courseReports,
    riskSummary,
    remediationPlan,
    redLineCourses: courseReports.filter((r) => r.needsImprovement).map((r) => ({
      courseId: r.courseId,
      title: r.title,
      reasons: r.redLineReasons,
    })),
    projectCoverage,
  }
}
