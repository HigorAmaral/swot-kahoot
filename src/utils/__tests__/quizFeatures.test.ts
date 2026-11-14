import { describe, it, expect } from 'vitest';
import { shuffleQuestionOptions, shuffleQuestionsAndOptions } from '../quizShuffle';
import { showAlert, subscribeAlerts } from '../toast';
import { showConfirm, subscribeConfirms } from '../confirm';
import { generateRoomPin } from '../../services/db';
import { questionsData } from '../../data/questions';

describe('quizShuffle', () => {
  it('preserves the correct answer text after shuffling options', () => {
    const original = questionsData[0];
    const correctText = original.options[original.correctIndex].text;

    for (let i = 0; i < 10; i++) {
      const shuffled = shuffleQuestionOptions(original);
      expect(shuffled.options).toHaveLength(original.options.length);
      expect(shuffled.options[shuffled.correctIndex].text).toBe(correctText);
      expect(shuffled.options.map(o => o.symbol)).toEqual(['triangle', 'diamond', 'circle', 'square']);
      expect(shuffled.options.map(o => o.color)).toEqual([
        'bg-kahoot-red',
        'bg-kahoot-blue',
        'bg-kahoot-yellow',
        'bg-kahoot-green',
      ]);
    }
  });

  it('re-indexes questions from 1..N and preserves all questions', () => {
    const shuffled = shuffleQuestionsAndOptions(questionsData);
    expect(shuffled).toHaveLength(questionsData.length);
    expect(shuffled.map(q => q.id)).toEqual(questionsData.map((_, i) => i + 1));

    const originalTexts = new Set(questionsData.map(q => q.question));
    const shuffledTexts = new Set(shuffled.map(q => q.question));
    expect(shuffledTexts).toEqual(originalTexts);
  });

  it('supports 2-option (Verdadeiro/Falso) questions when shuffling', () => {
    const tfQuestion = {
      ...questionsData[0],
      options: [
        { text: 'Verdadeiro', symbol: 'triangle' as const, color: 'bg-kahoot-blue' },
        { text: 'Falso', symbol: 'diamond' as const, color: 'bg-kahoot-red' },
      ],
      correctIndex: 0,
    };
    const shuffled = shuffleQuestionOptions(tfQuestion);
    expect(shuffled.options).toHaveLength(2);
    expect(shuffled.options[shuffled.correctIndex].text).toBe('Verdadeiro');
  });
});

describe('toast & confirm utilities', () => {
  it('delivers alerts to subscribers and cleans up on unsubscribe', () => {
    const received: Array<{ message: string; type: string }> = [];
    const unsubscribe = subscribeAlerts(toast => {
      received.push({ message: toast.message, type: toast.type });
    });

    showAlert('Grupo salvo!', 'success');
    unsubscribe();
    showAlert('Ignorado', 'info');

    expect(received).toEqual([{ message: 'Grupo salvo!', type: 'success' }]);
  });

  it('resolves showConfirm promise with subscriber decision', async () => {
    const unsubscribe = subscribeConfirms(req => {
      req.resolve(req.message.includes('Sim'));
    });

    const accepted = await showConfirm('Sim, confirmar');
    const rejected = await showConfirm('Cancelar ação');
    unsubscribe();

    expect(accepted).toBe(true);
    expect(rejected).toBe(false);
  });
});

describe('Room PIN generator', () => {
  it('generates a 6-character uppercase alphanumeric PIN', () => {
    const pin = generateRoomPin();
    expect(pin).toMatch(/^[A-Z0-9]{6}$/);
  });
});
