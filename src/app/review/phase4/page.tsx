import Link from "next/link"

export default function Phase4Placeholder() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
      <div className="text-sm font-mono text-gray-300">Phase 4</div>
      <h1 className="text-xl font-bold text-gray-500">大模型LLM</h1>
      <p className="text-sm text-gray-400 max-w-md mx-auto">
        本阶段即将开放。完成Phase 3的毕业评审后，将解锁Phase 4的课程内容和毕业评估。
      </p>
      <Link href="/review" className="inline-block text-xs text-blue-600 hover:text-blue-700 mt-4">
        ← 返回阶段概览
      </Link>
    </div>
  )
}
