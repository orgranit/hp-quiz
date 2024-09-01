import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Question } from '@/types/quiz';
import { WizardData } from '@/components/QuizWizard/QuizWizard';
import { harryPotterBooks, Book, Chapter } from '@/data/harryPotterBooks';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in the environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || 'dummy_key', // Fallback to a dummy key to prevent instantiation error
});

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key is not set. Please check your environment variables.' }, { status: 500 });
  }

  const data: WizardData = await request.json();

  try {
    const questions = await generateQuestions(data);
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to generate questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}

async function generateQuestions(data: WizardData): Promise<Question[]> {
  const { bookNumber, chapters, pages } = data;
  const book = harryPotterBooks.find(b => b.id === bookNumber);
  
  if (!book) {
    throw new Error('Book not found');
  }

  const selectedChapters = book.chapters.filter(c => chapters.includes(c.id));
  const numQuestions = pages ? Math.min(20, Math.max(5, pages[1] - pages[0])) : 10;

  const chapterInfo = selectedChapters.length > 1 
    ? `chapters ${selectedChapters.map(c => c.title).join(', ')}`
    : `chapter ${selectedChapters[0].title}`;

  const pageInfo = pages 
    ? `, pages ${pages.join('-')}` 
    : '';

  const prompt = `Generate ${numQuestions} multiple-choice questions about ${book.title}, ${chapterInfo}${pageInfo}. For each question, provide 4 options, the correct answer, a Hebrew translation of the correct answer, and a hint. Format the response as a JSON array of objects with the following structure: { text: string, options: string[], correctAnswer: string, hebrewTranslation: string, hint: string }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const generatedQuestions: Question[] = JSON.parse(response.choices[0].message.content || '[]');
  return generatedQuestions;
}