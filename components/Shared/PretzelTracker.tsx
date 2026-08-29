'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseAnonKey);
};

interface PretzelTrackerProps {
  familyMembers: string[];
}

export const PretzelTracker: React.FC<PretzelTrackerProps> = ({ familyMembers }) => {
  const [memberLogs, setMemberLogs] = useState<Record<string, { regular: number; cinnamon: number }>>({});
  const [selectedMember, setSelectedMember] = useState<string>(familyMembers[0] || 'Dan');
  const [selectedType, setSelectedType] = useState<'regular' | 'cinnamon'>('regular');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPretzelLogs = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('pretzel_logs').select('*');
      if (!error && data) {
        const counts: Record<string, { regular: number; cinnamon: number }> = {};
        familyMembers.forEach(m => (counts[m] = { regular: 0, cinnamon: 0 }));

        data.forEach((log: any) => {
          if (!counts[log.member_name]) counts[log.member_name] = { regular: 0, cinnamon: 0 };
          if (log.pretzel_type === 'regular') counts[log.member_name].regular = Number(log.amount) || 0;
          if (log.pretzel_type === 'cinnamon') counts[log.member_name].cinnamon = Number(log.amount) || 0;
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
    setLoading(true);
    const current = memberLogs[selectedMember] || { regular: 0, cinnamon: 0 };
    const newAmount = Math.max(0, current[selectedType] + delta);

    try {
      const supabase = getSupabase();
      await supabase.from('pretzel_logs').upsert({
        id: `${selectedMember}_${selectedType}`,
        member_name: selectedMember,
        pretzel_type: selectedType,
        amount: newAmount,
        updated_at: new Date().toISOString()
      });

      setMemberLogs(prev => ({
        ...prev,
        [selectedMember]: {
          ...current,
          [selectedType]: newAmount
        }
      }));
    } catch (e) {
      console.error("Error logging pretzel:", e);
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
          padding: '14px',
          marginBottom: '20px'
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: '900', color: '#FFB800', letterSpacing: '1px', marginBottom: '8px', textAlign: 'left', textTransform: 'uppercase' }}>
          LOG A PRETZEL
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: '#FFFFFF',
              color: '#0022AB',
              fontSize: '13px',
              fontWeight: '900',
              outline: 'none'
            }}
          >
            {familyMembers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'regular' | 'cinnamon')}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: '#FFFFFF',
              color: '#0022AB',
              fontSize: '13px',
              fontWeight: '900',
              outline: 'none'
            }}
          >
            <option value="regular">Regular</option>
            <option value="cinnamon">Cinnamon</option>
          </select>
        </div>

        {/* STEP CONTROLS (-0.5 / +0.5) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleUpdatePretzel(-0.5)}
            disabled={loading}
            style={{
              padding: '12px',
              background: '#001375',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => handleUpdatePretzel(0.5)}
            disabled={loading}
            style={{
              padding: '12px',
              background: '#FFB800',
              color: '#0022AB',
              border: 'none',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
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
                justify: 'space-between',
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
