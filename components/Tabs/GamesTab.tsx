'use client';

import React from 'react';

interface GameItem {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
      {gamesList.map((game, index) => {
        const color = accentColors[index % accentColors.length];

        return (
          <div
            key={game.id}
            style={{
              background: 'rgba(18, 18, 26, 0.85)',
              borderRadius: '20px',
              padding: '16px 18px',
              border: '1px solid #2A2A3C',
              borderLeft: `5px solid ${color}`,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#FFF' }}>
                {game.name}
              </h3>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ background: '#1A1A26', color: '#A0AEC0', border: '1px solid #2A2A3C', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px' }}>
                  👥 {game.players}
                </span>
                {game.appRequired && (
                  <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', border: '1px solid #1E40AF', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px' }}>
                    📱 App
                  </span>
                )}
              </div>
            </div>

            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#CBD5E0', lineHeight: '1.4' }}>
              {game.overview}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {game.isAiTrivia ? (
                <button
                  type="button"
                  onClick={onOpenTrivia}
                  style={{
                    padding: '8px 16px',
                    background: color,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px ${color}55`
                  }}
                >
                  🔮 Launch Trivia
                </button>
              ) : (
                !game.noLearnMore && (
                  <button
                    type="button"
                    onClick={() => onOpenLearnMore(game, color)}
                    style={{
                      padding: '8px 14px',
                      background: color,
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Learn More
                  </button>
                )
              )}

              {game.externalLink && (
                <a
                  href={game.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    background: '#1A1A26',
                    color: '#FFF',
                    border: '1px solid #2A2A3C',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🌐 Open Game ↗
                </a>
              )}

              {game.iosLink && (
                <a
                  href={game.iosLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    background: '#1A1A26',
                    color: '#FFF',
                    border: '1px solid #2A2A3C',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                   App Store ↗
                </a>
              )}

              {game.androidLink && (
                <a
                  href={game.androidLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    background: '#1A1A26',
                    color: '#FFF',
                    border: '1px solid #2A2A3C',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🤖 Google Play ↗
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
