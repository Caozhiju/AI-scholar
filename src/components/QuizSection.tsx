"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { QuizQuestion } from "@/data/courses"

interface QuizSectionProps {
  quiz: QuizQuestion[]
  courseId: string
  onComplete: (courseId: string) => void
}

type AnswerState = Record<string, number | null>
type ResultState = Record<string, "correct" | "wrong" | null>

export default function QuizSection({ quiz, courseId, onComplete }: QuizSectionProps) {
  const [answers, setAnswers] = useState<AnswerState>({})
  const [results, setResults] = useState<ResultState>({})
  const completedRef = useRef(false)

  const allConfirmed = quiz.every((q) => results[q.id] != null)

  useEffect(() => {
    if (allConfirmed && !completedRef.current) {
      completedRef.current = true
      onComplete(courseId)
    }
  }, [allConfirmed, courseId, onComplete])

  const handleSelect = useCallback((qId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }))
  }, [])

  const handleConfirm = useCallback(
    (qId: string) => {
      const selected = answers[qId]
      if (selected === undefined || selected === null) return
      const question = quiz.find((q) => q.id === qId)
      if (!question) return
      setResults((prev) => ({
        ...prev,
        [qId]: selected === question.answer ? "correct" : "wrong",
      }))
    },
    [quiz, answers]
  )

  const confirmedCount = quiz.reduce(
    (count, q) => count + (results[q.id] === "correct" ? 1 : 0),
    0
  )

  const getFeedback = () => {
    if (confirmedCount === quiz.length) return { label: "优秀", desc: "你对本课内容掌握得非常好！", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
    if (confirmedCount >= 2) return { label: "良好", desc: "建议复习「Python与人工分析的区别」章节。", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" }
    return { label: "建议重读", desc: "建议重新阅读本课，重点关注核心知识和案例部分。", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
  }

  const feedback = getFeedback()

  return (
    <section className="mt-10 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">课后测验</h2>

      <div className="space-y-6">
        {quiz.map((q, qi) => {
          const selected = answers[q.id]
          const result = results[q.id]
          const isConfirmed = result != null

          return (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-800 mb-3">
                <span className="text-blue-500 mr-2">{qi + 1}.</span>
                {q.question}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  let optStyle =
                    "border-gray-200 hover:border-gray-300 hover:bg-gray-50"

                  if (isConfirmed) {
                    if (oi === q.answer) {
                      optStyle = "border-green-300 bg-green-50"
                    } else if (oi === selected && oi !== q.answer) {
                      optStyle = "border-red-300 bg-red-50"
                    } else {
                      optStyle = "border-gray-100 text-gray-400"
                    }
                  } else if (oi === selected) {
                    optStyle = "border-blue-300 bg-blue-50"
                  }

                  return (
                    <button
                      key={oi}
                      disabled={isConfirmed}
                      onClick={() => handleSelect(q.id, oi)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors flex items-center gap-3 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 flex items-center gap-3">
                {!isConfirmed ? (
                  <button
                    onClick={() => handleConfirm(q.id)}
                    disabled={selected === undefined || selected === null}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    确认
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {result === "correct" ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                        <span>✓</span> 回答正确
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-red-500">
                          <span>✗</span> 回答错误
                        </span>
                        <p className="text-xs text-gray-500 ml-5">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {allConfirmed && (
        <div className={`mt-6 rounded-xl border p-5 ${feedback.bg} ${feedback.border}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-900">本课测验完成</h3>
            <span className={`text-sm font-bold ${feedback.color}`}>{feedback.label}</span>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold text-gray-800">{confirmedCount}</span>
            <span className="text-sm text-gray-400">/ {quiz.length}</span>
          </div>
          <p className="text-sm text-gray-600">{feedback.desc}</p>
        </div>
      )}
    </section>
  )
}
