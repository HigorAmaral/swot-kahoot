import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// The verified Neon PostgreSQL connection string with our SWOT tables and participants
const DATABASE_URL = "postgresql://neondb_owner:npg_mcyb8A5rtqQE@ep-shy-sun-b6gcu3q3-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require";

function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(`fabrica_salt_${pwd}`).digest('hex');
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FQ-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function normalizeSessionId(raw?: string): string {
  if (!raw || raw === 'default-session' || raw.startsWith('sala-ti-')) {
    return 'sala-principal';
  }
  return raw;
}

// Ensure tables exist on startup
async function ensureTables(sql: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS swot_game_sessions (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL DEFAULT 'Sessão SWOT Kahoot',
        current_question INT DEFAULT 0,
        current_stage VARCHAR(50) DEFAULT 'intro',
        winner_team_id INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS swot_teams (
        id INT NOT NULL,
        session_id VARCHAR(64) NOT NULL,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20) NOT NULL,
        points INT DEFAULT 0,
        candies INT DEFAULT 0,
        chocolates INT DEFAULT 0,
        answers_correct INT DEFAULT 0,
        answers_wrong INT DEFAULT 0,
        is_winner BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (session_id, id)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS swot_participants (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        team_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        avatar VARCHAR(50) DEFAULT '👨‍💻',
        is_active_representative BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS swot_round_logs (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        question_id INT NOT NULL,
        answering_team_id INT,
        dispute_winner_team_id INT,
        dispute_mode VARCHAR(50),
        is_passed BOOLEAN DEFAULT FALSE,
        selected_index INT,
        is_correct BOOLEAN DEFAULT FALSE,
        points_awarded INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fabrica_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(80) UNIQUE NOT NULL,
        display_name VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(50) DEFAULT '👨‍💻',
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      ALTER TABLE fabrica_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fabrica_quizzes (
        id SERIAL PRIMARY KEY,
        share_code VARCHAR(32) UNIQUE NOT NULL,
        owner_username VARCHAR(80) NOT NULL,
        owner_name VARCHAR(120) NOT NULL,
        title VARCHAR(255) NOT NULL,
        questions_json TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fabrica_quiz_shares (
        id SERIAL PRIMARY KEY,
        quiz_share_code VARCHAR(32) NOT NULL,
        sender_username VARCHAR(80) NOT NULL,
        recipient_username VARCHAR(80) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (quiz_share_code, recipient_username)
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fabrica_email_invites (
        id SERIAL PRIMARY KEY,
        quiz_share_code VARCHAR(32) NOT NULL,
        sender_username VARCHAR(80) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (quiz_share_code, recipient_email)
      );
    `;
  } catch (e) {
    console.error("Table ensure error:", e);
  }
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
      const reqType = req.query?.type as string | undefined;

      // Fetch shared quiz by share code
      if (reqType === 'quiz') {
        await ensureTables(sql);
        const code = String(req.query?.code || '').trim().toUpperCase();
        if (!code) return res.status(400).json({ error: 'Código do quiz inválido' });
        const rows = await sql`
          SELECT id, share_code, owner_username, owner_name, title, questions_json, created_at
          FROM fabrica_quizzes
          WHERE share_code = ${code}
          LIMIT 1
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Quiz não encontrado para este código' });
        }
        const r = rows[0];
        return res.status(200).json({
          success: true,
          quiz: {
            id: r.id,
            shareCode: r.share_code,
            ownerUsername: r.owner_username,
            ownerName: r.owner_name,
            title: r.title,
            questions: JSON.parse(r.questions_json),
            createdAt: r.created_at,
          }
        });
      }

      // Fetch user's own quizzes + quizzes shared with them
      if (reqType === 'my_quizzes') {
        await ensureTables(sql);
        const username = String(req.query?.username || '').trim().toLowerCase();
        if (!username) return res.status(400).json({ error: 'Usuário não informado' });

        const ownRows = await sql`
          SELECT id, share_code, owner_username, owner_name, title, questions_json, created_at
          FROM fabrica_quizzes
          WHERE owner_username = ${username}
          ORDER BY updated_at DESC
        `;

        const userRows = await sql`SELECT email FROM fabrica_users WHERE username = ${username} LIMIT 1`;
        const userEmail = userRows[0]?.email ? String(userRows[0].email).trim().toLowerCase() : '';

        const receivedRows = await sql`
          SELECT DISTINCT ON (q.share_code) q.id, q.share_code, q.owner_username, q.owner_name, q.title, q.questions_json, q.created_at, s.sender_username
          FROM fabrica_quiz_shares s
          JOIN fabrica_quizzes q ON q.share_code = s.quiz_share_code
          WHERE s.recipient_username = ${username}
          ORDER BY q.share_code, s.created_at DESC
        `;

        const emailInviteRows = userEmail
          ? await sql`
              SELECT DISTINCT ON (q.share_code) q.id, q.share_code, q.owner_username, q.owner_name, q.title, q.questions_json, q.created_at, e.sender_username
              FROM fabrica_email_invites e
              JOIN fabrica_quizzes q ON q.share_code = e.quiz_share_code
              WHERE e.recipient_email = ${userEmail}
              ORDER BY q.share_code, e.created_at DESC
            `
          : [];

        const mergedMap = new Map<string, any>();
        for (const r of [...receivedRows, ...emailInviteRows]) {
          if (!mergedMap.has(r.share_code)) {
            mergedMap.set(r.share_code, {
              id: r.id,
              shareCode: r.share_code,
              ownerUsername: r.owner_username,
              ownerName: r.owner_name,
              title: r.title,
              questions: JSON.parse(r.questions_json),
              createdAt: r.created_at,
              sharedBy: r.sender_username,
            });
          }
        }

        return res.status(200).json({
          success: true,
          myQuizzes: ownRows.map((r: any) => ({
            id: r.id,
            shareCode: r.share_code,
            ownerUsername: r.owner_username,
            ownerName: r.owner_name,
            title: r.title,
            questions: JSON.parse(r.questions_json),
            createdAt: r.created_at,
          })),
          receivedQuizzes: Array.from(mergedMap.values()),
        });
      }

      const sessionId = normalizeSessionId(req.query?.session_id as string);

      let participants: any[] = [];
      let teams: any[] = [];
      let sessions: any[] = [];
      let logs: any[] = [];

      try {
        participants = await sql`
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

        teams = await sql`
          SELECT * FROM swot_teams WHERE session_id = ${sessionId} ORDER BY id ASC
        `;

        sessions = await sql`
          SELECT * FROM swot_game_sessions WHERE id = ${sessionId} LIMIT 1
        `;

        logs = await sql`
          SELECT * FROM swot_round_logs WHERE session_id = ${sessionId} ORDER BY id DESC LIMIT 50
        `;
      } catch (err: any) {
        // If tables were missing, auto-create and retry
        await ensureTables(sql);
        participants = await sql`
          SELECT id, session_id, team_id as "teamId", team_id, user_name as name, user_name, avatar, joined_at as "joinedAt", joined_at
          FROM swot_participants WHERE session_id = ${sessionId} ORDER BY id ASC
        `;
      }

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

      // Ensure tables exist on POST
      await ensureTables(sql);

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

      // 9. Register User
      if (action === 'register_user') {
        const username = String(body.username || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
        const displayName = String(body.displayName || '').trim();
        const password = String(body.password || '');
        const avatar = String(body.avatar || '👨‍💻');
        const email = body.email ? String(body.email).trim().toLowerCase() : null;

        if (!username || username.length < 3 || !displayName || password.length < 3) {
          return res.status(400).json({ error: 'Preencha usuário (mín. 3 letras), nome e senha (mín. 3 caracteres).' });
        }

        const existing = await sql`SELECT id FROM fabrica_users WHERE username = ${username} LIMIT 1`;
        if (existing.length > 0) {
          return res.status(409).json({ error: 'Este nome de usuário já está em uso. Escolha outro!' });
        }

        const inserted = await sql`
          INSERT INTO fabrica_users (username, display_name, password_hash, avatar, email)
          VALUES (${username}, ${displayName}, ${hashPassword(password)}, ${avatar}, ${email})
          RETURNING id, username, display_name, avatar, email
        `;
        const u = inserted[0];
        return res.status(200).json({
          success: true,
          user: { id: u.id, username: u.username, displayName: u.display_name, avatar: u.avatar, email: u.email || undefined }
        });
      }

      // 10. Login User
      if (action === 'login_user') {
        const username = String(body.username || '').trim().toLowerCase();
        const password = String(body.password || '');

        if (!username || !password) {
          return res.status(400).json({ error: 'Informe usuário e senha.' });
        }

        const rows = await sql`
          SELECT id, username, display_name, password_hash, avatar, email
          FROM fabrica_users
          WHERE username = ${username}
          LIMIT 1
        `;
        if (rows.length === 0 || rows[0].password_hash !== hashPassword(password)) {
          return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }
        const u = rows[0];
        return res.status(200).json({
          success: true,
          user: { id: u.id, username: u.username, displayName: u.display_name, avatar: u.avatar, email: u.email || undefined }
        });
      }

      // 11. Save Quiz
      if (action === 'save_quiz') {
        const ownerUsername = String(body.ownerUsername || '').trim().toLowerCase();
        const ownerName = String(body.ownerName || ownerUsername);
        const title = String(body.title || 'Meu Quiz no FabricaQuiz').trim();
        const questionsJson = JSON.stringify(body.questions || []);
        const shareCode = body.shareCode ? String(body.shareCode).trim().toUpperCase() : generateShareCode();

        if (!ownerUsername) {
          return res.status(400).json({ error: 'Usuário proprietário não informado.' });
        }

        const saved = await sql`
          INSERT INTO fabrica_quizzes (share_code, owner_username, owner_name, title, questions_json, updated_at)
          VALUES (${shareCode}, ${ownerUsername}, ${ownerName}, ${title}, ${questionsJson}, NOW())
          ON CONFLICT (share_code) DO UPDATE SET
            title = EXCLUDED.title,
            questions_json = EXCLUDED.questions_json,
            updated_at = NOW()
          RETURNING id, share_code, owner_username, owner_name, title, created_at
        `;
        const q = saved[0];
        return res.status(200).json({
          success: true,
          quiz: {
            id: q.id,
            shareCode: q.share_code,
            ownerUsername: q.owner_username,
            ownerName: q.owner_name,
            title: q.title,
            questions: body.questions || [],
            createdAt: q.created_at,
          }
        });
      }

      // 12. Send Quiz directly to another user
      if (action === 'send_quiz_to_user') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        const senderUsername = String(body.senderUsername || '').trim().toLowerCase();
        const recipientUsername = String(body.recipientUsername || '').trim().toLowerCase().replace(/^@/, '');

        if (!shareCode || !recipientUsername) {
          return res.status(400).json({ error: 'Informe o código do quiz e o usuário destinatário.' });
        }

        const recipientRows = await sql`
          SELECT username FROM fabrica_users WHERE username = ${recipientUsername} LIMIT 1
        `;
        if (recipientRows.length === 0) {
          return res.status(404).json({ error: `Usuário "@${recipientUsername}" não encontrado no FabricaQuiz.` });
        }

        await sql`
          INSERT INTO fabrica_quiz_shares (quiz_share_code, sender_username, recipient_username)
          VALUES (${shareCode}, ${senderUsername}, ${recipientUsername})
          ON CONFLICT (quiz_share_code, recipient_username) DO NOTHING
        `;
        return res.status(200).json({ success: true, recipientUsername });
      }

      // 13. Delete Quiz
      if (action === 'delete_quiz') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        const ownerUsername = String(body.ownerUsername || '').trim().toLowerCase();
        await sql`
          DELETE FROM fabrica_quizzes WHERE share_code = ${shareCode} AND owner_username = ${ownerUsername}
        `;
        return res.status(200).json({ success: true });
      }

      // 14. Update User Profile
      if (action === 'update_profile') {
        const username = String(body.username || '').trim().toLowerCase();
        const displayName = String(body.displayName || '').trim();
        const avatar = String(body.avatar || '👨‍💻');
        const newPassword = body.newPassword ? String(body.newPassword) : '';

        if (!username || !displayName) {
          return res.status(400).json({ error: 'Nome de exibição é obrigatório.' });
        }

        if (newPassword && newPassword.length < 3) {
          return res.status(400).json({ error: 'A nova senha deve ter pelo menos 3 caracteres.' });
        }

        const updated = newPassword
          ? await sql`
              UPDATE fabrica_users
              SET display_name = ${displayName}, avatar = ${avatar}, password_hash = ${hashPassword(newPassword)}
              WHERE username = ${username}
              RETURNING id, username, display_name, avatar
            `
          : await sql`
              UPDATE fabrica_users
              SET display_name = ${displayName}, avatar = ${avatar}
              WHERE username = ${username}
              RETURNING id, username, display_name, avatar
            `;

        if (updated.length === 0) {
          return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const u = updated[0];
        return res.status(200).json({
          success: true,
          user: { id: u.id, username: u.username, displayName: u.display_name, avatar: u.avatar }
        });
      }

      // 15. Send Quiz to Email (even if recipient doesn't have an account yet)
      if (action === 'send_quiz_to_email') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        const senderUsername = String(body.senderUsername || '').trim().toLowerCase();
        const recipientEmail = String(body.recipientEmail || '').trim().toLowerCase();

        if (!shareCode || !recipientEmail || !recipientEmail.includes('@')) {
          return res.status(400).json({ error: 'Informe um e-mail válido.' });
        }

        await sql`
          INSERT INTO fabrica_email_invites (quiz_share_code, sender_username, recipient_email)
          VALUES (${shareCode}, ${senderUsername}, ${recipientEmail})
          ON CONFLICT (quiz_share_code, recipient_email) DO NOTHING
        `;

        return res.status(200).json({ success: true, recipientEmail });
      }

      return res.status(400).json({ error: 'Ação desconhecida' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Database API error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no banco de dados' });
  }
}
