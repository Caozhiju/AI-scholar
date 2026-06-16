"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  skills,
  knowledge,
  researchTasks,
  skillToKnowledge,
  knowledgeToTask,
  getKnowledgeCourses,
  getLearningPath,
  getKnowledgeMastery,
  type SkillNode,
  type KnowledgeNode,
  type ResearchTaskNode,
} from "@/data/knowledgeGraph"

type GraphNodeData = {
  label: string
  description: string
  nodeType: "skill" | "knowledge" | "task"
  typeData: SkillNode | KnowledgeNode | ResearchTaskNode
  mastery?: "learned" | "unlearned"
}

const nodeTypeColor = {
  skill: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", dot: "bg-blue-500" },
  knowledge: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", dot: "bg-orange-500" },
  task: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", dot: "bg-green-500" },
}

function CustomNode({ data }: NodeProps<Node<GraphNodeData>>) {
  const base = nodeTypeColor[data.nodeType]
  const isUnlearned = data.nodeType === "knowledge" && data.mastery === "unlearned"

  const bg = isUnlearned ? "bg-gray-50" : base.bg
  const border = isUnlearned ? "border-gray-200" : base.border
  const text = isUnlearned ? "text-gray-400" : base.text
  const dot = isUnlearned ? "bg-gray-300" : base.dot

  return (
    <div className={`px-4 py-3 rounded-xl border ${border} ${bg} shadow-sm min-w-[130px]`}>
      <Handle type="target" position={Position.Top} className="!border-gray-300 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
        <span className={`text-sm font-medium ${text}`}>{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-gray-300 !w-2 !h-2" />
    </div>
  )
}

const nodeTypes = { custom: CustomNode }

type DetailData = {
  id: string
  label: string
  description: string
  nodeType: string
  typeLabel: string
  connections: number
  relatedCourses?: string[]
  prerequisites?: string[]
  nextNodes?: string[]
  mastery?: "learned" | "unlearned"
}

export default function GraphPage() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([])
  const [detail, setDetail] = useState<DetailData | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lingai-completed-courses")
      if (saved) setCompletedCourses(JSON.parse(saved))
    } catch {}
  }, [])

  const mastery = useMemo(() => getKnowledgeMastery(completedCourses), [completedCourses])

  const [nodes, edges] = useMemo(() => {
    const n: Node<GraphNodeData>[] = []
    const e: Edge[] = []

    skills.forEach((s, i) => {
      n.push({
        id: s.id,
        type: "custom",
        position: { x: 200 + i * 280, y: 30 },
        data: { label: s.label, description: s.description, nodeType: "skill", typeData: s },
      })
    })

    knowledge.forEach((k, i) => {
      n.push({
        id: k.id,
        type: "custom",
        position: { x: 40 + i * 200, y: 180 },
        data: { label: k.label, description: k.description, nodeType: "knowledge", typeData: k, mastery: mastery[k.id] },
      })
    })

    researchTasks.forEach((t, i) => {
      n.push({
        id: t.id,
        type: "custom",
        position: { x: 150 + i * 260, y: 340 },
        data: { label: t.label, description: t.description, nodeType: "task", typeData: t },
      })
    })

    for (const [skillId, kwIds] of Object.entries(skillToKnowledge)) {
      for (const kwId of kwIds) {
        e.push({
          id: `${skillId}-${kwId}`,
          source: skillId,
          target: kwId,
          style: { stroke: "#9ca3af", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af", width: 16, height: 16 },
        })
      }
    }

    for (const [kwId, taskIds] of Object.entries(knowledgeToTask)) {
      for (const taskId of taskIds) {
        e.push({
          id: `${kwId}-${taskId}`,
          source: kwId,
          target: taskId,
          style: { stroke: "#9ca3af", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af", width: 16, height: 16 },
        })
      }
    }

    return [n, e]
  }, [mastery])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const d = node.data as GraphNodeData
    const typeMap: Record<string, string> = { skill: "能力", knowledge: "知识点", task: "科研任务" }

    let prereqLabels: string[] | undefined
    let nextLabels: string[] | undefined
    if (d.nodeType === "knowledge") {
      const path = getLearningPath(node.id)
      prereqLabels = path.prerequisites.map((p) => p.label)
      nextLabels = path.nextNodes.map((p) => p.label)
    }

    const relatedCourses = d.nodeType === "knowledge" ? getKnowledgeCourses(node.id) : undefined

    setDetail({
      id: node.id,
      label: d.label,
      description: d.description,
      nodeType: d.nodeType,
      typeLabel: typeMap[d.nodeType] || d.nodeType,
      connections: edges.filter((e) => e.source === node.id || e.target === node.id).length,
      relatedCourses: relatedCourses && relatedCourses.length > 0 ? relatedCourses : undefined,
      prerequisites: prereqLabels,
      nextNodes: nextLabels,
      mastery: d.nodeType === "knowledge" ? (mastery[node.id] || "unlearned") : undefined,
    })
  }, [edges, mastery])

  const onPaneClick = useCallback(() => setDetail(null), [])

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          className="bg-white"
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls className="!border !border-gray-200 !rounded-lg !shadow-sm" />
        </ReactFlow>
      </div>

      {detail && (
        <aside className="w-80 flex-shrink-0 border-l border-gray-200 bg-white p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">节点详情</h2>
            <button onClick={() => setDetail(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">名称</p>
              <p className="text-sm font-medium text-gray-800">{detail.label}</p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 mb-1">类型</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                detail.nodeType === "skill" ? "bg-blue-50 text-blue-700" :
                detail.nodeType === "knowledge" ? "bg-orange-50 text-orange-700" :
                "bg-green-50 text-green-700"
              }`}>{detail.typeLabel}</span>
              {detail.mastery && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  detail.mastery === "learned" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                }`}>{detail.mastery === "learned" ? "已学习" : "未学习"}</span>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">简介</p>
              <p className="text-sm text-gray-600 leading-relaxed">{detail.description}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">关联节点</p>
              <p className="text-sm font-medium text-gray-800">{detail.connections} 个</p>
            </div>

            {(detail.nodeType === "knowledge") && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">学习路径</p>

                {detail.prerequisites && detail.prerequisites.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">前置知识</p>
                    <div className="space-y-1">
                      {detail.prerequisites.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-l-2 border-blue-300 pl-3 py-1 my-2">
                  <p className="text-sm font-medium text-blue-700">{detail.label}</p>
                  <p className="text-xs text-blue-500">当前知识</p>
                </div>

                {detail.nextNodes && detail.nextNodes.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">后续知识</p>
                    <div className="space-y-1">
                      {detail.nextNodes.map((n, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.mastery === "unlearned" && detail.prerequisites && detail.prerequisites.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-medium text-amber-700 mb-1">学习建议</p>
                    <p className="text-xs text-amber-600 mb-1">你尚未学习：</p>
                    <ul className="text-xs text-amber-600 space-y-0.5 mb-2">
                      {detail.prerequisites.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-amber-600">建议先完成前置知识点相关课程，再学习本知识点。</p>
                  </div>
                )}
              </div>
            )}

            {detail.relatedCourses && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">关联课程</p>
                <ul className="space-y-1">
                  {detail.relatedCourses.map((title, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
