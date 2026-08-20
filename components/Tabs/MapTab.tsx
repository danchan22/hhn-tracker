'use client';

import React from 'react';

export interface MapPOI {
  id: string;
  name: string;
  shortName: string;
  category: 'house' | 'ride' | 'show' | 'scarezone' | 'water' | 'food';
  lat: number;
  lng: number;
  apiKey?: string;
  anchorOffset?: [number, number];
}

interface MapTabProps {
  isVisible: boolean;
  isMapFullscreen: boolean;
  setIsMapFullscreen: (v: boolean) => void;
  mapCategoryFilter: 'all' | 'house' | 'ride' | 'show' | 'scarezone' | 'water' | 'food';
  toggleMapFilter: (cat: 'house' | 'ride' | 'show' | 'scarezone' | 'water' | 'food') => void;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  handleRecenterUserMap: () => void;
}

export const MapTab: React.FC<MapTabProps> = ({
  isVisible,
  isMapFullscreen,
  setIsMapFullscreen,
  mapCategoryFilter,
  toggleMapFilter,
  mapContainerRef,
  handleRecenterUserMap,
}) => {
  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      <div
        style={{
          position: isMapFullscreen ? 'fixed' : 'relative',
          top: isMapFullscreen ? 0 : 'auto',
          left: isMapFullscreen ? 0 : 'auto',
          right: isMapFullscreen ? 0 : 'auto',
          bottom: isMapFullscreen ? 0 : 'auto',
          width: isMapFullscreen ? '100vw' : '100%',
          height: isMapFullscreen ? '100vh' : 'auto',
          zIndex: isMapFullscreen ? 99999 : 'auto',
          background: 'rgba(18, 18, 26, 0.85)',
          borderRadius: isMapFullscreen ? 0 : '24px',
          padding: isMapFullscreen ? '10px' : '14px',
          border: isMapFullscreen ? 'none' : '1px solid #2A2A3C',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box',
        }}
      >
        {/* CATEGORY FILTERS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '10px' }}>
          <button
            onClick={() => toggleMapFilter('house')}
            style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'house' ? '2px solid #FF5500' : '1px solid #2A2A3C', background: mapCategoryFilter === 'house' ? '#FF5500' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
          >
            🏚️<br />Houses
          </button>
          <button
            onClick={() => toggleMapFilter('ride')}
            style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'ride' ? '2px solid #3B82F6' : '1px solid #2A2A3C', background: mapCategoryFilter === 'ride' ? '#3B82F6' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
          >
            🎢<br />Rides
          </button>
          <button
            onClick={() => toggleMapFilter('show')}
            style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'show' ? '2px solid #10B981' : '1px solid #2A2A3C', background: mapCategoryFilter === 'show' ? '#10B981' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
          >
            🎭<br />Shows
          </button>
          <button
            onClick={() => toggleMapFilter('scarezone')}
            style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'scarezone' ? '2px solid #A855F7' : '1px solid #2A2A3C', background: mapCategoryFilter === 'scarezone' ? '#A855F7' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
          >
            🧟<br />Zones
          </button>
          <button
            onClick={() => toggleMapFilter('water')}
            style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'water' ? '2px solid #06B6D4' : '1px solid #2A2A3C', background: mapCategoryFilter === 'water' ? '#06B6D4' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
          >
            💧<br />Water
          </button>
          <button
            onClick={() => toggleMapFilter('food')}
            style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'food' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: mapCategoryFilter === 'food' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
          >
            🍔<br />Food
          </button>
        </div>

        {/* LEAFLET MAP CONTAINER WITH DYNAMIC SCREEN FIT */}
        <div style={{ position: 'relative', width: '100%', height: isMapFullscreen ? 'calc(100vh - 80px)' : 'calc(100vh - 250px)', minHeight: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2A2A3C' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />

          {/* RECENTER & FULLSCREEN BUTTONS */}
          <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleRecenterUserMap}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                background: 'rgba(225, 225, 235, 0.88)',
                color: '#1A1A26',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(6px)',
                whiteSpace: 'nowrap',
              }}
            >
              📍 Me
            </button>

            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                background: 'rgba(225, 225, 235, 0.88)',
                color: '#1A1A26',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(6px)',
                whiteSpace: 'nowrap',
              }}
            >
              {isMapFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
