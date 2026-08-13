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

const FIXED_FAMILY_MEMBERS = [
  'Dan', 'Mandie', 'Elijah', 'Violette', 'Sophia', 'Zach', 'Jasmine', 'Kimbo'
];

const HHN_HOUSES = [
  'Cybergoria',
  'Evil Dead Burn',
  'Hellraiser',
  'H.R. Bloodengutz',
  'INVASION: Alien Abduction',
  'Jack & Oddfellow',
  'Madlands: Caged Cannibals',
  'Ozzy Osbourne',
  'Sinners',
  'Stranger Things 5'
];

const HHN_RIDES = [
  'Men in Black: Alien Attack',
  'Transformers: The Ride-3D',
  'Harry Potter and the Escape from Gringotts',
  'Revenge of the Mummy'
];

const HHN_SHOWS = [
  'Nightmare Fuel: Blood Noir',
  'Stranger Things Lagoon Show'
];

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

  // Form States
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  
  // Track Activity States
  const [rideName, setRideName] = useState(HHN_HOUSES[0]);
  const [postedWaitTime, setPostedWaitTime] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);

  // Timer State
  const [queueStartTimestamp, setQueueStartTimestamp] = useState<number | null>(null);
  const [queueStartTimeStr, setQueueStartTimeStr] = useState<string | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Edit Activity State
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editRideName, setEditRideName] = useState('');
  const [editWaitTime, setEditWaitTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRiders, setEditRiders] = useState<string[]>([]);

  // Edit Entire Visit Log State
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [editVisitStartTime, setEditVisitStartTime] = useState('');
  const [editVisitEndTime, setEditVisitEndTime] = useState('');
  const [editVisitMemberEndTimes, setEditVisitMemberEndTimes] = useState<Record<string, string>>({});

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [departingMembers, setDepartingMembers] = useState<string[]>([]);

  const activePartyList = useMemo(() => {
    if (!activeVisit) return [];
    const allParty = parseAttendees(activeVisit.attendees);
    const endTimes = activeVisit.memberEndTimes || {};
    return allParty.filter(member => !endTimes[member]);
  }, [activeVisit]);

  useEffect(() => {
    if (activeVisit) {
      setSelectedRiders(activePartyList);
      setRideName(HHN_HOUSES[0]);
      setDepartingMembers(activePartyList);
    }
  }, [activeVisit, activePartyList.length]);

  useEffect(() => {
    let interval: any;
    if (queueStartTimestamp) {
      interval = setInterval(() => {
        setNowTimestamp(Date.now());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [queueStartTimestamp]);

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
        const formattedVisits: Visit[] = visitsData.map((v: any) => {
          const vDate = v.visitdate || v.visitDate || '';
          const sTime = v.starttime || v.startTime || '';
          const eTime = v.endtime !== undefined && v.endtime !== null ? v.endtime : (v.endTime !== undefined && v.endTime !== null ? v.endTime : '');
          const pName = v.parkname || v.parkName || 'Halloween Horror Nights';

          return {
            id: v.id,
            visitDate: vDate,
            startTime: sTime,
            endTime: eTime || '',
            parkName: pName,
            attendees: parseAttendees(v.attendees),
            memberEndTimes: parseMemberEndTimes(v.memberEndTimes || v.member_end_times || v.attendees, v.notes),
            notes: v.notes,
            activities: (v.activities || []).map((a: any) => ({
              id: a.id,
              visit_id: a.visit_id,
              rideName: a.ridename || a.rideName || '',
              waitTimeMinutes: Number(a.waittimeminutes || a.waitTimeMinutes || 0),
              notes: a.notes,
              riders: a.riders ? parseAttendees(a.riders) : parseAttendees(v.attendees)
            }))
          };
        });

        formattedVisits.sort((a, b) => {
          const dateA = new Date(`${a.visitDate}T${a.startTime || '00:00'}`).getTime();
          const dateB = new Date(`${b.visitDate}T${b.startTime || '00:00'}`).getTime();
          return dateB - dateA;
        });

        const ongoing = formattedVisits.find(v => !v.endTime || v.endTime.trim() === '');
        const completed = formattedVisits.filter(v => !!v.endTime && v.endTime.trim() !== '');

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

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[d.getDay()]} ${month}/${day}/${year.toString().slice(-2)}`;
  };

  const format12Hour = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const parseTimeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;
    const [hrs, mins] = timeStr.split(':').map(Number);
    return (hrs * 60) + mins;
  };

  const calculateVisitDuration = (startTime: string, endTime?: string) => {
    if (!startTime || !endTime) return '';
    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);
    const diff = endMins >= startMins ? (endMins - startMins) : ((1440 - startMins) + endMins);
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hrs === 0) return `(${mins} min)`;
    return mins > 0 ? `(${hrs} hrs ${mins} min)` : `(${hrs} hrs)`;
  };

  const formatMinutes = (totalMins: number) => {
    if (totalMins <= 0) return '0m';
    const hrs = Math.floor(totalMins / 60);
    const remMins = Math.round(totalMins % 60);
    if (hrs === 0) return `${remMins}m`;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  };

  const getPersonEndTime = (v: Visit, person: string) => {
    if (v.memberEndTimes && v.memberEndTimes[person]) {
      return v.memberEndTimes[person];
    }
    return v.endTime || '';
  };

  // --- STATS CALCULATIONS ---
  const allCompletedActivities = useMemo(() => {
    return visits.flatMap(v => v.activities);
  }, [visits]);

  const totalEventVisits = visits.length;

  const totalHousesCount = useMemo(() => {
    return allCompletedActivities.filter(a => HHN_HOUSES.includes(a.rideName)).length;
  }, [allCompletedActivities]);

  const totalRidesCount = useMemo(() => {
    return allCompletedActivities.filter(a => HHN_RIDES.includes(a.rideName)).length;
  }, [allCompletedActivities]);

  const totalShowsCount = useMemo(() => {
    return allCompletedActivities.filter(a => HHN_SHOWS.includes(a.rideName)).length;
  }, [allCompletedActivities]);

  const totalTimeInParkMins = useMemo(() => {
    return visits.reduce((sum, v) => {
      if (v.startTime && v.endTime) {
        const start = parseTimeToMinutes(v.startTime);
        const end = parseTimeToMinutes(v.endTime);
        const duration = end >= start ? (end - start) : ((1440 - start) + end);
        return sum + duration;
      }
      return sum;
    }, 0);
  }, [visits]);

  const totalTimeInLinesMins = useMemo(() => {
    return allCompletedActivities.reduce((sum, a) => sum + (a.waitTimeMinutes || 0), 0);
  }, [allCompletedActivities]);

  const lineTimePercentage = useMemo(() => {
    if (totalTimeInParkMins <= 0) return 0;
    return Math.min(100, Math.round((totalTimeInLinesMins / totalTimeInParkMins) * 100));
  }, [totalTimeInParkMins, totalTimeInLinesMins]);

  // Top House
  const topHouseData = useMemo(() => {
    const houseMap: Record<string, { count: number; totalWait: number }> = {};
    allCompletedActivities
      .filter(a => HHN_HOUSES.includes(a.rideName))
      .forEach(a => {
        if (!houseMap[a.rideName]) houseMap[a.rideName] = { count: 0, totalWait: 0 };
        houseMap[a.rideName].count += 1;
        houseMap[a.rideName].totalWait += a.waitTimeMinutes;
      });

    const sorted = Object.entries(houseMap).sort((a, b) => b[1].count - a[1].count || b[1].totalWait - a[1].totalWait);
    if (sorted.length === 0) return null;
    const [name, stats] = sorted[0];
    return { name, count: stats.count, totalWait: stats.totalWait, avgWait: Math.round(stats.totalWait / stats.count) };
  }, [allCompletedActivities]);

  // Top Ride
  const topRideData = useMemo(() => {
    const rideMap: Record<string, { count: number; totalWait: number }> = {};
    allCompletedActivities
      .filter(a => HHN_RIDES.includes(a.rideName))
      .forEach(a => {
        if (!rideMap[a.rideName]) rideMap[a.rideName] = { count: 0, totalWait: 0 };
        rideMap[a.rideName].count += 1;
        rideMap[a.rideName].totalWait += a.waitTimeMinutes;
      });

    const sorted = Object.entries(rideMap).sort((a, b) => b[1].count - a[1].count || b[1].totalWait - a[1].totalWait);
    if (sorted.length === 0) return null;
    const [name, stats] = sorted[0];
    return { name, count: stats.count, totalWait: stats.totalWait, avgWait: Math.round(stats.totalWait / stats.count) };
  }, [allCompletedActivities]);

  // Averages
  const avgHousesPerVisit = totalEventVisits > 0 ? (totalHousesCount / totalEventVisits).toFixed(1) : '0';
  const avgRidesPerVisit = totalEventVisits > 0 ? (totalRidesCount / totalEventVisits).toFixed(1) : '0';
  const avgShowsPerVisit = totalEventVisits > 0 ? (totalShowsCount / totalEventVisits).toFixed(1) : '0';
  const avgDurationPerVisit = totalEventVisits > 0 ? Math.round(totalTimeInParkMins / totalEventVisits) : 0;
  const avgWaitPerActivity = allCompletedActivities.length > 0 ? Math.round(totalTimeInLinesMins / allCompletedActivities.length) : 0;

  const toggleCheckInAttendee = (name: string) => {
    if (selectedAttendees.includes(name)) {
      setSelectedAttendees(selectedAttendees.filter(a => a !== name));
    } else {
      setSelectedAttendees([...selectedAttendees, name]);
    }
  };

  const toggleRiderSelection = (name: string) => {
    if (selectedRiders.includes(name)) {
      if (selectedRiders.length === 1) return;
      setSelectedRiders(selectedRiders.filter(r => r !== name));
    } else {
      setSelectedRiders([...selectedRiders, name]);
    }
  };

  const toggleEditRiderSelection = (name: string) => {
    if (editRiders.includes(name)) {
      if (editRiders.length === 1) return;
      setEditRiders(editRiders.filter(r => r !== name));
    } else {
      setEditRiders([...editRiders, name]);
    }
  };

  const toggleDepartingMember = (name: string) => {
    if (departingMembers.includes(name)) {
      if (departingMembers.length === 1) return;
      setDepartingMembers(departingMembers.filter(m => m !== name));
    } else {
      setDepartingMembers([...departingMembers, name]);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const localDate = now.toLocaleDateString('en-CA');
    const localTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const newAttendeesList = selectedAttendees.length > 0 ? selectedAttendees : ['Just Me'];
    const attendeesDbStr = newAttendeesList.join(', ');

    const supabase = await getSupabase();
    
    const { data, error } = await supabase
      .from('visits')
      .insert({
        visitdate: localDate,
        starttime: localTime,
        endtime: '',
        parkname: 'Halloween Horror Nights',
        attendees: attendeesDbStr
      })
      .select()
      .single();

    if (error) {
      setErrorMessage("Error checking in: " + error.message);
      return;
    }

    const newVisit: Visit = {
      id: data.id,
      visitDate: localDate,
      startTime: localTime,
      endTime: '',
      parkName: 'Halloween Horror Nights',
      attendees: newAttendeesList,
      memberEndTimes: {},
      activities: []
    };

    setActiveVisit(newVisit);
    setSelectedRiders(newAttendeesList);
    setDepartingMembers(newAttendeesList);
    setSelectedAttendees([]);
  };

  const handleAddRideLive = async () => {
    if (!activeVisit || !rideName) return;
    const waitMins = parseInt(waitTime) || 0;
    const notesVal = postedWaitTime ? `Posted: ${postedWaitTime}m` : undefined;
    const ridersStr = selectedRiders.join(', ');

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('activities')
      .insert({
        visit_id: activeVisit.id,
        ridename: rideName,
        waittimeminutes: waitMins,
        notes: notesVal,
        riders: ridersStr
      })
      .select()
      .single();

    if (error) {
      setErrorMessage("Error logging attraction: " + error.message);
      return;
    }

    const newActivity: Activity = {
      id: data.id,
      visit_id: activeVisit.id,
      rideName,
      waitTimeMinutes: waitMins,
      notes: notesVal,
      riders: selectedRiders
    };

    setActiveVisit({ ...activeVisit, activities: [...activeVisit.activities, newActivity] });
    setWaitTime('');
    setPostedWaitTime('');
  };

  const handleStartQueueTimer = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
    setQueueStartTimestamp(now.getTime());
    setQueueStartTimeStr(timeString);
  };

  const handleEndQueueTimer = async () => {
    if (!activeVisit || !queueStartTimestamp) return;
    const nowMs = Date.now();
    const diffMs = nowMs - queueStartTimestamp;
    let calculatedWait = Math.round(diffMs / 60000);
    if (calculatedWait <= 0) calculatedWait = 1;

    const notesVal = postedWaitTime ? `Posted: ${postedWaitTime}m` : undefined;
    const ridersStr = selectedRiders.join(', ');

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('activities')
      .insert({
        visit_id: activeVisit.id,
        ridename: rideName,
        waittimeminutes: calculatedWait,
        notes: notesVal,
        riders: ridersStr
      })
      .select()
      .single();

    if (error) {
      alert("Error logging timer activity: " + error.message);
      return;
    }

    const newActivity: Activity = {
      id: data.id,
      visit_id: activeVisit.id,
      rideName,
      waitTimeMinutes: calculatedWait,
      notes: notesVal,
      riders: selectedRiders
    };

    setActiveVisit({ ...activeVisit, activities: [...activeVisit.activities, newActivity] });
    setQueueStartTimestamp(null);
    setQueueStartTimeStr(null);
    setWaitTime('');
    setPostedWaitTime('');
  };

  const startEditing = (activity: Activity, visitId: string | null) => {
    setEditingActivityId(activity.id);
    setEditingVisitId(visitId);
    setEditRideName(activity.rideName);
    setEditWaitTime(activity.waitTimeMinutes.toString());
    setEditNotes(activity.notes || '');

    let currentParty: string[] = [];
    if (visitId === null && activeVisit) {
      currentParty = parseAttendees(activeVisit.attendees);
    } else {
      const foundV = visits.find(v => v.id === visitId);
      if (foundV) currentParty = parseAttendees(foundV.attendees);
    }
    
    const existingRiders = parseAttendees(activity.riders);
    setEditRiders(existingRiders.length > 0 ? existingRiders : currentParty);
  };

  const cancelEditing = () => {
    setEditingActivityId(null);
    setEditingVisitId(null);
  };

  const saveEditedActivity = async () => {
    if (!editingActivityId) return;

    const waitMins = parseInt(editWaitTime) || 0;
    const notesVal = editNotes.trim() ? editNotes : null;
    const ridersStr = editRiders.join(', ');

    const supabase = await getSupabase();
    const { error } = await supabase
      .from('activities')
      .update({
        ridename: editRideName,
        waittimeminutes: waitMins,
        notes: notesVal,
        riders: ridersStr
      })
      .eq('id', editingActivityId);

    if (error) {
      setErrorMessage("Error saving edits: " + error.message);
      return;
    }

    await fetchCloudVisits();
    cancelEditing();
  };

  const deleteActivity = async (activityId: string) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from('activities').delete().eq('id', activityId);
    if (error) {
      setErrorMessage("Error deleting entry: " + error.message);
      return;
    }

    await fetchCloudVisits();
  };

  const openEditVisit = (v: Visit) => {
    setEditingVisit(v);
    setEditVisitStartTime(v.startTime || '');
    setEditVisitEndTime(v.endTime || '');
    setEditVisitMemberEndTimes({ ...(v.memberEndTimes || {}) });
  };

  const handleSaveVisitEdit = async () => {
    if (!editingVisit) return;
    const rawAttendeesStr = parseAttendees(editingVisit.attendees).join(', ');
    const jsonEndTimesStr = JSON.stringify(editVisitMemberEndTimes);
    const attendeesWithEndTimes = `${rawAttendeesStr}|ENDTIMES:${jsonEndTimesStr}`;

    const supabase = await getSupabase();
    const { error } = await supabase
      .from('visits')
      .update({
        starttime: editVisitStartTime,
        endtime: editVisitEndTime,
        attendees: attendeesWithEndTimes,
        notes: jsonEndTimesStr
      })
      .eq('id', editingVisit.id);

    if (error) {
      setErrorMessage("Error updating visit log: " + error.message);
      return;
    }

    setEditingVisit(null);
    await fetchCloudVisits();
  };

  const processCheckout = async (checkoutType: 'selected' | 'everyone') => {
    if (!activeVisit) return;
    const now = new Date();
    const endTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const currentActive = activePartyList;
    const leavingParty = checkoutType === 'everyone' ? currentActive : departingMembers;
    const remainingActive = currentActive.filter(m => !leavingParty.includes(m));

    const updatedEndTimes: Record<string, string> = {
      ...(activeVisit.memberEndTimes || {})
    };
    leavingParty.forEach(m => {
      updatedEndTimes[m] = endTime;
    });

    const isVisitComplete = remainingActive.length === 0;
    const finalEndTime = isVisitComplete ? endTime : '';

    const rawAttendeesStr = parseAttendees(activeVisit.attendees).join(', ');
    const jsonEndTimesStr = JSON.stringify(updatedEndTimes);
    const attendeesWithEndTimes = `${rawAttendeesStr}|ENDTIMES:${jsonEndTimesStr}`;

    const supabase = await getSupabase();

    const { error } = await supabase
      .from('visits')
      .update({
        endtime: finalEndTime,
        attendees: attendeesWithEndTimes
      })
      .eq('id', activeVisit.id);

    if (error) {
      setErrorMessage("Error saving departure time: " + error.message);
      return;
    }

    setShowCheckoutModal(false);
    await fetchCloudVisits();
    setQueueStartTimestamp(null);
    setQueueStartTimeStr(null);
  };

  const deleteVisit = async (id: string) => {
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this entire visit log? This action cannot be undone!");
    if (!confirmDelete) return;

    const supabase = await getSupabase();
    const { error } = await supabase.from('visits').delete().eq('id', id);
    if (error) {
      setErrorMessage("Error deleting visit: " + error.message);
      return;
    }
    await fetchCloudVisits();
  };

  const getElapsedQueueTimeString = () => {
    if (!queueStartTimestamp) return '';
    const diffSeconds = Math.max(0, Math.floor((nowTimestamp - queueStartTimestamp) / 1000));
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins} mins ${secs > 0 ? `${secs}s` : ''}`;
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '15px 15px 30px 15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#F3F4F6', background: '#09090D', minHeight: '100vh' }}>
      
      {/* GLOBAL CSS FOR HIDING NUMBER INPUT SPINNERS */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

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
            <polyline points="12 6 12 16 14"></polyline>
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

      {/* 3. TAB VIEWS */}
      {mainTab === 'tracker' && trackerSubTab === 'Visit HHN' && (
        <div>
          {activeVisit ? (
            /* ACTIVE VISIT LIVE WIDGET */
            <div style={{ background: 'linear-gradient(135deg, #1F0808 0%, #0D0510 100%)', color: '#FFF', padding: '20px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)', border: '2px solid #DC2626' }}>
              
              <div style={{ marginBottom: '12px' }}>
                <span style={{ background: '#DC2626', color: '#FFF', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔥 LIVE AT HORROR NIGHTS
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#CBD5E0', marginBottom: '8px', fontWeight: '600' }}>
                📅 {formatDisplayDate(activeVisit.visitDate)} &nbsp;•&nbsp; ⏰ Arrived: <strong>{format12Hour(activeVisit.startTime)}</strong>
              </div>

              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#E2E8F0' }}>
                👥 <strong>Active Party:</strong> {activePartyList.join(', ')}
              </p>

              {/* TRACK ATTRACTION CARD */}
              <div style={{ background: '#12121A', padding: '16px', borderRadius: '18px', marginBottom: '15px', color: '#F3F4F6', border: '1px solid #2A2A3C' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#FF5500' }}>Track an Attraction:</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <select value={rideName} onChange={(e) => setRideName(e.target.value)} disabled={!!queueStartTimestamp} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #2A2A3C', background: queueStartTimestamp ? '#1A1A24' : '#1A1A26', fontSize: '14px', color: queueStartTimestamp ? '#718096' : '#F3F4F6' }}>
                    <optgroup label="Houses">
                      {HHN_HOUSES.map((house) => (
                        <option key={house} value={house}>{house}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Rides">
                      {HHN_RIDES.map((ride) => (
                        <option key={ride} value={ride}>{ride}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Shows">
                      {HHN_SHOWS.map((show) => (
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
                                border: isRiding ? '2px solid #FF5500' : '1px solid #2A2A3C',
                                background: isRiding ? '#FF5500' : '#12121A',
                                color: isRiding ? '#FFF' : '#A0AEC0',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {isRiding ? `✓ ${member}` : member}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* COMPACT POSTED WAIT TIME INPUT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1A1A26', border: '1px solid #2A2A3C', padding: '8px 12px', borderRadius: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', flex: 1 }}>
                      POSTED WAIT TIME (MINS)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 45"
                      value={postedWaitTime}
                      onChange={(e) => setPostedWaitTime(e.target.value)}
                      disabled={!!queueStartTimestamp}
                      style={{ width: '80px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#12121A', color: '#FFF', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}
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
                          ✅ Entering Attraction
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px solid #2A2A3C', paddingTop: '10px', marginTop: '5px' }}>
                      <button type="button" onClick={handleStartQueueTimer} style={{ width: '100%', padding: '12px', background: '#FF5500', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(255, 85, 0, 0.3)' }}>
                        ⏱️ Start Line Timer
                      </button>

                      <div style={{ textAlign: 'center', fontSize: '11px', color: '#718096', fontWeight: 'bold', marginBottom: '12px', position: 'relative' }}>
                        <span style={{ background: '#12121A', padding: '0 10px', position: 'relative', zIndex: 2 }}>OR LOG MANUALLY</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#2A2A3C', zIndex: 1 }}></div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="number" placeholder="Actual wait time (mins)" value={waitTime} onChange={(e) => setWaitTime(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '14px' }} />
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
                      {activeVisit.activities.map((act) => (
                        <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1A1A26', padding: '8px 10px', borderRadius: '8px', border: '1px solid #2A2A3C' }}>
                          <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#F3F4F6' }}>{act.rideName}</div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              ⏱️ {act.waitTimeMinutes} mins wait {act.notes ? `(${act.notes})` : ''} • 👥 {parseAttendees(act.riders).join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { setDepartingMembers(activePartyList); setShowCheckoutModal(true); }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #DC2626, #991B1B)', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}>
                👋 Leave the Park & Save Day
              </button>
            </div>
          ) : (
            /* START YOUR NIGHT FORM */
            <form onSubmit={handleCheckIn} style={{ background: '#12121A', padding: '22px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', border: '1px solid #2A2A3C' }}>
              <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '900', color: '#FF5500', marginBottom: '16px', textAlign: 'center' }}>Start Your Night</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>WHO'S ATTENDING?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {FIXED_FAMILY_MEMBERS.map((name) => {
                    const isSelected = selectedAttendees.includes(name);
                    return (
                      <button key={name} type="button" onClick={() => toggleCheckInAttendee(name)} style={{ padding: '10px 4px', borderRadius: '10px', border: isSelected ? '2px solid #FF5500' : '1px solid #2A2A3C', background: isSelected ? '#FF5500' : '#1A1A26', color: isSelected ? '#FFF' : '#CBD5E0', fontSize: '13px', fontWeight: isSelected ? '800' : '500', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                        {isSelected ? `✓ ${name}` : name}
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
                  background: '#FF5500',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)'
                }}
              >
                Enter the fog... 🎃
              </button>
            </form>
          )}

          {/* TOTALS & SUMMARY STATS WIDGET */}
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid #2A2A3C' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>
              TOTALS
            </h3>
            
            {/* ROW 1: 4 COUNTS */}
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

            {/* ROW 2: TIME METRICS + LINE % */}
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

            {/* TOP HOUSE CARD */}
            <div style={{ background: '#1C130D', padding: '12px 15px', borderRadius: '14px', border: '1px solid #C05621', borderLeft: '5px solid #FF5500', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#FF9A56', marginBottom: '3px', letterSpacing: '0.5px' }}>⭐ TOP HOUSE</div>
              <div style={{ fontWeight: '800', color: '#F3F4F6', fontSize: '15px' }}>
                {topHouseData ? topHouseData.name : 'None Logged Yet'}
              </div>
              {topHouseData && (
                <div style={{ color: '#CBD5E0', marginTop: '3px', fontSize: '12px' }}>
                  Logged <strong>{topHouseData.count}x</strong> | Total Wait: <strong style={{ color: '#FF5500' }}>{formatMinutes(topHouseData.totalWait)}</strong> | Avg Wait: <strong>{topHouseData.avgWait}m</strong>
                </div>
              )}
            </div>

            {/* TOP RIDE CARD */}
            <div style={{ background: '#0D1726', padding: '12px 15px', borderRadius: '14px', border: '1px solid #1E40AF', borderLeft: '5px solid #3B82F6', marginBottom: '18px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#60A5FA', marginBottom: '3px', letterSpacing: '0.5px' }}>🎢 TOP RIDE</div>
              <div style={{ fontWeight: '800', color: '#F3F4F6', fontSize: '15px' }}>
                {topRideData ? topRideData.name : 'None Logged Yet'}
              </div>
              {topRideData && (
                <div style={{ color: '#CBD5E0', marginTop: '3px', fontSize: '12px' }}>
                  Logged <strong>{topRideData.count}x</strong> | Total Wait: <strong style={{ color: '#3B82F6' }}>{formatMinutes(topRideData.totalWait)}</strong> | Avg Wait: <strong>{topRideData.avgWait}m</strong>
                </div>
              )}
            </div>

            {/* AVERAGES SECTION */}
            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 10px 0', letterSpacing: '0.8px' }}>AVERAGES</h3>
            
            {/* ROW 1: HOUSES | RIDES | SHOWS */}
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

            {/* ROW 2: TIME IN PARKS | WAIT TIME */}
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
        </div>
      )}

      {/* SUBTAB: PAST VISITS */}
      {mainTab === 'tracker' && trackerSubTab === 'Past Visits' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#FF5500', paddingLeft: '5px' }}>
            Past Visits ({visits.length})
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
                <div key={v.id} style={{ border: '1px solid #2A2A3C', borderRadius: '20px', padding: '16px', marginBottom: '12px', background: '#12121A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2A2A3C', paddingBottom: '8px', marginBottom: '10px' }}>
                    <strong style={{ color: '#FF5500', fontSize: '16px', fontWeight: '800' }}>
                      🎃 Halloween Horror Nights
                    </strong>
                    <span style={{ fontSize: '13px', color: '#A0AEC0', fontWeight: '600' }}>📅 {formatDisplayDate(v.visitDate)}</span>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {v.activities.map((a) => {
                          const isEditingThis = editingActivityId === a.id && editingVisitId === v.id;
                          const actRidersList = parseAttendees(a.riders);

                          return isEditingThis ? (
                            <div key={a.id} style={{ background: '#12121A', border: '1px solid #2A2A3C', padding: '10px', borderRadius: '10px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#FF5500', marginBottom: '6px' }}>EDIT ENTRY</div>
                              <select value={editRideName} onChange={(e) => setEditRideName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px', marginBottom: '6px' }}>
                                <optgroup label="Houses">
                                  {HHN_HOUSES.map((house) => (
                                    <option key={house} value={house}>{house}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Rides">
                                  {HHN_RIDES.map((ride) => (
                                    <option key={ride} value={ride}>{ride}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Shows">
                                  {HHN_SHOWS.map((show) => (
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
                              
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                <input type="number" value={editWaitTime} onChange={(e) => setEditWaitTime(e.target.value)} placeholder="Wait (mins)" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px' }} />
                                <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes (optional)" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px' }} />
                              </div>

                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button onClick={() => deleteActivity(a.id)} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
                                <button onClick={cancelEditing} style={{ background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveEditedActivity} style={{ background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#F3F4F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.rideName}</div>
                                <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                                  ⏱️ {a.waitTimeMinutes} mins wait {actRidersList.length > 0 ? `• 👥 ${actRidersList.join(', ')}` : ''} {a.notes ? `• ${a.notes}` : ''}
                                </div>
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

      {/* 👋 STAGGERED CHECK-OUT MODAL */}
      {showCheckoutModal && activeVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '400px', width: '100%', border: '1px solid #2A2A3C', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>
              👋 Leaving Park
            </h3>
            <p style={{ fontSize: '13px', color: '#A0AEC0', margin: '0 0 16px 0' }}>
              Who is departing the park right now?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {activePartyList.map((member) => {
                const isSelected = departingMembers.includes(member);
                return (
                  <button
                    key={member}
                    type="button"
                    onClick={() => toggleDepartingMember(member)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #DC2626' : '1px solid #2A2A3C',
                      background: isSelected ? '#2C0B0E' : '#1A1A26',
                      color: isSelected ? '#FCA5A5' : '#CBD5E0',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>👤 {member}</span>
                    <span>{isSelected ? '🚪 Leaving' : '🏰 Staying'}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => processCheckout('selected')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#DC2626',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Check Out Selected ({departingMembers.length})
              </button>

              <button
                type="button"
                onClick={() => processCheckout('everyone')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#2A2A3C',
                  color: '#F3F4F6',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Check Out Everyone
              </button>

              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'none',
                  color: '#A0AEC0',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ EDIT VISIT LOG MODAL */}
      {editingVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #2A2A3C', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>
              ✏️ Edit Visit Hours
            </h3>
            <p style={{ fontSize: '12px', color: '#A0AEC0', margin: '0 0 16px 0' }}>
              {editingVisit.parkName} • {formatDisplayDate(editingVisit.visitDate)}
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E0', display: 'block', marginBottom: '4px' }}>
                ⏰ ARRIVAL TIME (HH:MM / e.g. 18:30)
              </label>
              <input
                type="text"
                placeholder="e.g. 18:30"
                value={editVisitStartTime}
                onChange={(e) => setEditVisitStartTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E0', display: 'block', marginBottom: '4px' }}>
                🚪 MAIN DEPARTURE TIME (e.g. 02:00)
              </label>
              <input
                type="text"
                placeholder="e.g. 02:00"
                value={editVisitEndTime}
                onChange={(e) => setEditVisitEndTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E0', display: 'block', marginBottom: '6px' }}>
                👥 MEMBER DEPARTURE TIMES
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {parseAttendees(editingVisit.attendees).map(member => (
                  <div key={member} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1A1A26', padding: '8px 10px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#F3F4F6' }}>👤 {member}</span>
                    <input
                      type="text"
                      placeholder={editVisitEndTime || "HH:MM"}
                      value={editVisitMemberEndTimes[member] || ''}
                      onChange={(e) => {
                        setEditVisitMemberEndTimes({
                          ...editVisitMemberEndTimes,
                          [member]: e.target.value
                        });
                      }}
                      style={{ width: '110px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#12121A', color: '#FFF', fontSize: '13px', textAlign: 'center' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setEditingVisit(null)}
                style={{ flex: 1, padding: '12px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVisitEdit}
                style={{ flex: 2, padding: '12px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
