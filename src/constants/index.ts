// ============================================================
// SyncUs - App Constants
// ============================================================

import { Category } from '../types';

// --- Room Configuration ---
export const ROOM_CODE_LENGTH = 5;
export const ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const MAX_ROOM_USERS = 2;
export const ROOM_CODE_MAX_RETRIES = 5;

// --- Quiz Configuration ---
export const QUESTIONS_PER_QUIZ = 10;
export const ANSWER_BATCH_SIZE = 5;

// --- Categories ---
export const CATEGORIES: Category[] = [
  {
    id: 'love_emotions',
    name: 'Love & Emotions',
    icon: '💕',
    description: 'Explore your emotional connection and love language',
    color: '#E879A8',
    gradient: ['#E879A8', '#D946A8'],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: '🏡',
    description: 'How you live, eat, and spend your daily life',
    color: '#67E8F9',
    gradient: ['#67E8F9', '#22D3EE'],
  },
  {
    id: 'fun_random',
    name: 'Fun & Random',
    icon: '🎲',
    description: 'Quirky and unexpected questions to surprise each other',
    color: '#A78BFA',
    gradient: ['#A78BFA', '#7C5CFC'],
  },
  {
    id: 'future_goals',
    name: 'Future Goals',
    icon: '🚀',
    description: 'Where you see yourselves in the future together',
    color: '#6EE7B7',
    gradient: ['#6EE7B7', '#34D399'],
  },
  {
    id: 'travel',
    name: 'Travel & Adventure',
    icon: '✈️',
    description: 'Dream destinations and adventure preferences',
    color: '#FDBA74',
    gradient: ['#FDBA74', '#FB923C'],
  },
  {
    id: 'communication',
    name: 'Communication Style',
    icon: '💬',
    description: 'How you handle conflicts and express yourself',
    color: '#F9A8D4',
    gradient: ['#F9A8D4', '#F472B6'],
  },
];

// --- Firestore Collection Names ---
export const Collections = {
  USERS: 'users',
  ROOMS: 'rooms',
  ROOM_STATES: 'roomStates',
  QUESTIONS: 'questions',
  ANSWERS: 'answers',
  RESULTS: 'results',
} as const;

// --- AsyncStorage Keys ---
export const StorageKeys = {
  USER_ID: '@syncus_user_id',
  USER_EMAIL: '@syncus_user_email',
  ONBOARDED: '@syncus_onboarded',
  LAST_ROOM: '@syncus_last_room',
} as const;

// --- Animation Durations (ms) ---
export const AnimationDurations = {
  fast: 200,
  normal: 300,
  slow: 500,
  reveal: 1500,
} as const;

// --- Sample Questions (shipped with app for offline / seed) ---
export const SAMPLE_QUESTIONS = [
  // Love & Emotions
  {
    id: 'le_1',
    categoryId: 'love_emotions',
    text: "What's our ideal weekend getaway?",
    options: [
      'A secluded cabin in the woods',
      'Exploring a vibrant new city',
      'A beach resort with cocktails',
      'A quiet stay in a charming village',
    ],
    order: 1,
  },
  {
    id: 'le_2',
    categoryId: 'love_emotions',
    text: 'How do you prefer to show affection?',
    options: [
      'Words of affirmation',
      'Physical touch',
      'Quality time together',
      'Giving thoughtful gifts',
    ],
    order: 2,
  },
  {
    id: 'le_3',
    categoryId: 'love_emotions',
    text: "What's the most important thing in a relationship?",
    options: ['Trust', 'Communication', 'Humor', 'Shared values'],
    order: 3,
  },
  {
    id: 'le_4',
    categoryId: 'love_emotions',
    text: 'Ideal Friday night together?',
    options: [
      'Cooking dinner at home',
      'Going out for fine dining',
      'Movie marathon on the couch',
      'Dancing at a club',
    ],
    order: 4,
  },
  {
    id: 'le_5',
    categoryId: 'love_emotions',
    text: "What's the best way to resolve an argument?",
    options: [
      'Talk it out immediately',
      'Take space, then discuss',
      'Write a letter or text',
      'A warm hug first',
    ],
    order: 5,
  },
  {
    id: 'le_6',
    categoryId: 'love_emotions',
    text: 'How do you recharge after a long day?',
    options: [
      'Cuddling together',
      'Having alone time',
      'Going for a walk together',
      'Watching something funny',
    ],
    order: 6,
  },
  {
    id: 'le_7',
    categoryId: 'love_emotions',
    text: 'What is your love language?',
    options: [
      'Words of affirmation',
      'Acts of service',
      'Receiving gifts',
      'Quality time',
    ],
    order: 7,
  },
  {
    id: 'le_8',
    categoryId: 'love_emotions',
    text: 'What makes you feel most loved?',
    options: [
      'Surprise date nights',
      'Being listened to deeply',
      'Receiving handwritten notes',
      'Spontaneous adventures',
    ],
    order: 8,
  },
  {
    id: 'le_9',
    categoryId: 'love_emotions',
    text: 'How do you handle jealousy?',
    options: [
      'Open conversation',
      'Keep it to myself',
      'Show more affection',
      'Try to understand the root cause',
    ],
    order: 9,
  },
  {
    id: 'le_10',
    categoryId: 'love_emotions',
    text: 'Dream anniversary celebration?',
    options: [
      'A trip abroad',
      'A quiet dinner at our favorite spot',
      'A surprise party with friends',
      'Renewing our vows',
    ],
    order: 10,
  },

  // Lifestyle
  {
    id: 'ls_1',
    categoryId: 'lifestyle',
    text: 'Coffee or Tea first thing in the morning?',
    options: ['Coffee, always!', 'Tea, please', 'Neither — water', 'Matcha latte'],
    order: 1,
  },
  {
    id: 'ls_2',
    categoryId: 'lifestyle',
    text: 'Cooking together or ordering in?',
    options: [
      'Cooking a new recipe',
      'Ordering our favorites',
      'Cooking basics, ordering fancy',
      'Meal prep for the week',
    ],
    order: 2,
  },
  {
    id: 'ls_3',
    categoryId: 'lifestyle',
    text: 'Early bird or night owl?',
    options: [
      'Early bird — love sunrises',
      'Night owl all the way',
      'Depends on the day',
      'Neither — I like naps',
    ],
    order: 3,
  },
  {
    id: 'ls_4',
    categoryId: 'lifestyle',
    text: 'Ideal pet?',
    options: ['Dog', 'Cat', 'No pets', 'Something exotic'],
    order: 4,
  },
  {
    id: 'ls_5',
    categoryId: 'lifestyle',
    text: 'How do you spend a lazy Sunday?',
    options: [
      'Brunch and shopping',
      'Netflix and chill',
      'Outdoor activities',
      'Reading and relaxing',
    ],
    order: 5,
  },
  {
    id: 'ls_6',
    categoryId: 'lifestyle',
    text: 'Gym or outdoor exercise?',
    options: ['Gym workouts', 'Running outdoors', 'Yoga at home', 'Team sports'],
    order: 6,
  },
  {
    id: 'ls_7',
    categoryId: 'lifestyle',
    text: 'Favorite way to unwind?',
    options: [
      'Music and candles',
      'Gaming or social media',
      'A hot bath',
      'Journaling or meditating',
    ],
    order: 7,
  },
  {
    id: 'ls_8',
    categoryId: 'lifestyle',
    text: 'Minimalist or maximalist home decor?',
    options: [
      'Clean minimalism',
      'Cozy maximalism',
      'A bohemian mix',
      'Modern and techy',
    ],
    order: 8,
  },
  {
    id: 'ls_9',
    categoryId: 'lifestyle',
    text: 'Preferred social setting?',
    options: [
      'Small intimate gatherings',
      'Big lively parties',
      'Just us two',
      'Double dates',
    ],
    order: 9,
  },
  {
    id: 'ls_10',
    categoryId: 'lifestyle',
    text: 'How organized are you?',
    options: [
      'Everything has its place',
      'Organized chaos',
      'I try but fail',
      "What's organization?",
    ],
    order: 10,
  },

  // Fun & Random
  {
    id: 'fr_1',
    categoryId: 'fun_random',
    text: 'If we were a movie genre, we would be…',
    options: ['Romantic comedy', 'Action adventure', 'Sci-fi thriller', 'Documentary'],
    order: 1,
  },
  {
    id: 'fr_2',
    categoryId: 'fun_random',
    text: 'Zombie apocalypse: what do we grab first?',
    options: ['Food supplies', 'Weapons', 'Each other', 'Our phones'],
    order: 2,
  },
  {
    id: 'fr_3',
    categoryId: 'fun_random',
    text: "Superpower you'd want?",
    options: ['Teleportation', 'Mind reading', 'Time travel', 'Invisibility'],
    order: 3,
  },
  {
    id: 'fr_4',
    categoryId: 'fun_random',
    text: 'If we could live in any era?',
    options: ['The roaring 1920s', 'Medieval times', 'The far future', 'The groovy 70s'],
    order: 4,
  },
  {
    id: 'fr_5',
    categoryId: 'fun_random',
    text: 'Desert island: one item each?',
    options: ['A guitar', 'A survival kit', 'A good book', 'A hammock'],
    order: 5,
  },
  {
    id: 'fr_6',
    categoryId: 'fun_random',
    text: 'Aliens land on Earth. What do we do?',
    options: ['Try to communicate', 'Run and hide', 'Invite them over', 'Blog about it'],
    order: 6,
  },
  {
    id: 'fr_7',
    categoryId: 'fun_random',
    text: 'Which reality show would we win?',
    options: ['The Amazing Race', 'MasterChef', 'Love Island', 'Survivor'],
    order: 7,
  },
  {
    id: 'fr_8',
    categoryId: 'fun_random',
    text: 'Our couple song genre?',
    options: ['Pop anthem', 'Soulful R&B', 'Classic rock', 'Lo-fi chill'],
    order: 8,
  },
  {
    id: 'fr_9',
    categoryId: 'fun_random',
    text: 'Who would play us in a movie?',
    options: [
      'Ryan & Scarlett',
      'Timothée & Zendaya',
      'Ranveer & Deepika',
      'We\'d play ourselves',
    ],
    order: 9,
  },
  {
    id: 'fr_10',
    categoryId: 'fun_random',
    text: 'Biggest guilty pleasure?',
    options: [
      'Reality TV binge',
      'Midnight snacking',
      'Online shopping sprees',
      'Singing in the shower',
    ],
    order: 10,
  },

  // Future Goals
  {
    id: 'fg_1',
    categoryId: 'future_goals',
    text: 'Dream travel destination?',
    options: ['Tokyo, Japan', 'Santorini, Greece', 'New York City', 'Iceland'],
    order: 1,
  },
  {
    id: 'fg_2',
    categoryId: 'future_goals',
    text: 'Where do you see us in 5 years?',
    options: [
      'Settled in a new city',
      'Traveling the world',
      'Building a business together',
      'Starting a family',
    ],
    order: 2,
  },
  {
    id: 'fg_3',
    categoryId: 'future_goals',
    text: 'Dream home style?',
    options: [
      'Modern penthouse',
      'Cozy suburban house',
      'Countryside farmhouse',
      'Beachside villa',
    ],
    order: 3,
  },
  {
    id: 'fg_4',
    categoryId: 'future_goals',
    text: 'Financial priority?',
    options: [
      'Saving for travel',
      'Investing early',
      'Experiences over things',
      'Building a safety net',
    ],
    order: 4,
  },
  {
    id: 'fg_5',
    categoryId: 'future_goals',
    text: 'Do we want a big wedding or small?',
    options: [
      'Grand celebration',
      'Intimate ceremony',
      'Elope and party later',
      'Destination wedding',
    ],
    order: 5,
  },
  {
    id: 'fg_6',
    categoryId: 'future_goals',
    text: 'Career vs. Work-life balance?',
    options: [
      'Hustle mode always',
      'Balance is everything',
      'Depends on the phase',
      'Retire early',
    ],
    order: 6,
  },
  {
    id: 'fg_7',
    categoryId: 'future_goals',
    text: 'Kids?',
    options: ['Yes, definitely', 'Maybe someday', 'Prefer fur babies', 'Not for us'],
    order: 7,
  },
  {
    id: 'fg_8',
    categoryId: 'future_goals',
    text: 'Bucket list activity together?',
    options: [
      'Skydiving',
      'Learning a new language',
      'Running a marathon',
      'Writing a book',
    ],
    order: 8,
  },
  {
    id: 'fg_9',
    categoryId: 'future_goals',
    text: 'How do you see retirement?',
    options: [
      'Traveling non-stop',
      'A quiet life by the lake',
      'Always working on passion projects',
      'Moving abroad',
    ],
    order: 9,
  },
  {
    id: 'fg_10',
    categoryId: 'future_goals',
    text: 'Legacy you want to leave?',
    options: [
      'A loving family',
      'A successful business',
      'Creative works',
      'Community impact',
    ],
    order: 10,
  },
];
