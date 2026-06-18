"use client";

import {
  Zap,
  Expand,
  Shrink,
  GraduationCap,
  Briefcase,
  GitFork,
  BookOpen,
  MessageCircle,
  Target,
  FileText,
} from "lucide-react";

export interface ActionChip {
  label: string;
  prompt: string;
  icon: React.ElementType;
}

const TECH_ACTIONS: ActionChip[] = [
  {
    label: "压缩成 3 点",
    prompt:
      "请把上一个回答压缩成 3 个核心要点，适合 30 秒快速理解。",
    icon: Shrink,
  },
  {
    label: "展开详细版",
    prompt:
      "请基于上一个回答继续展开详细解释，包含原理、项目结合、易错点和面试表达。",
    icon: Expand,
  },
  {
    label: "面试标准回答",
    prompt:
      "请把上一个回答整理成面试标准回答，要求结构清晰、适合背诵，并结合我的项目经历。",
    icon: GraduationCap,
  },
  {
    label: "项目结合",
    prompt:
      "请结合真实后端项目场景，说明上一个知识点在实际项目中怎么用、怎么体现价值。",
    icon: Briefcase,
  },
  {
    label: "画流程图",
    prompt:
      "请把上一个回答整理成 Mermaid 流程图，并配一段简短解释。",
    icon: GitFork,
  },
  {
    label: "生成知识卡片",
    prompt:
      "请基于上一个回答生成一张 Knowledge Card，包含：一句话总结、核心原理、面试回答、常见追问、项目结合和掌握度评分。",
    icon: BookOpen,
  },
];

const INTERVIEW_ACTIONS: ActionChip[] = [
  {
    label: "继续追问",
    prompt: "请基于我的上一个回答继续追问，模拟面试官深入追问的场景。",
    icon: MessageCircle,
  },
  {
    label: "标准答案",
    prompt:
      "请给出上一个面试问题的标准答案，要求结构清晰、层次分明、适合背诵。",
    icon: GraduationCap,
  },
  {
    label: "背诵版",
    prompt:
      "请把上一个回答整理成精简背诵版，150 字以内，适合面试前快速复习。",
    icon: FileText,
  },
  {
    label: "找漏洞",
    prompt:
      "请分析我上一个回答中的漏洞和不足，指出面试官可能会追问的薄弱点。",
    icon: Target,
  },
  {
    label: "生成知识卡片",
    prompt:
      "请基于上一个回答生成一张 Knowledge Card，包含：一句话总结、核心原理、面试回答、常见追问、项目结合和掌握度评分。",
    icon: BookOpen,
  },
];

export function getActionChips(): ActionChip[] {
  // MVP: show tech actions by default.
  // Future: detect context from conversation to switch between tech/interview/project.
  return TECH_ACTIONS;
}

export function getInterviewChips(): ActionChip[] {
  return INTERVIEW_ACTIONS;
}

interface MessageActionsProps {
  chips: ActionChip[];
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export function MessageActions({
  chips,
  onAction,
  disabled,
}: MessageActionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => onAction(chip.prompt)}
          disabled={disabled}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-brand-50 hover:text-brand-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <chip.icon size={12} />
          {chip.label}
        </button>
      ))}
    </div>
  );
}
