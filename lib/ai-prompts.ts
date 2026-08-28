import { SummarizationOptions } from '../types';

const SUMMARIZATION_LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  hinglish: "Generate notes in Hinglish (a natural blend of Hindi and English written in the Latin alphabet). Use clear, easy-to-understand language typical of Indian college students or developers.\n\nFORMATTING:\n- Title: In English or Hinglish\n- Summary: In Hinglish\n- Paragraphs: In Hinglish\n- Bullet points: In Hinglish\n- Concepts: In Hinglish with English terms where appropriate\n- Definitions: In Hinglish\n- Action items: In Hinglish",

  english: "Generate notes in English. Use clear, academic, and professional English.\n\nFORMATTING:\n- Title: In English\n- Summary: In English\n- Paragraphs: In English\n- Bullet points: In English\n- Concepts: In English\n- Definitions: In English\n- Action items: In English",
};

const SUMMARIZATION_JSON_SCHEMA = `{

  "title": "A clear, descriptive title for the lecture or content",
  "summary": "A {detailLevel} overview paragraph (3-5 sentences) summarizing the main themes and takeaways",
  "paragraphs": ["Array of well-structured paragraphs covering main topics in logical order", "Each paragraph should be 3-5 sentences", "Maintain academic writing style"],
  "bulletPoints": ["Concise key points", "Action items", "Important facts", "Main arguments"],
  "keyConcepts": [
    {
      "concept": "Concept name",
      "explanation": "Clear explanation",
      "importance": "high|medium|low"
    }
  ],
  "definitions": [
    {
      "term": "Technical term or concept",
      "definition": "Precise definition",
      "context": "How it's used in the lecture"
    }
  ],
  "exampleProblems": [
    {
      "problem": "Problem statement or question",
      "solution": "Solution if provided",
      "explanation": "Step-by-step explanation"
    }
  ],
  "quizQuestions": [
    {
      "question": "Multiple choice question to test understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "actionItems": ["Tasks mentioned", "Assignments", "Follow-up items", "Further reading suggestions"]

}`;

export function buildSummarizationPrompt(options: SummarizationOptions): string {
  const detailLevel = options.detailLevel || 'detailed';
  const focusAreas = options.focusAreas?.join(', ') || 'all topics';
  const language = options.language || 'english';

  const langKey = language === 'hinglish' ? 'hinglish' : 'english';
  const languageInstruction = SUMMARIZATION_LANGUAGE_INSTRUCTIONS[langKey];
  const languageLabel = language === 'hinglish' ? 'Hinglish' : 'English';

  const schema = SUMMARIZATION_JSON_SCHEMA.replace('{detailLevel}', detailLevel);

  return "You are an expert academic note-taker and assistant. Analyze the following transcript and generate structured, comprehensive notes in JSON format.\n\n" + languageInstruction + "\n\nFocus on: " + focusAreas + "\nDetail level: " + detailLevel + "\n\nGenerate a JSON object with the following structure:\n" + schema + "\n\nRules:\n- Extract all key concepts, definitions, and examples mentioned\n- Generate 5-10 multiple choice quiz questions that test comprehension of key concepts\n- Quiz questions should cover important topics from the lecture\n- Each quiz question must have 4 options with exactly one correct answer\n- correctAnswer is the index (0-3) of the correct option in the options array\n- Include explanation for each quiz answer to aid learning\n- Organize information logically and hierarchically\n- Use clear, academic language in the specified language (" + languageLabel + ")\n- Identify relationships between concepts\n- Highlight important formulas, theories, or frameworks\n- Note any examples, case studies, or illustrations used\n- Capture action items and next steps\n- If no example problems are present, return empty array\n- Ensure all JSON is valid and properly formatted\n- Do not include any text outside the JSON object";
}

