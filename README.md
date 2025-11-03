# Minimal AI Agent Scaffold

This project wires together the latest releases of Ax (DSPy), the Vercel AI SDK, LangWatch, Promptfoo, **React 19**, and **Next.js 16** to provide a "hello world" style foundation for experimentation. You get both a CLI agent and a minimal web UI.

## Prerequisites

- Node.js 18+ (tested with Node.js 22)
- npm

## Quick Start (Local)

```bash
npm install      # 一度だけ依存関係を取得
npm run dev      # http://localhost:3000 で Web UI を確認
```

CLI が必要な場合のみ:

```bash
npm run agent -- --json "Say hi to Kai."
```

## Frontend (Next.js)

```bash
npm run dev
```

Visit http://localhost:3000 to try the agent from the browser.  
The UI streams responses through `app/api/agent-chat/route.ts`, which reuses the shared `runAgent` implementation.

To create a production build:

```bash
npm run build
npm start
```

## CLI Agent

Execute the CLI workflow (used by Promptfoo and LangWatch examples) with:

```bash
npm run agent -- --json "Say hi to Kai."
```

## ACE Workflow

- `npm run ace:compile` – builds the CLI bundle and runs the minimal Ax ACE compiler against `src/ace/dataset.ts`, updating `ace-artifact.json` with the latest playbook.
- Runtime loads `ace-artifact.json` when present; otherwise it falls back to the seed playbook in `src/ace/index.ts`.
- Adjust the dataset or metric in `src/ace/dataset.ts` to steer future ACE refinements.

Useful variations:

```bash
npm run agent:build      # compile to dist/ without running
npm run agent:run        # run the already-built bundle
npm run agent:watch      # rebuild on changes
node dist/index.js --text "Reply in plain text only"
```

```bash
npm start
```

- `--json` (default) prints the Ax output as JSON, including the reply and runtime metadata (model, ACE info).
- `--text` prints only the LLM reply, which keeps CLI integrations such as Promptfoo focused on the natural language output.
- When no OpenAI key is configured, the agent returns a deterministic offline response so the tooling can still execute.
- If you only need the web UI, you can ignore the CLI entirely—no additional setup is required.

## Promptfoo Regression Suite

`promptfooconfig.yaml` runs the compiled CLI (`dist/index.js --text`) via Promptfoo's `exec:` provider. Running the default suite:

```bash
npm run promptfoo:eval
```

does the following:
- ビルド前処理 (`prepromptfoo:eval`) で CLI を再コンパイルし、最新の Playbook を評価対象にする。
- `scripts/run-promptfoo.mjs` が `promptfoo eval` をラップし、`.promptfoo-home/` 以下にキャッシュと結果を隔離、テレメトリも停止。

テストケースは ACE シードデータセットを反映しており、以下のフォーマット/禁止表現をチェックします。
- CFO, CEO, PE の各シナリオで `エグゼクティブアジェンダ` や `空・雨・傘` セクションが必ず含まれること。
- 「わかりません」「一般的には」「AIとして」といったフレーズが紛れ込まないこと。

追加のケースを試したい場合は `tests` 配列に `vars.input` と `assertions` を追記します。`promptfoo eval --watch` などのオプションを使いたいときは `--` 以降で指定できます。

```bash
npm run promptfoo:eval -- --watch
```

実行結果を UI で比較したい場合は、評価後に次のコマンドでローカルビューアを開きます。

```bash
npx promptfoo view
```

CI やレビューで結果を共有する際は `promptfoo eval --share` も利用できます（共有先 URL は Promptfoo 側の設定に依存します）。

## LangWatch Instrumentation

`src/index.ts` calls `setupObservability` and wraps each agent run inside a LangWatch span. When `LANGWATCH_API_KEY` is present, spans are sent to LangWatch; otherwise the instrumentation is a no-op. You can customize the tracer name by setting `LANGWATCH_SERVICE_NAME` or editing `getLangWatchTracer("minimal-agent")`.

## Project Layout

- `app/` – Next.js App Router frontend (pages, UI components, streaming API routes).
- `src/server/` – Backend agent implementation (`runAgent` and related orchestration).
- `src/shared/` – Types shared between frontend and backend (e.g., agent result metadata).
- `src/index.ts` – CLI entry point re-exporting the server agent for tooling.
- `promptfooconfig.yaml` – Minimal Promptfoo configuration targeting the compiled CLI through the `exec:` provider.
- `scripts/run-promptfoo.mjs` – Wrapper ensuring Promptfoo runs without global HOME access or telemetry.
- `.env.example` – Template for required/optional environment variables.

## Working With Latest Packages

Dependencies are installed with `@latest` and currently resolve to the versions captured in `package.json`. Re-run `npm install` to pick up newer releases once they are published.
