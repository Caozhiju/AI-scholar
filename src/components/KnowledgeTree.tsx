"use client"

import { useState, useMemo, useCallback } from "react"
import {
  skills, knowledge, researchTasks,
  skillToKnowledge, knowledgeToTask,
  getLearningPath, getKnowledgeCourses,
} from "@/data/knowledgeGraph"
import { stages } from "@/data/courses"

interface TreeProps {
  completedCourses: string[]
  onSelectKnowledge: (id: string) => void
  searchQuery: string
}

const phaseSkills: Record<string, { label: string; skillIds: string[] }> = {
  "Phase 1 · Python科研基础": { label: "Python基础", skillIds: ["skill-python", "skill-text", "skill-data"] },
  "Phase 2 · 计算语言学AI": { label: "NLP基础+教育NLP", skillIds: ["skill-nlp", "skill-edunlp"] },
  "Phase 3 · 大模型LLM": { label: "大模型LLM", skillIds: ["skill-llm"] },
  "Phase 4 · AI研究实践": { label: "研究创新", skillIds: ["skill-research"] },
}

const phaseColors: Record<string, string> = {
  "Phase 1 · Python科研基础": "border-l-blue-500 bg-blue-50/50",
  "Phase 2 · 计算语言学AI": "border-l-emerald-500 bg-emerald-50/50",
  "Phase 3 · 大模型LLM": "border-l-purple-500 bg-purple-50/50",
  "Phase 4 · AI研究实践": "border-l-amber-500 bg-amber-50/50",
}
const phaseDotColors: Record<string, string> = {
  "Phase 1 · Python科研基础": "bg-blue-500",
  "Phase 2 · 计算语言学AI": "bg-emerald-500",
  "Phase 3 · 大模型LLM": "bg-purple-500",
  "Phase 4 · AI研究实践": "bg-amber-500",
}

export default function KnowledgeTree({ completedCourses, onSelectKnowledge, searchQuery }: TreeProps) {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({})
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({})
  const [knowledgeProgress, setKnowledgeProgress] = useState<Record<string, string>>({})
  const [expandedFromSearch, setExpandedFromSearch] = useState<Record<string, boolean>>({})

  const isLearned = useCallback((knowledgeId: string) => {
    const titles = getKnowledgeCourses(knowledgeId)
    return titles.some((title) => {
      const c = stages.flatMap((s) => s.courses).find((co) => co.title === title)
      return c && completedCourses.includes(c.id)
    })
  }, [completedCourses])

  // Auto-expand from search
  const searchHitKnowledge = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>()
    const q = searchQuery.toLowerCase()
    const hits = new Set<string>()
    for (const k of knowledge) {
      if (k.label.toLowerCase().includes(q) || k.description.toLowerCase().includes(q)) {
        hits.add(k.id)
      }
    }
    return hits
  }, [searchQuery])

  const visibleKnowledge = useMemo(() => {
    if (!searchQuery.trim()) return null
    return searchHitKnowledge
  }, [searchQuery, searchHitKnowledge])

  // Build tree structure
  const tree = useMemo(() => {
    return Object.entries(phaseSkills).map(([phaseName, phaseInfo]) => {
      const phaseSkillsList = skills.filter(s => phaseInfo.skillIds.includes(s.id))
      const isPrevExpanded = expandedPhases[phaseName]
      const isSearchHit = visibleKnowledge && phaseSkillsList.some(s =>
        (skillToKnowledge[s.id] || []).some(kid => visibleKnowledge.has(kid))
      )

      return {
        phaseName,
        skills: phaseSkillsList.map(skill => {
          const knowledgeIds = skillToKnowledge[skill.id] || []
          const knowledgeNodes = knowledge.filter(k => knowledgeIds.includes(k.id))
          const isSkillExpanded = expandedSkills[skill.id]

          return {
            skill,
            knowledgeNodes: knowledgeNodes.map(kn => ({
              knowledge: kn,
              isLearned: isLearned(kn.id),
              tasks: (knowledgeToTask[kn.id] || [])
                .map(tid => researchTasks.find(t => t.id === tid))
                .filter(Boolean),
              isSearchMatch: visibleKnowledge ? visibleKnowledge.has(kn.id) : false,
            })),
          }
        }),
        isSearchHit,
      }
    })
  }, [expandedPhases, expandedSkills, visibleKnowledge, isLearned])

  function togglePhase(name: string) {
    setExpandedPhases(p => ({ ...p, [name]: !p[name] }))
  }

  function toggleSkill(id: string) {
    setExpandedSkills(s => ({ ...s, [id]: !s[id] }))
  }

  return (
    <div className="space-y-1.5">
      {tree.map(({ phaseName, skills: phaseSkillsList, isSearchHit }) => {
        const isExpanded = expandedPhases[phaseName] || isSearchHit
        const dotColor = phaseDotColors[phaseName] || "bg-gray-400"
        const borderColor = phaseColors[phaseName] || ""

        return (
          <div key={phaseName} className={`rounded-lg border border-gray-200 overflow-hidden ${borderColor ? "border-l-4" : ""}`}
            style={{ borderLeftColor: borderColor.includes("border-l") ? undefined : undefined }}>
            {/* Phase header */}
            <button
              onClick={() => togglePhase(phaseName)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-gray-50/80 ${borderColor}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`} />
              <span className="text-sm font-semibold text-gray-800">{phaseName}</span>
              <span className="text-xs text-gray-400 ml-auto">{phaseSkillsList.length} 技能</span>
              <span className={`text-gray-300 text-xs transition-transform ${isExpanded ? "rotate-90" : ""}`}>▸</span>
            </button>

            {/* Skills */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {phaseSkillsList.map(({ skill, knowledgeNodes }) => {
                  const isSkillExpanded = expandedSkills[skill.id]
                  const searchVisible = !visibleKnowledge || knowledgeNodes.some(kn => kn.isSearchMatch)

                  if (!searchVisible) return null

                  return (
                    <div key={skill.id}>
                      <button
                        onClick={() => toggleSkill(skill.id)}
                        className="w-full flex items-center gap-2.5 px-6 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-600">{skill.label}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">{knowledgeNodes.length} 知识点</span>
                        <span className={`text-gray-300 text-xs transition-transform ${isSkillExpanded ? "rotate-90" : ""}`}>▸</span>
                      </button>

                      {isSkillExpanded && (
                        <div className="border-t border-gray-50">
                          {knowledgeNodes.map(({ knowledge: kn, isLearned: learned, tasks, isSearchMatch }) => {
                            if (visibleKnowledge && !isSearchMatch) return null
                            return (
                              <button
                                key={kn.id}
                                onClick={() => onSelectKnowledge(kn.id)}
                                className={`w-full flex items-center gap-2.5 px-8 py-1.5 text-left hover:bg-blue-50/50 transition-colors ${
                                  isSearchMatch ? "bg-yellow-50" : ""
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  learned ? "bg-green-500" : "bg-gray-300"
                                }`} />
                                <span className={`text-xs ${
                                  learned ? "text-gray-700 font-medium" : "text-gray-500"
                                }`}>{kn.label}</span>
                                <div className="flex gap-1 ml-auto">
                                  {tasks.slice(0, 1).map((t: any) => t && (
                                    <span key={t.id} className="text-[9px] bg-green-50 text-green-600 px-1 py-0.5 rounded border border-green-100">
                                      {t.label.substring(0, 8)}…
                                    </span>
                                  ))}
                                  {tasks.length > 1 && (
                                    <span className="text-[9px] text-gray-400">+{tasks.length - 1}</span>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                          {knowledgeNodes.length === 0 && (
                            <p className="px-8 py-2 text-[10px] text-gray-300">暂无知识点</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
