export type DisputeMode = 'peao' | 'buzzer' | 'alvo' | 'direto';
export type GamePlayMode = 'turno' | 'todos';

export { type Question } from './data/questions';

export interface UserAccount {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  email?: string;
}

export interface SavedQuiz {
  id?: number;
  shareCode: string;
  ownerUsername: string;
  ownerName: string;
  title: string;
  questions: import('./data/questions').Question[];
  createdAt?: string;
  sharedBy?: string;
  isPublic?: boolean;
  likesCount?: number;
  playsCount?: number;
  category?: string;
  ownerAvatar?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  teamId: number;
  isRepresentative?: boolean;
  joinedAt?: string;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  glowClass: string;
  points: number;
  candies: number; // Balas
  chocolates: number; // Chocolates
  answersCorrect: number;
  answersWrong: number;
  participants: Participant[];
  isWinner?: boolean;
  streak?: number;
}

export interface RoundLog {
  id: string;
  questionId: number;
  questionTitle: string;
  category: string;
  disputeWinnerTeamId: number;
  answeringTeamId: number;
  disputeMode: DisputeMode;
  isPassed: boolean;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  pointsAwarded: number;
  timestamp: string;
}

export type GameStage = 
  | 'intro'           // Welcome, Team Setup, Participant Join, Case Study Reading
  | 'case_study'     // Dedicated screen to read/project the IT paper
  | 'question_intro' // Announcing question X of 10 and category
  | 'dispute'        // Peão / Buzzer / Alvo dynamic to decide who gets to answer
  | 'question_play'  // Kahoot question screen with 4 options and countdown
  | 'verdict'        // Grupo de comando validates: right or wrong, reveals answer
  | 'scoreboard'     // Scoreboard after each round
  | 'podium';        // Final celebratory podium with confetti & prize summary
