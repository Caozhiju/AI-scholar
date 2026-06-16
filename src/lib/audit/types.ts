export interface ContentIssue {
  type: string
  severity: "error" | "warning"
  message: string
}

export interface CourseAudit {
  courseId: string
  title: string
  stageId: string
  contentScore: number
  contentMax: number
  contentIssues: ContentIssue[]
  knowledgeScore: number
  knowledgeMax: number
  knowledgeIssues: ContentIssue[]
  designScore: number
  designMax: number
  designIssues: ContentIssue[]
  integrityScore: number
  integrityMax: number
  integrityIssues: ContentIssue[]
  researchScore: number
  researchMax: number
  researchIssues: ContentIssue[]
  totalScore: number
  totalMax: number
  riskFlags: string[]
  needsImprovement: boolean
  redLineReasons: string[]
}

export interface StageAudit {
  stageId: string
  title: string
  courseCount: number
  totalChars: number
  avgChars: number
  completionRate: number
  avgScore: number
}

import type { RemediationPlan } from "@/data/remediationPlan"

export interface ProjectCoverage {
  totalProjects: number
  coveredCourses: number
  coveredKnowledge: number
  coveredTasks: number
  courseCoverageRate: number
  knowledgeCoverageRate: number
  taskCoverageRate: number
}

export interface SystemAudit {
  totalScore: number
  totalMax: number
  grade: string
  dimensions: {
    name: string
    score: number
    max: number
    pct: number
  }[]
  stageReports: StageAudit[]
  courseReports: CourseAudit[]
  riskSummary: { type: string; count: number; courses: string[] }[]
  remediationPlan?: RemediationPlan
  redLineCourses?: RedLineCourse[]
  projectCoverage?: ProjectCoverage
}

export interface RedLineCourse {
  courseId: string
  title: string
  reasons: string[]
}

export const REQUIRED_SECTIONS = [
  "本课导入",
  "历史背景",
  "核心知识",
  "核心原理拆解",
  "与传统方法比较",
  "真实研究案例一",
  "真实研究案例二",
  "科研避坑提示",
  "科研应用路径",
  "学完本课你将能够",
  "本课总结",
  "思考题",
  "延伸阅读",
]

export function getGrade(score: number, max: number): string {
  const pct = (score / max) * 100
  if (pct >= 90) return "优秀"
  if (pct >= 80) return "良好"
  if (pct >= 70) return "合格"
  if (pct >= 60) return "需改进"
  return "需重构"
}
