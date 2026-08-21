'use client';

import React from 'react';

interface AnalyticsTabProps {
  analyticsSubTab: 'Houses' | 'Rides' | 'Attendees';
  setAnalyticsSubTab: (tab: 'Houses' | 'Rides' | 'Attendees') => void;
  selectedAttendeeFilter: string;
  setSelectedAttendeeFilter: (val: string) => void;
  toggleAttendeeFilter: (name: string) => void;
  analyticsSortKey: string;
  analyticsSortOrder: 'asc' | 'desc';
  handleAnalyticsSortClick: (key: any) => void;
  houseAnalyticsStats: any[];
  rideAnalyticsStats: any[];
  houseBanners: Record<string, string>;
  rideBanners: Record<string, string>;
  getHouseAverages: (name: string, ratings: any[], filter: string) => any;
  allHouseRatings: any[];
  formatMinutes: (m: number) => string;
  longestHouseWaits: any[];
  shortestHouseWaits: any[];
  longestRideWaits: any[];
  shortestRideWaits: any[];
  attendeeChecklistData: { houseList: any[]; rideList: any[]; showList: any[] };
  itemEmojis: Record<string, string>;
  formatDisplayDate: (d: string) => string;
  parseAttendees: (raw: any) => string[];
  familyMembers: string[];
}

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
  return (
    <div>
      {/* 2. ANALYTICS SUBHEADER NAVS (Houses | Rides | Attendees) */}
      <div style={{ display: 'flex', background: 'rgba(18, 18, 26, 0.85)', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '16px', backdropFilter: 'blur(8px)' }}>
        <button onClick={() => setAnalyticsSubTab('Houses')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Houses' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Houses' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
          Houses
        </button>
        <button onClick={() => setAnalyticsSubTab('Rides')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Rides' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Rides' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
          Rides
        </button>
        <button onClick={() => setAnalyticsSubTab('Attendees')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Attendees' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Attendees' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
          Attendees
        </button>
      </div>

      {/* SHARED ATTENDEE FILTER SELECTOR */}
      <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '12px 14px', borderRadius: '18px', border: '1px solid #2A2A3C', marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0' }}>FILTER BY ATTENDEE:</label>
          {selectedAttendeeFilter !== 'Everyone' && (
            <button onClick={() => setSelectedAttendeeFilter('Everyone')} style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '11px', fontWeight: '800', cursor: 'pointer', padding: 0 }}>
              Reset to Everyone ✕
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {familyMembers.map(name => {
            const isSelected = selectedAttendeeFilter === name;
            return (
              <button key={name} onClick={() => toggleAttendeeFilter(name)} style={{ padding: '8px 2px', borderRadius: '10px', border: isSelected ? '2px solid #FF5500' : '1px solid #2A2A3C', background: isSelected ? '#FF5500' : '#1A1A26', color: isSelected ? '#FFF' : '#CBD5E0', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SORT FUNCTIONALITY BAR (HOUSES & RIDES) */}
      {(analyticsSubTab === 'Houses' || analyticsSubTab === 'Rides') && (
        <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '10px 12px', borderRadius: '14px', border: '1px solid #2A2A3C', marginBottom: '16px', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', marginBottom: '6px' }}>SORT:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
            {[
              { key: 'visits', label: 'Visits' },
              { key: 'avgWait', label: 'Avg Wait' },
              { key: 'totalWait', label: 'Total Wait' },
              { key: 'avgExpected', label: 'Posted' },
              { key: 'diff', label: '+/-' }
            ].map(item => {
              const isActive = analyticsSortKey === item.key;
              const arrow = isActive ? (analyticsSortOrder === 'desc' ? ' ▼' : ' ▲') : '';
              return (
                <button key={item.key} onClick={() => handleAnalyticsSortClick(item.key)} style={{ padding: '6px 2px', borderRadius: '8px', border: isActive ? '1px solid #DC2626' : '1px solid #2A2A3C', background: isActive ? '#DC2626' : '#1A1A26', color: isActive ? '#FFF' : '#A0AEC0', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}>
                  {item.label}{arrow}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* HOUSES ANALYTICS SUBTAB */}
      {analyticsSubTab === 'Houses' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {houseAnalyticsStats.map(stat => {
              const bannerPath = houseBanners[stat.name];
              const avgRatings = getHouseAverages(stat.name, allHouseRatings, selectedAttendeeFilter);

              return (
                <div key={stat.name} style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '18px', padding: '14px 16px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
                  {bannerPath && (
                    <div style={{ margin: '-14px -16px 12px -16px', height: '110px', overflow: 'hidden', borderBottom: '1px solid #2A2A3C' }}>
                      <img src={bannerPath} alt={stat.name} onError={(e: any) => { e.target.parentNode.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#FF5500', marginBottom: '10px' }}>{stat.name}</div>

                  <div style={{ background: '#12121A', padding: '8px 10px', borderRadius: '10px', border: '1px solid #2A2A3C', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {avgRatings ? (
                      <>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#FDA30C' }}>⭐ Overall: <span style={{ color: '#FFF' }}>{avgRatings.overall}</span></div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#EF4444' }}>😱 Scare: <span style={{ color: '#FFF' }}>{avgRatings.scare}</span></div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#3B82F6' }}>😎 Vibe: <span style={{ color: '#FFF' }}>{avgRatings.cool}</span></div>
                      </>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>No ratings logged yet</div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>{stat.visits}</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TOTAL<br />VISITS</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#3B82F6' }}>{stat.avgWait}m</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG<br />WAIT</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#A855F7' }}>{formatMinutes(stat.totalWait)}</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TOTAL<br />WAIT</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#EAB308' }}>{stat.avgExpected > 0 ? `${stat.avgExpected}m` : '-'}</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG<br />POSTED</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: stat.diff < 0 ? '#22C55E' : stat.diff > 0 ? '#EF4444' : '#FFF' }}>
                        {stat.diff === 0 ? '-' : stat.diff > 0 ? `+${stat.diff}m` : `${stat.diff}m`}
                      </div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>+/-<br />POSTED</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RIDES ANALYTICS SUBTAB */}
      {analyticsSubTab === 'Rides' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {rideAnalyticsStats.map(stat => {
              const bannerPath = rideBanners[stat.name];
              return (
                <div key={stat.name} style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '18px', padding: '14px 16px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
                  {bannerPath && (
                    <div style={{ margin: '-14px -16px 12px -16px', height: '110px', overflow: 'hidden', borderBottom: '1px solid #2A2A3C' }}>
                      <img src={bannerPath} alt={stat.name} onError={(e: any) => { e.target.parentNode.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#3B82F6', marginBottom: '10px' }}>{stat.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>{stat.visits}</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TOTAL<br />VISITS</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#3B82F6' }}>{stat.avgWait}m</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG<br />WAIT</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#A855F7' }}>{formatMinutes(stat.totalWait)}</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TOTAL<br />WAIT</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#EAB308' }}>{stat.avgExpected > 0 ? `${stat.avgExpected}m` : '-'}</div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>AVG<br />POSTED</div>
                    </div>
                    <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: stat.diff < 0 ? '#22C55E' : stat.diff > 0 ? '#EF4444' : '#FFF' }}>
                        {stat.diff === 0 ? '-' : stat.diff > 0 ? `+${stat.diff}m` : `${stat.diff}m`}
                      </div>
                      <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>+/-<br />POSTED</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ATTENDEES ANALYTICS SUBTAB */}
      {analyticsSubTab === 'Attendees' && (
        <div>
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#FF5500', margin: '0 0 12px 0' }}>🏚️ HOUSES ({selectedAttendeeFilter})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {attendeeChecklistData.houseList.map(item => (
                <div key={item.name} style={{ background: '#1A1A26', padding: '10px 14px', borderRadius: '12px', border: '1px solid #2A2A3C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#FFF' }}>{itemEmojis[item.name] || '🏚️'} {item.name}</div>
                    <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                      Avg Wait: <strong>{item.avgWait}m</strong> &nbsp;•&nbsp; Total Wait: <strong>{formatMinutes(item.totalWait)}</strong>
                    </div>
                  </div>
                  <div style={{ background: item.visits > 0 ? '#FF5500' : '#2A2A3C', color: item.visits > 0 ? '#FFF' : '#718096', fontSize: '12px', fontWeight: '900', padding: '6px 12px', borderRadius: '10px' }}>
                    {item.visits} {item.visits === 1 ? 'Visit' : 'Visits'}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#3B82F6', margin: '0 0 12px 0' }}>🎢 RIDES ({selectedAttendeeFilter})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {attendeeChecklistData.rideList.map(item => (
                <div key={item.name} style={{ background: '#1A1A26', padding: '10px 14px', borderRadius: '12px', border: '1px solid #2A2A3C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#FFF' }}>{itemEmojis[item.name] || '🎢'} {item.name}</div>
                    <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                      Avg Wait: <strong>{item.avgWait}m</strong> &nbsp;•&nbsp; Total Wait: <strong>{formatMinutes(item.totalWait)}</strong>
                    </div>
                  </div>
                  <div style={{ background: item.visits > 0 ? '#3B82F6' : '#2A2A3C', color: item.visits > 0 ? '#FFF' : '#718096', fontSize: '12px', fontWeight: '900', padding: '6px 12px', borderRadius: '10px' }}>
                    {item.visits} {item.visits === 1 ? 'Visit' : 'Visits'}
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
