import { Question } from '../data/questions';

const OPTION_STYLES: Array<{ symbol: 'triangle' | 'diamond' | 'circle' | 'square'; color: string }> = [
  { symbol: 'triangle', color: 'bg-kahoot-red' },
  { symbol: 'diamond', color: 'bg-kahoot-blue' },
  { symbol: 'circle', color: 'bg-kahoot-yellow' },
  { symbol: 'square', color: 'bg-kahoot-green' },
];

function fisherYates<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffleQuestionOptions(question: Question): Question {
  const indexed = question.options.map((opt, idx) => ({
    text: opt.text,
    isCorrect: idx === question.correctIndex,
  }));
  const shuffled = fisherYates(indexed);
  const newCorrectIndex = Math.max(0, shuffled.findIndex(item => item.isCorrect));

  return {
    ...question,
    correctIndex: newCorrectIndex,
    options: shuffled.map((item, idx) => ({
      text: item.text,
      symbol: OPTION_STYLES[idx]?.symbol || 'triangle',
      color: OPTION_STYLES[idx]?.color || 'bg-kahoot-red',
    })),
  };
}

export function shuffleQuestionsAndOptions(
  questions: Question[],
  opts: { shuffleQuestions?: boolean; shuffleOptions?: boolean } = {
    shuffleQuestions: true,
    shuffleOptions: true,
  }
): Question[] {
  const base = opts.shuffleQuestions ? fisherYates(questions) : [...questions];
  return base.map((q, idx) => {
    const updated = opts.shuffleOptions ? shuffleQuestionOptions(q) : { ...q };
    return {
      ...updated,
      id: idx + 1,
    };
  });
}
