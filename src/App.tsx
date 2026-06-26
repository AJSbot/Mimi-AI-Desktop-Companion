/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smile, 
  Settings as SettingsIcon, 
  MessageSquare, 
  Timer, 
  X, 
  Send, 
  Zap, 
  Heart, 
  Layout, 
  Trophy, 
  Sparkles, 
  Moon, 
  Sun,
  Eye,
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  LogOut, 
  Plus, 
  Maximize2, 
  Minimize2, 
  Play, 
  Lock,
  ShieldCheck,
  Coffee,
  Clock,
  Book,
  Instagram,
  Music,
  BarChart2,
  TrendingUp,
  History,
  ChevronLeft
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCompanionResponse, detectEmotion } from './lib/gemini';
import { Message, CompanionState, CompanionConfig, PomodoroState, Character, AppState, TodoItem, Expression, CalendarEvent } from './types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from './lib/firebase';

import { MiniGames } from './components/MiniGames.tsx';
import { TodoList, CalendarModule, SocialBreak, CelebrationPopup } from './components/DashboardModules.tsx';
import { DiaryModule } from './components/DiaryModule.tsx';
import { ChatHistoryModule } from './components/ChatHistoryModule.tsx';
import { DiaryEntry, FocusHistoryItem, ChatHistoryItem } from './types';

const CHARACTERS: Character[] = [
  { 
    id: 'buddy', 
    name: 'Pixel Clefairy', 
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/35.png', 
    color: '#D1FAE5', // Mint Green
    baseHue: 150, 
    personality: 'Loyal & Sweet' 
  },
  { 
    id: 'pikachu', 
    name: 'Pixel Pika', 
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/25.png', 
    color: '#DBEAFE', // Sky Blue
    baseHue: 210, 
    personality: 'Energetic & Brave' 
  },
  { 
    id: 'togepi', 
    name: 'Pixel Togepi', 
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/175.png', 
    color: '#FEE2E2', // Soft Red
    baseHue: 0, 
    personality: 'Cheery & Kind' 
  },
  { 
    id: 'mew', 
    name: 'Pixel Mew', 
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/151.png', 
    color: '#E0E7FF', // Indigo Aura
    baseHue: 240, 
    personality: 'Legendary Status' 
  },
  { 
    id: 'bulbasaur', 
    name: 'Pixel Bulba', 
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/1.png', 
    color: '#DCFCE7', 
    baseHue: 140, 
    personality: 'Steady & Strong' 
  }
];

const CRAZY_FACTS = [
  "Did you know that octopuses have three hearts? One for the body and two for the gills! 🐙",
  "A day on Venus is longer than a year on Venus. It rotates so slowly! 🪐",
  "Bananas are technically berries, but strawberries aren't. Nature is weird! 🍌",
  "Wombat poop is cube-shaped so it doesn't roll away. Smart, right? 💩",
  "The shortest war in history lasted only 38 to 45 minutes between Britain and Zanzibar. ⏱️",
  "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs! 🍯",
  "Cows have best friends and get stressed when they are separated. 🐄",
  "A group of flamingos is called a 'flamboyance'. How fitting! 🦩",
  "Sloths can hold their breath longer than dolphins can! 🦥",
  "The heart of a shrimp is located in its head. Talk about a headache! 🦐",
  "A snail can sleep for three years! 🐌",
  "Dolphins have names for each other. They communicate with unique whistles! 🐬",
  "Butterflies taste with their feet. 🦋",
  "A jellyfish is 95% water. 🌊",
  "Polar bear skin is actually black, and their fur is transparent! 🐻‍❄️"
];

const ONBOARDING_SLIDES = [
  {
    title: "Meet Your New Desktop Buddy",
    description: "A cute AI friend that lives on your screen to keep you company and brighten your day.",
    icon: <Smile className="w-12 h-12 theme-text" />,
    color: "bg-pink-50"
  },
  {
    title: "Stay Focused Together",
    description: "Use the built-in Pomodoro timer to manage your work sessions. Your buddy will encourage you!",
    icon: <Timer className="w-12 h-12 text-blue-500" />,
    color: "bg-blue-50"
  },
  {
    title: "Mini Games & Relaxation",
    description: "Take quick mental resets with fun mini-games during your breaks. Collect hearts and scores!",
    icon: <Layout className="w-12 h-12 text-purple-500" />,
    color: "bg-purple-50"
  },
  {
    title: "Smart Conversations",
    description: "Chat about anything! Powered by AI, your buddy remembers your personality preference.",
    icon: <MessageSquare className="w-12 h-12 text-emerald-500" />,
    color: "bg-emerald-50"
  }
];

const PASTEL_PALETTE = [
  { name: 'Original', hue: 0, color: '#fb7185' },
  { name: 'Red', hue: 350, color: '#ef4444' },
  { name: 'Orange', hue: 25, color: '#f97316' },
  { name: 'Peach', hue: 15, color: '#fb923c' },
  { name: 'Golden', hue: 50, color: '#facc15' },
  { name: 'Green', hue: 120, color: '#22c55e' },
  { name: 'Mint', hue: 150, color: '#34d399' },
  { name: 'Teal', hue: 170, color: '#14b8a6' },
  { name: 'Cyber', hue: 190, color: '#06b6d4' },
  { name: 'Sky', hue: 210, color: '#0ea5e9' },
  { name: 'Blue', hue: 230, color: '#3b82f6' },
  { name: 'Lavender', hue: 270, color: '#8b5cf6' },
  { name: 'Pink', hue: 320, color: '#ec4899' },
  { name: 'Rose', hue: 340, color: '#f43f5e' },
  { name: 'Grey', hue: 0, color: '#64748b' },
];

// Productivity Statistics Component
const FocusStats = ({ history, themeColor }: { history: any[], themeColor: string }) => {
  const [view, setView] = useState<'day' | 'week'>('day');

  const data = useMemo(() => {
    // Generate last 7 days of focus data
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return days.map(date => {
      const daySessions = history.filter(h => 
        new Date(h.timestamp).toISOString().split('T')[0] === date
      );
      const total = daySessions.reduce((sum, h) => sum + h.duration, 0);
      return {
        name: new Date(date).toLocaleDateString([], { weekday: 'short' }),
        minutes: total,
        count: daySessions.length,
        fullDate: date
      };
    });
  }, [history]);

  const totalMinutes = useMemo(() => history.reduce((sum, h) => sum + h.duration, 0), [history]);

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-emerald-400" /> Focus Stats
        </h4>
        <div className="flex bg-slate-100/50 rounded-lg p-0.5 border border-slate-200">
           <button 
             onClick={() => setView('day')}
             className={`px-3 py-1 text-[8px] font-black uppercase rounded-md transition-all ${view === 'day' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400'}`}
           >
             7D
           </button>
           <button 
             onClick={() => setView('week')}
             className={`px-3 py-1 text-[8px] font-black uppercase rounded-md transition-all ${view === 'week' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400'}`}
           >
             30D
           </button>
        </div>
      </div>

      <div className="flex-1 min-h-[140px] mt-2 group">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-800 text-white p-2 rounded-xl shadow-xl border border-slate-700 text-[10px]">
                      <p className="font-black mb-1">{payload[0].payload.name} • {payload[0].payload.fullDate}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
                        <span>{payload[0].value} mins focus</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="minutes">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.minutes > 0 ? themeColor : '#f1f5f9'} 
                  radius={[4, 4, 4, 4]}
                />
              ))}
            </Bar>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-auto pt-2 border-t border-slate-50">
         <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Total Energy Used</span>
            <span className="text-sm font-display font-black text-slate-800">
               {totalMinutes}m
            </span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Sessions Finished</span>
            <span className="text-sm font-display font-black text-slate-800">
               {history.length}
            </span>
         </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>('landing');
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [state, setState] = useState<CompanionState>('idle');
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [config, setConfig] = useState<CompanionConfig>({
    name: "Mimi",
    size: 160,
    speed: 1,
    theme: '#fb7185',
    character: CHARACTERS[0],
    notificationsEnabled: true,
    pomodoroEnabled: true,
    themeMode: 'light',
    highContrast: false,
    isPetVisible: true
  });
  
  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (config.themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (config.theme) {
      root.style.setProperty('--accent-primary', config.theme);
    }
  }, [config.themeMode, config.highContrast, config.theme]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm your companion. I'm so happy to be here with you! ✨", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'customization' | 'timer'>('customization');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    isActive: false,
    timeLeft: 25 * 60,
    mode: 'work',
    sessionsCompleted: 0,
    workDuration: 25,
    breakDuration: 5,
    breakHistory: [],
    focusHistory: [
      { id: 'm1', timestamp: Date.now() - 86400000 * 3, duration: 45 },
      { id: 'm2', timestamp: Date.now() - 86400000 * 2, duration: 120 },
      { id: 'm3', timestamp: Date.now() - 86400000 * 1, duration: 90 },
      { id: 'm4', timestamp: Date.now(), duration: 25 },
    ]
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showGames, setShowGames] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [wins, setWins] = useState(() => Number(localStorage.getItem('pet-wins')) || 0);
  const [level, setLevel] = useState(() => Number(localStorage.getItem('pet-level')) || 1);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('pet-diary-entries');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(() => {
    const saved = localStorage.getItem('pet-chat-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [diaryPin, setDiaryPin] = useState(() => localStorage.getItem('pet-diary-pin'));
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isResetReady, setIsResetReady] = useState(false);
  const xpToNextLevel = level * 1000;

  useEffect(() => {
    localStorage.setItem('pet-diary-entries', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('pet-chat-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Archive current session chats into history on app initialization if they exist
  useEffect(() => {
    if (messages.length > 3) { // Only archive if there's significant conversation
       const lastArchive = localStorage.getItem('pet-last-archive');
       const today = new Date().toLocaleDateString();
       
       if (lastArchive !== today) {
          const newHistoryItem: ChatHistoryItem = {
             id: Date.now().toString(),
             timestamp: Date.now(),
             messages: [...messages]
          };
          setChatHistory(prev => [...prev, newHistoryItem]);
          localStorage.setItem('pet-last-archive', today);
       }
    }
  }, []);

  const handleSaveDiaryEntry = (content: string, mood: string, dateStr?: string) => {
    const entryDate = dateStr ? new Date(dateStr) : new Date();
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: entryDate.toISOString(),
      content,
      mood,
      timestamp: entryDate.getTime()
    };
    setDiaryEntries(prev => [...prev, newEntry]);
    setWins(w => w + 30); // 30 wins for reflecting!
  };

  const handleDeleteDiaryEntry = (id: string) => {
    setDiaryEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteChatHistory = (id: string) => {
    setChatHistory(prev => prev.filter(h => h.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('pet-wins', wins.toString());
    if (wins >= xpToNextLevel) {
      setLevel(l => l + 1);
      setShowCelebration(true);
    }
  }, [wins, level, xpToNextLevel]);

  useEffect(() => {
    localStorage.setItem('pet-level', level.toString());
  }, [level]);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Check for existing companion
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.companion) {
            const char = CHARACTERS.find(c => c.id === data.companion.characterId) || CHARACTERS[0];
            setConfig({
              ...config,
              name: data.companion.name || char.name,
              size: data.companion.size || 160,
              character: char,
              theme: char.color
            });
            setAppState('desktop');
          } else {
            setAppState('setup');
          }
        } else {
          setAppState('setup');
        }
      } else {
        setUser(null);
        // Don't override desktop if we're in guest mode
        if (appState !== 'desktop') {
          setAppState('landing');
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      // Fallback for demo if popup is blocked
      setAppState('onboarding');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAppState('landing');
      localStorage.removeItem('companion_config');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSkipLogin = () => {
    setAppState('onboarding');
  };

  const handleAddTodo = (text: string) => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now()
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => {
      const todo = prev.find(t => t.id === id);
      const isChecking = !todo?.completed;
      const next = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      
      if (isChecking) {
        setWins(w => w + 50);
        // Create floating XP effect
        const effect = document.createElement('div');
        effect.className = 'fixed pointer-events-none text-emerald-500 font-black text-xl z-[200] animate-bounce';
        effect.style.left = `${Math.random() * 80 + 10}%`;
        effect.style.top = '50%';
        effect.innerText = '+50 WINS! ✨';
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 2000);
      }

      // Trigger celebration if this check completes the last task
      if (isChecking && next.length > 0 && next.every(t => t.completed)) {
        setTimeout(() => setShowCelebration(true), 300);
      }
      return next;
    });
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const saveCompanion = async (setupName: string, setupChar: Character) => {
    const companionData = {
      name: setupName,
      characterId: setupChar.id,
      size: 160,
      level: 1,
      experience: 0,
    };

    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        companion: companionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    setConfig({ 
      ...config, 
      name: setupName, 
      character: setupChar, 
    });
    setAppState('desktop');
  };

  // Skip login behavior: check local storage if no user
  useEffect(() => {
    if (!loading && !user && appState === 'landing') {
      const saved = localStorage.getItem('companion_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setAppState('desktop');
      }
    }
  }, [loading, user, appState]);

  // Persist local config for "skipped" users
  useEffect(() => {
    if (appState === 'desktop' && !user) {
      localStorage.setItem('companion_config', JSON.stringify(config));
    }
  }, [config, appState, user]);

  // Mouse tracking for "looking"
  const snapToEdge = (x: number, y: number, size: number) => {
    const margin = 20;
    const padding = 60; // Extra padding for UI elements at bottom/top
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    const distLeft = x;
    const distRight = w - x - size;
    const distTop = y;
    const distBottom = h - y - size;
    
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);
    
    if (minDist === distLeft) return { x: margin, y: Math.max(margin, Math.min(h - size - margin, y)) };
    if (minDist === distRight) return { x: w - size - margin, y: Math.max(margin, Math.min(h - size - margin, y)) };
    if (minDist === distTop) return { x: Math.max(margin, Math.min(w - size - margin, x)), y: margin };
    return { x: Math.max(margin, Math.min(w - size - margin, x)), y: h - size - margin - 80 }; // Extra margin at bottom for dock
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePoke = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastInteraction(Date.now());
    setState('poked');
    setTimeout(() => setState('idle'), 1000);
    
    // Add audio feedback if requested, or just visual
    // Small sound effect would go here
  };

  const handlePet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastInteraction(Date.now());
    setState('petted');
    setTimeout(() => setState('happy'), 800);
    setTimeout(() => setState('idle'), 2500);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastInteraction;
      
      if (inactiveTime > 900000 && !isChatOpen) { // 15 minutes
        const randomFact = CRAZY_FACTS[Math.floor(Math.random() * CRAZY_FACTS.length)];
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: `Psst! You've been quiet for a while. Did you know? ${randomFact}`, 
          timestamp: Date.now() 
        }]);
        setIsChatOpen(true);
        setState('happy');
        setLastInteraction(Date.now()); // Reset to avoid spam
      } else if (inactiveTime > 120000 && state !== 'sleeping' && !isChatOpen) {
        setState('sleeping');
      } else if (inactiveTime > 45000 && state !== 'sleeping' && state !== 'curious' && !isChatOpen) {
        setState('curious');
      } else if (inactiveTime > 15000 && state === 'idle' && !isChatOpen) {
        setState('playful');
        setTimeout(() => setState('idle'), 3000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastInteraction, state, isChatOpen]);

  // Wandering logic
  useEffect(() => {
    if (state === 'sleeping' || state === 'thinking' || isChatOpen) return;

    const interval = setInterval(() => {
      const roll = Math.random();
      
      if (roll > 0.80) { // Walk
        const potentialX = position.x + (Math.random() - 0.5) * 800;
        const potentialY = position.y + (Math.random() - 0.5) * 800;
        const snapped = snapToEdge(potentialX, potentialY, config.size);
        
        setState('walking');
        setPosition(snapped);
        setTimeout(() => setState('idle'), 3000);
      } else if (roll > 0.65) { // Jump
        setState('jumping');
        setTimeout(() => setState('idle'), 1200);
      } else if (roll > 0.55) { // Spin
        setState('spinning');
        setTimeout(() => setState('idle'), 1000);
      } else if (roll > 0.45) { // Dance
        setState('dancing');
        setTimeout(() => setState('idle'), 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [position, state, isChatOpen, config.size]);

  // Pomodoro timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomodoro.isActive && pomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoro(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoro.isActive && pomodoro.timeLeft === 0) {
      const nextMode = pomodoro.mode === 'work' ? 'break' : 'work';
      
      // Record history
      let newBreakHistory = [...pomodoro.breakHistory];
      let newFocusHistory = [...pomodoro.focusHistory];

      if (pomodoro.mode === 'break') {
        newBreakHistory.push({
          id: Date.now().toString(),
          timestamp: Date.now(),
          duration: pomodoro.breakDuration,
          type: 'tea'
        });
      } else {
        newFocusHistory.push({
          id: Date.now().toString(),
          timestamp: Date.now(),
          duration: pomodoro.workDuration
        });
      }

      setPomodoro(prev => ({
        ...prev,
        mode: nextMode,
        timeLeft: (nextMode === 'work' ? prev.workDuration : prev.breakDuration) * 60,
        sessionsCompleted: nextMode === 'break' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted,
        breakHistory: newBreakHistory,
        focusHistory: newFocusHistory
      }));
      
      const alertMsg = nextMode === 'break' ? "Time for a sweet break! You've worked so hard. ☕" : "Energy refill complete! Let's get back to it. ✨";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: alertMsg, timestamp: Date.now() }]);
      setIsChatOpen(true);
      setState('happy');
      if (nextMode === 'break') setShowGames(true);
    }
    return () => clearInterval(interval);
  }, [pomodoro.isActive, pomodoro.timeLeft, pomodoro.mode, pomodoro.workDuration, pomodoro.breakDuration]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLastInteraction(Date.now());
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setState('thinking');

    // Emotion detection for character reaction
    const emotion = detectEmotion(input);
    if (emotion === 'happy') setState('happy');
    else if (emotion === 'sad' || emotion === 'stressed') setState('tired');

    const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
    const response = await getCompanionResponse(input, history, { 
      name: config.name, 
      personality: config.character.personality 
    });
    
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() }]);
    setState('idle');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-pink-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full bg-pink-400 border-4 border-white shadow-xl"
        />
      </div>
    );
  }

  if (appState === 'landing') {
    return (
      <div className="fixed inset-0 overflow-hidden bg-white flex flex-col md:flex-row">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fb7185 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Hero Section */}
        <div className="flex-1 p-12 flex flex-col justify-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-theme/10 text-theme font-bold text-xs uppercase tracking-widest border border-theme/20">
              <Sparkles className="w-4 h-4" /> Version 2.0.0
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-slate-800 leading-tight">
              Your New <span className="theme-text">Bestie</span> on Desktop.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-md">
              A cute, AI-powered companion that lives on your screen to help you focus, cheer you up, and keep you company.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleSignIn}
                className="px-10 py-5 bg-theme text-white rounded-3xl font-display font-bold text-xl shadow-lg hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Sign in with Google
              </button>
              <button 
                onClick={handleSkipLogin}
                className="flex items-center gap-4 px-10 py-5 rounded-3xl border-2 border-slate-100 text-slate-500 bg-white hover:bg-slate-50 font-display font-bold text-xl transition-all active:scale-95 shadow-sm"
              >
                Skip & Play 🚀
              </button>
            </div>
          </motion.div>
        </div>

        {/* Visual Showcase */}
        <div className="w-full md:w-[45%] bg-pink-50 relative flex items-center justify-center p-12 overflow-hidden border-l-4 border-white">
          <div className="grid grid-cols-2 gap-4 relative z-10 scale-90 lg:scale-100">
            <div className="col-span-2 glass rounded-[3rem] p-8 shadow-2xl space-y-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-16 h-16 bg-white overflow-visible p-2 relative"
                >
                  <img 
                    src={CHARACTERS[0].image || null} 
                    className="w-full h-full object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="absolute inset-0 bg-pink-100/20 blur-xl -z-10 rounded-full" />
                </motion.div>
                <div>
                   <h3 className="font-display font-bold text-xl text-slate-800">Meet Your Buddy</h3>
                   <p className="text-sm text-slate-500">I'm here to support you! ✨</p>
                 </div>
              </div>
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-white">
                <p className="text-sm text-pink-700 font-medium">"You've been working hard. How about a 5 minute meditation break together?"</p>
              </div>
            </div>
            
            <div className="col-span-1 glass rounded-[2.5rem] p-6 shadow-xl flex flex-col items-center justify-center text-center gap-2">
              <Trophy className="w-8 h-8 theme-text" />
              <span className="text-2xl font-display font-bold">LV 1</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Level Progress</p>
            </div>
            <div className="col-span-1 glass rounded-[2.5rem] p-6 shadow-xl flex flex-col items-center justify-center text-center gap-2">
              <Sparkles className="w-8 h-8 theme-text" />
              <span className="text-2xl font-display font-bold">AI Buddy</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Powered by Gemini</p>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[120px] opacity-40"></div>
        </div>
      </div>
    );
  }

  if (appState === 'onboarding') {
    const slide = ONBOARDING_SLIDES[onboardingStep];
    return (
      <div className={`fixed inset-0 flex items-center justify-center transition-colors duration-1000 ${slide.color} p-6`}>
        <motion.div 
          key={onboardingStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-lg glass rounded-[3rem] p-12 text-center space-y-8 shadow-2xl border-4 border-white"
        >
          <div className="flex justify-center">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center shadow-xl"
            >
              {slide.icon}
            </motion.div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-bold text-slate-800">{slide.title}</h2>
            <p className="text-slate-500 font-medium leading-relaxed">{slide.description}</p>
          </div>
          
          <div className="flex justify-center gap-2">
            {ONBOARDING_SLIDES.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${onboardingStep === i ? 'w-8 bg-theme' : 'w-2 bg-slate-200'}`} />
            ))}
          </div>

          <button 
            onClick={() => {
              if (onboardingStep < ONBOARDING_SLIDES.length - 1) {
                setOnboardingStep(prev => prev + 1);
              } else {
                setAppState('setup');
              }
            }}
            className="w-full py-5 bg-theme text-white rounded-3xl font-display font-bold text-xl shadow-xl hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {onboardingStep === ONBOARDING_SLIDES.length - 1 ? "Let's Customize!" : "Next Step"}
          </button>
        </motion.div>
      </div>
    );
  }

  if (appState === 'setup') {
    return (
      <div className="fixed inset-0 bg-theme/5 p-6 flex flex-col items-center justify-center overflow-y-auto">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg glass rounded-[3rem] shadow-2xl border-4 border-white p-12 text-center space-y-10"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-bold text-slate-800">Your <span className="theme-text">Pixel Pet</span> is Born!</h2>
            <p className="text-slate-500 font-medium">Your drawing has been brought to life. Personalize its look and give it a special name!</p>
          </div>

          <div className="flex justify-center">
            <motion.div 
              animate={{ y: [-15, 15, -15], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-56 h-56 rounded-[3rem] bg-white border-8 border-pink-100 p-8 shadow-2xl relative"
            >
              <img 
                src={config.character?.image || null} 
                className="w-full h-full object-contain pixelated" 
                style={{ 
                  imageRendering: 'pixelated'
                }}
              />
            </motion.div>
          </div>

          <div className="space-y-6 text-left">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">What's their name?</label>
              <input 
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Ex. Kirby, Blobby, Mimi..."
                className="w-full bg-slate-50 border-4 border-slate-100 rounded-3xl px-8 py-5 font-display font-bold text-2xl text-slate-700 outline-none focus:theme-border transition-all shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-2">Choose a Color Aesthetic</label>
              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {PASTEL_PALETTE.map(color => (
                  <button 
                    key={color.name}
                    onClick={() => {
                      setConfig({ ...config, theme: color.color });
                    }}
                    className={`aspect-square rounded-xl border-4 transition-all relative group ${config.theme === color.color ? 'theme-border scale-105 shadow-md' : 'border-white bg-white hover:border-pink-200'}`}
                    style={{ backgroundColor: color.color }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
                      <span className="text-[6px] font-black text-white uppercase">{color.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => saveCompanion(config.name, config.character)}
            className="w-full py-6 bg-theme text-white rounded-[2rem] font-display font-bold text-2xl shadow-2xl hover:brightness-110 active:scale-95 transition-all"
          >
            Enter The Desktop! 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 pastel-synergy"
      />
      
      <AnimatePresence>
        {showCelebration && (
          <CelebrationPopup onAction={() => setShowCelebration(false)} level={wins >= xpToNextLevel ? level + 1 : undefined} />
        )}
      </AnimatePresence>
      {/* App Frame Overlay (Visible when "desktop" is active) */}
      <div className="fixed top-6 right-6 z-[80] pointer-events-auto">
        <div className="glass px-4 py-2 rounded-2xl border border-white shadow-xl flex items-center gap-2">
          <button 
            onClick={() => setIsDashboardOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-xl transition-all text-slate-600 hover:text-pink-500 font-bold text-xs"
          >
            <Layout className="w-4 h-4" /> Dashboard
          </button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1" />
          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white">
            {user?.photoURL ? (
              <img src={user.photoURL || null} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
          </div>
          <p className="text-xs font-bold text-slate-700 hidden sm:block">{user?.displayName}</p>
          <button onClick={handleSignOut} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full Screen Dashboard / Overview */}
      <AnimatePresence>
        {isDashboardOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-3xl overflow-y-auto p-6 md:p-12 pointer-events-auto"
          >
            <div className="max-w-7xl mx-auto space-y-12 pb-20">
              <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-pink-500 flex items-center justify-center text-white shadow-xl shadow-pink-200">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className={`text-3xl font-display font-bold ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-800'}`}>Companion Central</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Your productivity and wellness hub</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {!user && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="hidden md:flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Save progress! Sign in to sync.</span>
                      <button onClick={handleSignIn} className="text-[10px] font-black text-amber-800 underline uppercase">Sign In</button>
                    </motion.div>
                  )}
                  <button 
                    onClick={() => setIsDashboardOpen(false)}
                    className="px-6 py-3 bg-white rounded-2xl flex items-center gap-2 text-slate-500 hover:text-theme shadow-sm border border-slate-100 transition-all font-black uppercase text-[10px] tracking-widest"
                  >
                    <ChevronLeft className="w-4 h-4" /> Exit Dashboard
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Actions */}
                <div className="lg:col-span-1 space-y-6">
                   {/* Profile Card */}
                  <div className="glass rounded-[3rem] p-8 border-2 border-white shadow-xl flex flex-col items-center text-center gap-6">
                    <div className="w-32 h-32 rounded-full border-4 theme-border/20 shadow-2xl p-4 bg-white relative overflow-hidden">
                      <img 
                        src={config.character?.image || null} 
                        className="w-full h-full object-contain" 
                        style={{ 
                          imageRendering: 'pixelated'
                        }}
                      />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-display font-bold ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-800'}`}>{config.name}</h2>
                      <div className="flex items-center gap-2 mt-1 justify-center">
                        <div className="flex items-center gap-1 bg-theme/10 px-2 py-0.5 rounded-full border border-theme/20">
                           <Trophy className="w-3 h-3 theme-text" />
                           <span className="text-[10px] font-black theme-text uppercase tracking-tighter">LV {level}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{config.character.personality}</p>
                      </div>
                    </div>
                    <div className="w-full flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">
                        <span className="theme-text">Wins: {wins}</span>
                        <span className="text-slate-300">XP Progress</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (wins / xpToNextLevel) * 100)}%` }}
                          className="h-full bg-gradient-to-r from-emerald-400 to-blue-400" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button 
                        onClick={() => { setIsDashboardOpen(false); setShowGames(true); }} 
                        className={`p-4 rounded-3xl border transition-all hover:-translate-y-1 flex flex-col items-center gap-2 ${config.themeMode === 'dark' || config.highContrast ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                      >
                        <Trophy className="w-6 h-6 text-theme" />
                        <span className={`font-bold text-[8px] uppercase tracking-widest ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-700'}`}>Arcade</span>
                      </button>
                      <button 
                        onClick={() => { setIsDashboardOpen(false); setIsSettingsOpen(true); }}
                        className={`p-4 rounded-3xl border transition-all hover:-translate-y-1 flex flex-col items-center gap-2 ${config.themeMode === 'dark' || config.highContrast ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                      >
                        <SettingsIcon className="w-6 h-6 text-theme" />
                        <span className={`font-bold text-[8px] uppercase tracking-widest ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-700'}`}>Setup</span>
                      </button>
                      <button 
                        onClick={() => { setIsDashboardOpen(false); setIsDiaryOpen(true); }}
                        className={`p-4 rounded-3xl border transition-all hover:-translate-y-1 flex flex-col items-center gap-2 ${config.themeMode === 'dark' || config.highContrast ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                      >
                        <Book className="w-6 h-6 text-theme" />
                        <span className={`font-bold text-[8px] uppercase tracking-widest ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-700'}`}>Diary</span>
                      </button>
                      <button 
                         onClick={() => { setIsDashboardOpen(false); setIsHistoryOpen(true); }}
                         className={`p-4 rounded-3xl border transition-all hover:-translate-y-1 flex flex-col items-center gap-2 ${config.themeMode === 'dark' || config.highContrast ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                      >
                        <History className="w-6 h-6 text-theme" />
                        <span className={`font-bold text-[8px] uppercase tracking-widest ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-700'}`}>History</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Focus Module */}
                    <div className="glass rounded-[3.5rem] p-10 border-2 border-white shadow-xl flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className={`text-2xl font-display font-bold flex items-center gap-3 ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-800'}`}>
                          <Zap className="w-8 h-8 theme-text" /> Focus & Tea Breaks
                        </h3>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Your daily intervals for deep work and rest</p>
                      </div>
                      <button 
                        onClick={() => setPomodoro(p => ({ ...p, isActive: !p.isActive }))}
                        className={`px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${pomodoro.isActive ? 'bg-red-500 text-white' : 'bg-theme text-white shadow-lg shadow-theme/20'}`}
                      >
                        {pomodoro.isActive ? 'Stop' : 'Start Focus'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Timer Display */}
                      <div className="md:col-span-1 bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-2 ${pomodoro.mode === 'work' ? 'bg-theme' : 'bg-emerald-400'}`} />
                        <div className="flex items-center gap-3 mb-4">
                           {pomodoro.mode === 'work' ? <Timer className="w-6 h-6 text-theme" /> : <Coffee className="w-6 h-6 text-orange-400" />}
                           <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">
                             {pomodoro.mode === 'work' ? 'Zen Mode' : 'Recalibrating'}
                           </span>
                        </div>
                        <span className={`text-7xl font-display font-black tracking-tighter ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-800'}`}>
                          {Math.floor(pomodoro.timeLeft / 60)}:{String(pomodoro.timeLeft % 60).padStart(2, '0')}
                        </span>
                        <div className="mt-6 flex gap-3 text-white">
                          <button 
                            onClick={() => setPomodoro(p => ({ ...p, mode: 'work', timeLeft: p.workDuration * 60, isActive: false }))}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${pomodoro.mode === 'work' ? 'bg-theme' : 'bg-slate-200 text-slate-500'}`}
                          >
                            Focus
                          </button>
                          <button 
                            onClick={() => setPomodoro(p => ({ ...p, mode: 'break', timeLeft: p.breakDuration * 60, isActive: false }))}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${pomodoro.mode === 'break' ? 'bg-emerald-500' : 'bg-slate-200 text-slate-500'}`}
                          >
                            Rest
                          </button>
                        </div>
                      </div>

                      {/* Adjustments */}
                      <div className="md:col-span-1 bg-white/50 rounded-[2.5rem] p-8 border border-white flex flex-col gap-6">
                        <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-400">Durations</h4>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold px-1">
                              <span className="text-slate-500">Focus Time</span>
                              <span className="theme-text">{pomodoro.workDuration}m</span>
                            </div>
                            <input 
                              type="range" min="5" max="60" step="5"
                              value={pomodoro.workDuration}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setPomodoro(p => ({ ...p, workDuration: val, timeLeft: p.mode === 'work' ? val * 60 : p.timeLeft }));
                              }}
                              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-theme"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold px-1">
                              <span className="text-slate-500">Rest Stop</span>
                              <span className="text-emerald-500">{pomodoro.breakDuration}m</span>
                            </div>
                            <input 
                              type="range" min="1" max="30" step="1"
                              value={pomodoro.breakDuration}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setPomodoro(p => ({ ...p, breakDuration: val, timeLeft: p.mode === 'break' ? val * 60 : p.timeLeft }));
                              }}
                              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Productivity Stats Module */}
                      <div className="md:col-span-1 bg-white/50 rounded-[2.5rem] p-8 border border-white flex flex-col min-h-[280px]">
                        <FocusStats history={pomodoro.focusHistory} themeColor={config.theme} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass rounded-[3rem] p-8 border-2 border-white shadow-sm flex flex-col h-auto min-h-[480px]">
                      <TodoList todos={todos} onAdd={handleAddTodo} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
                    </div>
                    <div className="glass rounded-[3rem] p-8 border-2 border-white shadow-sm flex flex-col h-auto min-h-[480px]">
                      <CalendarModule events={events} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} />
                    </div>
                  </div>

                  <div className="glass rounded-[3rem] p-8 border-2 border-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className={`text-xl font-display font-bold ${config.themeMode === 'dark' || config.highContrast ? 'text-white' : 'text-slate-800'}`}>Quick Breaks</h3>
                      <p className="text-sm text-slate-500 font-medium">Reset your mind with quick social snippets or music</p>
                    </div>
                    <SocialBreak />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diary Modal */}
      <AnimatePresence>
        {isDiaryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-amber-50/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl h-[90vh] bg-[#fffcf5] rounded-[3rem] shadow-2xl shadow-amber-900/20 border-8 border-white overflow-hidden flex flex-col relative"
              style={{
                backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)',
                backgroundSize: '24px 24px'
              }}
            >
              <div className="flex-1 overflow-hidden p-8 md:p-12">
                <DiaryModule 
                  entries={diaryEntries}
                  pin={diaryPin}
                  onSavePIN={(p) => {
                    if (p === null || p === '') {
                      setDiaryPin(null);
                      localStorage.removeItem('pet-diary-pin');
                    } else {
                      setDiaryPin(p);
                      localStorage.setItem('pet-diary-pin', p);
                    }
                  }}
                  onSaveEntry={handleSaveDiaryEntry}
                  onDeleteEntry={handleDeleteDiaryEntry}
                  onClose={() => setIsDiaryOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl h-[90vh] bg-slate-50 rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden flex flex-col relative"
            >
              <div className="flex-1 overflow-hidden p-8 md:p-12">
                <ChatHistoryModule 
                  history={chatHistory}
                  onDeleteSession={handleDeleteChatHistory}
                  config={config}
                  onClose={() => setIsHistoryOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Companion */}
      <AnimatePresence>
        {config.isPetVisible && (
          <motion.div
            drag
            dragMomentum={false}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="pointer-events-auto cursor-grab active:cursor-grabbing absolute z-50 flex flex-col items-center"
            style={{ width: config.size }}
            onDragEnd={(_, info) => {
              const newPos = snapToEdge(position.x + info.offset.x, position.y + info.offset.y, config.size);
              setPosition(newPos);
              setLastInteraction(Date.now());
              if (state === 'sleeping') setState('idle');
            }}
            onPointerDown={() => setLastInteraction(Date.now())}
          >
        {/* Floating Interactions */}
        <AnimatePresence>
          {state === 'thinking' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 glass px-3 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest theme-text border-2 theme-border shadow-xl"
            >
              Thinking...
            </motion.div>
          )}
          {state === 'sleeping' && (
            <motion.div 
              animate={{ y: [-2, 2, -2], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-10 text-2xl"
            >
              💤
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character Visual */}
        <div 
          className="relative group w-full aspect-square"
          onMouseEnter={handlePet}
          onMouseDown={handlePoke}
          onClick={(e) => {
            e.stopPropagation();
            setLastInteraction(Date.now());
            if (state === 'sleeping') {
              setState('idle');
            } else if (state === 'thinking') {
              // Wait for gemini
            } else {
              setIsChatOpen(!isChatOpen);
              setState('happy');
              setTimeout(() => setState('idle'), 1500);
            }
          }}
        >
          {/* Aura Effect */}
          <div 
            className="absolute inset-0 rounded-full blur-3xl opacity-10 transition-all duration-1000 group-hover:opacity-30 animate-pulse"
            style={{ backgroundColor: config.character.color }}
          />

          <motion.div
            className="w-full h-full relative"
            animate={{ 
              y: state === 'walking' ? [0, -12, 0] : 
                 state === 'jumping' ? [0, -60, 0] : 
                 state === 'dancing' ? [0, -15, 0, -15, 0] : [0, -5, 0],
              scale: state === 'happy' ? 1.1 : 
                     state === 'jumping' ? [1, 0.9, 1.1, 1] : 
                     state === 'poked' ? 0.8 :
                     state === 'petted' ? 1.05 : 1,
              rotate: state === 'walking' ? [-3, 3, -3] : 
                      state === 'curious' ? [0, -10, 10, 0] : 
                      state === 'spinning' ? [0, 360] : 
                      state === 'dancing' ? [-8, 8, -8, 8, 0] : 
                      state === 'poked' ? [-10, 10, -10, 10, 0] : 0,
              x: (state === 'playful' || state === 'poked') ? [-8, 8, -8, 8, 0] : 0
            }}
            transition={{ 
              repeat: (state === 'happy' || state === 'spinning' || state === 'jumping' || state === 'dancing' || state === 'poked') ? 0 : Infinity, 
              duration: state === 'walking' ? 0.35 : 
                        state === 'jumping' ? 0.6 :
                        state === 'spinning' ? 0.8 :
                        state === 'dancing' ? 1 :
                        state === 'poked' ? 0.2 :
                        state === 'curious' ? 2 : 4,
              ease: "easeInOut"
            }}
          >
            <img
              src={config.character?.image || null}
              alt={config.name}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              style={{
                transform: state === 'sleeping' ? 'scale(0.95)' : 'scale(1)',
                filter: (state === 'sleeping' ? 'grayscale(0.6) brightness(0.8)' : ''),
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                imageRendering: 'pixelated'
              }}
            />
            
            {/* Emotions Overlay */}
            <AnimatePresence>
              {state === 'sleeping' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-indigo-900/10 pointer-events-none rounded-full"
                />
              )}
            </AnimatePresence>
            
            {/* Status Icon */}
            {state === 'happy' && (
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="absolute -top-4 -right-4 z-20">
                <Sparkles className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Premium Name Plate */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 glass px-4 py-1.5 rounded-2xl shadow-xl border-2 border-white/50 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.character.color }} />
          <span className="text-xs font-display font-bold tracking-tight text-slate-700">{config.name}</span>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Premium Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -100, y: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[60] w-80 flex flex-col pointer-events-auto"
            style={{ 
              left: Math.min(window.innerWidth - 350, Math.max(20, position.x + config.size + 20)),
              top: Math.min(window.innerHeight - 500, Math.max(20, position.y - 100))
            }}
          >
            <div className="glass rounded-[2rem] overflow-hidden border-2 border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col">
              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-white/30" style={{ background: `linear-gradient(135deg, ${config.character.color}11, transparent)` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                    <img 
                      src={config.character?.image || null} 
                      className="w-full h-full object-contain" 
                      style={{ 
                        imageRendering: 'pixelated'
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-slate-800 leading-none">{config.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">{config.character.personality}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400">
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[300px] min-h-[150px]">
                {messages.map((m) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={m.id} 
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                      m.role === 'user' 
                        ? 'bg-theme text-white rounded-tr-none' 
                        : 'glass text-slate-700 rounded-tl-none border border-white'
                    }`}>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/30 backdrop-blur-md border-t border-white/30">
                <div className="flex items-center gap-2 bg-white/60 p-2 rounded-2xl border border-white focus-within:border-theme/30 shadow-inner">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-400 text-slate-800 font-medium"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || state === 'thinking'}
                    className="w-8 h-8 flex items-center justify-center bg-theme text-white rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bento Dashboard */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/70 backdrop-blur-2xl px-3 py-2 rounded-3xl border border-white/50 shadow-2xl z-40 pointer-events-auto">
        <button 
          onClick={() => setPomodoro(prev => ({ ...prev, isActive: !prev.isActive }))}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 font-bold ${
            pomodoro.isActive ? 'bg-theme text-white shadow-lg scale-105' : 'bg-white/50 text-slate-600 hover:bg-white'
          }`}
        >
          {pomodoro.mode === 'work' ? <Timer className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
          <span className="text-xs font-display">
            {Math.floor(pomodoro.timeLeft / 60)}:{String(pomodoro.timeLeft % 60).padStart(2, '0')}
          </span>
        </button>
        
        <div className="w-[1px] h-6 bg-slate-200/50 mx-1" />
        
        <button 
          onClick={() => setShowGames(true)}
          className="p-3 bg-white/50 hover:bg-white rounded-2xl text-slate-400 hover:text-theme transition-all group"
        >
          <Trophy className="w-5 h-5 group-hover:scale-125 transition-transform" />
        </button>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-white/50 hover:bg-white rounded-2xl text-slate-400 hover:text-theme transition-all group"
        >
          <SettingsIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      {/* Mini Games Overlay */}
      <AnimatePresence>
        {showGames && (
          <div className="fixed inset-0 flex items-center justify-center z-[300] pointer-events-auto p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl"
              onClick={() => setShowGames(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 100 }}
              className="relative z-[301] w-full flex justify-center"
            >
              <MiniGames 
                onClose={() => setShowGames(false)} 
                onComplete={(score) => {
                  setShowGames(false);
                  const winReward = Math.floor(score / 2);
                  setWins(w => w + winReward);
                  
                  // Create floating XP effect
                  const effect = document.createElement('div');
                  effect.className = 'fixed pointer-events-none text-indigo-500 font-black text-2xl z-[200] animate-bounce';
                  effect.style.left = '50%';
                  effect.style.top = '40%';
                  effect.innerText = `+${winReward} WINS! 🎮`;
                  document.body.appendChild(effect);
                  setTimeout(() => effect.remove(), 2500);

                  setMessages(prev => [...prev, { 
                    id: Date.now().toString(), 
                    role: 'assistant', 
                    content: `Incredible! ${score} points and ${winReward} Wins! You're making me so proud! 💖✨`, 
                    timestamp: Date.now() 
                  }]);
                  setIsChatOpen(true);
                  setState('happy');
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Bento Settings */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-6 z-[100] pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-md"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl glass rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] overflow-hidden border border-white relative flex flex-col md:flex-row h-[500px]"
            >
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-white/40 p-8 border-r border-white flex flex-col gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 p-4 bg-white">
                    <img 
                      src={config.character?.image || null} 
                      className="w-full h-full object-contain" 
                      style={{ 
                        imageRendering: 'pixelated'
                      }}
                    />
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-800">{config.name}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">LV. {level} companion</p>
                </div>
                
                <nav className="space-y-1">
                  <button 
                    onClick={() => setSettingsTab('customization')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${settingsTab === 'customization' ? 'bg-white border-white shadow-sm font-bold theme-text' : 'border-transparent text-slate-500 hover:bg-white/40'}`}
                  >
                    <Smile className="w-4 h-4" /> Customization
                  </button>
                  <button 
                    onClick={() => setSettingsTab('timer')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${settingsTab === 'timer' ? 'bg-white border-white shadow-sm font-bold theme-text' : 'border-transparent text-slate-500 hover:bg-white/40'}`}
                  >
                    <Timer className="w-4 h-4" /> Timer Settings
                  </button>
                </nav>
              </div>

              {/* Content Panel */}
              <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-white/20">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-display font-bold text-slate-800">
                    {settingsTab === 'timer' ? 'Timer Settings' : 'Customize App'}
                  </h3>
                  <button 
                    onClick={() => setIsSettingsOpen(false)} 
                    className="px-4 py-2 bg-white rounded-xl flex items-center gap-2 text-slate-500 hover:text-theme shadow-sm border border-slate-100 transition-all font-black uppercase text-[9px] tracking-widest"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Close
                  </button>
                </div>

                {settingsTab === 'customization' ? (
                  <>
                    <section className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Switch Character</label>
                      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {CHARACTERS.map((char, i) => {
                          const isLocked = i > level + 1;
                          return (
                            <div key={char.id} className="relative">
                              <button 
                                disabled={isLocked}
                                onClick={() => setConfig({ ...config, character: char })}
                                className={`min-w-[4rem] h-16 rounded-2xl border-4 transition-all bg-white p-2 ${
                                  config.character.id === char.id ? 'theme-border scale-110 shadow-lg' : 'border-slate-100 hover:border-pink-200'
                                } ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                              >
                                <img src={char.image} className="w-full h-full object-contain pixelated" />
                              </button>
                              {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <span className="text-[8px] font-black bg-slate-800 text-white px-1 rounded">LV {i-1}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Appearance Settings */}
                    <section className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Appearance</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setConfig({ ...config, themeMode: config.themeMode === 'dark' ? 'light' : 'dark' })}
                          className="glass p-4 rounded-3xl border border-white flex items-center justify-between group hover:bg-white/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${config.themeMode === 'dark' ? 'theme-bg text-white' : 'bg-orange-100 text-orange-600'}`}>
                              {config.themeMode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{config.themeMode === 'dark' ? 'Dark' : 'Light'}</span>
                          </div>
                          <div className={`w-10 h-5 rounded-full p-1 transition-colors ${config.themeMode === 'dark' ? 'theme-bg' : 'bg-slate-200'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${config.themeMode === 'dark' ? 'translate-x-5' : ''}`} />
                          </div>
                        </button>

                        <button 
                          onClick={() => setConfig({ ...config, isPetVisible: !config.isPetVisible })}
                          className="glass p-4 rounded-3xl border border-white flex items-center justify-between group hover:bg-white/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${config.isPetVisible ? 'theme-bg text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <Smile className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">Show Pet</span>
                          </div>
                          <div className={`w-10 h-5 rounded-full p-1 transition-colors ${config.isPetVisible ? 'theme-bg' : 'bg-slate-200'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${config.isPetVisible ? 'translate-x-5' : ''}`} />
                          </div>
                        </button>
                      </div>
                    </section>

                    {/* Color Customization Section */}
                    <section className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Color Aesthetic</label>
                      <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {PASTEL_PALETTE.map((color) => (
                          <button 
                            key={color.name}
                            onClick={() => {
                              setConfig({ ...config, theme: color.color });
                            }}
                            className="group relative flex flex-col items-center gap-2"
                          >
                            <div 
                              className={`w-full aspect-square rounded-xl border-4 transition-all ${
                                config.theme === color.color ? 'theme-border scale-110 shadow-lg' : 'border-white bg-slate-50 hover:border-pink-100'
                              }`}
                              style={{ 
                                backgroundColor: color.color 
                              }}
                            />
                            <span className={`text-[8px] font-black uppercase tracking-tighter truncate w-full text-center ${config.theme === color.color ? 'theme-text' : 'text-slate-400'}`}>
                              {color.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Security Section (Styled) */}
                    <section className="space-y-4 pt-6 border-t border-slate-100 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full" />
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Security & Privacy
                      </label>
                      <div className="glass p-5 rounded-[2.5rem] border border-white flex items-center justify-between relative z-10 hover:shadow-xl hover:shadow-rose-500/5 transition-all group duration-500 bg-white/40 backdrop-blur-md">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-black text-slate-700 tracking-tight flex items-center gap-2">
                            Diary Vault Key
                            {diaryPin && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                            {diaryPin ? 'Your journal is PROTECTED by a secret key.' : 'Your journal is currently UNPROTECTED.'}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (diaryPin) {
                              if (isResetReady) {
                                setDiaryPin(null);
                                localStorage.removeItem('pet-diary-pin');
                                setIsResetReady(false);
                                setIsDiaryOpen(true);
                                setIsSettingsOpen(false);
                              } else {
                                setIsResetReady(true);
                                // Self-reset if not clicked again
                                setTimeout(() => setIsResetReady(false), 3000);
                              }
                            } else {
                              setIsDiaryOpen(true);
                              setIsSettingsOpen(false);
                            }
                          }}
                          className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                            diaryPin 
                              ? isResetReady
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                                : 'bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white' 
                              : 'theme-bg text-white shadow-lg scale-105 hover:brightness-110 active:scale-95'
                          }`}
                        >
                          {diaryPin ? (isResetReady ? 'Tap to Confirm' : 'Reset Key') : 'Setup Lock'}
                        </button>
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Timer className="w-4 h-4 text-indigo-500" /> Pomodoro Schedule
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">Configure your work and rest intervals to stay productive without burning out.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass p-5 rounded-3xl border border-white space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Work Duration</span>
                            <span className="text-sm font-black theme-text">{pomodoro.workDuration}m</span>
                          </div>
                          <input 
                            type="range" min="5" max="120" step="5"
                            value={pomodoro.workDuration}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setPomodoro(p => ({ 
                                ...p, 
                                workDuration: val,
                                timeLeft: p.mode === 'work' ? val * 60 : p.timeLeft,
                                isActive: false
                              }));
                            }}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-theme"
                            style={{ accentColor: config.theme }}
                          />
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Short (5m)</span>
                            <span>Deep Focus (2h)</span>
                          </div>
                        </div>

                        <div className="glass p-5 rounded-3xl border border-white space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Break Duration</span>
                            <span className="text-sm font-black theme-text">{pomodoro.breakDuration}m</span>
                          </div>
                          <input 
                            type="range" min="1" max="60" step="1"
                            value={pomodoro.breakDuration}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setPomodoro(p => ({ 
                                ...p, 
                                breakDuration: val,
                                timeLeft: p.mode === 'break' ? val * 60 : p.timeLeft,
                                isActive: false
                              }));
                            }}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-theme"
                            style={{ accentColor: config.theme }}
                          />
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                             <span>Quick (1m)</span>
                             <span>Refresh (1h)</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="theme-bg/10 p-6 rounded-[2rem] border theme-border/30 space-y-3">
                      <div className="flex items-center gap-3">
                         <Zap className="w-5 h-5 theme-text" />
                         <h5 className="font-bold theme-text text-sm">Productivity Tip</h5>
                      </div>
                      <p className="text-xs theme-text/80 leading-relaxed font-medium">
                        Research shows that the **52/17 technique** is highly effective—52 minutes of work followed by 17 minutes of break. Try it out!
                      </p>
                    </section>
                  </div>
                )}

                {/* Other Settings Bento Box */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 glass p-5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">Display Name</span>
                      <input 
                        type="text" 
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        className="bg-white/50 border border-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#fb7185] transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="bg-pink-50/50 p-5 rounded-3xl border border-pink-100 flex flex-col justify-between h-32">
                    <span className="text-xs font-bold text-pink-700">Character Size</span>
                    <input 
                      type="range" min="100" max="300" 
                      value={config.size}
                      onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value) })}
                      className="w-full accent-[#fb7185]"
                    />
                  </div>

                  <div className="bg-purple-50/50 p-5 rounded-3xl border border-purple-100 flex flex-col justify-between h-32">
                    <span className="text-xs font-bold text-purple-700">Notifications</span>
                    <button 
                      onClick={() => setConfig({ ...config, notificationsEnabled: !config.notificationsEnabled })}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${config.notificationsEnabled ? 'bg-[#fb7185]' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.notificationsEnabled ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-4 bg-[#fb7185] text-white rounded-3xl font-display font-bold shadow-[0_10px_30px_-5px_rgba(251,113,133,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(251,113,133,0.6)] hover:scale-[1.01] transition-all"
                >
                  Apply & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
