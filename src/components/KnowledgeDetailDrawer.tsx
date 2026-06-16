"use client"

import { useMemo } from "react"
import {
  knowledge,
  researchTasks,
  skillToKnowledge,
  knowledgeToTask,
  getLearningPath,
  skills,
  getKnowledgeCourses,
  type KnowledgeNode,
} from "@/data/knowledgeGraph"
import { stages } from "@/data/courses"

interface DrawerProps {
  knowledgeId: string | null
  completedCourses: string[]
  onClose: () => void
  onNavigate: (courseId: string) => void
}

export default function KnowledgeDetailDrawer({ knowledgeId, completedCourses, onClose, onNavigate }: DrawerProps) {
  const data = useMemo(() => {
    if (!knowledgeId) return null
    const node = knowledge.find((k) => k.id === knowledgeId)
    if (!node) return null

    const path = getLearningPath(knowledgeId)
    const relatedSkillIds = Object.entries(skillToKnowledge)
      .filter(([, kwIds]) => kwIds.includes(knowledgeId))
      .map(([sid]) => sid)
    const relatedSkillNames = skills.filter((s) => relatedSkillIds.includes(s.id)).map((s) => s.label)

    const taskIds = knowledgeToTask[knowledgeId] || []
    const relatedTaskNames = researchTasks.filter((t) => taskIds.includes(t.id))

    const courseTitles = getKnowledgeCourses(knowledgeId)
    const courseIds = courseTitles
      .map((title) => {
        const c = stages.flatMap((s) => s.courses).find((co) => co.title === title)
        return c ? c.id : null
      })
      .filter(Boolean) as string[]

    const isLearned = courseTitles.some((title) => {
      const c = stages.flatMap((s) => s.courses).find((co) => co.title === title)
      return c && completedCourses.includes(c.id)
    })

    const allPrereqs = path.prerequisites
    const unlearnedPrereqs = allPrereqs.filter((p) => {
      const pCourses = getKnowledgeCourses(p.id)
      return !pCourses.some((title) => {
        const pc = stages.flatMap((s) => s.courses).find((co) => co.title === title)
        return pc && completedCourses.includes(pc.id)
      })
    })

    return { node, path, relatedSkillNames, relatedTaskNames, courseIds, isLearned, unlearnedPrereqs, allPrereqs }
  }, [knowledgeId, completedCourses])

  if (!knowledgeId || !data) return null

  const { node, path, relatedSkillNames, relatedTaskNames, courseIds, isLearned, unlearnedPrereqs, allPrereqs } = data

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/10" onClick={onClose} />
      <aside className="w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">知识详情</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">名称</p>
            <p className="text-sm font-semibold text-gray-800">{node.label}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">简介</p>
            <p className="text-sm text-gray-600 leading-relaxed">{node.description}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">状态</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              isLearned ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
            }`}>{isLearned ? "已掌握" : "未掌握"}</span>
          </div>

          {relatedSkillNames.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">所属能力</p>
              <div className="flex flex-wrap gap-1">
                {relatedSkillNames.map((name) => (
                  <span key={name} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">学习路径</p>

            {allPrereqs.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">前置知识</p>
                <div className="space-y-1">
                  {allPrereqs.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-l-2 border-blue-300 pl-3 py-1 my-1">
              <p className="text-sm font-medium text-blue-700">{node.label}</p>
              <p className="text-xs text-blue-500">当前知识</p>
            </div>

            {path.nextNodes.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">后续知识</p>
                <div className="space-y-1">
                  {path.nextNodes.map((n) => (
                    <div key={n.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                      {n.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {unlearnedPrereqs.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs font-medium text-amber-700 mb-1">学习建议</p>
              <p className="text-xs text-amber-600 mb-1">你尚未掌握前置知识：</p>
              <ul className="text-xs text-amber-600 space-y-0.5 mb-2">
                {unlearnedPrereqs.map((p) => {
                  const pCourses = getKnowledgeCourses(p.id)
                  const pCourseId = pCourses
                    .map((title) => stages.flatMap((s) => s.courses).find((c) => c.title === title))
                    .find(Boolean)
                  return (
                    <li key={p.id}>
                      • {p.label}
                      {pCourseId && (
                        <button
                          onClick={() => onNavigate(pCourseId.id)}
                          className="text-amber-800 underline ml-1 hover:text-amber-900"
                        >
                          去学习
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {relatedTaskNames.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">关联科研任务</p>
              <div className="space-y-2">
                {relatedTaskNames.map((t) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700">{t.label}</p>
                      <p className="text-[10px] text-gray-400">{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courseIds.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">关联课程</p>
              <div className="space-y-1">
                {courseIds.map((cid) => {
                  const c = stages.flatMap((s) => s.courses).find((co) => co.id === cid)
                  if (!c) return null
                  return (
                    <div key={cid} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{c.title}</span>
                      <button
                        onClick={() => onNavigate(cid)}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                      >
                        前往
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
