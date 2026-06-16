export type CourseStatus = "draft" | "reviewing" | "published"

export const requiredSections = [
  "# 本课导入",
  "# 核心知识",
  "# 语言学研究案例",
  "# 科研避坑提示",
  "# 本课总结",
]

export const requiredThinkingQuestions = 2
export const requiredQuizQuestions = 3

export interface CourseValidationReport {
  courseId: string
  title: string
  status: string
  hasContent: boolean
  contentSections: { section: string; found: boolean }[]
  hasQuiz: boolean
  quizCount: number
  hasRelatedKnowledge: boolean
  hasWhyLearn: boolean
  hasNextSkill: boolean
  completeness: number
}

export function validateCourse(course: {
  id: string
  title: string
  content: string
  quiz?: { id: string }[]
  relatedKnowledge?: string[]
  whyLearn: string
  nextSkill: string
  status?: string
}): CourseValidationReport {
  const contentChecks = requiredSections.map((section) => ({
    section,
    found: course.content.includes(section),
  }))

  const hasContent = course.content.length > 0 && course.content !== "本课程内容将在后续章节建设中补充。"
  const hasQuiz = !!course.quiz && course.quiz.length >= requiredQuizQuestions
  const hasRelatedKnowledge = !!course.relatedKnowledge && course.relatedKnowledge.length > 0

  const checks = [
    hasContent,
    contentChecks.every((c) => c.found),
    hasQuiz,
    hasRelatedKnowledge,
    !!course.whyLearn,
    !!course.nextSkill,
  ]

  const passed = checks.filter(Boolean).length
  const completeness = Math.round((passed / checks.length) * 100)

  return {
    courseId: course.id,
    title: course.title,
    status: course.status || "draft",
    hasContent,
    contentSections: contentChecks,
    hasQuiz,
    quizCount: course.quiz?.length || 0,
    hasRelatedKnowledge,
    hasWhyLearn: !!course.whyLearn,
    hasNextSkill: !!course.nextSkill,
    completeness,
  }
}

export function validateAllCourses(stages: { courses: any[] }[]) {
  const allCourses = stages.flatMap((s) => s.courses)
  const reports = allCourses.map(validateCourse)
  return reports
}

export function printCourseReport(report: CourseValidationReport) {
  const { courseId, title, status, completeness } = report
  const lines: string[] = []
  lines.push(`\n${courseId} — ${title}`)
  lines.push(`  状态: ${status}`)

  if (report.hasContent) {
    lines.push(`  ✓ 内容章节:`)
    for (const s of report.contentSections) {
      lines.push(`    ${s.found ? "✓" : "✗"} ${s.section}`)
    }
  } else {
    lines.push(`  ✗ 内容 (占位符)`)
  }

  lines.push(`  ${report.hasQuiz ? "✓" : "✗"} Quiz (${report.quizCount}/${requiredQuizQuestions})`)
  lines.push(`  ${report.hasRelatedKnowledge ? "✓" : "✗"} 知识关联`)
  lines.push(`  ${report.hasWhyLearn ? "✓" : "✗"} whyLearn`)
  lines.push(`  ${report.hasNextSkill ? "✓" : "✗"} nextSkill`)
  lines.push(`  课程完整度: ${completeness}%`)
  lines.push(`  ${"─".repeat(30)}`)

  return lines.join("\n")
}

export function runCourseAudit(stages: { courses: any[] }[]) {
  if (typeof window === "undefined") return
  const reports = validateAllCourses(stages)
  let output = "\n═══════════════════════════════════════\n  课程完整度报告\n═══════════════════════════════════════"
  for (const report of reports) {
    output += printCourseReport(report)
  }
  const avg = Math.round(reports.reduce((s, r) => s + r.completeness, 0) / reports.length)
  output += `\n  平均完整度: ${avg}%`
  output += "\n═══════════════════════════════════════\n"
  console.log(output)
}
