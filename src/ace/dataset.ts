import type { AxMetricFn, AxTypedExample } from "@ax-llm/ax"

export type AceAgentExample = AxTypedExample<{
  userMessage: string
  requiredPhrases: string[]
  bannedPhrases?: string[]
  maxCharacters?: number
}>

export const ACE_SEED_DATASET: readonly AceAgentExample[] = [
  {
    userMessage:
      "私はSaaS企業のCFOです。直近Q3でARRが前年同期比12%増の一方、チャーンが5%→8%に悪化し、プロフェッショナルサービスの売上比率が22%から31%に上がりました。2025年Q4の営業利益率リバウンドを狙うため、どこに集中すべきか整理してください。",
    requiredPhrases: [
      "エグゼクティブアジェンダ",
      "問いと異常仮説",
      "Q1:",
      "Q2:",
      "異常:",
      "洞察（空・雨・傘）",
      "空:",
      "雨:",
      "傘:",
      "アクションオプション",
      "財務インパクト",
      "不足している情報",
      "コンテキスト",
    ],
    bannedPhrases: ["わかりません", "一般的には", "AIとして"],
    maxCharacters: 1100,
  },
  {
    userMessage:
      "当社は国内製造業向けサプライチェーンSaaSを提供していますが、主要顧客の1社が倒産し、運転資本が逼迫しています。CEOの私は銀行交渉と価格改定のどちらを優先すべきか判断したいです。手元にあるのは直近6か月のキャッシュフロー予測だけです。",
    requiredPhrases: [
      "エグゼクティブアジェンダ",
      "問いと異常仮説",
      "Q1:",
      "Q2:",
      "異常:",
      "洞察（空・雨・傘）",
      "空:",
      "雨:",
      "傘:",
      "アクションオプション",
      "財務インパクト",
      "不足している情報",
      "コンテキスト",
    ],
    bannedPhrases: ["わかりません", "一般的には", "AIとして"],
    maxCharacters: 1100,
  },
  {
    userMessage:
      "新規市場参入を計画するPEファンドの投資担当です。対象企業は地方ドラッグストアチェーンで、粗利率が昨年から3.8pt下がり、人件費が15%上昇しています。経営陣が打ち手を迷っているので、論点とアクションを整理してください。",
    requiredPhrases: [
      "エグゼクティブアジェンダ",
      "問いと異常仮説",
      "Q1:",
      "Q2:",
      "異常:",
      "洞察（空・雨・傘）",
      "空:",
      "雨:",
      "傘:",
      "アクションオプション",
      "財務インパクト",
      "不足している情報",
      "コンテキスト",
    ],
    bannedPhrases: ["わかりません", "一般的には", "AIとして"],
    maxCharacters: 1100,
  },
] as const

export const aceMetric: AxMetricFn = ({ prediction, example }) => {
  const reply =
    typeof prediction === "object" &&
    prediction !== null &&
    "agentReply" in prediction
      ? String((prediction as { agentReply?: string }).agentReply ?? "").trim()
      : ""

  if (!reply) {
    return 0
  }

  const normalizedReply = reply.toLowerCase()
  const required = Array.isArray(example.requiredPhrases)
    ? example.requiredPhrases
    : []
  const banned = Array.isArray(example.bannedPhrases)
    ? example.bannedPhrases
    : []
  const maxChars =
    typeof example.maxCharacters === "number" && example.maxCharacters > 0
      ? example.maxCharacters
      : undefined

  const requiredScore =
    required.length === 0
      ? 1
      : required.filter((phrase) =>
          normalizedReply.includes(phrase.toLowerCase()),
        ).length / required.length

  const bannedScore =
    banned.length === 0
      ? 1
      : banned.some((phrase) => normalizedReply.includes(phrase.toLowerCase()))
        ? 0
        : 1

  const lengthScore =
    maxChars === undefined
      ? 1
      : reply.length <= maxChars
        ? 1
        : Math.max(0, 1 - (reply.length - maxChars) / maxChars)

  const score = requiredScore * 0.6 + bannedScore * 0.25 + lengthScore * 0.15

  return Math.max(0, Math.min(1, Number(score.toFixed(4))))
}
