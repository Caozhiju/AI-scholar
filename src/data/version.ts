export interface VersionInfo {
  version: string
  releaseDate: string
  courseCount: number
  knowledgeCount: number
  researchTaskCount: number
  totalLearningMinutes: number
  totalLearningHours: number
  avgCourseMinutes: number
  stageCount: number
  phaseCount: number
  projectCount: number
  phaseProjectCount: number
  capstoneProjectCount: number
}

export const versionInfo: VersionInfo = {
  version: "2.1.0",
  releaseDate: "2026-06-15",
  courseCount: 72,
  knowledgeCount: 65,
  researchTaskCount: 40,
  totalLearningMinutes: 3927,
  totalLearningHours: 65,
  avgCourseMinutes: 27,
  stageCount: 4,
  phaseCount: 4,
  projectCount: 26,
  phaseProjectCount: 14,
  capstoneProjectCount: 1,
}

export const systemModules = [
  { id: "course", label: "课程学习系统", description: "72门阶段式课程学习与进度追踪" },
  { id: "roadmap", label: "培养方案系统", description: "四阶段科研能力培养路线" },
  { id: "knowledge", label: "知识图谱系统", description: "65个知识点与40个科研任务映射" },
  { id: "audit", label: "课程审计系统", description: "课程质量自动审计与修复建议" },
  { id: "studio", label: "科研实训系统", description: "26个三级科研项目体系" },
  { id: "about", label: "关于系统", description: "版本信息与系统模块说明" },
]
