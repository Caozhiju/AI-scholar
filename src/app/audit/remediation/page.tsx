"use client"

import { useMemo, useState } from "react"
import { runFullAudit } from "@/lib/audit"
import { getSeverityLabel, getSeverityColor, type RemediationSeverity, type RemediationStatus } from "@/data/remediationPlan"

const severityOrder: RemediationSeverity[] = ["S", "A", "B", "C"]
const statusOrder: RemediationStatus[] = ["todo", "in-progress", "done"]

function statusLabel(s: RemediationStatus): string {
  return { todo: "待处理", "in-progress": "处理中", done: "已完成" }[s]
}

function borderClass(color: string): string {
  const map: Record<string, string> = { red: "border-red-200", orange: "border-orange-200", yellow: "border-yellow-200", gray: "border-gray-200" }
  return map[color] || "border-gray-200"
}

function textColorClass(color: string): string {
  const map: Record<string, string> = { red: "text-red-600", orange: "text-orange-600", yellow: "text-yellow-600", gray: "text-gray-600" }
  return map[color] || "text-gray-600"
}

function badgeBgClass(color: string): string {
  const map: Record<string, string> = { red: "bg-red-500", orange: "bg-orange-500", yellow: "bg-yellow-500", gray: "bg-gray-400" }
  return map[color] || "bg-gray-400"
}

export default function RemediationPage() {
  const audit = useMemo(() => runFullAudit(), [])
  const plan = audit.remediationPlan!
  const allCourses = useMemo(() => Array.from(new Set(plan.items.map((i) => i.courseId))), [plan])

  const [statusOverrides, setStatusOverrides] = useState<Record<string, RemediationStatus>>({})

  const [filterSeverity, setFilterSeverity] = useState<RemediationSeverity | "all">("all")
  const [filterCourse, setFilterCourse] = useState<string | "all">("all")
  const [filterStatus, setFilterStatus] = useState<RemediationStatus | "all">("all")

  const filtered = plan.items.filter((item) => {
    if (filterSeverity !== "all" && item.severity !== filterSeverity) return false
    if (filterCourse !== "all" && item.courseId !== filterCourse) return false
    const st = statusOverrides[`${item.courseId}-${item.issue}`] || item.status
    if (filterStatus !== "all" && st !== filterStatus) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const sa = severityOrder.indexOf(a.severity)
    const sb = severityOrder.indexOf(b.severity)
    if (sa !== sb) return sa - sb
    const sta = statusOverrides[`${a.courseId}-${a.issue}`] || a.status
    const stb = statusOverrides[`${b.courseId}-${b.issue}`] || b.status
    return statusOrder.indexOf(sta) - statusOrder.indexOf(stb)
  })

  function getEffectiveStatus(item: typeof plan.items[0]): RemediationStatus {
    return statusOverrides[`${item.courseId}-${item.issue}`] || item.status
  }

  function toggleStatus(item: typeof plan.items[0]) {
    const key = `${item.courseId}-${item.issue}`
    const current = getEffectiveStatus(item)
    const next = current === "todo" ? "in-progress" : current === "in-progress" ? "done" : "todo"
    setStatusOverrides((prev) => ({ ...prev, [key]: next }))
  }

  const sev = plan.summary.bySeverity

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">课程整改计划</h1>
        <p className="text-sm text-gray-500 mt-1">Phase 2 Quality Improvement Sprint · Remediation Plan</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {([
          ["S", sev.S, "red"],
          ["A", sev.A, "orange"],
          ["B", sev.B, "yellow"],
          ["C", sev.C, "gray"],
        ] as const).map(([level, count, color]) => (
          <div key={level} className={`${borderClass(color)} rounded-lg p-4 bg-white`}>
            <div className={`text-xs font-bold uppercase tracking-wide ${textColorClass(color)}`}>
              {level}级 · {getSeverityLabel(level)}
            </div>
            <div className={`text-3xl font-bold mt-1 ${textColorClass(color)}`}>{count}</div>
            <div className="text-xs text-gray-400 mt-0.5">整改项共 {count} 项</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as any)}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-600"
        >
          <option value="all">全部等级</option>
          {severityOrder.map((s) => (
            <option key={s} value={s}>{s}级 · {getSeverityLabel(s)}</option>
          ))}
        </select>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-600"
        >
          <option value="all">全部课程</option>
          {allCourses.map((cid) => (
            <option key={cid} value={cid}>{cid}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-600"
        >
          <option value="all">全部状态</option>
          {statusOrder.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400 self-center ml-auto">
          共 {filtered.length} 项
        </span>
      </div>

      {/* Issue List */}
      <div className="space-y-2">
        {sorted.map((item, i) => {
          const effStatus = getEffectiveStatus(item)
          const color = getSeverityColor(item.severity)
          return (
            <div key={`${item.courseId}-${item.issue}`} className={`${borderClass(color)} rounded-lg bg-white overflow-hidden`}>
              <div className="flex items-start gap-3 p-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${badgeBgClass(color)}`}>
                  {item.severity}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">{item.courseId}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{item.category}</span>
                  </div>
                  <div className="text-sm text-gray-800 mt-0.5">{item.issue}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.recommendation}</div>
                </div>
                <button
                  onClick={() => toggleStatus(item)}
                  className={`flex-shrink-0 text-xs px-2.5 py-1 rounded font-medium border transition-colors ${
                    effStatus === "done"
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : effStatus === "in-progress"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  }`}
                >
                  {statusLabel(effStatus)}
                </button>
              </div>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <p className="text-sm text-green-600 text-center py-8">无匹配的整改项</p>
        )}
      </div>
    </div>
  )
}
