export type GraduationStatus = "not-started" | "in-progress" | "ready-for-review" | "graduated"

export type CertificateLevel = "excellent" | "good" | "pass" | "fail"

export interface GraduateRecord {
  phaseId: string
  graduated: boolean
  graduatedAt?: string
  score: number
  certificateLevel: CertificateLevel
}

export interface PhaseReview {
  phaseId: string
  title: string
  subtitle: string
  courseCount: number
  knowledgeCount: number
  taskCount: number
  completionRate: number
  graduationStatus: GraduationStatus
  graduateRecord: GraduateRecord
  graduationAbility: string
}

export interface CoreConcept {
  id: string
  name: string
  description: string
  courseId: string
  courseTitle: string
  keywords: string[]
}

export interface MistakeItem {
  id: string
  text: string
  category: "data" | "analysis" | "model" | "design" | "writing"
  courseId: string
}

export interface ComprehensiveTestQuestion {
  id: string
  type: "choice" | "scenario" | "research-design"
  question: string
  options?: string[]
  answer: number | string
  explanation: string
  knowledgeId?: string
}

export interface ComprehensiveTestResult {
  total: number
  correct: number
  accuracy: number
  weakKnowledge: string[]
  recommendedCourses: string[]
}

export interface GraduationProject {
  id: string
  title: string
  tasks: string[]
  completed: boolean
  reflection?: string
  summary?: string
  phaseId: string
}

export interface ReadinessAssessment {
  score: number
  courseCompletionRate: number
  quizCompletionRate: number
  testScore: number
  knowledgeMastery: number
  level: "ready" | "supplement" | "review" | "relearn"
  levelLabel: string
}

export interface PhaseReviewData {
  overview: PhaseReview
  knowledgeMap: { skills: any[]; knowledge: any[]; tasks: any[] }
  coreConcepts: CoreConcept[]
  mistakes: { category: string; items: MistakeItem[] }[]
  comprehensiveTest: { questions: ComprehensiveTestQuestion[] }
  graduationProject: GraduationProject
  readiness: ReadinessAssessment
}
