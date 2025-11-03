import { NextResponse } from "next/server"
import { runAgent } from "@/agent/agent"

export const runtime = "nodejs"

type AgentBody = {
  message?: string
}

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as AgentBody
    const trimmed = message?.trim() ?? ""
    const result = await runAgent(trimmed)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Failed to execute agent:", error)
    return NextResponse.json(
      {
        error: "Agent execution failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
