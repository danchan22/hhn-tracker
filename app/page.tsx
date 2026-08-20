'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

import { StarRatingPicker } from '../components/UI/StarRatingPicker';
import { HouseRatingModal } from '../components/Modals/HouseRatingModal';
import { GamesTab } from '../components/Tabs/GamesTab';
import { YumTab } from '../components/Tabs/YumTab';
import { MapTab } from '../components/Tabs/MapTab';
import { PretzelTracker } from '../components/Shared/PretzelTracker';

// --- SAFE LAZY SUPABASE CLIENT INITIALIZATION ---
let supabaseInstance: any = null;

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
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

interface YumComment {
  id: string;
  item_id: string;
  author_name: string;
  comment_text: string;
  created_at?: string;
}

interface GameItem {
  id: string;
  name: string;
  players: string;
  appRequired: boolean;
  overview: string;
  description: string;
  isAiTrivia?: boolean;
  noLearnMore?: boolean;
  externalLink?: string;
  iosLink?: string;
  androidLink?: string;
}

interface TriviaQuestion {
  id: string | number;
  category: string;
  difficulty: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface ParkingLog {
  id: string;
  garage_name: string;
  row_number: string;
  parked_by: string;
  created_at: string;
}

type AnalyticsSortKey = 'visits' | 'avgWait' | 'totalWait' | 'avgExpected' | 'diff';

const FIXED_FAMILY_MEMBERS = [
  'Dan', 'Mandie', 'Elijah', 'Violette', 'Sophia', 'Zach', 'Jasmine', 'Kimbo'
];

const PARKING_GARAGES = [
  { name: 'Jurassic Park', color: '#D9000C', file: '/parking-jp.png' },
  { name: 'King Kong', color: '#FFE600', file: '/parking-kong.png', darkText: true },
  { name: 'Jaws', color: '#0050CA', file: '/parking-jaws.png' },
  { name: 'Spider-Man', color: '#6414B3', file: '/parking-spider.png' },
  { name: 'Cat in the Hat', color: '#FF8200', file: '/parking-cat.png' },
  { name: 'E.T.', color: '#009E48', file: '/parking-et.png' }
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

const HOUSE_BANNERS: Record<string, string> = {
  'Cybergoria': '/house-cybergoria.jpg',
  'Evil Dead Burn': '/house-evil.jpg',
  'Hellraiser': '/house-hellraiser.jpg',
  'H.R. Bloodengutz': '/house-bloodengutz.jpg',
  'INVASION: Alien Abduction': '/house-invasion.jpg',
  'Jack & Oddfellow': '/house-oddfellow.jpg',
  'Madlands: Caged Cannibals': '/house-madlands.jpg',
  'Ozzy Osbourne': '/house-ozzy.jpg',
  'Sinners': '/house-sinners.jpg',
  'Stranger Things 5': '/house-stranger.jpg'
};

const HHN_RIDES = [
  'Men in Black: Alien Attack',
  'Transformers: The Ride-3D',
  'Harry Potter and the Escape from Gringotts',
  'Revenge of the Mummy'
];

const RIDE_BANNERS: Record<string, string> = {
  'Men in Black: Alien Attack': '/ride-mib.jpg',
  'Transformers: The Ride-3D': '/ride-transformers.jpg',
  'Harry Potter and the Escape from Gringotts': '/ride-gringotts.jpg',
  'Revenge of the Mummy': '/ride-mummy.jpg'
};

const HHN_SHOWS = [
  'Nightmare Fuel: Blood Noir',
  'Stranger Things (Lagoon Show)'
];

const HOUSE_GRID_LAYOUT = [
  [
    { name: 'Sinners', apiKey: 'Sinners' },
    { name: 'Hellraiser', apiKey: 'Hellraiser' }
  ],
  [
    { name: 'Ozzy Osbourne', apiKey: 'Ozzy Osbourne' },
    { name: 'Evil Dead', apiKey: 'Evil Dead Burn' }
  ],
  [
    { name: 'ST5', apiKey: 'Stranger Things 5' },
    { name: 'INVASION', apiKey: 'INVASION: Alien Abduction' },
    { name: 'Cybergoria', apiKey: 'Cybergoria' }
  ],
  [
    { name: 'Oddfellow', apiKey: 'Jack & Oddfellow' },
    { name: 'Bloodengutz', apiKey: 'H.R. Bloodengutz' },
    { name: 'Cannibals', apiKey: 'Madlands: Caged Cannibals' }
  ]
];

const RIDE_GRID_LAYOUT = [
  [
    { name: 'Men in Black', apiKey: 'Men in Black: Alien Attack' },
    { name: 'Transformers', apiKey: 'Transformers: The Ride-3D' }
  ],
  [
    { name: 'Harry Potter', apiKey: 'Harry Potter and the Escape from Gringotts' },
    { name: 'Mummy', apiKey: 'Revenge of the Mummy' }
  ]
];

const ITEM_EMOJIS: Record<string, string> = {
  'Sinners': '🧛',
  'Hellraiser': '🧩',
  'Ozzy Osbourne': '🦇',
  'Stranger Things 5': '🚲',
  'Evil Dead Burn': '🪓',
  'Jack & Oddfellow': '🎪',
  'H.R. Bloodengutz': '🩸',
  'Cybergoria': '🤖',
  'Madlands: Caged Cannibals': '🥩',
  'INVASION: Alien Abduction': '👽',
  'Men in Black: Alien Attack': '🔫',
  'Transformers: The Ride-3D': '🚗',
  'Harry Potter and the Escape from Gringotts': '🧙‍♂️',
  'Harry Potter': '🧙‍♂️',
  'Revenge of the Mummy': '🧟',
  'Nightmare Fuel: Blood Noir': '🔥',
  'Stranger Things (Lagoon Show)': '🌊'
};

const YUM_LOCATIONS = [
  'Jack’s Circus Surplus',
  'Oddfellow’s Menagerie',
  'Devil Food Booth',
  'WSQK',
  'Meetz Meats',
  'Hellraiser Food Truck',
  'Animal Actors'
];

const ACCENT_COLORS = [
  '#FF5500', '#3B82F6', '#10B981', '#A855F7', '#F59E0B', '#EC4899', '#06B6D4', '#E11D48', '#8B5CF6'
];

const MOCK_YUM_ITEMS = [
  {
    id: 'jack-funnel-cake',
    name: 'Carnival Terror Funnel Cake',
    description: 'Crispy funnel cake topped with black sugar, crushed Oreo cookies, and red strawberry drizzle.',
    location: 'Jack’s Circus Surplus',
    price: '$9.99',
    rawPrice: 9.99,
    image: '/hhn-bg.jpg',
    isFood: true,
    isDrink: false,
    isDessert: true,
    isGlutenFree: false
  },
  {
    id: 'meetz-speakeasy-burger',
    name: 'Sour Bloody Mary Cocktail',
    description: 'Vodka mixed with spiced tomato juice, lime, and served with a salted bacon rim.',
    location: 'Meetz Meats',
    price: '$14.50',
    rawPrice: 14.50,
    image: '/hhn-bg.jpg',
    isFood: false,
    isDrink: true,
    isDessert: false,
    isGlutenFree: true
  },
  {
    id: 'hellraiser-fire-tacos',
    name: 'Cenobite Fiery Tacos',
    description: 'Spiced pulled pork served in gluten-free corn tortillas with habanero slaw.',
    location: 'Hellraiser Food Truck',
    price: '$11.49',
    rawPrice: 11.49,
    image: '/hhn-bg.jpg',
    isFood: true,
    isDrink: false,
    isDessert: false,
    isGlutenFree: true
  },
  {
    id: 'devil-devilish-brownie',
    name: 'Devilish Dark Chocolate Cake',
    description: 'Rich dark chocolate lava cake infused with cayenne pepper and raspberry core.',
    location: 'Devil Food Booth',
    price: '$8.49',
    rawPrice: 8.49,
    image: '/hhn-bg.jpg',
    isFood: true,
    isDrink: false,
    isDessert: true,
    isGlutenFree: false
  }
];

const RAW_GAMES_LIST: GameItem[] = [
  {
    id: 'ai-horror-trivia',
    name: 'Horror Movie Trivia',
    players: '1+',
    appRequired: false,
    isAiTrivia: true,
    overview: 'Endless horror trivia. Pick your favorite sub-genre and difficulty to test your knowledge in line!',
    description: 'Endless horror trivia. Pick your favorite sub-genre and difficulty to test your knowledge in line!'
  },
  {
    id: 'hide-the-peanut',
    name: 'Hide the Peanut',
    players: '2+',
    appRequired: false,
    overview: 'One player hides an imaginary peanut anywhere in the world. Everyone else asks Yes or No questions to discover where it’s hidden.',
    description: `One player hides an imaginary peanut anywhere in the world. Everyone else asks Yes or No questions to discover where it’s hidden.\n\nFor the Peanut hider: Think of anywhere in the world, real or imaginary. Be as generic (the peanut is in Florida) or specific (the peanut is behind Mickey Mouse’s left ear) as you’d like.\n\nFor the guessers: Ask questions that can only be answered with Yes or No. Keep asking questions until you find the peanut.`
  },
  {
    id: 'the-puppeteer',
    name: 'The Puppeteer',
    players: '2',
    appRequired: false,
    overview: 'The puppeteer thinks of an action and the puppet acts out the gestures of that action until they guess what they\'re doing.',
    description: `This game has two roles: The puppeteer and the puppet.\n\nThe puppeteer thinks of an action that involves some movement (like mowing the lawn). They have to get the puppet to act out the action good enough to guess what they're supposed to be doing.\n\nNote for the puppet: You can't do anything unless the puppeteer tells you to. You can guess as many times as you like, but the game isn't over until you guess correctly.`
  },
  {
    id: 'last-answers',
    name: 'Last Answers',
    players: '2+',
    appRequired: false,
    overview: 'One player must answer absurd questions with a pre-chosen, mismatched noun without cracking a smile.',
    description: `One player is designated "it" and silently thinks of a random noun (like "the Marianas Trench"). The other players take turns asking any question that would normally prompt a noun answer. No matter how nonsensical it sounds, "it" must answer with their secret word, straight-faced. If they laugh, the player who asked that question becomes the new "it."\n\nThe twist that keeps it going: after answering, "it" immediately thinks up a new noun that's a plausible response to the question just asked, and that becomes the answer to whatever question comes next. So questioners get a rough sense of what the next answer might be based on the previous question, but "it" has no idea what's coming, since the next question is usually shaped around their last answer.`
  },
  {
    id: 'party-crasher',
    name: 'Party Crasher',
    players: '4+',
    appRequired: true,
    overview: 'An impostor style game. Players take turns asking each other questions about the party.',
    description: `Partygoers (most players):\nYou see the party theme (e.g., "Beach Party"). Your goal is to find the crasher!\n\nThe Party Crasher (1 player):\nYou DON'T see the theme - just that you're the crasher. Blend in and figure out what kind of party it is!\n\nThe goal is to ask questions that:\n• Help you identify who doesn't know the theme (the crasher)\n• Don't give away too much info (or the crasher will figure it out)`,
    externalLink: 'https://partycrasher.playfecture.com/rules.html'
  },
  {
    id: 'jinx',
    name: 'Jinx',
    players: '2+',
    appRequired: false,
    overview: 'A group game where everyone shouts out a word simultaneously, again and again, until by chance everyone lands on the same word at once.',
    description: `A group game where everyone shouts out a word simultaneously, again and again, until by chance everyone lands on the same word at once.\n\nEveryone says a word at the same time. Then they do it again. And again. Repeat until everyone has said exactly the same word.`
  },
  {
    id: 'starts-with-ends-with',
    name: 'Starts with Ends With',
    players: '2-4',
    appRequired: true,
    overview: 'Players press the spinner to reveal two letters, then race to shout a word that starts and ends with those letters.',
    description: 'Players press the spinner to reveal two letters, then race to shout a word that starts and ends with those letters.',
    externalLink: 'https://starts-with-ends-with.vercel.app/'
  },
  {
    id: 'rhyme-rush',
    name: 'Rhyme Rush',
    players: '1+',
    appRequired: true,
    overview: 'Match words that rhyme with the given target word to score points.',
    description: 'Match words that rhyme with the given target word to score points.',
    externalLink: 'https://rhymerush.com'
  },
  {
    id: 'name-chain',
    name: 'Name Chain',
    players: '2+',
    appRequired: false,
    overview: 'A chain game where players take turns naming items in a category, each one starting with the same letter as the last name of the item before it.',
    description: `Pick a category — "Celebrities," "NBA players," "Horror movies," whatever. Going around the group, each person names an item in that category whose first or last name starts with the same letter as the previous person's last name.\n\nExample: Category is "Celebrities." First person says "Tom Holland" — last name starts with "H." The next person must name a celebrity starting with "H," like "Harry Connick Jr." or "Woody Harrelson."`
  },
  {
    id: 'count-to-21',
    name: 'Count to 21',
    players: '4+',
    appRequired: false,
    overview: 'A chaotic counting game where numbers get swapped for words or sounds.',
    description: `A chaotic counting game where numbers get swapped for words or sounds.\n\nGo around the group counting up by one. Whoever says "21" adds a new rule — like replacing "5" with a dog bark. Start counting again from 1, following all the rules so far, and keep adding a new rule each time you reach 21. Mess up, and the count restarts from 1.`
  },
  {
    id: 'secret-categories',
    name: 'Secret Categories',
    players: '2+',
    appRequired: false,
    overview: 'Guess each other\'s secret categories, one word at a time.',
    description: `Each player secretly picks a category. Taking turns, everyone says one word or phrase that fits their own secret category. After each round, players try to guess what everyone else's category is.`
  },
  {
    id: 'neanderthal-cinema',
    name: 'Neanderthal Cinema',
    players: '2+',
    appRequired: false,
    overview: 'A guessing game where one player describes a movie using only one-syllable words until the group figures it out.',
    description: `One player is the "Neanderthal" and can only speak in one-syllable words. They think of a movie, then describe it using only one-syllable words until the rest of the group guesses what it is.`
  },
  {
    id: 'guess-the-number',
    name: 'Guess the Number',
    players: '2+',
    appRequired: false,
    overview: 'A guessing game where players secretly pick a number and drop clues through quirky comparison questions until the group can guess it.',
    description: `Each person secretly picks a number from 0 to 100. Taking turns, players ask yes/no-style questions that hint at their number without stating it outright — like "Would I get arrested for driving this fast?" or "Could I eat this many eggs without puking?" After a few rounds of questions, everyone guesses each other's number.`
  },
  {
    id: 'categories',
    name: 'Categories',
    players: '2+',
    appRequired: false,
    overview: 'A fast-paced elimination game where players race to name things in a category without repeating, missing, or hesitating.',
    description: `Pick a random category, like "Horror movies." Going quickly around the circle, each person names something that fits. Repeat an answer, name something that doesn't fit, or hesitate too long, and you're out. Start a new category each round and keep playing until one person remains.`
  },
  {
    id: 'finish-the-song',
    name: 'Finish the Song',
    players: '2+',
    appRequired: false,
    noLearnMore: true,
    overview: 'One person sings a word from a random song. The other person must finish singing that song.',
    description: 'One person sings a word from a random song. The other person must finish singing that song.'
  },
  {
    id: 'wavelength',
    name: 'Wavelength',
    players: '2+',
    appRequired: true,
    overview: 'Win by reading each other\'s minds.',
    description: 'Hot or cold. Soft or hard. Wizard or…not a wizard? Work together to decide where your clue falls on the spectrum — and win by reading your friends\' minds.',
    iosLink: 'https://apps.apple.com/us/app/wavelength-a-party-game/id1512834505',
    androidLink: 'https://play.google.com/store/apps/details?id=com.PalmCourt.Wavelength'
  },
  {
    id: 'contact',
    name: 'Contact',
    players: '2+',
    appRequired: false,
    overview: 'A word-guessing game where one player secretly thinks of a word and reveals it letter by letter while everyone else tries to guess it using clues.',
    description: `One player is the "wordmaster" and secretly thinks of a word, then announces its first letter.\n\nThe other players try to get more letters by offering a clue: a word that starts with the same letter(s) revealed so far and relates to what they think the secret word might be. If the letter is D, they might say "a type of flower" for "daffodil."\n\nIf another player thinks they know what word the clue-giver means, they shout "Contact!" Both players then count down together from 3 and say their guess at the same time. If their words match, the wordmaster must reveal the next letter of the secret word; if they don't match — or if the wordmaster can guess the clue-giver's word first — nothing happens and play continues.\n\nThe game ends when someone guesses the full secret word correctly.`
  },
  {
    id: 'nah-thats',
    name: 'Nah that\'s...',
    players: '2+',
    appRequired: false,
    overview: 'A circle game where players take turns rhyming off a starting word, each one posing a joke riddle about their word.',
    description: `One player kicks things off with a word or short phrase (e.g., "I'm broke.") Going around the group, each other player has to come up with a new word that rhymes with it. Instead of just blurting the word out, they build in a little bit: they first pose a mock riddle describing their word ("Are you talking about the thing inside of an egg?"), then someone answers "No, that's yolk!" Play continues around the circle — smoke, choke, a boat, a tote — with each person trying to find a rhyme nobody's used yet.`
  }
];

const HHN_MAP_LOCATIONS = [
  // HOUSES
  { id: 'stranger-things-5', name: 'Stranger Things 5', shortName: 'ST5', category: 'house', lat: 28.475292026146676, lng: -81.46777677183829, apiKey: 'Stranger Things 5', anchorOffset: [0, 20] },
  { id: 'evil-dead-burn', name: 'Evil Dead Burn', shortName: 'Evil Dead', category: 'house', lat: 28.475322676539005, lng: -81.46789747123661, apiKey: 'Evil Dead Burn', anchorOffset: [0, -10] },
  { id: 'jack-oddfellow', name: 'Jack & Oddfellow', shortName: 'Oddfellow', category: 'house', lat: 28.47565511483836, lng: -81.46865385413282, apiKey: 'Jack & Oddfellow', anchorOffset: [0, 22] },
  { id: 'ozzy-osbourne', name: 'Ozzy Osbourne', shortName: 'Ozzy', category: 'house', lat: 28.47566454569684, lng: -81.46908300754912, apiKey: 'Ozzy Osbourne', anchorOffset: [0, -28] },
  { id: 'madlands', name: 'Madlands: Caged Cannibals', shortName: 'Madlands', category: 'house', lat: 28.47565511483836, lng: -81.46922784682711, apiKey: 'Madlands: Caged Cannibals', anchorOffset: [0, 22] },
  { id: 'cybergoria', name: 'Cybergoria', shortName: 'Cybergoria', category: 'house', lat: 28.477930369513274, lng: -81.46954248310902, apiKey: 'Cybergoria' },
  { id: 'hellraiser', name: 'Hellraiser', shortName: 'Hellraiser', category: 'house', lat: 28.480578740065464, lng: -81.46842275368006, apiKey: 'Hellraiser', anchorOffset: [20, -10] },
  { id: 'sinners', name: 'Sinners', shortName: 'Sinners', category: 'house', lat: 28.48051132782185, lng: -81.4683745461523, apiKey: 'Sinners', anchorOffset: [-20, -10] },
  { id: 'bloodengutz', name: 'H.R. Bloodengutz', shortName: 'Bloodengutz', category: 'house', lat: 28.480131892382673, lng: -81.4674673680962, apiKey: 'H.R. Bloodengutz' },
  { id: 'invasion', name: 'INVASION: Alien Abduction', shortName: 'Invasion', category: 'house', lat: 28.479205447850518, lng: -81.46771936199599, apiKey: 'INVASION: Alien Abduction' },

  // SHOWS
  { id: 'club-horror', name: 'Club Horror', shortName: 'Club Horror', category: 'show', lat: 28.478669993859793, lng: -81.46935622675115 },
  { id: 'nightmare-fuel', name: 'Nightmare Fuel: Blood Noir', shortName: 'Nightmare Fuel', category: 'show', lat: 28.48025323483047, lng: -81.46886319519807 },
  { id: 'stranger-things-lagoon', name: 'Stranger Things Lagoon Show', shortName: 'Lagoon Show', category: 'show', lat: 28.47772141320968, lng: -81.46822099260383, anchorOffset: [-15, -15] },

  // RIDES
  { id: 'transformers', name: 'TRANSFORMERS: The Ride-3D', shortName: 'Transformers', category: 'ride', lat: 28.476645350396623, lng: -81.46856265903122, apiKey: 'Transformers: The Ride-3D' },
  { id: 'mummy', name: 'Revenge of the Mummy', shortName: 'Mummy', category: 'ride', lat: 28.476720796540143, lng: -81.46961676712924, apiKey: 'Revenge of the Mummy' },
  { id: 'mib', name: 'MEN IN BLACK Alien Attack', shortName: 'MIB', category: 'ride', lat: 28.480530073021992, lng: -81.46800287375153, apiKey: 'Men in Black: Alien Attack', anchorOffset: [0, 18] },
  { id: 'gringotts', name: 'Escape from Gringotts', shortName: 'Gringotts', category: 'ride', lat: 28.479747344951384, lng: -81.46995552189331, apiKey: 'Harry Potter and the Escape from Gringotts', anchorOffset: [-10, -10] },

  // SCARE ZONES
  { id: 'clowntown', name: 'Downtown Clowntown', shortName: 'Clowntown', category: 'scarezone', lat: 28.47646852330843, lng: -81.46949338552207 },
  { id: 'carnival', name: 'Infernal Carnival of Nightmares', shortName: 'Carnival', category: 'scarezone', lat: 28.475251944861867, lng: -81.46734493618837 },
  { id: 'sideshow-decay', name: 'Sideshow of Decay', shortName: 'Sideshow of Decay', category: 'scarezone', lat: 28.476404865479935, lng: -81.46732347850697 },
  { id: 'fortnitemares', name: 'Fortnitemares', shortName: 'Fortnitemares', category: 'scarezone', lat: 28.47765915338453, lng: -81.46787869572786, anchorOffset: [15, 15] },
  { id: 'mels-zombies', name: 'Mel’s Die-In: Zombies', shortName: 'Mel’s Die-In', category: 'scarezone', lat: 28.476700537760085, lng: -81.46770869071331 },
  { id: 'death-daddies', name: 'Death Eaters Encounter', shortName: 'Death Daddies', category: 'scarezone', lat: 28.479643609471676, lng: -81.46974899181171, anchorOffset: [15, 15] },

  // WATER STATIONS
  { id: 'water-1', name: 'Water Station', shortName: '💧', category: 'water', lat: 28.47574, lng: -81.46897 },
  { id: 'water-2', name: 'Water Station', shortName: '💧', category: 'water', lat: 28.47659, lng: -81.46771 },
  { id: 'water-3', name: 'Water Station', shortName: '💧', category: 'water', lat: 28.47812, lng: -81.46904 },
  { id: 'water-4', name: 'Water Station', shortName: '💧', category: 'water', lat: 28.47744, lng: -81.46932 },
  { id: 'water-5', name: 'Water Station', shortName: '💧', category: 'water', lat: 28.47731, lng: -81.46781 },
  { id: 'water-6', name: 'Water Station', shortName: '💧', category: 'water', lat: 28.47998, lng: -81.46766 },
  { id: 'water-7', name: 'Water Station', shortName: '💧', category: 'water', lat: 28.48017, lng: -81.46787 }
];

const EVENING_HOURS = [18, 19, 20, 21, 22, 23];

const INITIAL_MOCK_WAITS: Record<string, number> = {
  'Sinners': 25,
  'Hellraiser': 40,
  'Ozzy Osbourne': 55,
  'Stranger Things 5': 75,
  'Evil Dead Burn': 95,
  'Jack & Oddfellow': 30,
  'H.R. Bloodengutz': 45,
  'Cybergoria': 20,
  'Madlands: Caged Cannibals': 65,
  'INVASION: Alien Abduction': 35,
  'Men in Black: Alien Attack': 15,
  'Transformers: The Ride-3D': 25,
  'Harry Potter and the Escape from Gringotts': 50,
  'Revenge of the Mummy': 35
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

const parsePostedWait = (notes?: string): number | null => {
  if (!notes) return null;
  const match = notes.match(/Posted:\s*(\d+)m/i);
  return match ? parseInt(match[1], 10) : null;
};

const getRecent6AMCutoffISO = () => {
  const now = new Date();
  const cutoff = new Date(now);
  if (now.getHours() < 6) {
    cutoff.setDate(cutoff.getDate() - 1);
  }
  cutoff.setHours(6, 0, 0, 0);
  return cutoff.toISOString();
};

interface HouseRating {
  id: string;
  author_name: string;
  house_name: string;
  overall_rating: number;
  scare_rating: number;
  cool_rating: number;
  created_at: string;
}

const getHouseAverages = (houseName: string, ratings: HouseRating[], attendeeFilter: string) => {
  let houseRatings = ratings.filter(r => r.house_name === houseName);
  if (attendeeFilter !== 'Everyone') {
    houseRatings = houseRatings.filter(r => r.author_name === attendeeFilter);
  }

  if (houseRatings.length === 0) return null;

  const overallAvg = houseRatings.reduce((s, r) => s + Number(r.overall_rating), 0) / houseRatings.length;
  const scareAvg = houseRatings.reduce((s, r) => s + Number(r.scare_rating), 0) / houseRatings.length;
  const coolAvg = houseRatings.reduce((s, r) => s + Number(r.cool_rating), 0) / houseRatings.length;

  return {
    count: houseRatings.length,
    overall: overallAvg.toFixed(1),
    scare: scareAvg.toFixed(1),
    cool: coolAvg.toFixed(1)
  };
};

export default function HorrorNightsTracker() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);

  // Main Tabs
  const [mainTab, setMainTab] = useState<'tracker' | 'analytics' | 'map' | 'yum' | 'games'>('tracker');
  
  // Tracker Subtabs
  const [trackerSubTab, setTrackerSubTab] = useState<'Tonight' | 'History' | 'Parking'>('Tonight');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'Houses' | 'Rides' | 'Attendees'>('Houses');

  // Map Filter & Location States
  const [mapCategoryFilter, setMapCategoryFilter] = useState<'all' | 'house' | 'ride' | 'show' | 'scarezone' | 'water' | 'food'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasCenteredUserMap, setHasCenteredUserMap] = useState<boolean>(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  // Parking Form States
  const [parkingAttendees, setParkingAttendees] = useState<string[]>([]);
  const [parkingGarage, setParkingGarage] = useState<string>(PARKING_GARAGES[0].name);
  const [parkingRowNumber, setParkingRowNumber] = useState<string>('');
  const [parkingLogs, setParkingLogs] = useState<ParkingLog[]>([]);
  const [parkingSaving, setParkingSaving] = useState<boolean>(false);

  // Yum Tab Filter & Sorting States
  const [yumCategoryFilter, setYumCategoryFilter] = useState<'all' | 'food' | 'drink' | 'dessert' | 'gf'>('all');
  const [selectedYumLocation, setSelectedYumLocation] = useState<string>('All Locations');
  const [yumSortBy, setYumSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'location-asc'>('default');
  const [previewYumImage, setPreviewYumImage] = useState<string | null>(null);

  // Yum Comments Drawer State
  const [openCommentsItemId, setOpenCommentsDrawerItemId] = useState<string | null>(null);
  const [yumCommentsMap, setYumCommentsMap] = useState<Record<string, YumComment[]>>({});
  const [commentAuthor, setCommentAuthor] = useState<string>('Dan');
  const [commentTextInput, setCommentTextInput] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // Pretzel Tracker States
  const [regularPretzels, setRegularPretzels] = useState<number>(0);
  const [cinnamonPretzels, setCinnamonPretzels] = useState<number>(0);
  const [pretzelsSyncing, setPretzelsSyncing] = useState<boolean>(false);

  // Analytics Sort States
  const [analyticsSortKey, setAnalyticsSortKey] = useState<AnalyticsSortKey>('visits');
  const [analyticsSortOrder, setAnalyticsSortOrder] = useState<'asc' | 'desc'>('desc');

  // Games Tab Modal States
  const [activeLearnMoreGame, setActiveLearnMoreGame] = useState<GameItem | null>(null);
  const [activeLearnMoreColor, setActiveLearnMoreColor] = useState<string>('#10B981');

  // House Rating States & Modal
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [ratingAuthor, setRatingAuthor] = useState<string>('Dan');
  const [ratingHouse, setRatingHouse] = useState<string>(HHN_HOUSES[0]);
  const [overallRatingVal, setOverallRatingVal] = useState<number>(4.0);
  const [scareRatingVal, setScareRatingVal] = useState<number>(3.5);
  const [coolRatingVal, setCoolRatingVal] = useState<number>(4.5);
  const [ratingSubmitting, setRatingSubmitting] = useState<boolean>(false);
  const [allHouseRatings, setAllHouseRatings] = useState<HouseRating[]>([]);
  
  // Supabase Trivia Live & Leaderboard States
  const [showAiTriviaModal, setShowAiTriviaModal] = useState<boolean>(false);
  const [triviaCategory, setTriviaCategory] = useState<string>('All');
  const [triviaDifficulty, setTriviaDifficulty] = useState<string>('All');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableDifficulties, setAvailableDifficulties] = useState<string[]>([]);
  
  const [triviaDeck, setTriviaDeck] = useState<TriviaQuestion[]>([]);
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [triviaLoading, setTriviaLoading] = useState<boolean>(false);
  const [triviaError, setTriviaError] = useState<string | null>(null);

  // Streak & High Score States
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestThisRun, setBestThisRun] = useState<number>(0);
  const [allTimeHighScore, setAllTimeHighScore] = useState<number>(0);
  const [allTimeRecordHolder, setAllTimeHighScoreHolder] = useState<string>('None');
  const [newHighScorePending, setNewHighScorePending] = useState<boolean>(false);
  const [recordClaimName, setRecordClaimName] = useState<string>('Dan');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const poiMarkersRef = useRef<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analytics Attendee Filter State
  const [selectedAttendeeFilter, setSelectedAttendeeFilter] = useState<string>('Everyone');

  // Form States
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  
  // Track Activity States
  const [rideName, setRideName] = useState(HHN_HOUSES[0]);
  const [postedWaitTime, setPostedWaitTime] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);

  // Live Activity Editing Modal State
  const [editingLiveActivity, setEditingLiveActivity] = useState<Activity | null>(null);
  const [editLiveRideName, setEditLiveRideName] = useState<string>('');
  const [editLiveRiders, setEditLiveRiders] = useState<string[]>([]);
  const [editLivePostedWait, setEditLivePostedWait] = useState<string>('');
  const [editLiveActualWait, setEditLiveActualWait] = useState<string>('');

  // Timer State
  const [queueStartTimestamp, setQueueStartTimestamp] = useState<number | null>(null);
  const [queueStartTimeStr, setQueueStartTimeStr] = useState<string | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Weather States
  const [hourlyForecast, setHourlyForecast] = useState<Array<{ hourLabel: string; temp: number; pop: number }>>([
    { hourLabel: '6 PM', temp: 86, pop: 20 },
    { hourLabel: '7 PM', temp: 84, pop: 30 },
    { hourLabel: '8 PM', temp: 82, pop: 40 },
    { hourLabel: '9 PM', temp: 80, pop: 30 },
    { hourLabel: '10 PM', temp: 78, pop: 20 },
    { hourLabel: '11 PM', temp: 77, pop: 10 },
  ]);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);

  // Live Wait Times State
  const [liveWaitTimes, setLiveWaitTimes] = useState<Record<string, number>>(INITIAL_MOCK_WAITS);
  const [waitsSyncing, setWaitsSyncing] = useState<boolean>(false);

  // Edit Activity State (Past Visits)
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

  // --- HOUSE RATINGS SUPABASE API ---
  const fetchHouseRatings = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('house_ratings')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setAllHouseRatings(data);
      }
    } catch (e) {}
  };

  const handleSaveHouseRating = async () => {
    setRatingSubmitting(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('house_ratings')
        .insert({
          author_name: ratingAuthor,
          house_name: ratingHouse,
          overall_rating: overallRatingVal,
          scare_rating: scareRatingVal,
          cool_rating: coolRatingVal
        })
        .select()
        .single();

      if (!error && data) {
        setAllHouseRatings(prev => [data, ...prev]);
        setShowRatingModal(false);
      } else if (error) {
        alert("Error saving rating: " + error.message);
      }
    } catch (e: any) {
      alert("Error saving rating: " + e.message);
    } finally {
      setRatingSubmitting(false);
    }
  };
  
  // SORT GAMES: HORROR MOVIE TRIVIA PINNED TO TOP, REST ALPHABETICAL
  const sortedGamesList = useMemo(() => {
    const pinned = RAW_GAMES_LIST.find(g => g.id === 'ai-horror-trivia');
    const others = RAW_GAMES_LIST.filter(g => g.id !== 'ai-horror-trivia');
    others.sort((a, b) => a.name.localeCompare(b.name));
    return pinned ? [pinned, ...others] : others;
  }, []);

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
    fetchLiveWeather();
    fetchThemeParkWaitTimes();
    fetchYumComments();
    fetchPretzelCounts();
    fetchParkingLogs(); 
    fetchHouseRatings();

    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.warn('GPS position error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (rideName && liveWaitTimes[rideName] !== undefined) {
      setPostedWaitTime(liveWaitTimes[rideName].toString());
    }
  }, [rideName, liveWaitTimes]);

  useEffect(() => {
    if (mainTab === 'map' && leafletMapRef.current) {
      const map = leafletMapRef.current;
      requestAnimationFrame(() => {
        map.invalidateSize();
        setTimeout(() => {
          if (leafletMapRef.current) leafletMapRef.current.invalidateSize();
        }, 100);
        setTimeout(() => {
          if (leafletMapRef.current) leafletMapRef.current.invalidateSize();
        }, 300);
      });
    }
  }, [mainTab, isMapFullscreen]);

  useEffect(() => {
    if (mainTab !== 'map' || !mapContainerRef.current) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initOrUpdateMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        const initialLat = userLocation?.lat || 28.4770;
        const initialLng = userLocation?.lng || -81.4680;

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          fadeAnimation: false
        }).setView([initialLat, initialLng], 17);
        
        leafletMapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
      }

      const map = leafletMapRef.current;
      setTimeout(() => { if (map) map.invalidateSize(); }, 200);

      if (userLocation) {
        if (!hasCenteredUserMap) {
          map.setView([userLocation.lat, userLocation.lng], 17);
          setHasCenteredUserMap(true);
        }

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
          userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
            radius: 9,
            fillColor: '#3B82F6',
            color: '#FFFFFF',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.95
          }).addTo(map).bindPopup('<b>📍 You are here</b>');
        }
      }

      poiMarkersRef.current.forEach(m => map.removeLayer(m));
      poiMarkersRef.current = [];

      const filtered = mapCategoryFilter === 'all'
        ? HHN_MAP_LOCATIONS
        : HHN_MAP_LOCATIONS.filter(p => p.category === mapCategoryFilter);

      filtered.forEach(poi => {
        const waitMins = poi.apiKey ? (liveWaitTimes[poi.apiKey] ?? null) : null;
        let iconHtml = '';

        if (poi.category === 'water') {
          iconHtml = `<div style="font-size: 22px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.8)); text-align: center;">💧</div>`;
        } else {
          let badgeColor = '#FF5500';
          if (poi.category === 'ride') badgeColor = '#3B82F6';
          if (poi.category === 'show') badgeColor = '#10B981';
          if (poi.category === 'scarezone') badgeColor = '#A855F7';
          if (poi.category === 'food') badgeColor = '#F59E0B';

          iconHtml = `
            <div style="background: ${badgeColor}; color: #FFF; border: 2px solid #FFF; border-radius: 12px; padding: 2px 8px; font-size: 11px; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.5); text-align: center; white-space: nowrap; width: max-content;">
              ${poi.shortName}
            </div>
          `;
        }

        const anchorPos = poi.anchorOffset ? [20 + poi.anchorOffset[0], 12 + poi.anchorOffset[1]] : [20, 12];

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-pin',
          iconSize: null,
          iconAnchor: anchorPos
        });

        const popupContent = `
          <div style="color: #000; font-family: sans-serif; padding: 4px; text-align: center;">
            <strong style="font-size: 14px; color: #FF5500; display: block; margin-bottom: 4px;">${poi.name}</strong>
            ${waitMins !== null ? `<div style="font-size: 13px; font-weight: bold; margin-bottom: 6px;">⏱️ Current Wait: <span style="color: #FF5500;">${waitMins} mins</span></div>` : ''}
          </div>
        `;

        const marker = L.marker([poi.lat, poi.lng], { icon: customIcon }).addTo(map).bindPopup(popupContent);
        
        marker.on('click', () => {
          marker.setZIndexOffset(1000);
        });

        poiMarkersRef.current.push(marker);
      });
    };

    if ((window as any).L) {
      initOrUpdateMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initOrUpdateMap;
      document.body.appendChild(script);
    }
  }, [mainTab, mapCategoryFilter, liveWaitTimes, userLocation]);

  const handleRecenterUserMap = () => {
    if (leafletMapRef.current && userLocation) {
      leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 17);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.setView([28.4770, -81.4680], 17);
    }
  };

  const fetchThemeParkWaitTimes = async () => {
    setWaitsSyncing(true);
    try {
      const res = await fetch('https://api.themeparks.wiki/v1/entity/eb3f4560-2383-4a36-9152-6b3e5ed6bc57/live');
      if (res.ok) {
        const data = await res.json();
        const liveList = data?.liveData || [];
        const updated: Record<string, number> = { ...liveWaitTimes };

        liveList.forEach((item: any) => {
          const name = item.name;
          const wait = item.queue?.STANDBY?.waitTime ?? item.waitTime ?? 0;
          if (name) {
            Object.keys(INITIAL_MOCK_WAITS).forEach(key => {
              if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
                updated[key] = wait;
              }
            });
          }
        });
        setLiveWaitTimes(updated);
      }
    } catch (e) {
      console.warn("ThemeParks API sync error, keeping current wait times:", e);
    } finally {
      setWaitsSyncing(false);
    }
  };

  const fetchLiveWeather = async () => {
    setWeatherLoading(true);
    try {
      const pointsRes = await fetch('https://api.weather.gov/points/28.4743,-81.4678', {
        headers: { 'User-Agent': 'HHNTrackerApp/1.0' }
      });
      if (!pointsRes.ok) throw new Error('NWS Points lookup failed');
      const pointsData = await pointsRes.json();
      const forecastHourlyUrl = pointsData?.properties?.forecastHourly;

      if (forecastHourlyUrl) {
        const forecastRes = await fetch(forecastHourlyUrl, {
          headers: { 'User-Agent': 'HHNTrackerApp/1.0' }
        });
        if (!forecastRes.ok) throw new Error('NWS Forecast lookup failed');
        const forecastData = await forecastRes.json();
        const periods: any[] = forecastData?.properties?.periods || [];

        if (periods.length > 0) {
          const parsed = EVENING_HOURS.map(targetHour => {
            const found = periods.find(p => new Date(p.startTime).getHours() === targetHour);
            const label = targetHour === 12 ? '12 PM' : `${targetHour % 12} PM`;
            return {
              hourLabel: label,
              temp: found?.temperature ?? (86 - (targetHour - 18) * 1.5),
              pop: found?.probabilityOfPrecipitation?.value ?? 10
            };
          });
          setHourlyForecast(parsed);
        }
      }
    } catch (e) {
      console.warn("NWS Weather Fetch Fallback:", e);
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchCloudVisits = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
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
      setErrorMessage("Could not load cloud visits: " + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const fetchYumComments = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('yum_comments').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        const grouped: Record<string, YumComment[]> = {};
        data.forEach((c: any) => {
          if (!grouped[c.item_id]) grouped[c.item_id] = [];
          grouped[c.item_id].push(c);
        });
        setYumCommentsMap(grouped);
      }
    } catch (e) {}
  };

  const fetchParkingLogs = async () => {
    try {
      const cutoffISO = getRecent6AMCutoffISO();
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('parking_logs')
        .select('*')
        .gte('created_at', cutoffISO)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setParkingLogs(data);
      }
    } catch (e) {}
  };

  const handleSaveParkingLog = async () => {
    if (!parkingRowNumber.trim()) {
      alert("Please enter a row number!");
      return;
    }

    setParkingSaving(true);
    const parkedByStr = parkingAttendees.length > 0 ? parkingAttendees.join(', ') : 'Just Me';

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('parking_logs')
        .insert({
          garage_name: parkingGarage,
          row_number: parkingRowNumber.trim(),
          parked_by: parkedByStr
        })
        .select()
        .single();

      if (!error && data) {
        setParkingLogs(prev => [data, ...prev]);
        setParkingRowNumber('');
        setParkingAttendees([]);
      } else if (error) {
        alert("Error saving parking: " + error.message);
      }
    } catch (e: any) {
      alert("Error saving parking: " + e.message);
    } finally {
      setParkingSaving(false);
    }
  };

  const toggleParkingAttendee = (name: string) => {
    if (parkingAttendees.includes(name)) {
      setParkingAttendees(parkingAttendees.filter(a => a !== name));
    } else {
      setParkingAttendees([...parkingAttendees, name]);
    }
  };

  const fetchPretzelCounts = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('global_trackers')
        .select('*')
        .eq('id', 'hhn_pretzels')
        .single();

      if (!error && data) {
        setRegularPretzels(data.regular_pretzels || 0);
        setCinnamonPretzels(data.cinnamon_pretzels || 0);
      }
    } catch (e) {}
  };

  const updatePretzelCount = async (type: 'regular' | 'cinnamon', delta: number) => {
    if (pretzelsSyncing) return;

    const newReg = type === 'regular' ? Math.max(0, regularPretzels + delta) : regularPretzels;
    const newCin = type === 'cinnamon' ? Math.max(0, cinnamonPretzels + delta) : cinnamonPretzels;

    setRegularPretzels(newReg);
    setCinnamonPretzels(newCin);
    setPretzelsSyncing(true);

    try {
      const supabase = getSupabase();
      await supabase
        .from('global_trackers')
        .upsert({
          id: 'hhn_pretzels',
          regular_pretzels: newReg,
          cinnamon_pretzels: newCin,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.warn("Pretzel sync error:", e);
    } finally {
      setPretzelsSyncing(false);
    }
  };

  const handleAddYumComment = async (itemId: string) => {
    if (!commentTextInput.trim()) return;
    setSubmittingComment(true);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('yum_comments')
        .insert({
          item_id: itemId,
          author_name: commentAuthor,
          comment_text: commentTextInput.trim()
        })
        .select()
        .single();

      if (!error && data) {
        setYumCommentsMap(prev => ({
          ...prev,
          [itemId]: [...(prev[itemId] || []), data]
        }));
        setCommentTextInput('');
      }
    } catch (e) {
      alert("Could not post comment. Make sure your yum_comments table is created in Supabase!");
    } finally {
      setSubmittingComment(false);
    }
  };

  const fetchTriviaLeaderboardRecord = async (diff: string) => {
    try {
      const supabase = getSupabase();
      const rowId = `leaderboard_${diff.toLowerCase()}`;
      const { data, error } = await supabase
        .from('trivia_leaderboard')
        .select('*')
        .eq('id', rowId)
        .single();

      if (!error && data) {
        setAllTimeHighScore(data.high_score || 0);
        setAllTimeHighScoreHolder(data.holder_name || 'None');
      } else {
        setAllTimeHighScore(0);
        setAllTimeHighScoreHolder('None');
      }
    } catch (e) {
      setAllTimeHighScore(0);
      setAllTimeHighScoreHolder('None');
    }
  };

  const loadTriviaFromSupabase = async (cat = triviaCategory, diff = triviaDifficulty) => {
    setTriviaLoading(true);
    setTriviaError(null);
    setSelectedOption(null);

    setCurrentStreak(0);
    setBestThisRun(0);
    setNewHighScorePending(false);

    fetchTriviaLeaderboardRecord(diff);

    try {
      const supabase = getSupabase();
      let query = supabase.from('trivia_questions').select('*');

      if (cat !== 'All') query = query.eq('category', cat);
      if (diff !== 'All') query = query.eq('difficulty', diff);

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        setTriviaDeck([]);
        setCurrentTriviaIndex(0);
        setTriviaError('No trivia questions found for this filter.');
        return;
      }

      const shuffled = [...data];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setTriviaDeck(shuffled);
      setCurrentTriviaIndex(0);

      const cats: string[] = Array.from(new Set<string>(data.map((q: TriviaQuestion) => q.category))).filter(Boolean);
      const diffs: string[] = Array.from(new Set<string>(data.map((q: TriviaQuestion) => q.difficulty))).filter(Boolean);

      if (availableCategories.length === 0 && cats.length > 0) setAvailableCategories(cats);
      if (availableDifficulties.length === 0 && diffs.length > 0) setAvailableDifficulties(diffs);

    } catch (e: any) {
      setTriviaError(e.message || 'Error loading trivia from Supabase.');
    } finally {
      setTriviaLoading(false);
    }
  };

  const handleTriviaAnswerSelection = (chosenOption: string) => {
    if (selectedOption !== null || !currentQuestion) return;

    setSelectedOption(chosenOption);

    const correctVal = currentQuestion.correct_answer?.trim()?.toUpperCase();
    const isUserCorrect = chosenOption.toUpperCase() === correctVal || 
      (correctVal === 'A' && chosenOption === currentQuestion.option_a) ||
      (correctVal === 'B' && chosenOption === currentQuestion.option_b) ||
      (correctVal === 'C' && chosenOption === currentQuestion.option_c) ||
      (correctVal === 'D' && chosenOption === currentQuestion.option_d);

    if (isUserCorrect) {
      const nextStreak = currentStreak + 1;
      setCurrentStreak(nextStreak);

      if (nextStreak > bestThisRun) {
        setBestThisRun(nextStreak);
      }

      if (nextStreak > allTimeHighScore) {
        setAllTimeHighScore(nextStreak);
        setNewHighScorePending(true);
      }
    } else {
      setCurrentStreak(0);
    }
  };

  const saveNewHighScoreRecord = async () => {
    try {
      const supabase = getSupabase();
      const rowId = `leaderboard_${triviaDifficulty.toLowerCase()}`;
      await supabase
        .from('trivia_leaderboard')
        .upsert({
          id: rowId,
          difficulty: triviaDifficulty,
          high_score: allTimeHighScore,
          holder_name: recordClaimName,
          updated_at: new Date().toISOString()
        });

      setAllTimeHighScoreHolder(recordClaimName);
      setNewHighScorePending(false);
    } catch (e) {
      console.warn("Failed to save high score:", e);
    }
  };

  const handleNextTriviaQuestion = () => {
    setSelectedOption(null);
    if (triviaDeck.length === 0) return;

    if (currentTriviaIndex + 1 < triviaDeck.length) {
      setCurrentTriviaIndex(prev => prev + 1);
    } else {
      const reshuffled = [...triviaDeck];
      for (let i = reshuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reshuffled[i], reshuffled[j]] = [reshuffled[j], reshuffled[i]];
      }
      setTriviaDeck(reshuffled);
      setCurrentTriviaIndex(0);
    }
  };

  const handleTriviaFilterChange = (newCat?: string, newDiff?: string) => {
    const updatedCat = newCat !== undefined ? newCat : triviaCategory;
    const updatedDiff = newDiff !== undefined ? newDiff : triviaDifficulty;

    if (newCat !== undefined) setTriviaCategory(newCat);
    if (newDiff !== undefined) setTriviaDifficulty(newDiff);

    loadTriviaFromSupabase(updatedCat, updatedDiff);
  };

  const handleAnalyticsSortClick = (key: AnalyticsSortKey) => {
    if (analyticsSortKey === key) {
      setAnalyticsSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAnalyticsSortKey(key);
      setAnalyticsSortOrder('desc');
    }
  };

  const currentQuestion = triviaDeck[currentTriviaIndex] || null;

  const toggleYumCategoryFilter = (cat: 'food' | 'drink' | 'dessert' | 'gf') => {
    if (yumCategoryFilter === cat) {
      setYumCategoryFilter('all');
    } else {
      setYumCategoryFilter(cat);
    }
  };

  const filteredYumItems = useMemo(() => {
    let items = MOCK_YUM_ITEMS.filter(item => {
      if (selectedYumLocation !== 'All Locations' && item.location !== selectedYumLocation) return false;

      if (yumCategoryFilter === 'food') return item.isFood;
      if (yumCategoryFilter === 'drink') return item.isDrink;
      if (yumCategoryFilter === 'dessert') return item.isDessert;
      if (yumCategoryFilter === 'gf') return item.isGlutenFree;

      return true;
    });

    if (yumSortBy === 'price-asc') items.sort((a, b) => a.rawPrice - b.rawPrice);
    if (yumSortBy === 'price-desc') items.sort((a, b) => b.rawPrice - a.rawPrice);
    if (yumSortBy === 'name-asc') items.sort((a, b) => a.name.localeCompare(b.name));
    if (yumSortBy === 'location-asc') items.sort((a, b) => a.location.localeCompare(b.location));

    return items;
  }, [yumCategoryFilter, selectedYumLocation, yumSortBy]);

  const openLiveActivityEdit = (act: Activity) => {
    setEditingLiveActivity(act);
    setEditLiveRideName(act.rideName);
    setEditLiveRiders(parseAttendees(act.riders));
    setEditLivePostedWait(parsePostedWait(act.notes)?.toString() || '');
    setEditLiveActualWait(act.waitTimeMinutes.toString());
  };

  const handleSaveLiveActivityEdit = async () => {
    if (!editingLiveActivity || !activeVisit) return;
    const actualMins = parseInt(editLiveActualWait) || 0;
    const notesVal = editLivePostedWait.trim() ? `Posted: ${editLivePostedWait.trim()}m` : undefined;
    const ridersStr = editLiveRiders.join(', ');

    const supabase = getSupabase();
    const { error } = await supabase
      .from('activities')
      .update({
        ridename: editLiveRideName,
        waittimeminutes: actualMins,
        notes: notesVal,
        riders: ridersStr
      })
      .eq('id', editingLiveActivity.id);

    if (error) {
      alert("Error updating activity: " + error.message);
      return;
    }

    const updatedActivities = activeVisit.activities.map(act => {
      if (act.id === editingLiveActivity.id) {
        return {
          ...act,
          rideName: editLiveRideName,
          waitTimeMinutes: actualMins,
          notes: notesVal,
          riders: editLiveRiders
        };
      }
      return act;
    });

    setActiveVisit({ ...activeVisit, activities: updatedActivities });
    setEditingLiveActivity(null);
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
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const parseTimeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;
    
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const isPM = timeStr.toUpperCase().includes('PM');
      const cleanStr = timeStr.replace(/AM|PM/i, '').trim();
      let [hrs, mins] = cleanStr.split(':').map(Number);
      if (isNaN(hrs)) return 0;
      if (isNaN(mins)) mins = 0;
      if (isPM && hrs < 12) hrs += 12;
      if (!isPM && hrs === 12) hrs = 0;
      return (hrs * 60) + mins;
    }

    const [hrs, mins] = timeStr.split(':').map(Number);
    if (isNaN(hrs)) return 0;
    return (hrs * 60) + (mins || 0);
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

  const getWaitBoxStyle = (minutes: number) => {
    if (minutes <= 30) {
      return {
        bg: '#15803D',
        border: '#22C55E',
        titleColor: '#FFFFFF',
        numColor: '#FFFFFF'
      };
    } else if (minutes <= 45) {
      return {
        bg: 'rgba(26, 26, 38, 0.85)',
        border: '#2A2A3C',
        titleColor: '#A0AEC0',
        numColor: '#22C55E'
      };
    } else if (minutes <= 60) {
      return {
        bg: 'rgba(26, 26, 38, 0.85)',
        border: '#2A2A3C',
        titleColor: '#A0AEC0',
        numColor: '#EAB308'
      };
    } else if (minutes <= 90) {
      return {
        bg: 'rgba(26, 26, 38, 0.85)',
        border: '#2A2A3C',
        titleColor: '#A0AEC0',
        numColor: '#F97316'
      };
    } else {
      return {
        bg: 'rgba(26, 26, 38, 0.85)',
        border: '#2A2A3C',
        titleColor: '#A0AEC0',
        numColor: '#EF4444'
      };
    }
  };

  const allCompletedActivities = useMemo(() => {
    return visits.flatMap(v => v.activities.map(a => ({ ...a, visitDate: v.visitDate })));
  }, [visits]);

  const filteredCompletedActivities = useMemo(() => {
    if (selectedAttendeeFilter === 'Everyone') {
      return allCompletedActivities;
    }
    return allCompletedActivities.filter(a => parseAttendees(a.riders).includes(selectedAttendeeFilter));
  }, [allCompletedActivities, selectedAttendeeFilter]);

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

  const avgHousesPerVisit = totalEventVisits > 0 ? (totalHousesCount / totalEventVisits).toFixed(1) : '0';
  const avgRidesPerVisit = totalEventVisits > 0 ? (totalRidesCount / totalEventVisits).toFixed(1) : '0';
  const avgShowsPerVisit = totalEventVisits > 0 ? (totalShowsCount / totalEventVisits).toFixed(1) : '0';
  const avgDurationPerVisit = totalEventVisits > 0 ? Math.round(totalTimeInParkMins / totalEventVisits) : 0;
  const avgWaitPerActivity = allCompletedActivities.length > 0 ? Math.round(totalTimeInLinesMins / allCompletedActivities.length) : 0;

  const houseAnalyticsStats = useMemo(() => {
    const stats = HHN_HOUSES.map(houseName => {
      const houseActivities = filteredCompletedActivities.filter(a => a.rideName === houseName);
      const visitsCount = houseActivities.length;
      const totalWait = houseActivities.reduce((sum, a) => sum + (a.waitTimeMinutes || 0), 0);
      const avgWait = visitsCount > 0 ? Math.round(totalWait / visitsCount) : 0;

      const postedWaits = houseActivities.map(a => parsePostedWait(a.notes)).filter((w): w is number => w !== null);
      const avgExpected = postedWaits.length > 0 ? Math.round(postedWaits.reduce((s, w) => s + w, 0) / postedWaits.length) : 0;
      const diff = visitsCount > 0 && avgExpected > 0 ? avgWait - avgExpected : 0;

      return {
        name: houseName,
        visits: visitsCount,
        totalWait,
        avgWait,
        avgExpected,
        diff
      };
    });

    return stats.sort((a, b) => {
      const valA = a[analyticsSortKey];
      const valB = b[analyticsSortKey];
      if (valA === valB) return b.visits - a.visits;
      return analyticsSortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [filteredCompletedActivities, analyticsSortKey, analyticsSortOrder]);

  const rideAnalyticsStats = useMemo(() => {
    const stats = HHN_RIDES.map(rideName => {
      const rideActivities = filteredCompletedActivities.filter(a => a.rideName === rideName);
      const visitsCount = rideActivities.length;
      const totalWait = rideActivities.reduce((sum, a) => sum + (a.waitTimeMinutes || 0), 0);
      const avgWait = visitsCount > 0 ? Math.round(totalWait / visitsCount) : 0;

      const postedWaits = rideActivities.map(a => parsePostedWait(a.notes)).filter((w): w is number => w !== null);
      const avgExpected = postedWaits.length > 0 ? Math.round(postedWaits.reduce((s, w) => s + w, 0) / postedWaits.length) : 0;
      const diff = visitsCount > 0 && avgExpected > 0 ? avgWait - avgExpected : 0;

      return {
        name: rideName,
        visits: visitsCount,
        totalWait,
        avgWait,
        avgExpected,
        diff
      };
    });

    return stats.sort((a, b) => {
      const valA = a[analyticsSortKey];
      const valB = b[analyticsSortKey];
      if (valA === valB) return b.visits - a.visits;
      return analyticsSortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [filteredCompletedActivities, analyticsSortKey, analyticsSortOrder]);

  const longestHouseWaits = useMemo(() => {
    return [...filteredCompletedActivities]
      .filter(a => HHN_HOUSES.includes(a.rideName))
      .sort((a, b) => b.waitTimeMinutes - a.waitTimeMinutes)
      .slice(0, 10);
  }, [filteredCompletedActivities]);

  const shortestHouseWaits = useMemo(() => {
    return [...filteredCompletedActivities]
      .filter(a => HHN_HOUSES.includes(a.rideName))
      .sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes)
      .slice(0, 10);
  }, [filteredCompletedActivities]);

  const longestRideWaits = useMemo(() => {
    return [...filteredCompletedActivities]
      .filter(a => HHN_RIDES.includes(a.rideName))
      .sort((a, b) => b.waitTimeMinutes - a.waitTimeMinutes)
      .slice(0, 10);
  }, [filteredCompletedActivities]);

  const shortestRideWaits = useMemo(() => {
    return [...filteredCompletedActivities]
      .filter(a => HHN_RIDES.includes(a.rideName))
      .sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes)
      .slice(0, 10);
  }, [filteredCompletedActivities]);

  const attendeeChecklistData = useMemo(() => {
    const personActivities = filteredCompletedActivities;

    const houseList = HHN_HOUSES.map(h => {
      const items = personActivities.filter(a => a.rideName === h);
      const visits = items.length;
      const totalWait = items.reduce((sum, a) => sum + (a.waitTimeMinutes || 0), 0);
      const avgWait = visits > 0 ? Math.round(totalWait / visits) : 0;
      return { name: h, visits, totalWait, avgWait };
    }).sort((a, b) => b.visits - a.visits || b.totalWait - a.totalWait);

    const rideList = HHN_RIDES.map(r => {
      const targetName = r === 'Harry Potter and the Escape from Gringotts' ? 'Harry Potter' : r;
      const items = personActivities.filter(a => a.rideName === r || a.rideName === 'Harry Potter');
      const visits = items.length;
      const totalWait = items.reduce((sum, a) => sum + (a.waitTimeMinutes || 0), 0);
      const avgWait = visits > 0 ? Math.round(totalWait / visits) : 0;
      return { name: targetName, visits, totalWait, avgWait };
    }).sort((a, b) => b.visits - a.visits || b.totalWait - a.totalWait);

    const showList = HHN_SHOWS.map(s => {
      const items = personActivities.filter(a => a.rideName === s);
      const visits = items.length;
      const totalWait = items.reduce((sum, a) => sum + (a.waitTimeMinutes || 0), 0);
      const avgWait = visits > 0 ? Math.round(totalWait / visits) : 0;
      return { name: s, visits, totalWait, avgWait };
    }).sort((a, b) => b.visits - a.visits || b.totalWait - a.totalWait);

    return { houseList, rideList, showList };
  }, [filteredCompletedActivities]);

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

  const toggleLiveEditRiderSelection = (name: string) => {
    if (editLiveRiders.includes(name)) {
      if (editLiveRiders.length === 1) return;
      setEditLiveRiders(editLiveRiders.filter(r => r !== name));
    } else {
      setEditLiveRiders([...editLiveRiders, name]);
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

  const toggleAttendeeFilter = (name: string) => {
    if (selectedAttendeeFilter === name) {
      setSelectedAttendeeFilter('Everyone');
    } else {
      setSelectedAttendeeFilter(name);
    }
  };

  const toggleMapFilter = (cat: 'all' | 'house' | 'ride' | 'show' | 'scarezone' | 'water' | 'food') => {
    if (mapCategoryFilter === cat) {
      setMapCategoryFilter('all');
    } else {
      setMapCategoryFilter(cat);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const localDate = now.toLocaleDateString('en-CA');
    const localTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const newAttendeesList = selectedAttendees.length > 0 ? selectedAttendees : ['Just Me'];
    const attendeesDbStr = newAttendeesList.join(', ');

    const supabase = getSupabase();
    
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

    const supabase = getSupabase();
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

    const supabase = getSupabase();
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

    const supabase = getSupabase();
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
    const supabase = getSupabase();
    const { error } = await supabase.from('activities').delete().eq('id', activityId);
    if (error) {
      setErrorMessage("Error deleting entry: " + error.message);
      return;
    }

    await fetchCloudVisits();
  };

  const openEditVisit = (v: Visit) => {
    setEditingVisit(v);
    setEditVisitStartTime(format12Hour(v.startTime || ''));
    setEditVisitEndTime(format12Hour(v.endTime || ''));
    
    const formattedEndTimes: Record<string, string> = {};
    const rawEndTimes = v.memberEndTimes || {};
    Object.keys(rawEndTimes).forEach(m => {
      formattedEndTimes[m] = format12Hour(rawEndTimes[m]);
    });
    setEditVisitMemberEndTimes(formattedEndTimes);
  };

  const handleSaveVisitEdit = async () => {
    if (!editingVisit) return;
    const rawAttendeesStr = parseAttendees(editingVisit.attendees).join(', ');
    const jsonEndTimesStr = JSON.stringify(editVisitMemberEndTimes);
    const attendeesWithEndTimes = `${rawAttendeesStr}|ENDTIMES:${jsonEndTimesStr}`;

    const supabase = getSupabase();
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
    const endTime = now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });

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

    const supabase = getSupabase();

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

    const supabase = getSupabase();
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
    if (mins === 0) return secs + 's';
    return mins + ' mins' + (secs > 0 ? ' ' + secs + 's' : '');
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '15px 15px 30px 15px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#F3F4F6', minHeight: '100vh', position: 'relative' }}>
      
      {/* 🎃 APP HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '8px', padding: '10px 0 0 0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#FF5500', letterSpacing: '-0.5px', margin: '0', textShadow: '0 0 12px rgba(255, 85, 0, 0.4)' }}>
          Never Go Alone 😱
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: '800', color: '#DC2626', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Halloween Horror Nights Orlando
        </p>
      </header>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div style={{ background: 'rgba(45, 10, 10, 0.9)', border: '1px solid #DC2626', padding: '10px 14px', borderRadius: '12px', color: '#FCA5A5', fontSize: '13px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5', fontWeight: '900', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* 1. MAIN HEADER MENU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', background: 'rgba(18, 18, 26, 0.85)', borderRadius: '16px', border: '1px solid #27273A', padding: '6px', marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
        <button onClick={() => setMainTab('tracker')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px 6px 2px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: mainTab === 'tracker' ? '3px solid #FF5500' : '3px solid transparent' }}>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'tracker' ? '800' : '600', color: mainTab === 'tracker' ? '#FF5500' : '#9CA3AF' }}>Tracker</span>
        </button>
        <button onClick={() => setMainTab('analytics')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px 6px 2px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: mainTab === 'analytics' ? '3px solid #DC2626' : '3px solid transparent' }}>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'analytics' ? '800' : '600', color: mainTab === 'analytics' ? '#DC2626' : '#9CA3AF' }}>Analytics</span>
        </button>
        <button onClick={() => setMainTab('map')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px 6px 2px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: mainTab === 'map' ? '3px solid #3B82F6' : '3px solid transparent' }}>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'map' ? '800' : '600', color: mainTab === 'map' ? '#3B82F6' : '#9CA3AF' }}>Map</span>
        </button>
        <button onClick={() => setMainTab('yum')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px 6px 2px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: mainTab === 'yum' ? '3px solid #F59E0B' : '3px solid transparent' }}>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'yum' ? '800' : '600', color: mainTab === 'yum' ? '#F59E0B' : '#9CA3AF' }}>Yum</span>
        </button>
        <button onClick={() => setMainTab('games')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px 6px 2px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: mainTab === 'games' ? '3px solid #10B981' : '3px solid transparent' }}>
          <span style={{ fontSize: '11px', fontWeight: mainTab === 'games' ? '800' : '600', color: mainTab === 'games' ? '#10B981' : '#9CA3AF' }}>Games</span>
        </button>
      </div>

      {/* 2. TRACKER SUBHEADER NAVS */}
      {mainTab === 'tracker' && (
        <div style={{ display: 'flex', background: 'rgba(18, 18, 26, 0.85)', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '12px' }}>
          <button onClick={() => setTrackerSubTab('Tonight')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Tonight' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Tonight' ? '#FFF' : '#9CA3AF' }}>Tonight</button>
          <button onClick={() => setTrackerSubTab('History')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'History' ? '#FF5500' : 'transparent', color: trackerSubTab === 'History' ? '#FFF' : '#9CA3AF' }}>History</button>
          <button onClick={() => setTrackerSubTab('Parking')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Parking' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Parking' ? '#FFF' : '#9CA3AF' }}>Parking</button>
        </div>
      )}

      {/* 3. YUM TAB */}
      {mainTab === 'yum' && (
        <YumTab
          yumCategoryFilter={yumCategoryFilter}
          toggleYumCategoryFilter={toggleYumCategoryFilter}
          selectedYumLocation={selectedYumLocation}
          setSelectedYumLocation={setSelectedYumLocation}
          yumSortBy={yumSortBy}
          setYumSortBy={setYumSortBy}
          filteredYumItems={filteredYumItems}
          yumLocations={YUM_LOCATIONS}
          yumCommentsMap={yumCommentsMap}
          openCommentsItemId={openCommentsItemId}
          setOpenCommentsDrawerItemId={setOpenCommentsDrawerItemId}
          commentAuthor={commentAuthor}
          setCommentAuthor={setCommentAuthor}
          commentTextInput={commentTextInput}
          setCommentTextInput={setCommentTextInput}
          submittingComment={submittingComment}
          onAddComment={handleAddYumComment}
          setPreviewYumImage={setPreviewYumImage}
          familyMembers={FIXED_FAMILY_MEMBERS}
        />
      )}

      {/* 4. GAMES TAB */}
      {mainTab === 'games' && (
        <GamesTab
          gamesList={sortedGamesList}
          accentColors={ACCENT_COLORS}
          onOpenTrivia={() => {
            setShowAiTriviaModal(true);
            if (triviaDeck.length === 0) loadTriviaFromSupabase('All', 'All');
          }}
          onOpenLearnMore={(game, color) => {
            setActiveLearnMoreGame(game);
            setActiveLearnMoreColor(color);
          }}
        />
      )}

      {/* 5. MAP TAB */}
      <MapTab
        isVisible={mainTab === 'map'}
        isMapFullscreen={isMapFullscreen}
        setIsMapFullscreen={setIsMapFullscreen}
        mapCategoryFilter={mapCategoryFilter}
        toggleMapFilter={toggleMapFilter}
        mapContainerRef={mapContainerRef}
        handleRecenterUserMap={handleRecenterUserMap}
      />

      {/* 6. TRACKER TAB VIEWS */}
      {mainTab === 'tracker' && trackerSubTab === 'Tonight' && (
        <div>
          {/* RATE A HOUSE WIDGET */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '14px 16px', borderRadius: '18px', border: '1px solid #FDA30C', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#FDA30C' }}>⭐ Rate a House</div>
            </div>
            <button type="button" onClick={() => setShowRatingModal(true)} style={{ padding: '8px 16px', background: '#FDA30C', color: '#000', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '900', cursor: 'pointer' }}>
              Rate Now
            </button>
          </div>

          <PretzelTracker
            regularPretzels={regularPretzels}
            cinnamonPretzels={cinnamonPretzels}
            updatePretzelCount={updatePretzelCount}
          />
        </div>
      )}

      {/* ⭐ HOUSE RATING MODAL */}
      <HouseRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSaveHouseRating}
        ratingAuthor={ratingAuthor}
        setRatingAuthor={setRatingAuthor}
        ratingHouse={ratingHouse}
        setRatingHouse={setRatingHouse}
        overallRatingVal={overallRatingVal}
        setOverallRatingVal={setOverallRatingVal}
        scareRatingVal={scareRatingVal}
        setScareRatingVal={setScareRatingVal}
        coolRatingVal={coolRatingVal}
        setCoolRatingVal={setCoolRatingVal}
        ratingSubmitting={ratingSubmitting}
        familyMembers={FIXED_FAMILY_MEMBERS}
        houses={HHN_HOUSES}
      />

    </div>
  );
}
