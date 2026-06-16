"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { researchProjects, type ResearchProject, type ProjectLevel } from "@/data/researchProjects"
import { knowledge, researchTasks } from "@/data/knowledgeGraph"
import { stages } from "@/data/courses"
import { useResearchProjects } from "@/hooks/useResearchProjects"

const levelLabels: Record<ProjectLevel, string> = {
  1: "课程项目",
  2: "阶段项目",
  3: "毕业项目",
}

const levelColors: Record<ProjectLevel, string> = {
  1: "bg-blue-50 text-blue-600 border-blue-200",
  2: "bg-purple-50 text-purple-600 border-purple-200",
  3: "bg-amber-50 text-amber-600 border-amber-200",
}

const levelTimeLabels: Record<ProjectLevel, string> = {
  1: "30~60 分钟",
  2: "3~10 小时",
  3: "20~50 小时",
}

export default function ProjectsPage() {
  const { getStatus, isCompleted } = useResearchProjects()
  const [filterLevel, setFilterLevel] = useState<ProjectLevel | 0>(0)
  const [filterPhase, setFilterPhase] = useState<string>("")
  const [filterKnowledge, setFilterKnowledge] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  const phaseIds = useMemo(() => {
    const ids = new Set(researchProjects.map(p => p.phaseId).filter(Boolean))
    return Array.from(ids)
  }, [])

  const allKnowledge = useMemo(() => knowledge, [])

  const coverage = useMemo(() => {
    const allCourseIds = stages.flatMap(s => s.courses.map(c => c.id))
    const coveredCourses = new Set<string>()
    const coveredKnowledge = new Set<string>()
    const coveredTasks = new Set<string>()
    for (const p of researchProjects) {
      p.relatedCourseIds.forEach(id => coveredCourses.add(id))
      p.relatedKnowledgeIds.forEach(id => coveredKnowledge.add(id))
      p.relatedTaskIds.forEach(id => coveredTasks.add(id))
    }
    return {
      knowledgePct: Math.round((coveredKnowledge.size / knowledge.length) * 100),
      taskPct: Math.round((coveredTasks.size / researchTasks.length) * 100),
      coursePct: Math.round((coveredCourses.size / allCourseIds.length) * 100),
      coveredKnowledge: coveredKnowledge.size,
      totalKnowledge: knowledge.length,
      coveredTasks: coveredTasks.size,
      totalTasks: researchTasks.length,
      coveredCourses: coveredCourses.size,
      totalCourses: allCourseIds.length,
    }
  }, [])

  const filtered = useMemo(() => {
    let result = researchProjects
    if (filterLevel !== 0) result = result.filter(p => p.level === filterLevel)
    if (filterPhase) result = result.filter(p => p.phaseId === filterPhase)
    if (filterKnowledge) result = result.filter(p => p.relatedKnowledgeIds.includes(filterKnowledge))
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    return result
  }, [filterLevel, filterPhase, filterKnowledge, searchQuery])

  const levelCounts = useMemo(() => ({
    1: researchProjects.filter(p => p.level === 1).length,
    2: researchProjects.filter(p => p.level === 2).length,
    3: researchProjects.filter(p => p.level === 3).length,
  }), [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Research Studio
          <span className="text-sm font-normal text-gray-400 ml-3">科研实训项目</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          通过三级科研项目体系，将课程知识转化为科研实践能力
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-700">{levelCounts[1]}</div>
          <div className="text-xs text-blue-500">课程项目 (Level 1)</div>
          <div className="text-[10px] text-blue-400 mt-0.5">30~60 分钟</div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-700">{levelCounts[2]}</div>
          <div className="text-xs text-purple-500">阶段项目 (Level 2)</div>
          <div className="text-[10px] text-purple-400 mt-0.5">3~10 小时</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
          <div className="text-lg font-bold text-amber-700">{levelCounts[3]}</div>
          <div className="text-xs text-amber-500">毕业项目 (Level 3)</div>
          <div className="text-[10px] text-amber-400 mt-0.5">20~50 小时</div>
        </div>
      </div>

      {/* Coverage Matrix */}
      <div className="border border-gray-200 rounded-xl bg-white p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">研究覆盖率矩阵</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-lg font-bold text-blue-700">{coverage.knowledgePct}%</span>
              <span className="text-xs text-gray-400 mb-0.5">知识点</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${coverage.knowledgePct}%` }} />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{coverage.coveredKnowledge}/{coverage.totalKnowledge}</div>
          </div>
          <div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-lg font-bold text-purple-700">{coverage.taskPct}%</span>
              <span className="text-xs text-gray-400 mb-0.5">科研任务</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${coverage.taskPct}%` }} />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{coverage.coveredTasks}/{coverage.totalTasks}</div>
          </div>
          <div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-lg font-bold text-green-700">{coverage.coursePct}%</span>
              <span className="text-xs text-gray-400 mb-0.5">课程</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${coverage.coursePct}%` }} />
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{coverage.coveredCourses}/{coverage.totalCourses}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(Number(e.target.value) as ProjectLevel | 0)}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-600 bg-white"
        >
          <option value={0}>全部难度</option>
          <option value={1}>Level 1 · 课程项目</option>
          <option value={2}>Level 2 · 阶段项目</option>
          <option value={3}>Level 3 · 毕业项目</option>
        </select>
        <select
          value={filterPhase}
          onChange={e => setFilterPhase(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-600 bg-white"
        >
          <option value="">全部阶段</option>
          <option value="python">Phase 1 · Python</option>
          <option value="cli">Phase 2 · CLI</option>
          <option value="llm">Phase 3 · LLM</option>
          <option value="capstone">毕业项目</option>
        </select>
        <select
          value={filterKnowledge}
          onChange={e => setFilterKnowledge(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-600 bg-white"
        >
          <option value="">全部知识</option>
          {allKnowledge.map(k => (
            <option key={k.id} value={k.id}>{k.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索项目…"
          className="text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-600 bg-white flex-1 min-w-[160px]"
        />
      </div>

      {/* Project list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">无匹配项目</p>
        )}
        {filtered.map(project => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${levelColors[project.level]}`}>
                      {levelLabels[project.level]}
                    </span>
                    <span className="text-xs text-gray-400">{project.id}</span>
                    {project.phaseId && (
                      <span className="text-xs text-gray-400">
                        · {project.phaseId === "capstone" ? "毕业项目" : `Phase ${project.phaseId === "python" ? 1 : project.phaseId === "cli" ? 2 : 3}`}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{project.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{project.description}</p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <div className="text-xs text-gray-400">{levelTimeLabels[project.level]}</div>
                  {isCompleted(project.id) && (
                    <span className="text-xs text-green-600 font-medium">已完成</span>
                  )}
                  {getStatus(project.id) === "in-progress" && (
                    <span className="text-xs text-blue-600 font-medium">进行中</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {project.relatedKnowledgeIds.slice(0, 4).map(kid => {
                  const k = allKnowledge.find(kn => kn.id === kid)
                  return k ? (
                    <span key={kid} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">
                      {k.label}
                    </span>
                  ) : null
                })}
                {project.relatedKnowledgeIds.length > 4 && (
                  <span className="text-[10px] text-gray-400">+{project.relatedKnowledgeIds.length - 4}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
