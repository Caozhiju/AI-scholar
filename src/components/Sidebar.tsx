"use client"

import { stages, type Stage } from "@/data/courses"

interface SidebarProps {
  activeStageId: string
  activeCourseId: string
  completedCourses: string[]
  onStageSelect: (stage: Stage) => void
  onCourseSelect: (courseId: string) => void
}

export default function Sidebar({ activeStageId, activeCourseId, completedCourses, onStageSelect, onCourseSelect }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-800 tracking-tight">LingAI Scholar</h1>
        <p className="text-xs text-gray-400 mt-0.5">语言学AI自学平台</p>
      </div>
      <nav className="p-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">课程目录</p>
        <ul className="space-y-1">
          {stages.map((stage) => {
            const isActive = stage.id === activeStageId
            const stageCompleted = stage.courses.length > 0 && stage.courses.every((c) => completedCourses.includes(c.id))
            return (
              <li key={stage.id}>
                <button
                  onClick={() => onStageSelect(stage)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <span className="block leading-snug">{stage.title}</span>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    {stage.courses.length > 0 ? `${stage.courses.length} 课` : "即将上线"}
                  </span>
                </button>
                {isActive && stage.courses.length > 0 && (
                  <ul className="ml-2 mt-1 border-l-2 border-blue-100 space-y-0.5">
                    {stage.courses.map((course) => {
                      const isCourseActive = course.id === activeCourseId
                      const isCompleted = completedCourses.includes(course.id)
                      return (
                        <li key={course.id}>
                          <button
                            onClick={() => onCourseSelect(course.id)}
                            className={`w-full text-left pl-3 pr-3 py-2 text-sm rounded-r-lg transition-colors flex items-center gap-2 ${
                              isCourseActive
                                ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500 -ml-0.5"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="w-4 text-center flex-shrink-0 text-xs">
                              {isCourseActive ? (
                                <span className="text-blue-500">●</span>
                              ) : isCompleted ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-gray-300">○</span>
                              )}
                            </span>
                            <span className="block leading-snug truncate">{course.title}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
