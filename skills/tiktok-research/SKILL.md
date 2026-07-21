---
name: tiktok-research
description: |
  Research high-performing TikTok content from tracked accounts using Apify's TikTok Scraper.
  Identifies outlier videos, analyzes top 5 videos with AI, and generates reports with actionable hook formulas.

  Use when asked to:
  - Find trending TikTok content in a niche
  - Research what's performing on TikTok
  - Identify high-performing TikTok patterns
  - Analyze competitors' TikTok content
  - Generate content ideas from TikTok trends
  - Run TikTok research
  - Find viral TikToks
  - Analyze hooks and content structure

  Triggers: "tiktok research", "tt research", "find trending tiktoks", "analyze tiktok accounts",
  "what's working on tiktok", "content research tiktok", "tiktok analysis", "tiktok trends"
---

# TikTok Research

Research high-performing TikTok videos, identify outliers, and analyze top video content for hooks and structure.

## Prerequisites

- `APIFY_TOKEN` environment variable or in `.env`
- `GEMINI_API_KEY` environment variable or in `.env`
- `apify-client` and `google-genai` Python packages
- Accounts configured in `.claude/context/tiktok-accounts.md`

Verify setup:
```bash
python3 -c "
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from apify_client import ApifyClient
from google import genai
assert os.environ.get('APIFY_TOKEN'), 'APIFY_TOKEN not set'
assert os.environ.get('GEMINI_API_KEY'), 'GEMINI_API_KEY not set'
" && echo "Prerequisites OK"
```

## Accounts File

Create `.claude/context/tiktok-accounts.md` with a table of accounts to track:

```markdown
# TikTok Accounts

| Username | Notes |
|----------|-------|
| @nike | Reference brand |
| @somecreator | Niche competitor |
```

Or pass usernames directly on the command line with `--usernames`.

## Workflow

### 1. Create Run Folder

```bash
RUN_FOLDER="tiktok-research/$(date +%Y-%m-%d_%H%M%S)" && mkdir -p "$RUN_FOLDER" && echo "$RUN_FOLDER"
```

### 2. Fetch Content

```bash
python3 .claude/skills/tiktok-research/scripts/fetch_tiktok.py \
  --days 30 \
  --limit 50 \
  --output {RUN_FOLDER}/raw.json
```

Parameters:
- `--usernames`: Specific usernames to fetch (overrides accounts file)
- `--days`: Days back to search (default: 30)
- `--limit`: Max videos per account (default: 50)

Uses the `clockworks/tiktok-scraper` Apify actor. Raw TikTok fields
(`authorMeta`, `diggCount`, `playCount`, `webVideoUrl`, ...) are preserved so
the output feeds directly into the `video-content-analyzer` skill.

### 3. Identify Outliers

```bash
python3 .claude/skills/tiktok-research/scripts/analyze_posts.py \
  --input {RUN_FOLDER}/raw.json \
  --output {RUN_FOLDER}/outliers.json \
  --threshold 2.0
```

Output JSON contains:
- `total_posts`: Number of videos analyzed
- `outlier_count`: Number of outliers found
- `topics`: Top hashtags and keywords
- `accounts`: List of accounts analyzed
- `outliers`: Array of outlier videos with engagement metrics

### 4. Analyze Top Videos with AI

```bash
python3 .claude/skills/video-content-analyzer/scripts/analyze_videos.py \
  --input {RUN_FOLDER}/outliers.json \
  --output {RUN_FOLDER}/video-analysis.json \
  --platform tiktok \
  --max-videos 5
```

Extracts from each video:
- Hook technique and replicable formula
- Content structure and sections
- Retention techniques
- CTA strategy

See the `video-content-analyzer` skill for full output schema and hook/format types.

### 5. Generate Report

Read `{RUN_FOLDER}/outliers.json` and `{RUN_FOLDER}/video-analysis.json`, then generate `{RUN_FOLDER}/report.md`.

**Report Structure:**

```markdown
# TikTok Research Report

Generated: {date}

## Top Performing Hooks

Ranked by engagement. Use these formulas for your content.

### Hook 1: {technique} - @{username}
- **Opening**: "{opening_line}"
- **Why it works**: {attention_grab}
- **Replicable Formula**: {replicable_formula}
- **Engagement**: {likes} likes, {comments} comments, {plays} plays
- [Watch Video]({url})

[Repeat for each analyzed video]

## Content Structure Patterns

| Video | Format | Pacing | Key Retention Techniques |
|-------|--------|--------|--------------------------|
| @username | {format} | {pacing} | {techniques} |

## CTA Strategies

| Video | CTA Type | CTA Text | Placement |
|-------|----------|----------|-----------|
| @username | {type} | "{cta_text}" | {placement} |

## All Outliers

| Rank | Username | Likes | Comments | Shares | Plays | Engagement Rate |
|------|----------|-------|----------|--------|-------|-----------------|
[List all outliers with metrics and links]

## Trending Topics

### Top Hashtags
[From outliers.json topics.hashtags]

### Top Keywords
[From outliers.json topics.keywords]

## Actionable Takeaways

[Synthesize patterns into 4-6 specific recommendations]

## Accounts Analyzed
[List accounts]
```

Focus on actionable insights. The "Top Performing Hooks" section with replicable formulas should be prominent.

## Quick Reference

Full pipeline:
```bash
RUN_FOLDER="tiktok-research/$(date +%Y-%m-%d_%H%M%S)" && mkdir -p "$RUN_FOLDER" && \
python3 .claude/skills/tiktok-research/scripts/fetch_tiktok.py -o "$RUN_FOLDER/raw.json" && \
python3 .claude/skills/tiktok-research/scripts/analyze_posts.py -i "$RUN_FOLDER/raw.json" -o "$RUN_FOLDER/outliers.json" && \
python3 .claude/skills/video-content-analyzer/scripts/analyze_videos.py -i "$RUN_FOLDER/outliers.json" -o "$RUN_FOLDER/video-analysis.json" -p tiktok
```

Then read both JSON files and generate the report.

## Engagement Metrics

**Engagement Score**: `likes + (3 × comments) + (2 × shares) + (0.1 × plays)`

**Outlier Detection**: Videos with engagement rate > mean + (threshold × std_dev)

**Engagement Rate**: (score / followers) × 100
