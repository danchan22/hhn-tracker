'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseAnonKey);
};

const PRETZEL_MEMBERS = [
  'Dandie', 'Elijah', 'Jasmine', 'Kimbo', 'Sophia', 'Violette', 'Zach'
];

interface PretzelTrackerProps {
  familyMembers?: string[];
}

export const PretzelTracker: React.FC<PretzelTrackerProps> = () => {
  const [memberLogs, setMemberLogs] = useState<Record<string, { regular: number; cinnamon: number }>>(() => {
    const initial: Record<string, { regular: number; cinnamon: number }> = {};
    PRETZEL_MEMBERS.forEach(m => (initial[m] = { regular: 0, cinnamon: 0 }));
    return initial;
  });
  const [selectedMember, setSelectedMember] = useState<string>(PRETZEL_MEMBERS[0]);
  const [selectedType, setSelectedType] = useState<'regular' | 'cinnamon'>('regular');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch pretzel data from Supabase global_trackers table
  const fetchPretzelLogs = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('global_trackers')
        .select('*')
        .eq('id', 'hhn_pretzels')
        .single();

      if (!error && data && data.member_logs) {
        let parsedLogs = data.member_logs;
        if (typeof parsedLogs === 'string') {
          try {
            parsedLogs = JSON.parse(parsedLogs);
          } catch (e) {}
        }
        
        const counts: Record<string, { regular: number; cinnamon: number }> = {};
        PRETZEL_MEMBERS.forEach(m => {
          counts[m] = {
            regular: Number(parsedLogs[m]?.regular) || 0,
            cinnamon: Number(parsedLogs[m]?.cinnamon) || 0
          };
        });
        setMemberLogs(counts);
      }
    } catch (e) {
      console.warn("Pretzel fetch error:", e);
    }
  };

  useEffect(() => {
    fetchPretzelLogs();
  }, []);

  const handleUpdatePretzel = async (delta: number) => {
    if (loading) return;
    setLoading(true);

    const current = memberLogs[selectedMember] || { regular: 0, cinnamon: 0 };
    const newAmount = Math.max(0, current[selectedType] + delta);

    const updatedLogs = {
      ...memberLogs,
      [selectedMember]: {
        ...current,
        [selectedType]: newAmount
      }
    };

    // Calculate updated grand totals for global backwards-compatibility
    const totalReg = Object.values(updatedLogs).reduce((s, m) => s + (m.regular || 0), 0);
    const totalCin = Object.values(updatedLogs).reduce((s, m) => s + (m.cinnamon || 0), 0);

    // Optimistic UI Update
    setMemberLogs(updatedLogs);

    try {
      const supabase = getSupabase();
      await supabase
        .from('global_trackers')
        .upsert({
          id: 'hhn_pretzels',
          regular_pretzels: totalReg,
          cinnamon_pretzels: totalCin,
          member_logs: updatedLogs,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.error("Error saving pretzel log to database:", e);
    } finally {
      setLoading(false);
    }
  };

  // Running Totals
  const totalRegular = Object.values(memberLogs).reduce((s, m) => s + (m.regular || 0), 0);
  const totalCinnamon = Object.values(memberLogs).reduce((s, m) => s + (m.cinnamon || 0), 0);
  const grandTotal = totalRegular + totalCinnamon;

  // Leaderboard Sorted Descending
  const leaderboard = Object.entries(memberLogs)
    .map(([name, counts]) => ({
      name,
      regular: counts.regular,
      cinnamon: counts.cinnamon,
      total: counts.regular + counts.cinnamon
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div
      style={{
        background: '#0022AB',
        border: '3px solid #FFB800',
        borderRadius: '28px',
        padding: '24px 20px',
        marginBottom: '25px',
        boxShadow: '0 8px 24px rgba(0, 34, 171, 0.4)',
        textAlign: 'center',
        color: '#FFFFFF'
      }}
    >
      {/* AUNTIE ANNE'S LOGO & HEADER */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src="/auntie-annes.png"
          alt="Auntie Anne's"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
          style={{ height: '42px', objectFit: 'contain', marginBottom: '6px' }}
        />
        <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFB800', letterSpacing: '2px', textTransform: 'uppercase' }}>
          PRETZEL TRACKER
        </div>
      </div>

      {/* GRAND TOTAL BOX */}
      <div
        style={{
          background: 'rgba(0, 18, 90, 0.65)',
          border: '1px solid rgba(255, 184, 0, 0.3)',
          borderRadius: '20px',
          padding: '16px 10px',
          marginBottom: '16px'
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#FFB800', lineHeight: '1' }}>
          {grandTotal}
        </div>
        <div style={{ fontSize: '11px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1.5px', marginTop: '6px', textTransform: 'uppercase' }}>
          TOTAL PRETZELS CONSUMED
        </div>
      </div>

      {/* TWO BREAKDOWN BOXES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '14px 8px',
            color: '#0022AB',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0022AB', lineHeight: '1' }}>
            {totalRegular}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '900', color: '#0022AB', letterSpacing: '1px', marginTop: '4px', textTransform: 'uppercase' }}>
            REGULAR
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '14px 8px',
            color: '#0022AB',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0022AB', lineHeight: '1' }}>
            {totalCinnamon}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '900', color: '#0022AB', letterSpacing: '1px', marginTop: '4px', textTransform: 'uppercase' }}>
            CINNAMON
          </div>
        </div>
      </div>

      {/* SINGLE LOGGER CONTROLS */}
      <div
        style={{
          background: 'rgba(0, 18, 90, 0.5)',
          border: '1px solid rgba(255, 184, 0, 0.25)',
          borderRadius: '20px',
          padding: '16px 14px',
          marginBottom: '20px'
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: '900', color: '#FFB800', letterSpacing: '1px', marginBottom: '10px', textAlign: 'left', textTransform: 'uppercase' }}>
          LOG A PRETZEL
        </div>

        {/* TAP PILL BOXES: WHO'S EATING */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.7)', textAlign: 'left', marginBottom: '6px' }}>
            WHO'S EATING?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PRETZEL_MEMBERS.map(name => {
              const isSelected = selectedMember === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedMember(name)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #FFB800' : '1px solid rgba(255,255,255,0.2)',
                    background: isSelected ? '#FFB800' : 'rgba(255,255,255,0.1)',
                    color: isSelected ? '#0022AB' : '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '900',
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

        {/* TAP PILL BOXES: PRETZEL TYPE */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.7)', textAlign: 'left', marginBottom: '6px' }}>
            PRETZEL FLAVOR
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {(['regular', 'cinnamon'] as const).map(type => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #FFB800' : '1px solid rgba(255,255,255,0.2)',
                    background: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                    color: isSelected ? '#0022AB' : '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {type === 'regular' ? '🥨 Regular' : '🍩 Cinnamon'}
                </button>
              );
            })}
          </div>
        </div>

        {/* + HALF / + FULL STEP BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleUpdatePretzel(-1)}
            disabled={loading}
            style={{
              padding: '10px 4px',
              background: '#001375',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer'
            }}
          >
            - Full
          </button>
          <button
            type="button"
            onClick={() => handleUpdatePretzel(-0.5)}
            disabled={loading}
            style={{
              padding: '10px 4px',
              background: '#001375',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer'
            }}
          >
            - Half
          </button>
          <button
            type="button"
            onClick={() => handleUpdatePretzel(0.5)}
            disabled={loading}
            style={{
              padding: '10px 4px',
              background: '#FFB800',
              color: '#0022AB',
              border: 'none',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer'
            }}
          >
            + Half
          </button>
          <button
            type="button"
            onClick={() => handleUpdatePretzel(1)}
            disabled={loading}
            style={{
              padding: '10px 4px',
              background: '#FFB800',
              color: '#0022AB',
              border: 'none',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer'
            }}
          >
            + Full
          </button>
        </div>
      </div>

      {/* INSIDE CARD LEADERBOARD */}
      <div style={{ borderTop: '1px solid rgba(255, 184, 0, 0.3)', paddingTop: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: '900', color: '#FFB800', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase', textAlign: 'left' }}>
          🏆 LEADERBOARD
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {leaderboard.map((item, rank) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '800'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ color: rank === 0 ? '#FFB800' : '#FFFFFF' }}>
                  #{rank + 1} {item.name}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', marginLeft: '8px' }}>
                  (Reg: {item.regular} | Cin: {item.cinnamon})
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFB800' }}>
                {item.total} 🥨
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
