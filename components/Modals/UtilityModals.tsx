'use client';

import React from 'react';

export interface UtilityModalsProps {
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
  saveNewHighScoreRecord: () => void;
  triviaError: string | null;
  triviaLoading: boolean;
  currentQuestion: any;
  selectedOption: string | null;
  handleTriviaAnswerSelection: (opt: string) => void;
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
  processCheckout: (type: 'selected' | 'everyone') => void;
  editingVisit: any;
  setEditingVisit: (v: any) => void;
  editVisitStartTime: string;
  setEditVisitStartTime: (t: string) => void;
  editVisitEndTime: string;
  setEditVisitEndTime: (t: string) => void;
  editVisitMemberEndTimes: Record<string, string>;
  setEditVisitMemberEndTimes: (val: Record<string, string>) => void;
  handleSaveVisitEdit: () => void;
  formatDisplayDate: (d: string) => string;
  parseAttendees: (raw: any) => string[];
  familyMembers: string[];
  showAddPartyModal: boolean;
  setShowAddPartyModal: (v: boolean) => void;
  availableToJoin: string[];
  selectedLateMembers: string[];
  toggleLateArrivalMember: (name: string) => void;
  lateArrivalTime: string;
  setLateArrivalTime: (t: string) => void;
  handleAddLateArrivals: () => void;
}

export const UtilityModals: React.FC<UtilityModalsProps> = ({
  weatherLoading,
  hourlyForecast,
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
  activeVisit,
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
  selectedLateMembers,
  toggleLateArrivalMember,
  lateArrivalTime,
  setLateArrivalTime,
  handleAddLateArrivals
}) => {
  return (
    <div>
      {/* 🔮 HORROR MOVIE TRIVIA MODAL */}
      {showAiTriviaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', border: '1px solid #10B981', borderRadius: '24px', padding: '20px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', color: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#10B981' }}>🔮 Horror Movie Trivia</h2>
              <button onClick={() => setShowAiTriviaModal(false)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '18px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            {/* STREAK BADGE */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1, background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0' }}>STREAK</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#10B981' }}>{currentStreak} 🔥</div>
              </div>
              <div style={{ flex: 1, background: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0' }}>RECORD ({triviaDifficulty})</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#F59E0B' }}>{allTimeHighScore} ({allTimeRecordHolder})</div>
              </div>
            </div>

            {/* FILTERS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <select value={triviaCategory} onChange={(e) => handleTriviaFilterChange(e.target.value, undefined)} style={{ background: '#1A1A26', border: '1px solid #2A2A3C', color: '#FFF', borderRadius: '8px', padding: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                <option value="All">All Categories</option>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={triviaDifficulty} onChange={(e) => handleTriviaFilterChange(undefined, e.target.value)} style={{ background: '#1A1A26', border: '1px solid #2A2A3C', color: '#FFF', borderRadius: '8px', padding: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                <option value="All">All Difficulties</option>
                {availableDifficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* QUESTION DISPLAY */}
            {triviaLoading ? (
              <p style={{ textAlign: 'center', color: '#A0AEC0', fontStyle: 'italic', margin: '20px 0' }}>Loading question...</p>
            ) : triviaError ? (
              <p style={{ textAlign: 'center', color: '#EF4444', fontStyle: 'italic', margin: '20px 0' }}>{triviaError}</p>
            ) : currentQuestion ? (
              <div>
                <div style={{ background: '#1A1A26', padding: '14px', borderRadius: '14px', border: '1px solid #2A2A3C', fontSize: '13px', fontWeight: '700', lineHeight: '1.4', marginBottom: '12px' }}>
                  {currentQuestion.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { label: 'A', text: currentQuestion.option_a },
                    { label: 'B', text: currentQuestion.option_b },
                    { label: 'C', text: currentQuestion.option_c },
                    { label: 'D', text: currentQuestion.option_d }
                  ].filter(o => Boolean(o.text)).map(opt => {
                    const isSelected = selectedOption === opt.text || selectedOption === opt.label;
                    const correctVal = currentQuestion.correct_answer?.trim()?.toUpperCase();
                    const isCorrectOpt = opt.label === correctVal || opt.text === currentQuestion.correct_answer;

                    let bg = '#1A1A26';
                    let border = '#2A2A3C';

                    if (selectedOption) {
                      if (isCorrectOpt) {
                        bg = '#064E3B';
                        border = '#10B981';
                      } else if (isSelected) {
                        bg = '#7F1D1D';
                        border = '#EF4444';
                      }
                    }

                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleTriviaAnswerSelection(opt.text)}
                        disabled={selectedOption !== null}
                        style={{ background: bg, border: `1px solid ${border}`, color: '#FFF', padding: '10px 12px', borderRadius: '10px', textAlign: 'left', fontSize: '12px', fontWeight: '700', cursor: selectedOption ? 'default' : 'pointer' }}
                      >
                        <strong>{opt.label}.</strong> {opt.text}
                      </button>
                    );
                  })}
                </div>

                {/* NEW HIGH SCORE CLAIM */}
                {newHighScorePending && (
                  <div style={{ background: '#2B1408', border: '1px solid #F59E0B', padding: '10px', borderRadius: '10px', marginBottom: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: '#F59E0B', marginBottom: '6px' }}>🎉 NEW HIGH SCORE RECORD!</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select value={recordClaimName} onChange={(e) => setRecordClaimName(e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: '6px', background: '#1A1A26', color: '#FFF', border: '1px solid #2A2A3C', fontSize: '12px' }}>
                        {familyMembers.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button onClick={saveNewHighScoreRecord} style={{ padding: '6px 12px', background: '#F59E0B', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}>Claim</button>
                    </div>
                  </div>
                )}

                {selectedOption && (
                  <button onClick={handleNextTriviaQuestion} style={{ width: '100%', padding: '12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                    Next Question ➔
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 📖 GAME LEARN MORE MODAL */}
      {activeLearnMoreGame && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', border: `1px solid ${activeLearnMoreColor}`, borderRadius: '24px', padding: '20px', width: '100%', maxWidth: '400px', maxH: '85vh', overflowY: 'auto', color: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: activeLearnMoreColor }}>{activeLearnMoreGame.name}</h3>
              <button onClick={() => setActiveLearnMoreGame(null)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '18px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#CBD5E0', lineHeight: '1.5', whiteSpace: 'pre-line', margin: '0 0 16px 0' }}>
              {activeLearnMoreGame.description}
            </p>
            {activeLearnMoreGame.externalLink && (
              <a href={activeLearnMoreGame.externalLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: activeLearnMoreColor, color: '#FFF', textDecoration: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>
                Open Game Link ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* 🖼️ YUM IMAGE PREVIEW MODAL */}
      {previewYumImage && (
        <div onClick={() => setPreviewYumImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px', cursor: 'pointer' }}>
          <img src={previewYumImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', border: '2px solid #2A2A3C', objectFit: 'contain' }} />
        </div>
      )}

      {/* 🚪 CHECKOUT MODAL */}
      {showCheckoutModal && activeVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', border: '1px solid #DC2626', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '380px', color: '#FFF' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '900', color: '#DC2626' }}>Who is Leaving the Park?</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {activePartyList.map(m => {
                const isLeaving = departingMembers.includes(m);
                return (
                  <button key={m} onClick={() => toggleDepartingMember(m)} style={{ padding: '6px 12px', borderRadius: '8px', border: isLeaving ? '1px solid #DC2626' : '1px solid #2A2A3C', background: isLeaving ? '#DC2626' : '#1A1A26', color: '#FFF', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {m}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => processCheckout('selected')} style={{ padding: '10px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Checkout Selected ({departingMembers.length})</button>
              <button onClick={() => processCheckout('everyone')} style={{ padding: '10px', background: '#991B1B', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Checkout Everyone ({activePartyList.length})</button>
              <button onClick={() => setShowCheckoutModal(false)} style={{ padding: '8px', background: 'none', color: '#A0AEC0', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ EDIT VISIT HOURS MODAL */}
      {editingVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', border: '1px solid #FF5500', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '380px', color: '#FFF' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '900', color: '#FF5500' }}>Edit Visit Hours ({formatDisplayDate(editingVisit.visitDate)})</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: 'bold' }}>START TIME</label>
                <input type="text" value={editVisitStartTime} onChange={(e) => setEditVisitStartTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: 'bold' }}>END TIME</label>
                <input type="text" value={editVisitEndTime} onChange={(e) => setEditVisitEndTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>INDIVIDUAL DEPARTURES</label>
              {parseAttendees(editingVisit.attendees).map(m => (
                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px' }}>{m}:</span>
                  <input
                    type="text"
                    value={editVisitMemberEndTimes[m] || editVisitEndTime}
                    onChange={(e) => setEditVisitMemberEndTimes({ ...editVisitMemberEndTimes, [m]: e.target.value })}
                    style={{ width: '100px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', textAlign: 'right' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditingVisit(null)} style={{ flex: 1, padding: '8px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveVisitEdit} style={{ flex: 1, padding: '8px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* 👥 ADD LATE ARRIVALS MODAL */}
      {showAddPartyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', border: '1px solid #2A2A3C', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '400px', color: '#FFF' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '900', color: '#FF5500' }}>Add People to Party</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>WHO'S JOINING?</label>
              {availableToJoin.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>Everyone in your group is already checked in!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {availableToJoin.map(name => {
                    const isSelected = selectedLateMembers.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleLateArrivalMember(name)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #FF5500' : '1px solid #2A2A3C',
                          background: isSelected ? '#FF5500' : '#1A1A26',
                          color: '#FFF',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAddPartyModal(false)} style={{ flex: 1, padding: '10px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddLateArrivals} disabled={selectedLateMembers.length === 0} style={{ flex: 1, padding: '10px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: selectedLateMembers.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedLateMembers.length === 0 ? 0.5 : 1 }}>Add Selected</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
