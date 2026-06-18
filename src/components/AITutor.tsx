"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const AC = "#1890FF"
const AH = "#40a9ff"

const MODES = [
  { id: "tutor", label: "学习助手" },
  { id: "research", label: "科研导师" },
  { id: "writing", label: "论文写作" },
]

const MODE_QUESTIONS: Record<string, (t: string) => string[]> = {
  tutor: (t) => [`《${t}》的核心概念是什么？`,`学习《${t}》有哪些常见误区？`,`请举一个与《${t}》相关的教育应用案例。`,`《${t}》与哪些其他课程有关联？`],
  research: (t) => [`围绕《${t}》可以设计哪些研究问题？`,`《${t}》中适合使用什么研究方法？`,`如何为《${t}》设计实验方案？`,`《${t}》的研究数据如何收集和分析？`],
  writing: (t) => [`围绕《${t}》如何撰写实证研究论文？`,`《${t}》的文献综述应包含哪些关键内容？`,`如何用学术语言描述《${t}》的研究方法？`,`关于《${t}》有哪些推荐投稿期刊？`],
}

interface Message { role: "user" | "assistant"; content: string }
interface AITutorProps { courseId: string; courseTitle: string; pinned?: boolean; onTogglePin?: () => void }

function getSaved(courseId: string, mode: string): Message[] {
  if (typeof window === "undefined") return []
  try { const s = localStorage.getItem(`chat_${courseId}_${mode}`); return s ? JSON.parse(s) : [] } catch { return [] }
}

export default function AITutor({ courseId, courseTitle, pinned, onTogglePin }: AITutorProps) {
  const [mode, setMode] = useState("tutor")
  const [messages, setMessages] = useState<Message[]>(() => getSaved(courseId, "tutor"))
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [listening, setListening] = useState(false)
  const [minimized, setMinimized] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const modeRef = useRef(mode); modeRef.current = mode

  const scrollToBottom = useCallback(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [])
  useEffect(() => { scrollToBottom() }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    const k = `chat_${courseId}_${modeRef.current}`
    localStorage.setItem(k, JSON.stringify(messages))
  }, [courseId, messages])

  const switchMode = useCallback((nm: string) => {
    if (nm === mode) return
    const s = getSaved(courseId, nm)
    setMessages(s); setMode(nm); setStreamingContent("")
  }, [courseId, mode])

  useEffect(() => {
    const s = getSaved(courseId, mode)
    setMessages(s); setStreamingContent("")
  }, [courseId])

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR(); r.lang = "zh-CN"; r.continuous = false; r.interimResults = false
    r.onresult = (e: any) => { setInput(p => p + e.results[0][0].transcript); setListening(false) }
    r.onerror = () => setListening(false); r.onend = () => setListening(false)
    recognitionRef.current = r; r.start(); setListening(true)
  }, [])
  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setListening(false) }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    const msgs: Message[] = [...messages, { role: "user", content: text.trim() }]
    setMessages(msgs); setInput(""); setLoading(true); setStreamingContent("")
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs, courseId, mode }) })
      if (!res.ok) throw new Error((await res.json()).error || "Request failed")
      const reader = res.body?.getReader(); if (!reader) throw new Error("No response body")
      const dec = new TextDecoder(); let full = ""
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        const lines = dec.decode(value, { stream: true }).split("\n").filter(l => l.startsWith("data: "))
        for (const l of lines) { try { const d = JSON.parse(l.slice(6)).choices?.[0]?.delta?.content; if (d) { full += d; setStreamingContent(full) } } catch {} }
      }
      setMessages(p => [...p, { role: "assistant", content: full }]); setStreamingContent("")
    } catch (err: any) { setMessages(p => [...p, { role: "assistant", content: `**错误**: ${err.message}` }]) }
    finally { setLoading(false) }
  }, [messages, courseId, mode, loading])

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }

  const quickQuestions = MODE_QUESTIONS[mode]?.(courseTitle) || MODE_QUESTIONS.tutor(courseTitle)
  const displayMessages = streamingContent ? [...messages, { role: "assistant" as const, content: streamingContent }] : messages

  if (minimized) {
    return (
      <button onClick={() => setMinimized(false)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg transition-all duration-300 hover:scale-110 ${pinned ? "hidden" : ""}`}
        style={{ backgroundColor: AC }}
        title="打开 AI 导师">
        <span className="relative flex h-3 w-3 absolute -top-0.5 -right-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        🤖
      </button>
    )
  }

  if (pinned) {
    return (
      <div className="flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden" style={{ minWidth: 320, maxWidth: 420 }}>
        <ChatPanel
          mode={mode} switchMode={switchMode} courseTitle={courseTitle}
          displayMessages={displayMessages} quickQuestions={quickQuestions}
          loading={loading} input={input} setInput={setInput}
          handleKey={handleKey} sendMessage={sendMessage}
          listening={listening} startListening={startListening} stopListening={stopListening}
          onMinimize={() => setMinimized(true)} onTogglePin={onTogglePin} pinned={true}
          inputRef={inputRef as any} chatEndRef={chatEndRef as any}
        />
      </div>
    )
  }

  return (
    <div id="ai-tutor-panel" className="fixed bottom-4 right-4 z-50 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
      style={{ width: 400, height: 580 }}>
      <ChatPanel
        mode={mode} switchMode={switchMode} courseTitle={courseTitle}
        displayMessages={displayMessages} quickQuestions={quickQuestions}
        loading={loading} input={input} setInput={setInput}
        handleKey={handleKey} sendMessage={sendMessage}
        listening={listening} startListening={startListening} stopListening={stopListening}
        onMinimize={() => setMinimized(true)} onTogglePin={onTogglePin} pinned={false}
        inputRef={inputRef as any} chatEndRef={chatEndRef as any}
      />
    </div>
  )
}

function ChatPanel({
  mode, switchMode, courseTitle,
  displayMessages, quickQuestions,
  loading, input, setInput, handleKey, sendMessage,
  listening, startListening, stopListening,
  onMinimize, onTogglePin, pinned, inputRef, chatEndRef,
}: {
  mode: string; switchMode: (m: string) => void; courseTitle: string
  displayMessages: Message[]; quickQuestions: string[]
  loading: boolean; input: string; setInput: (v: string) => void
  handleKey: (e: React.KeyboardEvent) => void; sendMessage: (t: string) => void
  listening: boolean; startListening: () => void; stopListening: () => void
  onMinimize: () => void; onTogglePin?: () => void; pinned: boolean
  inputRef: React.RefObject<HTMLTextAreaElement>; chatEndRef: React.RefObject<HTMLDivElement>
}) {
  const handleQuick = (q: string) => { if (!loading) sendMessage(q) }

  return (
    <>
      <div className="flex-shrink-0 border-b border-gray-100 px-4 pt-3 pb-2 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-sm">🤖</span>
            <span className="text-sm font-semibold text-gray-900">AI 导师</span>
            <span className="text-[10px] text-gray-400 hidden sm:inline">{courseTitle.slice(0, 20)}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={onTogglePin}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs"
              title={pinned ? "取消停靠" : "停靠分屏"}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {pinned
                  ? <><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></>
                  : <><path d="M12 2a3 3 0 0 0-3 3v2.5L7.5 11l-2 3h13l-2-3L15 7.5V5a3 3 0 0 0-3-3z"/><path d="M12 22v-5"/></>
                }
              </svg>
            </button>
            <button onClick={onMinimize}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs" title="最小化">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            {!pinned && (
              <button id="ai-tutor-close" onClick={() => document.getElementById("ai-tutor-panel")?.remove()}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs" title="关闭">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-1 bg-gray-50 rounded-lg p-0.5">
          {MODES.map(m => (
            <button key={m.id} onClick={() => switchMode(m.id)}
              className={`flex-1 text-[11px] py-1.5 rounded-md font-medium transition-all duration-200 ${
                mode === m.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col h-full pt-4">
            <div className="flex items-start gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed">今天我们学习《{courseTitle}》，有任何问题随时问我！</p>
              </div>
            </div>
            <div className="space-y-2.5 mt-auto">
              <p className="text-xs text-gray-400 mb-2">推荐问题</p>
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => handleQuick(q)} disabled={loading}
                  className="w-full text-left text-sm text-gray-600 bg-white hover:bg-gray-50 rounded-lg px-4 py-3 shadow-sm border border-gray-50 transition-all duration-200 hover:border-blue-100 disabled:opacity-50">
                  <span className="mr-2 font-medium" style={{ color: AC }}>▸</span>{q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {displayMessages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                }`}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none [&_pre]:bg-gray-50 [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:text-xs [&_pre]:border [&_pre]:border-gray-100 [&_code]:text-xs [&_p]:m-0 [&_p+_p]:mt-3 [&_ul]:m-0 [&_ul]:pl-4 [&_ol]:m-0 [&_ol]:pl-4 [&_li]:text-sm [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:mt-3 [&_h2]:mt-3 [&_h3]:mt-3 [&_h1]:mb-1 [&_h2]:mb-1 [&_h3]:mb-1 [&_strong]:text-gray-900 [&_a]:text-blue-600 [&_blockquote]:border-l-gray-200 [&_blockquote]:text-gray-500 [&_blockquote]:text-sm [&_hr]:border-gray-100" style={{ color: "#374151" }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef as any} />
          </>
        )}
      </div>

      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-2 pb-4">
        <p className="text-[11px] text-gray-400 mb-1.5">✨ 支持代码纠错 · 概念解析 · 方法指导</p>
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
          <textarea ref={inputRef as any} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={loading ? "思考中..." : "输入你的问题..."} rows={1} disabled={loading}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 resize-none outline-none bg-transparent disabled:opacity-50"
            onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 100) + "px" }} />
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={listening ? stopListening : startListening} disabled={loading}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm ${
                listening ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`} title="语音输入">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </button>
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-all"
              style={{ backgroundColor: loading || !input.trim() ? undefined : AC }}
              title="发送">
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
