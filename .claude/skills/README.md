# Claude Code Skills

Skills installed for this workspace. Claude Code auto-discovers every
`.claude/skills/<name>/SKILL.md` — no registration step needed. Each skill's
`SKILL.md` describes when it triggers and how to use it.

## Installed skills

### From `rednote-mind-skills`
| Skill | Purpose | Prerequisites |
|-------|---------|---------------|
| `github-kb` | Local repo knowledge base + hot-topic discovery (Xiaohongshu/小红书, Twitter/X, web) | `rednote-mind-mcp` MCP server (`npx -y rednote-mind-mcp`), `JINA_API_KEY` for Twitter, `gh` CLI, optional Tavily MCP. See `github-kb/references/setup.md`. |

### From `clickup-cli`
| Skill | Purpose | Prerequisites |
|-------|---------|---------------|
| `clickup` | Manage ClickUp tasks, sprints, comments, time tracking via the `cup` CLI | `npm install -g @krodak/clickup-cli` + `cup init --token pk_… --team TEAM_ID` (or `CU_API_TOKEN`/`CU_TEAM_ID` env vars). Note: this session also has native `mcp__ClickUp__*` tools. |

### From `awesome-claude-skills` (28 standalone skills)
Content & marketing (most relevant to Nomi Media):
`brand-guidelines`, `canvas-design`, `content-research-writer`,
`competitive-ads-extractor`, `twitter-algorithm-optimizer`, `image-enhancer`,
`video-downloader` (YouTube), `lead-research-assistant`, `internal-comms`,
`meeting-insights-analyzer`, `theme-factory`, `artifacts-builder`.

Productivity & utilities:
`changelog-generator`, `domain-name-brainstormer`, `file-organizer`,
`invoice-organizer`, `raffle-winner-picker`, `tailored-resume-generator`,
`slack-gif-creator`, `webapp-testing`.

Developer / meta:
`connect`, `connect-apps`, `developer-growth-analysis`, `langsmith-fetch`,
`mcp-builder`, `skill-creator`, `skill-share`, `template-skill` (starter scaffold).

## Not installed: Composio automation stubs

The `awesome-claude-skills` pack also contained **832** `*-automation`
Composio/Rube-MCP skill stubs (adobe, salesforce, hubspot, …). They are
near-identical boilerplate that all require the **Rube MCP** server
(`https://rube.app/mcp`) and per-app OAuth, so installing them wholesale would
add noise without working functionality. They were intentionally skipped.

If you want a curated subset wired up — e.g. Instagram, TikTok, YouTube,
Canva, Notion, Gmail, Google Drive — ask and I'll add just those.
