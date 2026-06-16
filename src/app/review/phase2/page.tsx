import { buildFullReview } from "@/lib/review/data"
import PhaseReviewClient from "@/lib/review/PhaseReviewClient"

export default function Phase2Page() {
  const data = buildFullReview("cli")
  if (!data) return <div className="p-10 text-sm text-gray-500">Phase 2 data not found</div>
  return <PhaseReviewClient phaseId="phase2" data={data} />
}
