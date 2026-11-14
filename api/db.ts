import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Read Neon PostgreSQL connection string from environment variables (never hardcode credentials in Git)
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

function buildQuizEmailHtml(params: {
  senderName: string;
  senderUsername: string;
  quizTitle: string;
  shareCode: string;
  quizUrl: string;
  questionCount: number;
}): string {
  const { senderName, senderUsername, quizTitle, shareCode, quizUrl, questionCount } = params;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Convite ArenaQuiz</title>
  <style>
    body { margin: 0; padding: 0; background-color: #030712; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .wrapper { width: 100%; background-color: #030712; padding: 32px 16px; }
    .card { max-width: 560px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55); }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%); padding: 32px 28px; text-align: center; }
    .logo-badge { display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: #030712; color: #34d399; font-size: 22px; font-weight: 900; margin-bottom: 12px; letter-spacing: -1px; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 900; color: #030712; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; font-weight: 700; color: #022c22; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px; }
    .quiz-box { background: #1e293b; border: 1px solid #334155; border-left: 4px solid #10b981; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .quiz-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #34d399; font-weight: 800; margin: 0 0 6px; }
    .quiz-title { font-size: 20px; font-weight: 900; color: #ffffff; margin: 0 0 10px; }
    .quiz-meta { font-size: 13px; color: #94a3b8; margin: 0; }
    .code-pill { display: inline-block; background: #022c22; border: 1px solid #10b981; color: #6ee7b7; font-family: monospace; font-size: 14px; font-weight: 800; padding: 4px 10px; border-radius: 8px; margin-left: 6px; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%); color: #030712 !important; text-decoration: none; font-weight: 900; font-size: 15px; padding: 15px 32px; border-radius: 14px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35); }
    .fallback { background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; font-size: 12px; color: #94a3b8; word-break: break-all; }
    .fallback a { color: #38bdf8; text-decoration: none; }
    .footer { padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; background: #0b1120; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo-badge">FQ</div>
        <h1>ArenaQuiz</h1>
        <p>Convite para Quiz Interativo</p>
      </div>
      <div class="content">
        <p class="greeting">
          Olá! <strong style="color:#ffffff;">${senderName}</strong> (<span style="color:#38bdf8;">@${senderUsername}</span>) enviou um Kahoot para você jogar no <strong>ArenaQuiz</strong>:
        </p>
        <div class="quiz-box">
          <p class="quiz-label">Quiz Compartilhado</p>
          <p class="quiz-title">${quizTitle}</p>
          <p class="quiz-meta">
            ${questionCount} pergunta(s) &nbsp;•&nbsp; Código: <span class="code-pill">${shareCode}</span>
          </p>
        </div>
        <div class="cta-wrap">
          <a href="${quizUrl}" class="cta-btn">🎯 Abrir e Jogar Agora</a>
        </div>
        <div class="fallback">
          Se o botão não abrir, copie e cole este link no navegador:<br />
          <a href="${quizUrl}">${quizUrl}</a>
        </div>
      </div>
      <div class="footer">
        Enviado via <strong>ArenaQuiz</strong> • Sistema Interativo de Quiz em Sala
      </div>
    </div>
  </div>
</body>
</html>`;
}

function hashPassword(pwd: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(pwd, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(pwd: string, storedHash: string): { valid: boolean; needsUpgrade: boolean } {
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return { valid: false, needsUpgrade: false };
    const [, salt, hashHex] = parts;
    const derived = crypto.scryptSync(pwd, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (derived.length !== storedBuf.length) return { valid: false, needsUpgrade: false };
    return { valid: crypto.timingSafeEqual(derived, storedBuf), needsUpgrade: false };
  }
  const legacyHash = crypto.createHash('sha256').update(`fabrica_salt_${pwd}`).digest('hex');
  return { valid: storedHash === legacyHash, needsUpgrade: true };
}

function getSessionSecret(): string {
  return process.env.AUTH_SECRET || process.env.DATABASE_URL || 'arenaquiz-session-secret';
}

function signSessionToken(payload: { id: number; username: string }): string {
  const data = Buffer.from(
    JSON.stringify({ id: payload.id, username: payload.username, iat: Date.now() })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifySessionToken(token: string): { id: number; username: string } | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(data).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!parsed?.username) return null;
    return { id: Number(parsed.id), username: String(parsed.username) };
  } catch {
    return null;
  }
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FQ-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function sendEmailViaProvider(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ emailSent: boolean; provider: string; emailError?: string }> {
  let emailSent = false;
  let provider = 'none';
  let emailError: string | undefined;

  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'ArenaQuiz <onboarding@resend.dev>';
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      });
      if (r.ok) {
        emailSent = true;
        provider = 'resend';
      } else {
        const errData = await r.json().catch(() => ({}));
        emailError = errData?.message || `Resend status ${r.status}`;
      }
    } catch (e: any) {
      emailError = e.message;
    }
  } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE !== 'false',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: `"ArenaQuiz" <${process.env.SMTP_USER}>`,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      emailSent = true;
      provider = 'smtp';
    } catch (e: any) {
      emailError = e.message;
    }
  }

  return { emailSent, provider, emailError };
}

function buildPasswordResetEmailHtml(params: {
  displayName: string;
  username: string;
  code: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0f172a;border:1px solid rgba(34,211,238,0.28);border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
        <tr>
          <td style="background:linear-gradient(135deg,#059669,#06b6d4);padding:26px 28px;text-align:center;">
            <div style="display:inline-block;background:#020617;color:#34d399;font-weight:900;font-size:18px;padding:8px 14px;border-radius:12px;margin-bottom:10px;">FQ</div>
            <h1 style="margin:0;color:#020617;font-size:22px;font-weight:900;">Recuperação de Senha</h1>
            <p style="margin:4px 0 0;color:#064e3b;font-size:13px;font-weight:700;">ArenaQuiz • Segurança da Conta</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Olá, <strong>${params.displayName}</strong> (<span style="color:#34d399;">@${params.username}</span>)!</p>
            <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;line-height:1.6;">Use o código de verificação abaixo para criar uma nova senha no <strong>ArenaQuiz</strong>. Ele expira em <strong>15 minutos</strong>:</p>
            <div style="background:#020617;border:2px dashed rgba(52,211,153,0.5);border-radius:16px;padding:20px;text-align:center;margin-bottom:20px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;margin-bottom:6px;font-weight:800;">Código de Recuperação</div>
              <div style="font-size:34px;font-weight:900;letter-spacing:8px;color:#34d399;font-family:monospace;">${params.code}</div>
            </div>
            <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Se você não solicitou a troca de senha, pode ignorar este e-mail com segurança.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function normalizeSessionId(raw?: string): string {
  if (!raw || raw === 'default-session' || raw.startsWith('sala-ti-')) {
    return 'sala-principal';
  }
  return raw;
}

let tablesEnsuredPromise: Promise<void> | null = null;

// Ensure tables exist once per warm serverless instance
async function ensureTables(sql: any) {
  if (tablesEnsuredPromise) return tablesEnsuredPromise;
  tablesEnsuredPromise = (async () => {
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
      UPDATE fabrica_users
      SET email = 'amarahigor@gmail.com'
      WHERE LOWER(username) = 'higoramaral' AND (email IS NULL OR email = '');
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fabrica_quizzes (
        id SERIAL PRIMARY KEY,
        share_code VARCHAR(32) UNIQUE NOT NULL,
        owner_username VARCHAR(80) NOT NULL,
        owner_name VARCHAR(120) NOT NULL,
        title VARCHAR(255) NOT NULL,
        questions_json TEXT NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        likes_count INTEGER DEFAULT 0,
        plays_count INTEGER DEFAULT 0,
        category VARCHAR(80) DEFAULT 'Geral',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`ALTER TABLE fabrica_quizzes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE fabrica_quizzes ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE fabrica_quizzes ADD COLUMN IF NOT EXISTS plays_count INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE fabrica_quizzes ADD COLUMN IF NOT EXISTS category VARCHAR(80) DEFAULT 'Geral';`;
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
    await sql`
      CREATE TABLE IF NOT EXISTS fabrica_password_resets (
        id SERIAL PRIMARY KEY,
        username VARCHAR(80) NOT NULL,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS fabrica_quiz_runs (
        id SERIAL PRIMARY KEY,
        quiz_share_code VARCHAR(32) NOT NULL,
        session_id VARCHAR(120) NOT NULL,
        player_username VARCHAR(80) NOT NULL,
        player_name VARCHAR(120) NOT NULL,
        player_avatar VARCHAR(50) DEFAULT '👨‍💻',
        status VARCHAR(30) DEFAULT 'playing',
        current_question INT DEFAULT 1,
        total_questions INT DEFAULT 0,
        winner_team_name VARCHAR(150),
        winner_points INT DEFAULT 0,
        winner_members TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (quiz_share_code, session_id, player_username)
      );
    `;
    } catch (e) {
      tablesEnsuredPromise = null;
      console.error("Table ensure error:", e);
    }
  })();
  return tablesEnsuredPromise;
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

  if (!DATABASE_URL) {
    return res.status(500).json({ error: 'Variável de ambiente DATABASE_URL não configurada no servidor.' });
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
          SELECT id, share_code, owner_username, owner_name, title, questions_json, is_public, likes_count, plays_count, category, created_at
          FROM fabrica_quizzes
          WHERE owner_username = ${username}
          ORDER BY updated_at DESC
        `;

        const userRows = await sql`SELECT email FROM fabrica_users WHERE username = ${username} LIMIT 1`;
        const userEmail = userRows[0]?.email ? String(userRows[0].email).trim().toLowerCase() : '';

        const receivedRows = await sql`
          SELECT DISTINCT ON (q.share_code) q.id, q.share_code, q.owner_username, q.owner_name, q.title, q.questions_json, q.is_public, q.likes_count, q.plays_count, q.category, q.created_at, s.sender_username
          FROM fabrica_quiz_shares s
          JOIN fabrica_quizzes q ON q.share_code = s.quiz_share_code
          WHERE s.recipient_username = ${username}
          ORDER BY q.share_code, s.created_at DESC
        `;

        const emailInviteRows = userEmail
          ? await sql`
              SELECT DISTINCT ON (q.share_code) q.id, q.share_code, q.owner_username, q.owner_name, q.title, q.questions_json, q.is_public, q.likes_count, q.plays_count, q.category, q.created_at, e.sender_username
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
              isPublic: Boolean(r.is_public),
              likesCount: Number(r.likes_count || 0),
              playsCount: Number(r.plays_count || 0),
              category: r.category || 'Geral',
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
            isPublic: Boolean(r.is_public),
            likesCount: Number(r.likes_count || 0),
            playsCount: Number(r.plays_count || 0),
            category: r.category || 'Geral',
            createdAt: r.created_at,
          })),
          receivedQuizzes: Array.from(mergedMap.values()),
        });
      }

      // Fetch public community quizzes
      if (reqType === 'community_quizzes') {
        await ensureTables(sql);
        const rawQ = String(req.query?.q || '').trim().toLowerCase();
        const catFilter = String(req.query?.category || '').trim();
        const escaped = rawQ.replace(/[%_\\]/g, '\\$&');
        const pattern = `%${escaped}%`;

        const rows = rawQ
          ? await sql`
              SELECT q.id, q.share_code, q.owner_username, q.owner_name, q.title, q.questions_json,
                     q.is_public, q.likes_count, q.plays_count, q.category, q.created_at, u.avatar AS owner_avatar
              FROM fabrica_quizzes q
              LEFT JOIN fabrica_users u ON LOWER(u.username) = LOWER(q.owner_username)
              WHERE q.is_public = TRUE
                AND (
                  LOWER(q.title) LIKE ${pattern}
                  OR LOWER(q.owner_name) LIKE ${pattern}
                  OR LOWER(q.owner_username) LIKE ${pattern}
                  OR LOWER(q.share_code) LIKE ${pattern}
                  OR LOWER(COALESCE(q.category, '')) LIKE ${pattern}
                )
              ORDER BY q.likes_count DESC, q.updated_at DESC
              LIMIT 50
            `
          : await sql`
              SELECT q.id, q.share_code, q.owner_username, q.owner_name, q.title, q.questions_json,
                     q.is_public, q.likes_count, q.plays_count, q.category, q.created_at, u.avatar AS owner_avatar
              FROM fabrica_quizzes q
              LEFT JOIN fabrica_users u ON LOWER(u.username) = LOWER(q.owner_username)
              WHERE q.is_public = TRUE
              ORDER BY q.likes_count DESC, q.updated_at DESC
              LIMIT 50
            `;

        const quizzes = rows
          .filter((r: any) => !catFilter || catFilter === 'Todos' || (r.category || 'Geral') === catFilter)
          .map((r: any) => ({
            id: r.id,
            shareCode: r.share_code,
            ownerUsername: r.owner_username,
            ownerName: r.owner_name,
            ownerAvatar: r.owner_avatar || '👨‍💻',
            title: r.title,
            questions: JSON.parse(r.questions_json),
            isPublic: Boolean(r.is_public),
            likesCount: Number(r.likes_count || 0),
            playsCount: Number(r.plays_count || 0),
            category: r.category || 'Geral',
            createdAt: r.created_at,
          }));

        return res.status(200).json({ success: true, quizzes });
      }

      // Search users by sequential character match (autocomplete)
      if (reqType === 'search_users') {
        await ensureTables(sql);
        const rawQ = String(req.query?.q || '').trim().replace(/^@/, '').toLowerCase();
        const excludeUsername = String(req.query?.exclude || '').trim().toLowerCase();
        if (!rawQ) {
          return res.status(200).json({ success: true, users: [] });
        }
        const escaped = rawQ.replace(/[%_\\]/g, '\\$&');
        const prefixPattern = `${escaped}%`;
        const containsPattern = `%${escaped}%`;

        const rows = await sql`
          SELECT username, display_name, avatar
          FROM fabrica_users
          WHERE (
            LOWER(username) LIKE ${containsPattern}
            OR LOWER(display_name) LIKE ${prefixPattern}
          )
          AND username <> ${excludeUsername}
          ORDER BY
            CASE WHEN LOWER(username) LIKE ${prefixPattern} THEN 0 ELSE 1 END,
            username ASC
          LIMIT 8
        `;

        return res.status(200).json({
          success: true,
          users: rows.map((r: any) => ({
            username: r.username,
            displayName: r.display_name,
            avatar: r.avatar || '👨‍💻',
          })),
        });
      }

      // Per-Kahoot Admin stats & sharing status
      if (reqType === 'quiz_stats') {
        await ensureTables(sql);
        const code = String(req.query?.shareCode || '').trim().toUpperCase();
        if (!code) return res.status(400).json({ error: 'Código do quiz não informado' });

        const quizRows = await sql`
          SELECT share_code, owner_username, owner_name, title, questions_json, created_at, updated_at
          FROM fabrica_quizzes
          WHERE share_code = ${code}
          LIMIT 1
        `;
        if (quizRows.length === 0) {
          return res.status(404).json({ error: 'Quiz não encontrado.' });
        }

        const q = quizRows[0];
        const userShares = await sql`
          SELECT recipient_username, sender_username, created_at
          FROM fabrica_quiz_shares
          WHERE quiz_share_code = ${code}
          ORDER BY created_at DESC
        `;
        const emailInvites = await sql`
          SELECT recipient_email, sender_username, created_at
          FROM fabrica_email_invites
          WHERE quiz_share_code = ${code}
          ORDER BY created_at DESC
        `;
        const runs = await sql`
          SELECT session_id, player_username, player_name, player_avatar, status, current_question, total_questions, winner_team_name, winner_points, winner_members, started_at, updated_at
          FROM fabrica_quiz_runs
          WHERE quiz_share_code = ${code}
          ORDER BY updated_at DESC
          LIMIT 30
        `;

        return res.status(200).json({
          success: true,
          stats: {
            shareCode: q.share_code,
            title: q.title,
            ownerUsername: q.owner_username,
            ownerName: q.owner_name,
            questionCount: JSON.parse(q.questions_json).length,
            createdAt: q.created_at,
            updatedAt: q.updated_at,
            userShares: userShares.map((s: any) => ({
              recipientUsername: s.recipient_username,
              senderUsername: s.sender_username,
              createdAt: s.created_at,
            })),
            emailInvites: emailInvites.map((e: any) => ({
              recipientEmail: e.recipient_email,
              senderUsername: e.sender_username,
              createdAt: e.created_at,
            })),
            runs: runs.map((r: any) => ({
              sessionId: r.session_id,
              playerUsername: r.player_username,
              playerName: r.player_name,
              playerAvatar: r.player_avatar || '👨‍💻',
              status: r.status || 'playing',
              currentQuestion: r.current_question || 1,
              totalQuestions: r.total_questions || 0,
              winnerTeamName: r.winner_team_name || null,
              winnerPoints: r.winner_points || 0,
              winnerMembers: r.winner_members || '',
              startedAt: r.started_at,
              updatedAt: r.updated_at,
            })),
          },
        });
      }

      const sessionId = normalizeSessionId(req.query?.session_id as string);

      let participants: any[] = [];
      let teams: any[] = [];
      let sessions: any[] = [];
      let logs: any[] = [];

      try {
        [participants, teams, sessions, logs] = await Promise.all([
          sql`
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
          `,
          sql`
            SELECT * FROM swot_teams WHERE session_id = ${sessionId} ORDER BY id ASC
          `,
          sql`
            SELECT * FROM swot_game_sessions WHERE id = ${sessionId} LIMIT 1
          `,
          sql`
            SELECT * FROM swot_round_logs WHERE session_id = ${sessionId} ORDER BY id DESC LIMIT 50
          `,
        ]);
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
      const authHeader = String(req.headers?.authorization || '');
      const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const authUser = bearerToken ? verifySessionToken(bearerToken) : null;
      if (bearerToken && !authUser) {
        return res.status(401).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
      }

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
        const token = signSessionToken({ id: u.id, username: u.username });
        return res.status(200).json({
          success: true,
          token,
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
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }
        const u = rows[0];
        const check = verifyPassword(password, String(u.password_hash || ''));
        if (!check.valid) {
          return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        }
        if (check.needsUpgrade) {
          await sql`
            UPDATE fabrica_users SET password_hash = ${hashPassword(password)} WHERE id = ${u.id}
          `.catch(() => {});
        }
        const token = signSessionToken({ id: u.id, username: u.username });
        return res.status(200).json({
          success: true,
          token,
          user: { id: u.id, username: u.username, displayName: u.display_name, avatar: u.avatar, email: u.email || undefined }
        });
      }

      // 11. Save Quiz
      if (action === 'save_quiz') {
        const ownerUsername = String(body.ownerUsername || '').trim().toLowerCase();
        const ownerName = String(body.ownerName || ownerUsername);
        const title = String(body.title || 'Meu Quiz no ArenaQuiz').trim();
        const questionsJson = JSON.stringify(body.questions || []);
        const shareCode = body.shareCode ? String(body.shareCode).trim().toUpperCase() : generateShareCode();
        const isPublic = Boolean(body.isPublic);
        const category = String(body.category || 'Geral').trim() || 'Geral';

        if (!ownerUsername) {
          return res.status(400).json({ error: 'Usuário proprietário não informado.' });
        }

        const saved = await sql`
          INSERT INTO fabrica_quizzes (share_code, owner_username, owner_name, title, questions_json, is_public, category, updated_at)
          VALUES (${shareCode}, ${ownerUsername}, ${ownerName}, ${title}, ${questionsJson}, ${isPublic}, ${category}, NOW())
          ON CONFLICT (share_code) DO UPDATE SET
            title = EXCLUDED.title,
            questions_json = EXCLUDED.questions_json,
            is_public = COALESCE(${body.isPublic !== undefined ? isPublic : null}, fabrica_quizzes.is_public),
            category = COALESCE(${body.category ? category : null}, fabrica_quizzes.category),
            updated_at = NOW()
          RETURNING id, share_code, owner_username, owner_name, title, is_public, likes_count, plays_count, category, created_at
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
            isPublic: Boolean(q.is_public),
            likesCount: Number(q.likes_count || 0),
            playsCount: Number(q.plays_count || 0),
            category: q.category || 'Geral',
            createdAt: q.created_at,
          }
        });
      }

      // 11b. Toggle Quiz Public status for Community
      if (action === 'toggle_quiz_public') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        const ownerUsername = String(body.ownerUsername || '').trim().toLowerCase();
        const isPublic = Boolean(body.isPublic);
        const category = body.category ? String(body.category).trim() : null;

        if (!shareCode || !ownerUsername) {
          return res.status(400).json({ error: 'Dados inválidos.' });
        }
        if (authUser && authUser.username !== ownerUsername && authUser.username !== 'higoramaral') {
          return res.status(403).json({ error: 'Sem permissão para alterar este quiz.' });
        }

        const updated = category
          ? await sql`
              UPDATE fabrica_quizzes
              SET is_public = ${isPublic}, category = ${category}, updated_at = NOW()
              WHERE share_code = ${shareCode} AND owner_username = ${ownerUsername}
              RETURNING is_public, category
            `
          : await sql`
              UPDATE fabrica_quizzes
              SET is_public = ${isPublic}, updated_at = NOW()
              WHERE share_code = ${shareCode} AND owner_username = ${ownerUsername}
              RETURNING is_public, category
            `;

        if (updated.length === 0) {
          return res.status(404).json({ error: 'Quiz não encontrado.' });
        }

        return res.status(200).json({
          success: true,
          isPublic: Boolean(updated[0].is_public),
          category: updated[0].category || 'Geral',
        });
      }

      // 11c. Like a Community Quiz
      if (action === 'like_community_quiz') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        if (!shareCode) return res.status(400).json({ error: 'Código inválido.' });

        const updated = await sql`
          UPDATE fabrica_quizzes
          SET likes_count = COALESCE(likes_count, 0) + 1
          WHERE share_code = ${shareCode} AND is_public = TRUE
          RETURNING likes_count
        `;
        if (updated.length === 0) {
          return res.status(404).json({ error: 'Quiz público não encontrado.' });
        }
        return res.status(200).json({ success: true, likesCount: Number(updated[0].likes_count || 0) });
      }

      // 11d. Increment Play Count on Community Quiz
      if (action === 'increment_quiz_play') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        if (!shareCode) return res.status(400).json({ error: 'Código inválido.' });
        await sql`
          UPDATE fabrica_quizzes
          SET plays_count = COALESCE(plays_count, 0) + 1
          WHERE share_code = ${shareCode}
        `;
        return res.status(200).json({ success: true });
      }

      // 11e. Clone a Community Quiz into user's account
      if (action === 'clone_community_quiz') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        const username = String(body.username || '').trim().toLowerCase();
        const displayName = String(body.displayName || username).trim();
        if (!shareCode || !username) {
          return res.status(400).json({ error: 'Dados incompletos para clonar quiz.' });
        }

        const sourceRows = await sql`
          SELECT title, questions_json, category
          FROM fabrica_quizzes
          WHERE share_code = ${shareCode} AND is_public = TRUE
          LIMIT 1
        `;
        if (sourceRows.length === 0) {
          return res.status(404).json({ error: 'Quiz público não encontrado.' });
        }

        const src = sourceRows[0];
        const newCode = generateShareCode();
        const clonedTitle = `${src.title} (Cópia)`;
        const inserted = await sql`
          INSERT INTO fabrica_quizzes (share_code, owner_username, owner_name, title, questions_json, is_public, category, updated_at)
          VALUES (${newCode}, ${username}, ${displayName}, ${clonedTitle}, ${src.questions_json}, FALSE, ${src.category || 'Geral'}, NOW())
          RETURNING id, share_code, owner_username, owner_name, title, is_public, likes_count, plays_count, category, created_at
        `;
        const q = inserted[0];
        return res.status(200).json({
          success: true,
          quiz: {
            id: q.id,
            shareCode: q.share_code,
            ownerUsername: q.owner_username,
            ownerName: q.owner_name,
            title: q.title,
            questions: JSON.parse(src.questions_json),
            isPublic: false,
            likesCount: 0,
            playsCount: 0,
            category: q.category || 'Geral',
            createdAt: q.created_at,
          },
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
          return res.status(404).json({ error: `Usuário "@${recipientUsername}" não encontrado no ArenaQuiz.` });
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
        if (authUser && authUser.username !== ownerUsername && authUser.username !== 'higoramaral') {
          return res.status(403).json({ error: 'Sem permissão para excluir este quiz.' });
        }
        await sql`
          DELETE FROM fabrica_quizzes WHERE share_code = ${shareCode} AND owner_username = ${ownerUsername}
        `;
        return res.status(200).json({ success: true });
      }

      // 14. Update User Profile
      if (action === 'update_profile') {
        const username = String(body.username || '').trim().toLowerCase();
        if (authUser && authUser.username !== username && authUser.username !== 'higoramaral') {
          return res.status(403).json({ error: 'Sem permissão para alterar outro perfil.' });
        }
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

      // 15. Send Quiz to Email (saves invite + sends styled HTML/CSS email if SMTP or Resend is configured)
      if (action === 'send_quiz_to_email') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        const senderUsername = String(body.senderUsername || '').trim().toLowerCase();
        const senderName = String(body.senderName || senderUsername || 'Alguém').trim();
        const recipientEmail = String(body.recipientEmail || '').trim().toLowerCase();
        const originUrl = String(body.originUrl || 'https://swot-kahoot.vercel.app').replace(/\/$/, '');

        if (!shareCode || !recipientEmail || !recipientEmail.includes('@')) {
          return res.status(400).json({ error: 'Informe um e-mail válido.' });
        }

        await sql`
          INSERT INTO fabrica_email_invites (quiz_share_code, sender_username, recipient_email)
          VALUES (${shareCode}, ${senderUsername}, ${recipientEmail})
          ON CONFLICT (quiz_share_code, recipient_email) DO NOTHING
        `;

        const quizRows = await sql`
          SELECT title, questions_json FROM fabrica_quizzes WHERE share_code = ${shareCode} LIMIT 1
        `;
        const quizTitle = quizRows[0]?.title || `Quiz ${shareCode}`;
        const questionCount = quizRows[0]?.questions_json ? JSON.parse(quizRows[0].questions_json).length : 0;
        const quizUrl = `${originUrl}/?quiz=${shareCode}`;

        const html = buildQuizEmailHtml({
          senderName,
          senderUsername,
          quizTitle,
          shareCode,
          quizUrl,
          questionCount,
        });
        const text = `Olá!\n\n${senderName} (@${senderUsername}) enviou o quiz "${quizTitle}" para você jogar no ArenaQuiz!\n\nCódigo: ${shareCode}\nLink direto: ${quizUrl}`;
        const subject = `🎯 ArenaQuiz: ${senderName} enviou "${quizTitle}" para você!`;

        const { emailSent, provider, emailError } = await sendEmailViaProvider({
          to: recipientEmail,
          subject,
          html,
          text,
        });

        return res.status(200).json({
          success: true,
          recipientEmail,
          emailSent,
          provider,
          needsEmailConfig: !emailSent,
          emailError,
          quizUrl,
        });
      }

      // 16. Request Password Reset Code via Email
      if (action === 'request_password_reset') {
        const identifier = String(body.identifier || '').trim().toLowerCase().replace(/^@/, '');
        if (!identifier) {
          return res.status(400).json({ error: 'Informe seu usuário ou e-mail cadastrado.' });
        }

        const userRows = await sql`
          SELECT username, display_name, email
          FROM fabrica_users
          WHERE LOWER(username) = ${identifier} OR LOWER(email) = ${identifier}
          LIMIT 1
        `;

        if (userRows.length === 0) {
          return res.status(404).json({ error: 'Nenhuma conta encontrada com esse usuário ou e-mail.' });
        }

        const user = userRows[0];
        const userEmail = user.email ? String(user.email).trim().toLowerCase() : '';
        if (!userEmail || !userEmail.includes('@')) {
          return res.status(400).json({
            error: 'Esta conta não tem um e-mail cadastrado para recuperação. Entre em contato com o administrador ou crie uma nova conta com e-mail.',
          });
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        await sql`
          UPDATE fabrica_password_resets SET used = TRUE WHERE username = ${user.username} AND used = FALSE
        `;
        await sql`
          INSERT INTO fabrica_password_resets (username, email, code, expires_at)
          VALUES (${user.username}, ${userEmail}, ${code}, NOW() + INTERVAL '15 minutes')
        `;

        const html = buildPasswordResetEmailHtml({
          displayName: user.display_name,
          username: user.username,
          code,
        });
        const text = `Olá ${user.display_name} (@${user.username})!\n\nSeu código de recuperação de senha do ArenaQuiz é: ${code}\nEle expira em 15 minutos.`;

        const { emailSent, emailError } = await sendEmailViaProvider({
          to: userEmail,
          subject: '🔐 ArenaQuiz: Código de recuperação de senha',
          html,
          text,
        });

        if (!emailSent) {
          return res.status(500).json({
            error: emailError || 'Não foi possível enviar o e-mail de recuperação no momento.',
          });
        }

        const [localPart, domainPart] = userEmail.split('@');
        const maskedEmail = `${localPart.slice(0, 2)}***@${domainPart}`;

        return res.status(200).json({
          success: true,
          username: user.username,
          maskedEmail,
        });
      }

      // 17. Confirm Password Reset Code & Set New Password
      if (action === 'confirm_password_reset') {
        const identifier = String(body.identifier || '').trim().toLowerCase().replace(/^@/, '');
        const code = String(body.code || '').trim();
        const newPassword = String(body.newPassword || '').trim();

        if (!identifier || !code || newPassword.length < 4) {
          return res.status(400).json({ error: 'Preencha o código e uma nova senha (mínimo 4 caracteres).' });
        }

        const resetRows = await sql`
          SELECT id, username
          FROM fabrica_password_resets
          WHERE (LOWER(username) = ${identifier} OR LOWER(email) = ${identifier})
            AND code = ${code}
            AND used = FALSE
            AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1
        `;

        if (resetRows.length === 0) {
          return res.status(400).json({ error: 'Código inválido ou expirado. Solicite um novo código.' });
        }

        const resetRow = resetRows[0];
        const newHash = hashPassword(newPassword);

        await sql`
          UPDATE fabrica_users SET password_hash = ${newHash} WHERE username = ${resetRow.username}
        `;
        await sql`
          UPDATE fabrica_password_resets SET used = TRUE WHERE id = ${resetRow.id}
        `;

        return res.status(200).json({
          success: true,
          username: resetRow.username,
        });
      }

      // 18. Upsert per-Kahoot Run Progress & Winner
      if (action === 'upsert_quiz_run') {
        const shareCode = String(body.shareCode || '').trim().toUpperCase();
        const sessionId = String(body.sessionId || '').trim();
        const playerUsername = String(body.playerUsername || '').trim().toLowerCase();
        const playerName = String(body.playerName || playerUsername).trim();
        const playerAvatar = String(body.playerAvatar || '👨‍💻').trim();
        const status = body.status === 'finished' ? 'finished' : 'playing';
        const currentQuestion = Number(body.currentQuestion || 1);
        const totalQuestions = Number(body.totalQuestions || 0);
        const winnerTeamName = body.winnerTeamName ? String(body.winnerTeamName).trim() : null;
        const winnerPoints = Number(body.winnerPoints || 0);
        const winnerMembers = body.winnerMembers ? String(body.winnerMembers).trim() : '';

        if (!shareCode || !sessionId || !playerUsername) {
          return res.status(400).json({ error: 'Dados da partida incompletos.' });
        }

        await sql`
          INSERT INTO fabrica_quiz_runs (
            quiz_share_code, session_id, player_username, player_name, player_avatar,
            status, current_question, total_questions, winner_team_name, winner_points, winner_members, updated_at
          )
          VALUES (
            ${shareCode}, ${sessionId}, ${playerUsername}, ${playerName}, ${playerAvatar},
            ${status}, ${currentQuestion}, ${totalQuestions}, ${winnerTeamName}, ${winnerPoints}, ${winnerMembers}, NOW()
          )
          ON CONFLICT (quiz_share_code, session_id, player_username)
          DO UPDATE SET
            player_name = EXCLUDED.player_name,
            player_avatar = EXCLUDED.player_avatar,
            status = CASE WHEN fabrica_quiz_runs.status = 'finished' AND EXCLUDED.status = 'playing' THEN 'finished' ELSE EXCLUDED.status END,
            current_question = EXCLUDED.current_question,
            total_questions = EXCLUDED.total_questions,
            winner_team_name = COALESCE(EXCLUDED.winner_team_name, fabrica_quiz_runs.winner_team_name),
            winner_points = CASE WHEN EXCLUDED.winner_points > 0 THEN EXCLUDED.winner_points ELSE fabrica_quiz_runs.winner_points END,
            winner_members = CASE WHEN EXCLUDED.winner_members <> '' THEN EXCLUDED.winner_members ELSE fabrica_quiz_runs.winner_members END,
            updated_at = NOW()
        `;

        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Ação desconhecida' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error: any) {
    console.error('Database API error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no banco de dados' });
  }
}
