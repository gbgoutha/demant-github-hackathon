import React from 'react';

export default function RestaurantSelector({
  restaurants,
  selected,
  onSelect,
  nTopics,
  onTopicsChange,
}) {
  return (
    <div className="selector-bar">
      <label>
        Restaurant
        <select value={selected} onChange={(e) => onSelect(e.target.value)}>
          {restaurants.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label>
        Topics
        <input
          type="number"
          min={2}
          max={15}
          value={nTopics}
          onChange={(e) => onTopicsChange(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
