'use client';

import React, { useMemo } from 'react';

export interface AnalyticsTabProps {
  analyticsSubTab: 'Houses' | 'Rides' | 'Attendees';
  setAnalyticsSubTab: (tab: 'Houses' | 'Rides' | 'Attendees') => void;
  selectedAttendeeFilter: string;
  setSelectedAttendeeFilter: (attendee: string) => void;
  toggleAttendeeFilter: (attendee: string) => void;
  analyticsSortKey: string;
  analyticsSortOrder: 'asc' | 'desc';
  handleAnalyticsSortClick: (key: any) => void;
  houseAnalyticsStats: any[];
  rideAnalyticsStats: any[];
  houseBanners: Record<string, string>;
  rideBanners: Record<string, string>;
  getHouseAverages: (houseName: string, ratings: any[], attendeeFilter: string) => any;
  allHouseRatings: any[];
  formatMinutes: (m: number) => string;
  longestHouseWaits: any[];
  shortestHouseWaits: any[];
  longestRideWaits: any[];
  shortestRideWaits: any[];
  attendeeChecklistData: {
    houseList: any[];
    rideList: any[];
    showList: any[];
  };
  itemEmojis: Record<string, string>;
  formatDisplayDate: (d: string) => string;
  parseAttendees: (raw: any) => string[];
  familyMembers: string[];
}

const getRankColor = (rank: number) => {
  if (rank === 1) return '#FFD700'; // Gold
  if (rank === 2) return '#C0C0C0'; // Silver
  if (rank === 3) return '#CD7F32'; // Bronze
  if (rank >= 10) return '#EF4444'; // Red
  
  const colors = [
    '#EAB308', // #4 Yellow
    '#10B981', // #5 Emerald Green
    '#06B6D4', // #6 Cyan
    '#3B82F6', // #7 Blue
    '#F97316', // #8 Orange
    '#F43F5E'  // #9 Coral-Red
  ];
  return colors[rank - 4] || '#A0AEC0';
};

const RankBadge = ({ rank }: { rank: number }) => (
  <div style={{ fontSize: '10px', fontWeight: '900', color: getRankColor(rank), marginTop: '3px' }}>
    #{rank}
  </div>
);

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  analyticsSubTab,
  setAnalyticsSubTab,
  selectedAttendeeFilter,
  setSelectedAttendeeFilter,
  toggleAttendeeFilter,
  analyticsSortKey,
  analyticsSortOrder,
  handleAnalyticsSortClick,
  houseAnalyticsStats,
  rideAnalyticsStats,
  houseBanners,
  rideBanners,
  getHouseAverages,
  allHouseRatings,
  formatMinutes,
  longestHouseWaits,
  shortestHouseWaits,
  longestRideWaits,
  shortestRideWaits,
  attendeeChecklistData,
  itemEmojis,
  formatDisplayDate,
  parseAttendees,
  familyMembers
}) => {
  // Pre-calculate ranks across all 10 houses for house cards
  const houseRanksMap = useMemo(() => {
    const ranks: Record<string, Record<string, number>> = {};

    const calcRankMap = (key: string, isDesc: boolean) => {
      const sorted = [...houseAnalyticsStats].sort((a, b) => {
        const valA = Number(a[key]) || 0;
        const valB = Number(b[key]) || 0;
        return isDesc ? valB - valA : valA - valB;
      });

      sorted.forEach((item, index) => {
        if (!ranks[item.name]) ranks[item.name] = {};
        ranks[item.name][key] = index + 1;
      });
    };

    // Rating / Visits / Total Wait: Higher is #1
    calcRankMap('ratingOverall', true);
    calcRankMap('ratingScare', true);
    calcRankMap('ratingCool', true);
    calcRankMap('visits', true);
    calcRankMap('totalWait', true);

    // Avg Wait / Avg Posted / Diff: Lower/Shortest is #1
    calcRankMap('avgWait', false);
    calcRankMap('avgExpected', false);
    calcRankMap('diff', false);

    return ranks;
  }, [houseAnalyticsStats]);

  return (
    <div>
      {/* SUBTAB NAVIGATION */}
      <div style={{ display: 'flex', background: 'rgba(18, 18, 26, 0.85)', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '12px' }}>
        <button onClick={() => setAnalyticsSubTab('Houses')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Houses' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Houses' ? '#FFF' : '#9CA3AF' }}>Houses</button>
        <button onClick={() => setAnalyticsSubTab('Rides')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Rides' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Rides' ? '#FFF' : '#9CA3AF' }}>Rides</button>
        <button onClick={() => setAnalyticsSubTab('Attendees')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Attendees' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Attendees' ? '#FFF' : '#9CA3AF' }}>Attendees</button>
      </div>

      {/* ATTENDEE FILTER PILLS */}
      <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '12px', borderRadius: '16px', border: '1px solid #2A2A3C', marginBottom: '16px' }}>
        <label style={{ fontSize: '10px', fontWeight: '900', color: '#A0AEC0', display: 'block', marginBottom: '8px', letterSpacing: '0.8px' }}>
          FILTER ANALYTICS BY MEMBER
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['Everyone', ...familyMembers].map((name) => {
            const isSelected = selectedAttendeeFilter === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleAttendeeFilter(name)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #DC2626' : '1px solid #2A2A3C',
                  background: isSelected ? '#DC2626' : '#1A1A26',
                  color: isSelected ? '#FFF' : '#CBD5E0',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SORT CONTROLS HEADER BAR */}
      {analyticsSubTab !== 'Attendees' && (
        <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '10px 12px', borderRadius: '14px', border: '1px solid #2A2A3C', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#A0AEC0', letterSpacing: '0.5px' }}>SORT BY:</span>
          
          <button type="button" onClick={() => handleAnalyticsSortClick('visits')} style={{ background: 'none', border: 'none', color: analyticsSortKey === 'visits' ? '#FF5500' : '#A0AEC0', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            Visits {analyticsSortKey === 'visits' ? (analyticsSortOrder === 'asc' ? '▲' : '▼') : ''}
          </button>

          <button type="button" onClick={() => handleAnalyticsSortClick('avgWait')} style={{ background: 'none', border: 'none', color: analyticsSortKey === 'avgWait' ? '#FF5500' : '#A0AEC0', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            Avg Wait {analyticsSortKey === 'avgWait' ? (analyticsSortOrder === 'asc' ? '▲' : '▼') : ''}
          </button>

          <button type="button" onClick={() => handleAnalyticsSortClick('totalWait')} style={{ background: 'none', border: 'none', color: analyticsSortKey === 'totalWait' ? '#FF5500' : '#A0AEC0', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            Total Wait {analyticsSortKey === 'totalWait' ? (analyticsSortOrder === 'asc' ? '▲' : '▼') : ''}
          </button>

          {analyticsSubTab === 'Houses' && (
            <>
              <button type="button" onClick={() => handleAnalyticsSortClick('ratingOverall')} style={{ background: 'none', border: 'none', color: analyticsSortKey === 'ratingOverall' ? '#FF5500' : '#A0AEC0', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                Overall ⭐ {analyticsSortKey === 'ratingOverall' ? (analyticsSortOrder === 'asc' ? '▲' : '▼') : ''}
              </button>

              <button type="button" onClick={() => handleAnalyticsSortClick('ratingScare')} style={{ background: 'none', border: 'none', color: analyticsSortKey === 'ratingScare' ? '#FF5500' : '#A0AEC0', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                Scare 😱 {analyticsSortKey === 'ratingScare' ? (analyticsSortOrder === 'asc' ? '▲' : '▼') : ''}
              </button>

              <button type="button" onClick={() => handleAnalyticsSortClick('ratingCool')} style={{ background: 'none', border: 'none', color: analyticsSortKey === 'ratingCool' ? '#FF5500' : '#A0AEC0', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                Cool ❄️ {analyticsSortKey === 'ratingCool' ? (analyticsSortOrder === 'asc' ? '▲' : '▼') : ''}
              </button>
            </>
          )}
        </div>
      )}

      {/* HOUSES ANALYTICS TAB */}
      {analyticsSubTab === 'Houses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {houseAnalyticsStats.map((item) => {
            const avgRatings = getHouseAverages(item.name, allHouseRatings, selectedAttendeeFilter);
            const ranks = houseRanksMap[item.name] || {};

            return (
              <div key={item.name} style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '20px', border: '1px solid #2A2A3C', overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
                {houseBanners[item.name] && (
                  <div style={{ height: '110px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img src={houseBanners[item.name]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18, 18, 26, 1) 0%, transparent 100%)' }}></div>
                    <div style={{ position: 'absolute', bottom: '10px', left: '14px', fontSize: '18px', fontWeight: '900', color: '#FFF', textShadow: '0 2px 8px #000' }}>
                      {itemEmojis[item.name] || '🏚️'} {item.name}
                    </div>
                  </div>
                )}

                <div style={{ padding: '14px' }}>
                  {/* RATINGS WITH RANK BADGES */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#FDA30C' }}>{avgRatings ? avgRatings.overall : '—'}</div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>OVERALL ⭐</div>
                      <RankBadge rank={ranks.ratingOverall || 10} />
                    </div>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#EF4444' }}>{avgRatings ? avgRatings.scare : '—'}</div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>SCARE 😱</div>
                      <RankBadge rank={ranks.ratingScare || 10} />
                    </div>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#3B82F6' }}>{avgRatings ? avgRatings.cool : '—'}</div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>COOL ❄️</div>
                      <RankBadge rank={ranks.ratingCool || 10} />
                    </div>
                  </div>

                  {/* VISITS & WAIT STATS WITH RANK BADGES */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#FF5500' }}>{item.visits}</div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>VISITS</div>
                      <RankBadge rank={ranks.visits || 10} />
                    </div>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFF' }}>{item.avgWait}m</div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG WAIT</div>
                      <RankBadge rank={ranks.avgWait || 10} />
                    </div>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#A855F7' }}>{formatMinutes(item.totalWait)}</div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TOTAL WAIT</div>
                      <RankBadge rank={ranks.totalWait || 10} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#CBD5E0' }}>{item.avgExpected}m</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG POSTED</div>
                      <RankBadge rank={ranks.avgExpected || 10} />
                    </div>
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: item.diff <= 0 ? '#22C55E' : '#EF4444' }}>
                        {item.diff > 0 ? `+${item.diff}m` : `${item.diff}m`}
                      </div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>+/- POSTED</div>
                      <RankBadge rank={ranks.diff || 10} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RIDES ANALYTICS TAB */}
      {analyticsSubTab === 'Rides' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rideAnalyticsStats.map((item) => (
            <div key={item.name} style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '20px', border: '1px solid #2A2A3C', overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
              {rideBanners[item.name] && (
                <div style={{ height: '110px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                  <img src={rideBanners[item.name]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18, 18, 26, 1) 0%, transparent 100%)' }}></div>
                  <div style={{ position: 'absolute', bottom: '10px', left: '14px', fontSize: '18px', fontWeight: '900', color: '#FFF', textShadow: '0 2px 8px #000' }}>
                    {itemEmojis[item.name] || '🎢'} {item.name}
                  </div>
                </div>
              )}

              <div style={{ padding: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#3B82F6' }}>{item.visits}</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>VISITS</div>
                  </div>
                  <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFF' }}>{item.avgWait}m</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG WAIT</div>
                  </div>
                  <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#A855F7' }}>{formatMinutes(item.totalWait)}</div>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TOTAL WAIT</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#CBD5E0' }}>{item.avgExpected}m</div>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG POSTED</div>
                  </div>
                  <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: item.diff <= 0 ? '#22C55E' : '#EF4444' }}>
                      {item.diff > 0 ? `+${item.diff}m` : `${item.diff}m`}
                    </div>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>+/- POSTED</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ATTENDEES TAB */}
      {analyticsSubTab === 'Attendees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '16px', borderRadius: '20px', border: '1px solid #2A2A3C' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '900', color: '#DC2626' }}>HOUSES LOGGED BY {selectedAttendeeFilter.toUpperCase()}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {attendeeChecklistData.houseList.map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1A1A26', padding: '8px 12px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFF' }}>{itemEmojis[item.name] || '🏚️'} {item.name}</span>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0' }}>
                    <strong>{item.visits}x</strong> | Avg: <strong style={{ color: '#DC2626' }}>{item.avgWait}m</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
