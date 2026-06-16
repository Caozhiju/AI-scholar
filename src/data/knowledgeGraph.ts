import { stages } from "./courses"

export interface SkillNode {
  id: string
  label: string
  description: string
}

export interface KnowledgeNode {
  id: string
  label: string
  description: string
  prerequisites?: string[]
}

export interface ResearchTaskNode {
  id: string
  label: string
  description: string
}

export const skills: SkillNode[] = [
  { id: "skill-python", label: "Python基础", description: "Python编程的基本概念和操作能力，包括文件读写、基础语法和脚本编写" },
  { id: "skill-text", label: "文本处理", description: "对语言文本进行读取、清洗、分词和预处理的能力" },
  { id: "skill-data", label: "数据分析", description: "对语言数据进行分析、统计、可视化和自动化的能力" },
  { id: "skill-nlp", label: "NLP基础", description: "自然语言处理的核心概念和方法，包括分词、词性标注、句法分析等基础技术" },
  { id: "skill-edunlp", label: "教育NLP", description: "将NLP技术应用于国际中文教育的实践能力，包括偏误检测、可读性分析、学习者语言分析等" },
  { id: "skill-llm", label: "大模型LLM", description: "理解和运用大语言模型（LLM）辅助国际中文教育研究和教学的能力，包括Prompt工程、RAG、Agent设计、LLM评测等" },
  { id: "skill-research", label: "研究创新", description: "独立设计和开展AI辅助语言学研究的能力，包括实验设计、数据分析、学术写作和创新实践" },
]

export const knowledge: KnowledgeNode[] = [
  // Phase 1
  { id: "kw-file", label: "文件读取", description: "使用Python读取TXT、CSV、Word等不同格式的文本文件，是语料处理的第一步" },
  { id: "kw-cleaning", label: "文本清洗", description: "对原始语料进行格式统一、噪声去除和编码修正，为后续分析准备干净数据", prerequisites: ["kw-file"] },
  { id: "kw-csv", label: "CSV文件", description: "一种通用的表格数据格式，语言学研究中常用于存储词频表、标注结果和统计数据", prerequisites: ["kw-file"] },
  { id: "kw-corpus", label: "语料库", description: "按照一定原则收集和组织的语言文本集合，是语言学研究的基础资源", prerequisites: ["kw-file"] },
  { id: "kw-token", label: "分词", description: "将连续的文本切分为独立的词语单元，中文信息处理的基础步骤", prerequisites: ["kw-cleaning"] },
  { id: "kw-frequency", label: "词频统计", description: "统计词语在文本中出现的次数和频率，是最基础的语言学定量分析方法", prerequisites: ["kw-cleaning", "kw-token"] },
  { id: "kw-cooccurrence", label: "共现分析", description: "分析词语在文本中共同出现的模式和关联强度，用于发现语言搭配规律", prerequisites: ["kw-frequency"] },
  { id: "kw-visualization", label: "数据可视化", description: "将分析结果以图表形式呈现，帮助研究者直观发现语言数据中的模式和趋势", prerequisites: ["kw-csv", "kw-frequency"] },
  { id: "kw-automation", label: "科研自动化", description: "将重复性科研任务（如数据整理、批量分析、报告生成）交由程序自动完成", prerequisites: ["kw-cleaning", "kw-frequency"] },
  // Phase 2 - NLP基础
  { id: "kw-segmentation", label: "中文分词", description: "将连续的中文文本切分为有意义的词语序列，是所有中文NLP任务的第一步", prerequisites: ["kw-token"] },
  { id: "kw-pos-tagging", label: "词性标注", description: "为文本中的每个词标注其语法类别（名词、动词、形容词等），是句法分析的基础", prerequisites: ["kw-segmentation"] },
  { id: "kw-ner", label: "命名实体识别", description: "识别文本中的人名、地名、机构名等专有名词，用于信息抽取和文本理解", prerequisites: ["kw-segmentation"] },
  { id: "kw-dependency-parsing", label: "依存句法", description: "分析句子中词语之间的依存关系，揭示句法结构和语义角色", prerequisites: ["kw-pos-tagging"] },
  { id: "kw-text-classification", label: "文本分类", description: "将文本自动归入预定义的类别，是情感分析、偏误检测等任务的基础方法", prerequisites: ["kw-frequency", "kw-segmentation"] },
  // Phase 2 - 教育NLP
  { id: "kw-sentiment-analysis", label: "情感分析", description: "自动判断文本表达的情感倾向（正面、负面、中性），用于课堂反馈和学习态度分析", prerequisites: ["kw-text-classification"] },
  { id: "kw-error-detection", label: "偏误检测", description: "自动识别学习者文本中的语言偏误，是智能作文批改的核心技术", prerequisites: ["kw-pos-tagging", "kw-text-classification"] },
  { id: "kw-readability-analysis", label: "可读性分析", description: "自动评估文本的语言难度等级，用于阅读材料分级和教材难度控制", prerequisites: ["kw-text-classification", "kw-pos-tagging"] },
  { id: "kw-learner-language", label: "学习者语言分析", description: "综合运用NLP技术分析学习者的语言特征和发展模式，是中介语研究的计算方法", prerequisites: ["kw-error-detection", "kw-readability-analysis"] },
  { id: "kw-edunlp-workflow", label: "教育NLP研究流程", description: "将教育NLP各环节串联为完整的研究工作流，从研究设计到结果输出的一体化方法", prerequisites: ["kw-learner-language", "kw-automation"] },
  // Phase 3 - LLM
  { id: "kw-llm-transformer", label: "Transformer", description: "大语言模型的核心架构，基于自注意力机制的神经网络结构，是GPT、BERT等模型的基础", prerequisites: [] },
  { id: "kw-llm-attention", label: "注意力机制", description: "模型动态关注输入序列中不同位置信息的机制，与语言学中的注意概念有深刻联系", prerequisites: ["kw-llm-transformer"] },
  { id: "kw-llm-token", label: "Token", description: "LLM处理文本的基本单位，中文中一个Token通常对应一个字或词，理解Token概念是理解LLM输入输出的基础", prerequisites: [] },
  { id: "kw-llm-embedding", label: "Embedding", description: "将词语或Token映射为向量表示的技术，是LLM理解语言的基础", prerequisites: ["kw-llm-token"] },
  { id: "kw-llm-context-window", label: "Context Window", description: "LLM一次能处理的最大输入长度，决定了模型可以同时参考的信息量", prerequisites: ["kw-llm-attention"] },
  { id: "kw-llm-prompt", label: "Prompt", description: "用户输入给LLM的指令或问题，Prompt设计直接影响LLM输出的质量和相关性", prerequisites: ["kw-llm-token"] },
  { id: "kw-llm-fewshot", label: "Few-shot", description: "在Prompt中提供少量示例（通常2-5个）来引导LLM输出特定格式或风格的内容", prerequisites: ["kw-llm-prompt"] },
  { id: "kw-llm-cot", label: "Chain of Thought", description: "思维链技术，让LLM逐步展示推理过程以提升复杂任务的准确性", prerequisites: ["kw-llm-prompt"] },
  { id: "kw-llm-instruction", label: "Instruction", description: "LLM理解并执行人类指令的能力，指令遵循（Instruction Following）是LLM的核心能力之一", prerequisites: ["kw-llm-prompt"] },
  { id: "kw-llm-hallucination", label: "Hallucination", description: "LLM生成看似合理但实际不准确或虚构内容的現象，是教育应用中需要重点防范的问题", prerequisites: ["kw-llm-inference"] },
  { id: "kw-llm-rag", label: "RAG", description: "检索增强生成（Retrieval-Augmented Generation），让LLM在生成时参考外部知识库以提高准确性和可靠性", prerequisites: ["kw-llm-embedding", "kw-llm-prompt"] },
  { id: "kw-llm-vector-db", label: "Vector Database", description: "向量数据库，专门存储和检索向量表示的数据库，是RAG系统的核心基础设施", prerequisites: ["kw-llm-embedding"] },
  { id: "kw-llm-agent", label: "Agent", description: "能自主执行多步任务的AI系统，通过LLM进行推理决策、调用工具、管理记忆来完成任务", prerequisites: ["kw-llm-prompt", "kw-llm-rag"] },
  { id: "kw-llm-tool-use", label: "Tool Use", description: "LLM调用外部工具（API、数据库、搜索引擎等）的能力，是Agent系统的关键组成部分", prerequisites: ["kw-llm-agent"] },
  { id: "kw-llm-controlled-gen", label: "Controlled Generation", description: "通过Prompt设计、解码参数控制等手段，使LLM生成符合特定要求（词汇、句法、主题）的文本", prerequisites: ["kw-llm-prompt"] },
  { id: "kw-llm-output-control", label: "Output Control", description: "控制LLM输出的各项参数（温度、top-p、最大长度等）以及输出格式（JSON、结构化等）", prerequisites: ["kw-llm-prompt"] },
  { id: "kw-llm-evaluation", label: "Evaluation", description: "评估LLM性能的方法体系，包括自动指标（BLEU、ROUGE等）和人工评测方法", prerequisites: ["kw-llm-prompt", "kw-llm-controlled-gen"] },
  { id: "kw-llm-benchmark", label: "Benchmark", description: "标准评测数据集和任务，用于客观比较不同LLM的性能，如GLUE、SuperGLUE、C-Eval等", prerequisites: ["kw-llm-evaluation"] },
  { id: "kw-llm-alignment", label: "Alignment", description: "让LLM的行为符合人类期望和价值观的技术，包括安全性、无害性、偏见消除等", prerequisites: ["kw-llm-instruction"] },
  { id: "kw-llm-finetuning", label: "Fine-tuning", description: "在预训练模型基础上使用特定领域数据进一步训练，使其适应特定任务，如教育领域的微调", prerequisites: ["kw-llm-transformer"] },
  { id: "kw-llm-inference", label: "Inference", description: "LLM生成输出文本的过程，包括自回归解码、采样策略等，理解推理过程有助于优化LLM使用", prerequisites: ["kw-llm-transformer"] },
  { id: "kw-llm-text-generation", label: "Text Generation", description: "LLM生成自然语言文本的能力，是教育应用中HSK生成、作文反馈、出题等任务的基础", prerequisites: ["kw-llm-inference", "kw-llm-controlled-gen"] },
  // Phase 4 - 研究范式与方法论
  { id: "kw-phase4-paradigm", label: "研究范式", description: "AI时代教育研究的基本范式框架，包括实证研究、解释研究和设计研究的主要逻辑和适用条件" },
  { id: "kw-phase4-experiment-design", label: "实验设计", description: "计算语言学实验设计的方法论，包括假设构建、变量控制、对照组设计和评估方案" },
  { id: "kw-phase4-mixed-methods", label: "混合研究方法", description: "综合运用量化分析和质性分析的研究方法，在不同研究阶段灵活整合多种方法" },
  { id: "kw-phase4-reproducibility", label: "可复现研究", description: "确保研究结果可独立验证的方法和实践，包括代码开源、数据共享和实验环境管理" },
  // Phase 4 - 数据工程
  { id: "kw-phase4-corpus-construction", label: "语料库构建", description: "面向研究目的的专题语料库设计、采集和元数据标注方法" },
  { id: "kw-phase4-multimodal-data", label: "多模态数据", description: "多模态学习数据的类型、采集方法和标注策略" },
  { id: "kw-phase4-data-quality", label: "数据质量控制", description: "数据质量评估和标注一致性检验的核心方法和工具" },
  { id: "kw-phase4-ethics-privacy", label: "伦理与隐私", description: "教育研究中的伦理审查流程和隐私保护方法" },
  // Phase 4 - 高级NLP技术
  { id: "kw-phase4-cross-lingual", label: "跨语言NLP", description: "多语言NLP和跨语言迁移学习的核心技术和方法" },
  { id: "kw-phase4-speech-analysis", label: "口语分析", description: "基于语音数据的学习者口语产出分析技术" },
  { id: "kw-phase4-knowledge-graph", label: "教育知识图谱", description: "面向教育领域的知识图谱构建方法和应用场景" },
  { id: "kw-phase4-learning-analytics", label: "学习分析", description: "基于学习者行为数据的学习者建模和时序分析方法" },
  // Phase 4 - LLM研究
  { id: "kw-phase4-statistical-test", label: "统计检验", description: "LLM对比实验中的统计推断方法，包括假设检验、效应量和多重比较" },
  { id: "kw-phase4-ablation-study", label: "消融研究", description: "通过系统性移除组件来验证研究贡献的核心实验方法" },
  { id: "kw-phase4-human-ai-collab", label: "人机协作", description: "人类教师与AI系统协作完成任务的效果评估和实验设计" },
  { id: "kw-phase4-longitudinal-study", label: "纵向研究", description: "跨时间维度的长期追踪研究设计和数据分析方法" },
  // Phase 4 - 学术写作
  { id: "kw-phase4-literature-review", label: "文献综述", description: "系统性文献检索、筛选和综述的科学方法" },
  { id: "kw-phase4-academic-writing", label: "学术写作", description: "AI辅助学术论文写作的方法论和规范" },
  { id: "kw-phase4-paper-structure", label: "论文结构", description: "实证研究论文的标准结构设计（IMRaD）和写作技巧" },
  { id: "kw-phase4-publication", label: "期刊发表", description: "国际期刊选刊策略、投稿流程和同行评审应对" },
  // Phase 4 - 创新实践
  { id: "kw-phase4-curriculum-design", label: "课程设计", description: "AI技术系统融入课程设计的框架和方法" },
  { id: "kw-phase4-adaptive-assessment", label: "自适应测评", description: "自适应测试理论和智能诊断系统的设计方法" },
  { id: "kw-phase4-intelligent-resource", label: "智能资源", description: "智能教材和智能知识库的设计理念和构建技术" },
  { id: "kw-phase4-frontier-research", label: "前沿方向", description: "AI与语言学交叉研究的前沿动态和学术路径规划" },
]

export const researchTasks: ResearchTaskNode[] = [
  // Phase 1
  { id: "task-hsk", label: "HSK词汇分析", description: "分析文本的HSK词汇覆盖率、难度等级分布和词汇梯度" },
  { id: "task-essay", label: "学习者作文分析", description: "分析留学生作文的语言特征，包括偏误类型、词汇丰富度和句法复杂度" },
  { id: "task-textbook", label: "教材词汇分析", description: "分析教材文本的词汇分布、难度梯度和教学适用性" },
  { id: "task-feature", label: "学习者语言特征分析", description: "通过共现和搭配分析，揭示学习者的语言使用模式和中介语特征" },
  { id: "task-visual", label: "论文结果展示", description: "将研究数据以专业图表形式呈现，提升论文的可读性和说服力" },
  { id: "task-large", label: "大规模作文分析", description: "自动化处理数千篇作文的词频、偏误和语言特征分析" },
  // Phase 2
  { id: "task-readability", label: "阅读材料分级", description: "基于可读性分析对阅读材料进行难度分级，服务于教材编写和课程设计" },
  { id: "task-exercise-gen", label: "自动出题", description: "基于文本内容自动生成词汇练习、语法练习和阅读理解题" },
  { id: "task-feedback", label: "课堂反馈分析", description: "分析学生的课堂反馈文本，提取教学改进方向和常见问题" },
  { id: "task-behavior", label: "学习行为分析", description: "分析学习者的作业提交、错误模式和进步轨迹，为个性化教学提供数据支撑" },
  { id: "task-error-auto", label: "自动偏误检测", description: "自动识别学习者文本中的语法偏误、词汇偏误和语用偏误" },
  { id: "task-essay-grading", label: "作文自动评分", description: "基于NLP技术对学习者作文进行多维度自动评分和反馈" },
  // Phase 3
  { id: "task-llm-hsk-gen", label: "HSK文本生成", description: "使用LLM生成符合HSK等级标准的阅读文本，实现词汇、句法和话题的精准控制" },
  { id: "task-llm-essay-feedback", label: "作文反馈", description: "基于LLM为学习者作文提供多维度反馈，包括偏误识别、内容评价和改进建议" },
  { id: "task-llm-question-gen", label: "自动出题", description: "使用LLM自动生成词汇、语法、阅读等各类教学题目" },
  { id: "task-llm-reading-gen", label: "阅读材料生成", description: "使用LLM为不同水平学习者生成分级阅读材料" },
  { id: "task-llm-qa-system", label: "教学问答系统", description: "基于LLM和RAG构建面向中文学习者的智能问答系统" },
  { id: "task-llm-knowledge-base", label: "教材知识库", description: "构建面向国际中文教育的结构化教材知识库" },
  { id: "task-llm-classroom-assistant", label: "课堂助手", description: "设计基于LLM的课堂助手，辅助教师完成教学任务" },
  { id: "task-llm-path-recommend", label: "学习路径推荐", description: "基于LLM分析学习者的语言水平和发展需求，推荐个性化学习路径" },
  { id: "task-llm-assessment", label: "智能测评", description: "使用LLM进行学习者语言能力的智能评估和水平诊断" },
  { id: "task-llm-agent-design", label: "教学Agent设计", description: "设计面向国际中文教育的智能教学Agent，实现个性化辅导" },
  { id: "task-llm-prompt-optimize", label: "Prompt优化", description: "针对教育场景优化Prompt设计，提升LLM输出质量和教学适用性" },
  { id: "task-llm-error-detection", label: "LLM偏误检测", description: "使用LLM自动识别学习者文本中的语法、词汇和语用偏误" },
  // Phase 4
  { id: "task-design-experiment", label: "AI教育对比实验设计", description: "设计包含对照组的LLM辅助教学实验，验证AI工具在教学中的效果" },
  { id: "task-build-corpus", label: "构建专题语料库", description: "根据研究需求设计和构建面向特定问题的中文教育语料库" },
  { id: "task-ethics-submission", label: "伦理审查申请", description: "撰写教育研究的伦理审查申请和数据保护方案" },
  { id: "task-cross-lingual-study", label: "跨语言迁移实验", description: "设计面向不同语言背景学习者的NLP对比实验" },
  { id: "task-speech-error-analysis", label: "口语偏误分析", description: "使用语音技术分析学习者的口语偏误和流利度" },
  { id: "task-knowledge-graph-study", label: "教育知识图谱研究", description: "构建和评估面向国际中文教育的领域知识图谱" },
  { id: "task-ablation-experiment", label: "消融实验", description: "设计LLM系统的消融研究，验证各组件的独立贡献" },
  { id: "task-human-ai-comparison", label: "人机效果对比", description: "设计和执行严格的人机教学效果对比实验" },
  { id: "task-longitudinal-tracking", label: "学习者长期追踪", description: "设计跨学期或学年的AI工具使用效果纵向追踪研究" },
  { id: "task-literature-review", label: "系统文献综述", description: "使用系统性方法对AI教育特定主题进行文献综述" },
  { id: "task-ai-writing-practice", label: "AI辅助写作实践", description: "在AI辅助下完成实证研究论文的写作和修改" },
  { id: "task-paper-submission", label: "模拟论文投稿", description: "完成从选刊到投稿的全流程模拟操作" },
  { id: "task-curriculum-innovation", label: "AI融合课程设计", description: "设计AI技术系统融入国际中文教育的课程方案" },
  { id: "task-adaptive-test-design", label: "自适应测试设计", description: "设计面向学习者能力诊断的自适应测试方案" },
  { id: "task-intelligent-textbook", label: "智能教材原型", description: "设计并开发智能教材原型系统" },
  { id: "task-research-proposal", label: "研究计划书撰写", description: "完成一份有学术价值和研究可行性的硕士论文计划书" },
]

export const skillToKnowledge: Record<string, string[]> = {
  "skill-python": ["kw-file", "kw-csv", "kw-automation"],
  "skill-text": ["kw-corpus", "kw-token", "kw-cleaning", "kw-frequency", "kw-cooccurrence"],
  "skill-data": ["kw-frequency", "kw-cooccurrence", "kw-visualization", "kw-automation"],
  "skill-nlp": ["kw-segmentation", "kw-pos-tagging", "kw-ner", "kw-dependency-parsing", "kw-text-classification"],
  "skill-edunlp": ["kw-sentiment-analysis", "kw-error-detection", "kw-readability-analysis", "kw-learner-language", "kw-edunlp-workflow"],
  "skill-llm": [
    "kw-llm-transformer", "kw-llm-attention", "kw-llm-token", "kw-llm-embedding",
    "kw-llm-context-window", "kw-llm-prompt", "kw-llm-fewshot", "kw-llm-cot",
    "kw-llm-instruction", "kw-llm-hallucination", "kw-llm-rag", "kw-llm-vector-db",
    "kw-llm-agent", "kw-llm-tool-use", "kw-llm-controlled-gen", "kw-llm-output-control",
    "kw-llm-evaluation", "kw-llm-benchmark", "kw-llm-alignment", "kw-llm-finetuning",
    "kw-llm-inference", "kw-llm-text-generation",
  ],
  "skill-research": [
    "kw-phase4-paradigm", "kw-phase4-experiment-design", "kw-phase4-mixed-methods", "kw-phase4-reproducibility",
    "kw-phase4-corpus-construction", "kw-phase4-multimodal-data", "kw-phase4-data-quality", "kw-phase4-ethics-privacy",
    "kw-phase4-cross-lingual", "kw-phase4-speech-analysis", "kw-phase4-knowledge-graph", "kw-phase4-learning-analytics",
    "kw-phase4-statistical-test", "kw-phase4-ablation-study", "kw-phase4-human-ai-collab", "kw-phase4-longitudinal-study",
    "kw-phase4-literature-review", "kw-phase4-academic-writing", "kw-phase4-paper-structure", "kw-phase4-publication",
    "kw-phase4-curriculum-design", "kw-phase4-adaptive-assessment", "kw-phase4-intelligent-resource", "kw-phase4-frontier-research",
  ],
}

export const knowledgeToTask: Record<string, string[]> = {
  // Phase 1
  "kw-file": ["task-hsk", "task-essay", "task-textbook", "task-large"],
  "kw-cleaning": ["task-hsk", "task-essay", "task-textbook", "task-large"],
  "kw-csv": ["task-hsk", "task-textbook"],
  "kw-corpus": ["task-hsk", "task-essay", "task-textbook"],
  "kw-token": ["task-hsk", "task-essay", "task-large"],
  "kw-frequency": ["task-hsk", "task-essay", "task-textbook", "task-large"],
  "kw-cooccurrence": ["task-hsk", "task-feature", "task-textbook"],
  "kw-visualization": ["task-essay", "task-visual", "task-large"],
  "kw-automation": ["task-essay", "task-large", "task-visual"],
  // Phase 2
  "kw-segmentation": ["task-essay", "task-large", "task-hsk", "task-error-auto"],
  "kw-pos-tagging": ["task-essay", "task-error-auto", "task-essay-grading"],
  "kw-ner": ["task-textbook", "task-feedback"],
  "kw-dependency-parsing": ["task-essay-grading", "task-error-auto"],
  "kw-text-classification": ["task-readability", "task-exercise-gen", "task-feedback", "task-behavior"],
  "kw-sentiment-analysis": ["task-feedback", "task-behavior"],
  "kw-error-detection": ["task-error-auto", "task-essay-grading", "task-large"],
  "kw-readability-analysis": ["task-readability", "task-textbook", "task-hsk"],
  "kw-learner-language": ["task-feature", "task-behavior", "task-essay-grading"],
  "kw-edunlp-workflow": ["task-large", "task-essay", "task-feedback", "task-visual"],
  // Phase 3
  "kw-llm-transformer": [],
  "kw-llm-attention": [],
  "kw-llm-token": ["task-llm-prompt-optimize"],
  "kw-llm-embedding": ["task-llm-knowledge-base", "task-llm-qa-system"],
  "kw-llm-context-window": ["task-llm-reading-gen"],
  "kw-llm-prompt": ["task-llm-prompt-optimize", "task-llm-qa-system"],
  "kw-llm-fewshot": ["task-llm-prompt-optimize", "task-llm-hsk-gen"],
  "kw-llm-cot": ["task-llm-prompt-optimize"],
  "kw-llm-instruction": ["task-llm-prompt-optimize", "task-llm-agent-design"],
  "kw-llm-hallucination": ["task-llm-essay-feedback", "task-llm-qa-system"],
  "kw-llm-rag": ["task-llm-knowledge-base", "task-llm-qa-system", "task-llm-classroom-assistant"],
  "kw-llm-vector-db": ["task-llm-knowledge-base"],
  "kw-llm-agent": ["task-llm-agent-design", "task-llm-classroom-assistant"],
  "kw-llm-tool-use": ["task-llm-agent-design", "task-llm-classroom-assistant"],
  "kw-llm-controlled-gen": ["task-llm-hsk-gen", "task-llm-reading-gen", "task-llm-question-gen"],
  "kw-llm-output-control": ["task-llm-hsk-gen", "task-llm-reading-gen"],
  "kw-llm-evaluation": ["task-llm-assessment"],
  "kw-llm-benchmark": ["task-llm-assessment"],
  "kw-llm-alignment": ["task-llm-agent-design"],
  "kw-llm-finetuning": [],
  "kw-llm-inference": [],
  "kw-llm-text-generation": ["task-llm-hsk-gen", "task-llm-essay-feedback", "task-llm-question-gen", "task-llm-reading-gen"],
  // Phase 4
  "kw-phase4-paradigm": ["task-design-experiment"],
  "kw-phase4-experiment-design": ["task-design-experiment", "task-ablation-experiment", "task-human-ai-comparison"],
  "kw-phase4-mixed-methods": ["task-design-experiment", "task-literature-review"],
  "kw-phase4-reproducibility": ["task-ethics-submission", "task-paper-submission"],
  "kw-phase4-corpus-construction": ["task-build-corpus"],
  "kw-phase4-multimodal-data": ["task-build-corpus", "task-speech-error-analysis"],
  "kw-phase4-data-quality": ["task-build-corpus"],
  "kw-phase4-ethics-privacy": ["task-ethics-submission"],
  "kw-phase4-cross-lingual": ["task-cross-lingual-study"],
  "kw-phase4-speech-analysis": ["task-speech-error-analysis"],
  "kw-phase4-knowledge-graph": ["task-knowledge-graph-study", "task-intelligent-textbook"],
  "kw-phase4-learning-analytics": [],
  "kw-phase4-statistical-test": ["task-ablation-experiment", "task-human-ai-comparison"],
  "kw-phase4-ablation-study": ["task-ablation-experiment"],
  "kw-phase4-human-ai-collab": ["task-human-ai-comparison", "task-curriculum-innovation"],
  "kw-phase4-longitudinal-study": ["task-longitudinal-tracking"],
  "kw-phase4-literature-review": ["task-literature-review", "task-research-proposal"],
  "kw-phase4-academic-writing": ["task-ai-writing-practice", "task-research-proposal"],
  "kw-phase4-paper-structure": ["task-ai-writing-practice", "task-paper-submission"],
  "kw-phase4-publication": ["task-paper-submission"],
  "kw-phase4-curriculum-design": ["task-curriculum-innovation"],
  "kw-phase4-adaptive-assessment": ["task-adaptive-test-design"],
  "kw-phase4-intelligent-resource": ["task-intelligent-textbook"],
  "kw-phase4-frontier-research": ["task-research-proposal"],
}

export function getRelatedSkills(knowledgeIds: string[]): SkillNode[] {
  const result: SkillNode[] = []
  const added = new Set<string>()
  for (const [skillId, kwIds] of Object.entries(skillToKnowledge)) {
    if (kwIds.some((id) => knowledgeIds.includes(id)) && !added.has(skillId)) {
      const skill = skills.find((s) => s.id === skillId)
      if (skill) { result.push(skill); added.add(skillId) }
    }
  }
  return result
}

export function getRelatedKnowledge(skillIds: string[]): KnowledgeNode[] {
  const kwIdSet = new Set<string>()
  for (const skillId of skillIds) {
    const ids = skillToKnowledge[skillId]
    if (ids) ids.forEach((id) => kwIdSet.add(id))
  }
  return knowledge.filter((k) => kwIdSet.has(k.id))
}

export function getRelatedTasks(knowledgeIds: string[]): ResearchTaskNode[] {
  const result: ResearchTaskNode[] = []
  const added = new Set<string>()
  for (const [kwId, taskIds] of Object.entries(knowledgeToTask)) {
    if (knowledgeIds.includes(kwId)) {
      for (const taskId of taskIds) {
        if (!added.has(taskId)) {
          const task = researchTasks.find((t) => t.id === taskId)
          if (task) { result.push(task); added.add(taskId) }
        }
      }
    }
  }
  return result
}

export function getLearningPath(knowledgeId: string): { prerequisites: KnowledgeNode[]; node: KnowledgeNode; nextNodes: KnowledgeNode[] } {
  const node = knowledge.find((k) => k.id === knowledgeId)
  if (!node) return { prerequisites: [], node: null as any, nextNodes: [] }

  const prereqNodes = (node.prerequisites || [])
    .map((id) => knowledge.find((k) => k.id === id))
    .filter(Boolean) as KnowledgeNode[]

  const nextNodes = knowledge.filter((k) => k.prerequisites?.includes(knowledgeId))

  return { prerequisites: prereqNodes, node, nextNodes }
}

export function getKnowledgeMastery(completedCourses: string[]) {
  const mastery: Record<string, "learned" | "unlearned"> = {}
  for (const k of knowledge) {
    const courses = getKnowledgeCourses(k.id)
    const isLearned = courses.some((title) => {
      const course = stages.flatMap((s) => s.courses).find((c) => c.title === title)
      return course && completedCourses.includes(course.id)
    })
    mastery[k.id] = isLearned ? "learned" : "unlearned"
  }
  return mastery
}

export function getNextRecommendedCourse(currentCourseId: string, completedCourses: string[]) {
  const currentCourse = stages.flatMap((s) => s.courses).find((c) => c.id === currentCourseId)
  if (!currentCourse) return null

  const currentKnowledge = currentCourse.relatedKnowledge || []
  const unlearned = knowledge.filter((k) => {
    if (!currentKnowledge.includes(k.id)) return false
    const courses = getKnowledgeCourses(k.id)
    return !courses.some((title) => {
      const c = stages.flatMap((s) => s.courses).find((co) => co.title === title)
      return c && completedCourses.includes(c.id)
    })
  })

  const allCourses = stages.flatMap((s) => s.courses).filter((c) => c.status === "published" && !completedCourses.includes(c.id))
  if (allCourses.length === 0) return null

  const scored = allCourses.map((c) => {
    const sharedKnowledge = (c.relatedKnowledge || []).filter((kId) => currentKnowledge.includes(kId)).length
    const isNextInPosition = c.position === currentCourse.position + 1 && c.id.startsWith(currentCourse.id.split("-")[0])
    return { course: c, score: sharedKnowledge * 2 + (isNextInPosition ? 3 : 0) }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].score > 0 ? scored[0].course : null
}

export function getKnowledgeCourses(knowledgeId: string) {
  return stages
    .flatMap((s) => s.courses)
    .filter((c) => c.relatedKnowledge?.includes(knowledgeId))
    .map((c) => c.title)
}

export function getCourseKnowledge(knowledgeIds: string[]) {
  const nodes = knowledge.filter((k) => knowledgeIds.includes(k.id))
  const relatedSkills = getRelatedSkills(knowledgeIds)
  const relatedTasks = getRelatedTasks(knowledgeIds)
  return { nodes, relatedSkills, relatedTasks }
}

export function getGraphLayout() {
  const allNodes: { id: string; label: string; group: "skill" | "knowledge" | "task" }[] = [
    ...skills.map((s) => ({ id: s.id, label: s.label, group: "skill" as const })),
    ...knowledge.map((k) => ({ id: k.id, label: k.label, group: "knowledge" as const })),
    ...researchTasks.map((t) => ({ id: t.id, label: t.label, group: "task" as const })),
  ]

  const allEdges: { source: string; target: string }[] = []
  for (const [skillId, kwIds] of Object.entries(skillToKnowledge)) {
    for (const kwId of kwIds) {
      allEdges.push({ source: skillId, target: kwId })
    }
  }
  for (const [kwId, taskIds] of Object.entries(knowledgeToTask)) {
    for (const taskId of taskIds) {
      allEdges.push({ source: kwId, target: taskId })
    }
  }

  return { nodes: allNodes, edges: allEdges }
}
