import { pathToFileURL } from "node:url"
import { config } from "dotenv"
import { compileAcePlaybook } from "../ace/compile"
import { getDefaultModel, getOpenAIKey } from "./openai"

config()

async function main(): Promise<void> {
  const apiKey = getOpenAIKey()
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to compile the ACE playbook.")
  }

  const model = getDefaultModel()

  await compileAcePlaybook({
    apiKey,
    model,
  })
}

const invokedDirectly =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url

if (invokedDirectly) {
  main().catch((error) => {
    console.error("[ace:orchestrator] failed:", error)
    process.exitCode = 1
  })
}
