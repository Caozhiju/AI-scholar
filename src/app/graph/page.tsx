"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { stages } from "@/data/courses"
import { knowledge, researchTasks } from "@/data/knowledgeGraph"
import KnowledgeTree from "@/components/KnowledgeTree"
import KnowledgeDetailDrawer from "@/components/KnowledgeDetailDrawer"

const NetworkGraph = dynamic(() => import("./NetworkGraph"), { ssr: false })

export default function GraphPage() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(null)
  const [mode, setMode] = useState<"tree" | "network">("tree")
  const [searchQuery, setSearchQuery] = useState("")
  const [knowledgeProgress, setKnowledgeProgress] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lingai-completed-courses")
      if (saved) setCompletedCourses(JSON.parse(saved))
    } catch {}
    try {
      const kp = localStorage.getItem("lingai-knowledge-progress")
      if (kp) setKnowledgeProgress(JSON.parse(kp))
    } catch {}
  }, [])

  const handleNavigate = useCallback((courseId: string) => {
    localStorage.setItem("lingai-current-course", courseId)
    window.location.href = "/"
  }, [])

  const totalKnowledge = knowledge.length
  const totalTasks = researchTasks.length
  const totalCourses = stages.reduce((s, st) => s + st.courses.length, 0)

  return (
    <div className="flex h-screen w-full">
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-bold text-gray-800">知识体系</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("tree")}
                className={`text-xs px-2.5 py-1.5 rounded font-medium transition-colors ${mode === "tree" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                树状模式
              </button>
              <button
                onClick={() => setMode("network")}
                className={`text-xs px-2.5 py-1.5 rounded font-medium transition-colors ${mode === "network" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                网络图模式
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span><strong className="text-gray-700">{totalKnowledge}</strong> 知识点</span>
            <span><strong className="text-gray-700">{totalTasks}</strong> 科研任务</span>
            <span><strong className="text-gray-700">{totalCourses}</strong> 课程</span>
            <span className="text-gray-200">|</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索知识点…"
              className="text-xs border border-gray-200 rounded px-2 py-1 w-48 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-300"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === "tree" ? (
            <KnowledgeTree
              completedCourses={completedCourses}
              onSelectKnowledge={setSelectedKnowledge}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="w-full h-[600px]">
              <NetworkGraph completedCourses={completedCourses} onSelectKnowledge={setSelectedKnowledge} />
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <KnowledgeDetailDrawer
        knowledgeId={selectedKnowledge}
        completedCourses={completedCourses}
        onClose={() => setSelectedKnowledge(null)}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
