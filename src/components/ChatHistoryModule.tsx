/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Calendar as CalendarIcon, MessageSquare, ChevronLeft, Search, Trash2, Clock } from 'lucide-react';
import { ChatHistoryItem, Message } from '../types';

interface ChatHistoryModuleProps {
  history: ChatHistoryItem[];
  onDeleteSession: (id: string) => void;
  config: any;
  onClose?: () => void;
}

export const ChatHistoryModule = ({ history, onDeleteSession, config, onClose }: ChatHistoryModuleProps) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(h => {
    if (!searchQuery) return true;
    const dateStr = new Date(h.timestamp).toLocaleDateString().toLowerCase();
    const messageContent = h.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return dateStr.includes(searchQuery.toLowerCase()) || messageContent;
  }).reverse();

  const activeSession = history.find(h => h.id === activeSessionId);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {onClose && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white rounded-xl flex items-center gap-2 text-slate-500 hover:text-theme shadow-sm border border-slate-100 transition-all font-black uppercase text-[10px] tracking-widest shrink-0"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex items-center gap-4">
            {activeSessionId && (
              <button 
                onClick={() => setActiveSessionId(null)}
                className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-slate-400" />
              </button>
            )}
            <div className="flex flex-col">
              <h3 className="text-3xl font-display font-black text-slate-800 tracking-tighter flex items-center gap-2">
                {activeSessionId ? 'Relive Moments' : 'Pet Chronicles'} <History className="w-6 h-6 theme-text" />
              </h3>
              {!activeSessionId && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your past conversations</p>}
            </div>
          </div>
        </div>
      </div>

      {!activeSessionId && (
        <div className="px-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:theme-text transition-colors" />
            <input 
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:theme-border shadow-sm transition-all"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
        {activeSessionId ? (
          <div className="space-y-4 pb-8 px-2">
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 mb-6">
               <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 theme-text" />
                  <span className="text-xs font-black text-slate-800">
                    {new Date(activeSession?.timestamp || 0).toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
               </div>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                 {activeSession?.messages.length} Messages
               </span>
            </div>

            <div className="space-y-4">
              {activeSession?.messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : ''}`}>
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'theme-bg text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-50 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1 px-2">
                    {msg.role === 'user' ? 'Me' : config.characterName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 pb-10">
            {filteredHistory.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MessageSquare className="w-8 h-8 text-slate-200" />
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No chat history found</p>
              </div>
            ) : (
              filteredHistory.map(session => (
                <button 
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-100 text-left hover:shadow-xl hover:shadow-theme/5 hover:-translate-y-1 transition-all flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                        {new Date(session.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="p-1 px-2 bg-slate-50 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">
                       {session.messages.length} msg
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-relaxed h-[40px]">
                      {session.messages[0]?.content || "No messages"}
                    </p>
                  </div>

                  <div className="mt-auto pt-2 flex items-center justify-between relative z-10">
                     <span className="text-[9px] font-black theme-text uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open Log →</span>
                     <button 
                       onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this chat log?')) onDeleteSession(session.id);
                       }}
                       className="p-1 hover:text-rose-500 text-slate-200 transition-colors"
                     >
                        <Trash2 className="w-3 h-3" />
                     </button>
                  </div>
                  
                  <div className="absolute right-0 top-0 w-24 h-24 bg-theme/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 group-hover:bg-theme/10" />
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
