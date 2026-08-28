import { describe, it, expect } from 'vitest';
import { buildSummarizationPrompt } from '../ai-prompts';

describe('buildSummarizationPrompt', () => {
  it('generates a valid prompt for english', () => {
    const prompt = buildSummarizationPrompt({ language: 'english' });
    expect(prompt).toContain('Generate notes in English');
  });

  it('generates a valid prompt for hinglish', () => {
    const prompt = buildSummarizationPrompt({ language: 'hinglish' });
    expect(prompt).toContain('Generate notes in Hinglish');
  });
});
