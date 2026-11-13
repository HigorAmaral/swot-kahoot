# 🎯 SWOT Kahoot! - Funções Administrativas & Planejamento em TI

Sistema completo de Quiz interativo e gamificado no estilo **Kahoot!**, desenvolvido especialmente para dinâmicas de sala de aula universitárias e corporativas.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHigorAmaral%2Fswot-kahoot)

🔗 **Repositório GitHub:** [https://github.com/HigorAmaral/swot-kahoot](https://github.com/HigorAmaral/swot-kahoot)

---

## 📋 Sobre a Dinâmica de Sala

Esta atividade foi desenhada para a condução do **Grupo de Comando** (alunos que estão apresentando) com a participação ativa de toda a turma dividida em **4 equipes**.

### 🌟 Pilares Pedagógicos
1. **Funções Administrativas:** Ênfase no **Planejamento Estratégico** (além de Organização, Direção e Controle - PODC).
2. **Matriz SWOT (FOFA):**
   - **Forças (Strengths):** Fatores internos positivos e controláveis.
   - **Fraquezas (Weaknesses):** Fatores internos negativos e controláveis.
   - **Oportunidades (Opportunities):** Fatores externos favoráveis (incontroláveis).
   - **Ameaças (Threats):** Fatores externos desfavoráveis (incontroláveis).
3. **Estudo de Caso / Paper em TI:** Aplicação na empresa **InovaTech Soluções Digitais**, enfrentando desafios de migração para Cloud Computing, dívida técnica em código legado, adequação à LGPD, ciberataques de Ransomware e concorrência com startups nativas da nuvem.

---

## 🕹️ Mecânicas de Disputa & Gamificação

### 1. 🌀 Disputa do Peão Tradicional
- Cada equipe tem seu peão estilizado na tela (ou peão físico na mesa da sala).
- O representante de cada equipe gira o peão.
- **O peão que demorar mais tempo para parar ganha a rodada!**
- O vencedor pode escolher:
  - **Responder a pergunta** para faturar 1.000 pontos + Brinde!
  - **Passar a pergunta** para uma equipe adversária (se a adversária errar, quem passou ganha bônus de risco de 500 pontos!).

### 2. ⚡ Quem Bate Primeiro (Buzzer)
- Botões de acionamento rápido com registro em milissegundos e suporte a teclas de atalho no teclado:
  - Equipe 1: Tecla `1`
  - Equipe 2: Tecla `2`
  - Equipe 3: Tecla `3`
  - Equipe 4: Tecla `4`

### 3. 🎯 Acerta o Alvo
- Mira móvel com círculos concêntricos. Quem dispara mais perto do centro (100 pts) ganha a vez da pergunta.

### 4. 🍬 Placar de Brindes (Balas & Chocolates)
- Cada equipe que acerta recebe imediatamente a comemoração com confetes e um brinde físico (uma bala 🍬 ou um chocolate 🍫) entregue pela mesa de comando!
- O sistema registra e totaliza os doces distribuídos no pódio final.

---

## 🚀 Como Publicar no Vercel em 1 Clique

1. Acesse o link direto de importação:
   **[https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHigorAmaral%2Fswot-kahoot](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHigorAmaral%2Fswot-kahoot)**
2. Faça login com sua conta do GitHub (`HigorAmaral`).
3. Clique no botão **"Deploy"**.
4. Em menos de 1 minuto, seu Kahoot estará no ar com link público HTTPS pronto para ser aberto no projetor da sala!

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

---

## 🛠️ Tecnologias Utilizadas
- **React 18** + **TypeScript**
- **Vite 6** (Build ultrarrápido)
- **Tailwind CSS** (Design vibrante e responsivo fiel ao Kahoot)
- **Web Audio API Synthesizer** (Efeitos sonoros nativos sem necessidade de arquivos mp3 externos)
- **Canvas Confetti** (Efeitos de comemoração na tela)
- **Lucide React** (Ícones modernos)
