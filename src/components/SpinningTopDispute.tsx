import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { sound } from '../utils/sound';
import { RotateCw, Trophy, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  teams: Team[];
  onDisputeResolved: (winnerTeamId: number, passedToTeamId?: number) => void;
  questionNumber: number;
}

interface TopState {
  spinning: boolean;
  angle: number;
  speed: number;
  spinTimeMs: number;
  totalDurationMs: number;
  stopped: boolean;
  wobble: number;
}

export const SpinningTopDispute: React.FC<Props> = ({ teams, onDisputeResolved, questionNumber }) => {
  const [topStates, setTopStates] = useState<{ [id: number]: TopState }>({});
  const [isDisputing, setIsDisputing] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);
  const [decisionStep, setDecisionStep] = useState<'spin' | 'choose'>('spin');
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize top states
  useEffect(() => {
    const initial: { [id: number]: TopState } = {};
    teams.forEach(t => {
      initial[t.id] = {
        spinning: false,
        angle: 0,
        speed: 0,
        spinTimeMs: 0,
        totalDurationMs: 0,
        stopped: true,
        wobble: 0
      };
    });
    setTopStates(initial);
  }, [teams]);

  // Spin All Tops
  const startSpinAll = () => {
    sound.playSpinSound();
    setIsDisputing(true);
    setWinnerTeam(null);
    setDecisionStep('spin');

    // Generate random durations for each team with close competition (4500ms to 9000ms)
    // Guarantee no exact ties
    const baseDurations = [5000, 5800, 6600, 7400].sort(() => Math.random() - 0.5);
    const newStates: { [id: number]: TopState } = {};

    teams.forEach((t, i) => {
      const jitter = Math.floor(Math.random() * 1400);
      const totalDur = baseDurations[i] + jitter;
      newStates[t.id] = {
        spinning: true,
        angle: Math.random() * 360,
        speed: 25 + Math.random() * 10,
        spinTimeMs: 0,
        totalDurationMs: totalDur,
        stopped: false,
        wobble: 0
      };
    });

    setTopStates(newStates);
    lastTimeRef.current = performance.now();
  };

  // Spin single top for a team representative
  const spinSingle = (teamId: number) => {
    sound.playSpinSound();
    setTopStates(prev => {
      const current = prev[teamId];
      if (current?.spinning) return prev;
      const totalDur = 4500 + Math.floor(Math.random() * 3500);
      return {
        ...prev,
        [teamId]: {
          spinning: true,
          angle: Math.random() * 360,
          speed: 28,
          spinTimeMs: 0,
          totalDurationMs: totalDur,
          stopped: false,
          wobble: 0
        }
      };
    });
    setIsDisputing(true);
    lastTimeRef.current = performance.now();
  };

  // Animation Loop for realistic rotation and physics
  useEffect(() => {
    if (!isDisputing) return;

    const updatePhysics = (time: number) => {
      const delta = (time - (lastTimeRef.current || time)) / 1000;
      lastTimeRef.current = time;

      let allStopped = true;
      let longestDuration = 0;
      let currentWinnerId: number | null = null;

      setTopStates(prev => {
        const next = { ...prev };

        teams.forEach(t => {
          const state = next[t.id];
          if (!state) return;

          if (state.spinning) {
            allStopped = false;
            const newSpinTime = state.spinTimeMs + (delta * 1000);
            const progress = newSpinTime / state.totalDurationMs;

            if (progress >= 1) {
              // Peão parou!
              next[t.id] = {
                ...state,
                spinning: false,
                stopped: true,
                speed: 0,
                wobble: 25 // Tombou
              };
              sound.playTone(180, 0.15, 'sawtooth', 0.05);
            } else {
              // Still spinning: decelerate gradually and increase wobble near the end
              const remainingFactor = Math.max(0, 1 - progress);
              const speed = Math.max(0.5, state.speed * Math.pow(remainingFactor, 0.4));
              const wobble = progress > 0.75 ? Math.sin(time / 40) * (progress * 18) : Math.sin(time / 100) * 3;

              next[t.id] = {
                ...state,
                angle: (state.angle + speed * 15) % 360,
                speed,
                spinTimeMs: newSpinTime,
                wobble
              };
            }
          }

          if (state.totalDurationMs > longestDuration) {
            longestDuration = state.totalDurationMs;
            currentWinnerId = t.id;
          }
        });

        return next;
      });

      if (allStopped) {
        setIsDisputing(false);
        if (currentWinnerId) {
          const winTeam = teams.find(t => t.id === currentWinnerId) || null;
          setWinnerTeam(winTeam);
          setDecisionStep('choose');
          sound.playCorrect();
        }
      } else {
        animRef.current = requestAnimationFrame(updatePhysics);
      }
    };

    animRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isDisputing, teams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-6xl mx-auto p-4 animate-fade-in">
      {/* Dynamic Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-kahoot-purple/60 border border-purple-400 text-purple-200 text-sm font-semibold mb-2">
          <RotateCw className="w-4 h-4 animate-spin-slow" />
          Pergunta #{questionNumber} • Disputa do Peão Tradicional
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          Quem roda o peão por mais tempo?
        </h2>
        <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mt-2">
          O representante da equipe cujo peão parar por <strong>último</strong> ganha o direito de <strong>responder</strong> ou <strong>passar</strong> a pergunta para os adversários!
        </p>
      </div>

      {/* Tops Arena */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mb-8">
        {teams.map(team => {
          const state = topStates[team.id] || { spinning: false, angle: 0, spinTimeMs: 0, totalDurationMs: 0, stopped: true, wobble: 0 };
          const seconds = (state.spinTimeMs / 1000).toFixed(1);
          const isWinner = winnerTeam?.id === team.id;

          return (
            <div
              key={team.id}
              className={`relative flex flex-col items-center p-5 rounded-2xl border-4 transition-all duration-300 shadow-xl ${
                isWinner
                  ? 'border-yellow-400 bg-yellow-950/40 scale-105 ring-4 ring-yellow-400/50 shadow-yellow-500/20'
                  : team.borderClass + ' bg-slate-800/80'
              }`}
            >
              {/* Winner Badge */}
              {isWinner && (
                <div className="absolute -top-3.5 bg-yellow-400 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                  <Trophy className="w-3.5 h-3.5 fill-current" /> Vencedor do Peão!
                </div>
              )}

              {/* Team Name & Badge */}
              <div className="flex flex-col items-center gap-1 mb-2 w-full">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${team.bgClass}`} />
                  <h3 className="font-extrabold text-white text-base md:text-lg text-center truncate">
                    {team.name}
                  </h3>
                </div>
                {/* Active Representative or Members */}
                {team.participants.length > 0 && (
                  <div className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1 truncate max-w-full">
                    <span>{team.participants[(questionNumber - 1) % team.participants.length].avatar}</span>
                    <span className="truncate">Girando: {team.participants[(questionNumber - 1) % team.participants.length].name}</span>
                  </div>
                )}
              </div>

              {/* Peão SVG / Canvas Graphic */}
              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                {/* Surface Shadow */}
                <div 
                  className="absolute bottom-2 w-20 h-4 bg-black/40 rounded-full blur-sm transition-transform duration-100"
                  style={{
                    transform: state.spinning ? 'scale(1.1)' : 'scale(0.8)',
                    opacity: state.stopped ? 0.3 : 0.7
                  }}
                />

                {/* Spinning Top Graphic with 3D tilt & rotation */}
                <div
                  className="transition-transform duration-75 select-none"
                  style={{
                    transform: `rotate(${state.angle}deg) rotateZ(${state.wobble}deg) scale(${state.spinning ? 1.05 : 1})`,
                    transformOrigin: '50% 85%'
                  }}
                >
                  <svg width="100" height="110" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Stem of top */}
                    <rect x="46" y="2" width="8" height="22" rx="4" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
                    <circle cx="50" cy="5" r="5" fill="#F59E0B" />
                    
                    {/* Upper body */}
                    <path
                      d="M10 40 C 20 22, 80 22, 90 40 L 80 50 L 20 50 Z"
                      fill={team.bgClass.replace('bg-', '') === 'kahoot-red' ? '#E21B3C' :
                            team.bgClass.replace('bg-', '') === 'kahoot-blue' ? '#1368CE' :
                            team.bgClass.replace('bg-', '') === 'kahoot-yellow' ? '#D89E00' : '#26890C'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />

                    {/* Grooves / stripes for spin sensation */}
                    <ellipse cx="50" cy="40" rx="36" ry="9" fill="#FFFFFF" fillOpacity="0.25" />
                    <line x1="20" y1="40" x2="80" y2="40" stroke="#F8FAFC" strokeWidth="2" strokeDasharray="6 4" />

                    {/* Lower cone */}
                    <polygon
                      points="20,50 80,50 50,102"
                      fill={team.bgClass.replace('bg-', '') === 'kahoot-red' ? '#991B1B' :
                            team.bgClass.replace('bg-', '') === 'kahoot-blue' ? '#1E40AF' :
                            team.bgClass.replace('bg-', '') === 'kahoot-yellow' ? '#92400E' : '#166534'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />

                    {/* Center Tip */}
                    <circle cx="50" cy="103" r="3.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Spinning Blur Effect Ring */}
                {state.spinning && (
                  <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full animate-spin pointer-events-none" />
                )}
              </div>

              {/* Status / Stopwatch */}
              <div className="text-center mt-2 w-full">
                <div className="text-2xl font-black font-mono text-white">
                  {seconds}s
                </div>
                <div className="text-xs uppercase font-bold tracking-wider mt-0.5 text-slate-400">
                  {state.spinning ? (
                    <span className="text-emerald-400 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Rodando...
                    </span>
                  ) : state.stopped && state.spinTimeMs > 0 ? (
                    <span className="text-slate-400">Parou!</span>
                  ) : (
                    <span>Aguardando giro</span>
                  )}
                </div>
              </div>

              {/* Individual Spin Button */}
              {!isDisputing && decisionStep === 'spin' && (
                <button
                  onClick={() => spinSingle(team.id)}
                  className="mt-3 w-full py-1.5 px-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-xs font-bold rounded-lg text-white transition flex items-center justify-center gap-1 shadow"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rodar Peão
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Zone */}
      {decisionStep === 'spin' && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={startSpinAll}
            disabled={isDisputing}
            className={`px-8 py-4 rounded-2xl font-black text-xl text-white shadow-2xl transition transform active:scale-95 flex items-center gap-3 ${
              isDisputing
                ? 'bg-slate-700 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:brightness-110 ring-4 ring-purple-400/40 animate-pulse'
            }`}
          >
            <RotateCw className={`w-6 h-6 ${isDisputing ? 'animate-spin' : ''}`} />
            {isDisputing ? 'Peões em Disputa na Mesa...' : 'GIRAR TODOS OS PEÕES JUNTOS! 🎯'}
          </button>
        </div>
      )}

      {/* Winner Decision Modal / Step: Responder ou Passar */}
      {decisionStep === 'choose' && winnerTeam && (
        <div className="w-full max-w-2xl bg-slate-800/95 border-2 border-yellow-400 rounded-2xl p-6 shadow-2xl text-center animate-bounce-short">
          <div className="inline-flex items-center gap-2 text-yellow-400 font-black text-lg mb-2 uppercase tracking-wide">
            <Trophy className="w-6 h-6" /> O Peão de {winnerTeam.name} parou por último!
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Qual é a estratégia da {winnerTeam.name}?
          </h3>
          <p className="text-slate-300 text-sm mb-6">
            O representante da equipe pode escolher <strong>responder agora</strong> para tentar ganhar os 1000 pontos e o brinde, ou <strong>passar estrategicamente</strong> para uma equipe rival!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Option 1: Responder */}
            <button
              onClick={() => onDisputeResolved(winnerTeam.id)}
              className="py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              Nós vamos responder!
            </button>

            {/* Option 2: Passar para outra equipe */}
            <div className="relative group">
              <button
                className="w-full py-4 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-105 active:scale-95"
              >
                <ShieldAlert className="w-5 h-5" />
                Passar para outra equipe ▼
              </button>
              
              {/* Dropdown list of rivals to pass to */}
              <div className="hidden group-hover:flex flex-col gap-1.5 absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-amber-400/40 rounded-xl p-2 z-20 shadow-2xl">
                <span className="text-xs text-amber-300 font-semibold px-2 py-1">Escolha a equipe adversária:</span>
                {teams.filter(t => t.id !== winnerTeam.id).map(rival => (
                  <button
                    key={rival.id}
                    onClick={() => onDisputeResolved(winnerTeam.id, rival.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-amber-700 text-white font-bold text-sm text-left transition"
                  >
                    <span>{rival.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
