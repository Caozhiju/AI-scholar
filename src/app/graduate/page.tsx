"use client"

import Link from "next/link"
import { buildPhaseReview } from "@/lib/review/data"
import { StatusBadge, CertBadge } from "@/lib/review/badge"
import { researchProjects } from "@/data/researchProjects"
import { useResearchProjects } from "@/hooks/useResearchProjects"

const phases = [
  { id: "python", label: "Phase 1" },
  { id: "cli", label: "Phase 2" },
  { id: "llm", label: "Phase 3" },
  { id: "phase4", label: "Phase 4" },
]

export default function GraduatePage() {
  const { isCompleted } = useResearchProjects()
  const reviews = phases.map((p) => ({ ...p, data: buildPhaseReview(p.id) }))

  const totalCourses = reviews.reduce((s, r) => s + (r.data?.courseCount || 0), 0)
  const totalPublished = reviews.reduce((s, r) => s + Math.round((r.data?.courseCount || 0) * (r.data?.completionRate || 0) / 100), 0)
  const totalKnowledge = reviews.reduce((s, r) => s + (r.data?.knowledgeCount || 0), 0)
  const graduatedCount = reviews.filter((r) => r.data?.graduationStatus === "graduated").length

  const level1Projects = researchProjects.filter(p => p.level === 1)
  const level2Projects = researchProjects.filter(p => p.level === 2)
  const capstoneProjects = researchProjects.filter(p => p.level === 3)
  const completedL1 = level1Projects.filter(p => isCompleted(p.id)).length
  const completedL2 = level2Projects.filter(p => isCompleted(p.id)).length
  const completedCapstone = capstoneProjects.filter(p => isCompleted(p.id)).length

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          毕业总览
          <span className="text-sm font-normal text-gray-400 ml-3">Graduation Status</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">LingAI Scholar 学位审核系统</p>
      </div>

      {/* Overall Progress */}
      <div className="border border-gray-200 rounded-xl bg-white p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">总体培养方案进度</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">{totalCourses}</div>
            <div className="text-xs text-gray-400 mt-0.5">总课程数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{totalCourses > 0 ? Math.round(totalPublished / totalCourses * 100) : 0}%</div>
            <div className="text-xs text-gray-400 mt-0.5">课程完成率</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{totalKnowledge}</div>
            <div className="text-xs text-gray-400 mt-0.5">知识点掌握</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{Math.round(graduatedCount / 4 * 100)}%</div>
            <div className="text-xs text-gray-400 mt-0.5">毕业进度</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round(graduatedCount / 4 * 100)}%` }} />
        </div>
      </div>

      {/* Project Completion */}
      <div className="border border-gray-200 rounded-xl bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700">科研实训项目完成率</h2>
          <Link href="/projects" className="text-xs text-blue-600 hover:underline">查看全部项目 →</Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-700">{completedL1}/{level1Projects.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">课程项目</div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${level1Projects.length > 0 ? (completedL1 / level1Projects.length * 100) : 0}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-700">{completedL2}/{level2Projects.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">阶段项目</div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${level2Projects.length > 0 ? (completedL2 / level2Projects.length * 100) : 0}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-700">{completedCapstone}/{capstoneProjects.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">毕业项目</div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${capstoneProjects.length > 0 ? (completedCapstone / capstoneProjects.length * 100) : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-3">
        {reviews.map(({ id, label, data }) => {
          if (!data) return null
          return (
            <Link
              key={id}
              href={`/review/${id}`}
              className="block border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors overflow-hidden"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {label}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{data.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{data.subtitle}</p>
                    <p className="text-xs text-gray-400 mt-0.5">毕业能力：{data.graduationAbility}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <StatusBadge status={data.graduationStatus} />
                  {data.graduationStatus === "graduated" && (
                    <div className="mt-1">
                      <CertBadge level={data.graduateRecord.certificateLevel} score={data.graduateRecord.score} />
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-2 flex items-center gap-4 text-xs text-gray-400">
                <span>{data.courseCount} 门课程</span>
                <span>{data.knowledgeCount} 个知识点</span>
                <span>{data.taskCount} 项科研任务</span>
                <span className="ml-auto">{data.completionRate}% 完成</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Legend */}
      <div className="border border-gray-200 rounded-xl bg-white p-4 text-xs text-gray-500 space-y-1">
        <h3 className="font-medium text-gray-700 mb-1">等级体系说明</h3>
        <p>90分以上：优秀毕业 · 80-89分：良好毕业 · 70-79分：合格毕业 · 70分以下：未通过</p>
        <p className="text-gray-400 mt-1">通过全部四个阶段的毕业评审后，可获得LingAI Scholar完整课程认证。</p>
      </div>
    </div>
  )
}
