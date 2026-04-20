import React from 'react';

export default function NegativeReviews({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="negative-reviews">
      <h3>Top 5 Most Negative Reviews</h3>
      <div className="review-cards">
        {reviews.map((r, i) => (
          <div key={i} className="review-card negative">
            <div className="review-header">
              <span className="review-author">{r.author}</span>
              <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              <span className="review-date">{r.date}</span>
            </div>
            <p className="review-text">{r.text}</p>
            <div className="review-footer">
              <span className="badge badge-topic">{r.topic}</span>
              <span className="badge badge-sentiment">
                Sentiment: {r.sentiment_score > 0 ? '+' : ''}
                {r.sentiment_score.toFixed(3)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
