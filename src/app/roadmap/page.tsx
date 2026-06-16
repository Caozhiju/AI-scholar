"use client"

import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { stages } from "@/data/courses"
import { knowledge, researchTasks, getCourseKnowledge } from "@/data/knowledgeGraph"

const stageDescriptions: Record<string, { title: string; subtitle: string; why: string }> = {
  python: {
    title: "Python科研基础",
    subtitle: "掌握用Python处理语言文本的基本技能",
    why: "Python是进入计算语言学领域最通用的工具。这个阶段的目标不是让你成为程序员，而是让你具备用Python处理语言数据的基本能力——这是后续所有技术学习的根基。就像学语言要认字一样，Python就是你处理语料的那支笔。",
  },
  cli: {
    title: "计算语言学AI",
    subtitle: "理解AI如何分析和处理人类语言",
    why: "有了Python基础，你就可以理解计算语言学的核心方法——分词、词性标注、句法分析、语义理解。这些是AI处理语言的底层逻辑。即使你以后用直接大模型API，理解这些原理也能帮你更好地判断：什么任务适合AI，什么任务AI做不好。",
  },
  edunlp: {
    title: "教育NLP",
    subtitle: "聚焦国际中文教育场景的技术应用",
    why: "教育NLP是把AI技术应用到教学场景的具体实践。这个阶段的学习将让你看到：如何用技术分析学习者语言、评估教材难度、自动批改作文、个性化推荐学习内容。这些能力直接服务于你的教学和研究工作，让你真正成为既懂教学又懂技术的复合型研究者。",
  },
  llm: {
    title: "大模型LLM",
    subtitle: "理解和应用大语言模型于语言学研究",
    why: "大模型是当前AI技术的前沿，也是语言学研究工具的最新形态。放在最后学习是有意为之的——因为先用好大模型，需要理解前面的基础。没有Python基础，你只能做最普通的对话式使用；有了计算语言学和NLP基础，你才能设计有效的提示词、评估模型输出质量、甚至微调模型。这个阶段教你的不是怎么问ChatGPT，而是怎么把大模型变成你的科研工具。",
  },
  phase4: {
    title: "AI辅助国际中文教育研究与创新实践",
    subtitle: "独立设计和开展AI辅助语言学研究",
    why: "如果说前四个阶段是教你使用工具，那么这个阶段是教你成为研究者。你将学习怎么设计实验、怎么构建语料库、怎么分析数据、怎么写论文、怎么投期刊——全套的研究技能。这个阶段的核心目标是帮助国际中文教育硕士研究生完成从学生到研究者的转变，让你具备独立开展AI相关研究、产出高质量学术论文的能力。",
  },
}

export default function RoadmapPage() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [currentCourseId, setCurrentCourseId] = useState<string>("")

  useEffect(() => {
    try {
      const completed = localStorage.getItem("lingai-completed-courses")
      if (completed) setCompletedCourses(JSON.parse(completed))
      const current = localStorage.getItem("lingai-current-course")
      if (current) setCurrentCourseId(JSON.parse(current))
    } catch {}
  }, [])

  const stageStats = useMemo(() => {
    return stages.map((s) => {
      const total = s.courses.length
      const done = s.courses.filter((c) => completedCourses.includes(c.id)).length
      const rate = total > 0 ? Math.round((done / total) * 100) : 0
      return { stageId: s.id, total, done, rate, hasContent: total > 0 }
    })
  }, [completedCourses])

  const handleStartCourse = (courseId: string) => {
    localStorage.setItem("lingai-current-course", JSON.stringify(courseId))
    window.location.href = "/"
  }

  const overallTotal = stageStats.reduce((sum, s) => sum + s.total, 0)
  const overallDone = stageStats.reduce((sum, s) => sum + s.done, 0)
  const overallRate = overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">培养方案</h1>
        <p className="text-sm text-gray-500 mt-1">总览 LingAI Scholar 完整学习路线 · 共计 {overallTotal} 门课程</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${overallRate}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-500 w-14 text-right">{overallDone}/{overallTotal} ({overallRate}%)</span>
        </div>
      </div>

      {/* Why this order */}
      <div className="mb-10 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">为什么这样安排学习顺序</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">为什么先学Python？</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{stageDescriptions.python.why}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">为什么再学计算语言学？</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{stageDescriptions.cli.why}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">3 + 4</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">为什么最后学教育NLP和大模型？</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                教育NLP和大模型是前面基础的实际应用。放在后面不是因为它们不重要——恰恰相反，它们是最接近你实际教学和科研场景的部分。但只有在掌握了基础之后，你才能真正理解这些高级工具的能力边界，知道什么时候该用什么工具，而不是盲目使用。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-8">
        {stages.map((stage) => {
          const stats = stageStats.find((s) => s.stageId === stage.id)!
          const desc = stageDescriptions[stage.id]

          return (
            <section key={stage.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Stage header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        stats.done === stats.total && stats.total > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {stage.title.replace(/第[^阶段]*阶段：/, "")}
                      </span>
                      <span className="text-xs text-gray-400">{desc?.subtitle || ""}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{stats.done}<span className="text-gray-400 font-normal">/{stats.total}</span></p>
                    <p className="text-xs text-gray-400">已完成</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.rate}%` }} />
                </div>
              </div>

              {/* Course list */}
              {stage.courses.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {stage.courses.map((course) => {
                    const isCompleted = completedCourses.includes(course.id)
                    const isCurrent = currentCourseId === course.id
                    const kg = getCourseKnowledge(course.relatedKnowledge || [])
                    const relatedTasks = kg.relatedTasks || []

                    const difficultyColor = course.difficulty === "入门" ? "bg-green-50 text-green-600"
                      : course.difficulty === "初级" ? "bg-blue-50 text-blue-600"
                      : course.difficulty === "中级" ? "bg-orange-50 text-orange-600"
                      : "bg-red-50 text-red-600"

                    return (
                      <div key={course.id} className={`px-6 py-4 ${isCurrent ? "bg-blue-50/50 border-l-2 border-blue-400" : "border-l-2 border-transparent hover:bg-gray-50/50"}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                isCompleted ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                              }`}>
                                {isCompleted ? "✓" : course.position}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${difficultyColor}`}>{course.difficulty}</span>
                              {course.status === "draft" && (
                                <span className="text-[10px] text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded">筹备中</span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">学习中</span>
                              )}
                            </div>
                            <h3 className={`text-sm font-semibold ${isCompleted ? "text-green-700" : isCurrent ? "text-blue-800" : "text-gray-800"}`}>
                              {course.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.description}</p>

                            {/* Knowledge and task tags */}
                            {course.relatedKnowledge && course.relatedKnowledge.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {knowledge.filter((k) => course.relatedKnowledge?.includes(k.id)).map((k) => (
                                  <span key={k.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600">
                                    {k.label}
                                  </span>
                                ))}
                                {relatedTasks.map((t) => (
                                  <span key={t.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-600">
                                    {t.label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleStartCourse(course.id)}
                            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              isCompleted
                                ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                : isCurrent
                                  ? "bg-blue-500 text-white hover:bg-blue-600"
                                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                            } ${course.status === "draft" ? "opacity-40 cursor-not-allowed" : ""}`}
                            disabled={course.status === "draft"}
                          >
                            {course.status === "draft" ? "筹备中" : isCompleted ? "再次学习" : isCurrent ? "继续学习" : "开始学习"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-400">该阶段课程内容正在建设中</p>
                  <p className="text-xs text-gray-300 mt-1">预计2026年下半年上线</p>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
