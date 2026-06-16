"use client"

import { useState, useEffect, useCallback } from "react"

const CURRENT_COURSE_KEY = "lingai-current-course"
const COMPLETED_COURSES_KEY = "lingai-completed-courses"

export function useProgress() {
  const [currentCourseId, setCurrentCourseIdState] = useState<string>("")
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const savedCourse = localStorage.getItem(CURRENT_COURSE_KEY)
    if (savedCourse) {
      setCurrentCourseIdState(savedCourse)
    }

    const savedCompleted = localStorage.getItem(COMPLETED_COURSES_KEY)
    if (savedCompleted) {
      try {
        const parsed = JSON.parse(savedCompleted)
        if (Array.isArray(parsed)) {
          setCompletedCourses(parsed)
        }
      } catch {
        // ignore corrupt data
      }
    }

    setLoaded(true)
  }, [])

  const setCurrentCourseId = useCallback((id: string) => {
    setCurrentCourseIdState(id)
    localStorage.setItem(CURRENT_COURSE_KEY, id)
  }, [])

  const markCourseCompleted = useCallback((courseId: string) => {
    setCompletedCourses((prev) => {
      if (prev.includes(courseId)) return prev
      const updated = [...prev, courseId]
      localStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isCourseCompleted = useCallback(
    (courseId: string) => completedCourses.includes(courseId),
    [completedCourses]
  )

  return {
    currentCourseId,
    setCurrentCourseId,
    completedCourses,
    markCourseCompleted,
    isCourseCompleted,
    loaded,
  }
}
