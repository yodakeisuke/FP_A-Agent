import { fileURLToPath } from "node:url"
import { config } from "dotenv"
import { runAgent } from "./agent/agent"

config()

export { runAgent }
export type { AgentResult } from "./shared/agent-types"

async function runFromCli() {
  const args = process.argv.slice(2)
  let mode: "json" | "text" = "json"
  const messageTokens: string[] = []

  for (const arg of args) {
    if (arg === "--json") {
      mode = "json"
      continue
    }

    if (arg === "--text") {
      mode = "text"
      continue
    }

    messageTokens.push(arg)
  }

  if (messageTokens.length >= 2) {
    const maybeContext = messageTokens[messageTokens.length - 1]
    const maybeConfig = messageTokens[messageTokens.length - 2]
    if (maybeContext?.startsWith("{") && maybeConfig?.startsWith("{")) {
      messageTokens.splice(-2)
    }
  }

  const userMessage = messageTokens.join(" ").trim() || "Hi there!"
  const result = await runAgent(userMessage)

  if (mode === "text") {
    console.log(result.message)
    return
  }

  console.log(JSON.stringify(result, null, 2))
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url)

if (isMainModule) {
  runFromCli().catch((error) => {
    console.error("Agent failed:", error)
    process.exitCode = 1
  })
}
