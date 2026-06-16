import { stages, courses } from "../src/data/courses"

interface ValidationIssue {
  file: string
  type: "error" | "warning"
  message: string
}

const issues: ValidationIssue[] = []

// Check stages
for (const stage of stages) {
  if (!stage.id) issues.push({ file: stage.id, type: "error", message: "Stage missing id" })
  if (!stage.title) issues.push({ file: stage.id, type: "error", message: "Stage missing title" })
  if (!stage.courses) issues.push({ file: stage.id, type: "error", message: "Stage missing courses array" })
}

// Check required fields per course
for (const course of courses) {
  if (!course.id) issues.push({ file: "unknown", type: "error", message: "Course missing id" })
  if (!course.status) issues.push({ file: course.id, type: "error", message: "Missing status" })
  // Warn about draft courses  
  if (course.status === "draft") {
    // Draft courses are OK, just not complete
  }
}

// Check for duplicate IDs
const idSet = new Set<string>()
for (const course of courses) {
  if (idSet.has(course.id)) {
    issues.push({ file: "courses", type: "error", message: `Duplicate course id: ${course.id}` })
  }
  idSet.add(course.id)
}

// Report
console.log("\n=== VALIDATION REPORT ===")
console.log(`Total stages: ${stages.length}`)
console.log(`Total courses: ${courses.length}`)
console.log(`Issues found: ${issues.length}`)

for (const issue of issues) {
  console.log(`  [${issue.type.toUpperCase()}] ${issue.file}: ${issue.message}`)
}

if (issues.filter(i => i.type === "error").length === 0) {
  console.log("\n鉁?All checks passed")
}
