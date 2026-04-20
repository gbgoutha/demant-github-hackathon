import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import RestaurantSelector from './components/RestaurantSelector';
import Summary from './components/Summary';
import TopicsTable from './components/TopicsTable';
import NegativeReviews from './components/NegativeReviews';
import AllReviews from './components/AllReviews';
import { getRestaurants, getAnalysis } from './services/api';

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState('');
  const [nTopics, setNTopics] = useState(5);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurants()
      .then((res) => {
        setRestaurants(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      })
      .catch(() => setError('Failed to load restaurants'));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError('');
    getAnalysis(selected, nTopics)
      .then((res) => {
        setData(res.data[0]);
        setLoading(false);
      })
      .catch(() => {
        setError('Analysis failed');
        setLoading(false);
      });
  }, [selected, nTopics]);

  return (
    <>
      <Navbar />
      <div className="container">
        <RestaurantSelector
          restaurants={restaurants}
          selected={selected}
          onSelect={setSelected}
          nTopics={nTopics}
          onTopicsChange={setNTopics}
        />

        {loading && <div className="loading">Analyzing reviews…</div>}
        {error && <div className="error-msg">{error}</div>}

        {data && !loading && (
          <>
            <Summary summary={data.summary} restaurant={data.restaurant} />
            <div className="tables-row">
              <TopicsTable
                title="Most Discussed Topics"
                topics={data.topics_by_count}
              />
              <TopicsTable
                title="Most Negative Topics"
                topics={data.topics_by_negativity}
                highlightNegative
              />
            </div>
            <NegativeReviews reviews={data.top_negative_reviews} />
            <AllReviews reviews={data.all_reviews} />
          </>
        )}
      </div>
    </>
  );
}
