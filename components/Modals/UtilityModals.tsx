'use client';

import React from 'react';

interface UtilityModalsProps {
  // Weather State
  weatherLoading: boolean;
  hourlyForecast: Array<{ hourLabel: string; temp: number; pop: number }>;

  // Trivia Modal State
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

  // Game Learn More State
  activeLearnMoreGame: any;
  setActiveLearnMoreGame: (game: any) => void;
  activeLearnMoreColor: string;

  // Yum Image State
  previewYumImage: string | null;
  setPreviewYumImage: (img: string | null) => void;

  // Checkout State
  showCheckoutModal: boolean;
  setShowCheckoutModal: (v: boolean) => void;
  activeVisit: any;
  activePartyList: string[];
  departingMembers: string[];
  toggleDepartingMember: (name: string) => void;
  processCheckout: (type: 'selected' | 'everyone') => void;

  // Edit Visit State
  editingVisit: any;
  setEditingVisit: (visit: any) => void;
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
  familyMembers
}) => {
  return (
    <>


      {/* 😱 LIVE TRIVIA MODAL */}
      {showAiTriviaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '20px', maxWidth: '92vw', width: '460px', border: '2px solid #FF5500', boxShadow: '0 10px 30px rgba(255, 85, 0, 0.3)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>😱 Horror Trivia</h3>
              <button onClick={() => setShowAiTriviaModal(false)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#1A1A26', borderRadius: '12px', padding: '8px 10px', border: '1px solid #2A2A3C', marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#EAB308', marginBottom: '4px', textAlign: 'center' }}>
                🏆 {triviaDifficulty === 'All' ? 'All Difficulties' : triviaDifficulty} Record: <span style={{ color: '#FFF' }}>{allTimeRecordHolder}</span> ({allTimeHighScore})
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', textTransform: 'uppercase', textAlign: 'center' }}>
                <div style={{ background: '#12121A', padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', color: '#FF5500' }}>
                  🔥 Current Streak: {currentStreak}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', width: '100%', boxSizing: 'border-box' }}>
              <select value={triviaCategory} onChange={(e) => handleTriviaFilterChange(e.target.value, undefined)} style={{ width: '100%', padding: '8px 4px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}>
                <option value="All">All Categories</option>
                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select value={triviaDifficulty} onChange={(e) => handleTriviaFilterChange(undefined, e.target.value)} style={{ width: '100%', padding: '8px 4px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}>
                <option value="All">All Difficulties</option>
                {availableDifficulties.map(diff => <option key={diff} value={diff}>{diff === 'Hard' || diff === 'Fiendishly Hard' ? 'Horror' : diff}</option>)}
              </select>
            </div>

            {newHighScorePending && (
              <div style={{ background: 'linear-gradient(135deg, #1C130D 0%, #2B1408 100%)', border: '1px solid #FDA30C', padding: '10px 12px', borderRadius: '12px', marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#FDA30C', marginBottom: '6px' }}>
                  🎉 NEW {triviaDifficulty === 'All' ? 'ALL DIFFICULTIES' : triviaDifficulty.toUpperCase()} RECORD: {allTimeHighScore}!
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select value={recordClaimName} onChange={(e) => setRecordClaimName(e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}>
                    {familyMembers.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button onClick={saveNewHighScoreRecord} style={{ padding: '6px 12px', background: '#FDA30C', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}>Save</button>
                </div>
              </div>
            )}

            {triviaError && (
              <div style={{ background: '#2C0B0E', border: '1px solid #DC2626', color: '#FCA5A5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '12px' }}>{triviaError}</div>
            )}

            {triviaLoading ? (
              <div style={{ textTransform: 'uppercase', textAlign: 'center', padding: '30px 0', color: '#FF9A56', fontSize: '13px', fontWeight: 'bold' }}>⚡ Loading Trivia Deck...</div>
            ) : currentQuestion ? (
              <div>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#FFF', marginBottom: '12px', lineHeight: '1.4' }}>{currentQuestion.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { letter: 'A', text: currentQuestion.option_a },
                    { letter: 'B', text: currentQuestion.option_b },
                    { letter: 'C', text: currentQuestion.option_c },
                    { letter: 'D', text: currentQuestion.option_d }
                  ].filter(item => Boolean(item.text)).map((item) => {
                    const isSelected = selectedOption === item.text || selectedOption === item.letter;
                    const correctVal = currentQuestion.correct_answer?.trim()?.toUpperCase();
                    const isCorrect = correctVal === item.letter || correctVal === item.text?.trim()?.toUpperCase();

                    let btnBg = '#1A1A26';
                    let btnBorder = '#2A2A3C';

                    if (selectedOption) {
                      if (isCorrect) { btnBg = '#0B231A'; btnBorder = '#22C55E'; }
                      else if (isSelected) { btnBg = '#2C0B0E'; btnBorder = '#DC2626'; }
                    }

                    return (
                      <button key={item.letter} onClick={() => handleTriviaAnswerSelection(item.letter)} style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${btnBorder}`, background: btnBg, color: '#FFF', fontSize: '13px', fontWeight: '700', textAlign: 'left', cursor: 'pointer' }}>
                        <span style={{ color: '#FF5500', marginRight: '6px' }}>{item.letter}.</span> {item.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <button onClick={handleNextTriviaQuestion} disabled={triviaLoading || triviaDeck.length === 0} style={{ width: '100%', padding: '12px', background: '#FF5500', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Next Question</button>
          </div>
        </div>
      )}

      {/* GAME LEARN MORE MODAL */}
      {activeLearnMoreGame && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '460px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: `2px solid ${activeLearnMoreColor}`, boxShadow: `0 10px 30px ${activeLearnMoreColor}44` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#FFF' }}>{activeLearnMoreGame.name}</h3>
              <button onClick={() => setActiveLearnMoreGame(null)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer', padding: 0 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0' }}>👤 Players: {activeLearnMoreGame.players}</span>
              {activeLearnMoreGame.appRequired && (
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#3B82F6' }}>• 📱 App Required</span>
              )}
            </div>
            <div style={{ background: '#1A1A26', padding: '14px', borderRadius: '14px', border: '1px solid #2A2A3C', fontSize: '13px', color: '#CBD5E0', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '16px' }}>
              {activeLearnMoreGame.description}
            </div>
            {activeLearnMoreGame.externalLink && (
              <a href={activeLearnMoreGame.externalLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '12px', background: activeLearnMoreColor, color: '#FFF', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
                🎮 Play Game Now ↗
              </a>
            )}
            <button onClick={() => setActiveLearnMoreGame(null)} style={{ width: '100%', padding: '12px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* YUM FULLSCREEN PHOTO MODAL */}
      {previewYumImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <button onClick={() => setPreviewYumImage(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#FFF', fontSize: '24px', fontWeight: '900', cursor: 'pointer' }}>✕ Close</button>
            <img src={previewYumImage} alt="Food Preview" style={{ width: '100%', height: 'auto', maxHeight: '80vh', borderRadius: '18px', objectFit: 'contain', border: '1px solid #2A2A3C', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }} />
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && activeVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '400px', width: '100%', border: '1px solid #2A2A3C', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>Leaving Park</h3>
            <p style={{ fontSize: '13px', color: '#A0AEC0', margin: '0 0 16px 0' }}>Who is departing the park right now?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {activePartyList.map((member) => {
                const isSelected = departingMembers.includes(member);
                return (
                  <button key={member} type="button" onClick={() => toggleDepartingMember(member)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', border: isSelected ? '2px solid #DC2626' : '1px solid #2A2A3C', background: isSelected ? '#2C0B0E' : '#1A1A26', color: isSelected ? '#FCA5A5' : '#CBD5E0', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                    <span>👤 {member}</span>
                    <span>{isSelected ? '🚪 Leaving' : '🎃 Staying'}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button type="button" onClick={() => processCheckout('selected')} style={{ width: '100%', padding: '12px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                Check Out Selected ({departingMembers.length})
              </button>
              <button type="button" onClick={() => processCheckout('everyone')} style={{ width: '100%', padding: '10px', background: '#2A2A3C', color: '#F3F4F6', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                Check Out Everyone
              </button>
              <button type="button" onClick={() => setShowCheckoutModal(false)} style={{ width: '100%', padding: '8px', background: 'none', color: '#A0AEC0', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VISIT MODAL */}
      {editingVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #2A2A3C', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>✏️ Edit Visit Hours</h3>
            <p style={{ fontSize: '12px', color: '#A0AEC0', margin: '0 0 16px 0' }}>{editingVisit.parkName} • {formatDisplayDate(editingVisit.visitDate)}</p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E0', display: 'block', marginBottom: '4px' }}>⏰ ARRIVAL TIME</label>
              <input type="text" placeholder="e.g. 6:30 PM" value={editVisitStartTime} onChange={(e) => setEditVisitStartTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E0', display: 'block', marginBottom: '4px' }}>🚪 MAIN DEPARTURE TIME</label>
              <input type="text" placeholder="e.g. 2:00 AM" value={editVisitEndTime} onChange={(e) => setEditVisitEndTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E0', display: 'block', marginBottom: '6px' }}>👥 MEMBER DEPARTURE TIMES</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {parseAttendees(editingVisit.attendees).map(member => (
                  <div key={member} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1A1A26', padding: '8px 10px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#F3F4F6' }}>👤 {member}</span>
                    <input type="text" placeholder={editVisitEndTime || "e.g. 1:30 AM"} value={editVisitMemberEndTimes[member] || ''} onChange={(e) => setEditVisitMemberEndTimes({ ...editVisitMemberEndTimes, [member]: e.target.value })} style={{ width: '120px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#12121A', color: '#FFF', fontSize: '16px', textAlign: 'center' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setEditingVisit(null)} style={{ flex: 1, padding: '12px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button type="button" onClick={handleSaveVisitEdit} style={{ flex: 2, padding: '12px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
