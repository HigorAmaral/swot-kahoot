import { describe, it, expect } from 'vitest';
import { escapeCsvCell, buildQuizCsvReport, buildAnswerReview } from '../quizReport';
import { Question, RoundLog, Team } from '../../types';

const sampleTeams: Team[] = [
  {
    id: 1,
    name: 'Grupo Alfa',
    color: '#ef4444',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-500',
    textClass: 'text-red-400',
    glowClass: '',
    points: 200,
    candies: 2,
    chocolates: 1,
    answersCorrect: 2,
    answersWrong: 0,
    participants: [{ id: 'p1', name: 'Higor', avatar: '👨‍💻', teamId: 1 }],
  },
  {
    id: 2,
    name: 'Grupo Beta',
    color: '#3b82f6',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-400',
    glowClass: '',
    points: 100,
    candies: 1,
    chocolates: 0,
    answersCorrect: 1,
    answersWrong: 1,
    participants: [{ id: 'p2', name: 'Maria; Silva', avatar: '👩‍💻', teamId: 2 }],
  },
];

const sampleQuestions: Question[] = [
  {
    id: 101,
    category: 'Estratégia',
    theme: 'FORÇAS',
    caseRelation: 'Análise interna',
    question: 'O que representa a letra S na análise SWOT?',
    options: [
      { text: 'Strengths (Forças)', symbol: 'triangle', color: 'red' },
      { text: 'Sales (Vendas)', symbol: 'diamond', color: 'blue' },
      { text: 'Speed (Velocidade)', symbol: 'circle', color: 'yellow' },
      { text: 'Support (Suporte)', symbol: 'square', color: 'green' },
    ],
    correctIndex: 0,
    explanation: 'S vem de Strengths (Forças internas).',
  },
];

const sampleLogs: RoundLog[] = [
  {
    id: 'log-1',
    questionId: 101,
    questionTitle: sampleQuestions[0].question,
    category: 'Estratégia',
    disputeWinnerTeamId: 1,
    answeringTeamId: 1,
    disputeMode: 'direto',
    isPassed: false,
    selectedOptionIndex: 0,
    correctOptionIndex: 0,
    isCorrect: true,
    pointsAwarded: 100,
    timestamp: '2026-11-13T15:00:00.000Z',
  },
];

describe('quizReport utilities', () => {
  it('escapes CSV cells containing semicolons, quotes, or newlines', () => {
    expect(escapeCsvCell('simples')).toBe('simples');
    expect(escapeCsvCell('Maria; Silva')).toBe('"Maria; Silva"');
    expect(escapeCsvCell('Texto "entre aspas"')).toBe('"Texto ""entre aspas"""');
    expect(escapeCsvCell(null)).toBe('');
  });

  it('builds a UTF-8 BOM CSV report with sorted teams and run history', () => {
    const csv = buildQuizCsvReport({
      quizTitle: 'Quiz de Gestão',
      shareCode: 'FQ-AB12',
      teams: sampleTeams,
      roundLogs: sampleLogs,
      runs: [
        {
          playerUsername: 'higoramaral',
          playerName: 'Higor Amaral',
          status: 'finished',
          currentQuestion: 1,
          totalQuestions: 1,
          winnerTeamName: 'Grupo Alfa',
          winnerPoints: 200,
          updatedAt: '2026-11-13T15:00:00.000Z',
        },
      ],
      isActiveInArena: true,
    });

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Relatorio ArenaQuiz;Quiz de Gestão;Codigo: FQ-AB12');
    expect(csv).toContain('1;Grupo Alfa;200;2;0;2;1;Higor');
    expect(csv).toContain('2;Grupo Beta;100;1;1;1;0;"Maria; Silva"');
    expect(csv).toContain('@higoramaral;Higor Amaral;Concluiu;1/1;Grupo Alfa;200');
  });

  it('maps questions with round logs and answering team names for post-quiz review', () => {
    const review = buildAnswerReview(sampleQuestions, sampleLogs, sampleTeams);
    expect(review).toHaveLength(1);
    expect(review[0].question.id).toBe(101);
    expect(review[0].log?.isCorrect).toBe(true);
    expect(review[0].answeringTeamName).toBe('Grupo Alfa');
  });
});
