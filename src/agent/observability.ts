import { getLangWatchTracer } from "langwatch"
import { setupObservability } from "langwatch/observability/node"

const langwatchState: {
  initialized: boolean
  initializing: Promise<void>
} = {
  initialized: false,
  initializing: Promise.resolve(),
}

export async function ensureLangWatch(): Promise<void> {
  if (langwatchState.initialized) {
    return langwatchState.initializing
  }

  langwatchState.initializing = (async () => {
    if (!process.env.LANGWATCH_API_KEY) {
      langwatchState.initialized = true
      return
    }

    setupObservability({
      serviceName: process.env.LANGWATCH_SERVICE_NAME ?? "fp_a-agent",
    })

    langwatchState.initialized = true
  })()

  return langwatchState.initializing
}

export function getTracer(name: string) {
  return getLangWatchTracer(name)
}
