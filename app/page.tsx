'use client';

import React, { useState, useEffect, useMemo } from 'react';

// --- SAFE DYNAMIC SUPABASE CLIENT WRAPPER ---
let supabaseInstance: any = null;

const getSupabase = async () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined' && (window as any).supabase) {
    supabaseInstance = (window as any).supabase.createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  }

  try {
    // @ts-ignore
    const supabaseModule = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    if (supabaseModule && supabaseModule.createClient) {
      supabaseInstance = supabaseModule.createClient(supabaseUrl, supabaseAnonKey);
      return supabaseInstance;
    }
  } catch (e) {
    console.warn("CDN import fallback:", e);
  }

  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'mock-id' }, error: null }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: null }),
        getPublicUrl: (path: string) => ({ publicUrl: 'https://mock.supabase.co/storage/v1/object/public/' + path })
      })
    }
  };
};

interface Activity {
  id: string;
  visit_id: string;
  rideName: string;
  waitTimeMinutes: number;
  notes?: string;
  riders?: string | string[];
}

interface Visit {
  id: string;
  parkName: string;
  visitDate: string;
  startTime: string;
  endTime?: string;
  attendees?: string | string[];
  memberEndTimes?: Record<string, string>;
  notes?: string;
  activities: Activity[];
}

const FIXED_FAMILY_MEMBERS = ['Dan', 'Mandie', 'Elijah', 'Sophia', 'Sam', 'Andrew'];

const parseAttendees = (raw: string | string[] | undefined): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(s => s.trim()).filter(Boolean);
  const attendeesPart = raw.split('|ENDTIMES:')[0];
  return attendeesPart.split(',').map(s => s.trim()).filter(Boolean);
};

const parseMemberEndTimes = (raw: any, notes?: string): Record<string, string> => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    if (raw.includes('|ENDTIMES:')) {
      try {
        const jsonStr = raw.split('|ENDTIMES:')[1];
        return JSON.parse(jsonStr);
      } catch (e) {}
    }
    if (raw.trim().startsWith('{')) {
      try { return JSON.parse(raw); } catch (e) {}
    }
  }
  if (notes && typeof notes === 'string' && notes.trim().startsWith('{')) {
    try { return JSON.parse(notes); } catch (e) {}
  }
  return {};
};

export default function HorrorNightsTracker() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);

  // Main Tabs
  const [mainTab, setMainTab] = useState<'tracker' | 'analytics' | 'map' | 'yum' | 'games'>('tracker');
  
  // Subtabs
  const [trackerSubTab, setTrackerSubTab] = useState<'Visit HHN' | 'Past Visits'>('Visit HHN');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'Houses' | 'Rides' | 'Attendees'>('Houses');
  const [yumSubTab, setYumSubTab] = useState<'Food' | 'Drinks'>('Food');

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<string>('ALL');

  useEffect(() => {
    fetchCloudVisits();
  }, []);

  const fetchCloudVisits = async () => {
    setLoading(true);
    try {
      const supabase = await getSupabase();
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*, activities(*)');

      if (visitsError) throw visitsError;

      if (visitsData) {
        const formattedVisits: Visit[] = visitsData.map((v: any) => ({
          id: v.id,
          visitDate: v.visitDate || v.visitdate,
          startTime: v.startTime || v.starttime,
          endTime: v.endTime || v.endtime || '',
          parkName: v.parkName || v.parkname || 'Halloween Horror Nights',
          attendees: parseAttendees(v.attendees),
          memberEndTimes: parseMemberEndTimes(v.memberEndTimes || v.member_end_times || v.attendees, v.notes),
          notes: v.notes,
          activities: (v.activities || []).map((a: any) => ({
            id: a.id,
            visit_id: a.visit_id,
            rideName: a.rideName || a.ridename,
            waitTimeMinutes: Number(a.waitTimeMinutes || a.waittimeminutes || 0),
            notes: a.notes,
            riders: a.riders ? parseAttendees(a.riders) : parseAttendees(v.attendees)
          }))
        }));

        formattedVisits.sort((a, b) => {
          const dateA = new Date(`${a.visitDate}T${a.startTime || '00:00'}`).getTime();
          const dateB = new Date(`${b.visitDate}T${b.startTime || '00:00'}`).getTime();
          return dateB - dateA;
        });

        const ongoing = formattedVisits.find(v => !v.endTime);
        const completed = formattedVisits.filter(v => v.endTime);

        setActiveVisit(ongoing || null);
        setVisits(completed);
      }
    } catch (err: any) {
      console.error("Error fetching Supabase data:", err);
      setErrorMessage("Could not load cloud visits. " + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '15px 15px 30px 15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#F3F4F6', background: '#09090D', minHeight: '100vh' }}>

      {/* 🎃 APP HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '16px', padding: '10px 0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#FF5500', letterSpacing: '-0.5px', margin: '0', textShadow: '0 0 12px rgba(255, 85, 0, 0.4)' }}>
          Never Go Alone 😱
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: '800', color: '#DC2626', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Halloween Horror Nights Orlando
        </p>
      </header>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div style={{ background: '#2D0A0A', border: '1px solid #DC2626', padding: '10px 14px', borderRadius: '12px', color: '#FCA5A5', fontSize: '13px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5', fontWeight: '900', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* 1. MAIN HEADER MENU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', background: '#12121A', borderRadius: '16px', border: '1px solid #27273A', padding: '6px', marginBottom: '12px' }}>
        
        {/* Tracker */}
        <button
          onClick={() => setMainTab('tracker')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 2px 6px 2px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: mainTab === 'tracker' ? '3px solid #FF5500' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'tracker' ? '#FF5500' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'tracker' ? '800' : '600', color: mainTab === 'tracker' ? '#FF5500' : '#9CA3AF', marginTop: '4px' }}>Tracker</span>
        </button>

        {/* Analytics */}
        <button
          onClick={() => setMainTab('analytics')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 2px 6px 2px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: mainTab === 'analytics' ? '3px solid #DC2626' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'analytics' ? '#DC2626' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'analytics' ? '800' : '600', color: mainTab === 'analytics' ? '#DC2626' : '#9CA3AF', marginTop: '4px' }}>Analytics</span>
        </button>

        {/* Map */}
        <button
          onClick={() => setMainTab('map')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 2px 6px 2px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: mainTab === 'map' ? '3px solid #3B82F6' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'map' ? '#3B82F6' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'map' ? '800' : '600', color: mainTab === 'map' ? '#3B82F6' : '#9CA3AF', marginTop: '4px' }}>Map</span>
        </button>

        {/* Yum */}
        <button
          onClick={() => setMainTab('yum')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 2px 6px 2px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: mainTab === 'yum' ? '3px solid #F59E0B' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'yum' ? '#F59E0B' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'yum' ? '800' : '600', color: mainTab === 'yum' ? '#F59E0B' : '#9CA3AF', marginTop: '4px' }}>Yum</span>
        </button>

        {/* Games */}
        <button
          onClick={() => setMainTab('games')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 2px 6px 2px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: mainTab === 'games' ? '3px solid #10B981' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'games' ? '#10B981' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
            <path d="M6 12h4m-2-2v4"></path>
            <circle cx="17" cy="10" r="1" fill="currentColor"></circle>
            <circle cx="15" cy="13" r="1" fill="currentColor"></circle>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'games' ? '800' : '600', color: mainTab === 'games' ? '#10B981' : '#9CA3AF', marginTop: '4px' }}>Games</span>
        </button>

      </div>

      {/* 2. SUBHEADER NAVS */}
      {mainTab === 'tracker' && (
        <div style={{ display: 'flex', background: '#12121A', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '14px' }}>
          <button onClick={() => setTrackerSubTab('Visit HHN')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Visit HHN' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Visit HHN' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Visit HHN
          </button>
          <button onClick={() => setTrackerSubTab('Past Visits')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Past Visits' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Past Visits' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Past Visits
          </button>
        </div>
      )}

      {mainTab === 'analytics' && (
        <div style={{ display: 'flex', background: '#12121A', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '14px' }}>
          <button onClick={() => setAnalyticsSubTab('Houses')} style={{ flex: 1, padding: '9px 2px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Houses' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Houses' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Houses
          </button>
          <button onClick={() => setAnalyticsSubTab('Rides')} style={{ flex: 1, padding: '9px 2px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Rides' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Rides' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Rides
          </button>
          <button onClick={() => setAnalyticsSubTab('Attendees')} style={{ flex: 1, padding: '9px 2px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Attendees' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Attendees' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Attendees
          </button>
        </div>
      )}

      {mainTab === 'yum' && (
        <div style={{ display: 'flex', background: '#12121A', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '14px' }}>
          <button onClick={() => setYumSubTab('Food')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: yumSubTab === 'Food' ? '#F59E0B' : 'transparent', color: yumSubTab === 'Food' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Food
          </button>
          <button onClick={() => setYumSubTab('Drinks')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: yumSubTab === 'Drinks' ? '#F59E0B' : 'transparent', color: yumSubTab === 'Drinks' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Drinks
          </button>
        </div>
      )}

      {/* 3. TAB VIEWS */}
      {mainTab === 'tracker' && (
        <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', border: '1px solid #27273A' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FF5500', margin: '0 0 10px 0' }}>
            🎃 {trackerSubTab}
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Tracker content for {trackerSubTab} will be configured here.</p>
        </div>
      )}

      {mainTab === 'analytics' && (
        <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', border: '1px solid #27273A' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#DC2626', margin: '0 0 10px 0' }}>
            📊 {analyticsSubTab} Analytics
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Analytics data for {analyticsSubTab} will be configured here.</p>
        </div>
      )}

      {mainTab === 'map' && (
        <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', border: '1px solid #27273A' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#3B82F6', margin: '0 0 10px 0' }}>
            🗺️ Event Map
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Event map layout and house locations will be configured here.</p>
        </div>
      )}

      {mainTab === 'yum' && (
        <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', border: '1px solid #27273A' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#F59E0B', margin: '0 0 10px 0' }}>
            🍔 {yumSubTab}
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Specialty HHN food & drinks tracking will be configured here.</p>
        </div>
      )}

      {mainTab === 'games' && (
        <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', border: '1px solid #27273A' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#10B981', margin: '0 0 10px 0' }}>
            🎮 Games
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Interactive games and challenges will be configured here.</p>
        </div>
      )}

    </div>
  );
}
