#!/usr/bin/env python3
"""
Fetch recent posts from Substack API and save to JSON.
Run locally after publishing a new post:
    python3 fetch_substack_posts.py && git add posts.json && git commit -m "Update posts" && git push
"""
import json
import os
import subprocess
import sys
from datetime import datetime

SUBSTACK_URL = "https://presentofcoding.substack.com"
API_URL = f"{SUBSTACK_URL}/api/v1/posts?limit=6"
OUTPUT_FILE = "posts.json"


def categorize_post(title):
    """Assign a category based on the post title"""
    title_lower = title.lower()
    if any(word in title_lower for word in ['llm', 'ai', 'gpt', 'machine learning', 'evaluation']):
        return "AI/ML"
    elif any(word in title_lower for word in ['government', 'federal', 'agency', 'trump', 'hiring']):
        return "Government Tech"
    elif any(word in title_lower for word in ['data', 'pipeline', 'engineering']):
        return "Data Engineering"
    elif any(word in title_lower for word in ['linkedin', 'career', 'job']):
        return "Career"
    elif 'fedscope' in title_lower:
        return "Data Analysis"
    return "Article"


def fetch_json():
    """Fetch JSON from Substack API using curl.

    Substack's Cloudflare blocks GitHub Actions runners, so in CI the request
    goes through the presentofcoding relay on Vercel (repos/presentofcoding-relay)
    when SUBSTACK_RELAY_URL and SUBSTACK_RELAY_TOKEN are set. Run locally with
    neither set, it fetches Substack directly, which works from home.
    """
    relay_url = os.environ.get("SUBSTACK_RELAY_URL")
    relay_token = os.environ.get("SUBSTACK_RELAY_TOKEN")
    if relay_url and relay_token:
        cmd = ["curl", "-sS", "-f", "--compressed", "-G", relay_url,
               "--data-urlencode", f"url={API_URL}",
               "-H", f"x-relay-token: {relay_token}"]
    else:
        cmd = ["curl", "-sS", "-f", "--compressed", API_URL]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        via = "relay" if relay_url and relay_token else "Substack directly"
        print(f"Fetch via {via} failed: {result.stderr.strip()}")
        return None
    return json.loads(result.stdout)


def main():
    print("Fetching recent Substack posts...")
    raw_posts = fetch_json()
    # Substack changed this endpoint from a bare list to {"posts": [...], "nextCursor": ...}
    if isinstance(raw_posts, dict):
        raw_posts = raw_posts.get("posts")

    if not raw_posts:
        print("Could not fetch posts (Substack may block datacenter IPs).")
        print("Run this script locally instead.")
        sys.exit(1)  # fail loudly so a blocked CI run shows up red, not as a silent stale page

    posts = []
    for post in raw_posts:
        date_obj = datetime.fromisoformat(post["post_date"].replace("Z", "+00:00"))
        formatted_date = date_obj.strftime("%B %-d")
        image_url = post.get("cover_image") or post.get("social_image", "")

        posts.append({
            "title": post["title"],
            "subtitle": post.get("subtitle", ""),
            "date": formatted_date,
            "url": post["canonical_url"],
            "image_url": image_url,
            "category": categorize_post(post["title"]),
        })
        print(f"  {post['title']} ({formatted_date})")

    # Don't rewrite the file (and trigger a deploy) just to bump last_updated.
    try:
        with open(OUTPUT_FILE) as f:
            if json.load(f).get("posts") == posts:
                print("\nNo new posts; leaving posts.json unchanged.")
                return
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    with open(OUTPUT_FILE, "w") as f:
        json.dump({
            "posts": posts,
            "last_updated": datetime.now().isoformat(),
            "source": SUBSTACK_URL,
        }, f, indent=2)
    print(f"\nSaved {len(posts)} posts to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
