/**
 * Phase 3 Blueprint: 大模型LLM与国际中文教育
 *
 * This file defines the full curriculum design for Phase 3.
 * It is used to generate the courses in courses.ts, the knowledge
 * graph nodes in knowledgeGraph.ts, and to power the review system.
 *
 * All courses are draft — no lesson content generated yet.
 */

export interface BlueprintCourse {
  id: string
  title: string
  description: string
  difficulty: "入门" | "初级" | "中级" | "高级"
  estimatedMinutes: number
  whyLearn: string
  learningObjectives: string[]
  relatedKnowledge: string[]
  researchTasks: string[]
  prerequisites: string[]
  nextSkill: string
  module: number
}

export interface BlueprintModule {
  id: number
  name: string
  description: string
  courseCount: number
}

export interface BlueprintStats {
  totalCourses: number
  totalKnowledge: number
  totalTasks: number
  totalMinutes: number
  moduleCount: number
  avgMinutesPerCourse: number
}

export const phase3Info = {
  id: "llm",
  title: "第三阶段：大模型LLM与国际中文教育",
  subtitle: "大模型LLM与国际中文教育",
  description:
    "本阶段聚焦大语言模型（LLM）在国际中文教育中的应用。不是通用AI课程，而是面向语言学研究生、国际中文教育硕士和二语习得研究者的教育NLP进阶课程。从LLM基础认知出发，逐步深入到Prompt工程、教育应用、知识增强和研究方法，全程零基础、通俗化、科研导向。",
  graduationAbility: "能够运用大语言模型辅助国际中文教育研究和教学",
  learningOutcomes: [
    "理解大语言模型的基本原理和发展脉络",
    "掌握Prompt工程的核心技术（Few-shot、CoT）",
    "能够将LLM应用于HSK文本生成、作文反馈、自动出题等教育场景",
    "理解RAG和Agent技术，能够构建教育知识库和教学Agent",
    "能够设计LLM相关研究方案并进行科学评测",
  ],
}

export const modules: BlueprintModule[] = [
  {
    id: 1,
    name: "LLM基础认知",
    description: "建立对LLM的初步认识，了解从NLP到LLM的发展脉络",
    courseCount: 3,
  },
  {
    id: 2,
    name: "Transformer基础",
    description: "理解LLM的核心架构Transformer和注意力机制",
    courseCount: 3,
  },
  {
    id: 3,
    name: "Prompt工程",
    description: "掌握与LLM交互的核心技能，设计面向教育场景的Prompt",
    courseCount: 4,
  },
  {
    id: 4,
    name: "教育应用",
    description: "将LLM应用于HSK文本生成、作文反馈、自动出题等教育场景",
    courseCount: 5,
  },
  {
    id: 5,
    name: "知识增强",
    description: "运用RAG和Agent技术构建教育知识库和智能教学系统",
    courseCount: 4,
  },
  {
    id: 6,
    name: "研究方法",
    description: "掌握LLM相关研究设计、评测和论文写作方法",
    courseCount: 4,
  },
]

export const blueprintCourses: BlueprintCourse[] = [
  // ═══════════════════════════════════════
  // Module 1: LLM基础认知
  // ═══════════════════════════════════════
  {
    id: "llm-001",
    title: "什么是大语言模型",
    description: "用通俗的语言解释大语言模型（LLM）是什么，它有什么能力，以及为什么它对语言学研究很重要。",
    difficulty: "入门",
    estimatedMinutes: 15,
    whyLearn: "理解LLM的基本概念是使用LLM的第一步。作为语言学研究者，你需要知道这个工具能做什么、不能做什么。",
    learningObjectives: [
      "理解大语言模型的基本定义和核心特征",
      "了解GPT系列模型的发展脉络",
      "认识LLM在语言研究和教学中的基本应用方向",
    ],
    relatedKnowledge: ["kw-llm-token", "kw-llm-inference"],
    researchTasks: [],
    prerequisites: [],
    nextSkill: "能够理解LLM的基本概念和应用方向",
    module: 1,
  },
  {
    id: "llm-002",
    title: "ChatGPT为什么会出现",
    description: "回顾LLM的发展历程，理解从统计语言模型到ChatGPT的技术演进，以及规模扩展带来的能力涌现。",
    difficulty: "入门",
    estimatedMinutes: 15,
    whyLearn: "理解技术的发展脉络能帮助你更好地把握LLM的能力边界和未来方向，为研究选题提供背景支撑。",
    learningObjectives: [
      "了解语言模型从统计方法到神经网络的演进路径",
      "理解规模扩展（Scaling Law）对模型能力的影响",
      "认识ChatGPT的技术突破和产业影响",
    ],
    relatedKnowledge: ["kw-llm-transformer", "kw-llm-finetuning"],
    researchTasks: [],
    prerequisites: ["llm-001"],
    nextSkill: "能够理解LLM的技术发展脉络",
    module: 1,
  },
  {
    id: "llm-003",
    title: "从NLP到LLM的发展",
    description: "梳理自然语言处理（NLP）的核心任务，对比传统NLP方法与LLM方法的差异，理解LLM带来的范式转变。",
    difficulty: "入门",
    estimatedMinutes: 20,
    whyLearn: "建立从传统NLP到LLM的完整认知框架，帮助你在研究中将LLM与传统方法有效结合。",
    learningObjectives: [
      "了解NLP的主要任务（分词、词性标注、句法分析、文本分类等）",
      "理解LLM如何统一了多项NLP任务的处理方式",
      "认识统计方法到神经方法的范式转变及其对语言学研究的启示",
    ],
    relatedKnowledge: ["kw-llm-transformer", "kw-llm-instruction"],
    researchTasks: [],
    prerequisites: ["llm-001", "llm-002"],
    nextSkill: "能够理解LLM在NLP发展中的位置和意义",
    module: 1,
  },

  // ═══════════════════════════════════════
  // Module 2: Transformer基础
  // ═══════════════════════════════════════
  {
    id: "llm-004",
    title: "Transformer是什么",
    description: "用最小化的技术细节解释Transformer架构的核心思想，包括Encoder-Decoder结构、自注意力机制的基本直觉。",
    difficulty: "初级",
    estimatedMinutes: 25,
    whyLearn: "Transformer是所有现代LLM的基础架构，理解其核心思想是理解LLM的关键一步。",
    learningObjectives: [
      "了解Transformer的基本架构（Encoder-Decoder结构）",
      "理解Self-Attention的核心思想",
      "认识Transformer相比传统模型的优势",
    ],
    relatedKnowledge: ["kw-llm-transformer", "kw-llm-attention"],
    researchTasks: [],
    prerequisites: ["llm-003"],
    nextSkill: "能够理解Transformer的基本工作原理",
    module: 2,
  },
  {
    id: "llm-005",
    title: "为什么Transformer改变了NLP",
    description: "深入理解Transformer的革命性影响：并行计算、长距离依赖建模、预训练-微调范式，以及它对语言学研究方法的启示。",
    difficulty: "初级",
    estimatedMinutes: 20,
    whyLearn: "理解Transformer为何成功，有助于你在教育NLP研究中更好地选择和使用模型。",
    learningObjectives: [
      "理解并行计算如何提升了训练效率",
      "对比RNN/CNN与Transformer的结构差异",
      "认识预训练-微调范式对NLP研究的深远影响",
    ],
    relatedKnowledge: ["kw-llm-transformer", "kw-llm-finetuning"],
    researchTasks: [],
    prerequisites: ["llm-004"],
    nextSkill: "能够解释Transformer为何改变了NLP领域",
    module: 2,
  },
  {
    id: "llm-006",
    title: "注意力机制（语言学版）",
    description: "从语言学的视角理解注意力机制——模型如何像人类阅读者一样「注意」到句子中的关键信息。",
    difficulty: "初级",
    estimatedMinutes: 25,
    whyLearn: "注意力机制与语言学中的注意（attention）概念有着深刻的联系，理解它能帮助你从语言学视角理解LLM。",
    learningObjectives: [
      "理解注意力机制如何模拟人类的阅读注意过程",
      "掌握Self-Attention和Cross-Attention的基本概念",
      "能够将注意力机制与语言学中的焦点、话题等概念建立联系",
    ],
    relatedKnowledge: ["kw-llm-attention", "kw-llm-context-window"],
    researchTasks: [],
    prerequisites: ["llm-004"],
    nextSkill: "能够用语言学的视角理解注意力机制",
    module: 2,
  },

  // ═══════════════════════════════════════
  // Module 3: Prompt工程
  // ═══════════════════════════════════════
  {
    id: "llm-007",
    title: "Prompt基础",
    description: "学习Prompt的基本概念、组成要素和编写原则，掌握与LLM有效交互的基础技能。",
    difficulty: "入门",
    estimatedMinutes: 15,
    whyLearn: "Prompt是与LLM交互的核心方式，是教育研究者使用LLM的基础技能。好的Prompt能显著提升LLM的输出质量。",
    learningObjectives: [
      "理解Prompt的基本概念和组成要素",
      "掌握Prompt编写的基本原则（清晰、具体、有上下文）",
      "能够编写基本的指令型Prompt",
    ],
    relatedKnowledge: ["kw-llm-prompt", "kw-llm-instruction"],
    researchTasks: ["task-llm-prompt-optimize"],
    prerequisites: ["llm-001"],
    nextSkill: "能够编写基本Prompt以完成简单任务",
    module: 3,
  },
  {
    id: "llm-008",
    title: "Few-shot Prompt",
    description: "学习如何在Prompt中提供示例来引导LLM的输出，掌握Zero-shot与Few-shot的区别和适用场景。",
    difficulty: "初级",
    estimatedMinutes: 20,
    whyLearn: "Few-shot是提升LLM输出质量的最有效方法之一，特别适合需要特定格式或风格的教育内容生成。",
    learningObjectives: [
      "理解Few-shot的概念和工作原理",
      "掌握示例设计的方法和技巧",
      "能够对比Zero-shot与Few-shot的输出差异并选择合适策略",
    ],
    relatedKnowledge: ["kw-llm-fewshot", "kw-llm-prompt"],
    researchTasks: ["task-llm-prompt-optimize"],
    prerequisites: ["llm-007"],
    nextSkill: "能够设计有效的Few-shot示例",
    module: 3,
  },
  {
    id: "llm-009",
    title: "Chain of Thought",
    description: "学习Chain of Thought（思维链）Prompt技术，让LLM展示推理过程，提升复杂任务的准确性。",
    difficulty: "初级",
    estimatedMinutes: 20,
    whyLearn: "CoT能显著提升LLM在推理任务上的表现，在语言教学中的语法分析、偏误分析等场景特别有用。",
    learningObjectives: [
      "理解Chain of Thought的核心思想",
      "掌握CoT Prompt的编写方法",
      "了解CoT在语言教学和研究中的应用场景",
    ],
    relatedKnowledge: ["kw-llm-cot", "kw-llm-prompt"],
    researchTasks: ["task-llm-prompt-optimize"],
    prerequisites: ["llm-007"],
    nextSkill: "能够设计Chain of Thought Prompt",
    module: 3,
  },
  {
    id: "llm-010",
    title: "国际中文教育Prompt设计",
    description: "针对国际中文教育的特殊需求，学习如何设计高质量的教学和研究Prompt。",
    difficulty: "中级",
    estimatedMinutes: 25,
    whyLearn: "教育场景有特殊的Prompt需求——需要控制语言难度、文化内容、教学目标和评估标准。专门的Prompt设计方法能大幅提升LLM在教育场景中的实用价值。",
    learningObjectives: [
      "掌握教育场景Prompt设计的核心原则",
      "能够设计教学辅助类Prompt（如语法讲解、词汇辨析、例句生成）",
      "能够设计研究分析类Prompt（如偏误分析、语言特征提取）",
    ],
    relatedKnowledge: ["kw-llm-prompt", "kw-llm-instruction", "kw-llm-controlled-gen"],
    researchTasks: ["task-llm-prompt-optimize", "task-llm-qa-system"],
    prerequisites: ["llm-008", "llm-009"],
    nextSkill: "能够针对国际中文教育场景设计专业Prompt",
    module: 3,
  },

  // ═══════════════════════════════════════
  // Module 4: 教育应用
  // ═══════════════════════════════════════
  {
    id: "llm-011",
    title: "HSK文本生成",
    description: "学习如何使用LLM生成符合HSK等级标准的阅读文本，包括词汇控制、句法难度控制和话题选择。",
    difficulty: "中级",
    estimatedMinutes: 25,
    whyLearn: "HSK分级阅读材料的生成是国际中文教育的刚需，LLM能极大提升材料开发效率。",
    learningObjectives: [
      "理解HSK各级别的语言特征和难度标准",
      "掌握使用LLM生成HSK分级文本的方法",
      "了解文本质量评估和质量控制策略",
    ],
    relatedKnowledge: ["kw-llm-controlled-gen", "kw-llm-hallucination", "kw-llm-output-control"],
    researchTasks: ["task-llm-hsk-gen", "task-llm-reading-gen"],
    prerequisites: ["llm-010"],
    nextSkill: "能够使用LLM生成HSK分级阅读文本",
    module: 4,
  },
  {
    id: "llm-012",
    title: "受控文本生成",
    description: "深入学习如何控制LLM生成的文本——包括词汇范围、句法复杂度、主题领域、文本长度和文化适应性。",
    difficulty: "中级",
    estimatedMinutes: 25,
    whyLearn: "在教育场景中，我们不仅需要LLM生成文本，还需要生成符合特定教学要求的文本。受控生成是实现这一目标的关键技术。",
    learningObjectives: [
      "理解受控文本生成的核心概念和方法",
      "掌握通过Prompt实现词汇、句法、主题控制的技术",
      "能够评估受控生成的质量并迭代优化",
    ],
    relatedKnowledge: ["kw-llm-controlled-gen", "kw-llm-output-control", "kw-llm-prompt"],
    researchTasks: ["task-llm-hsk-gen", "task-llm-reading-gen"],
    prerequisites: ["llm-011"],
    nextSkill: "能够对LLM的文本输出进行精细控制",
    module: 4,
  },
  {
    id: "llm-013",
    title: "作文自动反馈",
    description: "学习如何使用LLM为学习者作文提供多维度自动反馈，包括语言偏误、内容组织、词汇丰富度和句法多样性。",
    difficulty: "中级",
    estimatedMinutes: 30,
    whyLearn: "自动反馈是智能教育辅导的核心应用，LLM的生成能力使个性化、多维度的作文反馈成为可能。",
    learningObjectives: [
      "理解作文反馈的核心维度和质量标准",
      "掌握使用LLM生成作文反馈的方法",
      "了解反馈的准确性问题（Hallucination）及其缓解策略",
    ],
    relatedKnowledge: ["kw-llm-evaluation", "kw-llm-hallucination", "kw-llm-text-generation"],
    researchTasks: ["task-llm-essay-feedback", "task-llm-error-detection"],
    prerequisites: ["llm-010"],
    nextSkill: "能够设计基于LLM的作文自动反馈系统",
    module: 4,
  },
  {
    id: "llm-014",
    title: "自动出题",
    description: "学习如何使用LLM自动生成各类教学题目——词汇题、语法题、阅读理解题、写作题等。",
    difficulty: "中级",
    estimatedMinutes: 25,
    whyLearn: "出题是教学工作中最耗时的工作之一，LLM能根据教学内容和目标自动生成高质量的练习题。",
    learningObjectives: [
      "了解自动出题的题型分类和生成策略",
      "掌握使用LLM生成不同题型的方法",
      "了解题目质量评估和难度控制方法",
    ],
    relatedKnowledge: ["kw-llm-text-generation", "kw-llm-controlled-gen"],
    researchTasks: ["task-llm-question-gen"],
    prerequisites: ["llm-010"],
    nextSkill: "能够使用LLM自动生成教学题目",
    module: 4,
  },
  {
    id: "llm-015",
    title: "阅读材料生成",
    description: "学习如何使用LLM为不同水平的学习者生成分级阅读材料，包括话题选择、难度控制和文化内容融入。",
    difficulty: "中级",
    estimatedMinutes: 25,
    whyLearn: "分级阅读材料是语言教学的基础资源，LLM能根据教学需要快速生成丰富的阅读素材。",
    learningObjectives: [
      "理解阅读材料分级的标准和方法",
      "掌握使用LLM生成分级阅读材料的技术",
      "了解文化内容融入和话题多样性的控制方法",
    ],
    relatedKnowledge: ["kw-llm-text-generation", "kw-llm-controlled-gen", "kw-llm-context-window"],
    researchTasks: ["task-llm-reading-gen", "task-llm-hsk-gen"],
    prerequisites: ["llm-011", "llm-012"],
    nextSkill: "能够为不同水平学习者生成合适的阅读材料",
    module: 4,
  },

  // ═══════════════════════════════════════
  // Module 5: 知识增强
  // ═══════════════════════════════════════
  {
    id: "llm-016",
    title: "RAG是什么",
    description: "学习检索增强生成（RAG）的核心概念——如何让LLM在生成答案时参考外部知识库，解决LLM知识局限性和幻觉问题。",
    difficulty: "中级",
    estimatedMinutes: 25,
    whyLearn: "RAG是解决LLM在教育场景中知识不准确问题的关键技术，是实现可靠教学系统的核心。",
    learningObjectives: [
      "理解RAG的基本架构和工作流程",
      "了解检索（Retrieval）与生成（Generation）如何协同工作",
      "认识RAG在教育应用中的优势和挑战",
    ],
    relatedKnowledge: ["kw-llm-rag", "kw-llm-vector-db", "kw-llm-embedding"],
    researchTasks: ["task-llm-knowledge-base"],
    prerequisites: ["llm-010"],
    nextSkill: "能够理解RAG的工作原理和适用场景",
    module: 5,
  },
  {
    id: "llm-017",
    title: "教育知识库",
    description: "学习如何构建面向国际中文教育的知识库——包括教材知识、语法知识、HSK词汇知识等的结构化和向量化。",
    difficulty: "中级",
    estimatedMinutes: 30,
    whyLearn: "教育知识库是RAG系统的基础设施，好的知识库决定了教学系统的回答质量和可靠性。",
    learningObjectives: [
      "理解教育知识库的设计原则和构建流程",
      "掌握教材知识的结构化方法",
      "了解知识库的维护更新策略",
    ],
    relatedKnowledge: ["kw-llm-rag", "kw-llm-vector-db", "kw-llm-embedding"],
    researchTasks: ["task-llm-knowledge-base", "task-llm-qa-system"],
    prerequisites: ["llm-016"],
    nextSkill: "能够构建面向国际中文教育的知识库",
    module: 5,
  },
  {
    id: "llm-018",
    title: "Agent是什么",
    description: "用通俗的语言解释AI Agent的概念——Agent如何利用LLM进行推理、调用工具、执行多步任务，以及在教育中的潜力。",
    difficulty: "中级",
    estimatedMinutes: 20,
    whyLearn: "Agent代表了LLM应用的前沿方向，理解Agent概念能帮助你在教育中设计更智能的教学助手。",
    learningObjectives: [
      "理解Agent的基本概念和核心组件（LLM、工具、记忆、规划）",
      "了解LLM Agent的典型架构和工作流程",
      "认识Agent在国际中文教育中的应用潜力",
    ],
    relatedKnowledge: ["kw-llm-agent", "kw-llm-tool-use"],
    researchTasks: ["task-llm-classroom-assistant"],
    prerequisites: ["llm-016"],
    nextSkill: "能够理解Agent的工作原理和设计思路",
    module: 5,
  },
  {
    id: "llm-019",
    title: "教学Agent设计",
    description: "深入学习教育Agent的设计方法——如何设计面向语言教学的智能Agent，包括课堂助手、学习伴侣和教学管理Agent。",
    difficulty: "高级",
    estimatedMinutes: 30,
    whyLearn: "教学Agent是实现个性化教学的关键技术，掌握Agent设计方法能让你开发出真正有用的智能教学系统。",
    learningObjectives: [
      "掌握教学Agent的设计方法和交互模式",
      "能够设计面向教学场景的Agent流程",
      "了解Agent的安全性和可靠性保障策略",
    ],
    relatedKnowledge: ["kw-llm-agent", "kw-llm-tool-use", "kw-llm-instruction"],
    researchTasks: ["task-llm-agent-design", "task-llm-classroom-assistant", "task-llm-path-recommend"],
    prerequisites: ["llm-018", "llm-017"],
    nextSkill: "能够设计面向国际中文教育场景的教学Agent",
    module: 5,
  },

  // ═══════════════════════════════════════
  // Module 6: 研究方法
  // ═══════════════════════════════════════
  {
    id: "llm-020",
    title: "LLM研究设计",
    description: "学习如何设计LLM相关的研究——研究问题类型（能力探索、应用效果、对比研究等）、实验设计和研究伦理。",
    difficulty: "高级",
    estimatedMinutes: 25,
    whyLearn: "掌握LLM研究设计方法是开展毕业论文研究的基础，帮助你选择有意义的研究问题和合适的研究方法。",
    learningObjectives: [
      "理解LLM研究问题的类型和选题策略",
      "掌握LLM研究的基本设计方法",
      "了解LLM研究中的伦理问题（数据隐私、偏见、透明度）",
    ],
    relatedKnowledge: ["kw-llm-evaluation", "kw-llm-alignment"],
    researchTasks: ["task-llm-assessment", "task-llm-error-detection"],
    prerequisites: ["llm-013", "llm-019"],
    nextSkill: "能够设计LLM驱动的语言教育研究方案",
    module: 6,
  },
  {
    id: "llm-021",
    title: "LLM评测",
    description: "学习如何评测LLM的性能——自动评测指标（BLEU、ROUGE、BERTScore等）和人工评测方法，以及教育场景的特殊评测需求。",
    difficulty: "高级",
    estimatedMinutes: 25,
    whyLearn: "科学的评测是LLM研究的基石，掌握评测方法才能客观评估LLM在教育场景中的表现。",
    learningObjectives: [
      "理解LLM评测的核心指标和方法",
      "掌握教育场景的特殊评测需求（语言准确性、教学适用性、文化敏感性）",
      "能够设计评测实验并分析结果",
    ],
    relatedKnowledge: ["kw-llm-evaluation", "kw-llm-benchmark", "kw-llm-hallucination"],
    researchTasks: ["task-llm-assessment"],
    prerequisites: ["llm-020"],
    nextSkill: "能够设计LLM在教育场景中的评测方案",
    module: 6,
  },
  {
    id: "llm-022",
    title: "实验设计与论文写作",
    description: "学习LLM相关研究的实验设计方法和学术论文写作规范，为发表研究成果做准备。",
    difficulty: "高级",
    estimatedMinutes: 25,
    whyLearn: "实验设计和论文写作是研究生的核心技能，掌握LLM研究的特殊实验设计方法能让你的研究更有说服力。",
    learningObjectives: [
      "掌握LLM实验设计的方法（对比实验、消融实验、用户研究）",
      "了解LLM研究论文的写作规范和常见结构",
      "能够撰写规范的研究论文",
    ],
    relatedKnowledge: ["kw-llm-evaluation", "kw-llm-alignment"],
    researchTasks: ["task-llm-assessment", "task-llm-prompt-optimize"],
    prerequisites: ["llm-021"],
    nextSkill: "能够设计LLM实验并撰写研究论文",
    module: 6,
  },
  {
    id: "llm-023",
    title: "综合案例",
    description: "综合运用Phase 3所学知识，分析多个真实研究案例——从HSK生成系统到教学Agent，从作文反馈到阅读材料生成。",
    difficulty: "高级",
    estimatedMinutes: 30,
    whyLearn: "综合案例将前面各模块的知识串联为完整的应用能力，为毕业论文研究和实际教学应用提供参考模板。",
    learningObjectives: [
      "能够综合运用LLM技术解决教育场景中的实际问题",
      "能够批判性评估不同LLM应用方案的优缺点",
      "能够独立设计完整的LLM教育应用方案",
    ],
    relatedKnowledge: [
      "kw-llm-transformer", "kw-llm-attention", "kw-llm-prompt", "kw-llm-rag",
      "kw-llm-agent", "kw-llm-evaluation", "kw-llm-controlled-gen",
    ],
    researchTasks: [
      "task-llm-hsk-gen", "task-llm-essay-feedback", "task-llm-question-gen",
      "task-llm-reading-gen", "task-llm-agent-design", "task-llm-knowledge-base",
    ],
    prerequisites: ["llm-022", "llm-019", "llm-017", "llm-013"],
    nextSkill: "能够独立开展LLM驱动的国际中文教育研究项目",
    module: 6,
  },
]

/** Build per-module statistics */
export function getModuleStats() {
  return modules.map((m) => {
    const modCourses = blueprintCourses.filter((c) => c.module === m.id)
    const totalMinutes = modCourses.reduce((s, c) => s + c.estimatedMinutes, 0)
    return {
      moduleId: m.id,
      name: m.name,
      courseCount: modCourses.length,
      totalMinutes,
    }
  })
}

/** Build full Phase 3 statistics */
export function getBlueprintStats(): BlueprintStats {
  const totalCourses = blueprintCourses.length
  const totalMinutes = blueprintCourses.reduce((s, c) => s + c.estimatedMinutes, 0)
  const allKnowledge = new Set(blueprintCourses.flatMap((c) => c.relatedKnowledge))
  const allTasks = new Set(blueprintCourses.flatMap((c) => c.researchTasks))
  return {
    totalCourses,
    totalKnowledge: allKnowledge.size,
    totalTasks: allTasks.size,
    totalMinutes,
    moduleCount: modules.length,
    avgMinutesPerCourse: Math.round(totalMinutes / totalCourses),
  }
}

/** Get course dependency graph for recommended learning path */
export function getCourseDependencies(): Map<string, string[]> {
  const deps = new Map<string, string[]>()
  for (const course of blueprintCourses) {
    deps.set(course.id, course.prerequisites)
  }
  return deps
}

/** Get knowledge coverage for a given module */
export function getModuleKnowledgeCoverage(moduleId: number): string[] {
  const modCourses = blueprintCourses.filter((c) => c.module === moduleId)
  const knowledge = new Set(modCourses.flatMap((c) => c.relatedKnowledge))
  return Array.from(knowledge)
}

/** Get task coverage for a given module */
export function getModuleTaskCoverage(moduleId: number): string[] {
  const modCourses = blueprintCourses.filter((c) => c.module === moduleId)
  const tasks = new Set(modCourses.flatMap((c) => c.researchTasks))
  return Array.from(tasks)
}
