import React, { useState, useEffect } from 'react';
import { Team, DisputeMode, GameStage, Participant, RoundLog, Question } from './types';
import { questionsData } from './data/questions';
import { sound } from './utils/sound';
import { dbService, getSessionId } from './services/db';

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
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { KahootCreatorModal } from './components/KahootCreatorModal';

const initialTeams: Team[] = [
  {
    id: 1,
    name: "Grupo 1 - Forças Tech",
    color: "#E21B3C",
    bgClass: "bg-kahoot-red",
    borderClass: "border-kahoot-red",
    textClass: "text-kahoot-red",
    glowClass: "shadow-neon-red",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
    participants: [],
  },
  {
    id: 2,
    name: "Grupo 2 - Inovadores Cloud",
    color: "#1368CE",
    bgClass: "bg-kahoot-blue",
    borderClass: "border-kahoot-blue",
    textClass: "text-kahoot-blue",
    glowClass: "shadow-neon-blue",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
    participants: [],
  },
  {
    id: 3,
    name: "Grupo 3 - Estrategistas Ágeis",
    color: "#D89E00",
    bgClass: "bg-kahoot-yellow",
    borderClass: "border-kahoot-yellow",
    textClass: "text-kahoot-yellow",
    glowClass: "shadow-neon-yellow",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
    participants: [],
  },
  {
    id: 4,
    name: "Grupo 4 - Guardiões Cyber",
    color: "#26890C",
    bgClass: "bg-kahoot-green",
    borderClass: "border-kahoot-green",
    textClass: "text-kahoot-green",
    glowClass: "shadow-neon-green",
    points: 0,
    candies: 0,
    chocolates: 0,
    answersCorrect: 0,
    answersWrong: 0,
    participants: [],
  },
];

export function App() {
  const [sessionId] = useState<string>(getSessionId());
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const cached = localStorage.getItem('swot_local_teams');
      if (cached) return JSON.parse(cached);
    } catch {}
    return initialTeams;
  });

  const [stage, setStage] = useState<GameStage>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [disputeMode, setDisputeMode] = useState<DisputeMode>('peao');

  // Dispute & Turn state
  const [disputeWinnerId, setDisputeWinnerId] = useState<number>(1);
  const [answeringTeamId, setAnsweringTeamId] = useState<number>(1);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(0);

  // Round logs & Database status
  const [roundLogs, setRoundLogs] = useState<RoundLog[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  // Dynamic Questions State (Default SWOT + Custom Created / Imported)
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const cached = localStorage.getItem('swot_custom_questions');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return questionsData;
  });

  // Modals
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const answeringTeam = teams.find(t => t.id === answeringTeamId) || teams[0];
  const disputeWinnerTeam = teams.find(t => t.id === disputeWinnerId) || teams[0];

  // Request Admin (Password Protection: higoramaral)
  const handleOpenAdmin = () => {
    const isAuth = sessionStorage.getItem('swot_admin_auth') === 'true';
    if (isAuth) {
      setIsAdminModalOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthOpen(false);
    setIsAdminModalOpen(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('swot_admin_auth');
    setIsAdminModalOpen(false);
  };

  // Save Custom Questions from Creator
  const handleSaveQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    try {
      localStorage.setItem('swot_custom_questions', JSON.stringify(newQuestions));
    } catch {}
    setCurrentQuestionIndex(0);
    setStage('intro');
  };

  // Sync with Neon Database on mount and polling every 2s for live updates
  useEffect(() => {
    let isMounted = true;

    const syncWithDb = async () => {
      try {
        const data = await dbService.loadState(sessionId);
        if (!isMounted || !data) return;
        setIsDbConnected(true);

        const rawParticipants: Participant[] = (data.participants || []).map((p: any) => ({
          id: String(p.id),
          name: p.name || p.user_name || 'Aluno',
          avatar: p.avatar || '👨‍💻',
          teamId: Number(p.teamId || p.team_id || 1),
          joinedAt: p.joinedAt || p.joined_at || new Date().toISOString(),
          isRepresentative: Boolean(p.isRepresentative || p.is_active_representative),
        }));

        setTeams(prev => prev.map(pt => {
          const remoteTeam = data.teams?.find((rt: any) => Number(rt.id) === pt.id);
          const teamParticipants = rawParticipants.filter(p => p.teamId === pt.id);

          return {
            ...pt,
            name: remoteTeam?.name || pt.name,
            points: remoteTeam ? Math.max(pt.points, remoteTeam.points ?? 0) : pt.points,
            candies: remoteTeam ? Math.max(pt.candies, remoteTeam.candies ?? 0) : pt.candies,
            chocolates: remoteTeam ? Math.max(pt.chocolates, remoteTeam.chocolates ?? 0) : pt.chocolates,
            answersCorrect: remoteTeam ? Math.max(pt.answersCorrect, remoteTeam.answers_correct ?? 0) : pt.answersCorrect,
            answersWrong: remoteTeam ? Math.max(pt.answersWrong, remoteTeam.answers_wrong ?? 0) : pt.answersWrong,
            isWinner: remoteTeam?.is_winner ?? pt.isWinner,
            participants: teamParticipants, // Always sync the latest participants from database!
          };
        }));

        if (data.logs && data.logs.length > 0) {
          setRoundLogs(data.logs.map((l: any) => ({
            id: String(l.id),
            questionId: l.question_id,
            questionTitle: questionsData.find(q => q.id === l.question_id)?.question || `Pergunta #${l.question_id}`,
            category: questionsData.find(q => q.id === l.question_id)?.category || 'SWOT',
            disputeWinnerTeamId: l.dispute_winner_team_id,
            answeringTeamId: l.answering_team_id,
            disputeMode: l.dispute_mode,
            isPassed: l.is_passed,
            selectedOptionIndex: l.selected_index,
            correctOptionIndex: questionsData.find(q => q.id === l.question_id)?.correctIndex || 0,
            isCorrect: l.is_correct,
            pointsAwarded: l.points_awarded,
            timestamp: l.created_at || new Date().toISOString(),
          })));
        }
      } catch (err) {
        console.warn('DB Sync error:', err);
        if (isMounted) setIsDbConnected(false);
      }
    };

    syncWithDb();
    const interval = setInterval(syncWithDb, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  // Save teams whenever updated
  const updateTeamsState = (newTeams: Team[]) => {
    setTeams(newTeams);
    dbService.syncTeams(sessionId, newTeams);
  };

  // Add Participant to Team
  const handleAddParticipant = async (teamId: number, userName: string, avatar: string = '👨‍💻') => {
    const participant = await dbService.addParticipant(sessionId, teamId, userName, avatar);
    setTeams(prev => {
      const updated = prev.map(t => {
        if (t.id === teamId) {
          // Avoid duplicate name in same team
          if (t.participants.some(p => p.name.toLowerCase() === userName.toLowerCase())) {
            return t;
          }
          return {
            ...t,
            participants: [...t.participants, participant]
          };
        }
        return t;
      });
      dbService.syncTeams(sessionId, updated);
      return updated;
    });
  };

  // Remove Participant from Team
  const handleRemoveParticipant = async (teamId: number, participantId: string, userName: string) => {
    await dbService.removeParticipant(sessionId, participantId, userName);
    setTeams(prev => {
      const updated = prev.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            participants: t.participants.filter(p => p.id !== participantId && p.name !== userName)
          };
        }
        return t;
      });
      dbService.syncTeams(sessionId, updated);
      return updated;
    });
  };

  // Admin Declares Winner Directly!
  const handleDeclareWinner = async (winnerTeamId: number) => {
    sound.playCorrect();
    await dbService.declareWinner(sessionId, winnerTeamId);

    const updated = teams.map(t => ({
      ...t,
      isWinner: t.id === winnerTeamId,
      points: t.id === winnerTeamId ? Math.max(t.points, 5000) : t.points
    }));
    updateTeamsState(updated);
    setStage('podium');
  };

  // Generic Team updater for Admin adjustments
  const handleUpdateTeam = (teamId: number, updater: (t: Team) => Team) => {
    const updated = teams.map(t => t.id === teamId ? updater(t) : t);
    updateTeamsState(updated);
  };

  // Team name update
  const handleUpdateTeamName = (teamId: number, newName: string) => {
    handleUpdateTeam(teamId, t => ({ ...t, name: newName }));
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
    const bonus = isCorrect ? Math.round((timeLeft / 30) * 200) : 0;
    const pointsAwarded = isCorrect ? 1000 + bonus : 0;

    const updatedTeams = teams.map(t => {
      if (t.id === answeringTeamId) {
        if (isCorrect) {
          return {
            ...t,
            points: t.points + pointsAwarded,
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
          points: t.points + 500,
          candies: t.candies + 1,
        };
      }

      return t;
    });

    updateTeamsState(updatedTeams);

    // Record round log in memory & database
    const newLog: RoundLog = {
      id: 'log_' + Date.now(),
      questionId: currentQuestion.id,
      questionTitle: currentQuestion.question,
      category: currentQuestion.category,
      disputeWinnerTeamId: disputeWinnerId,
      answeringTeamId,
      disputeMode,
      isPassed,
      selectedOptionIndex: selectedIdx,
      correctOptionIndex: currentQuestion.correctIndex,
      isCorrect,
      pointsAwarded,
      timestamp: new Date().toISOString(),
    };

    setRoundLogs(prev => [newLog, ...prev]);
    dbService.logRound(sessionId, {
      questionId: currentQuestion.id,
      questionTitle: currentQuestion.question,
      category: currentQuestion.category,
      disputeWinnerTeamId: disputeWinnerId,
      answeringTeamId,
      disputeMode,
      isPassed,
      selectedOptionIndex: selectedIdx,
      correctOptionIndex: currentQuestion.correctIndex,
      isCorrect,
      pointsAwarded,
    });

    setStage('verdict');
  };

  // Deliver Brinde (Candy / Chocolate)
  const handleAwardBrinde = (teamId: number, type: 'candy' | 'chocolate') => {
    const updated = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          candies: type === 'candy' ? t.candies + 1 : t.candies,
          chocolates: type === 'chocolate' ? t.chocolates + 1 : t.chocolates,
        };
      }
      return t;
    });
    updateTeamsState(updated);
  };

  // Reassign answer points in verdict
  const handleReassignAnswer = (newTeamId: number, isCorrect: boolean) => {
    if (isCorrect) {
      const updated = teams.map(t => {
        if (t.id === newTeamId) {
          return {
            ...t,
            points: t.points + 1000,
            answersCorrect: t.answersCorrect + 1,
            candies: t.candies + 1,
          };
        }
        return t;
      });
      updateTeamsState(updated);
      sound.playCorrect();
    }
  };

  // Next Question or Podium
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setStage('question_intro');
    } else {
      setStage('podium');
    }
  };

  // Reset Game
  const handleResetGame = async () => {
    await dbService.resetGame(sessionId);
    setTeams(initialTeams);
    setRoundLogs([]);
    setCurrentQuestionIndex(0);
    setStage('intro');
  };

  return (
    <div className="min-h-screen bg-grid-pattern text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <HostHeader
        disputeMode={disputeMode}
        onSetDisputeMode={setDisputeMode}
        onOpenCaseModal={() => setIsCaseModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenAdminModal={handleOpenAdmin}
        onOpenCreatorModal={() => setIsCreatorModalOpen(true)}
        isDbConnected={isDbConnected}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4">
        {stage === 'intro' && (
          <IntroSetupView
            teams={teams}
            onUpdateTeamName={handleUpdateTeamName}
            disputeMode={disputeMode}
            onSetDisputeMode={setDisputeMode}
            onStartGame={handleStartGame}
            onOpenCaseModal={() => setIsCaseModalOpen(true)}
            onOpenGuideModal={() => setIsGuideModalOpen(true)}
            onOpenAdminModal={handleOpenAdmin}
            onOpenCreatorModal={() => setIsCreatorModalOpen(true)}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}

        {stage === 'question_intro' && (
          <QuestionIntroBanner
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onProceedToQuestion={() => {
              setAnsweringTeamId(teams[currentQuestionIndex % teams.length].id);
              setIsPassed(false);
              setStage('question_play');
            }}
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
            allTeams={teams}
            onSelectAnsweringTeam={(teamId) => {
              setAnsweringTeamId(teamId);
            }}
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
            totalQuestions={questions.length}
            onNextQuestion={handleNextQuestion}
          />
        )}

        {stage === 'podium' && (
          <PodiumView
            teams={teams}
            onRestart={handleResetGame}
          />
        )}
      </main>

      {/* Modals */}
      <CaseStudyModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
      />

      <DynamicGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        teams={teams}
        onUpdateTeam={handleUpdateTeam}
        onDeclareWinner={handleDeclareWinner}
        currentQuestionIndex={currentQuestionIndex}
        onSetQuestionIndex={idx => {
          setCurrentQuestionIndex(idx);
          setStage('question_intro');
        }}
        disputeMode={disputeMode}
        onSetDisputeMode={setDisputeMode}
        onAddParticipant={handleAddParticipant}
        onRemoveParticipant={handleRemoveParticipant}
        onResetGame={handleResetGame}
        sessionId={sessionId}
        isDbConnected={isDbConnected}
        roundLogs={roundLogs}
        onOpenCreatorModal={() => setIsCreatorModalOpen(true)}
        onLogout={handleAdminLogout}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      <KahootCreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        currentQuestions={questions}
        onSaveQuestions={handleSaveQuestions}
      />

      {/* Minimal Footer */}
      <footer className="w-full text-center py-2.5 bg-slate-950/70 border-t border-purple-900/30 text-[11px] text-slate-400 flex items-center justify-center gap-4">
        <span>SWOT Kahoot! • Funções Administrativas & Planejamento em TI</span>
        <span>•</span>
        <button
          onClick={handleOpenAdmin}
          className="text-amber-400 hover:underline font-bold"
        >
          Acessar Painel ADM (Senha: higoramaral)
        </button>
      </footer>
    </div>
  );
}

export default App;
