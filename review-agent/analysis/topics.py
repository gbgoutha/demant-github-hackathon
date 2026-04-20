import re
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import numpy as np

nltk.download("stopwords", quiet=True)

STOP_WORDS = set(stopwords.words("english"))
# Extra domain-specific stop words that don't carry topical meaning
STOP_WORDS.update(
    ["restaurant", "place", "food", "went", "got", "one", "would", "also", "really",
     "even", "much", "like", "get", "us", "go", "going", "come", "back", "ever",
     "could", "make", "made", "two", "came", "still", "never", "every"]
)


def preprocess(text):
    """Lowercase, strip punctuation, remove stop words."""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = [w for w in text.split() if w not in STOP_WORDS and len(w) > 2]
    return " ".join(tokens)


def extract_topics(reviews, n_topics=5, n_words=6):
    """Run LDA topic modelling on review texts.

    Returns (topics_dict, lda_model, vectorizer, doc_topic_matrix) where
    topics_dict maps topic_id -> {label, top_words}.
    """
    docs = [preprocess(r["text"]) for r in reviews]

    vectorizer = CountVectorizer(max_df=0.9, min_df=1, max_features=500)
    dtm = vectorizer.fit_transform(docs)
    feature_names = vectorizer.get_feature_names_out()

    lda = LatentDirichletAllocation(
        n_components=n_topics,
        random_state=42,
        max_iter=20,
        learning_method="batch",
    )
    doc_topic = lda.fit_transform(dtm)

    topics = {}
    for idx, component in enumerate(lda.components_):
        top_indices = component.argsort()[-n_words:][::-1]
        top_words = [feature_names[i] for i in top_indices]
        topics[idx] = {
            "label": top_words[0].title(),
            "top_words": top_words,
        }

    return topics, lda, vectorizer, doc_topic


def assign_reviews_to_topics(reviews, doc_topic):
    """Tag each review with its dominant topic id."""
    enriched = []
    for i, review in enumerate(reviews):
        dominant = int(np.argmax(doc_topic[i]))
        enriched.append({**review, "topic_id": dominant})
    return enriched
