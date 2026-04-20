import React from 'react';

export default function TopicsTable({ title, topics, highlightNegative }) {
  return (
    <div className="topics-table-wrap">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Keywords</th>
            <th># Reviews</th>
            <th>Avg Sentiment</th>
            <th>Avg Rating</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => {
            const sentClass =
              t.avg_sentiment < -0.1
                ? 'sent-neg'
                : t.avg_sentiment > 0.1
                ? 'sent-pos'
                : 'sent-neu';
            return (
              <tr key={t.id} className={highlightNegative ? sentClass : ''}>
                <td className="topic-label">{t.label}</td>
                <td className="keywords">{t.keywords.join(', ')}</td>
                <td>{t.review_count}</td>
                <td className={sentClass}>
                  {t.avg_sentiment > 0 ? '+' : ''}
                  {t.avg_sentiment.toFixed(3)}
                </td>
                <td>{t.avg_rating}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
