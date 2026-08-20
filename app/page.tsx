'use client';

import { HouseRatingModal } from '../components/Modals/HouseRatingModal';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GamesTab } from '../components/Tabs/GamesTab';

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

interface YumItem {
  id: string;
  name: string;
  description: string;
  location: string;
  price: string;
  rawPrice: number;
  image: string;
  isFood: boolean;
  isDrink: boolean;
  isDessert: boolean;
  isGlutenFree: boolean;
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

const MOCK_YUM_ITEMS: YumItem[] = [
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

// FULL SPREADSHEET GAMES LIST
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

interface MapPOI {
  id: string;
  name: string;
  shortName: string;
  category: 'house' | 'ride' | 'show' | 'scarezone' | 'water' | 'food';
  lat: number;
  lng: number;
  apiKey?: string;
  anchorOffset?: [number, number];
}

const HHN_MAP_LOCATIONS: MapPOI[] = [
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

// HELPER STAR RATING INPUT COMPONENT WITH HALF-STAR SELECTION
const StarRatingPicker = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => {
  const stars = [1, 2, 3, 4, 5];

  const handlePointerClick = (starIndex: number, event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isHalf = clickX < rect.width / 2;
    const finalVal = isHalf ? starIndex - 0.5 : starIndex;
    onChange(finalVal);
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: '800', color: '#CBD5E0' }}>{label}</label>
        <span style={{ fontSize: '13px', fontWeight: '900', color: '#FF9A56' }}>{value.toFixed(1)} / 5.0</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
        {stars.map((starIndex) => {
          let starSymbol = '☆';
          let starColor = '#4A5568';

          if (value >= starIndex) {
            starSymbol = '★';
            starColor = '#FDA30C';
          } else if (value >= starIndex - 0.5) {
            starSymbol = '½';
            starColor = '#FDA30C';
          }

          return (
            <div
              key={starIndex}
              onPointerDown={(e) => handlePointerClick(starIndex, e)}
              style={{
                fontSize: '26px',
                color: starColor,
                lineHeight: '1',
                padding: '4px',
                background: '#1A1A26',
                border: '1px solid #2A2A3C',
                borderRadius: '8px',
                flex: 1,
                textAlign: 'center',
                transition: 'all 0.1s ease'
              }}
            >
              {starSymbol}
            </div>
          );
        })}
      </div>
    </div>
  );
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

  // RE-INVALIDATE MAP SIZE ON TAB SWITCH OR FULLSCREEN TOGGLE (PREVENTS BLACKOUT)
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

  // LEAFLET MAP - SINGLE INIT & PIN STAGGERING
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

  // --- PARKING LOGS SUPABASE API ---
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

  // --- PRETZEL TRACKER SUPABASE API ---
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

  // --- SUPABASE DIRECT TRIVIA & LEADERBOARD FETCHING ---
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
    if (mins === 0) return `${secs}s`;
    return `${mins} mins ${secs > 0 ? `${secs}s` : ''}`;
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
            <path d="M11 11V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8"></path>
            <path d="M19 6h2l-1.5-4h-2.5"></path>
            <path d="M11 11a4 4 0 0 0 8 0V7H11v4z"></path>
            <path d="M15 15v7"></path>
            <path d="M12 22h6"></path>
            <path d="M2 13a4 4 0 0 1 8 0v1H2v-1z"></path>
            <path d="M2 17h8v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1z"></path>
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

      {/* 2. TRACKER SUBHEADER NAVS (Tonight | History | Parking) */}
      {mainTab === 'tracker' && (
        <div style={{ display: 'flex', background: 'rgba(18, 18, 26, 0.85)', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
          <button onClick={() => setTrackerSubTab('Tonight')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Tonight' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Tonight' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Tonight
          </button>
          <button onClick={() => setTrackerSubTab('History')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'History' ? '#FF5500' : 'transparent', color: trackerSubTab === 'History' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            History
          </button>
          <button onClick={() => setTrackerSubTab('Parking')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: trackerSubTab === 'Parking' ? '#FF5500' : 'transparent', color: trackerSubTab === 'Parking' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Parking
          </button>
        </div>
      )}

      {/* 2. ANALYTICS SUBHEADER NAVS */}
      {mainTab === 'analytics' && (
        <div style={{ display: 'flex', background: 'rgba(18, 18, 26, 0.85)', borderRadius: '12px', border: '1px solid #27273A', padding: '3px', marginBottom: '16px', backdropFilter: 'blur(8px)' }}>
          <button onClick={() => setAnalyticsSubTab('Houses')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Houses' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Houses' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Houses
          </button>
          <button onClick={() => setAnalyticsSubTab('Rides')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Rides' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Rides' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Rides
          </button>
          <button onClick={() => setAnalyticsSubTab('Attendees')} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', background: analyticsSubTab === 'Attendees' ? '#DC2626' : 'transparent', color: analyticsSubTab === 'Attendees' ? '#FFF' : '#9CA3AF', transition: 'all 0.2s ease' }}>
            Attendees
          </button>
        </div>
      )}

      {/* 🌧️ TRACKER TAB ONLY: CLEAN 6-HOUR EVENING WEATHER GRID */}
      {mainTab === 'tracker' && (
        <a
          href="https://www.timeanddate.com/weather/@6942262/hourly"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textDecoration: 'none',
            background: 'rgba(18, 18, 26, 0.85)',
            border: '1px solid #2A2A3C',
            padding: '12px 10px',
            borderRadius: '16px',
            marginBottom: '16px',
            backdropFilter: 'blur(8px)'
          }}
        >
          {weatherLoading ? (
            <div style={{ textAlign: 'center', color: '#A0AEC0', fontSize: '12px', padding: '4px 0' }}>
              🌤️ Syncing Weather...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {hourlyForecast.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#1A1A26',
                    border: '1px solid #2A2A3C',
                    borderRadius: '10px',
                    padding: '6px 2px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#CBD5E0' }}>
                    {item.hourLabel}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#FFF', margin: '2px 0' }}>
                    {item.temp}°
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: item.pop > 50 ? '#3B82F6' : '#A0AEC0' }}>
                    {item.pop}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </a>
      )}

      {/* 3. YUM TAB VIEW */}
      {mainTab === 'yum' && (
        <div>
          {/* CATEGORY & LOCATION FILTERS & SORT */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '12px', borderRadius: '18px', border: '1px solid #2A2A3C', marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '10px' }}>
              <button
                onClick={() => toggleYumCategoryFilter('food')}
                style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'food' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: yumCategoryFilter === 'food' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
              >
                🍔 Food
              </button>
              <button
                onClick={() => toggleYumCategoryFilter('drink')}
                style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'drink' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: yumCategoryFilter === 'drink' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
              >
                🍹 Drink
              </button>
              <button
                onClick={() => toggleYumCategoryFilter('dessert')}
                style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'dessert' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: yumCategoryFilter === 'dessert' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
              >
                🍰 Dessert
              </button>
              <button
                onClick={() => toggleYumCategoryFilter('gf')}
                style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'gf' ? '2px solid #22C55E' : '1px solid #2A2A3C', background: yumCategoryFilter === 'gf' ? '#22C55E' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
              >
                🌾 GF
              </button>
            </div>

            {/* LOCATION FILTER & SORT DROPDOWNS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select
                value={selectedYumLocation}
                onChange={(e) => setSelectedYumLocation(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', fontWeight: '700' }}
              >
                <option value="All Locations">All Locations</option>
                {YUM_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              <select
                value={yumSortBy}
                onChange={(e: any) => setYumSortBy(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', fontWeight: '700' }}
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Item Name (A-Z)</option>
                <option value="location-asc">Location (A-Z)</option>
              </select>
            </div>
          </div>

          {/* YUM ITEM CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredYumItems.length === 0 ? (
              <p style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '13px', fontStyle: 'italic', margin: '20px 0' }}>No menu items found for this filter.</p>
            ) : (
              filteredYumItems.map(item => {
                const comments = yumCommentsMap[item.id] || [];
                const isCommentsOpen = openCommentsItemId === item.id;
                const hasComments = comments.length > 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(18, 18, 26, 0.85)',
                      borderRadius: '20px',
                      padding: '16px',
                      border: item.isGlutenFree ? '2px solid #22C55E' : '1px solid #2A2A3C',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        onClick={() => setPreviewYumImage(item.image)}
                        onError={(e: any) => { e.target.src = '/hhn-bg.jpg'; }}
                        style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #2A2A3C', flexShrink: 0, cursor: 'pointer' }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#FFF' }}>{item.name}</h3>

                        <div
                          onClick={() => setSelectedYumLocation(item.location)}
                          style={{ fontSize: '11px', fontWeight: '800', color: '#F59E0B', marginTop: '2px', cursor: 'pointer', display: 'inline-block' }}
                        >
                          {item.location}
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: '900', color: '#22C55E', marginTop: '4px' }}>
                          {item.price}
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#CBD5E0', lineHeight: '1.4' }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2A2A3C', paddingTop: '10px' }}>
                      <div>
                        {item.isGlutenFree && (
                          <span style={{ background: '#15803D', color: '#FFF', fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '6px' }}>
                            🌾 GLUTEN-FREE
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setOpenCommentsDrawerItemId(isCommentsOpen ? null : item.id)}
                        style={{ background: '#1A1A26', border: '1px solid #2A2A3C', color: '#CBD5E0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Comments <span style={{ color: hasComments ? '#F59E0B' : '#A0AEC0', fontWeight: '900' }}>({comments.length})</span>
                      </button>
                    </div>

                    {/* INLINE COMMENTS DRAWER */}
                    {isCommentsOpen && (
                      <div style={{ marginTop: '12px', background: '#12121A', padding: '12px', borderRadius: '14px', border: '1px solid #2A2A3C' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', marginBottom: '8px' }}>
                          COMMENTS ({comments.length}):
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                          {comments.length === 0 ? (
                            <div style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic' }}>No comments yet. Be the first!</div>
                          ) : (
                            comments.map(c => (
                              <div key={c.id} style={{ background: '#1A1A26', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', fontSize: '12px' }}>
                                <strong style={{ color: '#FF5500' }}>{c.author_name}:</strong> <span style={{ color: '#CBD5E0' }}>{c.comment_text}</span>
                              </div>
                            ))
                          )}
                        </div>

                        {/* ADD COMMENT FORM */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <select
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px' }}
                          >
                            {FIXED_FAMILY_MEMBERS.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              placeholder="Leave a comment"
                              value={commentTextInput}
                              onChange={(e) => setCommentTextInput(e.target.value)}
                              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddYumComment(item.id)}
                              disabled={submittingComment}
                              style={{ padding: '8px 12px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. GAMES TAB VIEW */}
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

      {/* 5. MAP TAB CONTAINER (ALWAYS MOUNTED TO PREVENT MAP BLACKOUT) */}
      <div style={{ display: mainTab === 'map' ? 'block' : 'none' }}>
        <div style={{
          position: isMapFullscreen ? 'fixed' : 'relative',
          top: isMapFullscreen ? 0 : 'auto',
          left: isMapFullscreen ? 0 : 'auto',
          right: isMapFullscreen ? 0 : 'auto',
          bottom: isMapFullscreen ? 0 : 'auto',
          width: isMapFullscreen ? '100vw' : '100%',
          height: isMapFullscreen ? '100vh' : 'auto',
          zIndex: isMapFullscreen ? 99999 : 'auto',
          background: 'rgba(18, 18, 26, 0.85)',
          borderRadius: isMapFullscreen ? 0 : '24px',
          padding: isMapFullscreen ? '10px' : '14px',
          border: isMapFullscreen ? 'none' : '1px solid #2A2A3C',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box'
        }}>
          {/* CATEGORY FILTERS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '10px' }}>
            <button
              onClick={() => toggleMapFilter('house')}
              style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'house' ? '2px solid #FF5500' : '1px solid #2A2A3C', background: mapCategoryFilter === 'house' ? '#FF5500' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
            >
              🏚️<br />Houses
            </button>
            <button
              onClick={() => toggleMapFilter('ride')}
              style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'ride' ? '2px solid #3B82F6' : '1px solid #2A2A3C', background: mapCategoryFilter === 'ride' ? '#3B82F6' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
            >
              🎢<br />Rides
            </button>
            <button
              onClick={() => toggleMapFilter('show')}
              style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'show' ? '2px solid #10B981' : '1px solid #2A2A3C', background: mapCategoryFilter === 'show' ? '#10B981' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
            >
              🎭<br />Shows
            </button>
            <button
              onClick={() => toggleMapFilter('scarezone')}
              style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'scarezone' ? '2px solid #A855F7' : '1px solid #2A2A3C', background: mapCategoryFilter === 'scarezone' ? '#A855F7' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
            >
              🧟<br />Zones
            </button>
            <button
              onClick={() => toggleMapFilter('water')}
              style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'water' ? '2px solid #06B6D4' : '1px solid #2A2A3C', background: mapCategoryFilter === 'water' ? '#06B6D4' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
            >
              💧<br />Water
            </button>
            <button
              onClick={() => toggleMapFilter('food')}
              style={{ padding: '6px 2px', borderRadius: '8px', border: mapCategoryFilter === 'food' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: mapCategoryFilter === 'food' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center', lineHeight: '1.2' }}
            >
              🍔<br />Food
            </button>
          </div>

          {/* LEAFLET MAP CONTAINER WITH EXPLICIT MIN-HEIGHT */}
          <div style={{ position: 'relative', width: '100%', height: isMapFullscreen ? 'calc(100vh - 80px)' : 'calc(100vh - 250px)', minHeight: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2A2A3C' }}>
            <div
              ref={mapContainerRef}
              style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
            />

            {/* RECENTER & FULLSCREEN BUTTONS (SINGLE LINE & LIGHTER GREY) */}
            <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handleRecenterUserMap}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  background: 'rgba(225, 225, 235, 0.88)',
                  color: '#1A1A26',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(6px)',
                  whiteSpace: 'nowrap'
                }}
              >
                📍 Me
              </button>

              <button
                onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  background: 'rgba(225, 225, 235, 0.88)',
                  color: '#1A1A26',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(6px)',
                  whiteSpace: 'nowrap'
                }}
              >
                {isMapFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. TRACKER TAB VIEWS */}
      {mainTab === 'tracker' && trackerSubTab === 'Tonight' && (
        <div>

          {activeVisit ? (
            /* ACTIVE VISIT LIVE WIDGET */
            <div style={{ background: 'linear-gradient(135deg, rgba(31, 8, 8, 0.9) 0%, rgba(13, 5, 16, 0.95) 100%)', color: '#FFF', padding: '20px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)', border: '2px solid #DC2626', backdropFilter: 'blur(8px)' }}>
              
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
              <div style={{ background: 'rgba(18, 18, 26, 0.9)', padding: '16px', borderRadius: '18px', marginBottom: '15px', color: '#F3F4F6', border: '1px solid #2A2A3C' }}>
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
                                border: isRiding ? '2px solid #DC2626' : '1px solid #2A2A3C',
                                background: isRiding ? '#DC2626' : '#12121A',
                                color: isRiding ? '#FFF' : '#A0AEC0',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {member}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1A1A26', border: '1px solid #2A2A3C', padding: '8px 12px', borderRadius: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', flex: 1 }}>
                      POSTED WAIT TIME (MINS)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 45"
                      value={postedWaitTime}
                      onChange={(e) => setPostedWaitTime(e.target.value)}
                      disabled={!!queueStartTimestamp}
                      style={{ width: '80px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#12121A', color: '#FFF', fontSize: '16px', textAlign: 'center', fontWeight: 'bold' }}
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
                          Entering Attraction
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px solid #2A2A3C', paddingTop: '10px', marginTop: '5px' }}>
                      <button type="button" onClick={handleStartQueueTimer} style={{ width: '100%', padding: '12px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}>
                        ⏱️ Start Line Timer
                      </button>

                      <div style={{ textAlign: 'center', fontSize: '11px', color: '#718096', fontWeight: 'bold', marginBottom: '12px', position: 'relative' }}>
                        <span style={{ background: '#12121A', padding: '0 10px', position: 'relative', zIndex: 2 }}>OR LOG MANUALLY</span>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#2A2A3C', zIndex: 1 }}></div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Actual wait time (mins)"
                          value={waitTime}
                          onChange={(e) => setWaitTime(e.target.value)}
                          style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
                        />
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
                        <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#1A1A26', padding: '8px 10px', borderRadius: '8px', border: '1px solid #2A2A3C' }}>
                          <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#F3F4F6' }}>{act.rideName}</div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              ⏱️ {act.waitTimeMinutes} mins wait {act.notes ? `(${act.notes})` : ''}
                            </div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              👥 {parseAttendees(act.riders).join(', ')}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openLiveActivityEdit(act)}
                            style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '2px 6px' }}
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Leave the Park Button */}
              <button onClick={() => { setDepartingMembers(activePartyList); setShowCheckoutModal(true); }} style={{ width: '100%', padding: '14px', background: '#000000', color: '#FFF', border: '2px solid #DC2626', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}>
                Leave the Park & Save Day
              </button>
            </div>
          ) : (
            /* START YOUR NIGHT FORM */
            <form onSubmit={handleCheckIn} style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '22px', borderRadius: '24px', marginBottom: '25px', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)', border: '2px solid #DC2626', backdropFilter: 'blur(8px)' }}>
              <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '900', color: '#DC2626', marginBottom: '16px', textAlign: 'center' }}>Start Your Night</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>WHO'S ATTENDING?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {FIXED_FAMILY_MEMBERS.map((name) => {
                    const isSelected = selectedAttendees.includes(name);
                    return (
                      <button key={name} type="button" onClick={() => toggleCheckInAttendee(name)} style={{ padding: '10px 2px', borderRadius: '10px', border: isSelected ? '2px solid #DC2626' : '1px solid #2A2A3C', background: isSelected ? '#DC2626' : '#1A1A26', color: isSelected ? '#FFF' : '#CBD5E0', fontSize: '12px', fontWeight: isSelected ? '800' : '600', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enter the Fog Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(to right, #DC2626, #991B1B)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                }}
              >
                Enter the fog...
              </button>
            </form>
          )}

          {/* ⭐ RATE A HOUSE BUTTON / WIDGET */}
<div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '14px 16px', borderRadius: '18px', border: '1px solid #FDA30C', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)' }}>
  <div>
    <div style={{ fontSize: '14px', fontWeight: '900', color: '#FDA30C' }}>⭐ Rate a House</div>
  </div>
  <button
    type="button"
    onClick={() => setShowRatingModal(true)}
    style={{ padding: '8px 16px', background: '#FDA30C', color: '#000', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(253, 163, 12, 0.3)' }}
  >
    Rate Now
  </button>
</div>
          
          {/* 🎪 LIVE WAIT TIMES & SHOW TIMES WIDGET */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: 0, letterSpacing: '0.8px' }}>
                HOUSE WAIT TIMES
              </h3>
              <button
                onClick={fetchThemeParkWaitTimes}
                disabled={waitsSyncing}
                style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
              >
                {waitsSyncing ? '🔄 Syncing...' : '🔄 Refresh'}
              </button>
            </div>

            {/* HOUSE WAIT TIMES GRID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              {HOUSE_GRID_LAYOUT.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '8px' }}>
                  {row.map((item) => {
                    const waitMins = liveWaitTimes[item.apiKey] ?? 30;
                    const style = getWaitBoxStyle(waitMins);
                    return (
                      <div
                        key={item.name}
                        onClick={() => { setRideName(item.apiKey); setPostedWaitTime(waitMins.toString()); }}
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: '12px',
                          padding: '10px 4px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: '800', color: style.numColor }}>
                          {waitMins}<span style={{ fontSize: '11px', fontWeight: '700' }}>m</span>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: style.titleColor, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* RIDE WAIT TIMES GRID */}
            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>
              RIDE WAIT TIMES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              {RIDE_GRID_LAYOUT.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '8px' }}>
                  {row.map((item) => {
                    const waitMins = liveWaitTimes[item.apiKey] ?? 20;
                    const style = getWaitBoxStyle(waitMins);
                    return (
                      <div
                        key={item.name}
                        onClick={() => { setRideName(item.apiKey); setPostedWaitTime(waitMins.toString()); }}
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: '12px',
                          padding: '10px 4px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: '800', color: style.numColor }}>
                          {waitMins}<span style={{ fontSize: '11px', fontWeight: '700' }}>m</span>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: style.titleColor, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* SHOW TIMES SECTION */}
            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>
              SHOW TIMES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: '#1A1A26', padding: '10px 12px', borderRadius: '12px', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#FF5500', marginBottom: '4px' }}>🔥 Nightmare Fuel: Blood Noir</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F3F4F6' }}>8:00 • 9:30 • 11:00 • 12:30</div>
              </div>
              <div style={{ background: '#1A1A26', padding: '10px 12px', borderRadius: '12px', border: '1px solid #2A2A3C' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#3B82F6', marginBottom: '4px' }}>🌊 Stranger Things (Lagoon Show)</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#F3F4F6' }}>10:00 • 11:00 • 12:00</div>
              </div>
            </div>

          </div>

          {/* TOTALS & SUMMARY STATS WIDGET */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 12px 0', letterSpacing: '0.8px' }}>
              TOTALS
            </h3>
            
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

            <div style={{ background: '#1C130D', padding: '12px 15px', borderRadius: '14px', border: '1px solid #C05621', borderLeft: '5px solid #FF5500', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#FF9A56', marginBottom: '3px', letterSpacing: '0.5px' }}>⭐ TOP HOUSE</div>
              <div style={{ fontWeight: '800', color: '#F3F4F6', fontSize: '15px' }}>
                {topHouseData ? `${ITEM_EMOJIS[topHouseData.name] || '🏚️'} ${topHouseData.name}` : 'None Logged Yet'}
              </div>
              {topHouseData && (
                <div style={{ color: '#CBD5E0', marginTop: '3px', fontSize: '12px' }}>
                  Logged <strong>{topHouseData.count}x</strong> | Total Wait: <strong style={{ color: '#FF5500' }}>{formatMinutes(topHouseData.totalWait)}</strong> | Avg Wait: <strong>{topHouseData.avgWait}m</strong>
                </div>
              )}
            </div>

            <div style={{ background: '#0D1726', padding: '12px 15px', borderRadius: '14px', border: '1px solid #1E40AF', borderLeft: '5px solid #3B82F6', marginBottom: '18px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#60A5FA', marginBottom: '3px', letterSpacing: '0.5px' }}>🎢 TOP RIDE</div>
              <div style={{ fontWeight: '800', color: '#F3F4F6', fontSize: '15px' }}>
                {topRideData ? `${ITEM_EMOJIS[topRideData.name] || '🎢'} ${topRideData.name}` : 'None Logged Yet'}
              </div>
              {topRideData && (
                <div style={{ color: '#CBD5E0', marginTop: '3px', fontSize: '12px' }}>
                  Logged <strong>{topRideData.count}x</strong> | Total Wait: <strong style={{ color: '#3B82F6' }}>{formatMinutes(topRideData.totalWait)}</strong> | Avg Wait: <strong>{topRideData.avgWait}m</strong>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#A0AEC0', margin: '0 0 10px 0', letterSpacing: '0.8px' }}>AVERAGES</h3>
            
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

          {/* 🥨 BRANDED DANDIE PRETZEL TRACKER WIDGET */}
          <div style={{
            background: '#000F9F',
            borderRadius: '24px',
            padding: '20px 18px',
            marginBottom: '25px',
            border: '2px solid #FDA30C',
            boxShadow: '0 8px 24px rgba(0, 15, 159, 0.4)',
            textAlign: 'center'
          }}>
            {/* BRAND LOGO */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <img
                src="/auntie-annes.png"
                alt="Auntie Anne's"
                onError={(e: any) => { e.target.style.display = 'none'; }}
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '900', color: '#FDA30C', letterSpacing: '1px', textTransform: 'uppercase' }}>
              DANDIE PRETZEL TRACKER
            </h3>

            {/* TOTAL PRETZELS DISPLAY */}
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '14px', marginBottom: '16px', border: '1px solid rgba(253, 163, 12, 0.4)' }}>
              <div style={{ fontSize: '42px', fontWeight: '900', color: '#FDA30C', lineHeight: '1' }}>
                {regularPretzels + cinnamonPretzels}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#FFF', marginTop: '4px', letterSpacing: '0.8px' }}>
                TOTAL PRETZELS CONSUMED
              </div>
            </div>

            {/* SUB-COUNTERS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* REGULAR PRETZELS */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '12px', border: '2px solid #FDA30C', color: '#000000' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#000F9F', lineHeight: '1.1' }}>
                  {regularPretzels}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#000000', margin: '4px 0 10px 0', letterSpacing: '0.5px' }}>
                  REGULAR
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button
                    onClick={() => updatePretzelCount('regular', -1)}
                    style={{ flex: 1, padding: '6px', background: '#000F9F', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => updatePretzelCount('regular', 1)}
                    style={{ flex: 1, padding: '6px', background: '#FDA30C', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CINNAMON PRETZELS */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '12px', border: '2px solid #FDA30C', color: '#000000' }}>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#000F9F', lineHeight: '1.1' }}>
                  {cinnamonPretzels}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#000000', margin: '4px 0 10px 0', letterSpacing: '0.5px' }}>
                  CINNAMON
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button
                    onClick={() => updatePretzelCount('cinnamon', -1)}
                    style={{ flex: 1, padding: '6px', background: '#000F9F', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => updatePretzelCount('cinnamon', 1)}
                    style={{ flex: 1, padding: '6px', background: '#FDA30C', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB: HISTORY */}
      {mainTab === 'tracker' && trackerSubTab === 'History' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#FF5500', paddingLeft: '5px' }}>
            History ({visits.length})
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
                <div key={v.id} style={{ border: '1px solid #2A2A3C', borderRadius: '20px', padding: '16px', marginBottom: '12px', background: 'rgba(18, 18, 26, 0.85)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ borderBottom: '1px solid #2A2A3C', paddingBottom: '8px', marginBottom: '10px' }}>
                    <strong style={{ color: '#FF5500', fontSize: '16px', fontWeight: '800' }}>
                      📅 {formatDisplayDate(v.visitDate)}
                    </strong>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {v.activities.map((a) => {
                          const isEditingThis = editingActivityId === a.id && editingVisitId === v.id;
                          const actRidersList = parseAttendees(a.riders);

                          return isEditingThis ? (
                            <div key={a.id} style={{ background: '#12121A', border: '1px solid #2A2A3C', padding: '10px', borderRadius: '10px', boxSizing: 'border-box', width: '100%' }}>
                              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#FF5500', marginBottom: '6px' }}>EDIT ENTRY</div>
                              <select value={editRideName} onChange={(e) => setEditRideName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px', marginBottom: '6px', boxSizing: 'border-box' }}>
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
                              
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editWaitTime}
                                  onChange={(e) => setEditWaitTime(e.target.value)}
                                  placeholder="Wait (mins)"
                                  style={{ flex: 1, minWidth: '90px', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px', boxSizing: 'border-box' }}
                                />
                                <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes (optional)" style={{ flex: 1, minWidth: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px', boxSizing: 'border-box' }} />
                              </div>

                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button onClick={() => deleteActivity(a.id)} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Delete</button>
                                <button onClick={cancelEditing} style={{ background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveEditedActivity} style={{ background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#F3F4F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {ITEM_EMOJIS[a.rideName] || '🎟️'} {a.rideName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                                  ⏱️ {a.waitTimeMinutes} mins wait {a.notes ? `(${a.notes})` : ''}
                                </div>
                                {actRidersList.length > 0 && (
                                  <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                                    👥 {actRidersList.join(', ')}
                                  </div>
                                )}
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

      {/* SUBTAB: PARKING */}
      {mainTab === 'tracker' && trackerSubTab === 'Parking' && (
        <div>
          {/* PARKING FORM WIDGET */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '20px', borderRadius: '24px', border: '1px solid #2A2A3C', marginBottom: '20px', backdropFilter: 'blur(8px)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', fontWeight: '900', color: '#FF5500', marginBottom: '14px' }}>
              🚗 Log Your Parking
            </h2>

            {/* WHO'S PARKING */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>
                WHO'S PARKING?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {FIXED_FAMILY_MEMBERS.map((name) => {
                  const isSelected = parkingAttendees.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleParkingAttendee(name)}
                      style={{
                        padding: '10px 2px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #FF5500' : '1px solid #2A2A3C',
                        background: isSelected ? '#FF5500' : '#1A1A26',
                        color: isSelected ? '#FFF' : '#CBD5E0',
                        fontSize: '12px',
                        fontWeight: isSelected ? '800' : '600',
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

            {/* GARAGE SELECTOR */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '8px' }}>
                SELECT GARAGE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {PARKING_GARAGES.map((g) => {
                  const isSelected = parkingGarage === g.name;
                  return (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setParkingGarage(g.name)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '12px',
                        border: isSelected ? `2px solid #FFF` : '1px solid #2A2A3C',
                        background: isSelected ? g.color : '#1A1A26',
                        color: isSelected ? (g.darkText ? '#000000' : '#FFFFFF') : '#CBD5E0',
                        fontSize: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: isSelected ? `0 4px 14px ${g.color}66` : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW NUMBER INPUT */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>
                ROW NUMBER
              </label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 305"
                value={parkingRowNumber}
                onChange={(e) => setParkingRowNumber(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px', fontWeight: 'bold', boxSizing: 'border-box' }}
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              type="button"
              onClick={handleSaveParkingLog}
              disabled={parkingSaving}
              style={{
                width: '100%',
                padding: '14px',
                background: '#FF5500',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 85, 0, 0.4)'
              }}
            >
              {parkingSaving ? 'Saving...' : '💾 Save Parking Spot'}
            </button>
          </div>

          {/* SAVED PARKING SPOTS CARDS */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#A0AEC0', marginBottom: '12px', letterSpacing: '0.8px' }}>
              TODAY'S PARKING SPOTS ({parkingLogs.length})
            </h3>

            {parkingLogs.length === 0 ? (
              <p style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '13px', fontStyle: 'italic', margin: '20px 0' }}>
                No parking spots logged today.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {parkingLogs.map(log => {
                  const garageInfo = PARKING_GARAGES.find(g => g.name === log.garage_name) || PARKING_GARAGES[0];
                  const textColor = garageInfo.darkText ? '#000000' : '#FFFFFF';

                  return (
                    <div
                      key={log.id}
                      style={{
                        background: garageInfo.color,
                        color: textColor,
                        borderRadius: '20px',
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: `0 6px 20px ${garageInfo.color}55`,
                        boxSizing: 'border-box',
                        width: '100%'
                      }}
                    >
                      {/* LOGO */}
                      <img
                        src={garageInfo.file}
                        alt={garageInfo.name}
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                        style={{ width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0 }}
                      />

                      {/* TEXT CONTENT */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '22px', fontWeight: '900', lineHeight: '1.1' }}>
                          Row {log.row_number}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '800', marginTop: '4px', opacity: 0.9 }}>
                          {garageInfo.name} Garage
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '6px', opacity: 0.85 }}>
                          {log.parked_by}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ANALYTICS TAB VIEWS */}
      {mainTab === 'analytics' && (
        <div>
          {/* SHARED ATTENDEE FILTER SELECTOR */}
          <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '12px 14px', borderRadius: '18px', border: '1px solid #2A2A3C', marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0' }}>
                FILTER BY ATTENDEE:
              </label>
              {selectedAttendeeFilter !== 'Everyone' && (
                <button
                  onClick={() => setSelectedAttendeeFilter('Everyone')}
                  style={{ background: 'none', border: 'none', color: '#FF5500', fontSize: '11px', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                >
                  Reset to Everyone ✕
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {FIXED_FAMILY_MEMBERS.map(name => {
                const isSelected = selectedAttendeeFilter === name;
                return (
                  <button
                    key={name}
                    onClick={() => toggleAttendeeFilter(name)}
                    style={{
                      padding: '8px 2px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #FF5500' : '1px solid #2A2A3C',
                      background: isSelected ? '#FF5500' : '#1A1A26',
                      color: isSelected ? '#FFF' : '#CBD5E0',
                      fontSize: '11px',
                      fontWeight: isSelected ? '800' : '600',
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

          {/* SORT FUNCTIONALITY BAR (HOUSES & RIDES ONLY) */}
          {(analyticsSubTab === 'Houses' || analyticsSubTab === 'Rides') && (
            <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '10px 12px', borderRadius: '14px', border: '1px solid #2A2A3C', marginBottom: '16px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', marginBottom: '6px', letterSpacing: '0.5px' }}>
                SORT BY:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {[
                  { key: 'visits', label: 'Visits' },
                  { key: 'avgWait', label: 'Avg Wait' },
                  { key: 'totalWait', label: 'Total Wait' },
                  { key: 'avgExpected', label: 'Posted' },
                  { key: 'diff', label: '+/-' }
                ].map(item => {
                  const isActive = analyticsSortKey === item.key;
                  const arrow = isActive ? (analyticsSortOrder === 'desc' ? ' ▼' : ' ▲') : '';
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleAnalyticsSortClick(item.key as AnalyticsSortKey)}
                      style={{
                        padding: '6px 2px',
                        borderRadius: '8px',
                        border: isActive ? '1px solid #DC2626' : '1px solid #2A2A3C',
                        background: isActive ? '#DC2626' : '#1A1A26',
                        color: isActive ? '#FFF' : '#A0AEC0',
                        fontSize: '10px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.label}{arrow}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* HOUSES ANALYTICS SUBTAB */}
          {analyticsSubTab === 'Houses' && (
            <div>
              {/* HOUSE STATS GRID WITH BANNER IMAGES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {houseAnalyticsStats.map(stat => {
                  const bannerPath = HOUSE_BANNERS[stat.name];

                  return (
                    <div key={stat.name} style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '18px', padding: '14px 16px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
                      
                      {/* HOUSE BANNER IMAGE */}
                      {bannerPath && (
                        <div style={{ margin: '-14px -16px 12px -16px', height: '110px', overflow: 'hidden', borderBottom: '1px solid #2A2A3C' }}>
                          <img
                            src={bannerPath}
                            alt={stat.name}
                            onError={(e: any) => { e.target.parentNode.style.display = 'none'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#FF5500', marginBottom: '10px' }}>
                        {stat.name}
                      </div>

                      {/* HOUSE RATINGS DISPLAY ROW */}
<div style={{ background: '#12121A', padding: '8px 10px', borderRadius: '10px', border: '1px solid #2A2A3C', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  {getHouseAverages(stat.name, allHouseRatings, selectedAttendeeFilter) ? (
    <>
      <div style={{ fontSize: '11px', fontWeight: '800', color: '#FDA30C' }}>⭐ Overall: <span style={{ color: '#FFF' }}>{getHouseAverages(stat.name, allHouseRatings, selectedAttendeeFilter)?.overall}</span></div>
      <div style={{ fontSize: '11px', fontWeight: '800', color: '#EF4444' }}>😱 Scare: <span style={{ color: '#FFF' }}>{getHouseAverages(stat.name, allHouseRatings, selectedAttendeeFilter)?.scare}</span></div>
      <div style={{ fontSize: '11px', fontWeight: '800', color: '#3B82F6' }}>😎 Cool: <span style={{ color: '#FFF' }}>{getHouseAverages(stat.name, allHouseRatings, selectedAttendeeFilter)?.cool}</span></div>
    </>
  ) : (
    <div style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>No ratings logged yet</div>
  )}
</div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>{stat.visits}</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>TOTAL<br />VISITS</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#3B82F6' }}>{stat.avgWait}m</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>AVG<br />WAIT</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#A855F7' }}>{formatMinutes(stat.totalWait)}</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>TOTAL<br />WAIT</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#EAB308' }}>{stat.avgExpected > 0 ? `${stat.avgExpected}m` : '-'}</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>AVG<br />POSTED</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: stat.diff < 0 ? '#22C55E' : stat.diff > 0 ? '#EF4444' : '#FFF' }}>
                            {stat.diff === 0 ? '-' : stat.diff > 0 ? `+${stat.diff}m` : `${stat.diff}m`}
                          </div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>+/-<br />POSTED</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LONGEST INDIVIDUAL WAIT TIMES (HOUSES) */}
              <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#DC2626', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔥 Longest Individual Wait Times
                </h3>

                {longestHouseWaits.length === 0 ? (
                  <p style={{ color: '#A0AEC0', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>No house visits logged yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {longestHouseWaits.map((act, index) => (
                      <div key={act.id + index} style={{ background: '#1C1215', border: '1px solid #7F1D1D', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#DC2626', color: '#FFF', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {index + 1}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ITEM_EMOJIS[act.rideName] || '🏚️'} {act.rideName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              {formatDisplayDate(act.visitDate)} <br />
                              {parseAttendees(act.riders).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div style={{ background: '#991B1B', color: '#FFF', fontWeight: '900', fontSize: '14px', padding: '6px 12px', borderRadius: '12px', flexShrink: 0 }}>
                          {act.waitTimeMinutes}m
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SHORTEST INDIVIDUAL WAIT TIMES (HOUSES) */}
              <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#22C55E', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚡ Shortest Individual Wait Times
                </h3>

                {shortestHouseWaits.length === 0 ? (
                  <p style={{ color: '#A0AEC0', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>No house visits logged yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {shortestHouseWaits.map((act, index) => (
                      <div key={act.id + index} style={{ background: '#0B231A', border: '1px solid #15803D', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#15803D', color: '#FFF', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {index + 1}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ITEM_EMOJIS[act.rideName] || '🏚️'} {act.rideName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              {formatDisplayDate(act.visitDate)} <br />
                              {parseAttendees(act.riders).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div style={{ background: '#15803D', color: '#FFF', fontWeight: '900', fontSize: '14px', padding: '6px 12px', borderRadius: '12px', flexShrink: 0 }}>
                          {act.waitTimeMinutes}m
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RIDES ANALYTICS SUBTAB WITH BANNER IMAGES */}
          {analyticsSubTab === 'Rides' && (
            <div>
              {/* RIDE STATS GRID WITH BANNER IMAGES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {rideAnalyticsStats.map(stat => {
                  const bannerPath = RIDE_BANNERS[stat.name];

                  return (
                    <div key={stat.name} style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '18px', padding: '14px 16px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
                      
                      {/* RIDE BANNER IMAGE */}
                      {bannerPath && (
                        <div style={{ margin: '-14px -16px 12px -16px', height: '110px', overflow: 'hidden', borderBottom: '1px solid #2A2A3C' }}>
                          <img
                            src={bannerPath}
                            alt={stat.name}
                            onError={(e: any) => { e.target.parentNode.style.display = 'none'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#3B82F6', marginBottom: '10px' }}>
                        {stat.name}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>{stat.visits}</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>TOTAL<br />VISITS</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#3B82F6' }}>{stat.avgWait}m</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>AVG<br />WAIT</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#A855F7' }}>{formatMinutes(stat.totalWait)}</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>TOTAL<br />WAIT</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#EAB308' }}>{stat.avgExpected > 0 ? `${stat.avgExpected}m` : '-'}</div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>AVG<br />POSTED</div>
                        </div>
                        <div style={{ background: '#1A1A26', padding: '8px 2px', borderRadius: '10px', border: '1px solid #2A2A3C' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: stat.diff < 0 ? '#22C55E' : stat.diff > 0 ? '#EF4444' : '#FFF' }}>
                            {stat.diff === 0 ? '-' : stat.diff > 0 ? `+${stat.diff}m` : `${stat.diff}m`}
                          </div>
                          <div style={{ fontSize: '8px', fontWeight: '800', color: '#A0AEC0', marginTop: '2px', lineHeight: '1.2' }}>+/-<br />POSTED</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LONGEST INDIVIDUAL WAIT TIMES (RIDES) */}
              <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#3B82F6', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔥 Longest Individual Wait Times
                </h3>

                {longestRideWaits.length === 0 ? (
                  <p style={{ color: '#A0AEC0', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>No ride visits logged yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {longestRideWaits.map((act, index) => (
                      <div key={act.id + index} style={{ background: '#0D1726', border: '1px solid #1E40AF', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {index + 1}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ITEM_EMOJIS[act.rideName] || '🎢'} {act.rideName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              {formatDisplayDate(act.visitDate)} <br />
                              {parseAttendees(act.riders).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div style={{ background: '#1E40AF', color: '#FFF', fontWeight: '900', fontSize: '14px', padding: '6px 12px', borderRadius: '12px', flexShrink: 0 }}>
                          {act.waitTimeMinutes}m
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SHORTEST INDIVIDUAL WAIT TIMES (RIDES) */}
              <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#22C55E', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚡ Shortest Individual Wait Times
                </h3>

                {shortestRideWaits.length === 0 ? (
                  <p style={{ color: '#A0AEC0', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>No ride visits logged yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {shortestRideWaits.map((act, index) => (
                      <div key={act.id + index} style={{ background: '#0B231A', border: '1px solid #15803D', borderRadius: '16px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#15803D', color: '#FFF', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {index + 1}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ITEM_EMOJIS[act.rideName] || '🎢'} {act.rideName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                              {formatDisplayDate(act.visitDate)} <br />
                              {parseAttendees(act.riders).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div style={{ background: '#15803D', color: '#FFF', fontWeight: '900', fontSize: '14px', padding: '6px 12px', borderRadius: '12px', flexShrink: 0 }}>
                          {act.waitTimeMinutes}m
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDEES ANALYTICS SUBTAB */}
          {analyticsSubTab === 'Attendees' && (
            <div>
              {/* CHECKLIST MATRIX FOR HOUSES, RIDES, SHOWS */}
              <div style={{ background: 'rgba(18, 18, 26, 0.85)', borderRadius: '24px', padding: '18px', border: '1px solid #2A2A3C', backdropFilter: 'blur(8px)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#FF5500', margin: '0 0 12px 0' }}>
                  🏚️ HOUSES ({selectedAttendeeFilter})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {attendeeChecklistData.houseList.map(item => (
                    <div key={item.name} style={{ background: '#1A1A26', padding: '10px 14px', borderRadius: '12px', border: '1px solid #2A2A3C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ITEM_EMOJIS[item.name] || '🏚️'} {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                          Avg Wait: <strong>{item.avgWait}m</strong> &nbsp;•&nbsp; Total Wait: <strong>{formatMinutes(item.totalWait)}</strong>
                        </div>
                      </div>
                      <div style={{ background: item.visits > 0 ? '#FF5500' : '#2A2A3C', color: item.visits > 0 ? '#FFF' : '#718096', fontSize: '12px', fontWeight: '900', padding: '6px 12px', borderRadius: '10px', flexShrink: 0 }}>
                        {item.visits} {item.visits === 1 ? 'Visit' : 'Visits'}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#3B82F6', margin: '0 0 12px 0' }}>
                  🎢 RIDES ({selectedAttendeeFilter})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {attendeeChecklistData.rideList.map(item => (
                    <div key={item.name} style={{ background: '#1A1A26', padding: '10px 14px', borderRadius: '12px', border: '1px solid #2A2A3C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ITEM_EMOJIS[item.name] || '🎢'} {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                          Avg Wait: <strong>{item.avgWait}m</strong> &nbsp;•&nbsp; Total Wait: <strong>{formatMinutes(item.totalWait)}</strong>
                        </div>
                      </div>
                      <div style={{ background: item.visits > 0 ? '#3B82F6' : '#2A2A3C', color: item.visits > 0 ? '#FFF' : '#718096', fontSize: '12px', fontWeight: '900', padding: '6px 12px', borderRadius: '10px', flexShrink: 0 }}>
                        {item.visits} {item.visits === 1 ? 'Visit' : 'Visits'}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#10B981', margin: '0 0 12px 0' }}>
                  🎭 SHOWS ({selectedAttendeeFilter})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {attendeeChecklistData.showList.map(item => (
                    <div key={item.name} style={{ background: '#1A1A26', padding: '10px 14px', borderRadius: '12px', border: '1px solid #2A2A3C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ITEM_EMOJIS[item.name] || '🎭'} {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '2px' }}>
                          Avg Wait: <strong>{item.avgWait}m</strong> &nbsp;•&nbsp; Total Wait: <strong>{formatMinutes(item.totalWait)}</strong>
                        </div>
                      </div>
                      <div style={{ background: item.visits > 0 ? '#10B981' : '#2A2A3C', color: item.visits > 0 ? '#FFF' : '#718096', fontSize: '12px', fontWeight: '900', padding: '6px 12px', borderRadius: '10px', flexShrink: 0 }}>
                        {item.visits} {item.visits === 1 ? 'Visit' : 'Visits'}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TRACKER TAB LIVE ATTRACTION EDIT MODAL */}
      {editingLiveActivity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '420px', width: '100%', border: '1px solid #2A2A3C', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>
              ✏️ Edit Logged Attraction
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>ATTRACTION</label>
              <select
                value={editLiveRideName}
                onChange={(e) => setEditLiveRideName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '13px' }}
              >
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
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '6px' }}>WHO PARTICIPATED?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activePartyList.map((member) => {
                  const isChecked = editLiveRiders.includes(member);
                  return (
                    <button
                      key={member}
                      type="button"
                      onClick={() => toggleLiveEditRiderSelection(member)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isChecked ? '2px solid #FF5500' : '1px solid #2A2A3C',
                        background: isChecked ? '#FF5500' : '#1A1A26',
                        color: isChecked ? '#FFF' : '#A0AEC0',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {member}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>POSTED WAIT (MINS)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 45"
                  value={editLivePostedWait}
                  onChange={(e) => setEditLivePostedWait(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>ACTUAL WAIT (MINS)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 30"
                  value={editLiveActualWait}
                  onChange={(e) => setEditLiveActualWait(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setEditingLiveActivity(null)}
                style={{ flex: 1, padding: '10px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLiveActivityEdit}
                style={{ flex: 2, padding: '10px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YUM FULLSCREEN PICTURE MODAL */}
      {previewYumImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <button
              onClick={() => setPreviewYumImage(null)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#FFF', fontSize: '24px', fontWeight: '900', cursor: 'pointer' }}
            >
              ✕ Close
            </button>
            <img
              src={previewYumImage}
              alt="Food Preview"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', borderRadius: '18px', objectFit: 'contain', border: '1px solid #2A2A3C', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }}
            />
          </div>
        </div>
      )}

      {/* SUPABASE TRIVIA LIVE INTERACTIVE MODAL */}
      {showAiTriviaModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '20px', maxWidth: '92vw', width: '460px', border: '2px solid #FF5500', boxShadow: '0 10px 30px rgba(255, 85, 0, 0.3)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>
                😱 Horror Trivia
              </h3>
              <button onClick={() => setShowAiTriviaModal(false)} style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
            </div>

            {/* LEADERBOARD & STREAK BAR */}
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

            {/* CATEGORY & DIFFICULTY SELECTORS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', width: '100%', boxSizing: 'border-box' }}>
              <select
                value={triviaCategory}
                onChange={(e) => handleTriviaFilterChange(e.target.value, undefined)}
                style={{ width: '100%', minWidth: 0, padding: '8px 4px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold', boxSizing: 'border-box' }}
              >
                <option value="All">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={triviaDifficulty}
                onChange={(e) => handleTriviaFilterChange(undefined, e.target.value)}
                style={{ width: '100%', minWidth: 0, padding: '8px 4px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold', boxSizing: 'border-box' }}
              >
                <option value="All">All Difficulties</option>
                {availableDifficulties.map(diff => (
                  <option key={diff} value={diff}>{diff === 'Hard' || diff === 'Fiendishly Hard' ? 'Horror' : diff}</option>
                ))}
              </select>
            </div>

            {/* NEW HIGH SCORE RECORD CLAIM BANNER */}
            {newHighScorePending && (
              <div style={{ background: 'linear-gradient(135deg, #1C130D 0%, #2B1408 100%)', border: '1px solid #FDA30C', padding: '10px 12px', borderRadius: '12px', marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#FDA30C', marginBottom: '6px' }}>
                  🎉 NEW {triviaDifficulty === 'All' ? 'ALL DIFFICULTIES' : triviaDifficulty.toUpperCase()} RECORD: {allTimeHighScore}!
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select
                    value={recordClaimName}
                    onChange={(e) => setRecordClaimName(e.target.value)}
                    style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}
                  >
                    {FIXED_FAMILY_MEMBERS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button
                    onClick={saveNewHighScoreRecord}
                    style={{ padding: '6px 12px', background: '#FDA30C', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* ERROR BANNER */}
            {triviaError && (
              <div style={{ background: '#2C0B0E', border: '1px solid #DC2626', color: '#FCA5A5', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '12px' }}>
                {triviaError}
              </div>
            )}

            {/* QUESTION DISPLAY */}
            {triviaLoading ? (
              <div style={{ textTransform: 'uppercase', textAlign: 'center', padding: '30px 0', color: '#FF9A56', fontSize: '13px', fontWeight: 'bold' }}>
                ⚡ Loading Trivia Deck...
              </div>
            ) : currentQuestion ? (
              <div>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#FFF', marginBottom: '12px', lineHeight: '1.4' }}>
                  {currentQuestion.question}
                </p>

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
                      if (isCorrect) {
                        btnBg = '#0B231A';
                        btnBorder = '#22C55E';
                      } else if (isSelected) {
                        btnBg = '#2C0B0E';
                        btnBorder = '#DC2626';
                      }
                    }

                    return (
                      <button
                        key={item.letter}
                        onClick={() => handleTriviaAnswerSelection(item.letter)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: `1px solid ${btnBorder}`,
                          background: btnBg,
                          color: '#FFF',
                          fontSize: '13px',
                          fontWeight: '700',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ color: '#FF5500', marginRight: '6px' }}>{item.letter}.</span> {item.text}
                      </button>
                    );
                  })}
                </div>

                {/* CORRECTION FEEDBACK BANNER */}
                {selectedOption && (() => {
                  const correctVal = currentQuestion.correct_answer?.trim()?.toUpperCase();
                  const isUserCorrect = selectedOption.toUpperCase() === correctVal || 
                    (correctVal === 'A' && selectedOption === currentQuestion.option_a) ||
                    (correctVal === 'B' && selectedOption === currentQuestion.option_b) ||
                    (correctVal === 'C' && selectedOption === currentQuestion.option_c) ||
                    (correctVal === 'D' && selectedOption === currentQuestion.option_d);

                  let correctText = currentQuestion.correct_answer;
                  if (correctVal === 'A') correctText = `A. ${currentQuestion.option_a}`;
                  if (correctVal === 'B') correctText = `B. ${currentQuestion.option_b}`;
                  if (correctVal === 'C') correctText = `C. ${currentQuestion.option_c}`;
                  if (correctVal === 'D') correctText = `D. ${currentQuestion.option_d}`;

                  return (
                    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3C', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', color: '#CBD5E0', marginBottom: '14px' }}>
                      <strong style={{ color: isUserCorrect ? '#22C55E' : '#EF4444' }}>
                        {isUserCorrect ? '🎉 Correct!' : `❌ Incorrect! The correct answer is: ${correctText}`}
                      </strong>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            <button
              onClick={handleNextTriviaQuestion}
              disabled={triviaLoading || triviaDeck.length === 0}
              style={{ width: '100%', padding: '12px', background: '#FF5500', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              Next Question
            </button>
          </div>
        </div>
      )}

      {/* GAMES LEARN MORE FULLSCREEN MODAL */}
      {activeLearnMoreGame && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '460px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: `2px solid ${activeLearnMoreColor}`, boxShadow: `0 10px 30px ${activeLearnMoreColor}44` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#FFF' }}>{activeLearnMoreGame.name}</h3>
              <button
                onClick={() => setActiveLearnMoreGame(null)}
                style={{ background: 'none', border: 'none', color: '#A0AEC0', fontSize: '20px', fontWeight: '900', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0' }}>👤 Players: {activeLearnMoreGame.players}</span>
              {activeLearnMoreGame.appRequired && (
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#3B82F6' }}>
                  • 📱 App Required
                </span>
              )}
            </div>

            <div style={{ background: '#1A1A26', padding: '14px', borderRadius: '14px', border: '1px solid #2A2A3C', fontSize: '13px', color: '#CBD5E0', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '16px' }}>
              {activeLearnMoreGame.description}
            </div>

            {/* EXTERNAL / APP LINKS IF APPLICABLE */}
            {activeLearnMoreGame.externalLink && (
              <a
                href={activeLearnMoreGame.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '12px', background: activeLearnMoreColor, color: '#FFF', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}
              >
                🎮 Play Game Now ↗
              </a>
            )}

            {activeLearnMoreGame.iosLink && (
              <a
                href={activeLearnMoreGame.iosLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '12px', background: '#3B82F6', color: '#FFF', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}
              >
                📱 Download for iOS (App Store) ↗
              </a>
            )}

            {activeLearnMoreGame.androidLink && (
              <a
                href={activeLearnMoreGame.androidLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '12px', background: '#10B981', color: '#FFF', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}
              >
                🤖 Download for Android (Google Play) ↗
              </a>
            )}

            <button
              onClick={() => setActiveLearnMoreGame(null)}
              style={{ width: '100%', padding: '12px', background: '#2A2A3C', color: '#CBD5E0', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '4px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 👋 STAGGERED CHECK-OUT MODAL */}
      {showCheckoutModal && activeVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#12121A', borderRadius: '24px', padding: '22px', maxWidth: '400px', width: '100%', border: '1px solid #2A2A3C', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#FF5500' }}>
              Leaving Park
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
                    <span>{isSelected ? '🚪 Leaving' : '🎃 Staying'}</span>
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
                ⏰ ARRIVAL TIME (e.g. 6:30 PM)
              </label>
              <input
                type="text"
                placeholder="e.g. 6:30 PM"
                value={editVisitStartTime}
                onChange={(e) => setEditVisitStartTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#CBD5E0', display: 'block', marginBottom: '4px' }}>
                🚪 MAIN DEPARTURE TIME (e.g. 2:00 AM)
              </label>
              <input
                type="text"
                placeholder="e.g. 2:00 AM"
                value={editVisitEndTime}
                onChange={(e) => setEditVisitEndTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
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
                      placeholder={editVisitEndTime || "e.g. 1:30 AM"}
                      value={editVisitMemberEndTimes[member] || ''}
                      onChange={(e) => {
                        setEditVisitMemberEndTimes({
                          ...editVisitMemberEndTimes,
                          [member]: e.target.value
                        });
                      }}
                      style={{ width: '120px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#12121A', color: '#FFF', fontSize: '16px', textAlign: 'center' }}
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

{/* ⭐ RATE A HOUSE FORM MODAL */}
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
