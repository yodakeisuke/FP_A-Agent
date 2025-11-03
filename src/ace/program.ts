import type { AxACEPlaybook, AxGen } from "@ax-llm/ax"
import { ax } from "@ax-llm/ax"

export const BASE_INSTRUCTION = [
  "You are an executive decision-support partner for corporate leadership built on Agentic Context Engineering (ACE).",
  "Default to Japanese unless the user explicitly switches languages.",
  "Fuse the company's unique context with the user's role before responding, surfacing management agendas, probing questions, grounded insights, and financially explicit action options.",
  "Respond using the following Japanese section template and fill every section with decisive, context-aware content:\n◆ エグゼクティブアジェンダ\n- 企業固有のアジェンダを3行以内で具体化\n◆ 問いと異常仮説\n- Q1: 意思決定者が直ちに検証すべき問い\n- 異常: データや兆候から想定される異常を明示\n◆ 洞察（空・雨・傘）\n- 空: 観測された事実とコンテキスト\n- 雨: その意味合い・影響の解釈\n- 傘: 提案する対応策の理由付け\n◆ アクションオプション\n1. 選択肢A — 財務インパクト: 数値または方向性\n2. 選択肢B — 財務インパクト: 数値または方向性\n◆ 不足している情報\n- 不足があれば明記し、なければ「現時点で追加情報なし」と記す。",
  "Always diagnose missing information, quantify or directionalise financial impact, and, when the user's ask is narrow, reframe or extend it to ensure leadership-grade decision support.",
].join("\n")

export function createAceAgentProgram(): AxGen<
  { userMessage: string },
  { agentReply: string }
> {
  const program = ax("userMessage:string -> agentReply:string") as AxGen<
    { userMessage: string },
    { agentReply: string }
  >
  program.setDescription(BASE_INSTRUCTION)
  return program
}

export function applyPlaybookToProgram(
  program: AxGen<{ userMessage: string }, { agentReply: string }>,
  playbook?: AxACEPlaybook,
): void {
  const sections: string[] = [BASE_INSTRUCTION]
  if (playbook) {
    sections.push(renderPlaybook(playbook))
  }

  program.setDescription(sections.join("\n\n"))
}

export function renderPlaybook(playbook: AxACEPlaybook): string {
  const sectionBlocks = Object.entries(playbook.sections)
    .map(([section, bullets]) => {
      const bulletText = bullets
        .map((bullet) => `- ${bullet.content}`)
        .join("\n")
      return `### ${section}\n${bulletText}`
    })
    .join("\n\n")

  return [
    `ACE Playbook v${playbook.version}`,
    sectionBlocks,
    `最終更新: ${playbook.updatedAt}`,
  ]
    .filter(Boolean)
    .join("\n\n")
}
