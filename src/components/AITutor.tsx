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
  const [listening, setListening] = useState(false)
  const [panelWidth, setPanelWidth] = useState(400)
  const [panelHeight, setPanelHeight] = useState(580)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, streamingContent, scrollToBottom])

  // ── Drag resize ──────────────────────────────────
  const [resizing, setResizing] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setResizing({ x: e.clientX, y: e.clientY, w: panelWidth, h: panelHeight })
  }, [panelWidth, panelHeight])

  useEffect(() => {
    if (!resizing) return
    const onMove = (e: MouseEvent) => {
      const dw = resizing.x - e.clientX
      const dh = resizing.y - e.clientY
      setPanelWidth(Math.max(300, Math.min(700, resizing.w + dw)))
      setPanelHeight(Math.max(400, Math.min(900, resizing.h + dh)))
    }
    const onUp = () => setResizing(null)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [resizing])

  // ── Voice input ──────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert("当前浏览器不支持语音输入"); return }

    const recognition = new SpeechRecognition()
    recognition.lang = "zh-CN"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(prev => prev + transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  // ── Send message ─────────────────────────────────
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
            if (delta) { fullContent += delta; setStreamingContent(fullContent) }
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

  const handleQuickQuestion = (q: string) => { if (!loading) sendMessage(q) }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  // ── Closed state ─────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#1f6feb] to-[#58a6ff] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl"
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
    <div
      ref={panelRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden select-none"
      style={{ width: panelWidth, height: panelHeight }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize z-10 hover:bg-[#1f6feb]/20 transition-colors"
      />

      {/* Header */}
      <div className="flex-shrink-0 bg-[#21262d] border-b border-[#30363d] px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1f6feb]/10 text-base">🤖</span>
            <div>
              <span className="text-sm font-semibold text-[#e6edf3]">AI 导师</span>
              <span className="text-[10px] text-[#8b949e] ml-2">{courseTitle.slice(0, 24)}</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition-colors text-sm">✕</button>
        </div>
        <div className="flex gap-1.5">
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setMessages([]); setStreamingContent("") }}
              className={`flex-1 text-[11px] py-1.5 rounded-lg font-medium transition-all duration-200 ${
                mode === m.id
                  ? "bg-[#1f6feb] text-white shadow-sm"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent"
        style={{ scrollBehavior: "smooth" }}>
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1f6feb]/10 flex items-center justify-center text-2xl mb-4">💬</div>
            <p className="text-[#8b949e] text-sm mb-5">选择一个问题开始学习</p>
            <div className="w-full space-y-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => handleQuickQuestion(q)}
                  className="w-full text-left text-xs text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl px-4 py-2.5 transition-all duration-200 hover:border-[#1f6feb]/30">
                  <span className="text-[#58a6ff] mr-2">▸</span>{q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {displayMessages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#1f6feb]/10 flex items-center justify-center flex-shrink-0 text-xs">🤖</div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all ${
                  msg.role === "user"
                    ? "bg-[#1f6feb] text-white rounded-br-md"
                    : "bg-[#21262d] text-[#e6edf3] border border-[#30363d] rounded-bl-md"
                }`}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-[#0d1117] [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:text-xs [&_pre]:border [&_pre]:border-[#30363d] [&_code]:text-xs [&_p]:m-0 [&_p+_p]:mt-3 [&_ul]:m-0 [&_ul]:pl-4 [&_ol]:m-0 [&_ol]:pl-4 [&_li]:text-sm [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:mt-3 [&_h2]:mt-3 [&_h3]:mt-3 [&_h1]:mb-1 [&_h2]:mb-1 [&_h3]:mb-1 [&_strong]:text-[#f0883e] [&_a]:text-[#58a6ff] [&_blockquote]:border-l-[#30363d] [&_blockquote]:text-[#8b949e] [&_blockquote]:text-sm [&_hr]:border-[#30363d]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-[#30363d] p-3 bg-[#0d1117]">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? "思考中..." : "输入问题..."}
              rows={1}
              disabled={loading}
              className="w-full bg-[#21262d] border border-[#30363d] rounded-xl px-3 py-2.5 pr-10 text-sm text-[#e6edf3] placeholder-[#8b949e] resize-none focus:outline-none focus:border-[#1f6feb] focus:ring-1 focus:ring-[#1f6feb]/30 transition-all disabled:opacity-50"
              onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px" }}
            />
            <button
              onClick={listening ? stopListening : startListening}
              disabled={loading}
              className={`absolute right-1.5 bottom-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                listening
                  ? "bg-[#da3633] text-white shadow-[0_0_12px_rgba(218,54,51,0.5)]"
                  : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]"
              }`}
              title={listening ? "停止录音" : "语音输入"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-[#1f6feb] text-white rounded-xl text-sm font-medium hover:bg-[#388bfd] disabled:opacity-40 disabled:hover:bg-[#1f6feb] transition-all duration-200 active:scale-95 flex items-center gap-1.5">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                思考中
              </span>
            ) : "发送"}
          </button>
        </div>
      </div>
    </div>
  )
}
