# Review Analysis Agent

A standalone CLI tool that analyzes restaurant reviews to identify **the most discussed topics** and **the most negatively reviewed topics** using traditional NLP.

## How It Works

1. **Sentiment Analysis** — Each review is scored for polarity (negative ↔ positive) using [TextBlob](https://textblob.readthedocs.io/).
2. **Topic Extraction** — [Latent Dirichlet Allocation (LDA)](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.LatentDirichletAllocation.html) via scikit-learn discovers recurring themes across all reviews.
3. **Report Generation** — A Markdown report is produced showing topic rankings by volume and sentiment, plus the top negative reviews.

## Setup

```bash
cd review-agent

# Create a virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download TextBlob corpora (one-time)
python -m textblob.download_corpora
```

## Usage

```bash
# Analyze all restaurants in the sample data (prints to stdout)
python main.py

# Analyze a specific restaurant
python main.py -r "Bella Italia"

# Change the number of topics extracted
python main.py -t 3

# Write output to a file
python main.py -o report.md

# Use a custom reviews JSON file
python main.py -i path/to/reviews.json
```

### CLI Options

| Flag | Description | Default |
|---|---|---|
| `-i`, `--input` | Path to reviews JSON file | `data/sample_reviews.json` |
| `-r`, `--restaurant` | Filter to a specific restaurant | All restaurants |
| `-t`, `--topics` | Number of topics to extract | 5 |
| `-o`, `--output` | Output file path | stdout |

## Input Data Format

The input JSON should be an array of restaurant objects:

```json
[
  {
    "restaurant": "Restaurant Name",
    "reviews": [
      {
        "author": "Jane D.",
        "rating": 4,
        "text": "Great food and friendly staff!",
        "date": "2026-03-15"
      }
    ]
  }
]
```

## Extending with Google Places API

The data loading step in `main.py` is designed to be swappable. To fetch real reviews:

1. Create a `data/google_places.py` module with a `fetch_reviews(place_id, api_key)` function.
2. Add a `--source google` CLI flag that calls the fetcher instead of reading a JSON file.
3. The Google Places API returns up to 5 reviews per place. For more data, consider using [SerpAPI](https://serpapi.com/) which provides richer Google review results.

## Project Structure

```
review-agent/
├── main.py                  # CLI entry point
├── requirements.txt         # Python dependencies
├── data/
│   └── sample_reviews.json  # Mock review data
├── analysis/
│   ├── sentiment.py         # TextBlob sentiment scoring
│   └── topics.py            # LDA topic extraction
└── report/
    └── markdown.py          # Markdown report generator
```
