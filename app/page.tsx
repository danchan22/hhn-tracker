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
  parkName: 'Magic Kingdom' | 'Epcot' | 'Hollywood Studios' | 'Animal Kingdom';
  visitDate: string;
  startTime: string;
  endTime?: string;
  attendees?: string | string[];
  memberEndTimes?: Record<string, string>;
  notes?: string;
  activities: Activity[];
}

const FIXED_FAMILY_MEMBERS = ['Dan', 'Mandie', 'Elijah', 'Sophia', 'Sam', 'Andrew'];
const UNIVERSAL_ACTIVITIES = ['Character Meeting', 'Parade', 'Fireworks Show', 'Other / Show / Food'];

const PARK_EMOJIS: Record<string, string> = {
  'Magic Kingdom': '🏰',
  'Epcot': '🪩',
  'Hollywood Studios': '🎥',
  'Animal Kingdom': '🌳',
};

const PARK_ATTRACTIONS: Record<string, string[]> = {
  'Magic Kingdom': [
    'Astro Orbiter', 'The Barnstormer', 'Big Thunder Mountain Railroad', 'Buzz Lightyear’s Space Ranger Spin',
    'Carousel of Progress', 'Country Bear Musical Jamboree', 'Dumbo the Flying Elephant', 'Enchanted Tales with Belle',
    'The Hall of Presidents', 'Haunted Mansion', '“it’s a small world”', 'Jungle Cruise', 'Mad Tea Party',
    'The Magic Carpets of Aladdin', 'The Many Adventures of Winnie the Pooh', 'Mickey’s PhilharMagic',
    'Peter Pan’s Flight', 'Pirates of the Caribbean', 'Prince Charming Regal Carrousel', 'Seven Dwarfs Mine Train',
    'Space Mountain', 'Swiss Family Treehouse', 'Tiana’s Bayou Adventure', 'Tomorrowland Speedway',
    'Tomorrowland Transit Authority PeopleMover', 'TRON Lightcycle / Run', 'Under the Sea ~ Journey of The Little Mermaid',
    'Walt Disney Enchanted Tiki Room', 'Walt Disney World Railroad'
  ],
  'Epcot': [
    'Beauty and the Beast Sing-Along', 'Canada Circle-Vision 360', 'Disney and Pixar Short Film Festival',
    'Frozen Ever After', 'Gran Fiesta Tour Starring The Three Caballeros', 'Guardians of the Galaxy: Cosmic Rewind',
    'ImageWorks What If Labs', 'Journey into Imagination with Figment', 'Journey of Water, Inspired by Moana',
    'Living with the Land', 'Mission: SPACE (Green)', 'Mission: SPACE (Orange)', 'Reflections of China',
    'Remy’s Ratatouille Adventure', 'Soarin', 'Spaceship Earth', 'Test Track',
    'The Seas with Nemo & Friends', 'Turtle Talk with Crush'
  ],
  'Hollywood Studios': [
    'Alien Swirling Saucers', 'Beauty and the Beast Live on Stage', 'Disney Junior Play & Dance!',
    'Disney Villains: Unfairly Ever After', 'Fantasmic',
    'For the First Time in Forever: A Frozen Sing-Along Celebration', 'Indiana Jones Epic Stunt Spectacular!',
    'Mickey & Minnie’s Runaway Railway', 'Millennium Falcon: Smugglers Run',
    'Rock ’n’ Roller Coaster', 'Slinky Dog Dash', 'Star Tours – The Adventures Continue',
    'Star Wars: Rise of the Resistance', 'The Twilight Zone Tower of Terror', 'The Little Mermaid: A Musical Adventure',
    'Toy Story Mania!', 'Vacation Fun', 'Walt Disney Presents'
  ],
  'Animal Kingdom': [
    'Avatar Flight of Passage', 'Expedition Everest', 'Feathered Friends in Flight!',
    'Festival of the Lion King', 'Finding Nemo: The Big Blue... and Beyond!', 'Gorilla Falls Exploration Trail',
    'Kali River Rapids', 'Kilimanjaro Safaris', 'Maharajah Jungle Trek',
    'Na’vi River Journey', 'The Animation Experience at Conservation Station', 'Wildlife Express Train',
    'Zootopia: Better Together'
  ]
};

const RIDE_TRIVIA_DB: Record<string, string[]> = {
  'Space Mountain': ['Did you know? Gordon Cooper served as a consultant for Space Mountain!'],
  'Haunted Mansion': ['The singing busts include Thurl Ravenscroft, Tony the Tiger\'s voice!']
};

const HIDDEN_MICKEYS_DB: Record<string, string[]> = {
  'Space Mountain': ['Check the star map exit hallway for three circular asteroids!'],
  'Haunted Mansion': ['In the grand ballroom, plates on the dining table form a classic Mickey!']
};

const getRideTriviaFact = (rideName: string, parkName: string): string => {
  if (RIDE_TRIVIA_DB[rideName] && RIDE_TRIVIA_DB[rideName].length > 0) {
    const facts = RIDE_TRIVIA_DB[rideName];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  return 'Keep your eyes peeled for eerie queue secrets hidden in plain sight... 🎃';
};

const getHiddenMickeyFact = (rideName: string, parkName: string): string => {
  if (HIDDEN_MICKEYS_DB[rideName] && HIDDEN_MICKEYS_DB[rideName].length > 0) {
    const list = HIDDEN_MICKEYS_DB[rideName];
    return list[Math.floor(Math.random() * list.length)];
  }
  return 'Look closely at shadows and wall props for hidden easter eggs!';
};

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

  const [mainTab, setMainTab] = useState<'tracker' | 'analytics' | 'checklist'>('tracker');
  const [trackerSubTab, setTrackerSubTab] = useState<'Visit a Park' | 'Past Visits'>('Visit a Park');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'averages' | 'top10' | 'cards'>('averages');

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedAttendee, setSelectedAttendee] = useState<string>('ALL');

  const [parkName, setParkName] = useState<'Magic Kingdom' | 'Epcot' | 'Hollywood Studios' | 'Animal Kingdom'>('Magic Kingdom');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  
  const [rideName, setRideName] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);

  const [queueStartTimestamp, setQueueStartTimestamp] = useState<number | null>(null);
  const [queueStartTimeStr, setQueueStartTimeStr] = useState<string | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [rideTrivia, setRideTrivia] = useState<string | null>(null);
  const [triviaLoading, setTriviaLoading] = useState<boolean>(false);

  const [hiddenMickey, setHiddenMickey] = useState<string | null>(null);
  const [mickeyLoading, setMickeyLoading] = useState<boolean>(false);

  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editRideName, setEditRideName] = useState('');
  const [editWaitTime, setEditWaitTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRiders, setEditRiders] = useState<string[]>([]);

  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [editVisitStartTime, setEditVisitStartTime] = useState('');
  const [editVisitEndTime, setEditVisitEndTime] = useState('');
  const [editVisitMemberEndTimes, setEditVisitMemberEndTimes] = useState<Record<string, string>>({});

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
      setRideName(PARK_ATTRACTIONS[activeVisit.parkName]?.[0] || '');
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
        const formattedVisits: Visit[] = visitsData.map((v: any) => ({
          id: v.id,
          visitDate: v.visitDate || v.visitdate,
          startTime: v.startTime || v.starttime,
          endTime: v.endTime || v.endtime || '',
          parkName: v.parkName || v.parkname,
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

  const filteredVisits = useMemo(() => {
    if (selectedAttendee === 'ALL') return visits;
    return visits.filter(v => {
      const attList = parseAttendees(v.attendees);
      return attList.includes(selectedAttendee);
    });
  }, [visits, selectedAttendee]);

  const isPersonRider = (activity: Activity, visit: Visit, person: string) => {
    const activityRiders = parseAttendees(activity.riders);
    if (activityRiders.length > 0) {
      return activityRiders.includes(person);
    }
    return parseAttendees(visit.attendees).includes(person);
  };

  const totalDays = filteredVisits.length;
  
  const totalActivities = useMemo(() => {
    if (selectedAttendee === 'ALL') {
      return filteredVisits.reduce((sum, v) => sum + v.activities.length, 0);
    }
    return filteredVisits.reduce((sum, v) => {
      return sum + v.activities.filter(a => isPersonRider(a, v, selectedAttendee)).length;
    }, 0);
  }, [filteredVisits, selectedAttendee]);

  const totalWaitMinutes = useMemo(() => {
    if (selectedAttendee === 'ALL') {
      return filteredVisits.reduce((sum, v) => sum + v.activities.reduce((aSum, act) => aSum + act.waitTimeMinutes, 0), 0);
    }
    return filteredVisits.reduce((sum, v) => {
      return sum + v.activities
        .filter(a => isPersonRider(a, v, selectedAttendee))
        .reduce((aSum, act) => aSum + act.waitTimeMinutes, 0);
    }, 0);
  }, [filteredVisits, selectedAttendee]);

  const totalParkMinutes = useMemo(() => {
    return filteredVisits.reduce((sum, v) => {
      const attendeesToCount = selectedAttendee === 'ALL' 
        ? parseAttendees(v.attendees)
        : [selectedAttendee];

      let visitTime = 0;
      attendeesToCount.forEach(person => {
        const pEndTime = getPersonEndTime(v, person);
        if (v.startTime && pEndTime) {
          const start = parseTimeToMinutes(v.startTime);
          const end = parseTimeToMinutes(pEndTime);
          visitTime += end >= start ? (end - start) : ((1440 - start) + end);
        }
      });

      const avgTimeForVisit = attendeesToCount.length > 0 ? visitTime / attendeesToCount.length : 0;
      return sum + avgTimeForVisit;
    }, 0);
  }, [filteredVisits, selectedAttendee]);

  const avgActivitiesPerDay = totalDays > 0 ? (totalActivities / totalDays).toFixed(1) : '0';
  const avgParkMinutesPerDay = totalDays > 0 ? totalParkMinutes / totalDays : 0;
  const avgWaitPerActivity = totalActivities > 0 ? Math.round(totalWaitMinutes / totalActivities) : 0;

  const getParkBreakdown = (visitList: Visit[], personFilter: string) => {
    const initialParks: Record<string, { visits: number; activities: number; timeInPark: number; waitTime: number }> = {
      'Magic Kingdom': { visits: 0, activities: 0, timeInPark: 0, waitTime: 0 },
      'Epcot': { visits: 0, activities: 0, timeInPark: 0, waitTime: 0 },
      'Hollywood Studios': { visits: 0, activities: 0, timeInPark: 0, waitTime: 0 },
      'Animal Kingdom': { visits: 0, activities: 0, timeInPark: 0, waitTime: 0 },
    };
    visitList.forEach(v => {
      const park = v.parkName;
      if (initialParks[park]) {
        initialParks[park].visits += 1;
        const validActs = personFilter === 'ALL' 
          ? v.activities 
          : v.activities.filter(a => isPersonRider(a, v, personFilter));
        
        initialParks[park].activities += validActs.length;
        initialParks[park].waitTime += validActs.reduce((sum, act) => sum + act.waitTimeMinutes, 0);
        
        const pEndTime = personFilter === 'ALL' ? v.endTime : getPersonEndTime(v, personFilter);
        if (v.startTime && pEndTime) {
          const start = parseTimeToMinutes(v.startTime);
          const end = parseTimeToMinutes(pEndTime);
          initialParks[park].timeInPark += end >= start ? (end - start) : ((1440 - start) + end);
        }
      }
    });
    return initialParks;
  };

  const getRideBreakdown = (visitList: Visit[], personFilter: string) => {
    const rideMap: Record<string, { count: number; totalWait: number; park: string }> = {};
    visitList.forEach(v => {
      const validActs = personFilter === 'ALL' 
        ? v.activities 
        : v.activities.filter(a => isPersonRider(a, v, personFilter));

      validActs.forEach(act => {
        const key = act.rideName === 'Character Meeting' && act.notes ? `Meet ${act.notes}` : act.rideName;
        if (!rideMap[key]) rideMap[key] = { count: 0, totalWait: 0, park: v.parkName };
        rideMap[key].count += 1;
        rideMap[key].totalWait += act.waitTimeMinutes;
      });
    });
    return Object.keys(rideMap)
      .map(name => ({ name, ...rideMap[name], avgWait: Math.round(rideMap[name].totalWait / rideMap[name].count) }));
  };

  const parkStats = getParkBreakdown(filteredVisits, selectedAttendee);
  const rideStats = getRideBreakdown(filteredVisits, selectedAttendee);

  const mostTimesRidden = [...rideStats]
    .sort((a, b) => b.count !== a.count ? b.count - a.count : b.totalWait - a.totalWait)
    .slice(0, 10);

  const longestWaitTimes = [...rideStats]
    .sort((a, b) => b.avgWait !== a.avgWait ? b.avgWait - a.avgWait : b.count - a.count)
    .slice(0, 10);

  const shortestWaitTimes = [...rideStats]
    .sort((a, b) => a.avgWait !== b.avgWait ? a.avgWait - b.avgWait : b.count - a.count)
    .slice(0, 10);

  const topActivity = mostTimesRidden[0] || { name: 'None Yet 🎃', count: 0, totalWait: 0 };

  const getRideCountsMap = (visitList: Visit[], personFilter: string) => {
    const counts: Record<string, number> = {};
    visitList.forEach(v => {
      const validActs = personFilter === 'ALL'
        ? v.activities
        : v.activities.filter(a => isPersonRider(a, v, personFilter));

      validActs.forEach(act => {
        counts[act.rideName] = (counts[act.rideName] || 0) + 1;
      });
    });

    if (activeVisit) {
      const isUserInActive = personFilter === 'ALL' || parseAttendees(activeVisit.attendees).includes(personFilter);
      if (isUserInActive) {
        const validActiveActs = personFilter === 'ALL'
          ? activeVisit.activities
          : activeVisit.activities.filter(a => isPersonRider(a, activeVisit, personFilter));

        validActiveActs.forEach(act => {
          counts[act.rideName] = (counts[act.rideName] || 0) + 1;
        });
      }
    }
    return counts;
  };

  const rideCountsMap = getRideCountsMap(filteredVisits, selectedAttendee);

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
        visitDate: localDate,
        startTime: localTime,
        endTime: '',
        parkName,
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
      parkName,
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
    const notesVal = rideName === 'Character Meeting' && characterName ? characterName : undefined;
    const ridersStr = selectedRiders.join(', ');

    const supabase = await getSupabase();
    let { data, error } = await supabase
      .from('activities')
      .insert({
        visit_id: activeVisit.id,
        rideName,
        waitTimeMinutes: waitMins,
        notes: notesVal,
        riders: ridersStr
      })
      .select()
      .single();

    if (error && error.message.includes('riders')) {
      const fallbackRes = await supabase
        .from('activities')
        .insert({
          visit_id: activeVisit.id,
          rideName,
          waitTimeMinutes: waitMins,
          notes: notesVal
        })
        .select()
        .single();

      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      setErrorMessage("Error adding activity: " + error.message);
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
    setCharacterName('');
  };

  const fetchRideTrivia = async (attractionName: string, park: string) => {
    setTriviaLoading(true);
    const localFact = getRideTriviaFact(attractionName, park);
    setRideTrivia(localFact);
    setTriviaLoading(false);
  };

  const fetchHiddenMickey = async (attractionName: string, park: string) => {
    setMickeyLoading(true);
    const localMickey = getHiddenMickeyFact(attractionName, park);
    setHiddenMickey(localMickey);
    setMickeyLoading(false);
  };

  const handleStartQueueTimer = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
    setQueueStartTimestamp(now.getTime());
    setQueueStartTimeStr(timeString);
    if (activeVisit) {
      fetchRideTrivia(rideName, activeVisit.parkName);
      fetchHiddenMickey(rideName, activeVisit.parkName);
    }
  };

  const handleEndQueueTimer = async () => {
    if (!activeVisit || !queueStartTimestamp) return;
    const nowMs = Date.now();
    const diffMs = nowMs - queueStartTimestamp;
    let calculatedWait = Math.round(diffMs / 60000);
    if (calculatedWait <= 0) calculatedWait = 1;

    const notesVal = rideName === 'Character Meeting' && characterName ? characterName : undefined;
    const ridersStr = selectedRiders.join(', ');

    const supabase = await getSupabase();
    let { data, error } = await supabase
      .from('activities')
      .insert({
        visit_id: activeVisit.id,
        rideName,
        waitTimeMinutes: calculatedWait,
        notes: notesVal,
        riders: ridersStr
      })
      .select()
      .single();

    if (error && error.message.includes('riders')) {
      const fallbackRes = await supabase
        .from('activities')
        .insert({
          visit_id: activeVisit.id,
          rideName,
          waitTimeMinutes: calculatedWait,
          notes: notesVal
        })
        .select()
        .single();

      data = fallbackRes.data;
      error = fallbackRes.error;
    }

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
    setCharacterName('');
    setWaitTime('');
    setRideTrivia(null);
    setHiddenMickey(null);
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
    let { error } = await supabase
      .from('activities')
      .update({
        rideName: editRideName,
        waitTimeMinutes: waitMins,
        notes: notesVal,
        riders: ridersStr
      })
      .eq('id', editingActivityId);

    if (error && error.message.includes('riders')) {
      const fallbackRes = await supabase
        .from('activities')
        .update({
          rideName: editRideName,
          waitTimeMinutes: waitMins,
          notes: notesVal
        })
        .eq('id', editingActivityId);

      error = fallbackRes.error;
    }

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
        startTime: editVisitStartTime,
        endTime: editVisitEndTime,
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
        endTime: finalEndTime,
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
    setRideTrivia(null);
    setHiddenMickey(null);
  };

  const deleteVisit = async (id: string) => {
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this log?");
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

      {/* 1. HEADER MENU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#12121A', borderRadius: '16px', border: '1px solid #27273A', padding: '6px', marginBottom: '12px' }}>
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'tracker' ? '#FF5500' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'analytics' ? '#DC2626' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'analytics' ? '800' : '600', color: mainTab === 'analytics' ? '#DC2626' : '#9CA3AF', marginTop: '4px' }}>Analytics</span>
        </button>

        {/* Checklist */}
        <button
          onClick={() => setMainTab('checklist')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 2px 6px 2px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: mainTab === 'checklist' ? '3px solid #10B981' : '3px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={mainTab === 'checklist' ? '#10B981' : '#6B7280'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'checklist' ? '800' : '600', color: mainTab === 'checklist' ? '#10B981' : '#9CA3AF', marginTop: '4px' }}>Checklist</span>
        </button>
      </div>

      {mainTab === 'tracker' && (
        <div style={{ display: 'flex', background: '#12121A', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '14px' }}>
          <button onClick={() => setTrackerSubTab('Visit a Park')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Visit a Park' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Visit a Park' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Visit Event
          </button>
          <button onClick={() => setTrackerSubTab('Past Visits')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Past Visits' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Past Visits' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Past Visits
          </button>
        </div>
      )}

      {mainTab === 'analytics' && (
        <div style={{ display: 'flex', background: '#12121A', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '14px' }}>
          <button onClick={() => setAnalyticsSubTab('averages')} style={{ flex: 1, padding: '9px 2px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'averages' ? '#FF5500' : 'transparent', color: analyticsSubTab === 'averages' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Averages
          </button>
          <button onClick={() => setAnalyticsSubTab('top10')} style={{ flex: 1, padding: '9px 2px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'top10' ? '#FF5500' : 'transparent', color: analyticsSubTab === 'top10' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Top 10s
          </button>
          <button onClick={() => setAnalyticsSubTab('cards')} style={{ flex: 1, padding: '9px 2px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'cards' ? '#FF5500' : 'transparent', color: analyticsSubTab === 'cards' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Attendee Cards
          </button>
        </div>
      )}

      {/* FILTER BY ATTENDEE */}
      {(mainTab === 'checklist' || (mainTab === 'analytics' && analyticsSubTab !== 'cards')) && (
        <div style={{ background: '#12121A', padding: '12px 14px', borderRadius: '16px', border: '1px solid #27273A', marginBottom: '14px' }}>
          <label style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>👤 FILTER BY ATTENDEE</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {FIXED_FAMILY_MEMBERS.map(m => {
              const isSelected = selectedAttendee === m;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedAttendee(prev => prev === m ? 'ALL' : m)}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: isSelected ? '800' : '500',
                    border: isSelected ? '2px solid #FF5500' : '1px solid #27273A',
                    background: isSelected ? '#FF5500' : '#1A1A26',
                    color: isSelected ? '#FFF' : '#D1D5DB',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected ? `✓ ${m}` : m}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== PAGE 1: TRACKER ==================== */}
      {mainTab === 'tracker' && (
        <div>
          {trackerSubTab === 'Visit a Park' && (
            <div>
              {activeVisit ? (
                <div style={{ background: 'linear-gradient(135deg, #1A1A26 0%, #0D0D14 100%)', color: '#FFF', padding: '20px', borderRadius: '24px', marginBottom: '25px', border: '1px solid #FF5500', boxShadow: '0 8px 24px rgba(255, 85, 0, 0.15)' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ background: '#FF5500', color: '#FFF', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' }}>
                      🔥 CURRENTLY AT EVENT
                    </span>
                  </div>

                  <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.3px', width: '100%', color: '#FF5500' }}>
                    {PARK_EMOJIS[activeVisit.parkName] || '🎃'} {activeVisit.parkName}
                  </h2>

                  <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '8px', fontWeight: '600' }}>
                    📅 {formatDisplayDate(activeVisit.visitDate)} &nbsp;•&nbsp; ⏰ Arrived: <strong>{format12Hour(activeVisit.startTime)}</strong>
                  </div>

                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#E5E7EB' }}>
                    👥 <strong>Active Squad:</strong> {activePartyList.join(', ')}
                  </p>

                  {/* TRACK ATTRACTION CARD */}
                  <div style={{ background: '#12121A', padding: '16px', borderRadius: '18px', marginBottom: '15px', color: '#F3F4F6', border: '1px solid #27273A' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#FF5500' }}>Track House / Attraction:</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <select value={rideName} onChange={(e) => setRideName(e.target.value)} disabled={!!queueStartTimestamp} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #27273A', background: queueStartTimestamp ? '#1A1A26' : '#1A1A26', fontSize: '14px', color: '#FFF' }}>
                        <optgroup label="Houses & Rides">
                          {PARK_ATTRACTIONS[activeVisit.parkName]?.map((attraction) => (
                            <option key={attraction} value={attraction}>{attraction}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Events & Activities">
                          {UNIVERSAL_ACTIVITIES.map((action) => (
                            <option key={action} value={action}>{action}</option>
                          ))}
                        </optgroup>
                      </select>

                      {activePartyList.length > 1 && (
                        <div style={{ background: '#1A1A26', border: '1px solid #27273A', padding: '10px', borderRadius: '10px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>
                            👥 WHO IS ENTERING THIS?
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
                                    border: isRiding ? '2px solid #FF5500' : '1px solid #27273A',
                                    background: isRiding ? '#FF5500' : '#12121A',
                                    color: isRiding ? '#FFF' : '#9CA3AF',
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

                      {queueStartTimestamp ? (
                        <div style={{ background: '#1F130B', border: '1px solid #FF5500', padding: '14px', borderRadius: '14px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', fontWeight: '900', color: '#FF5500', letterSpacing: '0.5px' }}>⏱️ LIVE QUEUE TIMER RUNNING</div>
                          
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#E5E7EB', marginTop: '6px' }}>
                            Entered line at: <strong style={{ color: '#FF5500' }}>{queueStartTimeStr}</strong>
                          </div>
                          
                          <div style={{ fontSize: '20px', fontWeight: '900', color: '#FF5500', margin: '8px 0' }}>
                            Time in line: {getElapsedQueueTimeString()}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button type="button" onClick={() => { setQueueStartTimestamp(null); setQueueStartTimeStr(null); setRideTrivia(null); setHiddenMickey(null); }} style={{ flex: 1, padding: '10px', background: '#27273A', color: '#9CA3AF', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                              Cancel
                            </button>
                            <button type="button" onClick={handleEndQueueTimer} style={{ flex: 2, padding: '10px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                              ✅ Completed House!
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ borderTop: '1px solid #27273A', paddingTop: '10px', marginTop: '5px' }}>
                          <button type="button" onClick={handleStartQueueTimer} style={{ width: '100%', padding: '12px', background: '#FF5500', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            ⏱️ Start Line Timer
                          </button>

                          <div style={{ textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: 'bold', marginBottom: '12px', position: 'relative' }}>
                            <span style={{ background: '#12121A', padding: '0 10px', position: 'relative', zIndex: 2 }}>OR LOG MANUALLY</span>
                            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#27273A', zIndex: 1 }}></div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" placeholder="Enter wait time (mins)" value={waitTime} onChange={(e) => setWaitTime(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #27273A', background: '#1A1A26', color: '#FFF', fontSize: '14px' }} />
                            <button type="button" onClick={handleAddRideLive} style={{ padding: '11px 22px', background: '#27273A', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                              Log
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {activeVisit.activities.length > 0 && (
                      <div style={{ marginTop: '15px', borderTop: '1px dashed #27273A', paddingTop: '12px' }}>
                        <strong style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginBottom: '8px' }}>TONIGHT'S LOG ({activeVisit.activities.length}):</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {activeVisit.activities.map((act) => {
                            const isEditingThis = editingActivityId === act.id && editingVisitId === null;
                            const actRidersList = parseAttendees(act.riders);

                            return isEditingThis ? (
                              <div key={act.id} style={{ background: '#1A1A26', border: '1px solid #FF5500', padding: '10px', borderRadius: '10px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#FF5500', marginBottom: '6px' }}>EDIT ENTRY</div>
                                <select value={editRideName} onChange={(e) => setEditRideName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #27273A', background: '#12121A', color: '#FFF', fontSize: '13px', marginBottom: '6px' }}>
                                  <optgroup label="Houses & Rides">
                                    {PARK_ATTRACTIONS[activeVisit.parkName]?.map((attraction) => (
                                      <option key={attraction} value={attraction}>{attraction}</option>
                                    ))}
                                  </optgroup>
                                  <optgroup label="Events & Activities">
                                    {UNIVERSAL_ACTIVITIES.map((action) => (
                                      <option key={action} value={action}>{action}</option>
                                    ))}
                                  </optgroup>
                                </select>

                                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                  <input type="number" value={editWaitTime} onChange={(e) => setEditWaitTime(e.target.value)} placeholder="Wait (mins)" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #27273A', background: '#12121A', color: '#FFF', fontSize: '13px' }} />
                                  <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes (optional)" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #27273A', background: '#12121A', color: '#FFF', fontSize: '13px' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => deleteActivity(act.id)} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
                                  <button onClick={cancelEditing} style={{ background: '#27273A', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={saveEditedActivity} style={{ background: '#10B981', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                                </div>
                              </div>
                            ) : (
                              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1A1A26', padding: '8px 10px', borderRadius: '8px', border: '1px solid #27273A' }}>
                                <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.rideName}</div>
                                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                                    ⏱️ {act.waitTimeMinutes} mins wait {actRidersList.length > 0 ? `• 👥 ${actRidersList.join(', ')}` : ''}
                                  </div>
                                </div>
                                <button onClick={() => startEditing(act, null)} style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', padding: '2px 6px', flexShrink: 0 }}>
                                  Edit
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setDepartingMembers(activePartyList); setShowCheckoutModal(true); }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #DC2626, #991B1B)', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                    👋 Leave Event & Save Night
                  </button>
                </div>
              ) : (
                /* VISIT A PARK FORM */
                <form onSubmit={handleCheckIn} style={{ background: '#12121A', padding: '22px', borderRadius: '24px', marginBottom: '25px', border: '1px solid #27273A' }}>
                  <h2 style={{ marginTop: 0, fontSize: '19px', fontWeight: '800', color: '#FF5500', marginBottom: '15px', textAlign: 'center' }}>Visit Horror Nights</h2>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>WHO'S ATTENDING?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      {FIXED_FAMILY_MEMBERS.map((name) => {
                        const isSelected = selectedAttendees.includes(name);
                        return (
                          <button key={name} type="button" onClick={() => toggleCheckInAttendee(name)} style={{ padding: '10px 4px', borderRadius: '10px', border: isSelected ? '2px solid #FF5500' : '1px solid #27273A', background: isSelected ? '#FF5500' : '#1A1A26', color: isSelected ? '#FFF' : '#D1D5DB', fontSize: '13px', fontWeight: isSelected ? '800' : '500', cursor: 'pointer' }}>
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
                      background: '#FF5500',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Enter the Fog... 🎃
                  </button>
                </form>
              )}

              {/* TOTALS WIDGET */}
              <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', marginBottom: '25px', border: '1px solid #27273A' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#6B7280', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>
                  TOTALS {selectedAttendee !== 'ALL' ? `(${selectedAttendee})` : ''}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ background: '#1A1A26', padding: '12px', borderRadius: '14px', border: '1px solid #27273A' }}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#FF5500' }}>{totalDays}</div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginTop: '2px' }}>EVENT VISITS</div>
                  </div>
                  <div style={{ background: '#1A1A26', padding: '12px', borderRadius: '14px', border: '1px solid #27273A' }}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#10B981' }}>{totalActivities}</div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginTop: '2px' }}>HOUSES / ACTIVITIES</div>
                  </div>
                </div>

                <div style={{ background: '#1F130B', padding: '12px 15px', borderRadius: '14px', border: '1px solid #FF5500', marginBottom: '18px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '900', color: '#FF5500', marginBottom: '3px', letterSpacing: '0.5px' }}>⭐ TOP EXPERIENCE</div>
                  <div style={{ fontWeight: '800', color: '#FFF', fontSize: '15px' }}>{topActivity.name}</div>
                  <div style={{ color: '#9CA3AF', marginTop: '3px', fontSize: '12px' }}>
                    Logged <strong>{topActivity.count}x</strong> | Total Wait: <strong style={{ color: '#FF5500' }}>{formatMinutes(topActivity.totalWait || 0)}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab: Past Visits */}
          {trackerSubTab === 'Past Visits' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#FF5500', paddingLeft: '5px' }}>
                Past Event Visits ({filteredVisits.length})
              </h2>
              {loading ? (
                <p style={{ color: '#6B7280', textAlign: 'center', fontSize: '14px', margin: '20px 0' }}>Syncing with cloud...</p>
              ) : filteredVisits.length === 0 ? (
                <p style={{ color: '#6B7280', textAlign: 'center', fontSize: '14px', marginTop: '20px', fontStyle: 'italic' }}>No completed visits found.</p>
              ) : (
                filteredVisits.map((v) => {
                  const partyList = parseAttendees(v.attendees);

                  return (
                    <div key={v.id} style={{ border: '1px solid #27273A', borderRadius: '20px', padding: '16px', marginBottom: '12px', background: '#12121A' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #27273A', paddingBottom: '8px', marginBottom: '10px' }}>
                        <strong style={{ color: '#FF5500', fontSize: '16px', fontWeight: '800' }}>
                          🎃 Halloween Horror Nights
                        </strong>
                        <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '600' }}>📅 {formatDisplayDate(v.visitDate)}</span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#D1D5DB', marginBottom: '10px' }}>
                        👥 <strong>Party:</strong> {partyList.join(', ')}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #27273A' }}>
                        <button onClick={() => openEditVisit(v)} style={{ background: '#1A1A26', color: '#FF5500', border: '1px solid #FF5500', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>
                          ✏️ Edit Hours
                        </button>
                        <button onClick={() => deleteVisit(v.id)} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '11px', cursor: 'pointer', padding: 0, fontWeight: '700' }}>
                          🗑️ Delete Log
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== PAGE 2: ANALYTICS ==================== */}
      {mainTab === 'analytics' && (
        <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', border: '1px solid #27273A' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#FF5500', margin: '0 0 15px 0', borderBottom: '1px solid #27273A', paddingBottom: '6px' }}>
            📊 Event Analytics
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Your statistics will build as you log houses and attractions!</p>
        </div>
      )}

      {/* ==================== PAGE 3: CHECKLIST ==================== */}
      {mainTab === 'checklist' && (
        <div style={{ background: '#12121A', borderRadius: '24px', padding: '18px', border: '1px solid #27273A' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FF5500', margin: '0 0 14px 0' }}>
            🎃 House & Attraction Checklist
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Checklist items will populate here as we configure your HHN houses!</p>
        </div>
      )}

      {/* ✏️ EDIT VISIT LOG MODAL */}
      {editingVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '440px', width: '100%', border: '1px solid #27273A' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>
              ✏️ Edit Visit Hours
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={() => setEditingVisit(null)} style={{ flex: 1, padding: '12px', background: '#27273A', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSaveVisitEdit} style={{ flex: 2, padding: '12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* 👋 STAGGERED CHECK-OUT MODAL */}
      {showCheckoutModal && activeVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '400px', width: '100%', border: '1px solid #27273A' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>
              👋 Leaving the Event
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={() => processCheckout('everyone')} style={{ width: '100%', padding: '12px', background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Check Out Everyone
              </button>
              <button type="button" onClick={() => setShowCheckoutModal(false)} style={{ width: '100%', padding: '8px', background: 'none', color: '#9CA3AF', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
