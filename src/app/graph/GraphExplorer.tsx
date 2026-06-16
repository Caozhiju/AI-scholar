"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  skills, knowledge, researchTasks,
  skillToKnowledge, knowledgeToTask,
  getLearningPath, getKnowledgeCourses,
  getKnowledgeMastery,
} from "@/data/knowledgeGraph"
import { stages } from "@/data/courses"

// ── Node Colors ──
const COLORS = {
  skill: { bg: "#F3E8FF", border: "#C084FC", text: "#6B21A8", dot: "#8B5CF6" },
  knowledge: { bg: "#F1F5F9", border: "#94A3B8", text: "#475569", dot: "#64748B" },
  task: { bg: "#DCFCE7", border: "#86EFAC", text: "#166534", dot: "#22C55E" },
  course: { bg: "#DBEAFE", border: "#93C5FD", text: "#1E40AF", dot: "#3B82F6" },
  focus: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E", dot: "#F59E0B" },
}

type GraphNodeData = {
  label: string
  description: string
  nodeType: "skill" | "knowledge" | "task" | "course"
  phase: number
  focusDistance: number // 0 = self, 1 = direct, 2 = indirect, -1 = hidden
}

// ── Phase mapping ──
const skillToPhase: Record<string, number> = {
  "skill-python": 1, "skill-text": 1, "skill-data": 1,
  "skill-nlp": 2, "skill-edunlp": 2,
  "skill-llm": 3,
  "skill-research": 4,
}

function getPhaseFromSkill(skillId: string): number {
  return skillToPhase[skillId] || 0
}

function getNodePhase(nodeId: string, nodeType: string): number {
  if (nodeType === "skill") return getPhaseFromSkill(nodeId)
  if (nodeType === "knowledge") {
    for (const [sid, kids] of Object.entries(skillToKnowledge)) {
      if (kids.includes(nodeId)) return getPhaseFromSkill(sid)
    }
  }
  if (nodeType === "task") {
    for (const [kid, tids] of Object.entries(knowledgeToTask)) {
      if (tids.includes(nodeId)) {
        for (const [sid, kids] of Object.entries(skillToKnowledge)) {
          if (kids.includes(kid)) return getPhaseFromSkill(sid)
        }
      }
    }
  }
  return 0
}

// ── Force layout simulation ──
function forceLayout(nodes: { id: string }[], edges: { source: string; target: string }[], width: number, height: number) {
  const positions: Record<string, { x: number; y: number }> = {}
  const center = { x: width / 2, y: height / 2 }
  const radius = Math.min(width, height) * 0.35

  // Initialize in a circle
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length
    positions[n.id] = { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) }
  })

  // Build adjacency for edge attraction
  const adj = new Map<string, Set<string>>()
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, new Set())
    if (!adj.has(e.target)) adj.set(e.target, new Set())
    adj.get(e.source)!.add(e.target)
    adj.get(e.target)!.add(e.source)
  }

  // Force simulation iterations
  const repulsion = 8000
  const attraction = 0.005
  const damping = 0.85

  for (let iter = 0; iter < 100; iter++) {
    const forces: Record<string, { fx: number; fy: number }> = {}
    for (const n of nodes) {
      forces[n.id] = { fx: 0, fy: 0 }

      // Repulsion from all other nodes
      for (const other of nodes) {
        if (other.id === n.id) continue
        const dx = positions[n.id].x - positions[other.id].x
        const dy = positions[n.id].y - positions[other.id].y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        forces[n.id].fx += (dx / dist) * repulsion / (dist * dist)
        forces[n.id].fy += (dy / dist) * repulsion / (dist * dist)
      }

      // Attraction along edges
      const neighbors = adj.get(n.id)
      if (neighbors) {
        for (const nb of neighbors) {
          const dx = positions[nb].x - positions[n.id].x
          const dy = positions[nb].y - positions[n.id].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          forces[n.id].fx += dx * attraction * dist
          forces[n.id].fy += dy * attraction * dist
        }
      }

      // Center gravity
      forces[n.id].fx += (center.x - positions[n.id].x) * 0.001
      forces[n.id].fy += (center.y - positions[n.id].y) * 0.001
    }

    // Apply forces
    for (const n of nodes) {
      positions[n.id].x += forces[n.id].fx * damping
      positions[n.id].y += forces[n.id].fy * damping
      // Clamp to bounds
      positions[n.id].x = Math.max(30, Math.min(width - 30, positions[n.id].x))
      positions[n.id].y = Math.max(30, Math.min(height - 30, positions[n.id].y))
    }
  }

  return positions
}

// ── Custom Node ──
function GraphNode({ data, selected }: NodeProps<Node<GraphNodeData>>) {
  const c = data.focusDistance === 0 ? COLORS.focus : COLORS[data.nodeType]
  const opacity = data.focusDistance === -1 ? 0.1 : data.focusDistance <= 1 ? 1 : 0.4
  const isCompleted = false // Could track from props

  return (
    <div
      className={`px-3 py-2 rounded-xl border shadow-sm transition-opacity duration-300 cursor-pointer min-w-[100px]`}
      style={{
        backgroundColor: c.bg,
        borderColor: selected ? COLORS.focus.border : c.border,
        borderWidth: selected ? 2 : 1,
        opacity,
      }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
        <span className="text-xs font-medium" style={{ color: c.text }}>{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  )
}

const nodeTypes = { graphNode: GraphNode }

interface GraphExplorerProps {
  completedCourses: string[]
  onSelectKnowledge: (id: string) => void
  phaseFilter: number // 0 = all, 1-4 = specific
}

export default function GraphExplorer({ completedCourses, onSelectKnowledge, phaseFilter }: GraphExplorerProps) {
  const [focusNode, setFocusNode] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build graph data
  const { allNodes, allEdges } = useMemo(() => {
    const nodeSet = new Map<string, { id: string; label: string; description: string; nodeType: "skill" | "knowledge" | "task" | "course"; phase: number }>()
    const edgeSet: { source: string; target: string }[] = []

    // Add skills
    for (const s of skills) {
      nodeSet.set(s.id, { id: s.id, label: s.label, description: s.description, nodeType: "skill", phase: skillToPhase[s.id] || 0 })
    }

    // Add knowledge
    for (const k of knowledge) {
      nodeSet.set(k.id, { id: k.id, label: k.label, description: k.description, nodeType: "knowledge", phase: getNodePhase(k.id, "knowledge") })
    }

    // Add tasks
    for (const t of researchTasks) {
      nodeSet.set(t.id, { id: t.id, label: t.label, description: t.description, nodeType: "task", phase: getNodePhase(t.id, "task") })
    }

    // Add edges: skill→knowledge
    for (const [sid, kids] of Object.entries(skillToKnowledge)) {
      for (const kid of kids) {
        if (nodeSet.has(sid) && nodeSet.has(kid)) edgeSet.push({ source: sid, target: kid })
      }
    }

    // Add edges: knowledge→task
    for (const [kid, tids] of Object.entries(knowledgeToTask)) {
      for (const tid of tids) {
        if (nodeSet.has(kid) && nodeSet.has(tid)) edgeSet.push({ source: kid, target: tid })
      }
    }

    return { allNodes: [...nodeSet.values()], allEdges: edgeSet }
  }, [])

  // Filter by phase
  const visibleNodes = useMemo(() => {
    if (phaseFilter === 0) return allNodes
    // Show selected phase + adjacent phases
    const phases = [phaseFilter]
    if (phaseFilter > 1) phases.push(phaseFilter - 1)
    if (phaseFilter < 4) phases.push(phaseFilter + 1)
    return allNodes.filter(n => phases.includes(n.phase))
  }, [allNodes, phaseFilter])

  const visibleIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes])

  const visibleEdges = useMemo(() =>
    allEdges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [allEdges, visibleIds]
  )

  // Compute layout
  const positions = useMemo(() => {
    const container = containerRef.current
    const w = container?.clientWidth || 900
    const h = container?.clientHeight || 600
    return forceLayout(visibleNodes, visibleEdges, w, h)
  }, [visibleNodes, visibleEdges])

  // Build React Flow nodes/edges
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node<GraphNodeData>>([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    const focusDistances = new Map<string, number>()
    if (focusNode) {
      // Compute BFS distances from focus node
      const adj = new Map<string, string[]>()
      for (const e of visibleEdges) {
        if (!adj.has(e.source)) adj.set(e.source, [])
        if (!adj.has(e.target)) adj.set(e.target, [])
        adj.get(e.source)!.push(e.target)
        adj.get(e.target)!.push(e.source)
      }

      const visited = new Set<string>()
      const queue: [string, number][] = [[focusNode, 0]]
      visited.add(focusNode)
      while (queue.length > 0) {
        const [nodeId, dist] = queue.shift()!
        focusDistances.set(nodeId, dist)
        if (dist < 2) {
          for (const nb of (adj.get(nodeId) || [])) {
            if (!visited.has(nb)) { visited.add(nb); queue.push([nb, dist + 1]) }
          }
        }
      }
      // Mark unvisited as hidden
      for (const n of visibleNodes) {
        if (!focusDistances.has(n.id)) focusDistances.set(n.id, -1)
      }
    }

    const nodes: Node<GraphNodeData>[] = visibleNodes.map(n => ({
      id: n.id,
      type: "graphNode",
      position: positions[n.id] || { x: 400, y: 300 },
      data: {
        label: n.label,
        description: n.description,
        nodeType: n.nodeType,
        phase: n.phase,
        focusDistance: focusNode ? (focusDistances.get(n.id) ?? -1) : 1,
      },
      draggable: true,
    }))

    const edges: Edge[] = visibleEdges.map(e => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      style: { stroke: "#CBD5E1", strokeWidth: 1 },
      animated: false,
    }))

    setRfNodes(nodes)
    setRfEdges(edges)
  }, [visibleNodes, visibleEdges, positions, focusNode, setRfNodes, setRfEdges])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const d = node.data as GraphNodeData
    if (d.nodeType === "knowledge") {
      setFocusNode(node.id)
      onSelectKnowledge(node.id)
    } else if (d.nodeType === "skill" || d.nodeType === "task") {
      setFocusNode(node.id)
    } else {
      setFocusNode(null)
    }
  }, [onSelectKnowledge])

  const onPaneClick = useCallback(() => {
    setFocusNode(null)
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={3}
      >
        <Background color="#F1F5F9" gap={0} />
        <Controls className="!border !border-gray-200 !rounded-lg !shadow-sm" />
        <MiniMap
          nodeColor={(n) => {
            const d = n.data as GraphNodeData
            if (!d) return "#CBD5E1"
            return d.focusDistance === -1 ? "#E2E8F0" : COLORS[d.nodeType]?.dot || "#64748B"
          }}
          maskColor="rgba(0,0,0,0.08)"
          className="!border !border-gray-200 !rounded-lg !shadow-sm"
          style={{ width: 150, height: 100 }}
        />
      </ReactFlow>
    </div>
  )
}
