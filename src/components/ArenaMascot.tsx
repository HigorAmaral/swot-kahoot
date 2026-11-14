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
    <div className="flex flex-col items-center select-none">
      {/* Comic Speech Bubble */}
      <div
        onClick={handleMascotClick}
        className={`relative cursor-pointer group bg-[#182032] hover:bg-[#1e2940] border-2 border-amber-400/70 rounded-2xl px-4 py-2.5 text-center shadow-xl transition-all duration-200 ${
          compact ? 'max-w-[260px] mb-2' : 'max-w-xs sm:max-w-sm mb-3'
        }`}
      >
        <p className="text-xs sm:text-sm font-extrabold text-amber-100 leading-snug">
          {activeSpeech}
        </p>
        {/* Speech Bubble Tail */}
        <div className="w-3.5 h-3.5 bg-[#182032] group-hover:bg-[#1e2940] border-r-2 border-b-2 border-amber-400/70 rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 transition-colors" />
      </div>

      {/* Animated SVG Character Container */}
      <div
        onClick={handleMascotClick}
        title="Clique no Kiko para interagir!"
        className={`relative cursor-pointer transition-transform duration-300 ${
          isJumping ? '-translate-y-5 scale-105' : 'hover:scale-[1.03]'
        } ${compact ? 'w-36 h-36' : 'w-56 h-56 sm:w-64 sm:h-64'}`}
      >
        {/* Floating Kahoot Geometric Badges around the Mascot */}
        {!compact && (
          <>
            <div
              className="absolute -left-2 top-6 w-9 h-9 rounded-xl bg-kahoot-red border-2 border-white/25 flex items-center justify-center text-white font-black text-sm shadow-lg animate-bounce"
              style={{ animationDuration: '2.8s' }}
            >
              ▲
            </div>
            <div
              className="absolute -right-2 top-10 w-9 h-9 rounded-xl bg-kahoot-blue border-2 border-white/25 flex items-center justify-center text-white font-black text-sm shadow-lg animate-bounce"
              style={{ animationDuration: '3.2s', animationDelay: '0.4s' }}
            >
              ◆
            </div>
            <div
              className="absolute left-1 bottom-8 w-8 h-8 rounded-xl bg-kahoot-yellow border-2 border-white/25 flex items-center justify-center text-white font-black text-xs shadow-lg animate-bounce"
              style={{ animationDuration: '2.5s', animationDelay: '0.8s' }}
            >
              ●
            </div>
            <div
              className="absolute right-1 bottom-6 w-8 h-8 rounded-xl bg-kahoot-green border-2 border-white/25 flex items-center justify-center text-white font-black text-xs shadow-lg animate-bounce"
              style={{ animationDuration: '3s', animationDelay: '0.2s' }}
            >
              ■
            </div>
          </>
        )}

        <svg
          viewBox="0 0 260 250"
          className="w-full h-full overflow-visible animate-mascot-float drop-shadow-[0_14px_24px_rgba(0,0,0,0.6)]"
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
