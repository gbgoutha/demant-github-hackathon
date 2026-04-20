from textblob import TextBlob


def score_review(text):
    """Return polarity score from -1.0 (most negative) to 1.0 (most positive)."""
    return TextBlob(text).sentiment.polarity


def classify_sentiment(score):
    """Map a polarity score to a human-readable label."""
    if score < -0.1:
        return "negative"
    elif score > 0.1:
        return "positive"
    return "neutral"


def analyze_reviews(reviews):
    """Enrich each review dict with sentiment_score and sentiment_label."""
    enriched = []
    for review in reviews:
        score = score_review(review["text"])
        enriched.append(
            {
                **review,
                "sentiment_score": round(score, 4),
                "sentiment_label": classify_sentiment(score),
            }
        )
    return enriched
