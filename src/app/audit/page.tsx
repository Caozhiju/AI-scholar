"use client"

import { useMemo, useState } from "react"
import { runFullAudit } from "@/lib/audit"
import { stages } from "@/data/courses"
import { getGrade } from "@/lib/audit/types"

function countChineseChars(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length
}

export default function AuditPage() {
  const audit = useMemo(() => runFullAudit(), [])
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  const avgPct = audit.totalMax > 0 ? Math.round((audit.totalScore / audit.totalMax) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">课程质量审计中心</h1>
        <p className="text-sm text-gray-500 mt-1">LingAI Scholar Curriculum Audit Center</p>
      </div>

      {/* Overall Score */}
      <div className="border border-gray-200 rounded-xl p-8 text-center bg-white">
        <div className="text-5xl font-bold tracking-tight">
          <span className={avgPct >= 90 ? "text-green-600" : avgPct >= 80 ? "text-blue-600" : avgPct >= 70 ? "text-yellow-600" : "text-red-600"}>
            {avgPct}
          </span>
          <span className="text-2xl text-gray-400"> / 100</span>
        </div>
        <div className={`mt-2 text-lg font-medium ${
          avgPct >= 90 ? "text-green-600" : avgPct >= 80 ? "text-blue-600" : avgPct >= 70 ? "text-yellow-600" : "text-red-600"
        }`}>
          {audit.grade}
        </div>
        <div className="mt-1 text-sm text-gray-400">
          {audit.courseReports.length} 门已发布课程 · 总分 {audit.totalScore}/{audit.totalMax}
        </div>
      </div>

      {/* Dimension Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {audit.dimensions.map((dim) => {
          const dimAvg = dim.max > 0 ? Math.round((dim.score / dim.max) * 100) : 0
          return (
            <div key={dim.name} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{dim.name}</div>
              <div className="text-2xl font-bold mt-1">{dimAvg}<span className="text-sm text-gray-400">/{dim.max > 0 ? 100 : 0}</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{dim.score}/{dim.max}</div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  dimAvg >= 90 ? "bg-green-500" : dimAvg >= 80 ? "bg-blue-500" : dimAvg >= 70 ? "bg-yellow-500" : "bg-red-500"
                }`} style={{ width: `${dimAvg}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Stage Reports */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">阶段评分</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {audit.stageReports.map((stage) => (
            <div key={stage.stageId} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="text-sm font-medium text-gray-700">{stage.title}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">课程数</span>
                  <div className="font-bold text-gray-800">{stage.courseCount}</div>
                </div>
                <div>
                  <span className="text-gray-500">总字数</span>
                  <div className="font-bold text-gray-800">{(stage.totalChars / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <span className="text-gray-500">平均字数</span>
                  <div className="font-bold text-gray-800">{(stage.avgChars / 1000).toFixed(1)}k</div>
                </div>
                <div>
                  <span className="text-gray-500">完成率</span>
                  <div className="font-bold text-gray-800">{stage.completionRate}%</div>
                </div>
                <div>
                  <span className="text-gray-500">平均分</span>
                  <div className="font-bold text-gray-800">{stage.avgScore}</div>
                </div>
                <div>
                  <span className="text-gray-500">评估</span>
                  <div className={`font-bold ${stage.avgScore >= 80 ? "text-green-600" : stage.avgScore >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                    {getGrade(stage.avgScore, 100)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Summary */}
      {audit.riskSummary.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">风险报告</h2>
          <div className="space-y-2">
            {audit.riskSummary.map((risk) => (
              <div key={risk.type} className="border border-red-200 bg-red-50 rounded-lg p-3 text-sm">
                <span className="font-medium text-red-700">{risk.type}</span>
                <span className="text-red-500 ml-2">× {risk.count}</span>
                <span className="text-red-400 ml-2 text-xs">{risk.courses.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Line Report */}
      {audit.redLineCourses && audit.redLineCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">质量红线报告</h2>
          <p className="text-xs text-gray-500 mb-3">
            以下课程未通过质量红线检测（字数&ge;5000、案例&ge;2、Quiz&ge;3、图解&ge;1、知识点&ge;2），状态建议标记为 needs-improvement
          </p>
          <div className="space-y-2">
            {audit.redLineCourses.map((rc) => (
              <div key={rc.courseId} className="border border-red-200 rounded-lg p-3 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{rc.courseId}</span>
                  <span className="text-sm text-gray-700">{rc.title}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {rc.reasons.map((reason, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-Course Issues */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">课程问题列表</h2>
        <div className="space-y-2">
          {audit.courseReports
            .filter((r) => r.contentIssues.length > 0 || r.knowledgeIssues.length > 0 || r.researchIssues.length > 0)
            .sort((a, b) => a.totalScore - b.totalScore)
            .map((report) => {
              const allIssues = [...report.contentIssues, ...report.knowledgeIssues, ...report.researchIssues]
              const isExpanded = expandedCourse === report.courseId
              const pct = report.totalMax > 0 ? Math.round((report.totalScore / report.totalMax) * 100) : 0
              return (
                <div key={report.courseId} className="border border-gray-200 rounded-lg bg-white">
                  <button
                    onClick={() => setExpandedCourse(isExpanded ? null : report.courseId)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{report.courseId}</span>
                      <span className="text-sm text-gray-500">{report.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${
                        pct >= 80 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {pct}
                      </span>
                      <span className="text-xs text-gray-400">问题 {allIssues.length}</span>
                      <span className="text-gray-300 text-xs">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-1.5 border-t border-gray-100 pt-2">
                      {allIssues.map((issue, i) => (
                        <div key={i} className={`text-xs px-2 py-1 rounded ${
                          issue.severity === "error" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                        }`}>
                          <span className="font-medium">[{issue.type}]</span> {issue.message}
                        </div>
                      ))}
                      <div className="flex gap-2 text-xs text-gray-400 pt-1">
                        <span>内容 {report.contentScore}/{report.contentMax}</span>
                        <span>逻辑 {report.knowledgeScore}/{report.knowledgeMax}</span>
                        <span>教学 {report.designScore}/{report.designMax}</span>
                        <span>科研 {report.researchScore}/{report.researchMax}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
        {audit.courseReports.filter((r) => r.contentIssues.length === 0 && r.knowledgeIssues.length === 0 && r.researchIssues.length === 0).length > 0 && (
          <p className="text-xs text-green-600 mt-2 text-center">
            另有 {audit.courseReports.filter((r) => r.contentIssues.length === 0 && r.knowledgeIssues.length === 0 && r.researchIssues.length === 0).length} 门课程无问题
          </p>
        )}
      </div>
    </div>
  )
}
