"use client"

import { versionInfo, systemModules } from "@/data/version"
import { stages } from "@/data/courses"

export default function AboutPage() {
  const totalCourses = versionInfo.courseCount
  const phaseData = stages.map(s => ({
    id: s.id,
    title: s.title,
    count: s.courses.length,
    hours: Math.round(s.courses.reduce((sum, c) => sum + (c.estimatedMinutes || 0), 0) / 60),
  }))

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">关于 LingAI Scholar</h1>
        <p className="text-sm text-gray-500 mt-1">Version {versionInfo.version} &mdash; {versionInfo.releaseDate}</p>
      </div>

      {/* System Overview */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">系统简介</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          LingAI Scholar 是一个面向语言学（国际中文教育）研究生的 AI 与计算语言学自学平台。
          平台围绕四个阶段系统性地培养语言学研究生将 AI 技术应用于科研实践的能力，
          从 Python 编程基础到大模型 LLM 应用，涵盖 NLP、教育 NLP、和大模型核心知识体系。
        </p>
      </section>

      {/* Training Objectives */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">培养目标</h2>
        <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
          <li>掌握 Python 编程与文本数据处理的核心技能</li>
          <li>理解 NLP 基础技术并能应用于语言学研究</li>
          <li>熟悉教育 NLP 核心方法与研究范式</li>
          <li>掌握大模型 LLM 原理、Prompt 工程与 RAG 应用</li>
          <li>具备设计和开展计算语言学科研课题的独立能力</li>
        </ul>
      </section>

      {/* Audience */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">适用人群</h2>
        <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
          <li>语言学（国际中文教育）方向研究生</li>
          <li>希望将 AI / NLP 技术引入语言教学研究的教师与科研人员</li>
          <li>对计算语言学感兴趣、具备基础编程能力的自学者</li>
        </ul>
      </section>

      {/* Course Statistics */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">课程统计</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {phaseData.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-500 truncate">{p.title.replace(/第.阶段：/, "")}</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{p.count}</div>
              <div className="text-xs text-gray-400">{p.hours} 小时</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 pt-1">
          <span>总课程：<strong>{totalCourses}</strong></span>
          <span>总时长：<strong>{versionInfo.totalLearningHours} 小时</strong></span>
          <span>平均课时：<strong>{versionInfo.avgCourseMinutes} 分钟</strong></span>
        </div>
      </section>

      {/* Knowledge Graph & Research Tasks */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">知识图谱 & 科研任务</h2>
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <span>知识点：<strong>{versionInfo.knowledgeCount}</strong></span>
          <span>科研任务：<strong>{versionInfo.researchTaskCount}</strong></span>
          <span>技能类别：<strong>6</strong></span>
        </div>
      </section>

      {/* System Modules */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">系统模块</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {systemModules.map(m => (
            <div key={m.id} className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-800">{m.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Version Info */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">版本信息</h2>
        <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">版本号</span><span className="text-gray-800 font-medium">{versionInfo.version}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">发布日期</span><span className="text-gray-800">{versionInfo.releaseDate}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">阶段数</span><span className="text-gray-800">{versionInfo.stageCount}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">系统模块</span><span className="text-gray-800">{systemModules.length} 个</span></div>
        </div>
      </section>

      {/* Changelog */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">更新日志</h2>
        <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-blue-600 font-medium">Phase 1</span>
            <span className="text-gray-500">Python 科研基础 — 10 课程</span>
            <span className="text-xs text-green-600 ml-auto">完成</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-blue-600 font-medium">Phase 2</span>
            <span className="text-gray-500">计算语言学 AI — 15 课程</span>
            <span className="text-xs text-green-600 ml-auto">完成</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-blue-600 font-medium">Phase 3</span>
            <span className="text-gray-500">教育 NLP — 15 课程</span>
            <span className="text-xs text-green-600 ml-auto">完成</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-blue-600 font-medium">Phase 4</span>
            <span className="text-gray-500">大模型 LLM — 23 课程</span>
            <span className="text-xs text-green-600 ml-auto">完成</span>
          </div>
          <div className="border-t border-gray-50 pt-2 flex items-baseline gap-2">
            <span className="text-gray-600 font-medium">系统功能</span>
            <span className="text-gray-500">审计 / 知识图谱 / 毕业评估 / 修复管理</span>
            <span className="text-xs text-green-600 ml-auto">完成</span>
          </div>
        </div>
      </section>
    </div>
  )
}
