import React, { useState } from 'react';
import { Team, DisputeMode, GameStage } from './types';
import { questionsData } from './data/questions';
import { sound } from './utils/sound';

import { HostHeader } from './components/HostHeader';
import { IntroSetupView } from './components/IntroSetupView';
import { QuestionIntroBanner } from './components/QuestionIntroBanner';
import { SpinningTopDispute } from './components/SpinningTopDispute';
import { BuzzerDispute } from './components/BuzzerDispute';
import { TargetDispute } from './components/TargetDispute';
import { QuestionPlayView } from './components/QuestionPlayView';
import { VerdictView } from './components/VerdictView';
import { ScoreboardView } from './components/ScoreboardView';
import { PodiumView } from './components/PodiumView';
import { CaseStudyModal } from './components/CaseStudyModal';
import { DynamicGuideModal } from './components/DynamicGuideModal';

const initialTeams: Team[] = [
  {
    id: 1,
    name: "Grupo 1 - Forças Tech",
    color: "#E21B3C",
    bgClass: "bg-kahoot-red",
    borderClass: "border-kahoot-red",
    textClass: "text-kahoot-red",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
  },
  {
    id: 2,
    name: "Grupo 2 - Inovadores Cloud",
    color: "#1368CE",
    bgClass: "bg-kahoot-blue",
    borderClass: "border-kahoot-blue",
    textClass: "text-kahoot-blue",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
  },
  {
    id: 3,
    name: "Grupo 3 - Estrategistas Ágeis",
    color: "#D89E00",
    bgClass: "bg-kahoot-yellow",
    borderClass: "border-kahoot-yellow",
    textClass: "text-kahoot-yellow",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
  },
  {
    id: 4,
    name: "Grupo 4 - Guardiões Cyber",
    color: "#26890C",
    bgClass: "bg-kahoot-green",
    borderClass: "border-kahoot-green",
    textClass: "text-kahoot-green",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
  },
];

export function App() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [stage, setStage] = useState<GameStage>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [disputeMode, setDisputeMode] = useState<DisputeMode>('peao');

  // Dispute & Turn state
  const [disputeWinnerId, setDisputeWinnerId] = useState<number>(1);
  const [answeringTeamId, setAnsweringTeamId] = useState<number>(1);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(0);

  // Modals
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const currentQuestion = questionsData[currentQuestionIndex];
  const answeringTeam = teams.find(t => t.id === answeringTeamId) || teams[0];
  const disputeWinnerTeam = teams.find(t => t.id === disputeWinnerId) || teams[0];

  // Team name update
  const handleUpdateTeamName = (teamId: number, newName: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, name: newName } : t));
  };

  // Start the Quiz
  const handleStartGame = () => {
    sound.startLobbyMusic();
    setStage('question_intro');
  };

  // Dispute Resolved (winner chosen, optional pass to rival)
  const handleDisputeResolved = (winnerId: number, passedToId?: number) => {
    setDisputeWinnerId(winnerId);
    if (passedToId) {
      setAnsweringTeamId(passedToId);
      setIsPassed(true);
    } else {
      setAnsweringTeamId(winnerId);
      setIsPassed(false);
    }
    setStage('question_play');
  };

  // Answer selected in question_play
  const handleAnswerSelected = (selectedIdx: number, timeLeft: number) => {
    setLastSelectedIndex(selectedIdx);
    const isCorrect = selectedIdx === currentQuestion.correctIndex;

    setTeams(prev => prev.map(t => {
      // Answering team
      if (t.id === answeringTeamId) {
        if (isCorrect) {
          // Calculate score based on time remaining: 1000 base + up to 200 time bonus
          const bonus = Math.round((timeLeft / 30) * 200);
          return {
            ...t,
            points: t.points + 1000 + bonus,
            answersCorrect: t.answersCorrect + 1,
            candies: t.candies + 1,
          };
        } else {
          return {
            ...t,
            answersWrong: t.answersWrong + 1,
          };
        }
      }

      // If question was passed and answering rival got it WRONG, give bonus to original dispute winner
      if (isPassed && !isCorrect && t.id === disputeWinnerId) {
        return {
          ...t,
          points: t.points + 500, // Strategic pass bonus!
          candies: t.candies + 1,
        };
      }

      return t;
    }));

    setStage('verdict');
  };

  // Deliver Brinde (Candy / Chocolate)
  const handleAwardBrinde = (teamId: number, type: 'candy' | 'chocolate') => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          candies: type === 'candy' ? t.candies + 1 : t.candies,
          chocolates: type === 'chocolate' ? t.chocolates + 1 : t.chocolates,
        };
      }
      return t;
    }));
  };

  // Reassign answer points in verdict (if room opened to other teams)
  const handleReassignAnswer = (newTeamId: number, isCorrect: boolean) => {
    if (isCorrect) {
      setTeams(prev => prev.map(t => {
        if (t.id === newTeamId) {
          return {
            ...t,
            points: t.points + 1000,
            answersCorrect: t.answersCorrect + 1,
            candies: t.candies + 1,
          };
        }
        return t;
      }));
      sound.playCorrect();
    }
  };

  // Next Question or Podium
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setStage('question_intro');
    } else {
      setStage('podium');
    }
  };

  // Restart Quiz
  const handleRestart = () => {
    setTeams(initialTeams);
    setCurrentQuestionIndex(0);
    setStage('intro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <HostHeader
        disputeMode={disputeMode}
        onSetDisputeMode={setDisputeMode}
        onOpenCaseModal={() => setIsCaseModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {stage === 'intro' && (
          <IntroSetupView
            teams={teams}
            onUpdateTeamName={handleUpdateTeamName}
            disputeMode={disputeMode}
            onSetDisputeMode={setDisputeMode}
            onStartGame={handleStartGame}
            onOpenCaseModal={() => setIsCaseModalOpen(true)}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
          />
        )}

        {stage === 'question_intro' && (
          <QuestionIntroBanner
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questionsData.length}
            onProceedToDispute={() => setStage('dispute')}
            onOpenCaseModal={() => setIsCaseModalOpen(true)}
          />
        )}

        {stage === 'dispute' && (
          <>
            {disputeMode === 'peao' && (
              <SpinningTopDispute
                teams={teams}
                onDisputeResolved={handleDisputeResolved}
                questionNumber={currentQuestionIndex + 1}
              />
            )}
            {disputeMode === 'buzzer' && (
              <BuzzerDispute
                teams={teams}
                onDisputeResolved={handleDisputeResolved}
                questionNumber={currentQuestionIndex + 1}
              />
            )}
            {disputeMode === 'alvo' && (
              <TargetDispute
                teams={teams}
                onDisputeResolved={handleDisputeResolved}
                questionNumber={currentQuestionIndex + 1}
              />
            )}
          </>
        )}

        {stage === 'question_play' && (
          <QuestionPlayView
            question={currentQuestion}
            answeringTeam={answeringTeam}
            disputeWinnerTeam={disputeWinnerTeam}
            isPassed={isPassed}
            onAnswerSelected={handleAnswerSelected}
            onOpenCaseModal={() => setIsCaseModalOpen(true)}
          />
        )}

        {stage === 'verdict' && (
          <VerdictView
            question={currentQuestion}
            selectedIndex={lastSelectedIndex}
            answeringTeam={answeringTeam}
            disputeWinnerTeam={disputeWinnerTeam}
            isPassed={isPassed}
            onAwardBrinde={handleAwardBrinde}
            onContinue={() => setStage('scoreboard')}
            onReassignAnswer={handleReassignAnswer}
            allTeams={teams}
          />
        )}

        {stage === 'scoreboard' && (
          <ScoreboardView
            teams={teams}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questionsData.length}
            onNextQuestion={handleNextQuestion}
          />
        )}

        {stage === 'podium' && (
          <PodiumView
            teams={teams}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Persistent Modals */}
      <CaseStudyModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
      />

      <DynamicGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="w-full text-center py-2.5 bg-slate-950/60 border-t border-purple-900/30 text-xs text-slate-400">
        <span>SWOT Kahoot! • Funções Administrativas & Planejamento em TI • InovaTech Case Study</span>
      </footer>
    </div>
  );
}

export default App;
