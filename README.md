# Kriyagni

**Live demo:** _Add your Vercel URL here after deploy_

**Kriyagni** — AI-powered business intelligence research using the [BI Research Framework](https://github.com/maheshlahotiih/Kriyagni-AI-Business-Research-Framework).

Turn public business information into actionable intelligence through multi-source verification, entity disambiguation, temporal analysis, and confidence scoring.

## Try These Sample Queries

1. **Vendor assessment on Stripe** — full 70+ search pipeline with tier badges and confidence scoring
2. **Due diligence on Acme Corp** — natural-language entity extraction
3. **Find CEO home address** — compliance gate should block (no searches run)

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** + shadcn/ui
- **OpenRouter** (Claude Sonnet 4.5) — report synthesis
- **Tavily** — parallel web search (70–80 queries per research)

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add OPENROUTER_API_KEY and TAVILY_API_KEY
npm run dev
npm run verify:phase1   # query builder + compliance + tiers
npm run verify:phase2   # SSE + schema + entity parser
npm run verify:phase6   # smoke test checklist (offline)
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repo to GitHub (or connect your local folder via Vercel CLI).
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variables:

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai/) API key |
| `OPENROUTER_MODEL` | Model slug (default: `anthropic/claude-sonnet-4.5`) |
| `OPENROUTER_SITE_URL` | Production URL (e.g. `https://your-app.vercel.app`) |
| `TAVILY_API_KEY` | [Tavily](https://tavily.com/) search API key |

4. Deploy — the API route uses `maxDuration: 300` (requires Vercel Pro for 5-minute functions).
5. Update the **Live demo** link at the top of this README.

```bash
npx vercel --prod
```

## API — `POST /api/research`

Streams Server-Sent Events through search → LLM synthesis.

**Request body:**
```json
{
  "query": "Vendor assessment on Stripe",
  "objective": "vendor_assessment",
  "depth": "comprehensive",
  "timeWindowMonths": 12,
  "priorityAreas": ["financial", "legal"]
}
```

**SSE events:** `search_started`, `query_executing`, `query_complete`, `source_found`, `search_complete`, `synthesis_started`, `text_delta`, `followups`, `error`, `done`

**Test locally:**
```bash
curl -N -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"query":"Vendor assessment on Stripe","depth":"quick"}'
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | Model ID (default: `anthropic/claude-sonnet-4.5`) |
| `OPENROUTER_SITE_URL` | Site URL for OpenRouter rankings (optional) |
| `TAVILY_API_KEY` | Tavily search API key |

API keys are server-only — never exposed to the client bundle.

## Project Structure

```
app/                  # Pages and API routes
components/
  layout/             # Sidebar, SearchLayout
  search/             # SearchComposer, ObjectiveChips
  answer/             # StreamingAnswer, SourceCarousel, citations
  research/           # ResearchThread, export, error states
  ui/                 # shadcn primitives
lib/
  openrouter/         # OpenRouter streaming client
  search/             # Tavily, query builder, tier classifier
  prompts/            # BI framework prompts
  research/           # Orchestrator, compliance, session storage
  hooks/              # useResearchStream, useSearchHistory
```

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Done | Foundation — Next.js scaffold, design tokens, UI shell |
| 1 | Done | Backend — BI prompts, 70–80 query search pipeline |
| 2 | Done | API — SSE streaming, LLM synthesis |
| 3 | Done | UI MVP — end-to-end flow, first deploy |
| 4 | Done | Search visualization — live 70+ search UI |
| 5 | Done | Polish — citations, animations, mobile, export, history |
| 6 | Done | Deploy & QA — Vercel config, smoke tests, docs |

## Smoke Test Checklist

| Test | Expected |
|------|----------|
| `"Vendor assessment on Stripe"` | 70+ searches, streamed report, tiers/confidence |
| `"Due diligence on Acme Corp"` | Entity extraction from natural language |
| `"Find CEO home address"` | Compliance gate blocks, no searches |
| Mobile viewport | Layout intact, carousel scrolls |
| Follow-up chip click | New research thread starts |
| Export markdown | Downloads valid `.md` file |
| Deployed URL (incognito) | Works without local setup |

## Disclaimer

This tool is designed for lawful business intelligence activities using publicly available information only. Users are responsible for ensuring compliance with applicable laws and regulations.

## License

MIT
