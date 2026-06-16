/**
 * Phase 3 finalization: inject researchTasks + publish all llm courses
 * Run: node scripts/p3-finalize.mjs
 */
import { readFileSync, writeFileSync } from "fs"

const researchTaskMap = {
  "llm-001": [], "llm-002": [], "llm-003": [],
  "llm-004": [], "llm-005": [], "llm-006": [],
  "llm-007": ["task-llm-prompt-optimize"],
  "llm-008": ["task-llm-prompt-optimize"],
  "llm-009": ["task-llm-prompt-optimize"],
  "llm-010": ["task-llm-prompt-optimize", "task-llm-qa-system"],
  "llm-011": ["task-llm-hsk-gen", "task-llm-reading-gen"],
  "llm-012": ["task-llm-hsk-gen", "task-llm-reading-gen"],
  "llm-013": ["task-llm-essay-feedback", "task-llm-error-detection"],
  "llm-014": ["task-llm-question-gen"],
  "llm-015": ["task-llm-reading-gen", "task-llm-hsk-gen"],
  "llm-016": ["task-llm-knowledge-base"],
  "llm-017": ["task-llm-knowledge-base", "task-llm-qa-system"],
  "llm-018": ["task-llm-classroom-assistant"],
  "llm-019": ["task-llm-agent-design", "task-llm-classroom-assistant", "task-llm-path-recommend"],
  "llm-020": ["task-llm-assessment", "task-llm-error-detection"],
  "llm-021": ["task-llm-assessment"],
  "llm-022": ["task-llm-assessment", "task-llm-prompt-optimize"],
  "llm-023": ["task-llm-hsk-gen", "task-llm-essay-feedback", "task-llm-question-gen", "task-llm-reading-gen", "task-llm-agent-design", "task-llm-knowledge-base"],
}

const srcPath = "src/data/courses.ts"
let src = readFileSync(srcPath, "utf8")

// Step 1: Add researchTasks to Course interface
const interfaceMarker = "  visualAssets?: VisualAsset[]"
if (!src.includes("researchTasks?: string[]")) {
  src = src.replace(interfaceMarker, "  researchTasks?: string[]\n  " + interfaceMarker)
  console.log("Step 1: Added researchTasks to Course interface")
}

// Step 2: Inject researchTasks into each llm course
// Process courses in reverse order to maintain line numbers
const llmIds = Object.keys(researchTaskMap).reverse()

for (const id of llmIds) {
  const tasks = researchTaskMap[id]
  const taskStr = `researchTasks: [${tasks.map(t => `"${t}"`).join(", ")}],`
  
  // Find the "visualAssets:" line for this course and insert researchTasks before it
  // Look for a pattern that uniquely identifies this course's visualAssets
  const lines = src.split("\n")
  let courseStart = -1
  let visualAssetsLine = -1
  let hasTasksAlready = false
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`id: "${id}"`)) {
      courseStart = i
    }
    if (courseStart >= 0 && lines[i].trim().startsWith("visualAssets:")) {
      visualAssetsLine = i
      // Check if researchTasks already exists between courseStart and visualAssetsLine
      for (let j = courseStart; j < visualAssetsLine; j++) {
        if (lines[j].includes("researchTasks:")) {
          hasTasksAlready = true
          break
        }
      }
      break
    }
  }
  
  if (visualAssetsLine >= 0 && !hasTasksAlready) {
    const indent = lines[visualAssetsLine].match(/^\s*/)[0]
    lines.splice(visualAssetsLine, 0, indent + taskStr)
    src = lines.join("\n")
    console.log(`  ${id}: injected ${tasks.length} researchTasks`)
  } else if (hasTasksAlready) {
    console.log(`  ${id}: already has researchTasks, updating...`)
    // Update existing
    const taskRegex = new RegExp(`(id: "${id}"[\\s\\S]*?)researchTasks: \\[[^\\]]*\\]`)
    src = src.replace(taskRegex, `$1${taskStr}`)
    console.log(`  ${id}: updated researchTasks`)
  } else {
    console.log(`  ${id}: visualAssets not found!`)
  }
}

// Step 3: Set all llm courses to published
for (const id of Object.keys(researchTaskMap)) {
  // Find status: "draft" specifically after this course's id
  const regex = new RegExp(`(id: "${id}"[\\s\\S]*?status: )"draft"`)
  if (regex.test(src)) {
    src = src.replace(regex, `$1"published"`)
    console.log(`  ${id}: set to published`)
  }
}

writeFileSync(srcPath, src, "utf8")
console.log("\nAll changes written!")

// Step 4: Verify the Course interface
if (src.includes("researchTasks?: string[]")) {
  console.log("✓ Course interface has researchTasks")
} else {
  console.log("✗ Course interface MISSING researchTasks!")
}
