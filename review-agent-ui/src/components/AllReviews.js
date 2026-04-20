import React, { useState } from 'react';

export default function AllReviews({ reviews }) {
  const [filter, setFilter] = useState('all');

  if (!reviews || reviews.length === 0) return null;

  const filtered =
    filter === 'all'
      ? reviews
      : reviews.filter((r) => r.sentiment_label === filter);

  return (
    <div className="all-reviews">
      <h3>All Reviews ({filtered.length})</h3>
      <div className="filter-bar">
        {['all', 'positive', 'neutral', 'negative'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-active' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="review-cards">
        {filtered.map((r, i) => (
          <div key={i} className={`review-card ${r.sentiment_label}`}>
            <div className="review-header">
              <span className="review-author">{r.author}</span>
              <span className="review-stars">
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </span>
              <span className="review-date">{r.date}</span>
            </div>
            <p className="review-text">{r.text}</p>
            <div className="review-footer">
              <span className="badge badge-topic">{r.topic}</span>
              <span className={`badge badge-${r.sentiment_label}`}>
                {r.sentiment_label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
