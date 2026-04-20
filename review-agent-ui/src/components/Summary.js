import React from 'react';

export default function Summary({ summary, restaurant }) {
  if (!summary) return null;

  const sentimentColor =
    summary.avg_sentiment > 0.1
      ? '#27ae60'
      : summary.avg_sentiment < -0.1
      ? '#e74c3c'
      : '#f39c12';

  return (
    <div className="summary-section">
      <h2>{restaurant}</h2>
      <div className="summary-cards">
        <div className="card">
          <div className="card-value">{summary.total_reviews}</div>
          <div className="card-label">Total Reviews</div>
        </div>
        <div className="card">
          <div className="card-value">{summary.avg_rating} / 5</div>
          <div className="card-label">Avg Rating</div>
        </div>
        <div className="card">
          <div className="card-value" style={{ color: sentimentColor }}>
            {summary.avg_sentiment > 0 ? '+' : ''}
            {summary.avg_sentiment}
          </div>
          <div className="card-label">Avg Sentiment</div>
        </div>
        <div className="card positive">
          <div className="card-value">{summary.positive}</div>
          <div className="card-label">Positive</div>
        </div>
        <div className="card neutral">
          <div className="card-value">{summary.neutral}</div>
          <div className="card-label">Neutral</div>
        </div>
        <div className="card negative">
          <div className="card-value">{summary.negative}</div>
          <div className="card-label">Negative</div>
        </div>
      </div>
    </div>
  );
}
