"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { PhaseReviewData } from "./types"
import { StatusBadge, CertBadge, ReadinessBadge } from "./badge"

interface Props {
  phaseId: string
  data: PhaseReviewData
}

type TabKey = "knowledge" | "concepts" | "mistakes" | "test" | "project" | "readiness"

const tabLabels: Record<TabKey, string> = {
  knowledge: "知识地图",
  concepts: "核心概念",
  mistakes: "常见误区",
  test: "综合测试",
  project: "毕业项目",
  readiness: "准备度评估",
}

export default function PhaseReviewClient({ phaseId, data }: Props) {
  const [tab, setTab] = useState<TabKey>("knowledge")
  const { overview, knowledgeMap, coreConcepts, mistakes, comprehensiveTest, graduationProject, readiness } = data

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 font-mono mb-1">
            <Link href="/review" className="hover:text-gray-600">Review</Link> / {phaseId}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{overview.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{overview.subtitle}</p>
          <p className="text-xs text-gray-400 mt-1">毕业能力：{overview.graduationAbility}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={overview.graduationStatus} />
          <div className="mt-1">
            <CertBadge level={overview.graduateRecord.certificateLevel} score={overview.graduateRecord.score} />
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-gray-200 pb-0 overflow-x-auto">
        {(Object.keys(tabLabels) as TabKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-xs px-3 py-2 font-medium rounded-t transition-colors whitespace-nowrap ${
              tab === key ? "bg-white text-blue-600 border border-b-white border-gray-200 -mb-px" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {tab === "knowledge" && <KnowledgeMapTab data={knowledgeMap} phaseId={phaseId} />}
        {tab === "concepts" && <CoreConceptsTab concepts={coreConcepts} />}
        {tab === "mistakes" && <MistakesTab mistakes={mistakes} />}
        {tab === "test" && <ComprehensiveTestTab questions={comprehensiveTest.questions} phaseId={phaseId} />}
        {tab === "project" && <GraduationProjectTab project={graduationProject} />}
        {tab === "readiness" && <ReadinessTab readiness={readiness} overview={overview} />}
      </div>
    </div>
  )
}

/* ── Knowledge Map ── */
function KnowledgeMapTab({ data, phaseId }: { data: PhaseReviewData["knowledgeMap"]; phaseId: string }) {
  if (data.skills.length === 0 && data.knowledge.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center text-sm text-gray-400">
        <p>知识图谱数据加载中</p>
        <p className="text-xs mt-1">Phase 3/4 开发完成后将自动填充</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">技能 ({data.skills.length})</h3>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s: any) => (
            <div key={s.id} className="border border-blue-200 bg-blue-50 rounded-lg px-3 py-1.5 text-xs text-blue-700">
              {s.name}
            </div>
          ))}
          {data.skills.length === 0 && <span className="text-xs text-gray-400">暂无</span>}
        </div>
      </div>

      {/* Knowledge */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">知识点 ({data.knowledge.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.knowledge.map((k: any) => (
            <div key={k.id} className="border border-gray-200 rounded-lg p-2.5 text-xs">
              <div className="font-medium text-gray-800">{k.name}</div>
              <div className="text-gray-400 mt-0.5 line-clamp-2">{k.description}</div>
              {k.prerequisites && k.prerequisites.length > 0 && (
                <div className="text-gray-400 mt-1">前置：{k.prerequisites.join(", ")}</div>
              )}
            </div>
          ))}
          {data.knowledge.length === 0 && <span className="text-xs text-gray-400 col-span-3">暂无</span>}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">科研任务 ({data.tasks.length})</h3>
        <div className="space-y-1.5">
          {data.tasks.map((t: any) => (
            <div key={t.id} className="border border-green-200 bg-green-50 rounded-lg p-2.5 text-xs text-green-800">
              {t.name}
            </div>
          ))}
          {data.tasks.length === 0 && <span className="text-xs text-gray-400">暂无</span>}
        </div>
      </div>
    </div>
  )
}

/* ── Core Concepts ── */
function CoreConceptsTab({ concepts }: { concepts: PhaseReviewData["coreConcepts"] }) {
  const [search, setSearch] = useState("")

  const filtered = search
    ? concepts.filter((c) => c.name.includes(search) || c.keywords.some((k) => k.includes(search)))
    : concepts

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索概念..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 placeholder-gray-400"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">未找到匹配的概念</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.slice(0, 40).map((c) => (
            <div key={c.id} className="border border-gray-200 rounded-lg p-3 bg-white">
              <div className="text-sm font-medium text-gray-800">{c.name}</div>
              <div className="text-xs text-gray-500 mt-1">{c.description}</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {c.keywords.slice(0, 4).map((kw) => (
                  <span key={kw} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{kw}</span>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">来源：{c.courseTitle}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Mistakes ── */
function MistakesTab({ mistakes }: { mistakes: PhaseReviewData["mistakes"] }) {
  const categoryLabels: Record<string, string> = {
    data: "数据",
    analysis: "分析",
    model: "模型",
    design: "研究设计",
    writing: "论文写作",
  }
  const categoryColors: Record<string, string> = {
    data: "bg-purple-50 text-purple-700 border-purple-200",
    analysis: "bg-orange-50 text-orange-700 border-orange-200",
    model: "bg-blue-50 text-blue-700 border-blue-200",
    design: "bg-red-50 text-red-700 border-red-200",
    writing: "bg-green-50 text-green-700 border-green-200",
  }

  if (mistakes.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">暂无常见误区数据</p>
  }

  return (
    <div className="space-y-4">
      {mistakes.map(({ category, items }) => (
        <div key={category}>
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[category] || ""}`}>
              {categoryLabels[category] || category}
            </span>
            <span className="text-xs text-gray-400 ml-2">× {items.length}</span>
          </h3>
          <div className="space-y-1.5">
            {items.map((m) => (
              <div key={m.id} className="border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 bg-white">
                {m.text}
                <span className="text-gray-400 ml-2">({m.courseId})</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Comprehensive Test ── */
function ComprehensiveTestTab({ questions, phaseId }: { questions: PhaseReviewData["comprehensiveTest"]["questions"]; phaseId: string }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [showResult, setShowResult] = useState(false)

  if (questions.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">综合测试题目加载中</p>
  }

  const q = questions[current]

  function handleAnswer(val: number | string) {
    setAnswers((prev) => ({ ...prev, [q.id]: val }))
  }

  function calcResult() {
    let correct = 0
    const wrong: string[] = []
    for (const qq of questions) {
      const ans = answers[qq.id]
      if (ans !== undefined && String(ans) === String(qq.answer)) {
        correct++
      } else {
        wrong.push(qq.knowledgeId || "")
      }
    }
    return { total: questions.length, correct, accuracy: Math.round((correct / questions.length) * 100), wrong }
  }

  const result = showResult ? calcResult() : null

  if (showResult && result) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl bg-white p-6 text-center">
          <div className="text-4xl font-bold text-blue-600">{result.accuracy}%</div>
          <div className="text-sm text-gray-500 mt-1">正确率</div>
          <div className="text-xs text-gray-400 mt-0.5">{result.correct}/{result.total} 题正确</div>
        </div>
        <button onClick={() => { setShowResult(false); setCurrent(0); setAnswers({}) }} className="text-xs text-blue-600 hover:text-blue-700">
          重新测试
        </button>
      </div>
    )
  }

  const typeLabels = { choice: "选择题", scenario: "场景题", "research-design": "研究设计题" }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>第 {current + 1}/{questions.length} 题</span>
        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="border border-gray-200 rounded-xl bg-white p-5">
        <div className="text-xs text-gray-400 mb-2">{typeLabels[q.type]}</div>
        <div className="text-sm text-gray-800 font-medium">{q.question}</div>

        {q.options ? (
          <div className="mt-4 space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi
              return (
                <button
                  key={oi}
                  onClick={() => handleAnswer(oi)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    selected ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        ) : (
          <textarea
            className="w-full mt-4 text-sm border border-gray-200 rounded-lg p-3 bg-white text-gray-700"
            rows={3}
            placeholder="输入你的回答..."
            value={String(answers[q.id] || "")}
            onChange={(e) => handleAnswer(e.target.value)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 disabled:opacity-30"
        >
          上一题
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent(current + 1)}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            下一题
          </button>
        ) : (
          <button
            onClick={() => setShowResult(true)}
            className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
          >
            提交测试
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Graduation Project ── */
function GraduationProjectTab({ project }: { project: PhaseReviewData["graduationProject"] }) {
  const [completed, setCompleted] = useState(false)
  const [reflection, setReflection] = useState("")
  const [summary, setSummary] = useState("")

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-xl bg-white p-5">
        <h3 className="text-base font-bold text-gray-800">{project.title}</h3>
        <div className="mt-3 space-y-2">
          {project.tasks.map((task, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-300 mt-0.5">{i + 1}.</span>
              <span>{task}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl bg-white p-5 space-y-4">
        <h4 className="text-sm font-bold text-gray-700">学习反思</h4>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="写下你对本阶段学习的反思和收获..."
          className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-white text-gray-700 placeholder-gray-400"
          rows={4}
        />
        <h4 className="text-sm font-bold text-gray-700">项目总结</h4>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="总结你的毕业项目成果..."
          className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-white text-gray-700 placeholder-gray-400"
          rows={4}
        />
        <button
          onClick={() => setCompleted(!completed)}
          className={`text-xs px-4 py-2 rounded font-medium border transition-colors ${
            completed ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          {completed ? "✓ 标记完成" : "标记完成"}
        </button>
      </div>
    </div>
  )
}

/* ── Readiness ── */
function ReadinessTab({ readiness, overview }: { readiness: PhaseReviewData["readiness"]; overview: PhaseReviewData["overview"] }) {
  const metrics = [
    { label: "课程完成率", value: readiness.courseCompletionRate },
    { label: "Quiz完成率", value: readiness.quizCompletionRate },
    { label: "测试成绩", value: readiness.testScore },
    { label: "知识掌握度", value: readiness.knowledgeMastery },
  ]

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="border border-gray-200 rounded-xl bg-white p-6 text-center">
        <div className="text-4xl font-bold text-gray-800">{readiness.score}</div>
        <div className="text-sm text-gray-500 mt-1">综合准备度评分</div>
        <div className="mt-2">
          <ReadinessBadge level={readiness.level} label={readiness.levelLabel} />
        </div>
      </div>

      {/* Sub-metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="border border-gray-200 rounded-lg p-3 bg-white text-center">
            <div className="text-lg font-bold text-gray-700">{m.value}%</div>
            <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
            <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${m.value >= 90 ? "bg-green-500" : m.value >= 70 ? "bg-blue-500" : "bg-yellow-500"}`} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stage overview */}
      <div className="border border-gray-200 rounded-xl bg-white p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">阶段概览</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-400">课程总数：</span>
            <span className="text-gray-700">{overview.courseCount}</span>
          </div>
          <div>
            <span className="text-gray-400">知识点总数：</span>
            <span className="text-gray-700">{overview.knowledgeCount}</span>
          </div>
          <div>
            <span className="text-gray-400">科研任务数：</span>
            <span className="text-gray-700">{overview.taskCount}</span>
          </div>
          <div>
            <span className="text-gray-400">完成率：</span>
            <span className="text-gray-700">{overview.completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
