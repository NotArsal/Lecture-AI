import { describe, it, expect } from 'vitest';
import { generateAsciiMindMap } from '@/utils/ascii-tree';
import type { LectureNotes } from '@/types';

describe('generateAsciiMindMap', () => {
  const mockNotes: LectureNotes = {
    title: 'Operating Systems & Concurrency',
    summary: 'A comprehensive lecture covering processes, threads, and race conditions.',
    paragraphs: ['Paragraph 1', 'Paragraph 2'],
    bulletPoints: ['Point 1'],
    keyConcepts: [
      {
        concept: 'Race Condition',
        explanation: 'When multiple threads access shared data concurrently without synchronization.',
        importance: 'high',
      },
      {
        concept: 'Mutual Exclusion',
        explanation: 'Mechanism to prevent concurrent execution in critical sections.',
        importance: 'medium',
      },
    ],
    definitions: [
      {
        term: 'Deadlock',
        definition: 'A state in which each process is waiting for another resource.',
      },
    ],
    quizQuestions: [],
    actionItems: ['Review semaphore implementations'],
    metadata: {
      generatedAt: new Date().toISOString(),
      transcriptionModel: 'whisper-large-v3',
      summarizationModel: 'gemini-2.5',
      originalFilename: 'OS_Lecture_3.mp3',
      wordCount: 850,
    },
  };

  it('generates an ASCII tree structure with box drawings', () => {
    const result = generateAsciiMindMap(mockNotes);
    expect(result).toContain('LECTURE AI ARCHIVE: Operating Systems & Concurrency');
    expect(result).toContain('CORE CONCEPT MAP');
    expect(result).toContain('Race Condition');
    expect(result).toContain('Mutual Exclusion');
    expect(result).toContain('Deadlock');
    expect(result).toContain('Review semaphore implementations');
    expect(result).toContain('├──');
    expect(result).toContain('└──');
  });
});
