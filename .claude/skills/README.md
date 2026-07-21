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

### Curated Composio automations (8 installed)
A focused, content-agency-relevant slice of the `*-automation` pack. **All of
these require the Rube MCP server** — add `https://rube.app/mcp` as an MCP
server in your client, then complete each app's OAuth via
`RUBE_MANAGE_CONNECTIONS`. Until Rube is connected they act as reference docs
only.

| Skill | Covers |
|-------|--------|
| `ayrshare-automation` ⭐ | Publish/schedule to **Instagram, TikTok, YouTube, Facebook, LinkedIn, X, Pinterest** + post analytics |
| `metaads-automation` | Facebook & Instagram ad campaigns, creatives, reporting |
| `googleads-automation` | Google Ads links, GA4 reports, account listing |
| `typefully-automation` | X/Twitter thread drafting & scheduling |
| `giphy-automation` | GIF search/insertion |
| `pexels-automation` | Free stock photos & video |
| `contentful-automation` | Headless CMS spaces & content |
| `adobe-automation` | Adobe toolkit operations |

## Why the apps you named aren't all here

- **Instagram / TikTok / YouTube** aren't standalone Composio stubs in this
  pack — `ayrshare-automation` above is the unified way to post to all of them.
- **Notion, Gmail, Google Drive, Google Calendar, Canva, ClickUp** already have
  **native MCP servers** in this workspace, which are better than Composio
  stubs, so those stubs were deliberately *not* installed.
- `canvas-automation` in the pack is **Canvas LMS**, not Canva — skipped.

## Not installed: the rest of the Composio pack

The `awesome-claude-skills` pack contained **832** `*-automation` stubs total.
The remaining ~824 are near-identical Rube-MCP boilerplate for apps a content
agency is unlikely to use; they were intentionally skipped. Ask for any
specific app by name and I'll add its stub.
