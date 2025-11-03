# Repository Guidelines

## Project Structure & Module Organization
The Next.js 16 App Router frontend lives in `app/` (components, hooks, streaming API routes). Agent orchestration is in `src/agent/`, domain rules in `src/domain/`, shared types in `src/shared/`, and tool adapters in `src/tools/`; the CLI entry sits at `src/index.ts`. TypeScript builds land in `dist/`, while automation assets such as `scripts/run-promptfoo.mjs`, `promptfooconfig.yaml`, and `biome.json` stay at the repository root.

## Build, Test, and Development Commands
- `npm install` – install or refresh dependencies.
- `npm run dev` – launch the web UI at `http://localhost:3000`.
- `npm run build && npm start` – produce and serve a production bundle.
- `npm run agent` – compile the CLI and run `dist/index.js`; append `-- --json` or `-- --text` to pick the output shape.
- `npm run agent:watch` – keep the CLI rebuilt during local development.
- `npm run promptfoo:eval` – rebuild and execute the Promptfoo regression suite.
- `npm run lint` – run Biome formatting and lint checks.

## Coding Style & Naming Conventions
TypeScript is the default; target Node.js 18+ and prefer modern ECMAScript constructs. Biome (`npm run lint`) enforces 2-space indentation, trailing commas, and import ordering—accept its autofixes. Name React components with PascalCase, hooks with `useCamelCase`, shared utilities in kebab-case filenames, and ACE artifacts with descriptive snake_case (e.g., `ace_artifact.json`).

## Testing Guidelines
Promptfoo is the regression harness. Extend the `tests` array in `promptfooconfig.yaml`, reusing fixtures from `src/ace/dataset.ts`, and run `npm run promptfoo:eval` (add `-- --watch` for fast loops) before opening a pull request. For manual smoke checks, run `npm run agent -- --text "Sanity check"` and confirm executive agenda and 空・雨・傘 sections persist; UI updates should also be exercised through `app/api/agent-chat/route.ts`.

## Commit & Pull Request Guidelines
History currently shows a single `init`, so set the tone with imperative, scope-prefixed subjects such as `feat(agent): add risk scoring` and keep them under 72 characters. Pull requests should summarize the change, list validation steps (lint, Promptfoo, manual CLI run), link relevant issues or experiments, and attach screenshots or CLI transcripts when output changes.

## Runtime Configuration & Observability
Copy `.env.example` to `.env.local` or export values in your shell. Provide `OPENAI_API_KEY` for live completions; offline mode still works without it. Set `LANGWATCH_API_KEY` (and optionally `LANGWATCH_SERVICE_NAME`) to enable tracing in `src/agent/observability.ts`. When iterating on ACE workflows, run `npm run ace:compile` to refresh `ace-artifact.json` before re-running the CLI.
