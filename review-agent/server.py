"""FastAPI server that exposes review analysis as a REST API."""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json
import os

from analysis.sentiment import analyze_reviews
from analysis.topics import extract_topics, assign_reviews_to_topics

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "sample_reviews.json")

app = FastAPI(title="Review Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/restaurants")
def list_restaurants():
    """Return the list of available restaurant names."""
    data = _load_data()
    return [d["restaurant"] for d in data]


@app.get("/analyze")
def analyze(
    restaurant: str = Query(None, description="Filter to a specific restaurant"),
    n_topics: int = Query(5, ge=2, le=15, description="Number of topics to extract"),
):
    """Run sentiment + topic analysis and return structured results."""
    data = _load_data()

    if restaurant:
        data = [d for d in data if d["restaurant"].lower() == restaurant.lower()]
        if not data:
            return {"error": f"Restaurant '{restaurant}' not found"}

    results = []
    for entry in data:
        name = entry["restaurant"]
        reviews = entry["reviews"]

        # Sentiment
        reviews = analyze_reviews(reviews)

        # Topics
        actual_topics = min(n_topics, len(reviews))
        topics, _lda, _vec, doc_topic = extract_topics(reviews, n_topics=actual_topics)
        reviews = assign_reviews_to_topics(reviews, doc_topic)

        # Summary stats
        total = len(reviews)
        avg_sentiment = round(sum(r["sentiment_score"] for r in reviews) / total, 3) if total else 0
        avg_rating = round(sum(r["rating"] for r in reviews) / total, 1) if total else 0
        neg_count = sum(1 for r in reviews if r["sentiment_label"] == "negative")
        pos_count = sum(1 for r in reviews if r["sentiment_label"] == "positive")

        # Per-topic stats
        from collections import defaultdict
        buckets = defaultdict(list)
        for r in reviews:
            buckets[r["topic_id"]].append(r)

        topic_stats = []
        for tid in sorted(topics.keys()):
            members = buckets.get(tid, [])
            count = len(members)
            t_avg_sent = round(sum(r["sentiment_score"] for r in members) / count, 3) if count else 0
            t_avg_rat = round(sum(r["rating"] for r in members) / count, 1) if count else 0
            topic_stats.append({
                "id": tid,
                "label": topics[tid]["label"],
                "keywords": topics[tid]["top_words"],
                "review_count": count,
                "avg_sentiment": t_avg_sent,
                "avg_rating": t_avg_rat,
            })

        # Top negative reviews
        worst = sorted(reviews, key=lambda r: r["sentiment_score"])[:5]
        top_negative = [
            {
                "author": r["author"],
                "rating": r["rating"],
                "text": r["text"],
                "date": r["date"],
                "sentiment_score": r["sentiment_score"],
                "sentiment_label": r["sentiment_label"],
                "topic": topics.get(r["topic_id"], {}).get("label", "N/A"),
            }
            for r in worst
        ]

        results.append({
            "restaurant": name,
            "summary": {
                "total_reviews": total,
                "avg_rating": avg_rating,
                "avg_sentiment": avg_sentiment,
                "positive": pos_count,
                "neutral": total - pos_count - neg_count,
                "negative": neg_count,
            },
            "topics_by_count": sorted(topic_stats, key=lambda t: t["review_count"], reverse=True),
            "topics_by_negativity": sorted(topic_stats, key=lambda t: t["avg_sentiment"]),
            "top_negative_reviews": top_negative,
            "all_reviews": [
                {
                    "author": r["author"],
                    "rating": r["rating"],
                    "text": r["text"],
                    "date": r["date"],
                    "sentiment_score": r["sentiment_score"],
                    "sentiment_label": r["sentiment_label"],
                    "topic": topics.get(r["topic_id"], {}).get("label", "N/A"),
                }
                for r in reviews
            ],
        })

    return results
