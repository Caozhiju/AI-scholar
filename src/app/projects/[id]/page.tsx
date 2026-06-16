"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { researchProjects, type ProjectLevel } from "@/data/researchProjects"
import { stages } from "@/data/courses"
import { knowledge, researchTasks } from "@/data/knowledgeGraph"
import { useResearchProjects } from "@/hooks/useResearchProjects"

const levelLabels: Record<ProjectLevel, string> = {
  1: "课程项目",
  2: "阶段项目",
  3: "毕业项目",
}

const levelTimeLabels: Record<ProjectLevel, string> = {
  1: "30~60 分钟",
  2: "3~10 小时",
  3: "20~50 小时",
}

export default function ProjectDetailPage() {
  const params = useParams()
  const { getStatus, markCompleted, markInProgress } = useResearchProjects()

  const project = useMemo(
    () => researchProjects.find(p => p.id === params.id),
    [params.id]
  )

  const relatedCourses = useMemo(() => {
    if (!project) return []
    return stages.flatMap(s =>
      s.courses.filter(c => project.relatedCourseIds.includes(c.id))
    )
  }, [project])

  const relatedKnowledge = useMemo(() => {
    if (!project) return []
    return knowledge.filter(k => project.relatedKnowledgeIds.includes(k.id))
  }, [project])

  const relatedTasks = useMemo(() => {
    if (!project) return []
    return researchTasks.filter(t => project.relatedTaskIds.includes(t.id))
  }, [project])

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500">项目未找到</p>
        <Link href="/projects" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          返回项目列表
        </Link>
      </div>
    )
  }

  const status = getStatus(project.id)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400">
        <Link href="/projects" className="hover:text-gray-600">科研实训</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-600">{project.title}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400">{project.id}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
            project.level === 1 ? "bg-blue-50 text-blue-600 border-blue-200" :
            project.level === 2 ? "bg-purple-50 text-purple-600 border-purple-200" :
            "bg-amber-50 text-amber-600 border-amber-200"
          }`}>
            {levelLabels[project.level]}
          </span>
          <span className="text-xs text-gray-400">· {levelTimeLabels[project.level]}</span>
          {project.phaseId && (
            <span className="text-xs text-gray-400">
              · {project.phaseId === "capstone" ? "跨阶段综合" : `Phase ${project.phaseId === "python" ? 1 : project.phaseId === "cli" ? 2 : 3}`}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-800 mt-1">{project.title}</h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{project.description}</p>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-3">
        {status === "completed" ? (
          <span className="text-sm text-green-600 font-medium">✓ 已完成</span>
        ) : status === "in-progress" ? (
          <div className="flex gap-2">
            <span className="text-sm text-blue-600 font-medium">● 进行中</span>
            <button
              onClick={() => markCompleted(project.id)}
              className="text-xs bg-green-50 text-green-600 border border-green-200 rounded px-3 py-1 hover:bg-green-100 transition-colors"
            >
              标记完成
            </button>
          </div>
        ) : (
          <button
            onClick={() => markInProgress(project.id)}
            className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded px-3 py-1 hover:bg-blue-100 transition-colors"
          >
            开始项目
          </button>
        )}
      </div>

      {/* Objectives */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-gray-700">学习目标</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          {project.objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </section>

      {/* Prerequisites */}
      {project.prerequisites.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-700">前置知识</h2>
          <div className="flex flex-wrap gap-1.5">
            {project.prerequisites.map(kid => {
              const k = knowledge.find(kn => kn.id === kid)
              return k ? (
                <span key={kid} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200">
                  {k.label}
                </span>
              ) : (
                <span key={kid} className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded border border-gray-200">
                  {kid}
                </span>
              )
            })}
          </div>
        </section>
      )}

      {/* Steps */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700">步骤拆解</h2>
        <div className="space-y-2">
          {project.steps.map(step => (
            <div key={step.order} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {step.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-medium text-gray-800">{step.title}</h3>
                    <span className="text-[10px] text-gray-400">{step.duration}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
                  {step.tips && step.tips.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {step.tips.map((tip, ti) => (
                        <p key={ti} className="text-[10px] text-amber-600">💡 {tip}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deliverables */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-gray-700">提交要求 / 产出</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          {project.deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </section>

      {/* Evaluation Criteria */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-gray-700">评分标准</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          {project.evaluationCriteria.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-700">关联课程</h2>
          <div className="flex flex-wrap gap-1.5">
            {relatedCourses.map(c => (
              <Link
                key={c.id}
                href="/"
                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Knowledge */}
      {relatedKnowledge.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-700">关联知识点</h2>
          <div className="flex flex-wrap gap-1.5">
            {relatedKnowledge.map(k => (
              <span key={k.id} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200">
                {k.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Related Research Tasks */}
      {relatedTasks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-700">关联科研任务</h2>
          <div className="flex flex-wrap gap-1.5">
            {relatedTasks.map(t => (
              <span key={t.id} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-200">
                {t.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div className="border-t border-gray-100 pt-4 flex justify-between text-sm">
        <Link href="/projects" className="text-blue-600 hover:underline">
          ← 返回项目列表
        </Link>
      </div>
    </div>
  )
}
