/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Music, Instagram, Star, PartyPopper } from 'lucide-react';
import { TodoItem, CalendarEvent } from '../types';

export const CelebrationPopup = ({ onAction, level }: { onAction: () => void, level?: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
    >
      <div className="glass rounded-[3rem] p-10 max-w-sm w-full border-4 border-white shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-300 via-blue-300 to-red-300" />
        <div className={`w-24 h-24 ${level ? 'theme-bg/10' : 'bg-emerald-100'} rounded-full flex items-center justify-center mx-auto shadow-inner`}>
          <PartyPopper className={`w-12 h-12 ${level ? 'theme-text' : 'text-emerald-500'} animate-bounce`} />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-display font-black text-slate-800 uppercase tracking-tight">
            {level ? `Level ${level} reached!` : 'Amazing job! ✨'}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {level 
              ? "New Pixel Companions have been unlocked in your settings! Go check them out." 
              : "You've earned a bunch of Wins today. Your pet is feeling extra energetic!"}
          </p>
        </div>
        {!level && (
          <div className="bg-emerald-50 p-4 rounded-3xl border-2 border-emerald-100 flex items-center justify-center gap-2">
             <Star className="w-5 h-5 text-emerald-500 fill-emerald-500 font-black" />
             <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-widest">Growth Boosted</span>
          </div>
        )}
        <button 
          onClick={onAction}
          className={`w-full py-5 ${level ? 'theme-bg' : 'bg-emerald-500'} text-white rounded-3xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95`}
        >
          {level ? 'Claim Rewards' : 'Keep it up'}
        </button>
      </div>
    </motion.div>
  );
};

export const TodoList = ({ todos, onAdd, onToggle, onDelete }: { 
  todos: TodoItem[], 
  onAdd: (text: string) => void, 
  onToggle: (id: string) => void,
  onDelete: (id: string) => void
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAdd(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 theme-text" /> Tasks
        </h3>
        <span className="text-[10px] theme-bg/10 theme-text px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {todos.filter(t => !t.completed).length} Left
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:theme-border outline-none transition-all placeholder:text-slate-400"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 theme-bg text-white rounded-xl flex items-center justify-center shadow-lg">
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {todos.length === 0 ? (
            <div className="text-center py-8 opacity-40">
              <CheckSquare className="w-12 h-12 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">All caught up!</p>
            </div>
          ) : (
            todos.map(todo => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl hover:theme-border transition-all shadow-sm"
              >
                <button
                  onClick={() => onToggle(todo.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed ? 'theme-bg theme-border text-white' : 'border-slate-300'
                  }`}
                >
                  {todo.completed && <CheckSquare className="w-3 h-3" />}
                </button>
                <span className={`flex-1 text-sm font-medium ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const CalendarModule = ({ events, onAddEvent, onDeleteEvent }: { 
  events: CalendarEvent[], 
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void,
  onDeleteEvent: (id: string) => void
}) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || selectedDay === null) return;
    
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    
    // Cycle through vibrant colors
    const colors = ['theme-bg', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    const color = colors[events.length % colors.length];

    onAddEvent({
      title: newEventTitle,
      date: dateStr,
      type: 'task',
      color: color
    });

    setNewEventTitle('');
    setShowAddModal(false);
  };

  const dateStrForSelected = selectedDay 
    ? `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  const dayEvents = dateStrForSelected ? events.filter(e => e.date === dateStrForSelected) : [];

  return (
    <div className="flex flex-col h-full space-y-4 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 theme-text" /> {monthNames[viewDate.getMonth()]}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1 border-b border-slate-50 pb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1 h-full content-start">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="w-full aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = day === new Date().getDate() && viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear();
          const currentDayEvents = events?.filter(e => e.date === dateStr) || [];
          
          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                setShowAddModal(true);
              }}
              className={`w-full aspect-square relative flex items-center justify-center text-[10px] font-black rounded-lg transition-all border ${
                isToday 
                  ? 'theme-bg text-white shadow-lg border-transparent' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-100/50 shadow-sm'
              }`}
            >
              <span className="relative z-10">{day}</span>
              {currentDayEvents.length > 0 && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {currentDayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : ev.color} opacity-80`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute inset-0 z-50 glass rounded-[2.5rem] p-6 flex flex-col gap-4 shadow-2xl border-2 border-white"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{monthNames[viewDate.getMonth()]} {selectedDay}</span>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            {/* List existing events for day */}
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
              {dayEvents.length > 0 ? (
                dayEvents.map(e => (
                  <div key={e.id} className="flex items-center justify-between bg-white/50 backdrop-blur-sm border border-slate-100 p-3 rounded-2xl group shadow-sm transition-all hover:bg-white">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${e.color}`} />
                      <span className="text-xs font-bold text-slate-600">{e.title}</span>
                    </div>
                    <button 
                      onClick={(e_stop) => {
                        e_stop.stopPropagation();
                        onDeleteEvent(e.id);
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-8">
                   <Star className="w-8 h-8 mb-2 text-slate-300" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No events today</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <input 
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                placeholder="What's happening?"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:theme-border transition-all shadow-inner"
                autoFocus
              />
              <button 
                onClick={handleAddEvent}
                className="w-full py-4 theme-bg text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Add Marking
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SocialBreak = () => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-display font-bold text-slate-800">Quick Break</h3>
      <div className="grid grid-cols-2 gap-3">
        <a 
          href="https://open.spotify.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-2xl border border-green-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1DB954] flex items-center justify-center text-white shadow-lg">
            <Music className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-700">Spotify</p>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Open Web</p>
          </div>
        </a>
        <a 
          href="https://www.instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-pink-50 hover:bg-pink-100 rounded-2xl border border-pink-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-lg">
            <Instagram className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-700">Instagram</p>
            <p className="text-[10px] text-pink-600 font-bold uppercase tracking-widest">Open Web</p>
          </div>
        </a>
      </div>
    </div>
  );
};
