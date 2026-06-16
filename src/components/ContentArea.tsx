"use client"

import React, { useMemo } from "react"
import type { Stage } from "@/data/courses"
import { knowledge, getCourseKnowledge, getNextRecommendedCourse } from "@/data/knowledgeGraph"
import QuizSection from "./QuizSection"
import VisualLearningSection from "./VisualLearningSection"

interface ContentAreaProps {
  stage: Stage
  activeCourseId: string
  completedCourses: string[]
  onNavigate: (courseId: string) => void
  onComplete: (courseId: string) => void
}

const difficultyColor: Record<string, string> = {
  "入门": "bg-green-50 text-green-700",
  "初级": "bg-blue-50 text-blue-700",
  "中级": "bg-orange-50 text-orange-700",
  "高级": "bg-red-50 text-red-700",
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function isTableRow(line: string) {
  const t = line.trim()
  return t.startsWith("|") && t.endsWith("|") && t.split("|").length >= 3
}

function parseTable(rows: string[]) {
  const cells = (row: string) =>
    row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim())

  const headerCells = cells(rows[0])
  const dataRows = rows.slice(2).filter((r) => r.trim())

  return (
    <div key={`table-${Math.random()}`} className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            {headerCells.map((c, i) => (
              <th key={i} className="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">
                {renderInline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-gray-50" : ""}>
              {cells(row).map((c, ci) => (
                <td key={ci} className="border border-gray-200 px-4 py-2.5 text-gray-700 whitespace-nowrap">
                  {renderInline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderContent(text: string) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let inList = false
  let listItems: React.ReactNode[] = []
  let listIndex = 0
  let inTable = false
  let tableRows: string[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${listIndex}`} className="list-disc pl-5 space-y-1 my-2">
          {listItems}
        </ul>
      )
      listIndex++
      listItems = []
      inList = false
    }
  }

  const flushTable = () => {
    if (tableRows.length >= 2) {
      elements.push(parseTable(tableRows))
    }
    tableRows = []
    inTable = false
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()

    if (!trimmed) {
      if (inTable) { flushTable() }
      flushList()
      continue
    }

    if (isTableRow(trimmed)) {
      flushList()
      inTable = true
      tableRows.push(trimmed)
      continue
    }

    if (inTable) {
      flushTable()
    }

    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      flushList()
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-xl font-bold text-gray-900 mt-8 mb-4">
          {trimmed.slice(2)}
        </h1>
      )
    } else if (trimmed.startsWith("## ")) {
      flushList()
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-lg font-bold text-gray-800 mt-6 mb-3">
          {renderInline(trimmed.slice(3))}
        </h2>
      )
    } else if (trimmed.startsWith("### ")) {
      flushList()
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-base font-semibold text-gray-800 mt-5 mb-2">
          {renderInline(trimmed.slice(4))}
        </h3>
      )
    } else if (trimmed.startsWith("> ")) {
      flushList()
      elements.push(
        <blockquote key={`bq-${elements.length}`} className="border-l-4 border-blue-200 bg-blue-50/50 pl-4 py-2 my-3 text-sm text-gray-600 italic">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      )
    } else if (trimmed.startsWith("- ")) {
      inList = true
      listItems.push(
        <li key={`li-${listItems.length}`} className="text-gray-700 leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </li>
      )
    } else {
      flushList()
      elements.push(
        <p key={`p-${elements.length}`} className="text-gray-700 leading-relaxed mb-3">
          {renderInline(trimmed)}
        </p>
      )
    }
  }
  if (inTable) { flushTable() }
  flushList()
  return elements
}

export default function ContentArea({ stage, activeCourseId, completedCourses, onNavigate, onComplete }: ContentAreaProps) {
  const course = stage.courses.find((c) => c.id === activeCourseId)
  const courseIndex = stage.courses.findIndex((c) => c.id === activeCourseId)
  const sortedCourses = [...stage.courses].sort((a, b) => a.position - b.position)
  const isFirst = courseIndex === 0
  const isLast = courseIndex === stage.courses.length - 1

  const goPrev = () => {
    if (!isFirst && stage.courses[courseIndex - 1]) {
      onNavigate(stage.courses[courseIndex - 1].id)
    }
  }

  const goNext = () => {
    if (!isLast && stage.courses[courseIndex + 1]) {
      onNavigate(stage.courses[courseIndex + 1].id)
    }
  }

  const renderContentWithNextSkill = (content: string) => {
    const summaryIndex = content.search(/^# 本课总结/m)
    if (summaryIndex === -1) {
      return (
        <>
          <div className="prose-custom">{renderContent(content)}</div>
          {course?.nextSkill && (
            <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-4">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">学完本课你将能够</p>
              <p className="text-sm text-blue-800">{course.nextSkill}</p>
            </div>
          )}
        </>
      )
    }
    const beforeSummary = content.slice(0, summaryIndex)
    const summarySection = content.slice(summaryIndex)
    return (
      <>
        <div className="prose-custom">{renderContent(beforeSummary)}</div>
        {course?.nextSkill && (
          <div className="my-6 bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">学完本课你将能够</p>
            <p className="text-sm text-blue-800">{course.nextSkill}</p>
          </div>
        )}
        <div className="prose-custom">{renderContent(summarySection)}</div>
      </>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-10 py-10">
        {stage.courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">课程筹备中</p>
            <p className="text-sm mt-2">该阶段的课程内容正在准备，敬请期待</p>
          </div>
        ) : course ? (
          <article>
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
              {stage.title}
            </span>

            <div className="mt-4 bg-gray-50 rounded-xl border border-gray-100 p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColor[course.difficulty]}`}>
                  {course.difficulty}
                </span>
                <span className="text-gray-400">预计 {course.estimatedMinutes} 分钟</span>
              </div>
              {course.objectives.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">学习目标</p>
                  <ul className="space-y-1">
                    {course.objectives.map((obj, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {sortedCourses.length > 1 && (
              <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">学习路线</p>
                <div className="flex items-center gap-0 overflow-x-auto pb-1">
                  {sortedCourses.map((c, i) => {
                    const isCourseActive = c.id === activeCourseId
                    const isCompleted = completedCourses.includes(c.id)
                    let dotColor = "bg-gray-200 text-gray-400"
                    if (isCourseActive) dotColor = "bg-blue-500 text-white"
                    else if (isCompleted) dotColor = "bg-green-500 text-white"
                    return (
                      <React.Fragment key={c.id}>
                        <button
                          onClick={() => onNavigate(c.id)}
                          className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold transition-colors ${dotColor} ${isCourseActive ? "ring-2 ring-blue-300" : "hover:opacity-80"}`}
                          title={c.title}
                        >
                          {c.position}
                        </button>
                        {i < sortedCourses.length - 1 && (
                          <span className="flex-shrink-0 text-gray-300 text-sm mx-1">→</span>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            )}

            {course.whyLearn && (
              <div className="mb-6 bg-amber-50 rounded-xl border border-amber-100 p-4">
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">为什么学习这一课</p>
                <p className="text-sm text-amber-800">{course.whyLearn}</p>
              </div>
            )}

            {course.visualAssets && course.visualAssets.length > 0 && (
              <VisualLearningSection assets={course.visualAssets} completedCourses={completedCourses} onNavigate={onNavigate} />
            )}

            {course.relatedKnowledge && course.relatedKnowledge.length > 0 && (() => {
              const kg = getCourseKnowledge(course.relatedKnowledge!)
              return (
                <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">本课知识关联</p>
                  {kg.nodes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">本课涉及知识点</p>
                      <div className="flex flex-wrap gap-1.5">
                        {kg.nodes.map((n) => (
                          <span key={n.id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            {n.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {kg.relatedTasks.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">未来可应用于</p>
                      <div className="flex flex-wrap gap-1.5">
                        {kg.relatedTasks.map((t) => (
                          <span key={t.id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {renderContentWithNextSkill(course.content)}

            {course.quiz && course.quiz.length > 0 && (
              <QuizSection quiz={course.quiz} courseId={course.id} onComplete={onComplete} />
            )}

            {completedCourses.includes(course.id) && (() => {
              const next = getNextRecommendedCourse(course.id, completedCourses)
              if (!next) return null
              return (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2">下一步推荐学习</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{next.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{next.description}</p>
                    </div>
                    <button
                      onClick={() => onNavigate(next.id)}
                      className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      开始学习
                    </button>
                  </div>
                </div>
              )
            })()}

            {stage.courses.length > 1 && (
              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                {!isFirst ? (
                  <button
                    onClick={goPrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span>←</span>
                    <span>上一课</span>
                  </button>
                ) : (
                  <div />
                )}
                {!isLast ? (
                  <button
                    onClick={goNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span>下一课</span>
                    <span>→</span>
                  </button>
                ) : (
                  <div />
                )}
              </div>
            )}
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">请从左侧选择课程</p>
          </div>
        )}
      </div>
    </main>
  )
}
