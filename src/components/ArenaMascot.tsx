import React, { useState } from 'react';
import { sound } from '../utils/sound';

export type MascotMood = 'idle' | 'typing' | 'hiding' | 'peeking' | 'happy' | 'error';

interface Props {
  mood: MascotMood;
  lookOffset?: number; // -8 to +8 based on typed text length
  speechText?: string;
  compact?: boolean;
  onInteract?: () => void;
}

const FUN_QUOTES = [
  'Bora ver quem leva as balas e chocolates hoje! 🍬🍫',
  'Dica de mestre: responda rápido pra ganhar bônus de velocidade! ⚡',
  'Já escolheu o nome da sua equipe ou vai jogar no modo solo? 🎯',
  'Cuidado com a pergunta final... ela vale pontos em dobro! 🔥',
  'Psiu! Use o 50:50 quando a dúvida bater forte! 🦊',
];

export const ArenaMascot: React.FC<Props> = ({
  mood,
  lookOffset = 0,
  speechText,
  compact = false,
  onInteract,
}) => {
  const [quoteIdx, setQuoteIdx] = useState<number | null>(null);
  const [isJumping, setIsJumping] = useState(false);

  const handleMascotClick = () => {
    sound.playCandyChime();
    setIsJumping(true);
    setQuoteIdx(prev => (prev === null ? 0 : (prev + 1) % FUN_QUOTES.length));
    onInteract?.();
    window.setTimeout(() => setIsJumping(false), 600);
  };

  const activeSpeech =
    quoteIdx !== null && mood === 'idle'
      ? FUN_QUOTES[quoteIdx]
      : speechText || 'Oi! Eu sou o Kiko, apresentador da Arena! Clique em mim!';

  const pupilX = Math.max(-7, Math.min(7, lookOffset));
  const pupilY = mood === 'typing' ? 2 : 0;
  const isCoveringEyes = mood === 'hiding' || mood === 'peeking';

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Comic Speech Bubble (fixed min-height prevents layout shift while typing) */}
      <div
        onClick={handleMascotClick}
        className={`relative cursor-pointer group bg-[#182032] hover:bg-[#1e2940] border-2 border-amber-400/70 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-center shadow-xl transition-all duration-200 flex items-center justify-center min-h-[48px] sm:min-h-[54px] w-full ${
          compact ? 'max-w-[270px] sm:max-w-xs mb-2' : 'max-w-[290px] sm:max-w-sm lg:max-w-md mb-2.5 sm:mb-3.5'
        }`}
      >
        <p className="text-[11px] sm:text-xs xl:text-sm font-extrabold text-amber-100 leading-snug line-clamp-2">
          {activeSpeech}
        </p>
        {/* Speech Bubble Tail */}
        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#182032] group-hover:bg-[#1e2940] border-r-2 border-b-2 border-amber-400/70 rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 transition-colors" />
      </div>

      {/* Animated SVG Character Container */}
      <div
        onClick={handleMascotClick}
        title="Clique no Kiko para interagir!"
        className={`relative cursor-pointer transition-transform duration-300 ${
          isJumping ? '-translate-y-4 sm:-translate-y-5 scale-105' : 'hover:scale-[1.03]'
        } ${
          compact
            ? 'w-28 h-28 sm:w-36 sm:h-36'
            : 'w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64'
        }`}
      >
        {/* Floating Kahoot Geometric Badges around the Mascot */}
        <div
          className="absolute left-0 sm:-left-1 top-3 sm:top-6 w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg sm:rounded-xl bg-kahoot-red border-2 border-white/25 flex items-center justify-center text-white font-black text-[10px] sm:text-xs lg:text-sm shadow-lg animate-bounce"
          style={{ animationDuration: '2.8s' }}
        >
          ▲
        </div>
        <div
          className="absolute right-0 sm:-right-1 top-5 sm:top-9 w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg sm:rounded-xl bg-kahoot-blue border-2 border-white/25 flex items-center justify-center text-white font-black text-[10px] sm:text-xs lg:text-sm shadow-lg animate-bounce"
          style={{ animationDuration: '3.2s', animationDelay: '0.4s' }}
        >
          ◆
        </div>
        <div
          className="absolute left-1 bottom-4 sm:bottom-7 w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg sm:rounded-xl bg-kahoot-yellow border-2 border-white/25 flex items-center justify-center text-white font-black text-[9px] sm:text-xs shadow-lg animate-bounce"
          style={{ animationDuration: '2.5s', animationDelay: '0.8s' }}
        >
          ●
        </div>
        <div
          className="absolute right-1 bottom-3 sm:bottom-6 w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg sm:rounded-xl bg-kahoot-green border-2 border-white/25 flex items-center justify-center text-white font-black text-[9px] sm:text-xs shadow-lg animate-bounce"
          style={{ animationDuration: '3s', animationDelay: '0.2s' }}
        >
          ■
        </div>

        <svg
          viewBox="0 0 260 250"
          className="w-full h-full overflow-visible animate-mascot-float drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)]"
        >
          {/* Glow Stage Shadow */}
          <ellipse cx="130" cy="234" rx="68" ry="11" fill="rgba(245, 158, 11, 0.22)" />

          {/* Wagging Fox Tail */}
          <g className="animate-mascot-tail">
            <path
              d="M 78 195 C 32 192, 18 152, 42 132 C 58 120, 78 140, 86 168 Z"
              fill="#ea580c"
              stroke="#7c2d12"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* White Tail Tip */}
            <path
              d="M 42 132 C 28 144, 30 162, 48 164 C 54 150, 54 138, 42 132 Z"
              fill="#fff7ed"
            />
          </g>

          {/* Torso / Game Show Jacket */}
          <path
            d="M 84 152 C 78 182, 80 218, 92 224 L 168 224 C 180 218, 182 182, 176 152 Z"
            fill="#f97316"
            stroke="#7c2d12"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* White Belly Fur */}
          <path
            d="M 104 156 C 100 182, 104 214, 114 222 L 146 222 C 156 214, 160 182, 156 156 Z"
            fill="#fff7ed"
          />

          {/* Red Game-Show Bowtie */}
          <g transform="translate(130, 158)">
            <polygon points="-18,-9 -2,0 -18,9" fill="#e11d48" stroke="#881337" strokeWidth="2.5" />
            <polygon points="18,-9 2,0 18,9" fill="#e11d48" stroke="#881337" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#881337" strokeWidth="2" />
          </g>

          {/* Feet */}
          <ellipse cx="106" cy="226" rx="16" ry="8" fill="#7c2d12" />
          <ellipse cx="154" cy="226" rx="16" ry="8" fill="#7c2d12" />

          {/* Left Ear (Twitching) */}
          <g className="animate-mascot-ear">
            <polygon
              points="64,84 52,22 104,54"
              fill="#ea580c"
              stroke="#7c2d12"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <polygon points="68,76 60,34 96,56" fill="#fde68a" />
          </g>

          {/* Right Ear */}
          <g>
            <polygon
              points="196,84 208,22 156,54"
              fill="#ea580c"
              stroke="#7c2d12"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <polygon points="192,76 200,34 164,56" fill="#fde68a" />
          </g>

          {/* Headset Band */}
          <path
            d="M 60 95 C 60 40, 200 40, 200 95"
            fill="none"
            stroke="#334155"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Head Base (Fox Shape) */}
          <path
            d="M 62 106 C 56 68, 92 48, 130 48 C 168 48, 204 68, 198 106 C 210 124, 192 154, 130 154 C 68 154, 50 124, 62 106 Z"
            fill="#f97316"
            stroke="#7c2d12"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Cream Fox Cheeks & Muzzle */}
          <path
            d="M 64 116 C 78 104, 105 114, 130 114 C 155 114, 182 104, 196 116 C 198 142, 166 154, 130 154 C 94 154, 62 142, 64 116 Z"
            fill="#fff7ed"
          />

          {/* Headset Ear Cups */}
          <rect x="48" y="88" width="16" height="32" rx="8" fill="#0ea5e9" stroke="#0f172a" strokeWidth="3" />
          <rect x="196" y="88" width="16" height="32" rx="8" fill="#0ea5e9" stroke="#0f172a" strokeWidth="3" />

          {/* Blush Cheeks */}
          <ellipse cx="84" cy="124" rx="10" ry="5.5" fill="#fb7185" opacity="0.55" />
          <ellipse cx="176" cy="124" rx="10" ry="5.5" fill="#fb7185" opacity="0.55" />

          {/* EYES (Blink & Track Input) */}
          <g className="animate-mascot-blink">
            {mood === 'happy' || isJumping ? (
              <>
                <path
                  d="M 88 96 Q 100 82 112 96"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 148 96 Q 160 82 172 96"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </>
            ) : mood === 'error' ? (
              <>
                <path d="M 90 86 L 110 104 M 110 86 L 90 104" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" />
                <path d="M 150 86 L 170 104 M 170 86 L 150 104" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Left Eye */}
                <circle cx="100" cy="95" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
                <circle cx={100 + pupilX} cy={95 + pupilY} r="7.5" fill="#0f172a" />
                <circle cx={97 + pupilX * 0.5} cy={91 + pupilY * 0.5} r="3" fill="#ffffff" />

                {/* Right Eye */}
                <circle cx="160" cy="95" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
                <circle cx={160 + pupilX} cy={95 + pupilY} r="7.5" fill="#0f172a" />
                <circle cx={157 + pupilX * 0.5} cy={91 + pupilY * 0.5} r="3" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Cute Fox Nose */}
          <polygon points="123,112 137,112 130,121" fill="#1e293b" strokeLinejoin="round" />

          {/* Mouth */}
          {mood === 'error' ? (
            <path d="M 118 134 Q 130 125 142 134" fill="none" stroke="#7c2d12" strokeWidth="3.5" strokeLinecap="round" />
          ) : mood === 'happy' || isJumping ? (
            <path d="M 114 126 Q 130 144 146 126 Z" fill="#e11d48" stroke="#7c2d12" strokeWidth="3" />
          ) : (
            <path
              d="M 118 127 Q 124 134 130 127 Q 136 134 142 127"
              fill="none"
              stroke="#7c2d12"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* RIGHT ARM: Holding Game-Show Microphone (or Covering Right Eye when typing password) */}
          {isCoveringEyes ? (
            <g className="transition-all duration-300">
              {/* Left Paw covering Left Eye */}
              <path
                d="M 76 162 C 62 138, 74 96, 98 92 C 112 90, 118 104, 108 118 L 90 164 Z"
                fill="#ea580c"
                stroke="#7c2d12"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <circle cx="98" cy="98" r="7" fill="#fde68a" />

              {/* Right Paw covering Right Eye (lowers slightly if peeking!) */}
              <path
                d={
                  mood === 'peeking'
                    ? 'M 184 162 C 196 144, 188 118, 166 114 C 154 112, 148 122, 156 134 L 170 164 Z'
                    : 'M 184 162 C 198 138, 186 96, 162 92 C 148 90, 142 104, 152 118 L 170 164 Z'
                }
                fill="#ea580c"
                stroke="#7c2d12"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <circle cx={mood === 'peeking' ? 164 : 162} cy={mood === 'peeking' ? 120 : 98} r="7" fill="#fde68a" />
            </g>
          ) : (
            <>
              {/* Left Arm resting on hip */}
              <path
                d="M 84 158 C 64 166, 64 190, 82 194"
                fill="none"
                stroke="#ea580c"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <circle cx="82" cy="194" r="9" fill="#7c2d12" />

              {/* Right Arm waving with Game-Show Microphone */}
              <g className="animate-mascot-wave">
                <path
                  d="M 176 158 C 198 148, 212 132, 214 114"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Paw */}
                <circle cx="214" cy="114" r="9" fill="#7c2d12" />
                {/* Golden Microphone */}
                <line x1="214" y1="118" x2="224" y2="92" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                <circle cx="227" cy="84" r="10" fill="#fbbf24" stroke="#78350f" strokeWidth="3" />
              </g>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export interface MascotDetailProps {
  variant: 'face' | 'paw' | 'tail' | 'peeking' | 'full';
  mood?: 'idle' | 'happy' | 'shocked' | 'error';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const MascotDetail: React.FC<MascotDetailProps> = ({
  variant,
  mood = 'idle',
  size = 'md',
  label,
  className = '',
}) => {
  const [clicked, setClicked] = useState(false);

  const triggerBounce = () => {
    sound.playCandyChime();
    setClicked(true);
    window.setTimeout(() => setClicked(false), 500);
  };

  if (variant === 'paw') {
    const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
    return (
      <div
        onClick={triggerBounce}
        title="Patinha do Kiko!"
        className={`inline-flex items-center gap-1.5 cursor-pointer select-none ${
          clicked ? 'scale-125' : ''
        } transition-transform ${className}`}
      >
        <svg viewBox="0 0 80 80" className={`${dim} animate-mascot-paw overflow-visible drop-shadow-md`}>
          {/* Forearm / Wrist */}
          <path
            d="M 24 74 L 28 42 C 28 30, 52 30, 52 42 L 56 74 Z"
            fill="#f97316"
            stroke="#7c2d12"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Main Paw Pad */}
          <circle cx="40" cy="36" r="18" fill="#ea580c" stroke="#7c2d12" strokeWidth="3.5" />
          {/* 3 Cute Toe Beans */}
          <circle cx="29" cy="24" r="4.5" fill="#fde68a" />
          <circle cx="40" cy="20" r="5" fill="#fde68a" />
          <circle cx="51" cy="24" r="4.5" fill="#fde68a" />
          {/* Central Palm Bean */}
          <ellipse cx="40" cy="37" rx="8" ry="6.5" fill="#fde68a" />
        </svg>
        {label && (
          <span className="text-[11px] font-black text-amber-300 bg-slate-900/90 border border-amber-400/40 px-2 py-0.5 rounded-lg">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'tail') {
    const dim = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
    return (
      <div
        onClick={triggerBounce}
        title="Rabo do Kiko abanando!"
        className={`inline-flex items-center cursor-pointer select-none ${
          clicked ? 'scale-125' : ''
        } transition-transform ${className}`}
      >
        <svg viewBox="0 0 100 100" className={`${dim} overflow-visible drop-shadow-md`}>
          <g className="animate-mascot-tail" style={{ transformOrigin: '75px 80px' }}>
            <path
              d="M 78 82 C 30 80, 12 40, 38 18 C 56 6, 80 30, 84 62 Z"
              fill="#ea580c"
              stroke="#7c2d12"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M 38 18 C 22 30, 26 50, 46 52 C 54 36, 52 24, 38 18 Z"
              fill="#fff7ed"
            />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === 'peeking') {
    const dim = size === 'sm' ? 'w-20 h-14' : size === 'lg' ? 'w-32 h-22' : 'w-24 h-16';
    return (
      <div
        onClick={triggerBounce}
        title="Kiko espiando a rodada!"
        className={`inline-flex flex-col items-center cursor-pointer select-none ${
          clicked ? '-translate-y-2 scale-105' : ''
        } transition-transform ${className}`}
      >
        {label && (
          <span className="mb-1 px-2.5 py-0.5 rounded-full bg-[#182032] border border-amber-400/60 text-[10px] font-black text-amber-200 shadow">
            {label}
          </span>
        )}
        <svg viewBox="0 0 180 115" className={`${dim} animate-mascot-peek overflow-visible drop-shadow-lg`}>
          {/* Left Ear */}
          <g className="animate-mascot-ear" style={{ transformOrigin: '52px 46px' }}>
            <polygon points="38,58 26,8 72,34" fill="#ea580c" stroke="#7c2d12" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="42,52 34,18 66,36" fill="#fde68a" />
          </g>
          {/* Right Ear */}
          <polygon points="142,58 154,8 108,34" fill="#ea580c" stroke="#7c2d12" strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="138,52 146,18 114,36" fill="#fde68a" />

          {/* Head Dome */}
          <path
            d="M 36 88 C 32 42, 62 26, 90 26 C 118 26, 148 42, 144 88 Z"
            fill="#f97316"
            stroke="#7c2d12"
            strokeWidth="3.5"
          />
          {/* Cream Muzzle Top */}
          <path d="M 42 88 C 56 76, 74 82, 90 82 C 106 82, 124 76, 138 88 Z" fill="#fff7ed" />

          {/* Eyes */}
          <g className="animate-mascot-blink">
            {mood === 'happy' || clicked ? (
              <>
                <path d="M 58 68 Q 68 56 78 68" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                <path d="M 102 68 Q 112 56 122 68" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="68" cy="66" r="10.5" fill="#fff" stroke="#0f172a" strokeWidth="3" />
                <circle cx="68" cy="66" r="5.5" fill="#0f172a" />
                <circle cx="66" cy="63" r="2.2" fill="#fff" />
                <circle cx="112" cy="66" r="10.5" fill="#fff" stroke="#0f172a" strokeWidth="3" />
                <circle cx="112" cy="66" r="5.5" fill="#0f172a" />
                <circle cx="110" cy="63" r="2.2" fill="#fff" />
              </>
            )}
          </g>

          {/* Nose */}
          <polygon points="85,78 95,78 90,85" fill="#0f172a" />

          {/* Two Paws Resting on the Border */}
          <ellipse cx="46" cy="94" rx="14" ry="9" fill="#ea580c" stroke="#7c2d12" strokeWidth="3.5" />
          <circle cx="41" cy="92" r="2.5" fill="#fde68a" />
          <circle cx="46" cy="90" r="2.5" fill="#fde68a" />
          <circle cx="51" cy="92" r="2.5" fill="#fde68a" />

          <ellipse cx="134" cy="94" rx="14" ry="9" fill="#ea580c" stroke="#7c2d12" strokeWidth="3.5" />
          <circle cx="129" cy="92" r="2.5" fill="#fde68a" />
          <circle cx="134" cy="90" r="2.5" fill="#fde68a" />
          <circle cx="139" cy="92" r="2.5" fill="#fde68a" />
        </svg>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={className}>
        <ArenaMascot
          mood={mood === 'happy' ? 'happy' : mood === 'error' ? 'error' : 'idle'}
          speechText={label}
          compact
        />
      </div>
    );
  }

  // Default: variant === 'face' (Animated Head Badge with Ears, Blinking Eyes & Expressions)
  const faceDim =
    size === 'sm' ? 'w-9 h-9 sm:w-11 sm:h-11' : size === 'lg' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-14 sm:h-14';

  return (
    <div
      onClick={triggerBounce}
      title="Kiko • Mascote ArenaQuiz (Clique!)"
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${
        clicked ? 'scale-110 -translate-y-1' : 'hover:scale-105'
      } transition-transform ${className}`}
    >
      <svg viewBox="0 0 140 135" className={`${faceDim} overflow-visible drop-shadow-md`}>
        {/* Left Ear (Twitching) */}
        <g className="animate-mascot-ear" style={{ transformOrigin: '42px 42px' }}>
          <polygon points="24,52 14,8 56,30" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="28,46 20,18 50,32" fill="#fde68a" />
        </g>
        {/* Right Ear */}
        <polygon points="116,52 126,8 84,30" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" strokeLinejoin="round" />
        <polygon points="112,46 120,18 90,32" fill="#fde68a" />

        {/* Head Base */}
        <path
          d="M 22 74 C 18 40, 46 24, 70 24 C 94 24, 122 40, 118 74 C 126 90, 110 116, 70 116 C 30 116, 14 90, 22 74 Z"
          fill="#f97316"
          stroke="#7c2d12"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Cream Cheeks */}
        <path
          d="M 24 82 C 36 72, 54 80, 70 80 C 86 80, 104 72, 116 82 C 118 104, 96 116, 70 116 C 44 116, 22 104, 24 82 Z"
          fill="#fff7ed"
        />

        {/* Blush */}
        <ellipse cx="38" cy="90" rx="7" ry="4" fill="#fb7185" opacity="0.55" />
        <ellipse cx="102" cy="90" rx="7" ry="4" fill="#fb7185" opacity="0.55" />

        {/* Eyes */}
        <g className="animate-mascot-blink">
          {mood === 'happy' || clicked ? (
            <>
              <path d="M 40 66 Q 50 54 60 66" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 80 66 Q 90 54 100 66" fill="none" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
            </>
          ) : mood === 'error' ? (
            <>
              <path d="M 42 58 L 56 72 M 56 58 L 42 72" stroke="#e11d48" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 84 58 L 98 72 M 98 58 L 84 72" stroke="#e11d48" strokeWidth="4.5" strokeLinecap="round" />
            </>
          ) : mood === 'shocked' ? (
            <>
              <circle cx="50" cy="64" r="11" fill="#fff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="50" cy="64" r="3.5" fill="#0f172a" />
              <circle cx="90" cy="64" r="11" fill="#fff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="90" cy="64" r="3.5" fill="#0f172a" />
            </>
          ) : (
            <>
              <circle cx="50" cy="64" r="10" fill="#fff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="50" cy="64" r="5.5" fill="#0f172a" />
              <circle cx="48" cy="61" r="2.2" fill="#fff" />
              <circle cx="90" cy="64" r="10" fill="#fff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="90" cy="64" r="5.5" fill="#0f172a" />
              <circle cx="88" cy="61" r="2.2" fill="#fff" />
            </>
          )}
        </g>

        {/* Nose & Mouth */}
        <polygon points="65,78 75,78 70,85" fill="#0f172a" />
        {mood === 'happy' || clicked ? (
          <path d="M 58 90 Q 70 104 82 90 Z" fill="#e11d48" stroke="#7c2d12" strokeWidth="2.5" />
        ) : mood === 'shocked' ? (
          <circle cx="70" cy="95" r="5" fill="#e11d48" stroke="#7c2d12" strokeWidth="2.5" />
        ) : mood === 'error' ? (
          <path d="M 60 98 Q 70 90 80 98" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path d="M 60 91 Q 65 96 70 91 Q 75 96 80 91" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
      {label && (
        <span className="text-xs font-extrabold text-amber-200 bg-[#182032] border border-amber-400/50 px-2.5 py-1 rounded-xl shadow">
          {label}
        </span>
      )}
    </div>
  );
};

