"use client"

import type { Stage } from "@/data/courses"

interface ProgressPanelProps {
  stage: Stage
  activeCourseId: string
  completedCourses: string[]
  totalCourseCount: number
}

export default function ProgressPanel({ stage, activeCourseId, completedCourses, totalCourseCount }: ProgressPanelProps) {
  const safeCourses = (stage?.courses ?? [])
  const course = safeCourses.find((c) => c?.id === activeCourseId)
  const courseIndex = safeCourses.findIndex((c) => c?.id === activeCourseId)
  const totalCourses = safeCourses.length
  const completedStageCount = safeCourses.filter((c) => c && completedCourses.includes(c.id)).length
  const completionRate = totalCourseCount > 0 ? Math.round((completedCourses.length / totalCourseCount) * 100) : 0

  return (
    <aside className="w-72 flex-shrink-0 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
      <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">学习进度</h2>

      <div className="space-y-5">
        <div>
          <p className="text-xs text-gray-400 mb-1">当前阶段</p>
          <p className="text-sm font-medium text-gray-800 leading-snug">{stage?.title ?? ""}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">当前课程</p>
          <p className="text-sm font-medium text-gray-800 leading-snug">
            {course ? course.title : "未选择"}
          </p>
        </div>

        {totalCourses > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">本阶段进度</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600">
                {course ? courseIndex + 1 : 0}
              </span>
              <span className="text-sm text-gray-400">/ {totalCourses}</span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: course ? `${((courseIndex + 1) / totalCourses) * 100}%` : "0%" }}
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-1">已完成课程</p>
          <p className="text-sm font-medium text-gray-800">
            {completedCourses.length} / {totalCourseCount}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">总完成率</p>
          <p className="text-sm font-medium text-gray-800">{completionRate}%</p>
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
