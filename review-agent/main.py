#!/usr/bin/env python3
"""CLI entry point for the Google Reviews Analysis Agent."""

import argparse
import json
import os
import sys

from analysis.sentiment import analyze_reviews
from analysis.topics import extract_topics, assign_reviews_to_topics
from report.markdown import generate_report

DEFAULT_INPUT = os.path.join(os.path.dirname(__file__), "data", "sample_reviews.json")


def load_reviews(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def run(args):
    data = load_reviews(args.input)

    # Optionally filter by restaurant name
    if args.restaurant:
        data = [
            d for d in data
            if d["restaurant"].lower() == args.restaurant.lower()
        ]
        if not data:
            print(f"No restaurant found matching '{args.restaurant}'.", file=sys.stderr)
            sys.exit(1)

    for entry in data:
        restaurant = entry["restaurant"]
        reviews = entry["reviews"]

        if not reviews:
            print(f"No reviews found for '{restaurant}'.", file=sys.stderr)
            continue

        # Step 1: Sentiment analysis
        reviews = analyze_reviews(reviews)

        # Step 2: Topic extraction
        n_topics = min(args.topics, len(reviews))  # can't have more topics than docs
        topics, _lda, _vec, doc_topic = extract_topics(reviews, n_topics=n_topics)

        # Step 3: Assign topics to reviews
        reviews = assign_reviews_to_topics(reviews, doc_topic)

        # Step 4: Generate report
        report = generate_report(restaurant, reviews, topics)

        if args.output:
            mode = "a" if len(data) > 1 else "w"
            with open(args.output, mode, encoding="utf-8") as f:
                f.write(report)
                f.write("\n\n---\n\n")
            print(f"Report for '{restaurant}' written to {args.output}", file=sys.stderr)
        else:
            print(report)
            if len(data) > 1:
                print("\n---\n")


def main():
    parser = argparse.ArgumentParser(
        description="Analyze restaurant reviews: extract topics and identify the most negative / most discussed themes."
    )
    parser.add_argument(
        "-i", "--input",
        default=DEFAULT_INPUT,
        help="Path to a JSON file containing reviews (default: data/sample_reviews.json)",
    )
    parser.add_argument(
        "-r", "--restaurant",
        default=None,
        help="Filter analysis to a specific restaurant name",
    )
    parser.add_argument(
        "-t", "--topics",
        type=int,
        default=5,
        help="Number of topics to extract (default: 5)",
    )
    parser.add_argument(
        "-o", "--output",
        default=None,
        help="Write the Markdown report to this file (default: stdout)",
    )

    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
