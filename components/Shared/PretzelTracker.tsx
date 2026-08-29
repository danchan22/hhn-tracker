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

interface PretzelLog {
  id: string;
  member_name: string;
  pretzel_type: 'regular' | 'cinnamon';
  amount: number;
}

export const PretzelTracker: React.FC<PretzelTrackerProps> = ({ familyMembers }) => {
  const [memberLogs, setMemberLogs] = useState<Record<string, { regular: number; cinnamon: number }>>({});
  const [selectedMember, setSelectedMember] = useState<string>(familyMembers[0] || 'Dan');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch individual pretzel consumption logs
  const fetchPretzelLogs = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('pretzel_logs').select('*');
      if (!error && data) {
        const counts: Record<string, { regular: number; cinnamon: number }> = {};
        familyMembers.forEach(m => counts[m] = { regular: 0, cinnamon: 0 });

        data.forEach((log: any) => {
          if (!counts[log.member_name]) counts[log.member_name] = { regular: 0, cinnamon: 0 };
          if (log.pretzel_type === 'regular') counts[log.member_name].regular += Number(log.amount);
          if (log.pretzel_type === 'cinnamon') counts[log.member_name].cinnamon += Number(log.amount);
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

  const handleUpdatePretzel = async (type: 'regular' | 'cinnamon', delta: number) => {
    setLoading(true);
    const current = memberLogs[selectedMember] || { regular: 0, cinnamon: 0 };
    const newAmount = Math.max(0, current[type] + delta);

    try {
      const supabase = getSupabase();
      await supabase.from('pretzel_logs').upsert({
        id: `${selectedMember}_${type}`,
        member_name: selectedMember,
        pretzel_type: type,
        amount: newAmount,
        updated_at: new Date().toISOString()
      });

      setMemberLogs(prev => ({
        ...prev,
        [selectedMember]: {
          ...current,
          [type]: newAmount
        }
      }));
    } catch (e) {
      console.error("Error logging pretzel:", e);
    } finally {
      setLoading(false);
    }
  };

  // Totals
  const totalRegular = Object.values(memberLogs).reduce((s, m) => s + (m.regular || 0), 0);
  const totalCinnamon = Object.values(memberLogs).reduce((s, m) => s + (m.cinnamon || 0), 0);

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
    <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)', marginBottom: '25px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#F59E0B', margin: '0 0 12px 0', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
        🥨 Pretzel Tracker
      </h3>

      {/* TOTAL CONSUMPTION DISPLAY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <div style={{ background: '#1A1A26', padding: '10px', borderRadius: '12px', border: '1px solid #2A2A3C', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#F59E0B' }}>{totalRegular}</div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0' }}>REGULAR PRETZELS</div>
        </div>
        <div style={{ background: '#1A1A26', padding: '10px', borderRadius: '12px', border: '1px solid #2A2A3C', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#EC4899' }}>{totalCinnamon}</div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0' }}>CINNAMON PRETZELS</div>
        </div>
      </div>

      {/* MEMBER TRACKING CONTROLS */}
      <div style={{ background: '#12121A', padding: '12px', borderRadius: '14px', border: '1px solid #2A2A3C', marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>WHO'S EATING?</label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}
        >
          {familyMembers.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* REGULAR CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#CBD5E0' }}>🥨 Regular:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[-1, -0.5, 0.5, 1].map(delta => (
              <button
                key={delta}
                onClick={() => handleUpdatePretzel('regular', delta)}
                disabled={loading}
                style={{
                  background: delta > 0 ? '#F59E0B' : '#2A2A3C',
                  color: delta > 0 ? '#000' : '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>

        {/* CINNAMON CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#CBD5E0' }}>🍩 Cinnamon:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[-1, -0.5, 0.5, 1].map(delta => (
              <button
                key={delta}
                onClick={() => handleUpdatePretzel('cinnamon', delta)}
                disabled={loading}
                style={{
                  background: delta > 0 ? '#EC4899' : '#2A2A3C',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INDIVIDUAL LEADERBOARD */}
      <h4 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>LEADERBOARD</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {leaderboard.map((item, rank) => (
          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1A1A26', padding: '8px 12px', borderRadius: '10px', border: '1px solid #2A2A3C', fontSize: '12px' }}>
            <div>
              <strong style={{ color: rank === 0 ? '#F59E0B' : '#FFF' }}>#{rank + 1} {item.name}</strong>
              <div style={{ fontSize: '10px', color: '#A0AEC0' }}>
                Reg: {item.regular} | Cin: {item.cinnamon}
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#F59E0B' }}>
              {item.total} 🥨
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
