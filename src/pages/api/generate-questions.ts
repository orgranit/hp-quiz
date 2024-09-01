import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai';
import { Question } from '@/types/quiz';
import { WizardData } from '@/components/QuizWizard/QuizWizard';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Question[] | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data: WizardData = req.body;

  try {
    const questions = await generateQuestions(data);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to generate questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
}

async function generateQuestions(data: WizardData): Promise<Question[]> {
  const { bookNumber, chapters, pages } = data;
  const numQuestions = pages ? Math.min(20, Math.max(5, pages[1] - pages[0])) : 10;

  const prompt = `Generate ${numQuestions} multiple-choice questions about Harry Potter and the ${getBookTitle(bookNumber)}, ${
    chapters.length > 1 ? `chapters ${chapters.join(', ')}` : `chapter ${chapters[0]}`
  }${pages ? `, pages ${pages.join('-')}` : ''}. For each question, provide 4 options, the correct answer, a Hebrew translation of the correct answer, and a hint. Format the response as a JSON array of objects with the following structure: { text: string, options: string[], correctAnswer: string, hebrewTranslation: string, hint: string }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const generatedQuestions: Question[] = JSON.parse(response.choices[0].message.content || '[]');
  return generatedQuestions;
}

function getBookTitle(bookNumber: number): string {
  const titles = [
    "Philosopher's Stone",
    "Chamber of Secrets",
    "Prisoner of Azkaban",
    "Goblet of Fire",
    "Order of the Phoenix",
    "Half-Blood Prince",
    "Deathly Hallows"
  ];
  return titles[bookNumber - 1] || "Unknown Book";
}