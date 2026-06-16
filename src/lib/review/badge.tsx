import type { GraduationStatus, CertificateLevel } from "./types"

const statusConfig: Record<GraduationStatus, { label: string; css: string }> = {
  "not-started": { label: "未开始", css: "bg-gray-100 text-gray-500 border-gray-200" },
  "in-progress": { label: "进行中", css: "bg-blue-50 text-blue-600 border-blue-200" },
  "ready-for-review": { label: "待审核", css: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  graduated: { label: "已毕业", css: "bg-green-50 text-green-600 border-green-200" },
}

const certConfig: Record<CertificateLevel, { label: string; css: string }> = {
  excellent: { label: "优秀毕业", css: "bg-green-100 text-green-700" },
  good: { label: "良好毕业", css: "bg-blue-100 text-blue-700" },
  pass: { label: "合格毕业", css: "bg-yellow-100 text-yellow-700" },
  fail: { label: "未通过", css: "bg-red-100 text-red-700" },
}

export function StatusBadge({ status }: { status: GraduationStatus }) {
  const cfg = statusConfig[status]
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.css}`}>{cfg.label}</span>
}

export function CertBadge({ level, score }: { level: CertificateLevel; score: number }) {
  const cfg = certConfig[level]
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.css}`}>
      {cfg.label}（{score}分）
    </span>
  )
}

export function ReadinessBadge({ level, label }: { level: string; label: string }) {
  const colors: Record<string, string> = {
    ready: "bg-green-50 text-green-700 border-green-200",
    supplement: "bg-blue-50 text-blue-700 border-blue-200",
    review: "bg-yellow-50 text-yellow-700 border-yellow-200",
    relearn: "bg-red-50 text-red-700 border-red-200",
  }
  return <span className={`text-xs px-2 py-0.5 rounded border font-medium ${colors[level] || colors.relearn}`}>{label}</span>
}
