"use client"

import { useState, useEffect, useCallback } from "react"

export type ProjectStatus = "not-started" | "in-progress" | "completed"

const PROJECT_STATUS_KEY = "lingai-project-status"

export function useResearchProjects() {
  const [projectStatuses, setProjectStatuses] = useState<Record<string, ProjectStatus>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(PROJECT_STATUS_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (typeof parsed === "object") {
          setProjectStatuses(parsed)
        }
      } catch {
        // ignore corrupt data
      }
    }
    setLoaded(true)
  }, [])

  const setProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    setProjectStatuses((prev) => {
      const updated = { ...prev, [projectId]: status }
      localStorage.setItem(PROJECT_STATUS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const markCompleted = useCallback((projectId: string) => {
    setProjectStatus(projectId, "completed")
  }, [setProjectStatus])

  const markInProgress = useCallback((projectId: string) => {
    setProjectStatus(projectId, "in-progress")
  }, [setProjectStatus])

  const getStatus = useCallback(
    (projectId: string): ProjectStatus => projectStatuses[projectId] || "not-started",
    [projectStatuses]
  )

  const isCompleted = useCallback(
    (projectId: string) => projectStatuses[projectId] === "completed",
    [projectStatuses]
  )

  return {
    projectStatuses,
    setProjectStatus,
    markCompleted,
    markInProgress,
    getStatus,
    isCompleted,
    loaded,
  }
}
