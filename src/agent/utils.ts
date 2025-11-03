export function log(
  scope: string,
  level: "info" | "warn" | "error",
  payload: unknown,
): void {
  const prefix = `[runAgent:${scope}]`
  if (level === "info") {
    console.info(prefix, payload)
  } else if (level === "warn") {
    console.warn(prefix, payload)
  } else {
    console.error(prefix, payload)
  }
}
