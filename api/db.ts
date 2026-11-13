import { neon } from '@neondatabase/serverless';

// Default connection string from Neon project or environment variable
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_mcyb8A5rtqQE@ep-shy-sun-b6gcu3q3-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require";

function normalizeSessionId(raw?: string): string {
  if (!raw || raw === 'default-session' || raw.startsWith('sala-ti-')) {
    return 'sala-principal';
  }
  return raw;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const sql = neon(DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const sessionId = normalizeSessionId(req.query?.session_id as string);

      // Ensure session exists
      const sessions = await sql`
        SELECT * FROM swot_game_sessions WHERE id = ${sessionId} LIMIT 1
      `;

      const teams = await sql`
        SELECT * FROM swot_teams WHERE session_id = ${sessionId} ORDER BY id ASC
      `;

      const participants = await sql`
        SELECT 
          id, 
          session_id, 
          team_id as "teamId", 
          team_id, 
          user_name as name, 
          user_name, 
          avatar, 
          joined_at as "joinedAt", 
          joined_at
        FROM swot_participants 
        WHERE session_id = ${sessionId} 
        ORDER BY id ASC
      `;

      const logs = await sql`
        SELECT * FROM swot_round_logs WHERE session_id = ${sessionId} ORDER BY id DESC LIMIT 50
      `;

      return res.status(200).json({
        success: true,
        sessionId,
        session: sessions[0] || null,
        teams,
        participants,
        logs
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const sessionId = normalizeSessionId(body.sessionId);
      const { action } = body;

      // 1. Initialize or Sync Session
      if (action === 'init_session') {
        const { title = 'Sessão SWOT Kahoot' } = body;
        await sql`
          INSERT INTO swot_game_sessions (id, title, updated_at)
          VALUES (${sessionId}, ${title}, NOW())
          ON CONFLICT (id) DO UPDATE SET updated_at = NOW(), title = ${title}
        `;
        return res.status(200).json({ success: true, message: 'Sessão inicializada', sessionId });
      }

      // 2. Add or Update Participant
      if (action === 'add_participant') {
        const { teamId, userName, avatar = '👨‍💻' } = body;
        const inserted = await sql`
          INSERT INTO swot_participants (session_id, team_id, user_name, avatar, joined_at)
          VALUES (${sessionId}, ${Number(teamId)}, ${userName}, ${avatar}, NOW())
          RETURNING id, session_id, team_id, team_id as "teamId", user_name, user_name as name, avatar, joined_at, joined_at as "joinedAt"
        `;
        return res.status(200).json({ success: true, participant: inserted[0], sessionId });
      }

      // 3. Remove Participant
      if (action === 'remove_participant') {
        const { participantId, userName } = body;
        if (participantId) {
          await sql`
            DELETE FROM swot_participants WHERE id = ${participantId} AND session_id = ${sessionId}
          `;
        } else if (userName) {
          await sql`
            DELETE FROM swot_participants WHERE user_name = ${userName} AND session_id = ${sessionId}
          `;
        }
        return res.status(200).json({ success: true, sessionId });
      }

      // 4. Set Active Representative of a Team
      if (action === 'set_representative') {
        const { teamId, participantId } = body;
        await sql`
          UPDATE swot_participants SET is_active_representative = FALSE
          WHERE session_id = ${sessionId} AND team_id = ${Number(teamId)}
        `;
        await sql`
          UPDATE swot_participants SET is_active_representative = TRUE
          WHERE session_id = ${sessionId} AND id = ${Number(participantId)}
        `;
        return res.status(200).json({ success: true, sessionId });
      }

      // 5. Update Team Scores / Candies
      if (action === 'update_teams') {
        const { teams } = body;
        if (Array.isArray(teams)) {
          for (const t of teams) {
            await sql`
              INSERT INTO swot_teams (session_id, id, name, color, points, candies, chocolates, answers_correct, answers_wrong, is_winner)
              VALUES (${sessionId}, ${Number(t.id)}, ${t.name}, ${t.color || '#E21B3C'}, ${t.points || 0}, ${t.candies || 0}, ${t.chocolates || 0}, ${t.answersCorrect || 0}, ${t.answersWrong || 0}, ${t.isWinner || false})
              ON CONFLICT (session_id, id) DO UPDATE SET
                name = EXCLUDED.name,
                points = EXCLUDED.points,
                candies = EXCLUDED.candies,
                chocolates = EXCLUDED.chocolates,
                answers_correct = EXCLUDED.answers_correct,
                answers_wrong = EXCLUDED.answers_wrong,
                is_winner = EXCLUDED.is_winner
            `;
          }
        }
        return res.status(200).json({ success: true, sessionId });
      }

      // 6. Admin Declares Winner
      if (action === 'declare_winner') {
        const { winnerTeamId } = body;
        await sql`
          UPDATE swot_teams SET is_winner = FALSE WHERE session_id = ${sessionId}
        `;
        await sql`
          UPDATE swot_teams SET is_winner = TRUE WHERE session_id = ${sessionId} AND id = ${Number(winnerTeamId)}
        `;
        await sql`
          UPDATE swot_game_sessions SET winner_team_id = ${Number(winnerTeamId)}, current_stage = 'podium', updated_at = NOW()
          WHERE id = ${sessionId}
        `;
        return res.status(200).json({ success: true, winnerTeamId, sessionId });
      }

      // 7. Log Round Result
      if (action === 'log_round') {
        const { questionId, answeringTeamId, disputeWinnerTeamId, disputeMode, isPassed, selectedIndex, isCorrect, pointsAwarded } = body;
        await sql`
          INSERT INTO swot_round_logs (
            session_id, question_id, answering_team_id, dispute_winner_team_id,
            dispute_mode, is_passed, selected_index, is_correct, points_awarded
          ) VALUES (
            ${sessionId}, ${Number(questionId)}, ${Number(answeringTeamId)}, ${Number(disputeWinnerTeamId)},
            ${disputeMode}, ${Boolean(isPassed)}, ${Number(selectedIndex)}, ${Boolean(isCorrect)}, ${Number(pointsAwarded)}
          )
        `;
        return res.status(200).json({ success: true, sessionId });
      }

      // 8. Reset Game
      if (action === 'reset_game') {
        await sql`DELETE FROM swot_round_logs WHERE session_id = ${sessionId}`;
        await sql`UPDATE swot_teams SET points = 0, candies = 0, chocolates = 0, answers_correct = 0, answers_wrong = 0, is_winner = FALSE WHERE session_id = ${sessionId}`;
        await sql`UPDATE swot_game_sessions SET current_question = 0, current_stage = 'intro', winner_team_id = NULL WHERE id = ${sessionId}`;
        return res.status(200).json({ success: true, sessionId });
      }

      return res.status(400).json({ error: 'Ação desconhecida' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Database API error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no banco de dados' });
  }
}
