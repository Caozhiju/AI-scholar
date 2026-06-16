"use client"

import { useMemo, useState, useCallback } from "react"
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

interface NetworkGraphProps {
  completedCourses: string[]
  onSelectKnowledge: (id: string) => void
}

export default function NetworkGraph({ completedCourses, onSelectKnowledge }: NetworkGraphProps) {
  const mastery = useMemo(() => getKnowledgeMastery(completedCourses), [completedCourses])

  const [nodes, edges] = useMemo(() => {
    const n: Node<GraphNodeData>[] = []
    const e: Edge[] = []
    skills.forEach((s, i) => n.push({ id: s.id, type: "custom", position: { x: 200 + i * 280, y: 30 }, data: { label: s.label, description: s.description, nodeType: "skill", typeData: s } }))
    knowledge.forEach((k, i) => n.push({ id: k.id, type: "custom", position: { x: 40 + i * 200, y: 180 }, data: { label: k.label, description: k.description, nodeType: "knowledge", typeData: k, mastery: mastery[k.id] } }))
    researchTasks.forEach((t, i) => n.push({ id: t.id, type: "custom", position: { x: 150 + i * 260, y: 340 }, data: { label: t.label, description: t.description, nodeType: "task", typeData: t } }))
    for (const [skillId, kwIds] of Object.entries(skillToKnowledge)) for (const kwId of kwIds) e.push({ id: `${skillId}-${kwId}`, source: skillId, target: kwId, style: { stroke: "#9ca3af", strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af", width: 16, height: 16 } })
    for (const [kwId, taskIds] of Object.entries(knowledgeToTask)) for (const taskId of taskIds) e.push({ id: `${kwId}-${taskId}`, source: kwId, target: taskId, style: { stroke: "#9ca3af", strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af", width: 16, height: 16 } })
    return [n, e]
  }, [mastery])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if ((node.data as GraphNodeData).nodeType === "knowledge") {
      onSelectKnowledge(node.id)
    }
  }, [onSelectKnowledge])

  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={onNodeClick} fitView fitViewOptions={{ padding: 0.3 }} proOptions={{ hideAttribution: true }} className="bg-white">
      <Background color="#e5e7eb" gap={20} />
      <Controls className="!border !border-gray-200 !rounded-lg !shadow-sm" />
    </ReactFlow>
  )
}
