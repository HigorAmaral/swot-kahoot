import React, { useState, useRef } from 'react';
import { Question, questionsData } from '../data/questions';
import { UserAccount } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { showAlert } from '../utils/toast';
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
      showAlert("Por favor, preencha a pergunta e as 4 opções!", 'warning');
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
    a.download = `${(quizTitle || 'arenaquiz').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Quiz CSV (Excel-compatible UTF-8 with BOM & semicolon separator)
  const handleExportCsv = () => {
    if (questionsList.length === 0) return;
    const escapeCell = (value: string) => `"${(value || '').replace(/"/g, '""')}"`;
    const letters = ['A', 'B', 'C', 'D'];
    const header = ['Pergunta', 'Opção A', 'Opção B', 'Opção C', 'Opção D', 'Resposta Correta', 'Categoria', 'Explicação'].join(';');
    const rows = questionsList.map(q => {
      const opts = q.options || [];
      return [
        escapeCell(q.question),
        escapeCell(opts[0]?.text || ''),
        escapeCell(opts[1]?.text || ''),
        escapeCell(opts[2]?.text || ''),
        escapeCell(opts[3]?.text || ''),
        letters[q.correctIndex] || 'A',
        escapeCell(q.category || 'Geral'),
        escapeCell(q.explanation || ''),
      ].join(';');
    });
    const csvContent = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(quizTitle || 'arenaquiz').toLowerCase().replace(/[^a-z0-9]+/g, '_')}.csv`;
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
      showAlert("Não foi possível identificar perguntas no texto. Verifique se o formato tem '1. Pergunta', seguido de A), B), C), D) e 'Resposta: X'.", 'warning');
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
      showAlert("Não foi possível identificar linhas válidas no formato: Pergunta, A, B, C, D, Resposta", 'warning');
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
          showAlert("Nenhuma pergunta válida encontrada no CSV.", 'warning');
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
          showAlert("O texto do arquivo foi carregado na aba 'Colar Texto'. Revise e clique em 'Processar'.", 'info');
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
      showAlert("Adicione pelo menos 1 pergunta ao Quiz!", 'warning');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in text-white select-none">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#0d111a] border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#090b10] gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Criar Quiz & Perguntas
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                  {questionsList.length} pergunta(s)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Adicione perguntas manualmente, importe planilhas Excel/CSV ou envie PDF/TXT.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={quizTitle}
              onChange={e => setQuizTitle(e.target.value)}
              placeholder="Nome do seu Quiz..."
              className="bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none w-44 sm:w-56"
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
        <div className="grid grid-cols-2 sm:flex border-b border-slate-800 bg-slate-900/90 p-2 sm:px-6 sm:pt-2 sm:pb-0 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-2.5 sm:py-0 sm:pb-3 sm:px-4 rounded-xl sm:rounded-none font-bold text-xs sm:text-sm sm:border-b-2 transition flex items-center justify-center sm:justify-start gap-2 ${
              activeTab === 'manual'
                ? 'bg-emerald-500/15 sm:bg-transparent border border-emerald-500/40 sm:border-0 sm:border-emerald-400 text-emerald-300'
                : 'bg-slate-800/50 sm:bg-transparent border border-slate-800 sm:border-0 sm:border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Manual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spreadsheet')}
            className={`px-3 py-2.5 sm:py-0 sm:pb-3 sm:px-4 rounded-xl sm:rounded-none font-bold text-xs sm:text-sm sm:border-b-2 transition flex items-center justify-center sm:justify-start gap-2 ${
              activeTab === 'spreadsheet'
                ? 'bg-emerald-500/15 sm:bg-transparent border border-emerald-500/40 sm:border-0 sm:border-emerald-400 text-emerald-300'
                : 'bg-slate-800/50 sm:bg-transparent border border-slate-800 sm:border-0 sm:border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Planilha / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file_text')}
            className={`px-3 py-2.5 sm:py-0 sm:pb-3 sm:px-4 rounded-xl sm:rounded-none font-bold text-xs sm:text-sm sm:border-b-2 transition flex items-center justify-center sm:justify-start gap-2 ${
              activeTab === 'file_text'
                ? 'bg-emerald-500/15 sm:bg-transparent border border-emerald-500/40 sm:border-0 sm:border-emerald-400 text-emerald-300'
                : 'bg-slate-800/50 sm:bg-transparent border border-slate-800 sm:border-0 sm:border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Ler PDF / TXT</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-2.5 sm:py-0 sm:pb-3 sm:px-4 rounded-xl sm:rounded-none font-bold text-xs sm:text-sm sm:border-b-2 transition flex items-center justify-center sm:justify-start gap-2 ${
              activeTab === 'paste'
                ? 'bg-amber-500/15 sm:bg-transparent border border-amber-500/40 sm:border-0 sm:border-amber-400 text-amber-300'
                : 'bg-slate-800/50 sm:bg-transparent border border-slate-800 sm:border-0 sm:border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">4. Colar Texto / IA</span>
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
              <div className="bg-[#111622] border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block mb-2">
                  Nova Pergunta do Quiz
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
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
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Tema Central:
                      </label>
                      <select
                        value={manualTheme}
                        onChange={e => setManualTheme(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {[
                    {
                      idx: 0,
                      val: manualOptA,
                      setVal: setManualOptA,
                      symbol: '▲',
                      badgeBg: 'bg-kahoot-red',
                      activeCls: 'bg-red-950/60 border-red-400',
                      idleCls: 'bg-slate-950/80 border-red-500/40',
                      placeholder: 'Opção Vermelha (▲)...',
                    },
                    {
                      idx: 1,
                      val: manualOptB,
                      setVal: setManualOptB,
                      symbol: '◆',
                      badgeBg: 'bg-kahoot-blue',
                      activeCls: 'bg-blue-950/60 border-blue-400',
                      idleCls: 'bg-slate-950/80 border-blue-500/40',
                      placeholder: 'Opção Azul (◆)...',
                    },
                    {
                      idx: 2,
                      val: manualOptC,
                      setVal: setManualOptC,
                      symbol: '●',
                      badgeBg: 'bg-kahoot-yellow',
                      activeCls: 'bg-amber-950/60 border-amber-400',
                      idleCls: 'bg-slate-950/80 border-yellow-500/40',
                      placeholder: 'Opção Amarela (●)...',
                    },
                    {
                      idx: 3,
                      val: manualOptD,
                      setVal: setManualOptD,
                      symbol: '■',
                      badgeBg: 'bg-kahoot-green',
                      activeCls: 'bg-emerald-950/60 border-emerald-400',
                      idleCls: 'bg-slate-950/80 border-green-500/40',
                      placeholder: 'Opção Verde (■)...',
                    },
                  ].map(opt => {
                    const isCorrectOpt = manualCorrectIndex === opt.idx;
                    return (
                      <div
                        key={opt.idx}
                        className={`p-2.5 sm:p-3 rounded-2xl border-2 flex items-center gap-2.5 transition ${
                          isCorrectOpt ? opt.activeCls : opt.idleCls
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl ${opt.badgeBg} flex items-center justify-center font-black text-sm text-white shrink-0`}>
                          {opt.symbol}
                        </span>
                        <input
                          type="text"
                          value={opt.val}
                          onChange={e => opt.setVal(e.target.value)}
                          placeholder={opt.placeholder}
                          className="flex-1 min-w-0 bg-transparent border-none text-xs sm:text-sm font-bold text-white focus:outline-none py-1"
                        />
                        <button
                          type="button"
                          onClick={() => setManualCorrectIndex(opt.idx)}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition shrink-0 ${
                            isCorrectOpt
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                          }`}
                          title="Marcar como resposta correta"
                        >
                          {isCorrectOpt ? '✓ Correta' : 'Marcar'}
                        </button>
                      </div>
                    );
                  })}
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Plus className="w-4 h-4" /> Adicionar Pergunta ao Quiz
              </button>
            </form>
          )}

          {/* TAB 2: PLANILHAS (EXCEL / CSV) */}
          {activeTab === 'spreadsheet' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl space-y-3">
                <div>
                  <h4 className="font-extrabold text-emerald-300 text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 shrink-0" /> Planilhas (Excel / CSV)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Importe colando linhas separadas por ponto-e-vírgula/vírgula, ou exporte suas perguntas atuais para Excel.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4 shrink-0" /> Baixar Modelo CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={questionsList.length === 0}
                    className="w-full px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-40 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                  >
                    <FileSpreadsheet className="w-4 h-4 shrink-0" /> Exportar Quiz (.csv)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Cole os dados da planilha aqui:
                </label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="Pergunta;Opção A;Opção B;Opção C;Opção D;Resposta(A/B/C/D);Categoria;Explicação&#10;Qual o foco da SWOT?;Finanças;Ambiente Interno e Externo;Marketing;Impostos;B;SWOT;Diagnóstico estratégico..."
                  className="w-full bg-slate-950 border border-slate-700 font-mono rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Formato: <strong>Pergunta ; A ; B ; C ; D ; Resposta (A-D)</strong>
                </span>

                <button
                  type="button"
                  onClick={handleProcessCSV}
                  className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" /> Processar e Importar Planilha
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD ARQUIVO (PDF / TXT) */}
          {activeTab === 'file_text' && (
            <div className="space-y-4 animate-fade-in text-center p-5 sm:p-7 border-2 border-dashed border-slate-700 rounded-2xl bg-[#111622]">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.tsv,.md,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Importar Arquivo (.pdf, .txt, .csv, .md)
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  O sistema lê o arquivo e identifica perguntas numeradas com opções A), B), C), D) e gabarito.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition active:scale-95 inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <Upload className="w-4 h-4 shrink-0" /> Escolher Arquivo do Aparelho
              </button>
            </div>
          )}

          {/* TAB 4: COLAR TEXTO LIVRE / IA */}
          {activeTab === 'paste' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl">
                <h4 className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                  <FileText className="w-5 h-5 shrink-0" /> Colar Questões em Texto (ChatGPT, Word, Provas)
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Cole uma lista de questões com número, alternativas A), B), C), D) e a linha "Resposta: X".
                </p>
              </div>

              <textarea
                rows={6}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="1. O que representa uma Força na análise SWOT?&#10;A) Uma crise externa&#10;B) Um concorrente novo&#10;C) Um recurso ou capacidade interna positiva&#10;D) Uma nova lei tributária&#10;Resposta: C&#10;&#10;2. Qual função administrativa define as metas da TI?&#10;A) Planejamento&#10;B) Organização&#10;C) Controle&#10;D) Direção&#10;Resposta: A"
                className="w-full bg-slate-950 border border-slate-700 font-mono rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />

              <button
                type="button"
                onClick={handleProcessPastedText}
                className="w-full sm:w-auto sm:ml-auto justify-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 shrink-0" /> Processar Texto e Criar Perguntas
              </button>
            </div>
          )}

          {/* CURRENT QUESTIONS LIST & MANAGEMENT */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                Perguntas Atuais do Quiz ({questionsList.length})
              </h3>
              {questionsList.length > 0 && (
                <div className="grid grid-cols-3 sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    title="Baixar perguntas em planilha CSV (Excel)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    title="Baixar perguntas em JSON"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Limpar todas as perguntas da lista para começar do zero?')) {
                        setQuestionsList([]);
                      }
                    }}
                    className="px-2.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Limpar</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2.5 sm:max-h-64 sm:overflow-y-auto sm:pr-1">
              {questionsList.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 flex items-center justify-center font-black flex-shrink-0">
                      #{q.id}
                    </span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-white text-xs sm:text-sm leading-snug">
                        {q.question}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="text-slate-300 font-bold">{q.category}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">
                          Correta: {q.correctIndex === 0 ? 'A (▲)' : q.correctIndex === 1 ? 'B (◆)' : q.correctIndex === 2 ? 'C (●)' : 'D (■)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(idx, -1)}
                      disabled={idx === 0}
                      className="p-2 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                      title="Subir"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(idx, 1)}
                      disabled={idx === questionsList.length - 1}
                      className="p-2 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                      title="Descer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditQuestion(q)}
                      className="p-2 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-cyan-300 transition"
                      title="Editar Pergunta"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(q)}
                      className="p-2 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-purple-950 text-purple-300 transition"
                      title="Duplicar Pergunta"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 sm:p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition"
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
        <div className="px-3.5 sm:px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            Total: <strong className="text-white">{questionsList.length}</strong> pergunta(s) pronta(s)
          </span>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={isSaving}
              className="flex-1 sm:flex-initial justify-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {isSaving ? 'Salvando...' : 'Salvar e Usar no Jogo!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
