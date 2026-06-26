/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Target, Zap, Brain, Bird, ChevronRight, RefreshCw, Star, Heart as HeartIcon } from 'lucide-react';

interface MiniGamesProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type GameType = 'none' | 'catch' | 'clicker' | 'memory' | 'flappy' | 'snake' | 'word';

/**
 * Simple Audio Utility
 */
const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
  try {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

/**
 * Visual Juice: Particles
 */
function Particles({ x, y, color = '#fb7185' }: { x: number, y: number, color?: string, key?: any }) {
  const particles = Array.from({ length: 8 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x, y, opacity: 1, scale: 1 }}
          animate={{ 
            x: x + (Math.random() - 0.5) * 100, 
            y: y + (Math.random() - 0.5) * 100,
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export function MiniGames({ onClose, onComplete }: MiniGamesProps) {
  const [game, setGame] = useState<GameType>('none');
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pet-arcade-scores');
    return saved ? JSON.parse(saved) : {};
  });
  
  const saveHighScore = (gameType: string, score: number) => {
    setHighScores(prev => {
      const next = { ...prev, [gameType]: Math.max(prev[gameType] || 0, score) };
      localStorage.setItem('pet-arcade-scores', JSON.stringify(next));
      return next;
    });
  };

  if (game === 'none') {
    return (
      <div className="p-8 bg-white rounded-[3rem] shadow-2xl border-8 border-indigo-100 flex flex-col gap-6 items-center w-full max-w-md pointer-events-auto">
        <div className="text-center space-y-2">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl mb-2"
          >
            🕹️
          </motion.div>
          <h3 className="text-3xl font-display font-bold text-slate-800">Arcade</h3>
          <p className="text-sm text-slate-500 font-medium px-4">Focus hard, play harder. Level up your pet!</p>
        </div>
        
        <div className="grid grid-cols-1 w-full gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <GameButton 
            icon={<Target />} 
            title="Catch the Hearts" 
            desc="Fast Reaction" 
            color="bg-pink-500" 
            highScore={highScores['catch']}
            onClick={() => setGame('catch')} 
          />
          <GameButton 
            icon={<Zap />} 
            title="Pet Clicker" 
            desc="Speed Tapping" 
            color="bg-yellow-500" 
            highScore={highScores['clicker']}
            onClick={() => setGame('clicker')} 
          />
          <GameButton 
            icon={<Brain />} 
            title="Memory Match" 
            desc="Brain Training" 
            color="bg-indigo-500" 
            highScore={highScores['memory']}
            onClick={() => setGame('memory')} 
          />
          <GameButton 
            icon={<Bird />} 
            title="Flappy Pet" 
            desc="Don't Crash!" 
            color="bg-emerald-500" 
            highScore={highScores['flappy']}
            onClick={() => setGame('flappy')} 
          />
          <GameButton 
            icon={<RefreshCw />} 
            title="Snake Pet" 
            desc="Keep Growing" 
            color="bg-orange-500" 
            highScore={highScores['snake']}
            onClick={() => setGame('snake')} 
          />
          <GameButton 
            icon={<Star />} 
            title="Word Scramble" 
            desc="Spelling Bee" 
            color="bg-rose-500" 
            highScore={highScores['word']}
            onClick={() => setGame('word')} 
          />
        </div>

        <button onClick={onClose} className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest mt-2 border-2 border-slate-100">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleComplete = (score: number) => {
    saveHighScore(game as string, score);
    onComplete(score);
    setGame('none');
  };

  return (
    <div className="relative pointer-events-auto">
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setGame('none')}
        className="absolute -top-16 right-0 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-xl z-50 border border-white/30"
      >
        <X className="w-6 h-6" />
      </motion.button>
      
      <AnimatePresence mode="wait">
        <motion.div
           key={game}
           initial={{ opacity: 0, scale: 0.8, y: 50 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.8, y: -50 }}
           transition={{ type: 'spring', damping: 15 }}
        >
          {game === 'catch' && <CatchHeartsGame onComplete={handleComplete} />}
          {game === 'clicker' && <PetClickerGame onComplete={handleComplete} />}
          {game === 'memory' && <MemoryMatchGame onComplete={handleComplete} />}
          {game === 'flappy' && <FlappyPetGame onComplete={handleComplete} />}
          {game === 'snake' && <SnakePetGame onComplete={handleComplete} />}
          {game === 'word' && <WordUnscrambleGame onComplete={handleComplete} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function GameButton({ icon, title, desc, color, onClick, highScore }: any) {
  return (
    <button 
      onClick={onClick}
      className="group p-4 bg-slate-50 hover:bg-white hover:shadow-xl hover:scale-[1.02] rounded-[2rem] flex items-center gap-4 transition-all border-2 border-transparent hover:border-slate-100"
    >
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div className="text-left flex-1">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-700 leading-none">{title}</p>
          {highScore > 0 && (
            <span className="text-[9px] font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">
               BEST: {highScore}
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{desc}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

// GAME 1: Catch Hearts (Refined)
function CatchHeartsGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [items, setItems] = useState<{ id: number, x: number, y: number, type: 'heart' | 'star' }[]>([]);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, color: string }[]>([]);
  const [combo, setCombo] = useState(0);
  const comboTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    const spawn = setInterval(() => {
      const type = Math.random() > 0.9 ? 'star' : 'heart';
      setItems(prev => [...prev, { 
        id: Date.now(), 
        x: Math.random() * 80 + 10, 
        y: Math.random() * 80 + 10,
        type
      }]);
    }, 600);
    return () => { 
      clearInterval(timer); 
      clearInterval(spawn); 
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) onComplete(score);
  }, [timeLeft, score, onComplete]);

  const handleCatch = (item: any) => {
    playSound(item.type === 'star' ? 880 : 440, 'triangle', 0.15);
    const points = item.type === 'star' ? 50 : 10;
    setScore(s => s + points * (Math.floor(combo / 5) + 1));
    setCombo(c => c + 1);
    
    if (comboTimeout.current) clearTimeout(comboTimeout.current);
    (comboTimeout.current as any) = setTimeout(() => setCombo(0), 1000);

    setParticles(prev => [...prev, { id: Date.now(), x: item.x, y: item.y, color: item.type === 'star' ? '#f59e0b' : '#ec4899' }]);
    setItems(prev => prev.filter(i => i.id !== item.id));
    setTimeout(() => setParticles(prev => prev.slice(1)), 600);
  };

  return (
    <div className="w-80 h-[450px] bg-white rounded-[3rem] overflow-hidden border-8 border-pink-100 shadow-2xl p-8 flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400 w-6 h-6" />
          <span className="font-display font-bold text-slate-700 text-2xl">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs font-bold font-mono bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-200">
            {timeLeft}s
          </div>
          {combo > 1 && (
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="text-[10px] font-black text-pink-500 mt-1 uppercase"
            >
              Combo x{combo}!
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden">
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${item.type === 'star' ? 'bg-yellow-400 shadow-yellow-200' : 'bg-pink-500 shadow-pink-200'}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={() => handleCatch(item)}
            >
              {item.type === 'star' ? '⭐' : '❤️'}
            </motion.button>
          ))}
        </AnimatePresence>
        
        {particles.map(p => (
          <Particles key={p.id} x={p.x * 3.2} y={p.y * 3} color={p.color} />
        ))}
      </div>
      <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest mt-4">Multipliers every 5 catches!</p>
    </div>
  );
}

// GAME 2: Pet Clicker
function PetClickerGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [clicks, setClicks] = useState<{ id: number, x: number, y: number, text: string }[]>([]);
  const [isFrenzy, setIsFrenzy] = useState(false);
  const clickCount = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) onComplete(score);
  }, [timeLeft, score, onComplete]);

  useEffect(() => {
    if (clickCount.current > 5) {
      setIsFrenzy(true);
      setTimeout(() => {
        setIsFrenzy(false);
        clickCount.current = 0;
      }, 2000);
    }
  }, [score]);

  const handleClick = (e: React.MouseEvent) => {
    playSound(isFrenzy ? 880 : 440, 'square', 0.05);
    const multiplier = isFrenzy ? 2 : 1;
    setScore(s => s + multiplier);
    clickCount.current++;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClicks(prev => [...prev, { id: Date.now(), x, y, text: `+${multiplier}` }]);
    setTimeout(() => setClicks(prev => prev.slice(1)), 500);
  };

  return (
    <div className={`w-80 h-[450px] bg-white rounded-[3rem] overflow-hidden border-8 transition-colors duration-300 ${isFrenzy ? 'border-orange-400 bg-orange-50' : 'border-yellow-100'} shadow-2xl p-8 flex flex-col relative`}>
      <GameHeader score={score} timeLeft={timeLeft} icon={<Zap className={`${isFrenzy ? 'text-orange-500 animate-bounce' : 'text-yellow-500'}`} />} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {isFrenzy && (
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1.2 }}
            className="text-orange-600 font-black text-xs uppercase bg-orange-200 px-3 py-1 rounded-full animate-pulse"
          >
            🔥 FRENZY x2 🔥
          </motion.div>
        )}
        <motion.button
          whileTap={{ scale: 1.3, rotate: 15 }}
          onClick={handleClick}
          className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center text-5xl relative transition-colors ${isFrenzy ? 'bg-orange-400 shadow-orange-300' : 'bg-yellow-400 shadow-yellow-200'}`}
        >
          {isFrenzy ? '🤩' : '🦊'}
          <AnimatePresence>
            {clicks.map(c => (
              <motion.span
                key={c.id}
                initial={{ opacity: 1, y: 0, x: (Math.random() - 0.5) * 40 }}
                animate={{ opacity: 0, y: -80 }}
                className={`absolute font-black text-xl ${isFrenzy ? 'text-orange-600' : 'text-yellow-600'}`}
                style={{ top: 0 }}
              >
                {c.text}
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.button>
        <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-widest mt-2">
          {isFrenzy ? 'CLICK FAST!!!' : 'TICKLE THE PET!'}
        </p>
      </div>
    </div>
  );
}

// GAME 3: Memory Match
function MemoryMatchGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const emojis = ['🐶', '🐱', '🐹', '🐰', '🦊', '🐻', '🐶', '🐱', '🐹', '🐰', '🦊', '🐻'];

  useEffect(() => {
    const shuffled = emojis
      .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;
    
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);
    
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        playSound(660, 'sine', 0.2);
        setScore(s => s + 100);
        setTimeout(() => {
          setCards(prev => {
            const matchedCards = prev.map(c => 
              (c.id === newFlipped[0] || c.id === newFlipped[1]) ? { ...c, matched: true } : c
            );
            if (matchedCards.every(c => c.matched)) onComplete(score + 100);
            return matchedCards;
          });
          setFlipped([]);
        }, 500);
      } else {
        playSound(220, 'sawtooth', 0.1);
        setShakeId(id);
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === newFlipped[0] || c.id === newFlipped[1]) ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
          setShakeId(null);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-80 h-[450px] bg-white rounded-[3rem] overflow-hidden border-8 border-indigo-100 shadow-2xl p-8 flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <Brain className="text-indigo-500 w-6 h-6" />
           <h4 className="font-display font-bold text-indigo-700">Pairs Match</h4>
        </div>
        <div className="bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          <span className="text-xl font-bold font-mono text-indigo-500">{score}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 flex-1">
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={shakeId === card.id ? { x: [-5, 5, -5, 5, 0] } : {}}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-2xl text-3xl transition-all duration-300 flex items-center justify-center border-4 ${
              card.flipped || card.matched ? 'bg-indigo-50 border-white rotate-0' : 'bg-indigo-500 border-indigo-400 rotate-180'
            } shadow-lg`}
          >
            {(card.flipped || card.matched) ? card.emoji : '❓'}
          </motion.button>
        ))}
      </div>
      <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest mt-4">Find all matching pairs!</p>
    </div>
  );
}

// GAME 4: Flappy Pet
function FlappyPetGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [birdPos, setBirdPos] = useState(50);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number, hole: number, passed: boolean }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);

  const GRAVITY = 0.4;
  const JUMP_FORCE = -7;
  const BIRD_X = 12.5; // left-10 on 320px width is roughly 12.5%
  const BIRD_WIDTH = 10;
  const PIPE_WIDTH = 15;

  useEffect(() => {
    if (gameOver) return;
    const gameLoop = setInterval(() => {
      setBirdPos(pos => {
        const newPos = pos + birdVelocity;
        if (newPos > 92 || newPos < 0) {
          triggerGameOver();
          return pos;
        }
        return newPos;
      });
      setBirdVelocity(v => v + GRAVITY);
      
      setPipes(prev => {
        let next = prev.map(p => ({ ...p, x: p.x - 1.5 })).filter(p => p.x > -20);
        
        if (next.length === 0 || next[next.length - 1].x < 55) {
          next.push({ x: 100, hole: Math.random() * 40 + 15, passed: false });
        }

        // Collision logic
        next.forEach(pipe => {
          // Horizontal overlap
          if (pipe.x < BIRD_X + BIRD_WIDTH && pipe.x + PIPE_WIDTH > BIRD_X) {
            // Vertical overlap (NOT in hole)
            if (birdPos < pipe.hole || birdPos + 8 > pipe.hole + 30) {
              triggerGameOver();
            }
          }
          
          // Score logic
          if (!pipe.passed && pipe.x < BIRD_X) {
            pipe.passed = true;
            setScore(s => s + 1);
          }
        });

        return next;
      });
    }, 24);
    return () => clearInterval(gameLoop);
  }, [birdVelocity, gameOver, birdPos]);

  const triggerGameOver = () => {
    playSound(110, 'sawtooth', 0.3);
    setGameOver(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => onComplete(score), 1000);
    }
  }, [gameOver, score, onComplete]);

  return (
    <motion.div 
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      className="w-80 h-[450px] bg-gradient-to-b from-sky-400 to-sky-200 rounded-[3rem] overflow-hidden border-8 border-emerald-100 shadow-2xl relative cursor-pointer"
      onClick={() => {
        if (!gameOver) {
          playSound(330, 'triangle', 0.1);
          setBirdVelocity(JUMP_FORCE);
        }
      }}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-black text-2xl shadow-sm">
        {score}
      </div>
      
      {/* Bird */}
      <motion.div 
        className="absolute left-10 w-10 h-10 text-3xl flex items-center justify-center z-10"
        style={{ top: `${birdPos}%` }}
        animate={{ rotate: birdVelocity * 3 }}
      >
        {gameOver ? '😵' : '🐥'}
      </motion.div>

      {/* Pipes */}
      {pipes.map((pipe, i) => (
        <React.Fragment key={i}>
          <div className="absolute w-12 bg-emerald-500 border-x-4 border-emerald-600 rounded-b-xl shadow-lg" style={{ left: `${pipe.x}%`, top: 0, height: `${pipe.hole}%` }}>
             <div className="absolute bottom-0 w-14 -left-1 h-4 bg-emerald-400 rounded-full" />
          </div>
          <div className="absolute w-12 bg-emerald-500 border-x-4 border-emerald-600 rounded-t-xl shadow-lg" style={{ left: `${pipe.x}%`, top: `${pipe.hole + 30}%`, bottom: 0 }}>
             <div className="absolute top-0 w-14 -left-1 h-4 bg-emerald-400 rounded-full" />
          </div>
        </React.Fragment>
      ))}

      <div className="absolute bottom-6 inset-x-0 text-center">
        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Tap to Fly</p>
      </div>
      
      {gameOver && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-30"
        >
          <div className="bg-white p-6 rounded-[2rem] text-center shadow-2xl animate-bounce">
            <h3 className="text-2xl font-black text-slate-800">GAME OVER!</h3>
            <p className="text-slate-500 font-bold">SCORE: {score}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// GAME 5: Snake Pet
function SnakePetGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(150);

  const GRID_SIZE = 20;

  useEffect(() => {
    if (gameOver) return;
    const move = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          playSound(550, 'sine', 0.1);
          setScore(s => s + 10);
          setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
          if (score > 0 && score % 50 === 0) setSpeed(s => Math.max(80, s - 10));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, speed);
    return () => clearInterval(move);
  }, [dir, food, gameOver, speed, score]);

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => onComplete(score), 1000);
    }
  }, [gameOver, score, onComplete]);

  return (
    <div className="w-80 h-[450px] bg-slate-900 rounded-[3rem] overflow-hidden border-8 border-orange-100 shadow-2xl p-6 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-orange-500 uppercase">Snake Pet</span>
          <span className="font-mono text-white text-2xl font-bold leading-none">{score}</span>
        </div>
        <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
           <span className="text-[10px] font-bold text-slate-400">SPEED: {Math.floor(200 - speed)}</span>
        </div>
      </div>
      
      <div className="relative w-full aspect-square bg-slate-800 rounded-2xl overflow-hidden grid grid-cols-20 grid-rows-20 border-4 border-slate-700 shadow-inner">
        {snake.map((s, i) => (
          <motion.div 
            key={i} 
            layout
            className={`rounded-sm ${i === 0 ? 'bg-orange-400 z-10' : 'bg-orange-600'}`} 
            style={{ gridColumnStart: s.x + 1, gridRowStart: s.y + 1 }} 
          >
            {i === 0 && <div className="w-full h-full flex items-center justify-center text-[6px]">👀</div>}
          </motion.div>
        ))}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
          style={{ gridColumnStart: food.x + 1, gridRowStart: food.y + 1 }} 
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        <div />
        <button onClick={() => setDir({ x: 0, y: -1 })} className="w-12 h-12 bg-slate-700 hover:bg-slate-600 active:scale-90 rounded-2xl text-white shadow-lg transition-all">↑</button>
        <div />
        <button onClick={() => setDir({ x: -1, y: 0 })} className="w-12 h-12 bg-slate-700 hover:bg-slate-600 active:scale-90 rounded-2xl text-white shadow-lg transition-all">←</button>
        <button onClick={() => setDir({ x: 0, y: 1 })} className="w-12 h-12 bg-slate-700 hover:bg-slate-600 active:scale-90 rounded-2xl text-white shadow-lg transition-all">↓</button>
        <button onClick={() => setDir({ x: 1, y: 0 })} className="w-12 h-12 bg-slate-700 hover:bg-slate-600 active:scale-90 rounded-2xl text-white shadow-lg transition-all">→</button>
      </div>

      {gameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-x-8 top-[30%] bg-white p-6 rounded-[2rem] text-center shadow-2xl z-20 border-4 border-orange-200"
        >
          <h3 className="text-xl font-black text-slate-800">CRASHED!</h3>
          <p className="text-sm font-bold text-slate-400">MUCH SCORE: {score}</p>
        </motion.div>
      )}
    </div>
  );
}

// GAME 6: Word Unscramble
function WordUnscrambleGame({ onComplete }: { onComplete: (score: number) => void }) {
  const WORDS = ['PIXEL', 'FRIEND', 'HAPPY', 'GAMER', 'PET', 'LOVELY', 'BUDDY', 'SMILE'];
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const nextWord = useCallback(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setScrambled(w.split('').sort(() => Math.random() - 0.5).join(''));
    setInput('');
    setFeedback('none');
  }, []);

  useEffect(() => {
    nextWord();
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [nextWord]);

  useEffect(() => {
    if (timeLeft <= 0) onComplete(score);
  }, [timeLeft, score, onComplete]);

  const check = () => {
    if (input.toUpperCase() === word) {
      playSound(770, 'sine', 0.2);
      setScore(s => s + 50);
      setFeedback('correct');
      setTimeout(nextWord, 800);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 500);
    }
  };

  return (
    <div className="w-80 h-[450px] bg-white rounded-[3rem] overflow-hidden border-8 border-rose-100 shadow-2xl p-8 flex flex-col relative">
      <GameHeader score={score} timeLeft={timeLeft} icon={<Star className={`${feedback === 'correct' ? 'animate-spin text-rose-500' : 'text-rose-400'}`} />} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div 
          key={scrambled}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-display font-black text-rose-500 tracking-widest bg-rose-50 px-6 py-4 rounded-[2rem] border-4 border-rose-100 shadow-inner"
        >
          {scrambled}
        </motion.div>
        <motion.input 
          animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          className={`w-full border-4 rounded-2xl px-4 py-4 text-center font-bold text-xl uppercase outline-none transition-all duration-300
            ${feedback === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 
              feedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-600' : 
              'border-slate-100 bg-slate-50 focus:border-rose-400'}`}
          placeholder="UNSCRAMBLE ME!"
          autoFocus
        />
        <button 
          onClick={check}
          className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {feedback === 'correct' ? 'CORRECT! ✨' : 'CHECK WORD'}
        </button>
      </div>
    </div>
  );
}

function GameHeader({ score, timeLeft, icon = <Trophy className="text-yellow-400" /> }: any) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-display font-bold text-slate-700 text-2xl">{score}</span>
      </div>
      <div className="text-xs font-bold font-mono bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl border border-slate-200">
        {timeLeft}s
      </div>
    </div>
  );
}
