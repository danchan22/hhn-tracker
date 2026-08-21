'use client';

import React, { useState } from 'react';
import { StarRatingPicker } from '../UI/StarRatingPicker';

interface HouseRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
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
  const [ratingSuccess, setRatingSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onSubmit();
    setRatingSuccess(true);
    setTimeout(() => {
      setRatingSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
      <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '420px', width: '100%', border: '2px solid #FDA30C', boxShadow: '0 10px 30px rgba(253, 163, 12, 0.3)' }}>
        
        {ratingSuccess ? (
          /* SUCCESS ANIMATION OVERLAY */
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>🎃</div>
            <h3 style={{ color: '#22C55E', fontSize: '20px', fontWeight: '900', margin: 0 }}>Rating Saved!</h3>
            <p style={{ color: '#A0AEC0', fontSize: '13px', marginTop: '6px' }}>Your review has been logged.</p>
          </div>
        ) : (
          /* RATING FORM */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#FDA30C' }}>⭐ Rate a House</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>YOUR NAME</label>
              <select value={ratingAuthor} onChange={(e) => setRatingAuthor(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px', fontWeight: 'bold' }}>
                {familyMembers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>SELECT HOUSE</label>
              <select value={ratingHouse} onChange={(e) => setRatingHouse(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px', fontWeight: 'bold' }}>
                {houses.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <StarRatingPicker label="⭐ Overall Rating" value={overallRatingVal} onChange={setOverallRatingVal} />
            <StarRatingPicker label="😱 Scare Factor" value={scareRatingVal} onChange={setScareRatingVal} />
            <StarRatingPicker label="😎 How was the vibe?" value={coolRatingVal} onChange={setCoolRatingVal} />

            <button onClick={handleSubmit} disabled={ratingSubmitting} style={{ width: '100%', padding: '12px', background: '#FDA30C', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
              {ratingSubmitting ? 'Saving...' : 'Submit Rating'}
            </button>
          </>
        )}

      </div>
    </div>
  );
};
