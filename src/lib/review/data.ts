import { stages } from "@/data/courses"
import { skills as allSkills, knowledge as allKnowledge, researchTasks as allTasks } from "@/data/knowledgeGraph"
import type {
  PhaseReview, GraduationStatus, CertificateLevel, GraduateRecord,
  CoreConcept, MistakeItem, ComprehensiveTestQuestion,
  GraduationProject, ReadinessAssessment, PhaseReviewData,
} from "./types"

function getCompletionRate(courses: { status: string }[]): number {
  const published = courses.filter((c) => c.status === "published").length
  return courses.length > 0 ? Math.round((published / courses.length) * 100) : 0
}

function getGraduationStatus(rate: number, score: number): GraduationStatus {
  if (score >= 90) return "graduated"
  if (score >= 80) return "ready-for-review"
  if (rate > 50) return "in-progress"
  return "not-started"
}

function getCertificateLevel(score: number): CertificateLevel {
  if (score >= 90) return "excellent"
  if (score >= 80) return "good"
  if (score >= 70) return "pass"
  return "fail"
}

function countChinese(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length
}

const stageMeta: Record<string, { subtitle: string; ability: string }> = {
  python: {
    subtitle: "Python科研基础",
    ability: "能够使用Python辅助语言学研究",
  },
  cli: {
    subtitle: "计算语言学与教育NLP",
    ability: "能够理解教育NLP研究方法",
  },
  llm: { subtitle: "大模型LLM与国际中文教育", ability: "能够运用大语言模型辅助国际中文教育研究和教学" },
  edunlp: { subtitle: "待开发", ability: "（待开发阶段）" },
  phase4: { subtitle: "AI辅助国际中文教育研究与创新实践", ability: "能够独立设计和开展AI辅助语言学研究" },
}

// Get phase skills and knowledge
function getPhaseKnowledge(prefix: string) {
  const phaseSkills = allSkills.filter((s) => s.id.startsWith(prefix))
  const phaseKnowledge = allKnowledge.filter((k) => k.id.startsWith(prefix))
  const phaseTasks = allTasks.filter((t) => t.id.startsWith(prefix))
  return { skills: phaseSkills, knowledge: phaseKnowledge, tasks: phaseTasks }
}

export function buildPhaseReview(phaseId: string): PhaseReview | null {
  const stage = stages.find((s) => s.id === phaseId)
  if (!stage) return null
  const meta = stageMeta[phaseId]
  const courses = stage.courses
  const { knowledge: phaseKnowledge, tasks: phaseTasks } = getPhaseKnowledge(phaseId)
  const rate = getCompletionRate(courses)
  // Simulated score from a hypothetical comprehensive test
  const simulatedScore = rate >= 100 ? 92 : rate >= 80 ? 75 : rate >= 50 ? 60 : 30
  const status = getGraduationStatus(rate, simulatedScore)

  const record: GraduateRecord = {
    phaseId,
    graduated: status === "graduated",
    score: simulatedScore,
    certificateLevel: getCertificateLevel(simulatedScore),
  }
  if (record.graduated) record.graduatedAt = "2026-06-11"

  return {
    phaseId,
    title: stage.title,
    subtitle: meta?.subtitle || "",
    courseCount: courses.length,
    knowledgeCount: phaseKnowledge.length,
    taskCount: phaseTasks.length,
    completionRate: rate,
    graduationStatus: status,
    graduateRecord: record,
    graduationAbility: meta?.ability || "",
  }
}

export function buildCoreConcepts(phaseId: string): CoreConcept[] {
  const stage = stages.find((s) => s.id === phaseId)
  if (!stage) return []
  const result: CoreConcept[] = []
  const seen = new Set<string>()

  for (const course of stage.courses) {
    if (!course) continue
    // Extract key concepts from course content
    const lines = course.content.split("\n")
    for (const line of lines) {
      const match = line.match(/^##\s+(.+)$/)
      if (match) {
        const name = match[1].trim()
        if (name.length > 2 && name.length < 30 && !seen.has(name)) {
          seen.add(name)
          const contentAfter = course.content.slice(course.content.indexOf(line) + line.length, course.content.indexOf(line) + line.length + 200)
          // Find keywords from knowledge graph
          const keywords = (course.relatedKnowledge || [])
            .map((kid) => allKnowledge.find((k) => k.id === kid))
            .filter(Boolean)
            .map((k) => k!.label)

          result.push({
            id: `concept-${course.id}-${result.length}`,
            name,
            description: contentAfter.replace(/[#*`]/g, "").slice(0, 150).trim() + (contentAfter.length > 150 ? "……" : ""),
            courseId: course.id,
            courseTitle: course.title,
            keywords,
          })
        }
      }
    }
  }
  return result.slice(0, 50) // Limit to 50 concepts
}

export function buildMistakes(phaseId: string): MistakeItem[] {
  const stage = stages.find((s) => s.id === phaseId)
  if (!stage) return []
  const result: MistakeItem[] = []

  for (const course of stage.courses) {
    if (!course) continue
    // Find common mistakes sections
    const mistakesSection = course.content.match(/常见误区[\s\S]*?(?=# |$)/)
    if (!mistakesSection) continue

    const items = mistakesSection[0].match(/\*\*[^*]+\*\*/g)
    if (!items) continue

    for (const item of items) {
      const text = item.replace(/\*\*/g, "").trim()
      const category = categorizeMistake(text, course)

      result.push({
        id: `mistake-${course.id}-${result.length}`,
        text,
        category,
        courseId: course.id,
      })
    }
  }
  return result
}

function categorizeMistake(text: string, course: any): "data" | "analysis" | "model" | "design" | "writing" {
  const dataKW = ["数据", "标注", "样本", "语料", "OCR", "编码"]
  const modelKW = ["模型", "算法", "工具", "分类", "分词", "NER"]
  const designKW = ["设计", "变量", "控制", "研究", "实验", "假设"]
  const analysisKW = ["分析", "结果", "解读", "结论", "统计", "相关"]
  const writingKW = ["写作", "报告", "论文", "文献", "引用", "格式"]

  let maxScore = 0
  let best: "data" | "analysis" | "model" | "design" | "writing" = "analysis"

  const checks: [string, "data" | "analysis" | "model" | "design" | "writing"][] = [
    ["data", "data"], ["data", "data"], ["model", "model"], ["design", "design"],
    ["analysis", "analysis"], ["writing", "writing"],
  ]

  ;["data", "model", "design", "analysis", "writing"].forEach((cat) => {
    const kw = cat === "data" ? dataKW : cat === "model" ? modelKW : cat === "design" ? designKW : cat === "analysis" ? analysisKW : writingKW
    const score = kw.filter((k) => text.includes(k)).length
    if (score > maxScore) {
      maxScore = score
      best = cat as any
    }
  })
  return best
}

export function buildComprehensiveTest(phaseId: string): ComprehensiveTestQuestion[] {
  const stage = stages.find((s) => s.id === phaseId)
  if (!stage) return []

  const questionCount = phaseId === "python" ? 20 : phaseId === "cli" ? 30 : 10
  const questions: ComprehensiveTestQuestion[] = []

  const courseQuizzes = stage.courses.flatMap((c) =>
    !c ? [] : (c.quiz || []).map((q) => ({
      ...q,
      type: determineQuestionType(q.question, phaseId),
      knowledgeId: c.relatedKnowledge?.[0],
      courseId: c.id,
      courseTitle: c.title,
    }))
  )

  for (let i = 0; i < questionCount && i < courseQuizzes.length; i++) {
    const q = courseQuizzes[i % courseQuizzes.length]
    questions.push({
      id: `test-${phaseId}-${i}`,
      type: q.type as any,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      knowledgeId: q.knowledgeId,
    })
  }

  // Fill remaining with think questions
  if (questions.length < questionCount) {
    for (const course of stage.courses) {
      if (!course) continue
      const thinkQs = course.content.match(/\*\*Q\d+：[^*]+\*\*/g)
      if (!thinkQs) continue
      for (const tq of thinkQs) {
        if (questions.length >= questionCount) break
        const text = tq.replace(/\*\*/g, "")
        questions.push({
          id: `test-${phaseId}-scenario-${questions.length}`,
          type: "scenario",
          question: text,
          answer: "参考标准答案",
          explanation: "请参考课程内容验证您的回答",
          knowledgeId: course.relatedKnowledge?.[0],
        })
      }
    }
  }
  return questions.slice(0, questionCount)
}

function determineQuestionType(q: string, phaseId: string): "choice" | "scenario" | "research-design" {
  const designKW = ["设计", "方案", "计划", "你会", "你的研究"]
  const scenarioKW = ["假设", "如果", "分析", "比较", "案例"]
  if (designKW.some((k) => q.includes(k))) return "research-design"
  if (scenarioKW.some((k) => q.includes(k))) return "scenario"
  return "choice"
}

export function buildGraduationProject(phaseId: string): GraduationProject {
  const projects: Record<string, { title: string; tasks: string[] }> = {
    python: {
      title: "学习者作文基础分析",
      tasks: [
        "使用Python读取留学生作文文本文件",
        "统计作文的字数、词数、句数等基本指标",
        "生成词汇频率表和词性分布统计图",
        "撰写数据分析报告（500字以上）",
      ],
    },
    cli: {
      title: "多维度教育NLP分析方案",
      tasks: [
        "设计HSK文本分析方案（含可读性指标设计）",
        "设计教材词汇对比分析方案（含覆盖率/复现率计算）",
        "设计学习者作文偏误检测方案（含规则/统计方法选择）",
        "撰写综合研究方案报告（800字以上）",
      ],
    },
    edunlp: {
      title: "高级教育NLP研究方案",
      tasks: ["预留——Phase 3开发", "预留——Phase 3开发", "预留——Phase 3开发"],
    },
    llm: {
      title: "大模型语言学研究方案",
      tasks: ["预留——Phase 4开发", "预留——Phase 4开发", "预留——Phase 4开发"],
    },
  }

  const proj = projects[phaseId]
  return {
    id: `project-${phaseId}`,
    title: proj?.title || "预留项目",
    tasks: proj?.tasks || [],
    completed: false,
    phaseId,
  }
}

export function buildReadiness(phaseId: string): ReadinessAssessment {
  const stage = stages.find((s) => s.id === phaseId)
  if (!stage) return defaultReadiness()

  const courseCount = stage.courses.length
  const publishedCount = stage.courses.filter((c) => c.status === "published").length
  const courseCompletionRate = courseCount > 0 ? Math.round((publishedCount / courseCount) * 100) : 0
  const quizCount = stage.courses.reduce((sum, c) => sum + (c.quiz?.length || 0), 0)
  const maxQuiz = courseCount * 3
  const quizCompletionRate = maxQuiz > 0 ? Math.round(Math.min(100, (quizCount / maxQuiz) * 100)) : 0

  // Simulated knowledge mastery based on completion
  const knowledgeMastery = Math.round(courseCompletionRate * 0.7 + quizCompletionRate * 0.3)

  // Simulated test score
  const testScore = courseCompletionRate >= 100 ? 88 : courseCompletionRate >= 80 ? 72 : courseCompletionRate >= 50 ? 55 : 25

  // Composite readiness score
  const score = Math.round(courseCompletionRate * 0.3 + quizCompletionRate * 0.2 + testScore * 0.3 + knowledgeMastery * 0.2)

  let level: ReadinessAssessment["level"] = "relearn"
  let levelLabel = "建议重新学习关键课程"

  if (score >= 90) {
    level = "ready"
    levelLabel = "允许进入下一阶段"
  } else if (score >= 80) {
    level = "supplement"
    levelLabel = "建议补充学习"
  } else if (score >= 70) {
    level = "review"
    levelLabel = "建议复习"
  }

  return { score, courseCompletionRate, quizCompletionRate, testScore, knowledgeMastery, level, levelLabel }
}

function defaultReadiness(): ReadinessAssessment {
  return {
    score: 0,
    courseCompletionRate: 0,
    quizCompletionRate: 0,
    testScore: 0,
    knowledgeMastery: 0,
    level: "relearn",
    levelLabel: "建议重新学习关键课程",
  }
}

export function buildFullReview(phaseId: string): PhaseReviewData | null {
  const overview = buildPhaseReview(phaseId)
  if (!overview) return null

  const { skills, knowledge, tasks } = getPhaseKnowledge(phaseId)

  return {
    overview,
    knowledgeMap: { skills, knowledge, tasks },
    coreConcepts: buildCoreConcepts(phaseId),
    mistakes: buildMistakesByCategory(phaseId),
    comprehensiveTest: { questions: buildComprehensiveTest(phaseId) },
    graduationProject: buildGraduationProject(phaseId),
    readiness: buildReadiness(phaseId),
  }
}

function buildMistakesByCategory(phaseId: string) {
  const mistakes = buildMistakes(phaseId)
  const grouped: Record<string, MistakeItem[]> = {}
  const order = ["data", "model", "design", "analysis", "writing"]
  for (const m of mistakes) {
    if (!grouped[m.category]) grouped[m.category] = []
    grouped[m.category].push(m)
  }
  return order.filter((c) => grouped[c]).map((c) => ({
    category: c,
    items: grouped[c],
  }))
}

export function getPhaseName(phaseId: string): string {
  const map: Record<string, string> = {
    python: "Phase 1 · Python科研基础",
    cli: "Phase 2 · 计算语言学与教育NLP",
    llm: "Phase 3 · 大模型LLM与国际中文教育",
    edunlp: "Phase 4 · 待开发",
    phase4: "Phase 4 · AI辅助国际中文教育研究与创新实践",
  }
  return map[phaseId] || phaseId
}
