import { buildFullReview } from "@/lib/review/data"
import PhaseReviewClient from "@/lib/review/PhaseReviewClient"

export default function Phase1Page() {
  const data = buildFullReview("python")
  if (!data) return <div className="p-10 text-sm text-gray-500">Phase 1 data not found</div>
  return <PhaseReviewClient phaseId="phase1" data={data} />
}
