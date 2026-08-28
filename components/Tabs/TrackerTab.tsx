'use client';

import React from 'react';
import { PretzelTracker } from '../Shared/PretzelTracker';

interface TrackerTabProps {
  trackerSubTab: 'Tonight' | 'History' | 'Parking';
  activeVisit: any;
  activePartyList: string[];
  formatDisplayDate: (d: string) => string;
  format12Hour: (t?: string) => string;
  calculateVisitDuration: (s: string, e?: string) => string;
  formatMinutes: (m: number) => string;
  rideName: string;
  setRideName: (r: string) => void;
  queueStartTimestamp: number | null;
  queueStartTimeStr: string | null;
  selectedRiders: string[];
  toggleRiderSelection: (name: string) => void;
  postedWaitTime: string;
  setPostedWaitTime: (w: string) => void;
  waitTime: string;
  setWaitTime: (w: string) => void;
  handleStartQueueTimer: () => void;
  handleEndQueueTimer: () => void;
  setQueueStartTimestamp: (val: number | null) => void;
  setQueueStartTimeStr: (val: string | null) => void;
  handleAddRideLive: () => void;
  openLiveActivityEdit: (act: any) => void;
  setDepartingMembers: (m: string[]) => void;
  setShowCheckoutModal: (v: boolean) => void;
  selectedAttendees: string[];
  toggleCheckInAttendee: (name: string) => void;
  handleCheckIn: (e: React.FormEvent) => void;
  setShowRatingModal: (v: boolean) => void;
  fetchThemeParkWaitTimes: () => void;
  waitsSyncing: boolean;
  liveWaitTimes: Record<string, number>;
  getWaitBoxStyle: (mins: number) => any;
  houseGridLayout: any[][];
  rideGridLayout: any[][];
  totalEventVisits: number;
  totalHousesCount: number;
  totalRidesCount: number;
  totalShowsCount: number;
  totalTimeInParkMins: number;
  totalTimeInLinesMins: number;
  lineTimePercentage: number;
  topHouseData: any;
  topRideData: any;
  avgHousesPerVisit: string;
  avgRidesPerVisit: string;
  avgShowsPerVisit: string;
  avgDurationPerVisit: number;
  avgWaitPerActivity: number;
  itemEmojis: Record<string, string>;
  regularPretzels: number;
  cinnamonPretzels: number;
  updatePretzelCount: (type: 'regular' | 'cinnamon', delta: number) => void;
  visits: any[];
  loading: boolean;
  getPersonEndTime: (v: any, person: string) => string;
  editingActivityId: string | null;
  editingVisitId: string | null;
  editRideName: string;
  setEditRideName: (r: string) => void;
  editRiders: string[];
  toggleEditRiderSelection: (m: string) => void;
  editWaitTime: string;
  setEditWaitTime: (w: string) => void;
  editNotes: string;
  setEditNotes: (n: string) => void;
  deleteActivity: (id: string) => void;
  cancelEditing: () => void;
  saveEditedActivity: () => void;
  startEditing: (act: any, visitId: string | null) => void;
  openEditVisit: (v: any) => void;
  deleteVisit: (id: string) => void;
  parkingAttendees: string[];
  toggleParkingAttendee: (name: string) => void;
  parkingGarage: string;
  setParkingGarage: (g: string) => void;
  parkingRowNumber: string;
  setParkingRowNumber: (r: string) => void;
  handleSaveParkingLog: () => void;
  parkingSaving: boolean;
  parkingLogs: any[];
  parkingGarages: any[];
  familyMembers: string[];
  hhnHouses: string[];
  hhnRides: string[];
  hhnShows: string[];
  parseAttendees: (raw: any) => string[];
  getElapsedQueueTimeString: () => string;
  weatherLoading: boolean;
  hourlyForecast: Array<{ hourLabel: string; temp: number; pop: number }>;
  setShowAddPartyModal: (v: boolean) => void;
}

export const TrackerTab: React.FC<TrackerTabProps> = ({
  trackerSubTab,
  activeVisit,
  activePartyList,
  formatDisplayDate,
  format12Hour,
  calculateVisitDuration,
  formatMinutes,
  rideName,
  setRideName,
  queueStartTimestamp,
  queueStartTimeStr,
  selectedRiders,
  toggleRiderSelection,
  postedWaitTime,
  setPostedWaitTime,
  waitTime,
  setWaitTime,
  handleStartQueueTimer,
  handleEndQueueTimer,
  setQueueStartTimestamp,
  setQueueStartTimeStr,
  handleAddRideLive,
  openLiveActivityEdit,
  setDepartingMembers,
  setShowCheckoutModal,
  selectedAttendees,
  toggleCheckInAttendee,
  handleCheckIn,
  setShowRatingModal,
  fetchThemeParkWaitTimes,
  waitsSyncing,
  liveWaitTimes,
  getWaitBoxStyle,
  houseGridLayout,
  rideGridLayout,
  totalEventVisits,
  totalHousesCount,
  totalRidesCount,
  totalShowsCount,
  totalTimeInParkMins,
  totalTimeInLinesMins,
  lineTimePercentage,
  topHouseData,
  topRideData,
  avgHousesPerVisit,
  avgRidesPerVisit,
  avgShowsPerVisit,
  avgDurationPerVisit,
  avgWaitPerActivity,
  itemEmojis,
  regularPretzels,
  cinnamonPretzels,
  updatePretzelCount,
  visits,
  loading,
  getPersonEndTime,
  editingActivityId,
  editingVisitId,
  editRideName,
  setEditRideName,
  editRiders,
  toggleEditRiderSelection,
  editWaitTime,
  setEditWaitTime,
  editNotes,
  setEditNotes,
  deleteActivity,
  cancelEditing,
  saveEditedActivity,
  startEditing,
  openEditVisit,
  deleteVisit,
  parkingAttendees,
  toggleParkingAttendee,
  parkingGarage,
  setParkingGarage,
  parkingRowNumber,
  setParkingRowNumber,
  handleSaveParkingLog,
  parkingSaving,
  parkingLogs,
  parkingGarages,
  familyMembers,
  hhnHouses,
  hhnRides,
  hhnShows,
  parseAttendees,
  getElapsedQueueTimeString,
  weatherLoading,
  hourlyForecast,
  setShowAddPartyModal
}) => {
  return (
    <div>
      {/* 🌧️ 6-HOUR EVENING WEATHER GRID */}
      <a
        href="https://www.timeanddate.com/weather/@6942262/hourly"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', textDecoration: 'none', background: 'rgba(18, 18, 26, 0.85)', border: '1px solid #2A2A3C', padding: '12px 10px', borderRadius: '16px', marginBottom: '16px', backdropFilter: 'blur(8px)' }}
      >
        {weatherLoading ? (
          <div style={{ textAlign: 'center', color: '#A0AEC0', fontSize: '12px', padding: '4px 0' }}>🌤️ Syncing Weather...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
            {hourlyForecast.map((item, idx) => (
              <div key={idx} style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '10px', padding: '6px 2px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#CBD5E0' }}>{item.hourLabel}</div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFF', margin: '2px 0' }}>{item.temp}°</div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: item.pop > 50 ? '#3B82F6' : '#A0AEC0' }}>{item.pop}%</div>
              </div>
            ))}
          </div>
        )}
      </a>

      {/* SUBTAB: TONIGHT */}
      {trackerSubTab === 'Tonight' && (
        <div>
          {activeVisit ? (
            /* ACTIVE VISIT LIVE WIDGET */
            <div style={{ background: 'linear-gradient(135deg, rgba(31, 8, 8, 0.9) 0%, rgba(13, 5, 16, 0.95) 100%)', color: '#FFF', padding: '20px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)', border: '2px solid #DC2626', backdropFilter: 'blur(8px)' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ background: '#DC2626', color: '#FFF', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔥 LIVE AT HORROR NIGHTS
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#CBD5E0', marginBottom: '8px', fontWeight: '600' }}>
                📅 {formatDisplayDate(activeVisit.visitDate)} &nbsp;•&nbsp; ⏰ Arrived: <strong>{format12Hour(activeVisit.startTime)}</strong>
              </div>

              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span>👥 <strong>Active Party:</strong> {activePartyList.join(', ')}</span>
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(true)}
                  style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                >
                  Add Someone
                </button>
              </p>

              {/* TRACK ATTRACTION CARD */}
              <div style={{ background: 'rgba(18, 18, 26, 0.9)', padding: '16px', borderRadius: '18px', marginBottom: '15px', color: '#F3F4F6', border: '1px solid #2A2A3C' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#FF5500' }}>Track an Attraction:</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select value={rideName} onChange={(e) => setRideName(e.target.value)} disabled={!!queueStartTimestamp} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2A2A3C', background: queueStartTimestamp ? '#1A1A24' : '#1A1A26', fontSize: '14px', color: queueStartTimestamp ? '#718096' : '#F3F4F6' }}>
                    <optgroup label="Houses">
                      {hhnHouses.map((house) => (
                        <option key={house} value={house}>{house}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Rides">
                      {hhnRides.map((ride) => (
                        <option key={ride} value={ride}>{ride}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Shows">
                      {hhnShows.map((show) => (
                        <option key={show} value={show}>{show}</option>
                      ))}
                    </optgroup>
                  </select>

                  {activePartyList.length > 1 && (
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', padding: '10px', borderRadius: '10px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>
                        👥 WHO IS PARTICIPATING?
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {activePartyList.map((member) => {
                          const isRiding = selectedRiders.includes(member);
                          return (
                            <button
                              key={member}
                              type="button"
                              onClick={() => toggleRiderSelection(member)}
                              disabled={!!queueStartTimestamp}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: isRiding ? '2px solid #DC2626' : '1px solid #2A2A3C',
                                background: isRiding ? '#DC2626' : '#12121A',
                                color: isRiding ? '#FFF' : '#A0AEC0',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {member}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1A1A26', border: '1px solid #2A2A3C', padding: '8px 12px', borderRadius: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', flex: 1 }}>
                      POSTED WAIT TIME (MINS)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 45"
                      value={postedWaitTime}
                      onChange={(e) => setPostedWaitTime(e.target.value)}
                      disabled={!!queueStartTimestamp}
                      style={{ width: '80px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#12121A', color: '#FFF', fontSize: '16px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>

                  {queueStartTimestamp ? (
                    <div style={{ background: '#2B1408', border: '1px solid #C05621', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: '#FF9A56', letterSpacing: '0.5px' }}>⏱️ LIVE QUEUE TIMER RUNNING</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#E2E8F0', marginTop: '6px' }}>
                        Entered line at: <strong style={{ color: '#FF5500' }}>{queueStartTimeStr}</strong>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#FF9A56', margin: '8px 0' }}>
                        Time in line: {getElapsedQueueTimeString()}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button type="button" onClick={() => { setQueueStartTimestamp(null); setQueueStartTimeStr(null); }} style={{ flex: 1, padding: '10px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                          Cancel
                        </button>
                        <button type="button" onClick={handleEndQueueTimer} style={{ flex: 2, padding: '10px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                          Entering Attraction
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px solid #2A2A3C', paddingTop: '10px', marginTop: '5px' }}>
                      <button type="button" onClick={handleStartQueueTimer} style={{ width: '100%', padding: '12px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}>
                        ⏱️ Start Line Timer
                      </button>

                      <div style={{ textAlign: 'center', fontSize: '11px', color: '#718096', fontWeight: 'bold', marginBottom: '12px', position: 'relative' }}>
                        <span style={{ background: '#12121A', padding: '0 10px', position: 'relative', zIndex: 2 }}>OR LOG MANUALLY</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#2A2A3C', zIndex: 1 }}></div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Actual wait time (mins)"
                          value={waitTime}
                          onChange={(e) => setWaitTime(e.target.value)}
                          style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
                        />
                        <button type="button" onClick={handleAddRideLive} style={{ padding: '11px 22px', background: '#2A2A3C', color: '#FFF', border: '1px solid #3F3F56', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                          Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {activeVisit.activities.length > 0 && (
                  <div style={{ marginTop: '15px', borderTop: '2px dashed #2A2A3C', paddingTop: '12px' }}>
                    <strong style={{ fontSize: '11px', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>TONIGHT'S LOG ({activeVisit.activities.length}):</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeVisit.activities.map((act: any) => (
                        <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#1A1A26', padding: '8px 10px', borderRadius: '8px', border: '1px solid #2A2A3C' }}>
                          <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#F3F4F6' }}>{act.rideName}</div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              ⏱️ {act.waitTimeMinutes} mins wait {act.notes ? `(${act.notes})` : ''}
                            </div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              👥 {parseAttendees(act.riders).join(', ')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openLiveActivityEdit(act)}
                            style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '2px 6px' }}
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leave the Park Button */}
              <button onClick={() => { setDepartingMembers(activePartyList); setShowCheckoutModal(true); }} style={{ width: '100%', padding: '14px', background: '#000000', color: '#FFF', border: '2px solid #DC2626', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}>
                Leave the Park & Save Day
              </button>
            </div>
          ) : (
            /* START YOUR NIGHT FORM */
            <form onSubmit={handleCheckIn} style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '22px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)', border: '2px solid #DC2626', backdropFilter: 'blur(8px)' }}>
              <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '900', color: '#DC2626', marginBottom: '16px', textAlign: 'center' }}>Start Your Night</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>WHO'S ATTENDING?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {familyMembers.map((name) => {
                    const isSelected = selectedAttendees.includes(name);
                    return (
                      <button key={name} type="button" onClick={() => toggleCheckInAttendee(name)} style={{ padding: '10px 2px', borderRadius: '10px', border: isSelected ? '2px solid #DC2626' : '1px solid #2A2A3C', background: isSelected ? '#DC2626' : '#1A1A26', color: isSelected ? '#FFF' : '#CBD5E0', fontSize: '12px', fontWeight: isSelected ? '800' : '600', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(to right, #DC2626, #991B1B)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                }}
              >
                Enter the fog...
              </button>
            </form>
          )}

          {/* ⭐ RATE A HOUSE BUTTON / WIDGET */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '14px 16px', borderRadius: '18px', border: '1px solid #FDA30C', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#FDA30C' }}>⭐ Rate a House</div>
            </div>
            <button
              type="button"
              onClick={() => setShowRatingModal(true)}
              style={{ padding: '8px 16px', background: '#FDA30C', color: '#000', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(253, 163, 12, 0.3)' }}
            >
              Rate Now
            </button>
          </div>

          {/* LIVE WAIT TIMES & SHOW TIMES WIDGET */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: 0, letterSpacing: '0.8px' }}>HOUSE WAIT TIMES</h3>
              <button onClick={fetchThemeParkWaitTimes} disabled={waitsSyncing} style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                {waitsSyncing ? '🔄 Syncing...' : '🔄 Refresh'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              {houseGridLayout.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '8px' }}>
                  {row.map((item) => {
                    const waitMins = liveWaitTimes[item.apiKey] ?? 30;
                    const style = getWaitBoxStyle(waitMins);
                    return (
                      <div
                        key={item.name}
                        onClick={() => { setRideName(item.apiKey); if (waitMins >= 0) setPostedWaitTime(waitMins.toString()); }}
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: '12px',
                          padding: '10px 4px',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: '800', color: style.numColor }}>
                          {waitMins < 0 ? 'CLOSED' : `${waitMins}m`}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: style.titleColor, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>RIDE WAIT TIMES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              {rideGridLayout.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '8px' }}>
                  {row.map((item) => {
                    const waitMins = liveWaitTimes[item.apiKey] ?? 20;
                    const style = getWaitBoxStyle(waitMins);
                    return (
                      <div
                        key={item.name}
                        onClick={() => { setRideName(item.apiKey); if (waitMins >= 0) setPostedWaitTime(waitMins.toString()); }}
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: '12px',
                          padding: '10px 4px',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: '800', color: style.numColor }}>
                          {waitMins < 0 ? 'CLOSED' : `${waitMins}m`}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: style.titleColor, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>SHOW TIMES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: '#1A1A26', padding: '10px 12px', borderRadius: '12px', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FF5500', marginBottom: '4px' }}>🔥 Nightmare Fuel: Blood Noir</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F3F4F6' }}>8:00 • 9:30 • 11:00 • 12:30</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 12px', borderRadius: '12px', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#3B82F6', marginBottom: '4px' }}>🌊 Stranger Things (Lagoon Show)</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F3F4F6' }}>9:00 • 9:45 • 10:30 • 11:15 • 12:00 • 12:45</div>
              </div>
            </div>
          </div>

          {/* TOTALS & SUMMARY STATS WIDGET */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>TOTALS</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
              <div style={{ background: '#1A1A26', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF5500' }}>{totalEventVisits}</div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>PARK VISITS</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#DC2626' }}>{totalHousesCount}</div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>HOUSES</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#3B82F6' }}>{totalRidesCount}</div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>RIDES</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>{totalShowsCount}</div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>SHOWS</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '15px' }}>
              <div style={{ background: '#1A1A26', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#A855F7' }}>{formatMinutes(totalTimeInParkMins)}</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TIME IN PARKS</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#F97316' }}>{formatMinutes(totalTimeInLinesMins)}</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TIME IN LINES</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#EF4444' }}>{lineTimePercentage}%</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>WAITING IN LINE</div>
              </div>
            </div>

            <div style={{ background: '#1C130D', padding: '12px 15px', borderRadius: '14px', border: '1px solid #C05621', borderLeft: '5px solid #FF5500', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#FF9A56', marginBottom: '3px', letterSpacing: '0.5px' }}>⭐ TOP HOUSE</div>
              <div style={{ fontWeight: '800', color: '#F3F4F6', fontSize: '15px' }}>
                {topHouseData ? `${itemEmojis[topHouseData.name] || '🏚️'} ${topHouseData.name}` : 'None Logged Yet'}
              </div>
              {topHouseData && (
                <div style={{ color: '#CBD5E0', marginTop: '3px', fontSize: '12px' }}>
                  Logged <strong>{topHouseData.count}x</strong> | Total Wait: <strong style={{ color: '#FF5500' }}>{formatMinutes(topHouseData.totalWait)}</strong> | Avg Wait: <strong>{topHouseData.avgWait}m</strong>
                </div>
              )}
            </div>

            <div style={{ background: '#0D1726', padding: '12px 15px', borderRadius: '14px', border: '1px solid #1E40AF', borderLeft: '5px solid #3B82F6', marginBottom: '18px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#60A5FA', marginBottom: '3px', letterSpacing: '0.5px' }}>🎢 TOP RIDE</div>
              <div style={{ fontWeight: '800', color: '#F3F4F6', fontSize: '15px' }}>
                {topRideData ? `${itemEmojis[topRideData.name] || '🎢'} ${topRideData.name}` : 'None Logged Yet'}
              </div>
              {topRideData && (
                <div style={{ color: '#CBD5E0', marginTop: '3px', fontSize: '12px' }}>
                  Logged <strong>{topRideData.count}x</strong> | Total Wait: <strong style={{ color: '#3B82F6' }}>{formatMinutes(topRideData.totalWait)}</strong> | Avg Wait: <strong>{topRideData.avgWait}m</strong>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 10px 0', letterSpacing: '0.8px' }}>AVERAGES</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
              <div style={{ background: '#1A1A26', padding: '10px 2px', borderRadius: '10px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#F3F4F6' }}>{avgHousesPerVisit}</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>HOUSES</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 2px', borderRadius: '10px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#F3F4F6' }}>{avgRidesPerVisit}</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>RIDES</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 2px', borderRadius: '10px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#F3F4F6' }}>{avgShowsPerVisit}</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>SHOWS</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#1A1A26', padding: '10px 2px', borderRadius: '10px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#F3F4F6' }}>{formatMinutes(avgDurationPerVisit)}</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>TIME IN PARKS</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 2px', borderRadius: '10px', textAlign: 'center', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#F3F4F6' }}>{avgWaitPerActivity}m</div>
                <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px' }}>WAIT TIME</div>
              </div>
            </div>

          </div>

          <PretzelTracker
            regularPretzels={regularPretzels}
            cinnamonPretzels={cinnamonPretzels}
            updatePretzelCount={updatePretzelCount}
          />
        </div>
      )}

      {/* SUBTAB: HISTORY */}
      {trackerSubTab === 'History' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#FF5500', paddingLeft: '5px' }}>
            History ({visits.length})
          </h2>
          {loading ? (
            <p style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '14px', margin: '20px 0' }}>Syncing with cloud...</p>
          ) : visits.length === 0 ? (
            <p style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '14px', marginTop: '20px', fontStyle: 'italic' }}>No completed visits found.</p>
          ) : (
            visits.map((v) => {
              const partyList = parseAttendees(v.attendees);
              const departureGroups: Record<string, string[]> = {};
              partyList.forEach(m => {
                const pTime = getPersonEndTime(v, m);
                if (!departureGroups[pTime]) departureGroups[pTime] = [];
                departureGroups[pTime].push(m);
              });

              const uniqueDepTimes = Object.keys(departureGroups);
              const hasStaggeredCheckout = uniqueDepTimes.length > 1;

              return (
                <div key={v.id} style={{ border: '1px solid #2A2A3C', borderRadius: '20px', padding: '16px', marginBottom: '12px', background: 'rgba(18, 18, 26, 0.85)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ borderBottom: '1px solid #2A2A3C', paddingBottom: '8px', marginBottom: '10px' }}>
                    <strong style={{ color: '#FF5500', fontSize: '16px', fontWeight: '800' }}>
                      📅 {formatDisplayDate(v.visitDate)}
                    </strong>
                  </div>

                  <div style={{ fontSize: '13px', color: '#CBD5E0', marginBottom: '10px' }}>
                    👥 <strong>Party:</strong> {partyList.join(', ')} <br />
                    
                    {!hasStaggeredCheckout ? (
                      <div style={{ marginTop: '2px' }}>
                        ⏱️ <strong>Hours:</strong> {format12Hour(v.startTime)} - {format12Hour(v.endTime)} <span style={{ color: '#FF5500', fontWeight: 'bold' }}>{calculateVisitDuration(v.startTime, v.endTime)}</span>
                      </div>
                    ) : (
                      <div style={{ marginTop: '6px', background: '#1A1A26', padding: '8px 10px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#FF5500', marginBottom: '4px' }}>⏱️ HOURS:</div>
                        {uniqueDepTimes.map(depTime => (
                          <div key={depTime} style={{ fontSize: '12px', color: '#CBD5E0', marginTop: '2px' }}>
                            • <strong>{departureGroups[depTime].join(', ')}:</strong> {format12Hour(v.startTime)} - {format12Hour(depTime)} <span style={{ color: '#FF5500', fontWeight: '600' }}>{calculateVisitDuration(v.startTime, depTime)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {v.activities.length > 0 && (
                    <div style={{ background: '#1A1A26', padding: '12px', borderRadius: '12px', border: '1px solid #2A2A3C' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {v.activities.map((a: any) => {
                          const isEditingThis = editingActivityId === a.id && editingVisitId === v.id;
                          const actRidersList = parseAttendees(a.riders);

                          return isEditingThis ? (
                            <div key={a.id} style={{ background: '#12121A', border: '1px solid #2A2A3C', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', width: '100%' }}>
                              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#FF5500', marginBottom: '6px' }}>EDIT ENTRY</div>
                              <select value={editRideName} onChange={(e) => setEditRideName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px', marginBottom: '6px', boxSizing: 'border-box' }}>
                                <optgroup label="Houses">
                                  {hhnHouses.map((house) => (
                                    <option key={house} value={house}>{house}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Rides">
                                  {hhnRides.map((ride) => (
                                    <option key={ride} value={ride}>{ride}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Shows">
                                  {hhnShows.map((show) => (
                                    <option key={show} value={show}>{show}</option>
                                  ))}
                                </optgroup>
                              </select>

                              <div style={{ marginBottom: '6px' }}>
                                <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>WHO DID THIS?</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {partyList.map((m) => {
                                    const checked = editRiders.includes(m);
                                    return (
                                      <button key={m} type="button" onClick={() => toggleEditRiderSelection(m)} style={{ padding: '4px 8px', borderRadius: '6px', border: checked ? '1px solid #FF5500' : '1px solid #2A2A3C', background: checked ? '#FF5500' : '#12121A', color: checked ? '#FFF' : '#A0AEC0', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        {m}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editWaitTime}
                                  onChange={(e) => setEditWaitTime(e.target.value)}
                                  placeholder="Wait (mins)"
                                  style={{ flex: 1, minWidth: '90px', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px', boxSizing: 'border-box' }}
                                />
                                <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes (optional)" style={{ flex: 1, minWidth: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px', boxSizing: 'border-box' }} />
                              </div>

                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button onClick={() => deleteActivity(a.id)} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
                                <button onClick={cancelEditing} style={{ background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveEditedActivity} style={{ background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#F3F4F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {itemEmojis[a.rideName] || '🎟️'} {a.rideName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                                  ⏱️ {a.waitTimeMinutes} mins wait {a.notes ? `(${a.notes})` : ''}
                                </div>
                                {actRidersList.length > 0 && (
                                  <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                                    👥 {actRidersList.join(', ')}
                                  </div>
                                )}
                              </div>
                              <button onClick={() => startEditing(a, v.id)} style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', padding: '2px 6px', flexShrink: 0 }}>
                                Edit
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #2A2A3C' }}>
                    <button onClick={() => openEditVisit(v)} style={{ background: '#1A1A26', color: '#FF5500', border: '1px solid #FF5500', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>
                      ✏️ Edit Visit Hours
                    </button>
                    <button onClick={() => deleteVisit(v.id)} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '11px', cursor: 'pointer', padding: 0, fontWeight: '700' }}>
                      🗑️ Delete Entire Visit Log
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUBTAB: PARKING */}
      {trackerSubTab === 'Parking' && (
        <div>
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '20px', borderRadius: '24px', border: '1px solid #2A2A3C', marginBottom: '20px', backdropFilter: 'blur(8px)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', fontWeight: '900', color: '#FF5500', marginBottom: '14px' }}>
              🚗 Log Your Parking
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>
                WHO'S PARKING?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {familyMembers.map((name) => {
                  const isSelected = parkingAttendees.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleParkingAttendee(name)}
                      style={{
                        padding: '10px 2px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #FF5500' : '1px solid #2A2A3C',
                        background: isSelected ? '#FF5500' : '#1A1A26',
                        color: isSelected ? '#FFF' : '#CBD5E0',
                        fontSize: '12px',
                        fontWeight: isSelected ? '800' : '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>
                SELECT GARAGE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {parkingGarages.map((g) => {
                  const isSelected = parkingGarage === g.name;
                  return (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setParkingGarage(g.name)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: isSelected ? `2px solid #FFF` : '1px solid #2A2A3C',
                        background: isSelected ? g.color : '#1A1A26',
                        color: isSelected ? (g.darkText ? '#000000' : '#FFFFFF') : '#CBD5E0',
                        fontSize: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: isSelected ? `0 4px 14px ${g.color}66` : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>
                ROW NUMBER
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 305"
                value={parkingRowNumber}
                onChange={(e) => setParkingRowNumber(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="button"
              onClick={handleSaveParkingLog}
              disabled={parkingSaving}
              style={{
                width: '100%',
                padding: '14px',
                background: '#FF5500',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 85, 0, 0.4)'
              }}
            >
              {parkingSaving ? 'Saving...' : '💾 Save Parking Spot'}
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#A0AEC0', marginBottom: '12px', letterSpacing: '0.8px' }}>
              TODAY'S PARKING SPOTS ({parkingLogs.length})
            </h3>

            {parkingLogs.length === 0 ? (
              <p style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '13px', fontStyle: 'italic', margin: '20px 0' }}>
                No parking spots logged today.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {parkingLogs.map(log => {
                  const garageInfo = parkingGarages.find(g => g.name === log.garage_name) || parkingGarages[0];
                  const textColor = garageInfo.darkText ? '#000000' : '#FFFFFF';

                  return (
                    <div
                      key={log.id}
                      style={{
                        background: garageInfo.color,
                        color: textColor,
                        borderRadius: '20px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: `0 6px 20px ${garageInfo.color}55`,
                        boxSizing: 'border-box',
                        width: '100%'
                      }}
                    >
                      <img
                        src={garageInfo.file}
                        alt={garageInfo.name}
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                        style={{ width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0 }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '22px', fontWeight: '900', lineHeight: '1.1' }}>
                          Row {log.row_number}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '800', marginTop: '4px', opacity: 0.9 }}>
                          {garageInfo.name} Garage
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', opacity: 0.85 }}>
                          {log.parked_by}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
