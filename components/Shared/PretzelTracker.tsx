'use client';

import React from 'react';

interface PretzelTrackerProps {
  regularPretzels: number;
  cinnamonPretzels: number;
  updatePretzelCount: (type: 'regular' | 'cinnamon', delta: number) => void;
}

export const PretzelTracker: React.FC<PretzelTrackerProps> = ({
  regularPretzels,
  cinnamonPretzels,
  updatePretzelCount,
}) => {
  return (
    <div
      style={{
        background: '#000F9F',
        borderRadius: '24px',
        padding: '20px 18px',
        marginBottom: '25px',
        border: '2px solid #FDA30C',
        boxShadow: '0 8px 24px rgba(0, 15, 159, 0.4)',
        textAlign: 'center',
      }}
    >
      {/* BRAND LOGO */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <img
          src="/auntie-annes.png"
          alt="Auntie Anne's"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
          style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      <h3
        style={{
          margin: '0 0 10px 0',
          fontSize: '11px',
          fontWeight: '900',
          color: '#FDA30C',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        DANDIE PRETZEL TRACKER
      </h3>

      {/* TOTAL PRETZELS DISPLAY */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          padding: '14px',
          marginBottom: '16px',
          border: '1px solid rgba(253, 163, 12, 0.4)',
        }}
      >
        <div style={{ fontSize: '42px', fontWeight: '900', color: '#FDA30C', lineHeight: '1' }}>
          {regularPretzels + cinnamonPretzels}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#FFF',
            marginTop: '4px',
            letterSpacing: '0.8px',
          }}
        >
          TOTAL PRETZELS CONSUMED
        </div>
      </div>

      {/* SUB-COUNTERS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* REGULAR PRETZELS */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            border: '2px solid #FDA30C',
            color: '#000000',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#000F9F', lineHeight: '1.1' }}>
            {regularPretzels}
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '800',
              color: '#000000',
              margin: '4px 0 10px 0',
              letterSpacing: '0.5px',
            }}
          >
            REGULAR
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button
              onClick={() => updatePretzelCount('regular', -1)}
              style={{
                flex: 1,
                padding: '6px',
                background: '#000F9F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '900',
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <button
              onClick={() => updatePretzelCount('regular', 1)}
              style={{
                flex: 1,
                padding: '6px',
                background: '#FDA30C',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '900',
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* CINNAMON PRETZELS */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px',
            border: '2px solid #FDA30C',
            color: '#000000',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#000F9F', lineHeight: '1.1' }}>
            {cinnamonPretzels}
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '800',
              color: '#000000',
              margin: '4px 0 10px 0',
              letterSpacing: '0.5px',
            }}
          >
            CINNAMON
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <button
              onClick={() => updatePretzelCount('cinnamon', -1)}
              style={{
                flex: 1,
                padding: '6px',
                background: '#000F9F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '900',
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <button
              onClick={() => updatePretzelCount('cinnamon', 1)}
              style={{
                flex: 1,
                padding: '6px',
                background: '#FDA30C',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '900',
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
