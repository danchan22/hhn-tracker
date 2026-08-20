'use client';

import React from 'react';
import { StarRatingPicker } from '../UI/StarRatingPicker';

interface HouseRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  ratingAuthor: string;
  setRatingAuthor: (author: string) => void;
  ratingHouse: string;
  setRatingHouse: (house: string) => void;
  overallRatingVal: number;
  setOverallRatingVal: (val: number) => void;
  scareRatingVal: number;
  setScareRatingVal: (val: number) => void;
  coolRatingVal: number;
  setCoolRatingVal: (val: number) => void;
  ratingSubmitting: boolean;
  familyMembers: string[];
  houses: string[];
}

export const HouseRatingModal: React.FC<HouseRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ratingAuthor,
  setRatingAuthor,
  ratingHouse,
  setRatingHouse,
  overallRatingVal,
  setOverallRatingVal,
  scareRatingVal,
  setScareRatingVal,
  coolRatingVal,
  setCoolRatingVal,
  ratingSubmitting,
  familyMembers,
  houses
}) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
      <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '2px solid #FDA30C', boxShadow: '0 10px 30px rgba(253, 163, 12, 0.3)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#FDA30C' }}>⭐ Rate a House</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
        </div>

        {/* WHO'S RATING */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>WHO'S RATING?</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {familyMembers.map((name) => {
              const isSelected = ratingAuthor === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setRatingAuthor(name)}
                  style={{
                    padding: '10px 2px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #FDA30C' : '1px solid #2A2A3C',
                    background: isSelected ? '#FDA30C' : '#1A1A26',
                    color: isSelected ? '#000' : '#CBD5E0',
                    fontSize: '12px',
                    fontWeight: isSelected ? '900' : '600',
                    cursor: 'pointer'
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* WHICH HOUSE */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>WHICH HOUSE?</label>
          <select
            value={ratingHouse}
            onChange={(e) => setRatingHouse(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '14px', fontWeight: 'bold' }}
          >
            {houses.map(house => (
              <option key={house} value={house}>{house}</option>
            ))}
          </select>
        </div>

        {/* STAR RATINGS */}
        <div style={{ background: '#1A1A26', padding: '14px', borderRadius: '16px', border: '1px solid #2A2A3C', marginBottom: '18px' }}>
          <StarRatingPicker label="⭐ Overall Rating" value={overallRatingVal} onChange={setOverallRatingVal} />
          <StarRatingPicker label="😱 How scary was it?" value={scareRatingVal} onChange={setScareRatingVal} />
          <StarRatingPicker label="😎 How cool was it?" value={coolRatingVal} onChange={setCoolRatingVal} />
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            Cancel
          </button>
          <button type="button" onClick={onSubmit} disabled={ratingSubmitting} style={{ flex: 2, padding: '12px', background: '#FDA30C', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}>
            {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>

      </div>
    </div>
  );
};
