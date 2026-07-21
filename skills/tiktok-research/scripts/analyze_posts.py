#!/usr/bin/env python3
"""
Identify outlier TikTok videos based on engagement metrics.
Outputs JSON with outliers and metadata for report generation.

Reads raw TikTok fields (diggCount, commentCount, playCount, shareCount,
authorMeta.fans) produced by fetch_tiktok.py. Outlier items keep their raw
fields so they can be passed straight to the video-content-analyzer skill.
"""

import json
import argparse
import statistics
from datetime import datetime
from pathlib import Path
from collections import Counter
import re


def load_posts(input_path: str) -> list[dict]:
    """Load videos from JSON file."""
    with open(input_path, 'r') as f:
        return json.load(f)


def calculate_engagement_score(post: dict) -> float:
    """
    Calculate weighted engagement score for a TikTok video.
    - Comments (3x): Active engagement
    - Likes (1x): Passive approval
    - Shares (2x): Strong signal of resonance
    - Plays (0.1x): Weighted lower due to auto-play
    """
    likes = post.get('diggCount', 0) or 0
    comments = post.get('commentCount', 0) or 0
    shares = post.get('shareCount', 0) or 0
    plays = post.get('playCount', 0) or 0
    return likes + (3 * comments) + (2 * shares) + (0.1 * plays)


def _follower_count(post: dict) -> int:
    """Extract follower count from authorMeta.fans (fall back to flat alias)."""
    author = post.get('authorMeta', {}) or {}
    return author.get('fans', 0) or post.get('ownerFollowersCount', 0) or 0


def calculate_engagement_rate(post: dict) -> float:
    """Calculate engagement rate relative to follower count."""
    followers = _follower_count(post)
    engagement = calculate_engagement_score(post)
    if followers == 0:
        return engagement
    return (engagement / followers) * 100


def _username(post: dict) -> str:
    author = post.get('authorMeta', {}) or {}
    return author.get('name', '') or post.get('ownerUsername', '')


def identify_outliers(posts: list[dict], threshold_multiplier: float = 2.0) -> list[dict]:
    """
    Identify outlier videos with engagement rate > mean + (threshold × std_dev).
    """
    if not posts:
        return []

    for post in posts:
        post['_engagement_score'] = calculate_engagement_score(post)
        post['_engagement_rate'] = calculate_engagement_rate(post)

    rates = [p['_engagement_rate'] for p in posts]
    if len(rates) < 2:
        return posts

    mean_rate = statistics.mean(rates)
    std_dev = statistics.stdev(rates) if len(rates) > 1 else 0
    threshold = mean_rate + (threshold_multiplier * std_dev)

    outliers = [p for p in posts if p['_engagement_rate'] > threshold]
    outliers.sort(key=lambda x: x['_engagement_score'], reverse=True)
    return outliers


def extract_topics(posts: list[dict]) -> dict:
    """Extract trending hashtags and keywords."""
    hashtags = Counter()
    keywords = Counter()

    stop_words = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
        'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
        'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
        'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but',
        'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
        'for', 'with', 'about', 'against', 'between', 'into', 'through',
        'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
        'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
        'then', 'once', 'here', 'there', 'your', 'my', 'his', 'her', 'its',
        'our', 'their', 'get', 'got', 'like', 'dont', 'im', 'ive', 'youre',
        'https', 'http', 'amp', 'link', 'bio', 'comment', 'follow', 'check',
        'fyp', 'foryou', 'foryoupage', 'viral', 'tiktok'
    }

    for post in posts:
        caption = post.get('text', '') or post.get('caption', '') or ''

        # Hashtags: TikTok scraper returns a list of {name, ...} objects
        post_hashtags = post.get('hashtags', []) or []
        for h in post_hashtags:
            if isinstance(h, dict):
                name = h.get('name', '')
            else:
                name = str(h)
            if name:
                hashtags.update([name.lower().lstrip('#')])
        hashtags.update(re.findall(r'#(\w+)', caption.lower()))

        # Keywords
        text_clean = re.sub(r'https?://\S+', '', caption)
        text_clean = re.sub(r'[@#]\w+', '', text_clean)
        text_words = re.findall(r'\b[a-zA-Z]{4,}\b', text_clean.lower())
        keywords.update([w for w in text_words if w not in stop_words])

    return {
        'hashtags': hashtags.most_common(20),
        'keywords': keywords.most_common(30)
    }


def main():
    parser = argparse.ArgumentParser(description='Identify TikTok outliers')
    parser.add_argument('--input', '-i', required=True, help='Input JSON file')
    parser.add_argument('--output', '-o', required=True, help='Output JSON file')
    parser.add_argument('--threshold', '-t', type=float, default=2.0,
                        help='Outlier threshold multiplier (default: 2.0)')

    args = parser.parse_args()

    print(f"Loading videos from: {args.input}")
    posts = load_posts(args.input)
    print(f"Loaded {len(posts)} videos")

    print(f"Identifying outliers (threshold: {args.threshold}x std dev)...")
    outliers = identify_outliers(posts, args.threshold)
    print(f"Found {len(outliers)} outlier videos")

    print("Extracting topics...")
    topics = extract_topics(posts)

    output = {
        'generated': datetime.now().isoformat(),
        'total_posts': len(posts),
        'outlier_count': len(outliers),
        'threshold': args.threshold,
        'topics': topics,
        'accounts': sorted(set(_username(p) for p in posts if _username(p))),
        'outliers': outliers
    }

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, 'w') as f:
        json.dump(output, f, indent=2, default=str)

    print(f"Outliers saved to: {args.output}")
    print(f"- {len(outliers)} outliers identified")
    if topics['hashtags']:
        print(f"- Top hashtag: #{topics['hashtags'][0][0]}")
    if topics['keywords']:
        print(f"- Top keyword: {topics['keywords'][0][0]}")


if __name__ == '__main__':
    main()
