/**
 * Phase 2 Curriculum Blueprint
 * 第二阶段：计算语言学与教育NLP基础
 *
 * 目标用户：已完成第一阶段的国际中文教育硕士研究生
 * 前置要求：Python基础文本处理、语料库概念、词频统计与共现分析
 * 总课程数：15
 * 课程编号：edunlp-001 ~ edunlp-015
 */

export interface BlueprintCourse {
  id: string
  title: string
  description: string
  difficulty: "入门" | "初级" | "中级"
  estimatedMinutes: number
  whyLearn: string
  learningObjectives: string[]
  relatedKnowledge: string[]
  researchTasks: string[]
  prerequisites: string[]
  nextSkill: string
  status: "planned"
}

export interface DependencyEdge {
  source: string
  target: string
  label: string
}

/** 第二阶段总目标 */
export const phase2Goal = `完成第二阶段后，你将能够：

1. 理解NLP核心概念——知道自然语言处理能做什么、不能做什么，不再将NLP视为"黑箱"
2. 掌握中文NLP基础技术——理解分词、词性标注、句法分析的基本原理和应用场景
3. 应用文本分类与情感分析——能够将分类技术用于偏误检测、可读性分析等教育场景
4. 开展学习者语言计算分析——用NLP工具分析学习者作文中的偏误、词汇特征和语言发展模式
5. 完成教育NLP研究项目——从研究设计到数据分析到结果呈现，形成完整闭环
6. 为第三阶段（大模型LLM）做好准备——理解传统NLP方法，才能理解大模型带来了什么变化`

/** 15门课程的完整定义 */
export const courses: BlueprintCourse[] = [
  // ─── 模块一：NLP入门（edunlp-001 ~ edunlp-002）───
  {
    id: "edunlp-001",
    title: "NLP是什么——语言学视角",
    description: "从语言学研究者的角度理解自然语言处理的核心概念、发展历程和能力边界",
    difficulty: "入门",
    estimatedMinutes: 15,
    whyLearn: "你使用NLP工具之前，必须先理解NLP是什么。本课给你一张认知地图——哪些NLP任务和语言学直接相关，哪些和教学相关，哪些超出了当前技术能力",
    learningObjectives: [
      "理解NLP的定义及其与语言学的关系",
      "认识NLP的主要任务分类及其研究价值",
      "区分NLP能做和不能做的事情",
      "建立从语言学问题到NLP方法的映射思维",
    ],
    relatedKnowledge: ["kw-automation", "kw-frequency"],
    researchTasks: ["task-hsk", "task-essay"],
    prerequisites: [],
    nextSkill: "能够从语言学问题出发理解NLP任务的分类，具备选择合适NLP方法的基本判断力",
    status: "planned",
  },
  {
    id: "edunlp-002",
    title: "NLP工具入门",
    description: "了解常用中文NLP工具的基本功能和使用方式，为后续课程打下工具基础",
    difficulty: "入门",
    estimatedMinutes: 12,
    whyLearn: "理论知识需要工具来实现。本课让你快速了解在中文NLP领域有哪些成熟可用的工具，它们能做什么、不能做什么",
    learningObjectives: [
      "认识常用的中文NLP工具和库",
      "理解不同工具的适用场景",
      "掌握工具选择的基本原则",
    ],
    relatedKnowledge: ["kw-segmentation", "kw-automation"],
    researchTasks: ["task-essay", "task-large"],
    prerequisites: ["edunlp-001"],
    nextSkill: "能够选择合适的中文NLP工具完成基本文本处理任务",
    status: "planned",
  },

  // ─── 模块二：核心NLP技术（edunlp-003 ~ edunlp-006）───
  {
    id: "edunlp-003",
    title: "中文分词",
    description: "深入理解中文分词的原理、挑战以及在语言学中的应用",
    difficulty: "初级",
    estimatedMinutes: 15,
    whyLearn: "分词是中文NLP的第一步，也是最重要的一步。分词质量直接影响后续所有分析——不理解分词，就没有资格做中文NLP",
    learningObjectives: [
      "理解中文分词的核心挑战（歧义切分、未登录词）",
      "认识基于词典和基于统计的两类分词方法",
      "掌握分词工具的基本使用",
      "理解分词结果对后续分析的影响",
    ],
    relatedKnowledge: ["kw-segmentation", "kw-token"],
    researchTasks: ["task-essay", "task-large", "task-hsk", "task-error-auto"],
    prerequisites: ["edunlp-001", "edunlp-002"],
    nextSkill: "能够使用分词工具对中文文本进行分词，并评估分词质量对分析的影响",
    status: "planned",
  },
  {
    id: "edunlp-004",
    title: "词性标注与语言分析",
    description: "学习词性标注的原理及其在语言学定量分析中的应用",
    difficulty: "初级",
    estimatedMinutes: 15,
    whyLearn: "词性标注让你从'知道有哪些词'深入到'知道这些词的语法类别'，是语言学研究从词汇层进入语法层的关键一步",
    learningObjectives: [
      "理解词性标注的基本原理和标注体系",
      "认识词性标注在语言学中的研究价值",
      "掌握词性标注工具的基本使用",
      "学会基于词性分布的语言特征分析",
    ],
    relatedKnowledge: ["kw-pos-tagging", "kw-frequency"],
    researchTasks: ["task-essay", "task-error-auto", "task-essay-grading"],
    prerequisites: ["edunlp-003"],
    nextSkill: "能够使用词性标注工具分析文本，基于词性分布提取语言学特征",
    status: "planned",
  },
  {
    id: "edunlp-005",
    title: "命名实体识别",
    description: "学习命名实体识别的基本概念及其在国际中文教育中的特殊价值",
    difficulty: "初级",
    estimatedMinutes: 12,
    whyLearn: "命名实体识别能自动从文本中提取人名、地名、机构名等关键信息，在教材分析和课堂反馈研究中非常实用",
    learningObjectives: [
      "理解命名实体识别的概念和常见实体类型",
      "认识NER在教材分析中的应用",
      "了解简单NER工具的使用",
    ],
    relatedKnowledge: ["kw-ner", "kw-corpus"],
    researchTasks: ["task-textbook", "task-feedback"],
    prerequisites: ["edunlp-003"],
    nextSkill: "能够使用NER工具从文本中提取命名实体，用于教材分析和课堂研究",
    status: "planned",
  },
  {
    id: "edunlp-006",
    title: "从分词到句法——文本分析流水线",
    description: "串联分词、词性标注、依存句法分析，理解从词语到句子的完整分析路径",
    difficulty: "初级",
    estimatedMinutes: 15,
    whyLearn: "单个NLP工具的价值有限，把它们串联成流水线才能解决真正的语言学问题。本课带你建立'管道思维'",
    learningObjectives: [
      "理解NLP分析流水线的概念",
      "掌握分词→词性标注→句法分析的串联逻辑",
      "认识依存句法在偏误分析中的应用",
      "能够使用简单工具完成基本的句法分析",
    ],
    relatedKnowledge: ["kw-segmentation", "kw-pos-tagging", "kw-dependency-parsing"],
    researchTasks: ["task-essay-grading", "task-error-auto"],
    prerequisites: ["edunlp-003", "edunlp-004"],
    nextSkill: "能够串联多个NLP工具完成从文本到句法结构的完整分析",
    status: "planned",
  },

  // ─── 模块三：NLP方法在教育中的应用（edunlp-007 ~ edunlp-010）───
  {
    id: "edunlp-007",
    title: "文本分类入门",
    description: "理解文本分类的基本概念及其在国际中文教育中的多种应用场景",
    difficulty: "初级",
    estimatedMinutes: 15,
    whyLearn: "文本分类是教育NLP中最通用的方法——你用它做偏误检测、可读性分析、情感分析，几乎所有的'NLP判断任务'都基于分类",
    learningObjectives: [
      "理解文本分类的基本概念和流程",
      "认识分类特征的设计方法",
      "了解分类在教育NLP中的应用场景",
      "区分类别体系设计对分类效果的影响",
    ],
    relatedKnowledge: ["kw-text-classification", "kw-frequency"],
    researchTasks: ["task-readability", "task-exercise-gen", "task-feedback", "task-behavior"],
    prerequisites: ["edunlp-003", "edunlp-004"],
    nextSkill: "能够理解文本分类的原理，识别教学研究中的分类问题并设计基本的分类方案",
    status: "planned",
  },
  {
    id: "edunlp-008",
    title: "情感分析与课堂反馈",
    description: "学习情感分析的基本方法及其在课堂反馈研究和学习态度分析中的应用",
    difficulty: "初级",
    estimatedMinutes: 12,
    whyLearn: "情感分析让你从数据中读懂'态度'——学生喜欢什么、不喜欢什么、对教学有什么感受。这些信息对教学改进有直接价值",
    learningObjectives: [
      "理解情感分析的基本概念",
      "认识情感分析在课堂反馈中的应用",
      "了解简单的情感分析方法",
    ],
    relatedKnowledge: ["kw-sentiment-analysis", "kw-text-classification"],
    researchTasks: ["task-feedback", "task-behavior"],
    prerequisites: ["edunlp-007"],
    nextSkill: "能够使用简单的情感分析方法处理课堂反馈文本",
    status: "planned",
  },
  {
    id: "edunlp-009",
    title: "偏误检测技术",
    description: "学习如何利用NLP技术自动识别学习者语言中的偏误",
    difficulty: "中级",
    estimatedMinutes: 18,
    whyLearn: "偏误分析是国际中文教育的核心研究方法。NLP辅助的偏误检测可以大幅提升分析效率——从逐篇人工标注到自动初筛加人工确认",
    learningObjectives: [
      "理解自动偏误检测的基本思路",
      "掌握基于规则和基于统计的偏误检测方法",
      "认识偏误检测在作文批改中的应用",
      "理解偏误检测的局限性",
    ],
    relatedKnowledge: ["kw-error-detection", "kw-pos-tagging", "kw-text-classification"],
    researchTasks: ["task-error-auto", "task-essay-grading", "task-large"],
    prerequisites: ["edunlp-004", "edunlp-007"],
    nextSkill: "能够设计简单的偏误检测方案，理解计算机辅助偏误分析的边界",
    status: "planned",
  },
  {
    id: "edunlp-010",
    title: "文本可读性分析",
    description: "学习如何自动评估中文文本的语言难度，服务于阅读材料分级和教材编写",
    difficulty: "初级",
    estimatedMinutes: 15,
    whyLearn: "可读性分析直接服务于教材编写和阅读材料选择——你知道HSK三级水平的学生适合读什么难度的文章吗？本课教你如何用数据回答这个问题",
    learningObjectives: [
      "理解可读性的概念和影响因素",
      "认识可读性公式的设计方法",
      "掌握可读性分析在教育研究中的应用",
      "了解可读性分析工具的基本使用",
    ],
    relatedKnowledge: ["kw-readability-analysis", "kw-text-classification", "kw-pos-tagging"],
    researchTasks: ["task-readability", "task-textbook", "task-hsk"],
    prerequisites: ["edunlp-004", "edunlp-007"],
    nextSkill: "能够使用可读性分析工具评估文本的语言难度，为教材编写提供数据参考",
    status: "planned",
  },

  // ─── 模块四：教育NLP综合应用（edunlp-011 ~ edunlp-013）───
  {
    id: "edunlp-011",
    title: "HSK文本分析实战",
    description: "综合运用分词、词性标注和可读性分析技术，系统分析HSK考试文本的语言特征",
    difficulty: "中级",
    estimatedMinutes: 18,
    whyLearn: "HSK文本分析是检验你NLP技能掌握程度的第一个综合项目。它将前面多课的技术串联起来，解决一个真实的语言学研究问题",
    learningObjectives: [
      "掌握HSK文本分析的完整流程",
      "综合运用分词、可读性分析等技术",
      "能够从多个维度评估HSK文本的语言难度",
      "形成结构化的分析报告",
    ],
    relatedKnowledge: ["kw-segmentation", "kw-pos-tagging", "kw-readability-analysis", "kw-frequency"],
    researchTasks: ["task-hsk", "task-readability"],
    prerequisites: ["edunlp-003", "edunlp-010"],
    nextSkill: "能够独立完成HSK文本的多维度语言特征分析",
    status: "planned",
  },
  {
    id: "edunlp-012",
    title: "教材词汇分析",
    description: "利用NLP技术分析教材中的词汇分布、复现规律和难度梯度",
    difficulty: "中级",
    estimatedMinutes: 15,
    whyLearn: "教材词汇分析解决的是一个真实的教学问题——'这套教材的词汇安排合理吗？'你将从定性评价升级到定量分析",
    learningObjectives: [
      "掌握教材词汇分析的完整流程",
      "理解词汇复现率和分布对教学的影响",
      "能够评估教材词汇与HSK等级的匹配度",
      "利用分析结果为教材编写提供建议",
    ],
    relatedKnowledge: ["kw-frequency", "kw-corpus", "kw-segmentation"],
    researchTasks: ["task-textbook", "task-hsk"],
    prerequisites: ["edunlp-003", "edunlp-010"],
    nextSkill: "能够独立完成教材词汇分布分析，评估教材与HSK等级的匹配度",
    status: "planned",
  },
  {
    id: "edunlp-013",
    title: "学习者作文自动分析",
    description: "综合运用偏误检测、词性标注和文本分类技术，对学习者作文进行多维度自动分析",
    difficulty: "中级",
    estimatedMinutes: 20,
    whyLearn: "本课是偏误检测技术、词性标注和文本分类的综合实战。你将完成一个接近真实研究场景的项目——从原始作文到多维分析报告",
    learningObjectives: [
      "掌握学习者作文自动分析的完整工作流",
      "综合运用偏误检测、词性标注等技术",
      "能够从多个维度评估学习者语言特征",
      "理解自动分析的局限性和人工复核的必要性",
    ],
    relatedKnowledge: ["kw-error-detection", "kw-learner-language", "kw-pos-tagging", "kw-frequency"],
    researchTasks: ["task-error-auto", "task-essay-grading", "task-large", "task-feature"],
    prerequisites: ["edunlp-009", "edunlp-006"],
    nextSkill: "能够设计并执行学习者作文的多维度自动分析方案",
    status: "planned",
  },

  // ─── 模块五：研究实战与总结（edunlp-014 ~ edunlp-015）───
  {
    id: "edunlp-014",
    title: "教育NLP研究设计",
    description: "学习如何将教育NLP技术融入研究设计，形成从问题到方法的完整研究框架",
    difficulty: "中级",
    estimatedMinutes: 15,
    whyLearn: "技术是手段不是目的。本课教你'如何用教育NLP做研究'——从提出研究问题到选择NLP方法到设计分析方案",
    learningObjectives: [
      "掌握教育NLP研究的设计方法",
      "能够将教育研究问题转化为NLP任务",
      "了解常见教育NLP研究论文的框架",
      "能够为自己的研究设计完整的分析方案",
    ],
    relatedKnowledge: ["kw-edunlp-workflow", "kw-automation", "kw-learner-language"],
    researchTasks: ["task-feature", "task-behavior", "task-visual"],
    prerequisites: ["edunlp-011", "edunlp-013"],
    nextSkill: "能够独立设计结合教育NLP技术的研究方案",
    status: "planned",
  },
  {
    id: "edunlp-015",
    title: "综合案例：从作文数据到研究报告",
    description: "通过完整的研究案例串联Phase 2全部知识，展示从原始语料到研究产出的全过程",
    difficulty: "中级",
    estimatedMinutes: 20,
    whyLearn: "本课是第二阶段的总集成——通过一个贯穿案例把15课的知识串联成一个完整的教育NLP研究项目",
    learningObjectives: [
      "体验教育NLP研究的完整流程",
      "综合运用Phase 2所学全部技术",
      "理解从研究问题到研究结论的转化过程",
      "形成可复用的教育NLP研究框架",
    ],
    relatedKnowledge: ["kw-edunlp-workflow", "kw-learner-language", "kw-visualization", "kw-automation"],
    researchTasks: ["task-large", "task-essay", "task-feedback", "task-visual"],
    prerequisites: ["edunlp-014"],
    nextSkill: "能够独立完成从研究设计到数据收集到分析到报告撰写的完整教育NLP研究",
    status: "planned",
  },
]

/** 课程依赖关系（用于可视化） */
export const dependencies: DependencyEdge[] = [
  { source: "edunlp-001", target: "edunlp-002", label: "基础" },
  { source: "edunlp-001", target: "edunlp-003", label: "基础" },
  { source: "edunlp-002", target: "edunlp-003", label: "工具基础" },
  { source: "edunlp-003", target: "edunlp-004", label: "前置" },
  { source: "edunlp-003", target: "edunlp-005", label: "前置" },
  { source: "edunlp-003", target: "edunlp-006", label: "前置" },
  { source: "edunlp-003", target: "edunlp-007", label: "前置" },
  { source: "edunlp-004", target: "edunlp-006", label: "前置" },
  { source: "edunlp-004", target: "edunlp-009", label: "前置" },
  { source: "edunlp-004", target: "edunlp-010", label: "前置" },
  { source: "edunlp-006", target: "edunlp-013", label: "前置" },
  { source: "edunlp-007", target: "edunlp-008", label: "前置" },
  { source: "edunlp-007", target: "edunlp-009", label: "前置" },
  { source: "edunlp-007", target: "edunlp-010", label: "前置" },
  { source: "edunlp-003", target: "edunlp-011", label: "前置" },
  { source: "edunlp-010", target: "edunlp-011", label: "前置" },
  { source: "edunlp-003", target: "edunlp-012", label: "前置" },
  { source: "edunlp-010", target: "edunlp-012", label: "前置" },
  { source: "edunlp-009", target: "edunlp-013", label: "前置" },
  { source: "edunlp-011", target: "edunlp-014", label: "前置" },
  { source: "edunlp-013", target: "edunlp-014", label: "前置" },
  { source: "edunlp-014", target: "edunlp-015", label: "前置" },
]

/** 按推荐顺序排列的课程ID列表 */
export const recommendedOrder: string[] = [
  "edunlp-001", "edunlp-002",
  "edunlp-003",
  "edunlp-004", "edunlp-005",
  "edunlp-006",
  "edunlp-007", "edunlp-008",
  "edunlp-009", "edunlp-010",
  "edunlp-011", "edunlp-012",
  "edunlp-013",
  "edunlp-014",
  "edunlp-015",
]

/** 模块划分 */
export const modules: { title: string; courseIds: string[]; description: string }[] = [
  {
    title: "NLP入门",
    courseIds: ["edunlp-001", "edunlp-002"],
    description: "建立NLP认知框架，了解工具生态",
  },
  {
    title: "核心NLP技术",
    courseIds: ["edunlp-003", "edunlp-004", "edunlp-005", "edunlp-006"],
    description: "掌握分词、词性标注、NER、句法分析等基础技术",
  },
  {
    title: "NLP教育应用方法",
    courseIds: ["edunlp-007", "edunlp-008", "edunlp-009", "edunlp-010"],
    description: "学习文本分类、情感分析、偏误检测、可读性分析",
  },
  {
    title: "教育NLP综合实战",
    courseIds: ["edunlp-011", "edunlp-012", "edunlp-013"],
    description: "HSK分析、教材分析、作文分析的完整项目实践",
  },
  {
    title: "研究实战与总结",
    courseIds: ["edunlp-014", "edunlp-015"],
    description: "研究设计方法论与综合案例",
  },
]

/** 知识点与课程映射（用于知识图谱扩展） */
export const knowledgeCourseMap: Record<string, string[]> = {
  "kw-segmentation": ["edunlp-003"],
  "kw-pos-tagging": ["edunlp-004"],
  "kw-ner": ["edunlp-005"],
  "kw-dependency-parsing": ["edunlp-006"],
  "kw-text-classification": ["edunlp-007"],
  "kw-sentiment-analysis": ["edunlp-008"],
  "kw-error-detection": ["edunlp-009"],
  "kw-readability-analysis": ["edunlp-010"],
  "kw-learner-language": ["edunlp-013"],
  "kw-edunlp-workflow": ["edunlp-014", "edunlp-015"],
}

/** 科研任务与课程映射 */
export const taskCourseMap: Record<string, string[]> = {
  "task-readability": ["edunlp-010", "edunlp-011"],
  "task-exercise-gen": ["edunlp-007"],
  "task-feedback": ["edunlp-005", "edunlp-008", "edunlp-015"],
  "task-behavior": ["edunlp-007", "edunlp-008", "edunlp-014"],
  "task-error-auto": ["edunlp-003", "edunlp-009", "edunlp-013"],
  "task-essay-grading": ["edunlp-004", "edunlp-009", "edunlp-013"],
}

/** 课程难度统计 */
export const statistics = {
  totalCourses: courses.length,
  byDifficulty: {
    "入门": courses.filter((c) => c.difficulty === "入门").length,
    "初级": courses.filter((c) => c.difficulty === "初级").length,
    "中级": courses.filter((c) => c.difficulty === "中级").length,
  },
  totalMinutes: courses.reduce((sum, c) => sum + c.estimatedMinutes, 0),
  totalKnowledge: Object.keys(knowledgeCourseMap).length,
  totalTasks: Object.keys(taskCourseMap).length,
}

/**
 * 第二阶段课程拓扑结构（依赖关系图文字版）：
 *
 * edunlp-001 (NLP是什么) ──→ edunlp-002 (NLP工具入门)
 *        │
 *        └──→ edunlp-003 (中文分词) ──┬──→ edunlp-004 (词性标注) ──→ edunlp-006 (分析流水线) ──→ edunlp-013 (作文自动分析)
 *                                      ├──→ edunlp-005 (命名实体识别)
 *                                      ├──→ edunlp-007 (文本分类) ──┬──→ edunlp-008 (情感分析)
 *                                      │                             ├──→ edunlp-009 (偏误检测) ──→ edunlp-013
 *                                      │                             └──→ edunlp-010 (可读性分析) ──┬──→ edunlp-011 (HSK分析) ──→ edunlp-014 (研究设计) ──→ edunlp-015 (综合案例)
 *                                      │                                                             └──→ edunlp-012 (教材分析)
 *                                      └──→ edunlp-011, edunlp-012
 *
 * 推荐学习顺序（拓扑排序）：
 * 001 → 002 → 003 → 004/005 → 006/007/008 → 009/010 → 011/012 → 013 → 014 → 015
 */
