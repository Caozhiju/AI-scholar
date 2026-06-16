import { buildFullReview } from "@/lib/review/data"
import PhaseReviewClient from "@/lib/review/PhaseReviewClient"

export default function Phase3Page() {
  const data = buildFullReview("llm")
  if (!data) return <div className="p-10 text-sm text-gray-500">Phase 3 data not found</div>
  return <PhaseReviewClient phaseId="phase3" data={data} />
}
