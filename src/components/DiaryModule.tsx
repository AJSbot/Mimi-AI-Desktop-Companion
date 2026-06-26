/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  Save, 
  Calendar as CalendarIcon, 
  Trash2, 
  Clock,
  Sparkles,
  Edit3,
  PenTool,
  Search
} from 'lucide-react';
import { DiaryEntry } from '../types';

interface DiaryModuleProps {
  entries: DiaryEntry[];
  pin: string | null;
  onSavePIN: (pin: string | null) => void;
  onSaveEntry: (content: string, mood: string, date?: string) => void;
  onDeleteEntry: (id: string) => void;
  onClose?: () => void;
}

export const DiaryModule = ({ 
  entries, 
  pin, 
  onSavePIN, 
  onSaveEntry, 
  onDeleteEntry,
  onClose
}: DiaryModuleProps) => {
  const [isLocked, setIsLocked] = useState(!!pin);
  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(!pin);
  const [newPin, setNewPin] = useState('');
  const [activeTab, setActiveTab] = useState<'archive' | 'write'>('write');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const [forgotConfirmReady, setForgotConfirmReady] = useState(false);

  // Sync with prop changes (e.g. when PIN is reset in settings)
  useEffect(() => {
    if (!pin) {
      setShowPinSetup(true);
      setIsLocked(false);
      setPinInput('');
      setNewPin('');
      setForgotConfirmReady(false);
    } else if (showPinSetup) {
      // If we were in setup mode and a pin appeared, exit setup mode
      setShowPinSetup(false);
    }
  }, [pin]);

  // When an entry is selected from archive, switch to write tab (which will show view mode)
  useEffect(() => {
    if (activeEntryId) {
      setActiveTab('write');
    }
  }, [activeEntryId]);

  const moods = [
    { name: 'Radiant', icon: '✨', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Happy', icon: '😊', color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Party', icon: '🥳', color: 'bg-orange-100 text-orange-600' },
    { name: 'Love', icon: '🥰', color: 'bg-rose-100 text-rose-600' },
    { name: 'Wink', icon: '😉', color: 'bg-blue-50 text-blue-500' },
    { name: 'Cool', icon: '😎', color: 'bg-blue-100 text-blue-600' },
    { name: 'Sleepy', icon: '🛌', color: 'bg-indigo-50 text-indigo-400' },
    { name: 'Vibrant', icon: '🌈', color: 'bg-pink-100 text-pink-600' },
    { name: 'Calm', icon: '😌', color: 'bg-teal-100 text-teal-600' },
    { name: 'Idea', icon: '💡', color: 'bg-amber-100 text-amber-600' },
    { name: 'Music', icon: '🎵', color: 'bg-violet-100 text-violet-600' },
    { name: 'Game', icon: '🎮', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Pensive', icon: '🤔', color: 'bg-slate-100 text-slate-600' },
    { name: 'Meh', icon: '😐', color: 'bg-slate-200 text-slate-500' },
    { name: 'Tired', icon: '💤', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Sad', icon: '😢', color: 'bg-indigo-200 text-indigo-700' },
    { name: 'Angry', icon: '😤', color: 'bg-red-100 text-red-600' }
  ];

  const handleSetPin = () => {
    if (newPin.length < 4) {
      setError('PIN must be 4 digits');
      return;
    }
    onSavePIN(newPin);
    setShowPinSetup(false);
    setIsLocked(false); // Stay unlocked after setup
    setError('');
  };

  const handleChangePin = () => {
    if (confirm('Change your secret key? This will take you to the PIN setup screen.')) {
      setShowPinSetup(true);
      setNewPin('');
    }
  };

  const handleSave = () => {
    if (!editorContent.trim()) return;
    onSaveEntry(editorContent, selectedMood, selectedDate);
    setEditorContent('');
    setActiveEntryId(null);
    setSearchQuery(''); // Reset search to see the new entry
  };

  const activeEntry = entries.find(e => e.id === activeEntryId);

  if (showPinSetup) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-8 text-center max-w-sm mx-auto p-4">
        <div className="w-24 h-24 bg-theme/10 rounded-[2.5rem] flex items-center justify-center -rotate-6 shadow-lg">
          <Book className="w-12 h-12 theme-text" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-display font-black text-slate-800 tracking-tighter">My Pet Diary</h3>
          <p className="text-sm text-slate-500 font-medium italic">"A safe place for your wonderful secrets..."</p>
        </div>
        
        <div className="space-y-6 w-full">
          <input 
            type="password"
            maxLength={4}
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Pick 4 Digits"
            className="w-full bg-white border-4 border-slate-100 rounded-3xl px-6 py-5 text-center text-3xl font-black tracking-[0.5em] outline-none focus:border-theme/30 transition-all shadow-inner placeholder:tracking-normal placeholder:text-sm"
          />
          {error && <p className="text-[11px] text-rose-500 font-black uppercase tracking-widest">{error}</p>}
          <button 
            onClick={handleSetPin}
            className="w-full py-5 theme-bg text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-theme/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Seal My Journal
          </button>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-8 text-center p-6 max-w-sm mx-auto">
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center relative shadow-xl border-4 border-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-theme/5" />
          <Lock className="w-12 h-12 theme-text relative z-10" />
        </motion.div>
        
        <div className="space-y-2">
           <h3 className="text-3xl font-display font-black text-slate-800 tracking-tighter">Enter Secret Key</h3>
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Authorized Use Only</p>
        </div>

        <div className="space-y-8 w-full">
          <div className="flex gap-4 justify-center">
             {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-14 h-16 rounded-2xl border-4 flex items-center justify-center text-2xl font-black transition-all duration-300 ${pinInput.length > i ? 'bg-theme border-theme text-white shadow-xl scale-110' : 'border-slate-100 bg-slate-50 text-slate-300'}`} 
                >
                  {pinInput.length > i ? '•' : ''}
                </div>
             ))}
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'DEL'].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                     setError('');
                     if (val === 'C') setPinInput('');
                     else if (val === 'DEL') setPinInput(prev => prev.slice(0, -1));
                     else if (typeof val === 'number') {
                        if (pinInput.length < 4) {
                           const newVal = pinInput + val;
                           setPinInput(newVal);
                           if (newVal.length === 4) {
                              setTimeout(() => {
                                 if (newVal === pin) {
                                    setIsLocked(false);
                                    setPinInput('');
                                 } else {
                                    setError('Invalid PIN code');
                                    setPinInput('');
                                 }
                              }, 300);
                           }
                        }
                     }
                  }}
                  className={`h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all active:scale-90 ${
                    typeof val === 'string' 
                      ? 'bg-slate-100 text-slate-400 text-xs' 
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 hover:theme-bg hover:text-white hover:border-transparent'
                  }`}
                >
                  {val}
                </button>
             ))}
          </div>
          
          {error && <p className="text-[11px] text-rose-500 font-black uppercase tracking-widest text-center">{error}</p>}

          <div className="flex justify-center pt-2">
            <button 
              onClick={() => {
                if (forgotConfirmReady) {
                  onSavePIN(null); 
                  setForgotConfirmReady(false);
                } else {
                  setForgotConfirmReady(true);
                  setTimeout(() => setForgotConfirmReady(false), 3000);
                }
              }}
              className={`text-[10px] font-black uppercase tracking-widest transition-all px-4 py-1 rounded-full ${
                forgotConfirmReady 
                  ? 'bg-rose-500 text-white shadow-lg animate-pulse' 
                  : 'text-slate-400 hover:text-rose-500'
              }`}
            >
              {forgotConfirmReady ? 'Tap again to Reset' : 'Forgot PIN? Tap to Reset'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation Row */}
      {onClose && (
        <div className="px-4 mb-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white rounded-xl flex items-center gap-2 text-slate-500 hover:text-theme shadow-sm border border-slate-100 transition-all font-black uppercase text-[9px] tracking-widest shrink-0 active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h3 className="text-3xl font-display font-black text-slate-800 tracking-tighter flex items-center gap-2">
              My Magical Journal <Book className="w-8 h-8 theme-text" />
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share secrets with your pet partner</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-2xl p-1 shadow-sm border border-slate-200">
            <button 
              onClick={() => {
                setActiveTab('write');
                setActiveEntryId(null);
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'write' && !activeEntryId ? 'bg-white shadow-md text-theme' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Writing Desk
            </button>
            <button 
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-white shadow-md text-theme' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Memory Lane
            </button>
          </div>
          <button 
            onClick={() => setIsLocked(true)}
            className="p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-sm border border-slate-100 transition-all group"
            title="Lock Journal"
          >
            <Unlock className="w-5 h-5 text-slate-400 group-hover:theme-text" />
          </button>
          <button 
            onClick={handleChangePin}
            className="p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-sm border border-slate-100 transition-all group"
            title="Update Key"
          >
            <Lock className="w-5 h-5 text-slate-400 group-hover:theme-text" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'archive' ? (
            <motion.div 
              key="archive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col space-y-4"
            >
               <div className="flex flex-col gap-3 px-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Archived Memories</h4>
                    <span className="text-[10px] font-bold text-theme/60 bg-theme/5 px-2 py-0.5 rounded-full">{entries.length} Entries</span>
                  </div>
                  {/* Search Bar */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-theme transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search your memories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium outline-none focus:border-theme/30 focus:ring-4 focus:ring-theme/5 transition-all shadow-sm"
                    />
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar pb-10">
                  {entries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 pt-10">
                       <CalendarIcon className="w-12 h-12 mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest px-8">No memories recorded yet.</p>
                       <button 
                        onClick={() => setActiveTab('write')}
                        className="mt-4 text-theme font-black uppercase text-[10px] tracking-widest hover:underline"
                       >
                         Start Writing →
                       </button>
                    </div>
                  ) : (
                    entries
                      .filter(e => 
                        e.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        e.mood.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        new Date(e.timestamp).toLocaleDateString().includes(searchQuery)
                      )
                      .slice().reverse().map(entry => (
                      <div 
                        key={entry.id}
                        onClick={() => {
                          setActiveEntryId(entry.id);
                        }}
                        className={`w-full group p-5 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden cursor-pointer ${
                           activeEntryId === entry.id 
                            ? 'theme-bg text-white shadow-xl theme-border' 
                            : 'bg-white border-white hover:border-slate-100 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex flex-col">
                              <span className={`text-[10px] font-black uppercase tracking-tighter ${activeEntryId === entry.id ? 'text-white/60' : 'text-slate-300'}`}>
                                 {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <h4 className={`text-sm font-bold line-clamp-1 ${activeEntryId === entry.id ? 'text-white' : 'text-slate-800'}`}>
                                 {entry.content}
                              </h4>
                           </div>
                           <div className="text-xl">
                              {moods.find(m => m.name === entry.mood)?.icon || '✨'}
                           </div>
                        </div>
                        <div className="flex items-center justify-between">
                           <button className={`text-[9px] font-black uppercase tracking-widest ${activeEntryId === entry.id ? 'text-white/80' : 'theme-text'}`}>
                              Open This Page →
                           </button>
                           <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Burn this memory forever?')) {
                                 onDeleteEntry(entry.id);
                                 if (activeEntryId === entry.id) setActiveEntryId(null);
                              }
                            }}
                            className="p-1.5 bg-rose-50/10 hover:bg-rose-500 rounded-lg transition-all"
                          >
                             <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="desk"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <AnimatePresence mode="wait">
                {activeEntryId ? (
                   <motion.div 
                    key="view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full bg-white rounded-[3.5rem] shadow-2xl border-4 border-white flex flex-col overflow-hidden relative"
                   >
                     <div className="absolute inset-x-0 top-0 h-[10000px] pointer-events-none opacity-[0.08] z-10" 
                          style={{ background: 'repeating-linear-gradient(transparent, transparent 31px, #64748b 31px, #64748b 32px)', backgroundPosition: '0 45px' }} />
                     <div className="absolute left-16 top-0 bottom-0 w-px bg-rose-200 pointer-events-none z-20" />
                     
                     <div className="relative z-30 flex-1 flex flex-col p-8 md:p-12 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Personal Page • {activeEntry?.mood}</span>
                              <h3 className="text-2xl font-display font-black text-slate-800">
                                 {new Date(activeEntry?.timestamp || 0).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                              </h3>
                           </div>
                           <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white">
                             {moods.find(m => m.name === activeEntry?.mood)?.icon || '✨'}
                           </div>
                        </div>
                        
                        <div className="text-xl text-slate-700 leading-[32px] font-medium whitespace-pre-wrap pl-10">
                           {activeEntry?.content}
                        </div>
                     </div>
                     <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center relative z-40">
                        <button 
                          onClick={() => setActiveEntryId(null)}
                          className="px-6 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 hover:text-theme active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" /> New Entry
                        </button>
                        <button 
                          onClick={() => setActiveTab('archive')}
                          className="px-6 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 hover:text-theme active:scale-95 transition-all"
                        >
                          Archive Lane
                        </button>
                     </div>
                   </motion.div>
                ) : (
                   <motion.div 
                    key="write"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full bg-white rounded-[3.5rem] shadow-2xl border-4 border-white flex flex-col overflow-hidden relative group"
                   >
                      <div className="bg-theme/5 p-8 border-b border-theme/10 flex flex-col gap-4 relative z-40">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                             <div className="flex items-center gap-3">
                                <h4 className="text-xl font-display font-black text-slate-800 tracking-tighter whitespace-nowrap">Writing Desk</h4>
                                <div className="p-1.5 bg-white rounded-full shadow-sm">
                                  <PenTool className="w-4 h-4 text-theme" />
                                </div>
                             </div>
                             <div className="flex items-center gap-2 mt-1">
                               <input 
                                 type="date" 
                                 value={selectedDate}
                                 onChange={e => setSelectedDate(e.target.value)}
                                 className="text-[10px] font-black text-theme bg-white border border-theme/20 rounded-full px-2 py-0.5 outline-none shadow-sm cursor-pointer"
                               />
                             </div>
                          </div>
                          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[400px] custom-scrollbar scroll-smooth">
                            {moods.map((m) => (
                              <button
                                key={m.name}
                                onClick={() => setSelectedMood(m.name)}
                                className={`w-10 h-10 min-w-[40px] rounded-2xl flex items-center justify-center transition-all text-xl ${
                                  selectedMood === m.name ? 'bg-white shadow-lg scale-110 ring-2 ring-theme/10' : `opacity-40 hover:opacity-100 hover:scale-105 ${m.color}`
                                }`}
                                title={m.name}
                              >
                                {m.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
 
                      <div className="relative flex-1 bg-[#fffdfa] cursor-text custom-scrollbar group/textarea flex flex-col overflow-y-auto">
                        <div className="sticky top-0 left-0 right-0 z-40 h-10 bg-gradient-to-b from-[#fffdfa] to-transparent pointer-events-none" />
                        
                        {!editorContent && (
                           <div className="absolute inset-x-0 top-32 z-40 flex flex-col items-center justify-center pointer-events-none p-10 text-center opacity-40 group-hover/textarea:opacity-60 transition-opacity">
                              <Sparkles className="w-12 h-12 text-amber-200 mb-4" />
                              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Today's story starts here...</p>
                           </div>
                        )}
                        
                        <div className="absolute inset-x-0 top-0 h-[10000px] pointer-events-none opacity-[0.08] z-10" 
                             style={{ background: 'repeating-linear-gradient(transparent, transparent 31px, #64748b 31px, #64748b 32px)', backgroundPosition: '0 45px' }} />
                        <div className="absolute left-16 top-0 bottom-0 w-px bg-rose-200 pointer-events-none z-20" />
                        
                        <textarea 
                          id="diary-content-input"
                          value={editorContent}
                          onChange={e => setEditorContent(e.target.value)}
                          placeholder=""
                          className="w-full min-h-full bg-transparent border-none outline-none text-xl text-slate-700 leading-[32px] font-medium resize-none relative z-30 pt-4 pl-20 pr-10 box-border block focus:ring-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
 
                      <div className="p-6 bg-slate-50 flex justify-end relative z-40 border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                         <button 
                           onClick={handleSave}
                           disabled={!editorContent.trim()}
                           className="px-10 py-4 theme-bg text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-theme/30 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
                         >
                           <Save className="w-4 h-4" /> Save Secret Entry
                         </button>
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
