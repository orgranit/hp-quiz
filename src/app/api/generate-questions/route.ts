import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Question } from '@/types/quiz';
import { WizardData } from '@/components/QuizWizard/QuizWizard';
import { harryPotterBooks } from '@/data/harryPotterBooks';
import { supabase } from '@/lib/supabaseClient';

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
    console.log('Fetching questions from DB...');
    console.log('Request data:', data);
    let questions = await getQuestionsFromDB(data);
    console.log(`Fetched ${questions.length} questions from DB`);
    console.log('Fetched questions:', questions);

    const requiredQuestions = data.pages ? Math.min(20, Math.max(5, data.pages[1] - data.pages[0])) : 10;

    if (questions.length < requiredQuestions) {
      console.log(`Generating ${requiredQuestions - questions.length} additional questions from OpenAI...`);
      const additionalQuestions = await generateQuestions(data, requiredQuestions - questions.length);
      console.log(`Generated ${additionalQuestions.length} questions from OpenAI`);
      await storeQuestionsInDB(data, additionalQuestions);
      questions = [...questions, ...additionalQuestions];
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to generate questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}

async function getQuestionsFromDB(data: WizardData): Promise<Question[]> {
  const { bookId, chapters, pages } = data;
  const pageStart = pages ? pages[0] : null;
  const pageEnd = pages ? pages[1] : null;

  let query = supabase
    .from('questions')
    .select('*')
    .eq('book_id', bookId)
    .overlaps('chapter_ids', chapters);

  if (pageStart !== null && pageEnd !== null) {
    query = query.or(
      `and(page_start.gte.${pageStart},page_start.lte.${pageEnd}),` +
      `and(page_end.gte.${pageStart},page_end.lte.${pageEnd}),` +
      `and(page_start.lte.${pageStart},page_end.gte.${pageEnd})`
    );
  }

  const { data: questions, error } = await query;

  if (error) {
    console.error('Error fetching questions from DB:', error.message);
    throw new Error(error.message);
  }

  // Convert database structure to match OpenAI structure
  return (questions || []).map(q => ({
    text: q.question_text,
    options: q.options,
    correctAnswer: q.correct_answer,
    hebrewTranslation: q.hebrew_translation,
    hint: q.hint,
    pageStart: q.page_start,
    pageEnd: q.page_end,
    chapterIds: q.chapter_ids,
  }));
}

async function storeQuestionsInDB(data: WizardData, questions: Question[]): Promise<void> {
  const { bookId } = data;

  const formattedQuestions = questions.map(question => ({
    book_id: bookId,
    chapter_ids: question.chapterIds,
    page_start: question.pageStart,
    page_end: question.pageEnd,
    question_text: question.text, // Note this field name
    options: question.options,
    correct_answer: question.correctAnswer,
    hebrew_translation: question.hebrewTranslation,
    hint: question.hint,
  }));

  const { error } = await supabase
    .from('questions')
    .insert(formattedQuestions);

  if (error) {
    console.error('Error storing questions in DB:', error.message);
    throw new Error(error.message);
  }
}

async function generateQuestions(data: WizardData, numQuestions: number): Promise<Question[]> {
  const { bookId, chapters, pages } = data;
  const book = harryPotterBooks.find(b => b.id === bookId);
  
  if (!book) {
    throw new Error('Book not found');
  }

  const selectedChapters = book.chapters.filter(c => chapters.includes(c.id));

  const chapterInfo = selectedChapters.map(c => `${c.id}: ${c.title}`).join(', ');

  const pageInfo = pages 
    ? `pages ${pages.join('-')}` 
    : 'all pages';

  const prompt = `Generate ${numQuestions} multiple-choice questions about ${book.title}, focusing on ${chapterInfo}, ${pageInfo}. 

For each question, provide:
1. The question text
2. 4 options
3. The correct answer
4. A Hebrew translation of the correct answer
5. A hint
6. The EXACT page range the question relates to (must be within ${pages ? `${pages[0]}-${pages[1]}` : 'the book\'s page range'}). In most cases, this should be a subset of the provided range, but it may occasionally span the entire range if the question is broad enough.
7. The SPECIFIC chapter ID(s) the question relates to (must be one or more from: ${chapters.join(', ')})

Ensure that the page ranges and chapter IDs are accurate and within the specified ranges. The page range for each question should typically be more specific than the overall provided range, focusing on the particular content the question addresses.

Format the response as a JSON array of objects with the following structure: 
{ 
  text: string, 
  options: string[], 
  correctAnswer: string, 
  hebrewTranslation: string, 
  hint: string, 
  pageRange: string, 
  chapterIds: number[] 
}`;

  console.log('Sending prompt to OpenAI:', prompt);

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const generatedQuestions: Question[] = JSON.parse(response.choices[0].message.content || '[]');
  console.log('Received response from OpenAI:', generatedQuestions);

  return generatedQuestions.map(q => ({
    ...q,
    pageStart: q.pageRange ? parseInt(q.pageRange.split('-')[0], 10) : null,
    pageEnd: q.pageRange ? parseInt(q.pageRange.split('-')[1], 10) : null,
  }));
}