import { Question, RoundLog, Team } from '../types';

export interface QuizRunReportItem {
  playerUsername: string;
  playerName: string;
  status: 'playing' | 'finished';
  currentQuestion: number;
  totalQuestions: number;
  winnerTeamName: string | null;
  winnerPoints: number;
  updatedAt: string;
}

export interface QuestionReviewItem {
  index: number;
  question: Question;
  log?: RoundLog;
  answeringTeamName?: string;
}

/**
 * Escapes a single CSV cell per RFC 4180.
 */
export function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? '');
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a UTF-8 BOM CSV report for a quiz's arena standings and run history.
 */
export function buildQuizCsvReport(params: {
  quizTitle: string;
  shareCode: string;
  teams: Team[];
  roundLogs: RoundLog[];
  runs: QuizRunReportItem[];
  isActiveInArena: boolean;
}): string {
  const lines: string[] = [];
  const addRow = (cols: Array<string | number | null | undefined>) => {
    lines.push(cols.map(escapeCsvCell).join(';'));
  };

  addRow(['Relatorio ArenaQuiz', params.quizTitle, `Codigo: ${params.shareCode}`]);
  addRow([]);

  if (params.isActiveInArena) {
    addRow(['PLACAR DA ARENA ATUAL']);
    addRow(['Posicao', 'Equipe', 'Pontos', 'Acertos', 'Erros', 'Balas', 'Chocolates', 'Integrantes']);
    const sorted = [...params.teams].sort((a, b) => b.points - a.points);
    sorted.forEach((team, idx) => {
      addRow([
        idx + 1,
        team.name,
        team.points,
        team.answersCorrect,
        team.answersWrong,
        team.candies,
        team.chocolates,
        team.participants.map(p => p.name).join(', ') || '-',
      ]);
    });
    addRow([]);
  }

  addRow(['HISTORICO DE PARTICIPANTES / EXECUCOES']);
  addRow(['Usuario', 'Nome', 'Status', 'Progresso', 'Vencedor', 'Pontos Vencedor', 'Atualizado em']);
  params.runs.forEach(run => {
    addRow([
      `@${run.playerUsername}`,
      run.playerName,
      run.status === 'finished' ? 'Concluiu' : 'Jogando',
      `${run.currentQuestion}/${run.totalQuestions}`,
      run.winnerTeamName || '-',
      run.winnerPoints || 0,
      run.updatedAt,
    ]);
  });

  if (params.isActiveInArena && params.roundLogs.length > 0) {
    addRow([]);
    addRow(['RESUMO DAS RODADAS']);
    addRow(['Pergunta', 'Categoria', 'Equipe', 'Resultado', 'Pontos']);
    params.roundLogs.forEach(log => {
      const teamName = params.teams.find(t => t.id === log.answeringTeamId)?.name || `Equipe ${log.answeringTeamId}`;
      addRow([
        log.questionTitle,
        log.category,
        teamName,
        log.isCorrect ? 'Acerto' : 'Erro',
        log.pointsAwarded,
      ]);
    });
  }

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Triggers a browser file download for a CSV string.
 */
export function downloadCsvFile(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Builds post-quiz question review items pairing each question with the latest round log.
 */
export function buildAnswerReview(
  questions: Question[],
  roundLogs: RoundLog[],
  teams: Team[]
): QuestionReviewItem[] {
  return questions.map((question, index) => {
    const log = [...roundLogs].reverse().find(l => l.questionId === question.id);
    const answeringTeamName = log
      ? teams.find(t => t.id === log.answeringTeamId)?.name
      : undefined;
    return {
      index,
      question,
      log,
      answeringTeamName,
    };
  });
}
