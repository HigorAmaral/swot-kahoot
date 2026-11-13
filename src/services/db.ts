import { Team, Participant, RoundLog, UserAccount, SavedQuiz, Question } from '../types';

export const SESSION_KEY = 'swot_session_id';
const LOCAL_TEAMS_KEY = 'swot_local_teams';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'sala-principal';
  const params = new URLSearchParams(window.location.search);
  const paramSession = params.get('sala') || params.get('session') || params.get('pin');
  if (paramSession) {
    localStorage.setItem(SESSION_KEY, paramSession);
    return paramSession;
  }
  // Default to standard shared room so every student and projector connects to the same room
  localStorage.setItem(SESSION_KEY, 'sala-principal');
  return 'sala-principal';
}

export class DatabaseService {
  private isConnected: boolean = true;
  private lastSyncTime: Date = new Date();

  public getStatus() {
    return {
      connected: this.isConnected,
      lastSync: this.lastSyncTime,
    };
  }

  // Fetch full state
  async loadState(sessionId: string): Promise<{
    teams?: any[];
    participants?: Participant[];
    logs?: any[];
  } | null> {
    try {
      const res = await fetch(`/api/db?session_id=${sessionId}`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      this.isConnected = true;
      this.lastSyncTime = new Date();

      // Normalize participants so name and teamId are guaranteed
      if (Array.isArray(data.participants)) {
        data.participants = data.participants.map((p: any) => ({
          id: String(p.id),
          name: p.name || p.user_name || 'Aluno',
          avatar: p.avatar || '👨‍💻',
          teamId: Number(p.teamId || p.team_id || 1),
          joinedAt: p.joinedAt || p.joined_at || new Date().toISOString(),
          isRepresentative: Boolean(p.is_active_representative || p.isRepresentative),
        }));
      }

      return data;
    } catch {
      this.isConnected = false;
      return null;
    }
  }

  // Add participant to a team
  async addParticipant(sessionId: string, teamId: number, userName: string, avatar: string = '👨‍💻'): Promise<Participant> {
    const localPart: Participant = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      name: userName,
      avatar,
      teamId,
      joinedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_participant',
          sessionId,
          teamId,
          userName,
          avatar
        }),
      });
      if (res.ok) {
        const data = await res.json();
        this.isConnected = true;
        if (data.participant?.id) {
          localPart.id = String(data.participant.id);
        }
      }
    } catch {
      this.isConnected = false;
    }

    return localPart;
  }

  // Remove participant
  async removeParticipant(sessionId: string, participantId: string, userName: string) {
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_participant',
          sessionId,
          participantId: isNaN(Number(participantId)) ? undefined : Number(participantId),
          userName
        }),
      });
      this.isConnected = true;
    } catch {
      this.isConnected = false;
    }
  }

  // Sync teams state
  async syncTeams(sessionId: string, teams: Team[]) {
    try {
      localStorage.setItem(LOCAL_TEAMS_KEY, JSON.stringify(teams));
    } catch {}

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_teams',
          sessionId,
          teams: teams.map(t => ({
            id: t.id,
            name: t.name,
            color: t.color,
            points: t.points,
            candies: t.candies,
            chocolates: t.chocolates,
            answersCorrect: t.answersCorrect,
            answersWrong: t.answersWrong,
            isWinner: t.isWinner,
          }))
        }),
      });
      if (res.ok) {
        this.isConnected = true;
        this.lastSyncTime = new Date();
      }
    } catch {
      this.isConnected = false;
    }
  }

  // Admin declares winner in database
  async declareWinner(sessionId: string, winnerTeamId: number) {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'declare_winner',
          sessionId,
          winnerTeamId
        }),
      });
      if (res.ok) this.isConnected = true;
    } catch {
      this.isConnected = false;
    }
  }

  // Log round
  async logRound(sessionId: string, log: Omit<RoundLog, 'id' | 'timestamp'>) {
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_round',
          sessionId,
          questionId: log.questionId,
          answeringTeamId: log.answeringTeamId,
          disputeWinnerTeamId: log.disputeWinnerTeamId,
          disputeMode: log.disputeMode,
          isPassed: log.isPassed,
          selectedIndex: log.selectedOptionIndex,
          isCorrect: log.isCorrect,
          pointsAwarded: log.pointsAwarded,
        }),
      });
      this.isConnected = true;
    } catch {
      this.isConnected = false;
    }
  }

  // Reset Game
  async resetGame(sessionId: string) {
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_game',
          sessionId,
        }),
      });
      this.isConnected = true;
    } catch {
      this.isConnected = false;
    }
  }

  // Register User
  async registerUser(username: string, displayName: string, password: string, avatar: string, email?: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_user',
          username,
          displayName,
          password,
          avatar,
          email: email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Erro ao criar conta' };
      this.isConnected = true;
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Login User
  async loginUser(username: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login_user',
          username,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Usuário ou senha inválidos' };
      this.isConnected = true;
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Save Quiz (creates shareCode or updates existing)
  async saveQuiz(ownerUsername: string, ownerName: string, title: string, questions: Question[], shareCode?: string): Promise<{ success: boolean; quiz?: SavedQuiz; error?: string }> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_quiz',
          ownerUsername,
          ownerName,
          title,
          questions,
          shareCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Erro ao salvar quiz' };
      this.isConnected = true;
      return { success: true, quiz: data.quiz };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Get User's own quizzes and received quizzes
  async getMyQuizzes(username: string): Promise<{ myQuizzes: SavedQuiz[]; receivedQuizzes: SavedQuiz[] }> {
    try {
      const res = await fetch(`/api/db?type=my_quizzes&username=${encodeURIComponent(username)}`);
      if (!res.ok) return { myQuizzes: [], receivedQuizzes: [] };
      const data = await res.json();
      return {
        myQuizzes: data.myQuizzes || [],
        receivedQuizzes: data.receivedQuizzes || [],
      };
    } catch {
      return { myQuizzes: [], receivedQuizzes: [] };
    }
  }

  // Get Shared Quiz by Code
  async getQuizByCode(code: string): Promise<{ success: boolean; quiz?: SavedQuiz; error?: string }> {
    try {
      const cleanCode = code.trim().toUpperCase().replace(/^.*QUIZ=/i, '');
      const res = await fetch(`/api/db?type=quiz&code=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Quiz não encontrado' };
      return { success: true, quiz: data.quiz };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Search users in DB for autocomplete suggestions
  async searchUsers(
    query: string,
    excludeUsername?: string
  ): Promise<Array<{ username: string; displayName: string; avatar: string }>> {
    const clean = query.trim().replace(/^@/, '');
    if (!clean) return [];
    try {
      const params = new URLSearchParams({
        type: 'search_users',
        q: clean,
        exclude: excludeUsername || '',
      });
      const res = await fetch(`/api/db?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.users) ? data.users : [];
    } catch {
      return [];
    }
  }

  // Send Quiz directly to another user
  async sendQuizToUser(shareCode: string, senderUsername: string, recipientUsername: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_quiz_to_user',
          shareCode,
          senderUsername,
          recipientUsername,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Não foi possível enviar o quiz' };
      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Delete Quiz
  async deleteQuiz(shareCode: string, ownerUsername: string): Promise<boolean> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_quiz',
          shareCode,
          ownerUsername,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Update User Profile
  async updateProfile(username: string, displayName: string, avatar: string, newPassword?: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          username,
          displayName,
          avatar,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Erro ao atualizar perfil' };
      this.isConnected = true;
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Send Quiz to Email
  async sendQuizToEmail(
    shareCode: string,
    senderUsername: string,
    recipientEmail: string,
    senderName?: string
  ): Promise<{ success: boolean; emailSent?: boolean; needsEmailConfig?: boolean; emailError?: string; error?: string }> {
    try {
      const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://swot-kahoot.vercel.app';
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_quiz_to_email',
          shareCode,
          senderUsername,
          senderName: senderName || senderUsername,
          recipientEmail,
          originUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Erro ao enviar por e-mail' };
      return {
        success: true,
        emailSent: data.emailSent,
        needsEmailConfig: data.needsEmailConfig,
        emailError: data.emailError,
      };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Request password reset code by email
  async requestPasswordReset(
    identifier: string
  ): Promise<{ success: boolean; username?: string; maskedEmail?: string; error?: string }> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_password_reset',
          identifier: identifier.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Erro ao solicitar recuperação.' };
      return { success: true, username: data.username, maskedEmail: data.maskedEmail };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }

  // Confirm password reset code and set new password
  async confirmPasswordReset(
    identifier: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; username?: string; error?: string }> {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_password_reset',
          identifier: identifier.trim(),
          code: code.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Código inválido ou expirado.' };
      return { success: true, username: data.username };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  }
}

export const dbService = new DatabaseService();
