/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type CompanionState = 'idle' | 'walking' | 'sleeping' | 'happy' | 'thinking' | 'tired' | 'dancing' | 'curious' | 'playful' | 'jumping' | 'spinning' | 'poked' | 'petted' | 'repeating';

export type Expression = 'neutral' | 'happy' | 'sad' | 'surprised' | 'blink' | 'sleep' | 'angry' | 'wink';

export interface GameState {
  type: 'none' | 'catch' | 'memory' | 'clicker' | 'flappy' | 'snake' | 'word';
  score: number;
  isActive: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string or YYYY-MM-DD
  color: string;
  type: 'task' | 'reminder' | 'birthday' | 'occasion';
  description?: string;
}

export interface Character {
  id: string;
  name: string;
  image: string;
  color: string;
  baseHue: number;
  personality: string;
}

export type AppState = 'landing' | 'onboarding' | 'setup' | 'dashboard' | 'desktop';

export interface CompanionConfig {
  name: string;
  size: number;
  speed: number;
  theme: string;
  character: Character;
  notificationsEnabled: boolean;
  pomodoroEnabled: boolean;
  themeMode?: 'light' | 'dark';
  highContrast?: boolean;
  isPetVisible: boolean;
}

export interface BreakHistoryItem {
  id: string;
  timestamp: number;
  duration: number; // in minutes
  type: 'tea' | 'pomodoro-break';
}

export interface FocusHistoryItem {
  id: string;
  timestamp: number;
  duration: number; // in minutes
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  timestamp: number;
}

export interface ChatHistoryItem {
  id: string;
  timestamp: number;
  messages: Message[];
}

export interface PomodoroState {
  isActive: boolean;
  timeLeft: number;
  mode: 'work' | 'break';
  sessionsCompleted: number;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  breakHistory: BreakHistoryItem[];
  focusHistory: FocusHistoryItem[];
}
