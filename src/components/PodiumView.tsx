import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Question, RoundLog, Team } from '../types';
import { sound } from '../utils/sound';
import { buildAnswerReview, buildQuizCsvReport, downloadCsvFile } from '../utils/quizReport';
import { Trophy, RotateCcw, BookOpen, CheckCircle2, XCircle, ChevronDown, ChevronUp, Printer, Download } from 'lucide-react';

interface Props {
  teams: Team[];
  onRestart: () => void;
  questions?: Question[];
  roundLogs?: RoundLog[];
  quizTitle?: string;
  sessionId?: string;
}

export const PodiumView: React.FC<Props> = ({
  teams,
  onRestart,
  questions = [],
  roundLogs = [],
  quizTitle = 'ArenaQuiz',
  sessionId = 'sala-principal',
}) => {
  const [showReview, setShowReview] = useState(false);
  const reviewItems = buildAnswerReview(questions, roundLogs, teams);
  const sorted = [...teams].sort((a, b) => b.points - a.points || (b.candies + b.chocolates) - (a.candies + a.chocolates));
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const fourth = sorted[3];

  useEffect(() => {
    sound.playCorrect();
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
      const timer = window.setTimeout(() => {
        try {
          confetti({ particleCount: 55, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 55, angle: 120, spread: 55, origin: { x: 1 } });
        } catch {}
      }, 350);
      return () => window.clearTimeout(timer);
    } catch {}
  }, []);

  const handlePrintCertificate = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const rowsHtml = sorted
      .map(
        (t, idx) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">#${idx + 1}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700;">${t.name}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${t.participants.map(p => p.name).join(', ') || '-'}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:800;">${t.points} pts</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${t.answersCorrect}/${t.answersCorrect + t.answersWrong}</td>
        </tr>`
      )
      .join('');

    win.document.write(`
      <!doctype html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Certificado ArenaQuiz - ${quizTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; background: #fff; }
          .cert { border: 6px double #10b981; border-radius: 16px; padding: 32px; max-width: 800px; margin: 0 auto; }
          .badge { display:inline-block; background:#10b981; color:#fff; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
          h1 { margin: 14px 0 6px; font-size: 30px; }
          .winner { margin: 20px 0; padding: 18px; border-radius: 12px; background: #fef9c3; border: 2px solid #eab308; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { text-align:left; background:#f1f5f9; padding:10px; border-bottom:2px solid #cbd5e1; }
          .footer { margin-top: 28px; font-size: 11px; color: #64748b; display:flex; justify-content:space-between; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <span class="badge">Certificado Oficial • ArenaQuiz</span>
          <h1>${quizTitle}</h1>
          <p style="color:#475569;margin:0;">Sala: <strong>${sessionId}</strong> • Data: <strong>${dateStr}</strong> • ${questions.length} pergunta(s)</p>
          ${first ? `
          <div class="winner">
            <div style="font-size:12px;font-weight:800;color:#a16207;text-transform:uppercase;">🏆 Equipe Campeã</div>
            <div style="font-size:24px;font-weight:900;margin:4px 0;">${first.name} — ${first.points} pontos</div>
            ${first.participants.length > 0 ? `<div style="font-size:13px;color:#713f12;">Integrantes: ${first.participants.map(p => p.name).join(', ')}</div>` : ''}
          </div>` : ''}
          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Equipe</th>
                <th>Participantes</th>
                <th style="text-align:right;">Pontuação</th>
                <th style="text-align:center;">Acertos</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="footer">
            <span>Desenvolvido por Higor Amaral • ArenaQuiz</span>
            <span>© ${new Date().getFullYear()} Licença MIT</span>
          </div>
        </div>
        <script>window.onload = () => { window.print(); };</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] w-full max-w-6xl mx-auto p-3 sm:p-5 lg:p-6 animate-fade-in text-center">
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider mb-3 shadow-lg animate-bounce">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> Fim do Quiz! Grande Campeã Definida!
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
          PÓDIO DOS VENCEDORES
        </h1>
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto mt-2">
          Parabéns a todas as equipes pela disputa acirrada no ArenaQuiz!
        </p>
      </div>

      {/* 3D-style Podium Blocks */}
      <div className="flex items-end justify-center gap-3 sm:gap-5 w-full max-w-4xl mb-10 h-76">
        {/* 2nd Place */}
        {second && (
          <div className="flex-1 flex flex-col items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="mb-2.5 text-center">
              <span className="text-2xl sm:text-3xl">🥈</span>
              <div className="font-black text-white text-sm md:text-base lg:text-lg truncate max-w-[140px] lg:max-w-[180px]">
                {second.name}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-bold">{second.points} pts</div>
              <div className="text-[11px] text-pink-300">🍬 {second.candies} | 🍫 {second.chocolates}</div>
            </div>
            <div className="w-full bg-gradient-to-b from-slate-500 to-slate-700 border-t-4 border-slate-200 rounded-t-3xl h-40 flex items-center justify-center shadow-2xl">
              <span className="text-4xl lg:text-5xl font-black text-slate-200">2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {first && (
          <div className="flex-1 flex flex-col items-center scale-105 z-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="mb-2.5 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-slate-950 shadow-xl shadow-yellow-400/30 animate-bounce">
                <Trophy className="w-8 h-8 fill-current" />
              </div>
              <div className="font-black text-yellow-400 text-base md:text-lg lg:text-xl truncate max-w-[160px] lg:max-w-[210px] mt-1.5">
                {first.name}
              </div>
              <div className="text-sm sm:text-base text-white font-extrabold">{first.points} pts</div>
              <div className="text-xs text-yellow-200 font-bold">🍬 {first.candies} balas • 🍫 {first.chocolates} choc</div>
              {first.participants.length > 0 && (
                <div className="text-[11px] font-bold text-amber-200 truncate max-w-[160px] lg:max-w-[200px] mt-0.5">
                  🏆 {first.participants.map(p => p.name).join(', ')}
                </div>
              )}
            </div>
            <div className="w-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-amber-600 border-t-4 border-yellow-200 rounded-t-3xl h-56 flex flex-col items-center justify-center shadow-2xl shadow-yellow-500/20">
              <span className="text-6xl font-black text-slate-950">1</span>
              <span className="text-xs font-black uppercase text-slate-950 tracking-wider">Campeã</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex-1 flex flex-col items-center animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="mb-2.5 text-center">
              <span className="text-2xl sm:text-3xl">🥉</span>
              <div className="font-black text-white text-sm md:text-base lg:text-lg truncate max-w-[140px] lg:max-w-[180px]">
                {third.name}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-bold">{third.points} pts</div>
              <div className="text-[11px] text-pink-300">🍬 {third.candies} | 🍫 {third.chocolates}</div>
            </div>
            <div className="w-full bg-gradient-to-b from-amber-700 to-amber-900 border-t-4 border-amber-500 rounded-t-3xl h-32 flex items-center justify-center shadow-2xl">
              <span className="text-3xl lg:text-4xl font-black text-amber-200">3</span>
            </div>
          </div>
        )}

        {/* 4th Place (Honorary) */}
        {fourth && (
          <div className="hidden sm:flex flex-1 flex-col items-center opacity-85">
            <div className="mb-2.5 text-center">
              <span className="text-xl">🎖️</span>
              <div className="font-bold text-slate-300 text-xs lg:text-sm truncate max-w-[120px] lg:max-w-[150px]">
                {fourth.name}
              </div>
              <div className="text-xs text-slate-400 font-semibold">{fourth.points} pts</div>
              <div className="text-[10px] text-pink-300">🍬 {fourth.candies}</div>
            </div>
            <div className="w-full bg-slate-800/90 border-t-2 border-slate-600 rounded-t-2xl h-24 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">4</span>
            </div>
          </div>
        )}
      </div>

      {/* Prize Totals Box */}
      <div className="w-full max-w-2xl glass-card rounded-3xl p-4 sm:p-5 mb-6 flex items-center justify-around shadow-xl">
        <div className="text-center">
          <div className="text-2xl">🍬</div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {teams.reduce((acc, t) => acc + t.candies, 0)}
          </div>
          <div className="text-xs text-slate-400 font-bold">Total Balas Entregues</div>
        </div>
        <div className="h-10 w-px bg-slate-800" />
        <div className="text-center">
          <div className="text-2xl">🍫</div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {teams.reduce((acc, t) => acc + t.chocolates, 0)}
          </div>
          <div className="text-xs text-slate-400 font-bold">Total Chocolates</div>
        </div>
        <div className="h-10 w-px bg-slate-800" />
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {questions.length > 0 ? `${questions.length} / ${questions.length}` : '10 / 10'}
          </div>
          <div className="text-xs text-slate-400 font-bold">Perguntas Concluídas</div>
        </div>
      </div>

      {/* Presentation Completion Note & Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {questions.length > 0 && (
          <button
            onClick={() => setShowReview(prev => !prev)}
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg transition flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>{showReview ? 'Ocultar Gabarito' : 'Ver Gabarito das Perguntas'}</span>
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={handlePrintCertificate}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-lg transition flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          <span>Certificado / Relatório PDF</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const csv = buildQuizCsvReport({
              quizTitle,
              shareCode: sessionId,
              teams,
              roundLogs,
              runs: [],
              isActiveInArena: true,
            });
            downloadCsvFile(`relatorio_${sessionId}_${Date.now()}.csv`, csv);
          }}
          className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm sm:text-base shadow-lg transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Baixar Planilha (CSV)</span>
        </button>
        <button
          onClick={onRestart}
          className="px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm sm:text-base shadow-lg transition flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reiniciar Quiz da Dinâmica
        </button>
      </div>

      {/* Post-Quiz Answer Review (only visible after completing the quiz) */}
      {showReview && reviewItems.length > 0 && (
        <div className="w-full max-w-6xl mt-8 text-left space-y-3 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base sm:text-lg font-black text-white">
              Gabarito Oficial ({reviewItems.length} pergunta{reviewItems.length === 1 ? '' : 's'})
            </h3>
            <span className="text-xs text-slate-400">
              Liberado após a conclusão do quiz
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
            {reviewItems.map(({ index, question, log, answeringTeamName }) => (
              <div
                key={question.id || index}
                className="p-4 rounded-2xl bg-[#111622] border border-slate-800 space-y-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-black text-slate-200 shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        {question.category}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {question.question}
                      </h4>
                    </div>
                  </div>
                  {log && (
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shrink-0 ${
                        log.isCorrect
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {log.isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {answeringTeamName ? `${answeringTeamName}: ` : ''}
                      {log.isCorrect ? 'Acertou' : 'Errou'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((opt, optIdx) => {
                    const isCorrectOpt = optIdx === question.correctIndex;
                    const isSelectedWrong =
                      log && log.selectedOptionIndex === optIdx && !isCorrectOpt;
                    return (
                      <div
                        key={optIdx}
                        className={`px-3 py-2 rounded-xl text-xs sm:text-sm border flex items-center justify-between gap-2 ${
                          isCorrectOpt
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold'
                            : isSelectedWrong
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{opt.text}</span>
                        {isCorrectOpt && (
                          <span className="text-[10px] uppercase font-black text-emerald-300 shrink-0">
                            Correta
                          </span>
                        )}
                        {isSelectedWrong && (
                          <span className="text-[10px] uppercase font-black text-rose-300 shrink-0">
                            Marcada
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <p className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-2">
                    <strong className="text-slate-200">Explicação:</strong> {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
