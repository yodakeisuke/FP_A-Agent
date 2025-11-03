import { writeFile } from "node:fs/promises"
import { AxACE, ai as axAi } from "@ax-llm/ax"
import { ACE_SEED_DATASET, aceMetric } from "./dataset.js"
import {
  type AceArtifactFile,
  loadAceArtifact,
  loadAcePlaybook,
  resolveAceArtifactPath,
} from "./index.js"
import { applyPlaybookToProgram, createAceAgentProgram } from "./program.js"

export type AceCompileConfig = {
  apiKey: string
  model: string
}

export async function compileAcePlaybook(
  config: AceCompileConfig,
): Promise<void> {
  const { apiKey, model } = config

  const { playbook: seedPlaybook, source } = await loadAcePlaybook()
  const artifact = await loadAceArtifact()

  console.info(
    `[ace:compile] starting with ${source === "artifact" ? "existing" : "seed"} playbook`,
  )

  const studentAI = axAi({
    name: "openai",
    apiKey,
  })
  studentAI.setOptions({ stream: false })

  const program = createAceAgentProgram()
  applyPlaybookToProgram(program, seedPlaybook)

  const ace = new AxACE({
    studentAI,
  })

  const start = Date.now()
  const result = await ace.compile(program, ACE_SEED_DATASET, aceMetric, {
    aceOptions: {
      initialPlaybook: seedPlaybook,
    },
  })
  const durationMs = Date.now() - start

  const artifactPath = resolveAceArtifactPath()
  const payload: AceArtifactFile = {
    optimizer: "AxACE",
    generatedAt: new Date().toISOString(),
    model,
    playbook: result.playbook,
    artifact: result.artifact,
  }

  await writeFile(artifactPath, JSON.stringify(payload, null, 2), "utf8")

  console.info(
    `[ace:compile] wrote playbook to ${artifactPath} in ${Math.round(durationMs)}ms`,
  )
  console.info(
    `[ace:compile] score=${result.bestScore?.toFixed?.(4) ?? "n/a"} previous_feedback=${
      artifact?.artifact.feedback.length ?? 0
    }`,
  )
}
