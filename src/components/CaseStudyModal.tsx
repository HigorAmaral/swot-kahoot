import React, { useState } from 'react';
import { itCaseStudy } from '../data/caseStudy';
import { X, BookOpen, Layers, Target, Shield, AlertTriangle, Lightbulb, CheckSquare, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'case' | 'swot' | 'functions'>('case');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border-2 border-purple-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/30 border border-purple-400 text-purple-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                {itCaseStudy.title}
              </h2>
              <p className="text-xs text-purple-300 font-medium">
                {itCaseStudy.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('case')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'case'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 1. O Estudo de Caso da TI
          </button>
          <button
            onClick={() => setActiveTab('swot')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'swot'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. Matriz SWOT Completa (FOFA)
          </button>
          <button
            onClick={() => setActiveTab('functions')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'functions'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> 3. Funções Administrativas (PODC)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {activeTab === 'case' && (
            <div className="space-y-5 animate-fade-in">
              {/* Profile Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Empresa</span>
                  <div className="font-extrabold text-sm text-white">{itCaseStudy.companyProfile.name}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Setor</span>
                  <div className="font-extrabold text-sm text-white">{itCaseStudy.companyProfile.sector}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Equipe</span>
                  <div className="font-extrabold text-sm text-white">{itCaseStudy.companyProfile.size}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Tempo de Mercado</span>
                  <div className="font-extrabold text-sm text-white">{itCaseStudy.companyProfile.marketTime}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-2xl">
                <h4 className="text-sm font-black text-purple-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Resumo Executivo
                </h4>
                <p className="text-sm leading-relaxed text-slate-200">
                  {itCaseStudy.summary}
                </p>
              </div>

              {/* Context Points */}
              <div className="space-y-3">
                <h4 className="text-base font-black text-white">Pilares e Situação da Empresa:</h4>
                {itCaseStudy.context.map((para, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm leading-relaxed">
                    {para}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'swot' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-2">
                <h3 className="text-xl font-black text-white">
                  Matriz SWOT 2x2 Aplicada à TI da InovaTech
                </h3>
                <p className="text-xs text-slate-400">
                  Cruzamento entre o Ambiente Interno (Controlável) e o Ambiente Externo (Incontrolável).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths / Forças */}
                <div className="p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/60 shadow-lg">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-base uppercase mb-3">
                    <Shield className="w-5 h-5" /> FORÇAS (Strengths) • Interno [+]
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                    {itCaseStudy.swotBreakdown.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✔</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses / Fraquezas */}
                <div className="p-5 rounded-2xl bg-amber-950/40 border-2 border-amber-500/60 shadow-lg">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-base uppercase mb-3">
                    <AlertTriangle className="w-5 h-5" /> FRAQUEZAS (Weaknesses) • Interno [-]
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                    {itCaseStudy.swotBreakdown.weaknesses.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">⚠</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities / Oportunidades */}
                <div className="p-5 rounded-2xl bg-cyan-950/40 border-2 border-cyan-500/60 shadow-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-base uppercase mb-3">
                    <Lightbulb className="w-5 h-5" /> OPORTUNIDADES (Opportunities) • Externo [+]
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                    {itCaseStudy.swotBreakdown.opportunities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">🚀</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats / Ameaças */}
                <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-500/60 shadow-lg">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-base uppercase mb-3">
                    <Target className="w-5 h-5" /> AMEAÇAS (Threats) • Externo [-]
                  </div>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                    {itCaseStudy.swotBreakdown.threats.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">✖</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'functions' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-2">
                <h3 className="text-xl font-black text-white">
                  As 4 Funções Administrativas (PODC) Integradas à TI
                </h3>
                <p className="text-xs text-slate-400">
                  Como o Planejamento, Organização, Direção e Controle atuam na modernização tecnológica.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border-l-4 border-purple-500">
                  <h4 className="font-extrabold text-purple-300 text-sm uppercase mb-1">
                    1. Planejamento (Foco Principal da Atividade)
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {itCaseStudy.administrativeFunctionsConnection.planejamento}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border-l-4 border-blue-500">
                  <h4 className="font-extrabold text-blue-300 text-sm uppercase mb-1">
                    2. Organização
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {itCaseStudy.administrativeFunctionsConnection.organizacao}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border-l-4 border-amber-500">
                  <h4 className="font-extrabold text-amber-300 text-sm uppercase mb-1">
                    3. Direção
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {itCaseStudy.administrativeFunctionsConnection.direcao}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border-l-4 border-emerald-500">
                  <h4 className="font-extrabold text-emerald-300 text-sm uppercase mb-1">
                    4. Controle
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {itCaseStudy.administrativeFunctionsConnection.controle}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Material de apoio para o Grupo de Comando conduzir a dinâmica com a turma.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white transition"
          >
            Fechar e Voltar ao Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
