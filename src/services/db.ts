import { Team, Participant, RoundLog } from '../types';

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
}

export const dbService = new DatabaseService();
