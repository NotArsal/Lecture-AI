import { describe, it, expect } from 'vitest';
import { getCleanTranscript } from '@/components/notes-display';

describe('Transcript Cleaning and Formatting', () => {
  it('returns plain transcript text untouched', () => {
    const raw = 'This is a normal spoken lecture transcript without any JSON formatting.';
    expect(getCleanTranscript(raw)).toBe(raw);
  });

  it('handles empty or undefined input safely', () => {
    expect(getCleanTranscript(undefined)).toBe('');
    expect(getCleanTranscript('')).toBe('');
    expect(getCleanTranscript('   ')).toBe('');
  });

  it('extracts paragraphs from full JSON lecture notes', () => {
    const jsonNotes = JSON.stringify({
      title: 'Navigating First-Year College Life: Clubs, CGPA, and Collaboration',
      summary: 'This transcript offers practical advice for first-year college students.',
      paragraphs: [
        'The speaker addresses the perceived importance of specific academic metrics.',
        'A core recommendation for first-year students is to strategically engage with college clubs.',
        'The transcript strongly emphasizes the collaborative nature of college life.',
      ],
      bulletPoints: ['Point 1', 'Point 2'],
      keyConcepts: [{ concept: 'Clubs', explanation: 'Student clubs' }],
    });

    const cleaned = getCleanTranscript(jsonNotes);
    expect(cleaned).toContain(
      'The speaker addresses the perceived importance of specific academic metrics.'
    );
    expect(cleaned).toContain(
      'A core recommendation for first-year students is to strategically engage with college clubs.'
    );
    expect(cleaned).not.toContain('"title":');
    expect(cleaned).not.toContain('"paragraphs":');
  });

  it('extracts paragraphs from fenced code block ```json', () => {
    const fencedJson =
      '```json\n{\n  "title": "Test Title",\n  "paragraphs": [\n    "Paragraph one of the lecture.",\n    "Paragraph two of the lecture."\n  ]\n}\n```';

    const cleaned = getCleanTranscript(fencedJson);
    expect(cleaned).toBe('Paragraph one of the lecture.\n\nParagraph two of the lecture.');
  });

  it('extracts summary if paragraphs are not present in JSON', () => {
    const jsonWithSummary = JSON.stringify({
      title: 'Test',
      summary: 'This is the extracted summary of the lecture.',
    });

    const cleaned = getCleanTranscript(jsonWithSummary);
    expect(cleaned).toBe('This is the extracted summary of the lecture.');
  });

  it('falls back to regex extraction for malformed or truncated JSON', () => {
    // Truncated JSON missing closing brackets
    const truncatedJson =
      '{\n  "title": "Truncated Lecture",\n  "paragraphs": [\n    "First complete paragraph.",\n    "Second complete paragraph."';

    const cleaned = getCleanTranscript(truncatedJson);
    expect(cleaned).toContain('First complete paragraph.');
    expect(cleaned).toContain('Second complete paragraph.');
    expect(cleaned).not.toContain('"title":');
  });
});
