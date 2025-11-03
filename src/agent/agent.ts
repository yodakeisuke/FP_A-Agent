import { ai as axAi } from "@ax-llm/ax"
import { type AcePlaybookSource, loadAcePlaybook } from "../ace/index"
import {
  applyPlaybookToProgram,
  createAceAgentProgram,
} from "../ace/program"
import type { AgentResult } from "../shared/agent-types"
import { ensureLangWatch, getTracer } from "./observability"
import { getDefaultModel, getOpenAIKey } from "./openai"
import { log } from "./utils"

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function summarizeUserMessage(input: string, maxLength = 160): string {
  const normalized = normalizeWhitespace(input)
  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1)}…`
}

function buildStructuredOfflineMessage(
  userMessage: string,
  reason: string,
): string {
  if (/\bgreet\b/i.test(userMessage) || /hello/i.test(userMessage)) {
    return `Hello! offline fallback mode: ${reason}`
  }

  const summary = summarizeUserMessage(userMessage, 140)
  const contextualSummary = summary
    ? `入力要約: ${summary}`
    : "入力要約: ユーザから意思決定支援リクエストを受領。"

  return [
    "エグゼクティブアジェンダ",
    `- ${contextualSummary}`,
    "問いと異常仮説",
    "Q1: オフライン環境でも即座に確認すべき意思決定ポイントは何か？",
    "Q2: 次の会議までに補強すべき証拠や数値は何か？",
    "異常: ライブAIに接続できず仮説検証が遅延するリスク。",
    "洞察（空・雨・傘）",
    `空: ${summary}`,
    "雨: オンライン推論が使えない状況でも意思決定を前進させる必要がある。",
    "傘: 既存データを再点検し、意思決定の前提を短期で見直す。",
    "アクションオプション",
    "1. 暫定プランA — 財務インパクト: オフライン分析で短期的な資金繰りを確保。",
    "2. 暫定プランB — 財務インパクト: シナリオプランニングで構造改革の準備を進める。",
    "不足している情報",
    "- オフライン動作のため、リアルタイム指標と外部ベンチマークを確認できません。",
    "コンテキスト",
    `- offline fallback mode: ${reason}`,
  ].join("\n")
}

function buildOfflineAgentResult(
  userMessage: string,
  reason: string,
): AgentResult {
  const message = buildStructuredOfflineMessage(userMessage, reason)
  return {
    message,
    meta: {
      model: "offline-fallback",
      usedLiveModel: false,
    },
  }
}

async function generateAceReply(
  apiKey: string,
  userMessage: string,
): Promise<{
  reply: string
  playbookVersion: number
  playbookSource: AcePlaybookSource
}> {
  const { playbook, source } = await loadAcePlaybook()

  const llm = axAi({
    name: "openai",
    apiKey,
  })

  const program = createAceAgentProgram()
  applyPlaybookToProgram(program, playbook)

  const generation = (await program.forward(
    llm,
    {
      userMessage,
    },
    {
      model: getDefaultModel(),
      stream: false,
    },
  )) as {
    agentReply?: string
  }

  const reply = String(generation.agentReply ?? "").trim()
  if (!reply) {
    throw new Error("ACE runtime returned an empty reply.")
  }

  return {
    reply,
    playbookVersion: playbook.version,
    playbookSource: source,
  }
}

export async function runAgent(userMessage: string): Promise<AgentResult> {
  log("entry", "info", { userMessage })
  await ensureLangWatch()
  const tracer = getTracer("minimal-agent")

  return tracer.withActiveSpan("run-agent", async (span) => {
    span.setType("workflow")
    span.setInput({ userMessage })

    const apiKey = getOpenAIKey()
    if (!apiKey) {
      const offline = buildOfflineAgentResult(
        userMessage,
        "OPENAI_API_KEY not configured",
      )
      span.setOutput(offline)
      log("offline", "warn", {
        reason: "missing-openai-api-key",
        userMessage,
      })
      return offline
    }

    try {
      const { reply, playbookVersion, playbookSource } = await generateAceReply(
        apiKey,
        userMessage,
      )

      const response: AgentResult = {
        message: reply,
        meta: {
          model: getDefaultModel(),
          usedLiveModel: true,
          ace: {
            playbookVersion,
            source: playbookSource,
          },
        },
      }

      span.setOutput(response)
      log("success", "info", {
        model: response.meta.model,
        usedLiveModel: response.meta.usedLiveModel,
        ace: response.meta.ace,
      })
      return response
    } catch (error) {
      span.recordException?.(error as Error)
      log("offline", "warn", {
        reason: "live-run-failed",
        error: error instanceof Error ? error.message : error,
      })
      const offline = buildOfflineAgentResult(
        userMessage,
        error instanceof Error ? error.message : "live run failed",
      )
      span.setOutput(offline)
      return offline
    }
  })
}
