import { stages } from "./courses"
import { knowledge, researchTasks } from "./knowledgeGraph"

export type RemediationSeverity = "S" | "A" | "B" | "C"

export type RemediationStatus = "todo" | "in-progress" | "done"

export type RemediationCategory = "content" | "logic" | "quiz" | "visual" | "research" | "knowledge"

export interface CourseRemediationItem {
  courseId: string
  severity: RemediationSeverity
  category: RemediationCategory
  issue: string
  recommendation: string
  status: RemediationStatus
}

export interface RemediationPlan {
  items: CourseRemediationItem[]
  summary: {
    total: number
    bySeverity: Record<RemediationSeverity, number>
    byStatus: Record<RemediationStatus, number>
    byCourse: Record<string, number>
  }
}

export function getSeverityLabel(s: RemediationSeverity): string {
  const map: Record<RemediationSeverity, string> = { S: "严重", A: "优先", B: "后续", C: "记录" }
  return map[s]
}

export function getSeverityColor(s: RemediationSeverity): string {
  const map: Record<RemediationSeverity, string> = { S: "red", A: "orange", B: "yellow", C: "gray" }
  return map[s]
}

function countChineseChars(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length
}

function analyzeQuizDepth(quiz: NonNullable<typeof stages[0]["courses"][0]["quiz"]>): "definition" | "mixed" | "application" {
  const appKeywords = ["分析", "比较", "设计", "评估", "你自己", "你会", "你的研究"]
  const appCount = quiz.filter((q) => appKeywords.some((kw) => q.question.includes(kw))).length
  if (appCount >= 2) return "application"
  if (appCount >= 1) return "mixed"
  return "definition"
}

function hasSection(content: string, required: string): boolean {
  if (content.includes(required)) return true
  const aliases: Record<string, string[]> = {
    "核心原理拆解": [],
    "与传统方法比较": ["NLP vs 传统语言学", "与传统语言学比较", "传统方法比较", "与传统方法", "与传统语言学方法", "与传统研究"],
    "真实研究案例一": ["案例一：", "案例一:"],
    "真实研究案例二": ["案例二：", "案例二:"],
    "延伸阅读": [],
    "科研避坑提示": ["常见误区"],
  }
  const alts = aliases[required]
  if (!alts) return false
  return alts.some((a) => content.includes(a))
}

export function generateRemediationPlan(): RemediationPlan {
  const items: CourseRemediationItem[] = []
  const published = stages.flatMap((s) => s.courses).filter((c) => c.status === "published")

  for (const course of published) {
    const charCount = countChineseChars(course.content)
    const related = course.relatedKnowledge || []

    // --- S level ---

    const allSections = ["本课导入", "历史背景", "核心知识", "核心原理拆解", "与传统方法比较", "真实研究案例一", "真实研究案例二", "科研避坑提示", "科研应用路径", "学完本课你将能够", "本课总结", "思考题", "延伸阅读"]
    const missing = allSections.filter((s) => !course.content.includes(s) && !hasSection(course.content, s))
    if (missing.length > 0) {
      items.push({
        courseId: course.id,
        severity: "S",
        category: "content",
        issue: `缺失核心章节：${missing.join("、")}`,
        recommendation: `补充${missing.join("、")}章节，覆盖完整课程结构`,
        status: "todo",
      })
    }

    if (charCount < 4000) {
      items.push({
        courseId: course.id,
        severity: "S",
        category: "content",
        issue: `严重字数不足：仅${charCount}字，远低于5000字标准`,
        recommendation: "扩充内容至5000字以上，重点增加案例和原理拆解部分",
        status: "todo",
      })
    }

    const casePattern1 = (course.content.match(/# 真实研究案例/g) || []).length
    const casePattern2 = (course.content.match(/## 案例/g) || []).length
    const caseCount = Math.max(casePattern1, casePattern2)
    if (caseCount === 0) {
      items.push({
        courseId: course.id,
        severity: "S",
        category: "research",
        issue: "缺少真实研究案例",
        recommendation: "补充至少2个国际中文教育场景的真实研究案例",
        status: "todo",
      })
    }

    if (related.length > 0) {
      const valid = related.filter((id) => knowledge.some((k) => k.id === id))
      const invalid = related.filter((id) => !knowledge.some((k) => k.id === id))
      if (invalid.length > 0) {
        items.push({
          courseId: course.id,
          severity: "S",
          category: "knowledge",
          issue: `知识点关联错误：${invalid.join("、")}在知识图谱中不存在`,
          recommendation: "将关联知识点修正为knowledgeGraph.ts中已定义的知识点ID",
          status: "todo",
        })
      }

      const kn = knowledge.filter((k) => related.includes(k.id))
      const downstream = knowledge.filter((k) => k.prerequisites?.some((p) => related.includes(p)))
      if (downstream.length === 0 && kn.length > 0) {
        items.push({
          courseId: course.id,
          severity: "S",
          category: "logic",
          issue: "知识链断裂：当前知识点无后续课程承接",
          recommendation: "检查课程定位，确保在知识图谱中形成完整的学习路径",
          status: "todo",
        })
      }

      const tasks = researchTasks.filter((t) => {
        for (const [kwId, taskIds] of Object.entries(
          Object.fromEntries(
            knowledge
              .filter((k) => related.includes(k.id))
              .map((k) => [k.id, researchTasks.filter((t) => t.id.startsWith("task"))])
          )
        )) {
        }
        return false
      })
    }

    // --- A level ---

    if (charCount >= 4000 && charCount < 5000) {
      items.push({
        courseId: course.id,
        severity: "A",
        category: "content",
        issue: `字数偏少：${charCount}字，接近但未达到5000字标准`,
        recommendation: "扩充至5000字以上，深化案例分析和原理拆解",
        status: "todo",
      })
    }

    if (caseCount === 1) {
      items.push({
        courseId: course.id,
        severity: "A",
        category: "research",
        issue: "案例不足：仅1个真实研究案例",
        recommendation: "补充第二个国际中文教育场景的真实研究案例",
        status: "todo",
      })
    }

    if (!course.quiz || course.quiz.length < 3) {
      items.push({
        courseId: course.id,
        severity: "A",
        category: "quiz",
        issue: `Quiz不足：${course.quiz?.length || 0}题，需要至少3题`,
        recommendation: "设计3道选择题，涵盖概念理解、应用分析和研究设计",
        status: "todo",
      })
    } else if (course.quiz.length >= 3) {
      const depth = analyzeQuizDepth(course.quiz)
      if (depth === "definition") {
        items.push({
          courseId: course.id,
          severity: "A",
          category: "quiz",
          issue: "Quiz质量不足：全部为定义记忆型题目",
          recommendation: "替换至少2道题目为应用分析型，要求学生结合研究场景作答",
          status: "todo",
        })
      }
    }

    if (related.length < 2) {
      items.push({
        courseId: course.id,
        severity: "A",
        category: "knowledge",
        issue: `知识点关联不足：仅${related.length}个知识点`,
        recommendation: "关联至少2个知识点，确保课程在知识图谱中有充分的连接",
        status: "todo",
      })
    }

    // --- B level ---

    const visualCount = course.visualAssets?.length || 0
    if (visualCount === 0) {
      items.push({
        courseId: course.id,
        severity: "B",
        category: "visual",
        issue: "缺少图解资源",
        recommendation: "增加至少1个流程图(flow)或知识路径图(path)，配合课程核心概念展示",
        status: "todo",
      })
    } else if (visualCount < 2) {
      items.push({
        courseId: course.id,
        severity: "B",
        category: "visual",
        issue: "图解不足：仅1个图解",
        recommendation: "增加第二个图解（如知识路径图或思维导图）以丰富视觉表达",
        status: "todo",
      })
    }

    const thinkCount = (course.content.match(/\*\*Q\d+：[^*]+\*\*/g) || []).length
    if (thinkCount < 3) {
      items.push({
        courseId: course.id,
        severity: "B",
        category: "content",
        issue: `思考题不足：仅${thinkCount}道`,
        recommendation: "补充至至少3道思考题，并附参考答案方向",
        status: "todo",
      })
    }

    // --- C level ---
    const hasComparisonTable = course.content.includes("| 维度 |") || course.content.includes("|------|") || course.content.includes("| 维度")
    if (!hasComparisonTable) {
      items.push({
        courseId: course.id,
        severity: "C",
        category: "content",
        issue: "与传统方法比较缺少表格",
        recommendation: "增加与传统语言学方法的对照表格，包含研究方式、效率、规模、一致性、研究价值等维度",
        status: "todo",
      })
    }

    const hasAppPath = course.content.includes("科研应用路径")
    if (!hasAppPath) {
      items.push({
        courseId: course.id,
        severity: "C",
        category: "content",
        issue: "缺少科研应用路径章节",
        recommendation: "增加科研应用路径，说明HSK研究、教材研究等应用方向",
        status: "todo",
      })
    }
  }

  const summary = {
    total: items.length,
    bySeverity: {
      S: items.filter((i) => i.severity === "S").length,
      A: items.filter((i) => i.severity === "A").length,
      B: items.filter((i) => i.severity === "B").length,
      C: items.filter((i) => i.severity === "C").length,
    },
    byStatus: {
      todo: items.filter((i) => i.status === "todo").length,
      "in-progress": items.filter((i) => i.status === "in-progress").length,
      done: items.filter((i) => i.status === "done").length,
    },
    byCourse: {} as Record<string, number>,
  }

  for (const item of items) {
    summary.byCourse[item.courseId] = (summary.byCourse[item.courseId] || 0) + 1
  }

  return { items, summary }
}
