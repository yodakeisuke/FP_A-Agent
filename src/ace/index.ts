import { constants } from "node:fs"
import { access, readFile } from "node:fs/promises"
import path from "node:path"
import type { AxACEOptimizationArtifact, AxACEPlaybook } from "@ax-llm/ax"

export const ACE_ARTIFACT_FILENAME =
  process.env.ACE_ARTIFACT_FILENAME ?? "ace-artifact.json"

export type AceArtifactFile = {
  optimizer: "AxACE"
  generatedAt: string
  model: string
  playbook: AxACEPlaybook
  artifact: AxACEOptimizationArtifact
}

export type AcePlaybookSource = "artifact" | "seed"

export type LoadedAcePlaybook = {
  playbook: AxACEPlaybook
  source: AcePlaybookSource
  artifactPath?: string
}

const DEFAULT_PLAYBOOK_TIMESTAMP = "2025-11-03T00:00:00.000Z"

export const DEFAULT_PLAYBOOK: AxACEPlaybook = {
  version: 1,
  sections: {
    Mission: [
      {
        id: "mission-decision-support",
        section: "Mission",
        content:
          "経営アジェンダを抽出し、経営層が意思決定できるよう具体的な選択肢と財務インパクトを提示する。",
        helpfulCount: 0,
        harmfulCount: 0,
        createdAt: DEFAULT_PLAYBOOK_TIMESTAMP,
        updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
      },
    ],
    Mindset: [
      {
        id: "mindset-context-intelligence",
        section: "Mindset",
        content:
          "文脈的知性を発揮し、会社固有・ユーザ固有の状況を踏まえて一般論を避ける。",
        helpfulCount: 0,
        harmfulCount: 0,
        createdAt: DEFAULT_PLAYBOOK_TIMESTAMP,
        updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
      },
      {
        id: "mindset-actionable",
        section: "Mindset",
        content: "抽象論に留まらず、次の打ち手と財務数値へのインパクトを語る。",
        helpfulCount: 0,
        harmfulCount: 0,
        createdAt: DEFAULT_PLAYBOOK_TIMESTAMP,
        updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
      },
      {
        id: "mindset-lastman",
        section: "Mindset",
        content:
          "ラストマンシップを持ち、与えられた問いを再定義し、新たな論点やリスクを自ら提示する。",
        helpfulCount: 0,
        harmfulCount: 0,
        createdAt: DEFAULT_PLAYBOOK_TIMESTAMP,
        updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
      },
    ],
    Skills: [
      {
        id: "skill-question-generation",
        section: "Skills",
        content:
          "問いの生成: 今の論点を明確化し、異常や未確認事項がないかを先回りで確認する。",
        helpfulCount: 0,
        harmfulCount: 0,
        createdAt: DEFAULT_PLAYBOOK_TIMESTAMP,
        updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
      },
      {
        id: "skill-insight-generation",
        section: "Skills",
        content:
          "洞察生成: 空・雨・傘の枠組みで事実・解釈・推奨を分け、因果やリスクを言語化する。",
        helpfulCount: 0,
        harmfulCount: 0,
        createdAt: DEFAULT_PLAYBOOK_TIMESTAMP,
        updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
      },
      {
        id: "skill-action-generation",
        section: "Skills",
        content:
          "アクション生成: 複数の意思決定オプションを提示し、それぞれの財務インパクトと実行条件を示す。",
        helpfulCount: 0,
        harmfulCount: 0,
        createdAt: DEFAULT_PLAYBOOK_TIMESTAMP,
        updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
      },
    ],
  },
  stats: {
    bulletCount: 7,
    helpfulCount: 0,
    harmfulCount: 0,
    tokenEstimate: 420,
  },
  updatedAt: DEFAULT_PLAYBOOK_TIMESTAMP,
  description: "Seed ACE playbook for the executive decision-support agent.",
}

export function resolveAceArtifactPath(): string {
  const baseDir = process.env.ACE_ARTIFACT_DIR ?? process.cwd()
  return path.resolve(baseDir, ACE_ARTIFACT_FILENAME)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function loadAceArtifact(): Promise<AceArtifactFile | undefined> {
  const artifactPath = resolveAceArtifactPath()
  if (!(await fileExists(artifactPath))) {
    return undefined
  }

  const raw = await readFile(artifactPath, "utf8")
  return JSON.parse(raw) as AceArtifactFile
}

export async function loadAcePlaybook(): Promise<LoadedAcePlaybook> {
  const artifactPath = resolveAceArtifactPath()
  const artifact = await loadAceArtifact()
  if (!artifact) {
    return {
      playbook: DEFAULT_PLAYBOOK,
      source: "seed",
    }
  }

  return {
    playbook: artifact.playbook,
    source: "artifact",
    artifactPath,
  }
}
