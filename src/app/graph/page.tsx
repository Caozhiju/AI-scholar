"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { stages } from "@/data/courses"
import { knowledge, researchTasks, skills, skillToKnowledge, getKnowledgeCourses } from "@/data/knowledgeGraph"
import KnowledgeTree from "@/components/KnowledgeTree"
import KnowledgeDetailDrawer from "@/components/KnowledgeDetailDrawer"
import GraphExplorer from "./GraphExplorer"

export default function GraphPage() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(null)
  const [mode, setMode] = useState<"tree" | "network">("tree")
  const [searchQuery, setSearchQuery] = useState("")
  const [phaseFilter, setPhaseFilter] = useState<number>(1)
  const [showAllNodes, setShowAllNodes] = useState(false)
  const [showSkills, setShowSkills] = useState(true)
  const [showKnowledge, setShowKnowledge] = useState(true)
  const [showTasks, setShowTasks] = useState(true)
  const [showCourses, setShowCourses] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lingai-completed-courses")
      if (saved) setCompletedCourses(JSON.parse(saved))
    } catch {}
  }, [])

  const handleNavigate = useCallback((courseId: string) => {
    localStorage.setItem("lingai-current-course", courseId)
    window.location.href = "/"
  }, [])

  const totalKnowledge = knowledge.length
  const totalTasks = researchTasks.length
  const totalCourses = stages.reduce((s, st) => s + st.courses.length, 0)

  // Phase labels
  const phaseLabels = ["全部", "Phase 1", "Phase 2", "Phase 3", "Phase 4"]

  return (
    <div className="flex h-screen w-full bg-white">
      {/* ──────────────── Left sidebar: controls ──────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50/50 overflow-y-auto p-4 space-y-5">
        {/* Mode toggle */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">显示模式</p>
          <div className="flex gap-1">
            <button onClick={() => setMode("tree")}
              className={`flex-1 text-xs px-2 py-1.5 rounded font-medium transition-colors ${mode === "tree" ? "bg-blue-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
              树状
            </button>
            <button onClick={() => setMode("network")}
              className={`flex-1 text-xs px-2 py-1.5 rounded font-medium transition-colors ${mode === "network" ? "bg-blue-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
              网络图
            </button>
          </div>
        </div>

        {/* Search */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">搜索</p>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索知识点…"
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-300 bg-white"
          />
        </div>

        {/* Phase filter */}
        {mode === "network" && (
          <>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">阶段</p>
              <div className="flex flex-wrap gap-1">
                {phaseLabels.map((label, i) => (
                  <button key={i} onClick={() => setPhaseFilter(i)}
                    className={`text-xs px-2 py-1 rounded font-medium transition-colors ${phaseFilter === i ? "bg-blue-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Node type filters */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">节点类型</p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={showSkills} onChange={(e) => setShowSkills(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-0" />
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Skill
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={showKnowledge} onChange={(e) => setShowKnowledge(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-0" />
                  <span className="w-2 h-2 rounded-full bg-gray-500" /> Knowledge
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={showTasks} onChange={(e) => setShowTasks(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-0" />
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Task
                </label>
              </div>
            </div>

            {/* Show all toggle */}
            <div>
              <button onClick={() => setShowAllNodes(!showAllNodes)}
                className={`text-xs px-3 py-1.5 rounded font-medium w-full border transition-colors ${showAllNodes ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                {showAllNodes ? "显示全部知识体系" : "显示全部知识体系"}
              </button>
            </div>
          </>
        )}

        {/* Stats */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">统计</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>知识点: <strong className="text-gray-700">{totalKnowledge}</strong></p>
            <p>科研任务: <strong className="text-gray-700">{totalTasks}</strong></p>
            <p>课程: <strong className="text-gray-700">{totalCourses}</strong></p>
          </div>
        </div>
      </aside>

      {/* ──────────────── Center: Canvas ──────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-2 flex items-center gap-3">
          <h1 className="text-sm font-bold text-gray-800">知识体系</h1>
          <span className="text-[10px] text-gray-400">{mode === "tree" ? "树状导航" : "知识图谱探索"}</span>
          <span className="text-gray-200">|</span>
          <span className="text-[10px] text-gray-400">{knowledge.length} 知识点</span>
          <span className="text-[10px] text-gray-400">{researchTasks.length} 任务</span>
          {mode === "network" && phaseFilter > 0 && (
            <span className="ml-auto text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{phaseLabels[phaseFilter]}</span>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          {mode === "tree" ? (
            <div className="h-full overflow-y-auto p-5">
              <KnowledgeTree
                completedCourses={completedCourses}
                onSelectKnowledge={setSelectedKnowledge}
                searchQuery={searchQuery}
              />
            </div>
          ) : (
            <div className="w-full h-full">
              <GraphExplorer
                completedCourses={completedCourses}
                onSelectKnowledge={setSelectedKnowledge}
                phaseFilter={showAllNodes ? 0 : phaseFilter}
              />
            </div>
          )}
        </div>
      </main>

      {/* ──────────────── Right: Detail drawer ──────────────── */}
      <KnowledgeDetailDrawer
        knowledgeId={selectedKnowledge}
        completedCourses={completedCourses}
        onClose={() => setSelectedKnowledge(null)}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
