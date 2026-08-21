'use client';

import React from 'react';

interface StarRatingPickerProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

export const StarRatingPicker: React.FC<StarRatingPickerProps> = ({ value, onChange, label }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: '800', color: '#CBD5E0' }}>{label}</label>
        <span style={{ fontSize: '14px', fontWeight: '900', color: '#FDA30C', background: '#12121A', padding: '4px 10px', borderRadius: '8px', border: '1px solid #2A2A3C' }}>
          ⭐ {value.toFixed(1)} / 5.0
        </span>
      </div>

      <input
        type="range"
        min="0.5"
        max="5.0"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#FDA30C',
          height: '8px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      />
    </div>
  );
};
