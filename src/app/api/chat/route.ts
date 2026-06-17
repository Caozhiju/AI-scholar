import { NextRequest } from "next/server"
import { stages } from "@/data/courses"

const MODEL = "gpt-4o-mini"

const MODE_PROMPTS: Record<string, string> = {
  tutor: `你是一位专注于国际中文教育（TCSL）领域的AI导师。
请以学术性、清晰易懂的语言回答研究生的问题。
优先依据下方课程内容回答；若课程内容中不包含相关信息，可补充必要的背景知识。
回答应面向国际中文教育研究生，使用中文。`,

  research: `你是一位专注于国际中文教育（TCSL）领域的科研导师。
请帮助研究生拓展研究思路、设计实验方案、分析研究方法。
结合课程内容提供科研方法论指导。
回答应专业、严谨，使用中文。`,

  writing: `你是一位专注于国际中文教育（TCSL）领域的学术写作导师。
请帮助研究生优化论文结构、完善学术表达、规范引用格式。
可针对课程内容相关的写作问题提供具体建议。
回答应专业、规范，使用中文。`,
}

export async function POST(req: NextRequest) {
  try {
    const { messages, courseId, mode = "tutor" } = await req.json()

    const course = stages.flatMap(s => s.courses).find(c => c.id === courseId)
    if (!course) {
      return new Response(JSON.stringify({ error: "Course not found" }), { status: 404 })
    }

    const systemPrompt = [
      `你是 LingAI Scholar 的 AI 导师。`,
      ``,
      `当前课程：${course.title}`,
      `课程描述：${course.description}`,
      ``,
      `课程内容：`,
      course.content.slice(0, 12000), // trim to fit context
      ``,
      course.relatedKnowledge?.length ? `关联知识点：${course.relatedKnowledge.join("、")}` : "",
      course.researchTasks?.length ? `关联科研任务：${course.researchTasks.join("、")}` : "",
      ``,
      MODE_PROMPTS[mode] || MODE_PROMPTS.tutor,
    ].filter(Boolean).join("\n")

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), { status: 500 })
    }

    const body = JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-20), // keep last 20 for context window
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
    })

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body,
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: `OpenAI API error: ${err}` }), { status: 502 })
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
