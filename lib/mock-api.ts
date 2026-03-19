
// Mock API service using localStorage to simulate Firestore and Firebase Auth
const STORAGE_KEY = 'mental_app_data';

export interface Lesson {
  id: string;
  title: string;
  slides: string[];
  exercise: string;
  options: string[];
}

export interface UserProfile {
  challenge: string;
  role: string;
  goal: string;
}

export interface FocusSession {
  duration: number;
  date: string;
}

export interface DailyCheckin {
  rating: number;
  date: string;
}

export interface UserStats {
  lessonsCompleted: number;
  focusSessionsCompleted: number;
  currentStreak: number;
  points: number;
  checkins: DailyCheckin[];
}

interface UserRecord {
  id: string;
  email: string;
  password?: string;
  createdAt: string;
}

interface AppData {
  users: Record<string, UserRecord>;
  lessons: Lesson[];
  completedLessons: Record<string, string[]>;
  focusSessions: Record<string, FocusSession[]>;
  dailyCheckins: Record<string, DailyCheckin[]>;
  userProfiles?: Record<string, UserProfile>;
  exercises?: Record<string, Record<string, string>>;
  userPoints?: Record<string, number>;
}

const initialData: AppData = {
  users: {},
  lessons: [
    {
      id: 'lesson-1',
      title: 'The Science of the ADHD Brain',
      slides: [
        'ADHD is not a lack of willpower; it is a chemical imbalance in the brain\'s reward system.',
        'Research shows that ADHD brains often have lower levels of dopamine, the "motivation molecule."',
        'Because of this, your brain naturally seeks out high-stimulation tasks that provide immediate rewards.',
        'This is why scrolling social media feels effortless, while starting a complex report feels physically painful.',
        'Understanding this biological reality is the first step toward self-compassion and effective management.'
      ],
      exercise: 'Which neurotransmitter is primarily linked to the ADHD reward system?',
      options: ['Serotonin', 'Dopamine', 'Melatonin', 'Adrenaline'],
    },
    {
      id: 'lesson-2',
      title: 'Cracking the Procrastination Loop',
      slides: [
        'Procrastination is often misunderstood as laziness. In reality, it is emotional dysregulation.',
        'When you look at a big task, your amygdala (the brain\'s alarm) senses a threat—fear of failure or overwhelm.',
        'To escape this discomfort, your brain "chooses" a distraction to get an instant dopamine hit.',
        'This creates a loop: avoid task → feel guilt → task gets harder → avoid task again.',
        'The key is to lower the "threat level" of the task until your brain no longer feels the need to run.'
      ],
      exercise: 'What part of the brain is responsible for high-speed "threat" detection and avoidant behavior?',
      options: ['Prefrontal Cortex', 'Amygdala', 'Hippocampus', 'Cerebellum'],
    },
    {
      id: 'lesson-3',
      title: 'Designing Your Environment',
      slides: [
        'Your environment acts as an "external executive function." If it\'s cluttered, your mind will be too.',
        'Visual cues are powerful. If your phone is visible, your brain is already calculating the dopamine of a notification.',
        'Science-backed strategy: "Out of sight, out of mind." Put your phone in a drawer or another room.',
        'Similarly, keep your tools (planners, water, work) visible to prime your brain for the task.',
        'Small environmental tweaks can reduce the "friction" of starting a task by up to 50%.'
      ],
      exercise: 'What is a "science-backed" way to reduce phone distractions while working?',
      options: ['Turn it face down', 'Put it in another room', 'Check it every 15 minutes', 'Buy a newer phone'],
    },
    {
      id: 'lesson-4',
      title: 'The Power of "Stupid Easy" Steps',
      slides: [
        'For an ADHD brain, the mountain is always too high. We need to turn it into a molehill.',
        'The harder a task is to start, the more dopamine you need. We can hack this by lowering the bar.',
        'A "Stupid Easy" step is one you can do in under 30 seconds with zero resistance.',
        'Instead of "Write a newsletter," your step is "Open a blank Google Doc."',
        'Once you start, your brain enters a flow state, making the next step significantly easier to handle.'
      ],
      exercise: 'What is the primary goal of making a step "Stupid Easy"?',
      options: ['To finish the whole project instantly', 'To bypass the brain\'s initial resistance', 'To make the project more complex', 'To impress others with your speed'],
    },
  ],
  completedLessons: {},
  focusSessions: {},
  dailyCheckins: {},
};

const getDB = (): AppData => {
  if (typeof window === 'undefined') return initialData;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return initialData;
  
  try {
    const db = JSON.parse(data) as AppData;
    
    // Simple migration: if lessons are missing slides, update them
    const needsMigration = db.lessons.some(l => !l.slides);
    if (needsMigration) {
      db.lessons = initialData.lessons;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
    
    return db;
  } catch (e) {
    console.error('Failed to parse mock DB', e);
    return initialData;
  }
};

const saveDB = (data: AppData) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const mockAuth = {
  signup: async (email: string, password: string) => {
    const db = getDB();
    if (db.users[email]) throw new Error('User already exists');
    const newUser = { email, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    db.users[email] = { ...newUser, password };
    saveDB(db);
    return newUser;
  },
  login: async (email: string, password: string) => {
    const db = getDB();
    let user = db.users[email];
    if (!user) {
      const newUser = { email, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
      db.users[email] = { ...newUser, password };
      saveDB(db);
      user = db.users[email];
    }
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  },
};

export const mockDB = {
  getLessons: async (): Promise<Lesson[]> => {
    const db = getDB();
    return db.lessons;
  },
  getLesson: async (id: string): Promise<Lesson | undefined> => {
    const db = getDB();
    return db.lessons.find((l) => l.id === id);
  },
  completeLesson: async (userId: string, lessonId: string, exerciseResponse: string) => {
    const db = getDB();
    if (!db.completedLessons[userId]) db.completedLessons[userId] = [];
    
    const alreadyCompleted = db.completedLessons[userId].includes(lessonId);
    
    if (!alreadyCompleted) {
      db.completedLessons[userId].push(lessonId);
      
      // Award points for first time completion
      if (!db.userPoints) db.userPoints = {};
      db.userPoints[userId] = (db.userPoints[userId] || 0) + 50; // 50 points per lesson
    }
    
    // Also track the exercise response
    if (!db.exercises) db.exercises = {};
    if (!db.exercises[userId]) db.exercises[userId] = {};
    db.exercises[userId][lessonId] = exerciseResponse;
    
    saveDB(db);
  },
  saveFocusSession: async (userId: string, duration: number, date = new Date().toISOString()) => {
    const db = getDB();
    if (!db.focusSessions[userId]) db.focusSessions[userId] = [];
    db.focusSessions[userId].push({ duration, date });
    
    // Award points for focus session
    if (!db.userPoints) db.userPoints = {};
    db.userPoints[userId] = (db.userPoints[userId] || 0) + 10; // 10 points per focus session
    
    saveDB(db);
  },
  saveDailyCheckin: async (userId: string, rating: number, date = new Date().toISOString()) => {
    const db = getDB();
    if (!db.dailyCheckins[userId]) db.dailyCheckins[userId] = [];
    db.dailyCheckins[userId].push({ rating, date });
    
    // Award points for daily checkin
    if (!db.userPoints) db.userPoints = {};
    db.userPoints[userId] = (db.userPoints[userId] || 0) + 5; // 5 points per checkin
    
    saveDB(db);
  },
  getUserStats: async (userId: string): Promise<UserStats> => {
    const db = getDB();
    const completed = db.completedLessons[userId] || [];
    const sessions = db.focusSessions[userId] || [];
    const checkins = db.dailyCheckins[userId] || [];
    const points = (db.userPoints && db.userPoints[userId]) || 0;
    
    // Simple streak calculation (mock)
    const streak = checkins.length > 0 ? checkins.length : 0; 
    
    return {
      lessonsCompleted: completed.length,
      focusSessionsCompleted: sessions.length,
      currentStreak: streak,
      points,
      checkins: checkins,
    };
  },
  saveOnboarding: async (userId: string, answers: UserProfile) => {
    const db = getDB();
    if (!db.userProfiles) db.userProfiles = {};
    db.userProfiles[userId] = answers;
    saveDB(db);
  },
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const db = getDB();
    return (db.userProfiles && db.userProfiles[userId]) || null;
  }
};
