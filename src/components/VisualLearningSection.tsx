"use client"

import { useMemo, useState, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { VisualAsset, FlowAsset, MindMapAsset, MindMapChild, PathStep } from "@/data/courses"
import { knowledge, skills, skillToKnowledge, getKnowledgeMastery } from "@/data/knowledgeGraph"
import KnowledgeDetailDrawer from "./KnowledgeDetailDrawer"

function resolveSteps(steps: (string | PathStep)[]): { label: string; knowledgeId?: string }[] {
  return steps.map((s) => (typeof s === "string" ? { label: s } : s))
}

function FlowNodeComponent({ data }: NodeProps<Node<{ label: string; isResult: boolean; knowledgeId?: string; mastery?: "learned" | "unlearned" }>>) {
  const isResult = data.isResult
  const hasKnowledge = !!data.knowledgeId
  const isUnlearned = data.mastery === "unlearned"
  const bg = isResult ? "bg-green-50" : hasKnowledge && isUnlearned ? "bg-gray-50" : "bg-blue-50"
  const border = isResult ? "border-green-300" : hasKnowledge && isUnlearned ? "border-gray-200" : "border-blue-200"
  const text = isResult ? "text-green-700" : hasKnowledge && isUnlearned ? "text-gray-400" : "text-blue-700"
  return (
    <div className={`px-4 py-2 rounded-lg border text-sm font-medium shadow-sm ${bg} ${border} ${text} ${hasKnowledge ? "cursor-pointer" : ""}`}>
      <Handle type="target" position={Position.Top} className="!border-gray-300 !w-2 !h-2" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="!border-gray-300 !w-2 !h-2" />
    </div>
  )
}

function MindMapNodeComponent({ data }: NodeProps<Node<{ label: string; depth: number; knowledgeId?: string; mastery?: "learned" | "unlearned" }>>) {
  const colors = [
    { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
    { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
    { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
    { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  ]
  const c = colors[Math.min(data.depth, colors.length - 1)]
  const hasKnowledge = !!data.knowledgeId
  const isUnlearned = data.mastery === "unlearned"
  const bg = hasKnowledge && isUnlearned ? "bg-gray-50" : c.bg
  const border = hasKnowledge && isUnlearned ? "border-gray-200" : c.border
  const text = hasKnowledge && isUnlearned ? "text-gray-400" : c.text
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${bg} ${border} ${text} ${hasKnowledge ? "cursor-pointer" : ""}`}>
      <Handle type="target" position={Position.Left} className="!border-gray-300 !w-2 !h-2" />
      {data.label}
      <Handle type="source" position={Position.Right} className="!border-gray-300 !w-2 !h-2" />
    </div>
  )
}

function PathNodeComponent({ data }: NodeProps<Node<{ label: string; index: number; total: number; knowledgeId?: string; mastery?: "learned" | "unlearned" }>>) {
  const isEnd = data.index === data.total - 1
  const hasKnowledge = !!data.knowledgeId
  const isUnlearned = data.mastery === "unlearned"
  const bg = isEnd ? "bg-green-50" : hasKnowledge && isUnlearned ? "bg-gray-50" : "bg-blue-50"
  const border = isEnd ? "border-green-300" : hasKnowledge && isUnlearned ? "border-gray-200" : "border-blue-200"
  const text = isEnd ? "text-green-700" : hasKnowledge && isUnlearned ? "text-gray-400" : "text-blue-700"
  return (
    <div className={`px-4 py-2 rounded-lg border text-sm font-medium shadow-sm ${bg} ${border} ${text} ${hasKnowledge ? "cursor-pointer" : ""}`}>
      <Handle type="target" position={Position.Top} className="!border-gray-300 !w-2 !h-2" />
      <span className="text-[10px] text-gray-400 mr-1.5">{data.index + 1}.</span>
      {data.label}
      <Handle type="source" position={Position.Bottom} className="!border-gray-300 !w-2 !h-2" />
    </div>
  )
}

const flowNodeTypes = { flowNode: FlowNodeComponent }
const mindMapNodeTypes = { mindNode: MindMapNodeComponent }
const pathNodeTypes = { pathNode: PathNodeComponent }

interface DiagramProps {
  onNodeClick: (knowledgeId: string) => void
}

function FlowDiagram({ asset, onNodeClick, mastery }: { asset: FlowAsset; onNodeClick: (kid: string) => void; mastery: Record<string, "learned" | "unlearned"> }) {
  const { nodes, edges }: { nodes: Node[]; edges: Edge[] } = useMemo(() => {
    const n: Node[] = asset.nodes.map((node, i) => ({
      id: node.id,
      type: "flowNode",
      position: { x: 0, y: i * 80 },
      data: { label: node.label, isResult: node.isResult || false, knowledgeId: node.knowledgeId, mastery: node.knowledgeId ? (mastery[node.knowledgeId] || "unlearned") : undefined },
    }))
    const e: Edge[] = asset.edges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      style: { stroke: "#d1d5db", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#d1d5db", width: 14, height: 14 },
    }))
    return { nodes: n, edges: e }
  }, [asset, mastery])

  return (
    <div className="h-64 border border-gray-100 rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={flowNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
        className="bg-white"
        onNodeClick={(_e, node) => { const kid = (node.data as any).knowledgeId; if (kid) onNodeClick(kid) }}
      >
        <Background color="#f3f4f6" gap={20} />
      </ReactFlow>
    </div>
  )
}

function MindMapDiagram({ asset, onNodeClick, mastery }: { asset: MindMapAsset; onNodeClick: (kid: string) => void; mastery: Record<string, "learned" | "unlearned"> }) {
  const { nodes, edges }: { nodes: Node[]; edges: Edge[] } = useMemo(() => {
    const n: Node[] = []
    const e: Edge[] = []
    n.push({
      id: "root",
      type: "mindNode",
      position: { x: 0, y: 0 },
      data: { label: asset.root, depth: 0 },
    })
    asset.children.forEach((child, i) => {
      n.push({
        id: child.id || `mm-child-${i}`,
        type: "mindNode",
        position: { x: 180, y: (i - (asset.children.length - 1) / 2) * 60 },
        data: { label: child.label, depth: 1, knowledgeId: child.knowledgeId, mastery: child.knowledgeId ? (mastery[child.knowledgeId] || "unlearned") : undefined },
      })
      e.push({
        id: `root-${child.id || `mm-child-${i}`}`,
        source: "root",
        target: child.id || `mm-child-${i}`,
        style: { stroke: "#d1d5db", strokeWidth: 1 },
      })
    })
    return { nodes: n, edges: e }
  }, [asset, mastery])

  return (
    <div className="h-48 border border-gray-100 rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mindMapNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
        className="bg-white"
        onNodeClick={(_e, node) => { const kid = (node.data as any).knowledgeId; if (kid) onNodeClick(kid) }}
      >
        <Background color="#f3f4f6" gap={20} />
      </ReactFlow>
    </div>
  )
}

function KnowledgePathDiagram({ steps, onNodeClick, mastery }: { steps: { label: string; knowledgeId?: string }[]; onNodeClick: (kid: string) => void; mastery: Record<string, "learned" | "unlearned"> }) {
  const { nodes, edges }: { nodes: Node[]; edges: Edge[] } = useMemo(() => {
    const n: Node[] = steps.map((step, i) => {
      const stepData = step
      return {
        id: `step-${i}`,
        type: "pathNode",
        position: { x: 0, y: i * 70 },
        data: { label: stepData.label, index: i, total: steps.length, knowledgeId: stepData.knowledgeId, mastery: stepData.knowledgeId ? (mastery[stepData.knowledgeId] || "unlearned") : undefined },
      }
    })
    const e: Edge[] = steps.slice(0, -1).map((_, i) => ({
      id: `edge-${i}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      style: { stroke: "#d1d5db", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#d1d5db", width: 14, height: 14 },
    }))
    return { nodes: n, edges: e }
  }, [steps, mastery])

  return (
    <div className="h-64 border border-gray-100 rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={pathNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        proOptions={{ hideAttribution: true }}
        className="bg-white"
        onNodeClick={(_e, node) => { const kid = (node.data as any).knowledgeId; if (kid) onNodeClick(kid) }}
      >
        <Background color="#f3f4f6" gap={20} />
      </ReactFlow>
    </div>
  )
}

function KnowledgePosition({ knowledgeIds }: { knowledgeIds: string[] }) {
  const lines = useMemo(() => {
    const result: { label: string; type: "skill" | "knowledge" | "gap"; isCurrent: boolean }[] = []

    const allSkills = [...skills]
    const allKnowledge = knowledge.filter((k) => knowledgeIds.includes(k.id))

    const coveredSkillIds = new Set<string>()
    for (const kid of knowledgeIds) {
      for (const [sid, kwIds] of Object.entries(skillToKnowledge)) {
        if (kwIds.includes(kid)) coveredSkillIds.add(sid)
      }
    }
    const coveredSkills = allSkills.filter((s) => coveredSkillIds.has(s.id))

    const current = allKnowledge[0]

    let gapNeeded = false
    if (coveredSkills.length > 0) {
      coveredSkills.forEach((s) => result.push({ label: s.label, type: "skill", isCurrent: false }))
    }

    const added = new Set<string>()
    for (const k of allKnowledge) {
      for (const pId of k.prerequisites || []) {
        if (!knowledgeIds.includes(pId) && !added.has(pId)) {
          const pNode = knowledge.find((x) => x.id === pId)
          if (pNode) {
            if (!gapNeeded) { result.push({ label: "···", type: "gap", isCurrent: false }); gapNeeded = true }
            result.push({ label: pNode.label, type: "knowledge", isCurrent: false })
            added.add(pId)
          }
        }
      }
      result.push({ label: k.label, type: "knowledge", isCurrent: true })
    }

    return result
  }, [knowledgeIds])

  return (
    <div className="mb-3 border border-gray-100 rounded-lg bg-gray-50/50 px-4 py-3">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">本课在知识体系中的位置</p>
      <div className="flex items-center gap-1 flex-wrap">
        {lines.map((line, i) => (
          <span key={i} className="flex items-center gap-1">
            {line.type === "gap" ? (
              <span className="text-xs text-gray-300">⋯</span>
            ) : (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                line.isCurrent
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : line.type === "skill"
                    ? "bg-gray-100 text-gray-500"
                    : "bg-orange-50 text-orange-600"
              }`}>
                {line.label}
              </span>
            )}
            {i < lines.length - 1 && <span className="text-gray-300 text-xs">→</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

interface VisualLearningSectionProps {
  assets: VisualAsset[]
  completedCourses: string[]
  onNavigate: (courseId: string) => void
}

export default function VisualLearningSection({ assets, completedCourses, onNavigate }: VisualLearningSectionProps) {
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null)

  const mastery = useMemo(() => getKnowledgeMastery(completedCourses), [completedCourses])

  const handleNodeClick = useCallback((knowledgeId: string) => {
    setSelectedKnowledgeId(knowledgeId)
  }, [])

  const allKnowledgeIds = useMemo(() => {
    const ids = new Set<string>()
    for (const asset of assets) {
      if (asset.type === "flow") {
        for (const node of asset.nodes) {
          if (node.knowledgeId) ids.add(node.knowledgeId)
        }
      } else if (asset.type === "mindmap") {
        for (const child of asset.children) {
          if (child.knowledgeId) ids.add(child.knowledgeId)
        }
      } else if (asset.type === "path") {
        for (const step of asset.steps) {
          const s = typeof step === "string" ? { label: step } : step
          if (s.knowledgeId) ids.add(s.knowledgeId)
        }
      }
    }
    return [...ids]
  }, [assets])

  if (!assets || assets.length === 0) return null

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">课程图解</span>
          <span className="flex-1 border-t border-gray-100" />
        </div>

        {allKnowledgeIds.length > 0 && <KnowledgePosition knowledgeIds={allKnowledgeIds} />}

        {assets.map((asset, i) => (
          <div key={asset.title + i} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-800">{asset.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{asset.description}</p>
            </div>
            {asset.type === "flow" && <FlowDiagram asset={asset} onNodeClick={handleNodeClick} mastery={mastery} />}
            {asset.type === "mindmap" && <MindMapDiagram asset={asset} onNodeClick={handleNodeClick} mastery={mastery} />}
            {asset.type === "path" && <KnowledgePathDiagram steps={resolveSteps(asset.steps)} onNodeClick={handleNodeClick} mastery={mastery} />}
          </div>
        ))}
      </div>

      <KnowledgeDetailDrawer
        knowledgeId={selectedKnowledgeId}
        completedCourses={completedCourses}
        onClose={() => setSelectedKnowledgeId(null)}
        onNavigate={onNavigate}
      />
    </>
  )
}
