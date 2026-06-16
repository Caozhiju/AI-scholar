"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import ForceGraph2D from "./ForceGraphWrapper"
import {
  skills, knowledge, researchTasks,
  skillToKnowledge, knowledgeToTask,
  getKnowledgeCourses,
} from "@/data/knowledgeGraph"
import { stages } from "@/data/courses"

const skillToPhase: Record<string, number> = {
  "skill-python": 1, "skill-text": 1, "skill-data": 1,
  "skill-nlp": 2, "skill-edunlp": 2,
  "skill-llm": 3,
  "skill-research": 4,
}

function nodePhase(id: string, type: string): number {
  if (type === "skill") return skillToPhase[id] || 0
  for (const [s, kids] of Object.entries(skillToKnowledge)) if (kids.includes(id)) return skillToPhase[s] || 0
  for (const [kid, tids] of Object.entries(knowledgeToTask)) if (tids.includes(id))
    for (const [s, kids] of Object.entries(skillToKnowledge)) if (kids.includes(kid)) return skillToPhase[s] || 0
  return 0
}

const COLORS: Record<string, string> = { skill: "#8B5CF6", knowledge: "#334155", task: "#22C55E", course: "#3B82F6" }
const RADII: Record<string, number> = { skill: 12, knowledge: 8, task: 7, course: 6 }

interface Props {
  completedCourses: string[]
  onSelectKnowledge: (id: string) => void
  phaseFilter: number
  showSkills: boolean
  showKnowledge: boolean
  showTasks: boolean
  showCourses: boolean
  searchQuery: string
}

export default function GraphExplorer({ completedCourses, onSelectKnowledge, phaseFilter, showSkills, showKnowledge, showTasks, showCourses, searchQuery }: Props) {
  const fgRef = useRef<any>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [hovered, setHovered] = useState<any>(null)

  // Build full graph
  const fullGraph = useMemo(() => {
    const nodes: any[] = []
    const links: any[] = []
    const add = (n: any) => { if (!nodes.find(x => x.id === n.id)) nodes.push(n) }

    for (const s of skills) add({ id: s.id, name: s.label, type: "skill", phase: skillToPhase[s.id] || 0, r: RADII.skill, color: COLORS.skill })
    for (const k of knowledge) {
      const courses = getKnowledgeCourses(k.id)
      const mastered = courses.some(t => { const c = stages.flatMap(s => s.courses).find(co => co.title === t); return c && completedCourses.includes(c.id) })
      add({ id: k.id, name: k.label, type: "knowledge", phase: nodePhase(k.id, "knowledge"), r: RADII.knowledge, color: COLORS.knowledge, mastered })
    }
    for (const t of researchTasks) add({ id: t.id, name: t.label, type: "task", phase: nodePhase(t.id, "task"), r: RADII.task, color: COLORS.task })

    for (const [s, kids] of Object.entries(skillToKnowledge)) for (const kid of kids) links.push({ source: s, target: kid })
    for (const [kid, tids] of Object.entries(knowledgeToTask)) for (const tid of tids) links.push({ source: kid, target: tid })

    return { nodes, links }
  }, [completedCourses])

  // Filter
  const filtered = useMemo(() => {
    let ns = fullGraph.nodes
    if (!showSkills) ns = ns.filter((n: any) => n.type !== "skill")
    if (!showKnowledge) ns = ns.filter((n: any) => n.type !== "knowledge")
    if (!showTasks) ns = ns.filter((n: any) => n.type !== "task")
    if (!showCourses) ns = ns.filter((n: any) => n.type !== "course")
    if (phaseFilter > 0) {
      const phases = [phaseFilter]
      if (phaseFilter > 1) phases.push(phaseFilter - 1)
      if (phaseFilter < 4) phases.push(phaseFilter + 1)
      ns = ns.filter((n: any) => phases.includes(n.phase))
    }
    const ids = new Set(ns.map((n: any) => n.id))
    const ls = fullGraph.links.filter((l: any) => ids.has(typeof l.source === "string" ? l.source : (l.source as any).id) && ids.has(typeof l.target === "string" ? l.target : (l.target as any).id))
    return { nodes: ns, links: ls }
  }, [fullGraph, phaseFilter, showSkills, showKnowledge, showTasks, showCourses])

  // Search highlights
  const searchHits = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>()
    const q = searchQuery.toLowerCase()
    return new Set(filtered.nodes.filter((n: any) => n.name.toLowerCase().includes(q)).map((n: any) => n.id))
  }, [searchQuery, filtered])

  // Auto-focus on search
  useEffect(() => {
    if (searchHits.size > 0 && fgRef.current) {
      const target = filtered.nodes.find((n: any) => searchHits.has(n.id))
      if (target) {
        setFocusId(target.id)
        setTimeout(() => fgRef.current?.zoomToFit(400, 50, (n: any) => searchHits.has(n.id)), 100)
      }
    }
  }, [searchQuery, searchHits, filtered])

  // Focus computation
  const processed = useMemo(() => {
    if (!focusId) return { nodes: filtered.nodes, links: filtered.links }

    // Build adjacency
    const adj = new Map<string, string[]>()
    for (const l of filtered.links) {
      const s = typeof l.source === "string" ? l.source : (l.source as any).id
      const t = typeof l.target === "string" ? l.target : (l.target as any).id
      if (!adj.has(s)) adj.set(s, [])
      if (!adj.has(t)) adj.set(t, [])
      adj.get(s)!.push(t)
      adj.get(t)!.push(s)
    }

    // BFS distances
    const dists = new Map<string, number>()
    const visited = new Set<string>()
    const queue: [string, number][] = [[focusId, 0]]
    visited.add(focusId)
    while (queue.length > 0) {
      const [id, d] = queue.shift()!
      dists.set(id, d)
      if (d < 2) for (const nb of (adj.get(id) || [])) if (!visited.has(nb)) { visited.add(nb); queue.push([nb, d + 1]) }
    }

    const nodes = filtered.nodes.map((n: any) => {
      const d = dists.has(n.id) ? dists.get(n.id)! : 3
      return { ...n, focusGroup: d, isFocus: n.id === focusId }
    })
    const links = filtered.links.map((l: any) => {
      const sid = typeof l.source === "string" ? l.source : (l.source as any).id
      const tid = typeof l.target === "string" ? l.target : (l.target as any).id
      const g = Math.min(dists.has(sid) ? dists.get(sid)! : 3, dists.has(tid) ? dists.get(tid)! : 3)
      return { ...l, _fg: g }
    })
    return { nodes, links }
  }, [filtered, focusId])

  const handleNodeClick = useCallback((node: any) => {
    setFocusId(focusId === node.id ? null : node.id)
    if (node.type === "knowledge") onSelectKnowledge(node.id)
  }, [focusId, onSelectKnowledge])

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, scale: number) => {
    let alpha = 1
    if (focusId) { if (node.focusGroup === 0) alpha = 1; else if (node.focusGroup === 1) alpha = 1; else if (node.focusGroup === 2) alpha = 0.5; else alpha = 0.08 }
    const isSearchHit = searchHits.has(node.id)
    const rad = node.r * (node.isFocus ? 1.5 : 1) + (isSearchHit ? 4 : 0)
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(node.x, node.y, rad, 0, 2 * Math.PI)
    ctx.fillStyle = node.isFocus ? "#F59E0B" : node.color
    ctx.fill()
    if (node.mastered) {
      ctx.beginPath(); ctx.arc(node.x, node.y, node.r + 2, 0, 2 * Math.PI)
      ctx.strokeStyle = "#22C55E"; ctx.lineWidth = 2; ctx.stroke()
    }
    if (hovered?.id === node.id || isSearchHit || scale > 0.7) {
      const fs = Math.max(6, 10 / scale)
      ctx.font = `${fs}px sans-serif`
      ctx.fillStyle = "#1E293B"; ctx.textAlign = "center"
      ctx.fillText(node.name, node.x, node.y + rad + fs + 2)
    }
    ctx.globalAlpha = 1
  }, [hovered, searchHits, focusId])

  return (
    <div className="w-full h-full relative">
      {filtered.nodes.length > 1 ? (
        <ForceGraph2D
          ref={fgRef}
          graphData={processed}
          nodeLabel=""
          nodeCanvasObject={paintNode}
          linkColor={() => "#CBD5E1"}
          linkWidth={(l: any) => { if (!focusId) return 0.5; const g = l._fg ?? 1; return g <= 1 ? 1.5 : g === 2 ? 0.5 : 0.1 }}
          linkDirectionalParticles={0}
          linkDirectionalArrowLength={0}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setFocusId(null)}
          onNodeHover={setHovered}
          warmupTicks={100}
          cooldownTicks={50}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          linkDistance={120}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">{filtered.nodes.length === 0 ? "当前筛选条件下无节点" : "加载中..."}</div>
      )}

      {focusId && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 shadow-sm">
          聚焦: <strong className="text-gray-800">{processed.nodes.find((n: any) => n.id === focusId)?.name || ""}</strong>
          <button onClick={() => setFocusId(null)} className="ml-2 text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}
    </div>
  )
}
