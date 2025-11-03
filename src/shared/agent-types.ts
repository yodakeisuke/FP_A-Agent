import type { UIMessage } from "ai"

export type AgentAceMeta = {
  playbookVersion: number
  source: "artifact" | "seed"
}

export type AgentMeta = {
  model: string
  usedLiveModel: boolean
  ace?: AgentAceMeta
}

export type AgentResult = {
  message: string
  meta: AgentMeta
}

export type AgentMessageMetadata = Partial<Pick<AgentResult, "meta">>

export type AgentDataParts = {
  meta: AgentMeta
}

export type AgentUIMessage = UIMessage<AgentMessageMetadata, AgentDataParts>
