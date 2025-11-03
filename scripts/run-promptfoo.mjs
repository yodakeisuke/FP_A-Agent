#!/usr/bin/env node
import { spawn } from "node:child_process"
import { mkdirSync } from "node:fs"
import { resolve } from "node:path"

const args = process.argv.slice(2)
const promptfooHome = resolve(process.env.PROMPTFOO_HOME ?? ".promptfoo-home")

mkdirSync(promptfooHome, { recursive: true })

process.env.PROMPTFOO_HOME = promptfooHome
process.env.HOME = promptfooHome
process.env.USERPROFILE = promptfooHome
process.env.PROMPTFOO_DISABLE_TELEMETRY = "1"

const child = spawn(
  process.platform === "win32" ? "promptfoo.cmd" : "promptfoo",
  ["eval", ...args],
  {
    stdio: "inherit",
    shell: false,
  },
)

child.on("exit", (code) => {
  process.exit(code ?? 0)
})
