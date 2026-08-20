'use client';

import React from 'react';

export interface GameItem {
  id: string;
  name: string;
  players: string;
  appRequired: boolean;
  overview: string;
  description: string;
  isAiTrivia?: boolean;
  noLearnMore?: boolean;
  externalLink?: string;
  iosLink?: string;
  androidLink?: string;
}

interface GamesTabProps {
  gamesList: GameItem[];
  accentColors: string[];
  onOpenTrivia: () => void;
  onOpenLearnMore: (game: GameItem, color: string) => void;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  gamesList,
  accentColors,
  onOpenTrivia,
  onOpenLearnMore
}) => {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {gamesList.length === 0 ? (
          <p style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '13px', fontStyle: 'italic', margin: '20px 0' }}>
            No games found.
          </p>
        ) : (
          gamesList.map((game, idx) => {
            const borderAccent = accentColors[idx % accentColors.length];

            return (
              <div
                key={game.id}
                style={{
                  background: 'rgba(18, 18, 26, 0.85)',
                  borderRadius: '20px',
                  padding: '16px',
                  border: `2px solid ${borderAccent}`,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#FFF' }}>
                    {game.isAiTrivia ? `📌 ${game.name}` : game.name}
                  </h3>
                  {game.appRequired && (
                    <span style={{ fontSize: '10px', fontWeight: '900', background: '#3B82F6', color: '#FFF', padding: '3px 8px', borderRadius: '6px' }}>
                      📱 App Required
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', fontWeight: '800', color: '#A0AEC0', marginBottom: '8px' }}>
                  👤 {game.players} Players
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#CBD5E0', lineHeight: '1.4' }}>
                  {game.overview}
                </p>

                {!game.noLearnMore && (
                  <button
                    onClick={() => {
                      if (game.isAiTrivia) {
                        onOpenTrivia();
                      } else {
                        onOpenLearnMore(game, borderAccent);
                      }
                    }}
                    style={{
                      background: '#1A1A26',
                      border: '1px solid #2A2A3C',
                      color: borderAccent,
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {game.isAiTrivia ? 'Play Now' : 'Learn More'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
