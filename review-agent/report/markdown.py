from collections import defaultdict
from tabulate import tabulate


def _topic_stats(reviews, topics):
    """Compute per-topic review count and average sentiment."""
    buckets = defaultdict(list)
    for r in reviews:
        buckets[r["topic_id"]].append(r)

    rows = []
    for tid in sorted(topics.keys()):
        members = buckets.get(tid, [])
        count = len(members)
        avg_sent = (
            sum(r["sentiment_score"] for r in members) / count if count else 0
        )
        avg_rating = (
            sum(r["rating"] for r in members) / count if count else 0
        )
        rows.append(
            {
                "topic_id": tid,
                "label": topics[tid]["label"],
                "keywords": ", ".join(topics[tid]["top_words"]),
                "count": count,
                "avg_sentiment": round(avg_sent, 3),
                "avg_rating": round(avg_rating, 1),
            }
        )
    return rows


def generate_report(restaurant, reviews, topics):
    """Produce a Markdown report string."""
    lines = []

    # --- Header ---
    lines.append(f"# Review Analysis: {restaurant}")
    lines.append("")

    # --- Summary ---
    total = len(reviews)
    avg_sent = sum(r["sentiment_score"] for r in reviews) / total if total else 0
    avg_rating = sum(r["rating"] for r in reviews) / total if total else 0
    neg_count = sum(1 for r in reviews if r["sentiment_label"] == "negative")
    pos_count = sum(1 for r in reviews if r["sentiment_label"] == "positive")
    neu_count = total - neg_count - pos_count

    lines.append("## Summary")
    lines.append("")
    lines.append(f"| Metric | Value |")
    lines.append(f"|---|---|")
    lines.append(f"| Total reviews | {total} |")
    lines.append(f"| Average star rating | {avg_rating:.1f} / 5 |")
    lines.append(f"| Average sentiment | {avg_sent:+.3f} |")
    lines.append(f"| Positive reviews | {pos_count} |")
    lines.append(f"| Neutral reviews | {neu_count} |")
    lines.append(f"| Negative reviews | {neg_count} |")
    lines.append("")

    # --- Topic stats ---
    stats = _topic_stats(reviews, topics)

    # Most discussed
    by_count = sorted(stats, key=lambda s: s["count"], reverse=True)
    lines.append("## Most Discussed Topics")
    lines.append("")
    table = [
        [s["label"], s["keywords"], s["count"], f'{s["avg_sentiment"]:+.3f}', s["avg_rating"]]
        for s in by_count
    ]
    lines.append(
        tabulate(
            table,
            headers=["Topic", "Keywords", "# Reviews", "Avg Sentiment", "Avg Rating"],
            tablefmt="github",
        )
    )
    lines.append("")

    # Most negative
    by_neg = sorted(stats, key=lambda s: s["avg_sentiment"])
    lines.append("## Most Negative Topics")
    lines.append("")
    table = [
        [s["label"], s["keywords"], s["count"], f'{s["avg_sentiment"]:+.3f}', s["avg_rating"]]
        for s in by_neg
    ]
    lines.append(
        tabulate(
            table,
            headers=["Topic", "Keywords", "# Reviews", "Avg Sentiment", "Avg Rating"],
            tablefmt="github",
        )
    )
    lines.append("")

    # --- Top negative reviews ---
    worst = sorted(reviews, key=lambda r: r["sentiment_score"])[:5]
    lines.append("## Top 5 Most Negative Reviews")
    lines.append("")
    for i, r in enumerate(worst, 1):
        topic_label = topics.get(r["topic_id"], {}).get("label", "N/A")
        snippet = r["text"][:120] + ("..." if len(r["text"]) > 120 else "")
        lines.append(f"**{i}. [{r['author']}] Rating: {r['rating']}/5 | "
                      f"Sentiment: {r['sentiment_score']:+.3f} | Topic: {topic_label}**")
        lines.append(f"> {snippet}")
        lines.append("")

    # --- Topic details ---
    lines.append("## Topic Details")
    lines.append("")
    for tid in sorted(topics.keys()):
        t = topics[tid]
        lines.append(f"### Topic {tid + 1}: {t['label']}")
        lines.append(f"**Keywords:** {', '.join(t['top_words'])}")
        lines.append("")
        members = [r for r in reviews if r["topic_id"] == tid]
        if members:
            sample = sorted(members, key=lambda r: r["sentiment_score"])[:3]
            for r in sample:
                snippet = r["text"][:150] + ("..." if len(r["text"]) > 150 else "")
                lines.append(f"- [{r['sentiment_label'].upper()}] ({r['rating']}★) {snippet}")
            lines.append("")

    return "\n".join(lines)
