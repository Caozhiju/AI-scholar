import { stages } from "../src/data/courses.ts"

const courses = ["llm-001", "llm-002", "llm-003"]

for (const courseId of courses) {
  const course = stages.flatMap(s => s.courses).find(c => c.id === courseId)
  if (!course) { console.log(`${courseId}: NOT FOUND`); continue }

  const content = course.content
  const chinese = (content.match(/[\u4e00-\u9fff]/g) || []).length
  const total = content.length

  const sections = {
    "本课导入": content.includes("本课导入"),
    "历史背景": content.includes("历史背景"),
    "核心知识": content.includes("核心知识"),
    "核心原理拆解": content.includes("核心原理拆解"),
    "与传统方法比较": content.includes("与传统方法比较"),
    "真实研究案例一": content.includes("真实研究案例一") || content.includes("案例一："),
    "真实研究案例二": content.includes("真实研究案例二") || content.includes("案例二："),
    "科研避坑提示": content.includes("科研避坑提示") || content.includes("常见误区"),
    "科研应用路径": content.includes("科研应用路径"),
    "学完本课你将能够": content.includes("学完本课你将能够"),
    "本课总结": content.includes("本课总结"),
    "思考题": content.includes("思考题"),
    "延伸阅读": content.includes("延伸阅读"),
  }

  const pitfalls = (content.match(/\*\*避坑/g) || []).length + (content.match(/\*\*误区/g) || []).length
  const thinkQs = (content.match(/Q\d/g) || []).length
  const quizzes = course.quiz?.length || 0
  const visualAssets = course.visualAssets?.length || 0
  const relatedKnowledge = course.relatedKnowledge?.length || 0

  const missingSections = Object.entries(sections).filter(([k, v]) => !v).map(([k]) => k)

  console.log(`\n${"=".repeat(48)}`)
  console.log(`  ${course.id}: ${course.title}`)
  console.log(`  Status: ${course.status}`)
  console.log(`  Estimated: ${course.estimatedMinutes} min`)
  console.log(`-`.repeat(48))
  console.log(`  Chinese chars:     ${chinese}${chinese >= 5000 ? ' ✅' : ' ❌ <5000'}${chinese >= 6000 ? ' (target 6000-9000 ✅)' : chinese >= 5000 ? ' (need 6000+)' : ''}`)
  console.log(`  Total chars:       ${total}`)
  console.log(`  Quiz questions:    ${quizzes}${quizzes >= 5 ? ' ✅' : ' ❌ <5'}`)
  console.log(`  Thinking Qs:       ${thinkQs}${thinkQs >= 3 ? ' ✅' : ' ❌ <3'}`)
  console.log(`  Pitfalls/误区:      ${pitfalls}${pitfalls >= 5 ? ' ✅' : ' ❌ <5'}`)
  console.log(`  Visual Assets:     ${visualAssets}${visualAssets >= 2 ? ' ✅' : ' ❌ <2'}`)
  console.log(`  Related Knowledge: ${relatedKnowledge}${relatedKnowledge >= 2 ? ' ✅' : ' ❌ <2'}`)
  console.log(`  Missing sections:  ${missingSections.length === 0 ? '✅ NONE' : missingSections.join(', ') + ' ❌'}`)
  console.log(``)
}
