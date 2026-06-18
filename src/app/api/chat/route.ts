import { NextRequest } from "next/server"
import { stages } from "@/data/courses"

// ── Provider config ──────────────────────────────────
// DeepSeek:  model="deepseek-chat"  apiBase="https://api.deepseek.com/v1/chat/completions"
// OpenAI:   model="gpt-4o-mini"     apiBase="https://api.openai.com/v1/chat/completions"
const MODEL = process.env.LLM_MODEL || "deepseek-chat"
const API_BASE = process.env.LLM_API_BASE || "https://api.deepseek.com/v1/chat/completions"
// Priority: DEEPSEEK_API_KEY > OPENAI_API_KEY
const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || ""

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

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "LLM API key not configured - set DEEPSEEK_API_KEY or OPENAI_API_KEY" }), { status: 500 })
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

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000) // 25s timeout

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: `LLM API error: ${err}` }), { status: 502 })
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
