#!/usr/bin/env python3
"""
Fetch TikTok videos from specified accounts using Apify's TikTok Scraper.
Requires APIFY_TOKEN environment variable (or in .env file).

Uses the `clockworks/tiktok-scraper` actor. Output items keep the raw TikTok
field names (authorMeta, diggCount, playCount, webVideoUrl, ...) so they can be
fed directly into the `video-content-analyzer` skill with `--platform tiktok`.
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# Load .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, rely on environment variables

try:
    from apify_client import ApifyClient
except ImportError:
    print("Error: apify-client not installed. Run: pip install apify-client")
    sys.exit(1)


def parse_accounts_file(accounts_path: str) -> list[str]:
    """Parse tiktok-accounts.md and extract usernames."""
    usernames = []
    with open(accounts_path, 'r') as f:
        in_table = False
        for line in f:
            line = line.strip()
            if line.startswith('| Username') or line.startswith('| Handle'):
                in_table = True
                continue
            if line.startswith('|---'):
                continue
            if in_table and line.startswith('|'):
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 2:
                    username = parts[1]
                    if username.startswith('@') and not username.startswith('@example'):
                        usernames.append(username.lstrip('@'))
    return usernames


def _normalize_item(item: dict) -> dict:
    """
    Add convenience fields without destroying the raw TikTok fields.

    - `ownerUsername`/`ownerFollowersCount`: flat aliases so downstream tooling
      that expects Instagram-style names still works.
    - `videoUrl`: a best-effort direct media URL for the video analyzer.
    """
    author = item.get('authorMeta', {}) or {}

    item.setdefault('ownerUsername', author.get('name', ''))
    item.setdefault('ownerFollowersCount', author.get('fans', 0) or 0)
    item.setdefault('ownerFullName', author.get('nickName', ''))

    if not item.get('videoUrl'):
        video_meta = item.get('videoMeta', {}) or {}
        media_urls = item.get('mediaUrls', []) or []
        item['videoUrl'] = (
            video_meta.get('downloadAddr')
            or (media_urls[0] if media_urls else '')
            or item.get('webVideoUrl', '')
        )
    return item


def fetch_tiktok(
    usernames: list[str],
    results_limit: int = 50,
    days_back: int = 30,
    output_path: str = None
) -> list[dict]:
    """
    Fetch TikTok videos from specified usernames using Apify's TikTok Scraper.

    Args:
        usernames: List of TikTok usernames (without @)
        results_limit: Maximum videos per account
        days_back: Filter to only include videos newer than this many days
        output_path: Optional path to save raw JSON output

    Returns:
        List of video objects with follower counts available via authorMeta.fans
    """
    token = os.environ.get('APIFY_TOKEN')
    if not token:
        print("Error: APIFY_TOKEN environment variable not set")
        sys.exit(1)

    client = ApifyClient(token)

    # Calculate date filter (clockworks/tiktok-scraper expects YYYY-MM-DD)
    oldest_post_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')

    print(f"Fetching videos from {len(usernames)} accounts...")
    print(f"Accounts: {', '.join(usernames)}")
    print(f"Results limit per account: {results_limit}")
    print(f"Videos newer than: {oldest_post_date}")

    run_input = {
        "profiles": usernames,
        "resultsPerPage": results_limit,
        "profileScrapeSections": ["videos"],
        "profileSorting": "latest",
        "excludePinnedPosts": False,
        "oldestPostDate": oldest_post_date,
        "shouldDownloadVideos": False,
        "shouldDownloadCovers": False,
        "shouldDownloadSubtitles": False,
        "shouldDownloadSlideshowImages": False,
    }

    # Run the Actor
    run = client.actor("clockworks/tiktok-scraper").call(run_input=run_input)

    items = []
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        # Skip actor error / info records that are not actual videos
        if item.get('error') or not (item.get('id') or item.get('webVideoUrl')):
            continue
        items.append(_normalize_item(item))

    print(f"Fetched {len(items)} videos total")

    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(items, f, indent=2, default=str)
        print(f"Saved raw data to: {output_path}")

    return items


def main():
    parser = argparse.ArgumentParser(description='Fetch TikTok videos from accounts')
    parser.add_argument('--accounts-file', '-a',
                        default='.claude/context/tiktok-accounts.md',
                        help='Path to accounts markdown file')
    parser.add_argument('--usernames', '-u', nargs='+',
                        help='Specific usernames to fetch (overrides accounts file)')
    parser.add_argument('--limit', '-l', type=int, default=50,
                        help='Max videos per account (default: 50)')
    parser.add_argument('--days', '-d', type=int, default=30,
                        help='Days back to search (default: 30)')
    parser.add_argument('--output', '-o',
                        help='Output path for raw JSON')

    args = parser.parse_args()

    if args.usernames:
        usernames = [u.lstrip('@') for u in args.usernames]
    else:
        if not os.path.exists(args.accounts_file):
            print(f"Error: Accounts file not found: {args.accounts_file}")
            sys.exit(1)
        usernames = parse_accounts_file(args.accounts_file)

    if not usernames:
        print("Error: No valid usernames found")
        sys.exit(1)

    print(f"Usernames to fetch: {', '.join(usernames)}")

    items = fetch_tiktok(
        usernames=usernames,
        results_limit=args.limit,
        days_back=args.days,
        output_path=args.output
    )

    if items:
        print(f"\nFetch complete. {len(items)} videos retrieved.")
        print("Use analyze_posts.py to identify outliers and generate report.")

    return items


if __name__ == '__main__':
    main()
