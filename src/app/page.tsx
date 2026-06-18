"use client"

import { useState, useEffect, useCallback } from "react"
import { stages, type Stage } from "@/data/courses"
import { versionInfo } from "@/data/version"
import { useProgress } from "@/hooks/useProgress"
import { runCourseAudit } from "@/data/courseTemplate"
import Sidebar from "@/components/Sidebar"
import ContentArea from "@/components/ContentArea"
import ProgressPanel from "@/components/ProgressPanel"
import AITutor from "@/components/AITutor"

export default function Home() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      runCourseAudit(stages)
    }
  }, [])
  const { currentCourseId, setCurrentCourseId, completedCourses, markCourseCompleted, isCourseCompleted, loaded } = useProgress()

  const [activeStageId, setActiveStageId] = useState(stages?.[0]?.id ?? "")

  const activeStage = (stages?.find((s: Stage) => s.id === activeStageId) ?? stages?.[0]) || { id: "", title: "", courses: [] }
  const activeCourseId = currentCourseId && (stages ?? []).some((s: Stage) => (s?.courses ?? []).some((c) => c.id === currentCourseId))
    ? currentCourseId
    : (stages?.[0]?.courses?.length ?? 0) > 0
      ? stages?.[0]?.courses?.[0]?.id ?? ""
      : ""

  useEffect(() => {
    if (loaded && !currentCourseId && (stages?.[0]?.courses?.length ?? 0) > 0) {
      setCurrentCourseId(stages[0].courses[0].id)
    }
  }, [loaded, currentCourseId, setCurrentCourseId])

  const handleStageSelect = (stage: Stage) => {
    setActiveStageId(stage.id)
    if (stage.courses.length > 0) {
      setCurrentCourseId(stage.courses[0].id)
    }
  }

  const handleCourseSelect = (courseId: string) => {
    setCurrentCourseId(courseId)
  }

  const handleComplete = (courseId: string) => {
    markCourseCompleted(courseId)
  }

  const allCourseIds = stages?.flatMap((s: Stage) => s.courses.map((c) => c.id)) ?? []
  const totalWithQuiz = stages?.flatMap((s: Stage) => s.courses).filter((c) => c.quiz && c.quiz.length > 0).length ?? 0
  const [aiPinned, setAiPinned] = useState(false)
  const handleTogglePin = useCallback(() => setAiPinned(p => !p), [])

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-1 min-h-0">
        <Sidebar
          activeStageId={activeStageId}
          activeCourseId={activeCourseId}
          completedCourses={completedCourses}
          onStageSelect={handleStageSelect}
          onCourseSelect={handleCourseSelect}
        />
        <ContentArea
          stage={activeStage}
          activeCourseId={activeCourseId}
          completedCourses={completedCourses}
          onNavigate={handleCourseSelect}
          onComplete={handleComplete}
        />
        <ProgressPanel
          stage={activeStage}
          activeCourseId={activeCourseId}
          completedCourses={completedCourses}
          totalCourseCount={allCourseIds.length}
        />
        {aiPinned && activeCourseId && (
          <AITutor
            courseId={activeCourseId}
            courseTitle={(() => {
              const c = stages.flatMap(s => s.courses).find(co => co.id === activeCourseId)
              return c?.title ?? ""
            })()}
            pinned={true}
            onTogglePin={handleTogglePin}
          />
        )}
      </div>
      <div className="flex-shrink-0 h-7 border-t border-gray-100 bg-white flex items-center px-6 gap-4 text-xs text-gray-400">
        <span>LingAI Scholar <strong>v{versionInfo?.version ?? ""}</strong></span>
        <span className="text-gray-200">|</span>
        <span>{versionInfo?.courseCount ?? 0} 课程</span>
        <span className="text-gray-200">|</span>
        <span>{versionInfo?.totalLearningHours ?? 0} 小时</span>
        <span className="text-gray-200">|</span>
        <span>{versionInfo?.releaseDate ?? ""}</span>
      </div>

      {activeCourseId && !aiPinned && (
        <AITutor
          courseId={activeCourseId}
          courseTitle={(() => {
            const c = stages.flatMap(s => s.courses).find(co => co.id === activeCourseId)
            return c?.title ?? ""
          })()}
          pinned={false}
          onTogglePin={handleTogglePin}
        />
      )}
    </div>
  )
}
