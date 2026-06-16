import { stages } from "../src/data/courses"
import { knowledge, researchTasks } from "../src/data/knowledgeGraph"
import { researchProjects } from "../src/data/researchProjects"
import * as fs from "fs"
import * as path from "path"

const totalCourses = stages.reduce((sum, s) => sum + s.courses.length, 0)
const totalMinutes = stages.reduce((sum, s) =>
  sum + s.courses.reduce((cs, c) => cs + (c.estimatedMinutes || 0), 0), 0)

const registry = {
  updatedAt: new Date().toISOString(),
  courses: {
    total: totalCourses,
    byStage: stages.map(s => ({
      id: s.id,
      title: s.title,
      count: s.courses.length,
      published: s.courses.filter(c => c.status === "published").length,
      draft: s.courses.filter(c => c.status === "draft").length,
    })),
  },
  knowledge: {
    total: knowledge.length,
  },
  tasks: {
    total: researchTasks.length,
  },
  projects: {
    total: researchProjects.length,
  },
  hours: Math.round(totalMinutes / 60),
}

const outPath = path.join(__dirname, "..", "backups", "course-registry.json")
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(registry, null, 2), "utf-8")

console.log(`Course registry written to ${outPath}`)
console.log(`Courses: ${registry.courses.total}`)
console.log(`Stages: ${registry.courses.byStage.length}`)
console.log(`Knowledge: ${registry.knowledge.total}`)
console.log(`Projects: ${registry.projects.total}`)
