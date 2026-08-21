'use client';

import React from 'react';

interface UtilityModalsProps {
  weatherLoading: boolean;
  hourlyForecast: Array<{ hourLabel: string; temp: number; pop: number }>;
  showAiTriviaModal: boolean;
  setShowAiTriviaModal: (v: boolean) => void;
  triviaDifficulty: string;
  allTimeRecordHolder: string;
  allTimeHighScore: number;
  currentStreak: number;
  triviaCategory: string;
  handleTriviaFilterChange: (cat?: string, diff?: string) => void;
  availableCategories: string[];
  availableDifficulties: string[];
  newHighScorePending: boolean;
  recordClaimName: string;
  setRecordClaimName: (name: string) => void;
  saveNewHighScoreRecord: () => Promise<void>;
  triviaError: string | null;
  triviaLoading: boolean;
  currentQuestion: any;
  selectedOption: string | null;
  handleTriviaAnswerSelection: (option: string) => void;
  handleNextTriviaQuestion: () => void;
  triviaDeck: any[];
  activeLearnMoreGame: any;
  setActiveLearnMoreGame: (g: any) => void;
  activeLearnMoreColor: string;
  previewYumImage: string | null;
  setPreviewYumImage: (img: string | null) => void;
  showCheckoutModal: boolean;
  setShowCheckoutModal: (v: boolean) => void;
  activeVisit: any;
  activePartyList: string[];
  departingMembers: string[];
  toggleDepartingMember: (name: string) => void;
  processCheckout: (type: 'selected' | 'everyone') => Promise<void>;
  editingVisit: any;
  setEditingVisit: (v: any) => void;
  editVisitStartTime: string;
  setEditVisitStartTime: (t: string) => void;
  editVisitEndTime: string;
  setEditVisitEndTime: (t: string) => void;
  editVisitMemberEndTimes: Record<string, string>;
  setEditVisitMemberEndTimes: (val: Record<string, string>) => void;
  handleSaveVisitEdit: () => Promise<void>;
  formatDisplayDate: (d: string) => string;
  parseAttendees: (raw: any) => string[];
  familyMembers: string[];
  showAddPartyModal: boolean;
  setShowAddPartyModal: (v: boolean) => void;
  availableToJoin: string[];
  lateArrivalMember: string;
  setLateArrivalMember: (m: string) => void;
  lateArrivalTime: string;
  setLateArrivalTime: (t: string) => void;
  handleAddLateArrival: () => Promise<void>;
}

export const UtilityModals: React.FC<UtilityModalsProps> = ({
  showAiTriviaModal,
  setShowAiTriviaModal,
  triviaDifficulty,
  allTimeRecordHolder,
  allTimeHighScore,
  currentStreak,
  triviaCategory,
  handleTriviaFilterChange,
  availableCategories,
  availableDifficulties,
  newHighScorePending,
  recordClaimName,
  setRecordClaimName,
  saveNewHighScoreRecord,
  triviaError,
  triviaLoading,
  currentQuestion,
  selectedOption,
  handleTriviaAnswerSelection,
  handleNextTriviaQuestion,
  triviaDeck,
  activeLearnMoreGame,
  setActiveLearnMoreGame,
  activeLearnMoreColor,
  previewYumImage,
  setPreviewYumImage,
  showCheckoutModal,
  setShowCheckoutModal,
  activePartyList,
  departingMembers,
  toggleDepartingMember,
  processCheckout,
  editingVisit,
  setEditingVisit,
  editVisitStartTime,
  setEditVisitStartTime,
  editVisitEndTime,
  setEditVisitEndTime,
  editVisitMemberEndTimes,
  setEditVisitMemberEndTimes,
  handleSaveVisitEdit,
  formatDisplayDate,
  parseAttendees,
  familyMembers,
  showAddPartyModal,
  setShowAddPartyModal,
  availableToJoin,
  lateArrivalMember,
  setLateArrivalMember,
  lateArrivalTime,
  setLateArrivalTime,
  handleAddLateArrival
}) => {
  return (
    <div>
      {/* 🔮 HORROR MOVIE TRIVIA MODAL */}
      {showAiTriviaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '440px', width: '100%', border: '2px solid #10B981', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#10B981' }}>🔮 Horror Trivia</h3>
              <button onClick={() => setShowAiTriviaModal(false)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#1A1A26', padding: '10px 12px', borderRadius: '12px', border: '1px solid #2A2A3C', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0' }}>RECORD ({triviaDifficulty}):</div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#F59E0B' }}>🏆 {allTimeRecordHolder}: {allTimeHighScore}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0' }}>STREAK:</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#10B981' }}>🔥 {currentStreak}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>CATEGORY</label>
                <select value={triviaCategory} onChange={(e) => handleTriviaFilterChange(e.target.value, undefined)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}>
                  <option value="All">All Categories</option>
                  {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>DIFFICULTY</label>
                <select value={triviaDifficulty} onChange={(e) => handleTriviaFilterChange(undefined, e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}>
                  <option value="All">All Difficulties</option>
                  {availableDifficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {newHighScorePending && (
              <div style={{ background: '#2D1B00', border: '1px solid #F59E0B', borderRadius: '12px', padding: '10px', marginBottom: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#F59E0B' }}>🎉 NEW ALL-TIME RECORD! ({allTimeHighScore})</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <select value={recordClaimName} onChange={(e) => setRecordClaimName(e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px' }}>
                    {familyMembers.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button onClick={saveNewHighScoreRecord} style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer' }}>Claim</button>
                </div>
              </div>
            )}

            {triviaError ? (
              <div style={{ color: '#EF4444', textAlign: 'center', fontSize: '13px', padding: '20px 0' }}>{triviaError}</div>
            ) : triviaLoading ? (
              <div style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '13px', padding: '20px 0' }}>🔮 Shuffling questions...</div>
            ) : currentQuestion ? (
              <div>
                <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#10B981', marginBottom: '4px' }}>
                    {currentQuestion.category} • <span style={{ color: '#A0AEC0' }}>{currentQuestion.difficulty}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFF', lineHeight: '1.4' }}>
                    {currentQuestion.question}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { key: 'A', text: currentQuestion.option_a },
                    { key: 'B', text: currentQuestion.option_b },
                    { key: 'C', text: currentQuestion.option_c },
                    { key: 'D', text: currentQuestion.option_d }
                  ].map(opt => {
                    if (!opt.text) return null;
                    const isSelected = selectedOption === opt.text;
                    const correctVal = currentQuestion.correct_answer?.trim()?.toUpperCase();
                    const isCorrectOpt = opt.key === correctVal || opt.text === currentQuestion.correct_answer;

                    let bg = '#1A1A26';
                    let border = '1px solid #2A2A3C';
                    let color = '#CBD5E0';

                    if (selectedOption !== null) {
                      if (isCorrectOpt) {
                        bg = '#064E3B';
                        border = '1px solid #10B981';
                        color = '#FFF';
                      } else if (isSelected) {
                        bg = '#7F1D1D';
                        border = '1px solid #EF4444';
                        color = '#FFF';
                      }
                    }

                    return (
                      <button key={opt.key} onClick={() => handleTriviaAnswerSelection(opt.text)} disabled={selectedOption !== null} style={{ background: bg, border, color, borderRadius: '10px', padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '700', cursor: selectedOption === null ? 'pointer' : 'default', transition: 'all 0.15s ease' }}>
                        {opt.key}. {opt.text}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <button onClick={handleNextTriviaQuestion} style={{ width: '100%', padding: '12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}>
                    Next Question ➔
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 📖 LEARN MORE GAME MODAL */}
      {activeLearnMoreGame && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '420px', width: '100%', border: `2px solid ${activeLearnMoreColor}`, boxShadow: `0 10px 30px ${activeLearnMoreColor}44`, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: activeLearnMoreColor }}>{activeLearnMoreGame.name}</h3>
              <button onClick={() => setActiveLearnMoreGame(null)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '800', color: '#A0AEC0', marginBottom: '12px' }}>
              👥 PLAYERS: <span style={{ color: '#FFF' }}>{activeLearnMoreGame.players}</span>
            </div>

            <div style={{ fontSize: '13px', color: '#CBD5E0', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
              {activeLearnMoreGame.description}
            </div>

            {activeLearnMoreGame.externalLink && (
              <a href={activeLearnMoreGame.externalLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px', background: activeLearnMoreColor, color: '#FFF', borderRadius: '10px', textDecoration: 'none', fontWeight: '900', fontSize: '13px' }}>
                Open Web Game ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* 📷 YUM IMAGE PREVIEW MODAL */}
      {previewYumImage && (
        <div onClick={() => setPreviewYumImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh' }}>
            <img src={previewYumImage} alt="Yum Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px', border: '2px solid #F59E0B' }} />
            <button onClick={() => setPreviewYumImage(null)} style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#F59E0B', color: '#000', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      {/* 🚪 DEPARTURE / CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '400px', width: '100%', border: '2px solid #DC2626', boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#FF5500' }}>Leaving Park</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#A0AEC0', fontWeight: '600' }}>Who is departing the park right now?</p>
            </div>

            {/* MEMBER TOGGLE LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {activePartyList.map(member => {
                const isLeaving = departingMembers.includes(member);
                return (
                  <button
                    key={member}
                    type="button"
                    onClick={() => toggleDepartingMember(member)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      border: isLeaving ? '2px solid #DC2626' : '1px solid #2A2A3C',
                      background: isLeaving ? '#2A0B0D' : '#1A1A26',
                      color: isLeaving ? '#FF8888' : '#A0AEC0',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isLeaving ? '#FFF' : '#CBD5E0' }}>
                      👤 {member}
                    </span>
                    <span>
                      {isLeaving ? '🚪 Leaving' : '🎃 Staying'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => processCheckout('selected')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#DC2626',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                }}
              >
                Check Out Selected ({departingMembers.length})
              </button>

              <button
                type="button"
                onClick={() => processCheckout('everyone')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#1A1A26',
                  color: '#CBD5E0',
                  border: '1px solid #2A2A3C',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Check Out Everyone
              </button>

              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A0AEC0',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '6px 0',
                  textAlign: 'center'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ EDIT VISIT HOURS MODAL */}
      {editingVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '400px', width: '100%', border: '2px solid #FF5500', boxShadow: '0 10px 30px rgba(255, 85, 0, 0.3)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>✏️ Edit Visit Hours</h3>
              <button onClick={() => setEditingVisit(null)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '800', color: '#CBD5E0', marginBottom: '12px' }}>
              📅 {formatDisplayDate(editingVisit.visitDate)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>ARRIVAL TIME</label>
                <input type="text" value={editVisitStartTime} onChange={(e) => setEditVisitStartTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>FINAL DEPARTURE</label>
                <input type="text" value={editVisitEndTime} onChange={(e) => setEditVisitEndTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #2A2A3C', paddingTop: '10px', marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#FF5500', display: 'block', marginBottom: '8px' }}>INDIVIDUAL DEPARTURES:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {parseAttendees(editingVisit.attendees).map(m => (
                  <div key={m} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#CBD5E0' }}>{m}</span>
                    <input
                      type="text"
                      value={editVisitMemberEndTimes[m] || ''}
                      onChange={(e) => setEditVisitMemberEndTimes({ ...editVisitMemberEndTimes, [m]: e.target.value })}
                      placeholder={editVisitEndTime || '12:00 AM'}
                      style={{ width: '110px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSaveVisitEdit} style={{ width: '100%', padding: '12px', background: '#FF5500', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>
              Save Visit Hours
            </button>
          </div>
        </div>
      )}

      {/* ➕ ADD LATE ARRIVAL MODAL */}
      {showAddPartyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '380px', width: '100%', border: '2px solid #FF5500', boxShadow: '0 10px 30px rgba(255, 85, 0, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>➕ Someone Arrived Late?</h3>
              <button onClick={() => setShowAddPartyModal(false)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            {availableToJoin.length === 0 ? (
              <p style={{ color: '#A0AEC0', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', margin: '20px 0' }}>Everyone in the family is already in the park!</p>
            ) : (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>WHO ARRIVED?</label>
                  <select value={lateArrivalMember} onChange={(e) => setLateArrivalMember(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px', fontWeight: 'bold' }}>
                    {availableToJoin.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>ARRIVAL TIME</label>
                  <input
                    type="text"
                    placeholder="e.g. 8:15 PM"
                    value={lateArrivalTime}
                    onChange={(e) => setLateArrivalTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '14px', fontWeight: 'bold', boxSizing: 'border-box' }}
                  />
                </div>

                <button onClick={handleAddLateArrival} style={{ width: '100%', padding: '12px', background: '#FF5500', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}>
                  Add to Active Party
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
