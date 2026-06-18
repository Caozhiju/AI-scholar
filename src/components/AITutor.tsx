"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// ── Theme presets ─────────────────────────────────
const THEMES = [
  { id: "blue",  name: "深邃蓝", accent: "#1f6feb", hover: "#388bfd", light: "rgba(31,111,235,0.1)",   border: "#1f6feb/30" },
  { id: "purple",name: "典雅紫", accent: "#8957e5", hover: "#a371f7", light: "rgba(137,87,229,0.1)",  border: "#8957e5/30" },
  { id: "green", name: "生机绿", accent: "#238636", hover: "#2ea043", light: "rgba(35,134,54,0.1)",   border: "#238636/30" },
  { id: "orange",name: "暖阳橙", accent: "#d29922", hover: "#e3b341", light: "rgba(210,153,34,0.1)",  border: "#d29922/30" },
  { id: "pink",  name: "樱花粉", accent: "#db61a2", hover: "#f778ba", light: "rgba(219,97,162,0.1)",  border: "#db61a2/30" },
]

const MODES = [
  { id: "tutor", label: "学习助手" },
  { id: "research", label: "科研导师" },
  { id: "writing", label: "论文写作" },
]

const MODE_QUESTIONS: Record<string, (title: string) => string[]> = {
  tutor: (t) => [`《${t}》的核心概念是什么？`,`学习《${t}》有哪些常见误区？`,`请举一个与《${t}》相关的教育应用案例。`,`《${t}》与哪些其他课程有关联？`,`《${t}》对国际中文教育研究有什么启示？`],
  research: (t) => [`围绕《${t}》可以设计哪些研究问题？`,`《${t}》中适合使用什么研究方法？`,`如何为《${t}》设计实验方案？`,`《${t}》的研究数据应该怎么收集和分析？`,`关于《${t}》有哪些高影响力的研究成果？`],
  writing: (t) => [`围绕《${t}》如何撰写一篇实证研究论文？`,`《${t}》的文献综述应该包含哪些关键内容？`,`如何用学术语言描述《${t}》的研究方法？`,`《${t}》的研究结果如何与理论对话？`,`关于《${t}》有哪些推荐的投稿期刊？`],
}

interface Message { role: "user" | "assistant"; content: string }
interface AITutorProps { courseId: string; courseTitle: string }

// ── Helpers ──────────────────────────────────────
function getTheme() {
  if (typeof window === "undefined") return THEMES[0]
  return THEMES.find(t => t.id === localStorage.getItem("ai_tutor_theme")) || THEMES[0]
}

function getHistoryIndex(): { key: string; course: string; mode: string; time: number; preview: string }[] {
  if (typeof window === "undefined") return []
  const entries: any[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (!k.startsWith("chat_")) continue
    try {
      const msgs = JSON.parse(localStorage.getItem(k) || "[]")
      if (msgs.length > 0) {
        const [,cid,mid] = k.split("_")
        entries.push({ key: k, course: cid, mode: mid, time: Date.now(), preview: msgs[0]?.content?.slice(0, 30) || "" })
      }
    } catch {}
  }
  return entries.sort((a, b) => b.time - a.time)
}

function responsiveSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: 400, h: 580 }
  const w = window.innerWidth, h = window.innerHeight
  if (w < 640) return { w: w - 16, h: h - 100 }
  if (w < 1024) return { w: 380, h: 520 }
  return { w: 400, h: 580 }
}

export default function AITutor({ courseId, courseTitle }: AITutorProps) {
  const initSize = responsiveSize()
  // ── State ─────────────────────────────────────
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState("tutor")
  const [theme, setTheme] = useState(getTheme)
  const [messages, setMessages] = useState<Message[]>(() => {
    const k = `chat_${courseId}_tutor`
    const s = typeof window !== "undefined" ? localStorage.getItem(k) : null
    return s ? JSON.parse(s) : []
  })
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [listening, setListening] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [panelW, setPanelW] = useState(initSize.w)
  const [panelH, setPanelH] = useState(initSize.h)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const modeRef = useRef(mode); modeRef.current = mode

  const scrollToBottom = useCallback(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [])
  useEffect(() => { scrollToBottom() }, [messages, streamingContent, scrollToBottom])

  // ── Responsive resize ──────────────────────────
  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 640) { setPanelW(window.innerWidth - 16); setPanelH(window.innerHeight - 100) } }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // ── Save history ──────────────────────────────
  useEffect(() => {
    const k = `chat_${courseId}_${modeRef.current}`
    localStorage.setItem(k, JSON.stringify(messages))
  }, [courseId, messages])

  // ── Switch mode ──────────────────────────────
  const switchMode = useCallback((nm: string) => {
    if (nm === mode) return
    const k = `chat_${courseId}_${nm}`
    const s = localStorage.getItem(k)
    setMessages(s ? JSON.parse(s) : [])
    setMode(nm); setStreamingContent("")
  }, [courseId, mode])

  // ── Switch course ────────────────────────────
  useEffect(() => {
    const k = `chat_${courseId}_${mode}`
    const s = localStorage.getItem(k)
    setMessages(s ? JSON.parse(s) : []); setStreamingContent("")
  }, [courseId])

  // ── Theme switch ─────────────────────────────
  const applyTheme = useCallback((t: typeof THEMES[0]) => {
    setTheme(t); setShowSettings(false)
    localStorage.setItem("ai_tutor_theme", t.id)
    document.documentElement.style.setProperty("--accent", t.accent)
    document.documentElement.style.setProperty("--accent-hover", t.hover)
  }, [])

  // ── Drag resize ──────────────────────────────
  const [resizing, setResizing] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth < 640) return
    e.preventDefault(); setResizing({ x: e.clientX, y: e.clientY, w: panelW, h: panelH })
  }, [panelW, panelH])
  useEffect(() => {
    if (!resizing) return
    const mv = (e: MouseEvent) => { setPanelW(Math.max(300, Math.min(700, resizing.w + resizing.x - e.clientX))); setPanelH(Math.max(400, Math.min(900, resizing.h + resizing.y - e.clientY))) }
    const up = () => setResizing(null)
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up)
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up) }
  }, [resizing])

  // ── Voice ────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("当前浏览器不支持语音输入"); return }
    const r = new SR(); r.lang = "zh-CN"; r.continuous = false; r.interimResults = false
    r.onresult = (e: any) => { setInput(p => p + e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false); r.onend = () => setListening(false)
    recognitionRef.current = r; r.start(); setListening(true)
  }, [])
  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setListening(false) }, [])

  // ── Copy ─────────────────────────────────────
  const copyAll = useCallback((text: string) => navigator.clipboard.writeText(text).catch(() => {}), [])

  // ── Send ─────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    const msgs: Message[] = [...messages, { role: "user", content: text.trim() }]
    setMessages(msgs); setInput(""); setLoading(true); setStreamingContent("")
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs, courseId, mode }) })
      if (!res.ok) throw new Error((await res.json()).error || "Request failed")
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response body")
      const dec = new TextDecoder(); let full = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = dec.decode(value, { stream: true }).split("\n").filter(l => l.startsWith("data: "))
        for (const l of lines) { try { const d = JSON.parse(l.slice(6)).choices?.[0]?.delta?.content; if (d) { full += d; setStreamingContent(full) } } catch {} }
      }
      setMessages(p => [...p, { role: "assistant", content: full }]); setStreamingContent("")
    } catch (err: any) { setMessages(p => [...p, { role: "assistant", content: `**错误**: ${err.message}` }]) }
    finally { setLoading(false) }
  }, [messages, courseId, mode, loading])

  const handleQuick = (q: string) => { if (!loading) sendMessage(q) }
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }

  const ac = theme.accent, ah = theme.hover
  const quickQuestions = MODE_QUESTIONS[mode]?.(courseTitle) || MODE_QUESTIONS.tutor(courseTitle)
  const displayMessages = streamingContent ? [...messages, { role: "assistant" as const, content: streamingContent }] : messages

  // ── History list ──────────────────────────────
  const historyList = showHistory ? getHistoryIndex().filter(e => e.key !== `chat_${courseId}_${mode}`) : []

  // ── Closed state ─────────────────────────────
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 sm:w-14 sm:h-14 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-xl sm:text-2xl"
        style={{ background: `linear-gradient(135deg,${ac},${ah})` }} title="AI 学习助手">
        🤖
      </button>
    )
  }

  return (
    <>
      {/* ── Panel ────────────────────────────────── */}
      <div className={`fixed z-50 flex flex-col bg-[#161b22] border border-[#30363d] shadow-2xl overflow-hidden transition-all duration-200
        ${window.innerWidth < 640 ? "bottom-0 right-0 w-screen h-[calc(100vh-60px)] rounded-none" : "bottom-4 right-4 rounded-2xl"}`}
        style={window.innerWidth >= 640 ? { width: panelW, height: panelH } : {}}>

        {/* Resize handle (desktop) */}
        <div onMouseDown={onResizeStart} className="hidden sm:block absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize z-10 hover:bg-[--accent]/20 transition-colors" />

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-[#30363d] px-3 sm:px-4 py-2 sm:py-3" style={{ backgroundColor: theme.light }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-sm sm:text-base flex-shrink-0" style={{ backgroundColor: theme.light }}>🤖</span>
              <div className="truncate">
                <span className="text-sm font-semibold text-[#e6edf3]">AI 导师</span>
                <span className="text-[10px] text-[#8b949e] ml-2 hidden sm:inline">{courseTitle.slice(0, 24)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setShowHistory(true); setShowSettings(false) }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition-colors text-xs" title="历史记录">📋</button>
              <button onClick={() => { setShowSettings(true); setShowHistory(false) }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition-colors text-xs" title="主题设置">🎨</button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition-colors text-sm">✕</button>
            </div>
          </div>
          <div className="flex gap-1">
            {MODES.map(m => (
              <button key={m.id} onClick={() => switchMode(m.id)}
                className={`flex-1 text-[11px] py-1.5 rounded-lg font-medium transition-all duration-200 ${mode === m.id ? "text-white shadow-sm" : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]"}`}
                style={mode === m.id ? { backgroundColor: ac } : {}}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4" style={{ backgroundColor: theme.light }}>💬</div>
              <p className="text-[#8b949e] text-sm mb-5">选择一个问题开始学习</p>
              <div className="w-full space-y-2 max-w-md">
                {quickQuestions.map((q, i) => (
                  <button key={i} onClick={() => handleQuick(q)}
                    className="w-full text-left text-xs text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl px-3 sm:px-4 py-2.5 transition-all duration-200 hover:border-[--accent]/30"
                    style={{ ['--accent' as any]: ac }}>
                    <span style={{ color: ac }} className="mr-2">▸</span>{q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs" style={{ backgroundColor: theme.light }}>🤖</div>}
                  <div className={`group relative max-w-[88%] sm:max-w-[82%] rounded-2xl px-3 sm:px-4 py-2 text-sm leading-relaxed select-text ${msg.role === "user" ? "text-white rounded-br-md" : "text-[#e6edf3] border border-[#30363d] rounded-bl-md bg-[#21262d]"}`}
                    style={msg.role === "user" ? { backgroundColor: ac } : {}}>
                    {msg.role === "assistant" && (
                      <button onClick={() => copyAll(msg.content)}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]"
                        title="复制全部"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                    )}
                    {msg.role === "user" ? <p className="text-sm">{msg.content}</p> : (
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

        {/* ── Input ── */}
        <div className="flex-shrink-0 border-t border-[#30363d] p-2 sm:p-3 bg-[#0d1117]">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder={loading ? "思考中..." : "输入问题..."} rows={1} disabled={loading}
                className="w-full bg-[#21262d] border border-[#30363d] rounded-xl px-3 py-2.5 pr-10 text-sm text-[#e6edf3] placeholder-[#8b949e] resize-none focus:outline-none transition-all disabled:opacity-50"
                style={{ ['--accent' as any]: ac }}
                onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px" }}
                onFocus={e => e.currentTarget.style.borderColor = ac} onBlur={e => e.currentTarget.style.borderColor = "#30363d"} />
              <button onClick={listening ? stopListening : startListening} disabled={loading}
                className={`absolute right-1.5 bottom-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${listening ? "text-white" : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d]"}`}
                style={listening ? { backgroundColor: "#da3633", boxShadow: "0 0 12px rgba(218,54,51,0.5)" } : {}}
                title={listening ? "停止录音" : "语音输入"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
            </div>
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
              className="px-3 sm:px-4 py-2.5 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
              style={{ backgroundColor: ac }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = ah}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ac}>
              {loading ? <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />思考中</span> : "发送"}
            </button>
          </div>
        </div>
      </div>

      {/* ── History drawer ───────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="flex-1 bg-black/30" onClick={() => setShowHistory(false)} />
          <div className="w-72 sm:w-80 bg-[#161b22] border-l border-[#30363d] h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e6edf3]">历史对话</h3>
              <button onClick={() => setShowHistory(false)} className="text-[#8b949e] hover:text-[#e6edf3]">✕</button>
            </div>
            {historyList.length === 0 ? (
              <p className="text-xs text-[#8b949e] text-center py-8">暂无其他对话记录</p>
            ) : (
              <div className="space-y-2">
                {historyList.map(e => (
                  <button key={e.key} onClick={() => { setShowHistory(false); const [,cid,mid] = e.key.split("_"); setMode(mid); const s = localStorage.getItem(e.key); if (s) setMessages(JSON.parse(s)) }}
                    className="w-full text-left bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl px-3 py-2.5 transition-colors">
                    <p className="text-xs text-[#e6edf3] truncate">{e.course}</p>
                    <p className="text-[10px] text-[#8b949e] mt-0.5">{MODES.find(m => m.id === e.mode)?.label || e.mode} · {e.preview}...</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Settings / Theme picker ──────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="flex-1 bg-black/30" onClick={() => setShowSettings(false)} />
          <div className="w-64 bg-[#161b22] border-l border-[#30363d] h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e6edf3]">主题配色</h3>
              <button onClick={() => setShowSettings(false)} className="text-[#8b949e] hover:text-[#e6edf3]">✕</button>
            </div>
            <div className="space-y-2">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => applyTheme(t)}
                  className={`w-full flex items-center gap-3 bg-[#21262d] hover:bg-[#30363d] border rounded-xl px-3 py-2.5 transition-colors ${theme.id === t.id ? "border-[--accent]" : "border-[#30363d]"}`}
                  style={{ ['--accent' as any]: t.accent, borderColor: theme.id === t.id ? t.accent : undefined }}>
                  <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: t.accent }} />
                  <div>
                    <p className="text-xs text-[#e6edf3]">{t.name}</p>
                    <p className="text-[10px] text-[#8b949e]">{t.accent}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
