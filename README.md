# 🎯 ArenaQuiz (SWOT Kahoot!) — Quiz Interativo em Tempo Real

Plataforma completa de Quiz interativo e gamificado no estilo **Kahoot!**, desenvolvida para dinâmicas de sala de aula, treinamentos corporativos e competições em equipe — com suporte completo a **Mobile**, **PWA instalável**, **criação/importação de quizzes**, **compartilhamento** e **música de fundo**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHigorAmaral%2Fswot-kahoot)

🔗 **Repositório GitHub:** [https://github.com/HigorAmaral/swot-kahoot](https://github.com/HigorAmaral/swot-kahoot)

---

## ✨ Principais Funcionalidades

### 📱 Experiência Mobile & PWA Instalável
- **Instalável como App (PWA):** suporte a `manifest.webmanifest`, Service Worker (`sw.js`) e botão **Instalar App** no cabeçalho quando disponível no navegador.
- **Navegação Mobile Nativa:** barra inferior dedicada (`MobileBottomNav`) com acesso rápido a **Kahoots**, **Criar**, **Enviar** e **Painel ADM**, além de suporte a `100dvh` e áreas seguras (`safe-area-inset`).

### 🛠️ Criador de Quizzes (`Criar Quiz`)
Crie seus próprios Kahoots de 4 formas diferentes:
1. **Manual:** crie perguntas com 4 alternativas coloridas (▲ ◆ ● ■), resposta correta e explicação teórica.
2. **Planilhas (Excel / CSV):** baixe o modelo `.csv`, importe planilhas colando os dados e exporte suas perguntas em **CSV** (UTF-8 com BOM, compatível com Excel) ou **JSON**.
3. **Upload de Arquivo:** importe questões diretamente de arquivos `.pdf`, `.txt`, `.csv` ou `.md`.
4. **Colar Texto / IA:** cole listas de questões geradas no ChatGPT, Word ou provas para conversão automática.

### 🔗 Meus Kahoots & Compartilhamento
- Salve quizzes na sua conta e gerencie pela barra lateral **Kahoots** ou pelo modal **Meus Kahoots / Enviar**.
- Gere links diretos (`?quiz=CODIGO`), compartilhe com outros usuários da plataforma ou envie convites por e-mail.
- Acompanhe execuções e resultados em tempo real pelo painel de gestão do quiz.

### 🛡️ Painel Administrativo (`Painel ADM`)
Exclusivo para o administrador/professor, com layout responsivo para celular e desktop:
1. **Placar & Vencedor:** ajuste pontos, balas 🍬 e chocolates 🍫, renomeie equipes, exporte placar em CSV ou declare o vencedor.
2. **Alunos nos Grupos:** adicione participantes em lote, mova alunos entre as 4 equipes ou limpe listas.
3. **Rodadas & Som:** configure tempo por pergunta (`15s` a `60s`), pontuação base, navegue entre telas, pule para qualquer pergunta com visualização opcional do gabarito e controle áudio/música.
4. **Histórico da Rodada:** acompanhe cada resposta em tempo real, copie o resumo formatado para WhatsApp ou exporte o histórico em CSV.

### 🎵 Música de Fundo & Efeitos Sonoros
- **Web Audio API Synthesizer:** trilha sonora de fundo agradável iniciada automaticamente após a primeira interação na página, além de efeitos sonoros nativos para acertos, erros, brindes, contagem regressiva e buzzer (sem depender de arquivos MP3 externos).
- **Controles independentes:** ligue/desligue a **Música de Fundo** e os **Efeitos Sonoros** separadamente pelo cabeçalho ou pelo Painel ADM.

---

## 📋 Dinâmica Pedagógica Padrão (SWOT & TI)

O sistema já vem pronto com um quiz padrão sobre **Funções Administrativas, Planejamento Estratégico e Matriz SWOT (FOFA)** aplicado ao estudo de caso da empresa **InovaTech Soluções Digitais** (Cloud Computing, código legado, LGPD, Ransomware e concorrência).

- **4 Equipes configuradas** com cores, placar de pontos e registro de brindes físicos (**Balas 🍬** e **Chocolates 🍫**).
- **Pódio Final** com comemoração em confetes e resumo completo da partida.

---

## 💻 Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/HigorAmaral/swot-kahoot.git

# Acesse a pasta
cd swot-kahoot

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em `http://localhost:5173`.

### Scripts Disponíveis
- `npm run dev` — inicia o servidor Vite em modo desenvolvimento.
- `npm test` — executa os testes unitários com Vitest (`vitest run`).
- `npm run build` — valida tipos TypeScript (`tsc`) e gera o build de produção (`vite build`).
- `npm run preview` — pré-visualiza o build de produção localmente.

---

## 🚀 Deploy na Vercel & Banco de Dados

1. Clique em **Deploy with Vercel** acima ou importe o repositório `HigorAmaral/swot-kahoot` na [Vercel](https://vercel.com/).
2. *(Opcional)* Para persistência em nuvem e envio de e-mails nas APIs serverless (`/api/*`), configure as variáveis de ambiente no projeto da Vercel:
   - `DATABASE_URL` — string de conexão PostgreSQL (**Neon**).
   - Credenciais SMTP (quando utilizar envio de convites por e-mail via `nodemailer`).
3. Sem banco configurado, a aplicação continua funcionando localmente com armazenamento em `localStorage`.

---

## 🛠️ Tecnologias Utilizadas
- **React 18** + **TypeScript**
- **Vite 6** + **Vitest**
- **Tailwind CSS**
- **Neon Serverless PostgreSQL** (`@neondatabase/serverless`) + **Vercel Serverless Functions**
- **Web Audio API Synthesizer** (música de fundo e efeitos sonoros)
- **Canvas Confetti** & **Lucide React**
- **Nodemailer** (convites por e-mail)
