import React, { useState, useRef } from 'react';
import { Question, questionsData } from '../data/questions';
import { UserAccount } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import {
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
  FileText,
  Upload,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Layers,
  HelpCircle,
  Copy,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Pencil
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentQuestions: Question[];
  onSaveQuestions: (newQuestions: Question[], quizTitle?: string, shareCode?: string) => void;
  currentUser?: UserAccount | null;
}

export const KahootCreatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentQuestions,
  onSaveQuestions,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'spreadsheet' | 'file_text' | 'paste'>('manual');
  const [quizTitle, setQuizTitle] = useState('Meu Quiz no ArenaQuiz');
  const [isSaving, setIsSaving] = useState(false);
  const [questionsList, setQuestionsList] = useState<Question[]>(currentQuestions);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('Análise SWOT');
  const [manualTheme, setManualTheme] = useState<'FORÇAS' | 'FRAQUEZAS' | 'OPORTUNIDADES' | 'AMEAÇAS' | 'PLANEJAMENTO' | 'CONTROLE'>('PLANEJAMENTO');
  const [manualOptA, setManualOptA] = useState('');
  const [manualOptB, setManualOptB] = useState('');
  const [manualOptC, setManualOptC] = useState('');
  const [manualOptD, setManualOptD] = useState('');
  const [manualCorrectIndex, setManualCorrectIndex] = useState<number>(0);
  const [manualExplanation, setManualExplanation] = useState('');

  // Paste / File State
  const [pastedText, setPastedText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Add Manual Question
  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualOptA.trim() || !manualOptB.trim() || !manualOptC.trim() || !manualOptD.trim()) {
      alert("Por favor, preencha a pergunta e as 4 opções!");
      return;
    }

    const newQ: Question = {
      id: questionsList.length + 1,
      category: manualCategory.trim() || 'Geral',
      theme: manualTheme,
      question: manualTitle.trim(),
      options: [
        { text: manualOptA.trim(), symbol: 'triangle', color: 'bg-kahoot-red' },
        { text: manualOptB.trim(), symbol: 'diamond', color: 'bg-kahoot-blue' },
        { text: manualOptC.trim(), symbol: 'circle', color: 'bg-kahoot-yellow' },
        { text: manualOptD.trim(), symbol: 'square', color: 'bg-kahoot-green' },
      ],
      correctIndex: manualCorrectIndex,
      caseRelation: 'Criada manualmente pelo condutor do Quiz.',
      explanation: manualExplanation.trim() || 'Resposta correta confirmada pelo criador do quiz.',
    };

    setQuestionsList(prev => [...prev, newQ]);
    sound.playCorrect();

    // Reset Form
    setManualTitle('');
    setManualOptA('');
    setManualOptB('');
    setManualOptC('');
    setManualOptD('');
    setManualExplanation('');
    setImportFeedback("Pergunta adicionada com sucesso!");
    setTimeout(() => setImportFeedback(null), 3000);
  };

  // Delete Question
  const handleDeleteQuestion = (id: number) => {
    setQuestionsList(prev => {
      const filtered = prev.filter(q => q.id !== id);
      // Re-index questions 1..N
      return filtered.map((q, idx) => ({ ...q, id: idx + 1 }));
    });
  };

  // Move Question Up/Down
  const handleMoveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questionsList.length) return;
    setQuestionsList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy.map((q, idx) => ({ ...q, id: idx + 1 }));
    });
  };

  // Duplicate Question
  const handleDuplicateQuestion = (q: Question) => {
    setQuestionsList(prev => {
      const copy: Question = {
        ...q,
        options: q.options.map(o => ({ ...o })),
        id: prev.length + 1,
      };
      return [...prev, copy];
    });
    sound.playTone(600, 0.08, 'sine', 0.12);
  };

  // Edit Question (load into Manual tab)
  const handleEditQuestion = (q: Question) => {
    setManualTitle(q.question);
    setManualCategory(q.category || 'Geral');
    setManualTheme(q.theme || 'PLANEJAMENTO');
    setManualOptA(q.options[0]?.text || '');
    setManualOptB(q.options[1]?.text || '');
    setManualOptC(q.options[2]?.text || '');
    setManualOptD(q.options[3]?.text || '');
    setManualCorrectIndex(q.correctIndex);
    setManualExplanation(q.explanation || '');
    handleDeleteQuestion(q.id);
    setActiveTab('manual');
    setImportFeedback('Pergunta carregada no formulário para edição!');
    setTimeout(() => setImportFeedback(null), 3000);
  };

  // Export Quiz JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(questionsList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(quizTitle || 'fabricaquiz').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore Default SWOT Questions
  const handleRestoreDefaults = () => {
    if (confirm("Deseja restaurar as 10 perguntas originais da Análise SWOT da InovaTech?")) {
      setQuestionsList(questionsData);
      sound.playCorrect();
      setImportFeedback("Perguntas originais restauradas!");
      setTimeout(() => setImportFeedback(null), 3000);
    }
  };

  // Parse Text / Copy-Paste format
  const parseRawText = (raw: string): Question[] => {
    const parsed: Question[] = [];
    // Split by blocks of numbers (e.g. "1.", "2.", "Questão 1", etc.)
    const blocks = raw.split(/(?=\n\s*(?:\d+[\.\)]|Quest[ãa]o\s+\d+))/gi);

    blocks.forEach((block, idx) => {
      const clean = block.trim();
      if (!clean) return;

      const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 5) return;

      const titleLine = lines[0].replace(/^\d+[\.\)]\s*/, '').replace(/^Quest[ãa]o\s+\d+[:\.\-]?\s*/i, '');
      const optA = lines.find(l => /^[A|a][\)\.\-:]/i.test(l))?.replace(/^[A|a][\)\.\-:]\s*/, '') || lines[1] || 'Opção A';
      const optB = lines.find(l => /^[B|b][\)\.\-:]/i.test(l))?.replace(/^[B|b][\)\.\-:]\s*/, '') || lines[2] || 'Opção B';
      const optC = lines.find(l => /^[C|c][\)\.\-:]/i.test(l))?.replace(/^[C|c][\)\.\-:]\s*/, '') || lines[3] || 'Opção C';
      const optD = lines.find(l => /^[D|d][\)\.\-:]/i.test(l))?.replace(/^[D|d][\)\.\-:]\s*/, '') || lines[4] || 'Opção D';

      // Detect correct answer
      let correctIdx = 0;
      const ansLine = lines.find(l => /^(?:Resposta|Correta|Gabarito)[\s:]*([A-D1-4])/i.test(l));
      if (ansLine) {
        const match = ansLine.match(/^(?:Resposta|Correta|Gabarito)[\s:]*([A-D1-4])/i);
        if (match) {
          const letter = match[1].toUpperCase();
          if (letter === 'A' || letter === '1') correctIdx = 0;
          if (letter === 'B' || letter === '2') correctIdx = 1;
          if (letter === 'C' || letter === '3') correctIdx = 2;
          if (letter === 'D' || letter === '4') correctIdx = 3;
        }
      }

      parsed.push({
        id: idx + 1,
        category: "Questão Importada",
        theme: "PLANEJAMENTO",
        question: titleLine,
        options: [
          { text: optA, symbol: 'triangle', color: 'bg-kahoot-red' },
          { text: optB, symbol: 'diamond', color: 'bg-kahoot-blue' },
          { text: optC, symbol: 'circle', color: 'bg-kahoot-yellow' },
          { text: optD, symbol: 'square', color: 'bg-kahoot-green' },
        ],
        correctIndex: correctIdx,
        caseRelation: 'Pergunta importada via texto.',
        explanation: 'Resposta verificada no texto importado.',
      });
    });

    return parsed;
  };

  // Process Pasted Text
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;
    const imported = parseRawText(pastedText);
    if (imported.length === 0) {
      alert("Não foi possível identificar perguntas no texto. Verifique se o formato tem '1. Pergunta', seguido de A), B), C), D) e 'Resposta: X'.");
      return;
    }

    setQuestionsList(prev => [...prev, ...imported].map((q, i) => ({ ...q, id: i + 1 })));
    sound.playCorrect();
    setPastedText('');
    setImportFeedback(`${imported.length} pergunta(s) importada(s) com sucesso!`);
    setTimeout(() => setImportFeedback(null), 3500);
  };

  // Process CSV / Spreadsheet text
  const parseCSV = (csvContent: string): Question[] => {
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
    const parsed: Question[] = [];

    // Check if line 1 is header
    const startIndex = lines[0].toLowerCase().includes('pergunta') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split by comma or semicolon
      const delim = line.includes(';') ? ';' : ',';
      const cols = line.split(delim).map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length >= 5) {
        const title = cols[0];
        const optA = cols[1];
        const optB = cols[2];
        const optC = cols[3];
        const optD = cols[4];
        const rawAns = cols[5]?.toUpperCase() || 'A';
        const category = cols[6] || 'Geral';
        const expl = cols[7] || 'Explicação importada via planilha.';

        let correctIndex = 0;
        if (rawAns === 'B' || rawAns === '2') correctIndex = 1;
        if (rawAns === 'C' || rawAns === '3') correctIndex = 2;
        if (rawAns === 'D' || rawAns === '4') correctIndex = 3;

        parsed.push({
          id: parsed.length + 1,
          category,
          theme: 'PLANEJAMENTO',
          question: title,
          options: [
            { text: optA, symbol: 'triangle', color: 'bg-kahoot-red' },
            { text: optB, symbol: 'diamond', color: 'bg-kahoot-blue' },
            { text: optC, symbol: 'circle', color: 'bg-kahoot-yellow' },
            { text: optD, symbol: 'square', color: 'bg-kahoot-green' },
          ],
          correctIndex,
          caseRelation: 'Pergunta importada via planilha.',
          explanation: expl,
        });
      }
    }

    return parsed;
  };

  // Process CSV input
  const handleProcessCSV = () => {
    if (!csvText.trim()) return;
    const imported = parseCSV(csvText);
    if (imported.length === 0) {
      alert("Não foi possível identificar linhas válidas no formato: Pergunta, A, B, C, D, Resposta");
      return;
    }

    setQuestionsList(prev => [...prev, ...imported].map((q, i) => ({ ...q, id: i + 1 })));
    sound.playCorrect();
    setCsvText('');
    setImportFeedback(`${imported.length} pergunta(s) importada(s) da planilha!`);
    setTimeout(() => setImportFeedback(null), 3500);
  };

  // File Upload (PDF, CSV, TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
        const imported = parseCSV(content);
        if (imported.length > 0) {
          setQuestionsList(prev => [...prev, ...imported].map((q, i) => ({ ...q, id: i + 1 })));
          sound.playCorrect();
          setImportFeedback(`${imported.length} perguntas importadas do arquivo ${file.name}!`);
        } else {
          alert("Nenhuma pergunta válida encontrada no CSV.");
        }
      } else {
        // Text / Markdown / PDF stream text
        const imported = parseRawText(content);
        if (imported.length > 0) {
          setQuestionsList(prev => [...prev, ...imported].map((q, i) => ({ ...q, id: i + 1 })));
          sound.playCorrect();
          setImportFeedback(`${imported.length} perguntas importadas do arquivo ${file.name}!`);
        } else {
          // If regex failed, paste text in textarea for manual review
          setPastedText(content);
          setActiveTab('paste');
          alert("O texto do arquivo foi carregado na aba 'Colar Texto'. Revise e clique em 'Processar'.");
        }
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const template = `Pergunta;Opção A;Opção B;Opção C;Opção D;Resposta Correta;Categoria;Explicação\nExemplo: Qual é o primeiro passo do planejamento?;Ignorar o mercado;Definir objetivos e metas;Contratar estagiários;Demitir gerentes;B;Funções Administrativas;O planejamento sempre se inicia pela definição de objetivos claros.\nExemplo 2: Na SWOT o que é Força?;Fator interno positivo;Fator externo negativo;Fator incontrolável;Fator de sorte;A;Matriz SWOT;Forças são ativos e competências internas controláveis.`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_perguntas_kahoot.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save and apply to Quiz
  const handleSaveAndApply = async () => {
    if (questionsList.length === 0) {
      alert("Adicione pelo menos 1 pergunta ao Quiz!");
      return;
    }

    setIsSaving(true);
    let generatedCode: string | undefined;

    if (currentUser) {
      const res = await dbService.saveQuiz(
        currentUser.username,
        currentUser.displayName,
        quizTitle.trim() || 'Meu Quiz no ArenaQuiz',
        questionsList
      );
      if (res.success && res.quiz) {
        generatedCode = res.quiz.shareCode;
      }
    }

    setIsSaving(false);
    sound.playCorrect();
    onSaveQuestions(questionsList, quizTitle.trim() || 'Meu Quiz no ArenaQuiz', generatedCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border-2 border-purple-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Criador de Kahoots & Perguntas
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                  {questionsList.length} pergunta(s) no Quiz
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Crie perguntas clicando na mão, importando planilhas Excel/CSV ou colando texto/PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={quizTitle}
              onChange={e => setQuizTitle(e.target.value)}
              placeholder="Nome do seu Kahoot..."
              className="bg-slate-900 border border-cyan-500/40 focus:border-emerald-400 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none w-44 sm:w-56"
            />
            <button
              onClick={handleRestoreDefaults}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              title="Restaurar as 10 perguntas originais"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" /> 1. Criar na Mão (Manual)
          </button>
          <button
            onClick={() => setActiveTab('spreadsheet')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'spreadsheet'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> 2. Planilhas (Excel / CSV)
          </button>
          <button
            onClick={() => setActiveTab('file_text')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'file_text'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" /> 3. Upload Arquivo (PDF / TXT)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> 4. Colar Texto / IA
          </button>
        </div>

        {/* Feedback message banner */}
        {importFeedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/50 p-2.5 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 animate-bounce-short">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {importFeedback}
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* TAB 1: CRIAR NA MÃO (MANUAL) */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddManualQuestion} className="space-y-4 animate-fade-in">
              <div className="bg-purple-950/30 border border-purple-500/40 p-4 rounded-2xl">
                <span className="text-xs font-black uppercase text-purple-300 tracking-wider block mb-2">
                  Nova Pergunta do Kahoot
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Enunciado da Pergunta:
                    </label>
                    <textarea
                      rows={2}
                      value={manualTitle}
                      onChange={e => setManualTitle(e.target.value)}
                      placeholder="Ex: Qual é a função administrativa responsável por medir resultados e corrigir desvios?"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Categoria / Eixo Temático:
                      </label>
                      <input
                        type="text"
                        value={manualCategory}
                        onChange={e => setManualCategory(e.target.value)}
                        placeholder="Ex: Análise SWOT - Forças, Funções Administrativas..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Tema Central:
                      </label>
                      <select
                        value={manualTheme}
                        onChange={e => setManualTheme(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="PLANEJAMENTO">PLANEJAMENTO</option>
                        <option value="FORÇAS">FORÇAS (STRENGTHS)</option>
                        <option value="FRAQUEZAS">FRAQUEZAS (WEAKNESSES)</option>
                        <option value="OPORTUNIDADES">OPORTUNIDADES (OPPORTUNITIES)</option>
                        <option value="AMEAÇAS">AMEAÇAS (THREATS)</option>
                        <option value="CONTROLE">CONTROLE / OUTRAS</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Colored Kahoot Options */}
              <div>
                <label className="text-xs font-black uppercase text-amber-300 block mb-2">
                  As 4 Opções do Kahoot (Marque o círculo da resposta correta):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A (Red ▲) */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    manualCorrectIndex === 0 ? 'bg-red-950/60 border-red-400 ring-2 ring-red-400' : 'bg-slate-950/80 border-red-500/50'
                  }`}>
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={manualCorrectIndex === 0}
                      onChange={() => setManualCorrectIndex(0)}
                      className="w-5 h-5 accent-red-500 cursor-pointer"
                      title="Marcar como correta"
                    />
                    <span className="w-8 h-8 rounded-lg bg-kahoot-red flex items-center justify-center font-black text-sm text-white flex-shrink-0">
                      ▲
                    </span>
                    <input
                      type="text"
                      value={manualOptA}
                      onChange={e => setManualOptA(e.target.value)}
                      placeholder="Opção Vermelha (▲)..."
                      className="flex-1 bg-transparent border-none text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  {/* Option B (Blue ◆) */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    manualCorrectIndex === 1 ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-400' : 'bg-slate-950/80 border-blue-500/50'
                  }`}>
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={manualCorrectIndex === 1}
                      onChange={() => setManualCorrectIndex(1)}
                      className="w-5 h-5 accent-blue-500 cursor-pointer"
                      title="Marcar como correta"
                    />
                    <span className="w-8 h-8 rounded-lg bg-kahoot-blue flex items-center justify-center font-black text-sm text-white flex-shrink-0">
                      ◆
                    </span>
                    <input
                      type="text"
                      value={manualOptB}
                      onChange={e => setManualOptB(e.target.value)}
                      placeholder="Opção Azul (◆)..."
                      className="flex-1 bg-transparent border-none text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  {/* Option C (Yellow ●) */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    manualCorrectIndex === 2 ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400' : 'bg-slate-950/80 border-yellow-500/50'
                  }`}>
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={manualCorrectIndex === 2}
                      onChange={() => setManualCorrectIndex(2)}
                      className="w-5 h-5 accent-yellow-500 cursor-pointer"
                      title="Marcar como correta"
                    />
                    <span className="w-8 h-8 rounded-lg bg-kahoot-yellow flex items-center justify-center font-black text-sm text-white flex-shrink-0">
                      ●
                    </span>
                    <input
                      type="text"
                      value={manualOptC}
                      onChange={e => setManualOptC(e.target.value)}
                      placeholder="Opção Amarela (●)..."
                      className="flex-1 bg-transparent border-none text-sm font-bold text-white focus:outline-none"
                    />
                  </div>

                  {/* Option D (Green ■) */}
                  <div className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition ${
                    manualCorrectIndex === 3 ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400' : 'bg-slate-950/80 border-green-500/50'
                  }`}>
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={manualCorrectIndex === 3}
                      onChange={() => setManualCorrectIndex(3)}
                      className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      title="Marcar como correta"
                    />
                    <span className="w-8 h-8 rounded-lg bg-kahoot-green flex items-center justify-center font-black text-sm text-white flex-shrink-0">
                      ■
                    </span>
                    <input
                      type="text"
                      value={manualOptD}
                      onChange={e => setManualOptD(e.target.value)}
                      placeholder="Opção Verde (■)..."
                      className="flex-1 bg-transparent border-none text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Explicação Teórica / Feedback (Apresentado aos alunos após a resposta):
                </label>
                <input
                  type="text"
                  value={manualExplanation}
                  onChange={e => setManualExplanation(e.target.value)}
                  placeholder="Ex: O controle monitora os padrões planejados e aciona medidas corretivas..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Plus className="w-4 h-4" /> ADICIONAR PERGUNTA AO QUIZ
              </button>
            </form>
          )}

          {/* TAB 2: PLANILHAS (EXCEL / CSV) */}
          {activeTab === 'spreadsheet' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-emerald-300 text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" /> Importar Perguntas de Planilha (Excel / CSV)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Cole as linhas da planilha abaixo separadas por vírgula ou ponto-e-vírgula, ou faça upload de um arquivo `.csv`.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar Modelo CSV
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Cole os dados da planilha aqui:
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="Pergunta;Opção A;Opção B;Opção C;Opção D;Resposta(A/B/C/D);Categoria;Explicação&#10;Qual o foco da SWOT?;Finanças;Ambiente Interno e Externo;Marketing;Impostos;B;SWOT;Diagnóstico estratégico..."
                  className="w-full bg-slate-950 border border-slate-700 font-mono rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Formato: <strong>Pergunta ; Opção A ; Opção B ; Opção C ; Opção D ; Resposta (A, B, C ou D)</strong>
                </span>

                <button
                  onClick={handleProcessCSV}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Processar e Importar Planilha
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD ARQUIVO (PDF / TXT) */}
          {activeTab === 'file_text' && (
            <div className="space-y-4 animate-fade-in text-center p-6 border-2 border-dashed border-cyan-500/40 rounded-3xl bg-cyan-950/10">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.tsv,.md,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-2 shadow-lg">
                <Upload className="w-8 h-8" />
              </div>

              <h4 className="text-base font-extrabold text-white">
                Envie seu arquivo de perguntas (.pdf, .txt, .csv, .md)
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                O sistema lê o arquivo e identifica automaticamente perguntas numeradas com opções A), B), C), D) e gabarito.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm shadow-xl transition active:scale-95 inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Selecionar Arquivo do Computador
              </button>
            </div>
          )}

          {/* TAB 4: COLAR TEXTO LIVRE / IA */}
          {activeTab === 'paste' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl">
                <h4 className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Colar Questões em Texto (ChatGPT, Word, Provas)
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Cole uma lista de questões com número, alternativas A), B), C), D) e a linha "Resposta: X".
                </p>
              </div>

              <textarea
                rows={8}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="1. O que representa uma Força na análise SWOT?&#10;A) Uma crise externa&#10;B) Um concorrente novo&#10;C) Um recurso ou capacidade interna positiva&#10;D) Uma nova lei tributária&#10;Resposta: C&#10;&#10;2. Qual função administrativa define as metas da TI?&#10;A) Planejamento&#10;B) Organização&#10;C) Controle&#10;D) Direção&#10;Resposta: A"
                className="w-full bg-slate-950 border border-slate-700 font-mono rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleProcessPastedText}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Processar Texto e Criar Perguntas
                </button>
              </div>
            </div>
          )}

          {/* CURRENT QUESTIONS LIST & MANAGEMENT */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Perguntas Atuais do Quiz ({questionsList.length})
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {questionsList.length > 0 && (
                  <>
                    <button
                      onClick={handleExportJson}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1 transition"
                      title="Baixar perguntas em JSON"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar JSON
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Limpar todas as perguntas da lista para começar do zero?')) {
                          setQuestionsList([]);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
                    >
                      Limpar Lista
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {questionsList.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-purple-600/40 border border-purple-400 text-purple-200 flex items-center justify-center font-black flex-shrink-0">
                      #{q.id}
                    </span>
                    <div>
                      <div className="font-extrabold text-white text-sm leading-snug">
                        {q.question}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="text-purple-300 font-bold">{q.category}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">
                          Correta: Opção {q.correctIndex === 0 ? 'A (▲)' : q.correctIndex === 1 ? 'B (◆)' : q.correctIndex === 2 ? 'C (●)' : 'D (■)'} ({q.options[q.correctIndex]?.text})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleMoveQuestion(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                      title="Subir"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(idx, 1)}
                      disabled={idx === questionsList.length - 1}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                      title="Descer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditQuestion(q)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-cyan-300 transition"
                      title="Editar Pergunta"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateQuestion(q)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-950 text-purple-300 transition"
                      title="Duplicar Pergunta"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition"
                      title="Excluir Pergunta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Save & Close */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Total: <strong>{questionsList.length}</strong> perguntas prontas para a rodada.
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndApply}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-60 text-white font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar na Conta & Usar no Jogo!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
