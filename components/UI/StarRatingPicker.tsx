'use client';

import React from 'react';

interface StarRatingPickerProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

export const StarRatingPicker: React.FC<StarRatingPickerProps> = ({ value, onChange, label }) => {
  const stars = [1, 2, 3, 4, 5];

  const handlePointerClick = (starIndex: number, event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isHalf = clickX < rect.width / 2;
    const finalVal = isHalf ? starIndex - 0.5 : starIndex;
    onChange(finalVal);
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: '800', color: '#CBD5E0' }}>{label}</label>
        <span style={{ fontSize: '13px', fontWeight: '900', color: '#FF9A56' }}>{value.toFixed(1)} / 5.0</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
        {stars.map((starIndex) => {
          let starSymbol = '☆';
          let starColor = '#4A5568';

          if (value >= starIndex) {
            starSymbol = '★';
            starColor = '#FDA30C';
          } else if (value >= starIndex - 0.5) {
            starSymbol = '½';
            starColor = '#FDA30C';
          }

          return (
            <div
              key={starIndex}
              onPointerDown={(e) => handlePointerClick(starIndex, e)}
              style={{
                fontSize: '26px',
                color: starColor,
                lineHeight: '1',
                padding: '4px',
                background: '#1A1A26',
                border: '1px solid #2A2A3C',
                borderRadius: '8px',
                flex: 1,
                textAlign: 'center',
                transition: 'all 0.1s ease'
              }}
            >
              {starSymbol}
            </div>
          );
        })}
      </div>
    </div>
  );
};
