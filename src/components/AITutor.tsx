"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const MODES = [
  { id: "tutor", label: "学习助手", icon: "🎓" },
  { id: "research", label: "科研导师", icon: "🔬" },
  { id: "writing", label: "论文写作", icon: "✍️" },
]

const QUICK_QUESTIONS = [
  "什么是核心概念？",
  "有哪些常见误区？",
  "请举一个教育应用案例。",
  "这个知识点与哪些课程相关？",
]

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AITutorProps {
  courseId: string
  courseTitle: string
}

export default function AITutor({ courseId, courseTitle }: AITutorProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState("tutor")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, streamingContent, scrollToBottom])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    const newMessages: Message[] = [...messages, { role: "user", content: text.trim() }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)
    setStreamingContent("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, courseId, mode }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Request failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "))
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              setStreamingContent(fullContent)
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: fullContent }])
      setStreamingContent("")
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `**错误**: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }, [messages, courseId, mode, loading])

  const handleQuickQuestion = (q: string) => {
    if (!loading) sendMessage(q)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1f6feb] text-white rounded-full shadow-lg hover:bg-[#388bfd] transition-colors flex items-center justify-center text-2xl"
        title="AI 学习助手"
      >
        🤖
      </button>
    )
  }

  const displayMessages = streamingContent
    ? [...messages, { role: "assistant" as const, content: streamingContent }]
    : messages

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden"
      style={{ width: 360, height: 540 }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-[#21262d] border-b border-[#30363d] px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-sm font-medium text-[#e6edf3]">AI 导师</span>
            <span className="text-[10px] text-[#8b949e]">{courseTitle.slice(0, 20)}</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-[#8b949e] hover:text-[#e6edf3] text-sm">✕</button>
        </div>
        {/* Mode tabs */}
        <div className="flex gap-1">
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setMessages([]); setStreamingContent("") }}
              className={`flex-1 text-[11px] py-1 rounded font-medium transition-colors ${
                mode === m.id ? "bg-[#1f6feb] text-white" : "text-[#8b949e] hover:text-[#e6edf3]"
              }`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3" style={{ scrollBehavior: "smooth" }}>
        {displayMessages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#8b949e] text-xs mb-4">选择一个问题开始学习</p>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => handleQuickQuestion(q)}
                  className="block w-full text-left text-xs text-[#e6edf3] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg px-3 py-2 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {displayMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-[#1f6feb] text-white"
                : "bg-[#21262d] text-[#e6edf3] border border-[#30363d]"
            }`}>
              {msg.role === "user" ? (
                msg.content
              ) : (
                <div className="prose prose-invert prose-xs max-w-none [&_pre]:bg-[#0d1117] [&_pre]:rounded [&_pre]:p-2 [&_pre]:text-[11px] [&_code]:text-[11px] [&_p]:m-0 [&_p+_p]:mt-2 [&_ul]:m-0 [&_ul]:pl-4 [&_ol]:m-0 [&_ol]:pl-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-[#30363d] p-2 bg-[#0d1117]">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "思考中..." : "输入问题，Enter 发送..."}
            rows={1}
            disabled={loading}
            className="flex-1 bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] placeholder-[#8b949e] resize-none focus:outline-none focus:border-[#1f6feb] disabled:opacity-50"
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="px-3 py-2 bg-[#1f6feb] text-white rounded-lg text-xs font-medium hover:bg-[#388bfd] disabled:opacity-50 transition-colors">
            {loading ? "..." : "发送"}
          </button>
        </div>
      </div>
    </div>
  )
}
