import React from 'react';
import { X, Users, RotateCw, Trophy, Gift, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DynamicGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-slate-900 border-2 border-pink-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-600/30 border border-pink-400 text-pink-300">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                Roteiro da Dinâmica de Sala • Grupo de Comando
              </h2>
              <p className="text-xs text-pink-300 font-medium">
                Orientações oficiais para conduzir a atividade com os demais estudantes
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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200 text-sm">
          {/* Objective */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40">
            <h3 className="font-black text-purple-300 text-base mb-1 flex items-center gap-2">
              <Users className="w-5 h-5" /> Objetivo Pedagógico da Dinâmica
            </h3>
            <p className="leading-relaxed text-slate-300">
              Integrar os alunos na discussão prática das <strong>Funções Administrativas</strong> (ênfase em Planejamento Estratégico) e dos 4 quadrantes da <strong>Análise SWOT (Forças, Fraquezas, Oportunidades e Ameaças)</strong> a partir de um <em>Paper / Estudo de Caso real em TI</em>.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase mb-2">
                <span>1. Divisão da Turma em 4 Grupos</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                Divida a sala em <strong>4 equipes</strong> (ex: Alfa, Beta, Gama, Delta). Cada equipe elege um <em>representante da rodada</em> para girar o peão ou acionar o buzzer.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase mb-2">
                <span>2. Leitura do Estudo de Caso (Paper TI)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                O Grupo de Comando projeta na tela a história da <strong>InovaTech</strong> (empresa de TI migrando para nuvem e enfrentando desafios de segurança e concorrência).
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-pink-400 font-extrabold text-sm uppercase mb-2">
                <RotateCw className="w-4 h-4" /> 3. A Disputa: Peão ou Buzzer
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                Os 4 representantes giram seus peões (físicos ou pelo simulador na tela). O peão que <strong>demorar mais para parar</strong> vence a disputa da rodada!
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase mb-2">
                <span>4. Responder ou Passar?</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                A equipe vencedora do peão decide: <strong>responder</strong> para tentar ganhar 1.000 pts e o brinde, ou <strong>passar</strong> para outra equipe. Se a equipe para quem passou errar, quem passou ganha bônus de risco!
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-sm uppercase mb-2">
                <Gift className="w-4 h-4" /> 5. Entrega dos Brindes Físicos!
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                O grupo de comando confirma se a resposta está correta. Quem acertar recebe <strong>uma bala 🍬 ou um chocolate 🍫</strong> na hora!
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm uppercase mb-2">
                <Trophy className="w-4 h-4" /> 6. Pódio Final & Apresentação
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                Ao final das 10 perguntas, o sistema exibe o pódio com efeito de confetes e a soma de brindes conquistados por cada equipe.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              <strong>Dica para o Grupo de Comando:</strong> O papel de vocês é animar a sala, cronometrar a fala, validar respostas e estimular o debate sobre os conceitos de SWOT.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 font-bold text-xs text-white transition"
          >
            Entendido! Voltar à Dinâmica
          </button>
        </div>
      </div>
    </div>
  );
};
