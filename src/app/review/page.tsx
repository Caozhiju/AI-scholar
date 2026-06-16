import Link from "next/link"
import { buildPhaseReview } from "@/lib/review/data"
import { StatusBadge } from "@/lib/review/badge"

const phases = ["python", "cli", "llm", "edunlp"]

const phaseIcons: Record<string, string> = {
  python: "P1",
  cli: "P2",
  llm: "P3",
  edunlp: "P4",
}

export default function ReviewPage() {
  const reviews = phases.map((id) => ({ id, data: buildPhaseReview(id) })).filter((r) => r.data)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Review &amp; Graduation System
          <span className="text-sm font-normal text-gray-400 ml-3">阶段毕业评估体系</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">LingAI Scholar 统一阶段毕业评审系统</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reviews.map(({ id, data }) => {
          if (!data) return null
          return (
            <Link key={id} href={`/review/${id}`} className="block border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-gray-400">{phaseIcons[id]}</span>
                    <h2 className="text-base font-bold text-gray-800 mt-0.5">{data.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{data.subtitle}</p>
                  </div>
                  <StatusBadge status={data.graduationStatus} />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="text-lg font-bold text-gray-700">{data.courseCount}</div>
                    <div className="text-gray-400">课程</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-700">{data.knowledgeCount}</div>
                    <div className="text-gray-400">知识点</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-700">{data.taskCount}</div>
                    <div className="text-gray-400">科研任务</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-700">{data.completionRate}%</div>
                    <div className="text-gray-400">完成率</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      data.completionRate >= 90 ? "bg-green-500" : data.completionRate >= 70 ? "bg-blue-500" : data.completionRate >= 40 ? "bg-yellow-500" : "bg-gray-300"
                    }`}
                    style={{ width: `${data.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-2.5 text-xs text-gray-500 flex items-center justify-between">
                <span>毕业能力：{data.graduationAbility}</span>
                <span className="text-gray-300">→</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="border border-gray-200 rounded-xl bg-white p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">总体进度</h2>
        {(() => {
          const totalCourses = reviews.reduce((s, r) => s + (r.data?.courseCount ?? 0), 0)
          const totalPublished = reviews.reduce((s, r) => s + Math.round((r.data?.courseCount ?? 0) * (r.data?.completionRate ?? 0) / 100), 0)
          const totalKnowledge = reviews.reduce((s, r) => s + (r.data?.knowledgeCount ?? 0), 0)
          const graduated = reviews.filter((r) => r.data?.graduationStatus === "graduated").length
          return (
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalCourses}</div>
                <div className="text-xs text-gray-400">总课程数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{Math.round(totalPublished / totalCourses * 100)}%</div>
                <div className="text-xs text-gray-400">课程完成率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalKnowledge}</div>
                <div className="text-xs text-gray-400">知识点数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{graduated}/4</div>
                <div className="text-xs text-gray-400">已毕业阶段</div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Quick Links */}
      <div className="flex gap-3 text-sm">
        <Link href="/graduate" className="text-blue-600 hover:text-blue-700 font-medium">
          查看毕业总览 →
        </Link>
        <Link href="/audit" className="text-gray-500 hover:text-gray-600">
          课程审计中心 →
        </Link>
      </div>
    </div>
  )
}
