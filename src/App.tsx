import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Team, DisputeMode, GameStage, Participant, RoundLog, Question, UserAccount, SavedQuiz } from './types';
import { questionsData } from './data/questions';
import { sound } from './utils/sound';
import { dbService, getSessionId } from './services/db';

import { HostHeader } from './components/HostHeader';
import { IntroSetupView } from './components/IntroSetupView';
import { QuestionIntroBanner } from './components/QuestionIntroBanner';
import { QuestionPlayView } from './components/QuestionPlayView';
import { LoginView } from './components/LoginView';
import { RightKahootsSidebar } from './components/RightKahootsSidebar';

const VerdictView = lazy(() => import('./components/VerdictView').then(m => ({ default: m.VerdictView })));
const ScoreboardView = lazy(() => import('./components/ScoreboardView').then(m => ({ default: m.ScoreboardView })));
const PodiumView = lazy(() => import('./components/PodiumView').then(m => ({ default: m.PodiumView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminAuthModal = lazy(() => import('./components/AdminAuthModal').then(m => ({ default: m.AdminAuthModal })));
const KahootCreatorModal = lazy(() => import('./components/KahootCreatorModal').then(m => ({ default: m.KahootCreatorModal })));
const MyQuizzesModal = lazy(() => import('./components/MyQuizzesModal').then(m => ({ default: m.MyQuizzesModal })));
const ProfileModal = lazy(() => import('./components/ProfileModal').then(m => ({ default: m.ProfileModal })));
const QuizAdminModal = lazy(() => import('./components/QuizAdminModal').then(m => ({ default: m.QuizAdminModal })));

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
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('fabrica_user') || sessionStorage.getItem('fabrica_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const isAdmin = Boolean(
    currentUser &&
      (currentUser.username.trim().toLowerCase() === 'higoramaral' ||
        currentUser.email?.trim().toLowerCase() === 'amarahigor@gmail.com')
  );

  const [managingQuiz, setManagingQuiz] = useState<SavedQuiz | null>(null);

  const [pendingQuizCode, setPendingQuizCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('quiz');
  });

  const [activeQuizInfo, setActiveQuizInfo] = useState<{ title: string; shareCode?: string } | null>(null);
  const [quizzesRefreshKey, setQuizzesRefreshKey] = useState<number>(0);
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
  const [disputeMode] = useState<DisputeMode>('direto');
  const [questionDuration, setQuestionDuration] = useState<number>(30);
  const [pointsPerCorrect, setPointsPerCorrect] = useState<number>(1000);

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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isMyQuizzesModalOpen, setIsMyQuizzesModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const answeringTeam = teams.find(t => t.id === answeringTeamId) || teams[0];
  const disputeWinnerTeam = teams.find(t => t.id === disputeWinnerId) || teams[0];

  // Request Admin (Password Protection: higoramaral)
  const handleOpenAdmin = () => {
    if (!isAdmin) return;
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

  // Login & Logout Handlers
  const handleLoginSuccess = (user: UserAccount, remember: boolean = true) => {
    setCurrentUser(user);
    try {
      if (remember) {
        localStorage.setItem('fabrica_user', JSON.stringify(user));
        sessionStorage.removeItem('fabrica_user');
      } else {
        sessionStorage.setItem('fabrica_user', JSON.stringify(user));
        localStorage.removeItem('fabrica_user');
      }
    } catch {}
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('fabrica_user');
      sessionStorage.removeItem('fabrica_user');
    } catch {}
  };

  const handleProfileUpdated = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('fabrica_user', JSON.stringify(updatedUser));
    } catch {}
  };

  const handleJoinCurrentUserToTeam = (teamId: number) => {
    if (!currentUser) return;
    sound.playTone(650, 0.15, 'sine', 0.2);
    handleAddParticipant(teamId, currentUser.displayName, currentUser.avatar);
  };

  // Load shared quiz if ?quiz=FQ-XXXX is in URL once logged in
  useEffect(() => {
    if (!currentUser || !pendingQuizCode) return;
    dbService.getQuizByCode(pendingQuizCode).then(res => {
      if (res.success && res.quiz && res.quiz.questions.length > 0) {
        setQuestions(res.quiz.questions);
        setActiveQuizInfo({ title: res.quiz.title, shareCode: res.quiz.shareCode });
        setCurrentQuestionIndex(0);
        setStage('intro');
      }
      setPendingQuizCode(null);
    });
  }, [currentUser, pendingQuizCode]);

  // Save Custom Questions from Creator
  const handleSaveQuestions = (newQuestions: Question[], quizTitle?: string, shareCode?: string) => {
    setQuestions(newQuestions);
    if (quizTitle || shareCode) {
      setActiveQuizInfo({ title: quizTitle || 'Meu Quiz', shareCode });
    }
    setQuizzesRefreshKey(prev => prev + 1);
    try {
      localStorage.setItem('swot_custom_questions', JSON.stringify(newQuestions));
    } catch {}
    setCurrentQuestionIndex(0);
    setStage('intro');
  };

  // Report per-Kahoot run progress & winner to DB
  useEffect(() => {
    if (!currentUser || !activeQuizInfo?.shareCode) return;
    if (stage === 'intro' && roundLogs.length === 0) return;

    const declaredWinner = teams.find(t => t.isWinner);
    const topTeam = [...teams].sort((a, b) => b.points - a.points)[0];
    const isFinished = stage === 'podium' || Boolean(declaredWinner);
    const winnerTeam = isFinished ? (declaredWinner || topTeam) : undefined;

    dbService.reportQuizRun({
      shareCode: activeQuizInfo.shareCode,
      sessionId,
      playerUsername: currentUser.username,
      playerName: currentUser.displayName,
      playerAvatar: currentUser.avatar,
      status: isFinished ? 'finished' : 'playing',
      currentQuestion: Math.min(currentQuestionIndex + 1, questions.length),
      totalQuestions: questions.length,
      winnerTeamName: winnerTeam ? winnerTeam.name : undefined,
      winnerPoints: winnerTeam ? winnerTeam.points : undefined,
      winnerMembers: winnerTeam
        ? winnerTeam.participants.map(p => p.name).join(', ')
        : undefined,
    });
  }, [
    currentUser?.username,
    activeQuizInfo?.shareCode,
    stage,
    currentQuestionIndex,
    questions.length,
    teams,
    sessionId,
    roundLogs.length,
  ]);

  // Sync with Neon Database when logged in & tab is visible (every 3.5s)
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;

    const syncWithDb = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
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
    const interval = setInterval(syncWithDb, 3500);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') syncWithDb();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sessionId, currentUser]);

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

  // Bulk update all teams (Admin)
  const handleUpdateAllTeams = (updater: (t: Team) => Team) => {
    updateTeamsState(teams.map(updater));
  };

  // Move participant between teams (Admin)
  const handleMoveParticipant = (fromTeamId: number, toTeamId: number, participantId: string) => {
    if (fromTeamId === toTeamId) return;
    setTeams(prev => {
      let moved: Participant | null = null;
      const without = prev.map(t => {
        if (t.id === fromTeamId) {
          const found = t.participants.find(p => p.id === participantId);
          if (found) moved = { ...found, teamId: toTeamId };
          return { ...t, participants: t.participants.filter(p => p.id !== participantId) };
        }
        return t;
      });
      if (!moved) return prev;
      const movedParticipant: Participant = moved;
      const updated = without.map(t => {
        if (t.id === toTeamId) {
          return { ...t, participants: [...t.participants, movedParticipant] };
        }
        return t;
      });
      dbService.syncTeams(sessionId, updated);
      return updated;
    });
  };

  // Restore default FabricaQuiz questions (Admin)
  const handleRestoreDefaultQuestions = () => {
    setQuestions(questionsData);
    setActiveQuizInfo(null);
    setCurrentQuestionIndex(0);
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
    const bonus = isCorrect ? Math.round((timeLeft / Math.max(questionDuration, 1)) * 200) : 0;
    const pointsAwarded = isCorrect ? pointsPerCorrect + bonus : 0;

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

  // Report per-Kahoot run progress & winner to DB
  useEffect(() => {
    if (!currentUser || !activeQuizInfo?.shareCode) return;
    if (stage === 'intro' && roundLogs.length === 0) return;

    const declaredWinner = teams.find(t => t.isWinner);
    const topTeam = [...teams].sort((a, b) => b.points - a.points)[0];
    const isFinished = stage === 'podium' || Boolean(declaredWinner);
    const winnerTeam = isFinished ? (declaredWinner || topTeam) : undefined;

    dbService.reportQuizRun({
      shareCode: activeQuizInfo.shareCode,
      sessionId,
      playerUsername: currentUser.username,
      playerName: currentUser.displayName,
      playerAvatar: currentUser.avatar,
      status: isFinished ? 'finished' : 'playing',
      currentQuestion: Math.min(currentQuestionIndex + 1, questions.length),
      totalQuestions: questions.length,
      winnerTeamName: winnerTeam ? winnerTeam.name : undefined,
      winnerPoints: winnerTeam ? winnerTeam.points : undefined,
      winnerMembers: winnerTeam
        ? winnerTeam.participants.map(p => p.name).join(', ')
        : undefined,
    });
  }, [
    currentUser?.username,
    activeQuizInfo?.shareCode,
    stage,
    currentQuestionIndex,
    questions.length,
    teams,
    sessionId,
    roundLogs.length,
  ]);

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        pendingQuizCode={pendingQuizCode}
      />
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-grid-pattern text-white flex flex-col font-sans select-none overflow-x-hidden lg:overflow-hidden">
      {/* Top Header */}
      <HostHeader
        onOpenAdminModal={handleOpenAdmin}
        onOpenCreatorModal={() => setIsCreatorModalOpen(true)}
        onOpenMyQuizzesModal={() => setIsMyQuizzesModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        currentUser={currentUser}
        onLogoutUser={handleLogoutUser}
        isAdmin={isAdmin}
      />

      {/* Main Body + Right Sidebar */}
      <div className="flex-1 min-h-0 flex w-full">
        <main className="flex-1 min-w-0 w-full min-h-0 lg:overflow-y-auto flex flex-col items-center p-2.5 sm:p-4">
          <div className="w-full my-auto flex flex-col items-center">
        {stage === 'intro' && (
          <IntroSetupView
            teams={teams}
            currentUser={currentUser}
            onUpdateTeamName={handleUpdateTeamName}
            onStartGame={handleStartGame}
            onOpenCreatorModal={() => setIsCreatorModalOpen(true)}
            onOpenMyQuizzesModal={() => setIsMyQuizzesModalOpen(true)}
            activeQuizInfo={activeQuizInfo}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}

        {stage === 'question_intro' && (
          <QuestionIntroBanner
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            teams={teams}
            currentUser={currentUser}
            onJoinTeam={handleJoinCurrentUserToTeam}
            onBack={() => setStage('intro')}
            onProceedToQuestion={() => {
              setAnsweringTeamId(teams[currentQuestionIndex % teams.length].id);
              setIsPassed(false);
              setStage('question_play');
            }}
          />
        )}

        {stage === 'question_play' && (
          <QuestionPlayView
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            questionDuration={questionDuration}
            answeringTeam={answeringTeam}
            disputeWinnerTeam={disputeWinnerTeam}
            isPassed={isPassed}
            onAnswerSelected={handleAnswerSelected}
            allTeams={teams}
            onSelectAnsweringTeam={(teamId) => {
              setAnsweringTeamId(teamId);
            }}
            currentUser={currentUser}
            onJoinTeam={handleJoinCurrentUserToTeam}
          />
        )}

        <Suspense fallback={<div className="text-xs text-slate-400 py-10">Carregando...</div>}>
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
        </Suspense>
          </div>
        </main>

        <RightKahootsSidebar
          currentUser={currentUser}
          activeShareCode={activeQuizInfo?.shareCode}
          refreshKey={quizzesRefreshKey}
          onLoadQuiz={(qs, title, shareCode) => handleSaveQuestions(qs, title, shareCode)}
          onOpenCreator={() => setIsCreatorModalOpen(true)}
          onOpenShareModal={() => setIsMyQuizzesModalOpen(true)}
          onOpenQuizAdmin={setManagingQuiz}
        />
      </div>

      {/* Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
        {isAdminModalOpen && (
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
            questions={questions}
            questionDuration={questionDuration}
            onSetQuestionDuration={setQuestionDuration}
            pointsPerCorrect={pointsPerCorrect}
            onSetPointsPerCorrect={setPointsPerCorrect}
            onGoToPodium={() => setStage('podium')}
            onGoToStage={setStage}
            onUpdateTeamName={handleUpdateTeamName}
            onUpdateAllTeams={handleUpdateAllTeams}
            onMoveParticipant={handleMoveParticipant}
            onOpenMyQuizzesModal={() => setIsMyQuizzesModalOpen(true)}
            onRestoreDefaultQuestions={handleRestoreDefaultQuestions}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onResetGame={handleResetGame}
            sessionId={sessionId}
            isDbConnected={isDbConnected}
            roundLogs={roundLogs}
            onOpenCreatorModal={() => setIsCreatorModalOpen(true)}
            onLogout={handleAdminLogout}
          />
        )}

        {isAdminAuthOpen && (
          <AdminAuthModal
            isOpen={isAdminAuthOpen}
            onClose={() => setIsAdminAuthOpen(false)}
            onSuccess={handleAdminAuthSuccess}
          />
        )}

        {isCreatorModalOpen && (
          <KahootCreatorModal
            isOpen={isCreatorModalOpen}
            onClose={() => setIsCreatorModalOpen(false)}
            currentQuestions={questions}
            onSaveQuestions={handleSaveQuestions}
            currentUser={currentUser}
          />
        )}

        {isMyQuizzesModalOpen && (
          <MyQuizzesModal
            isOpen={isMyQuizzesModalOpen}
            onClose={() => {
              setIsMyQuizzesModalOpen(false);
              setQuizzesRefreshKey(prev => prev + 1);
            }}
            currentUser={currentUser}
            onLoadQuiz={(qs, title, shareCode) => handleSaveQuestions(qs, title, shareCode)}
            onOpenCreator={() => setIsCreatorModalOpen(true)}
            onOpenQuizAdmin={setManagingQuiz}
          />
        )}

        {managingQuiz && (
          <QuizAdminModal
            quiz={managingQuiz}
            onClose={() => setManagingQuiz(null)}
            isActiveInArena={activeQuizInfo?.shareCode === managingQuiz.shareCode}
            currentQuestionIndex={currentQuestionIndex}
            stage={stage}
            teams={teams}
            roundLogs={roundLogs}
            currentUser={currentUser}
            onLoadQuiz={(qs, title, shareCode) => handleSaveQuestions(qs, title, shareCode)}
          />
        )}

        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </Suspense>

      {/* Minimal Footer */}
      <footer className="w-full text-center py-3 bg-slate-950/80 border-t border-cyan-500/20 text-[11px] text-slate-400 flex items-center justify-center gap-4 shrink-0">
        <span>FabricaQuiz • Arena Interativa em Sala</span>
        {isAdmin && (
          <>
            <span>•</span>
            <button
              onClick={handleOpenAdmin}
              className="text-amber-400 hover:underline font-bold"
            >
              Acessar Painel ADM
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

export default App;
