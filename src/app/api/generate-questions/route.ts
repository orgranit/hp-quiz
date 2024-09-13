import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Question, OpenAIQuestionResponse } from '@/types/quiz';
import { WizardData } from '@/components/QuizWizard/QuizWizard';
import { harryPotterBooks } from '@/data/harryPotterBooks';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'edge'; // Use Edge Runtime

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
      try {
        const additionalQuestions = await generateQuestions(data, requiredQuestions - questions.length);
        await storeQuestionsInDB(data, additionalQuestions);
        
        const convertedQuestions: Question[] = additionalQuestions.map(q => ({
          ...q,
          pageStart: parseInt(q.pageRange.split('-')[0], 10),
          pageEnd: parseInt(q.pageRange.split('-')[1], 10),
        }));
        
        questions = [...questions, ...convertedQuestions];
      } catch (generateError) {
        console.error('Error generating additional questions:', generateError);
        // Log the full error object for debugging
        console.error('Full error object:', JSON.stringify(generateError, null, 2));
        // Continue with the questions we have from the database
      }
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to process questions:', error);
    // Log the full error object for debugging
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Failed to process questions', details: (error as Error).message }, { status: 500 });
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

async function storeQuestionsInDB(data: WizardData, questions: OpenAIQuestionResponse[]): Promise<void> {
  const { bookId } = data;

  const formattedQuestions = questions.map(question => {
    const [pageStart, pageEnd] = question.pageRange.split('-').map(Number);
    return {
      book_id: bookId,
      chapter_ids: question.chapterIds,
      page_start: pageStart,
      page_end: pageEnd,
      question_text: question.text,
      options: question.options,
      correct_answer: question.correctAnswer,
      hebrew_translation: question.hebrewTranslation,
      hint: question.hint,
    };
  });

  const { error } = await supabase
    .from('questions')
    .insert(formattedQuestions);

  if (error) {
    console.error('Error storing questions in DB:', error.message);
    throw new Error(error.message);
  }
}

async function generateQuestions(data: WizardData, numQuestions: number): Promise<OpenAIQuestionResponse[]> {
  const { bookId, chapters, pages } = data;
  const book = harryPotterBooks.find(b => b.id === bookId);
  
  if (!book) {
    throw new Error('Book not found');
  }

  const chapterInfo = chapters.join(', ');
  const pageInfo = pages ? `${pages[0]}-${pages[1]}` : 'all';

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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    console.log('OpenAI response content:', content);

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsedContent = JSON.parse(content);
    let parsedQuestions: OpenAIQuestionResponse[];

    if (Array.isArray(parsedContent)) {
      parsedQuestions = parsedContent;
    } else if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
      parsedQuestions = parsedContent.questions;
    } else if (typeof parsedContent === 'object') {
      // If it's a single question object, wrap it in an array
      parsedQuestions = [parsedContent as OpenAIQuestionResponse];
    } else {
      throw new Error('Unexpected response format from OpenAI');
    }

    // Ensure we have the correct number of questions
    return parsedQuestions.slice(0, numQuestions);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

function parseQuestions(content: string): OpenAIQuestionResponse[] {
  const questions = content.split(/\d+\.\s/).filter(q => q.trim() !== '');
  return questions.map(q => {
    const lines = q.split('\n').map(line => line.trim()).filter(line => line !== '');
    const text = lines[0];
    const options = lines.slice(1, 5).map(option => option.substring(3));
    const answerLine = lines.find(line => line.startsWith('Answer:'));
    const correctAnswer = answerLine ? answerLine.split(':')[1].trim() : '';
    const hebrewTranslationLine = lines.find(line => line.startsWith('Hebrew translation:'));
    const hebrewTranslation = hebrewTranslationLine ? hebrewTranslationLine.split(':')[1].trim() : '';
    const hintLine = lines.find(line => line.startsWith('Hint:'));
    const hint = hintLine ? hintLine.split(':')[1].trim() : '';
    const pageRangeLine = lines.find(line => line.startsWith('Page range:'));
    const pageRange = pageRangeLine ? pageRangeLine.split(':')[1].trim() : '';
    const chapterIdsLine = lines.find(line => line.startsWith('Chapter IDs:'));
    const chapterIds = chapterIdsLine ? chapterIdsLine.split(':')[1].trim().split(',').map(Number) : [];

    return {
      text,
      options,
      correctAnswer,
      hebrewTranslation,
      hint,
      pageRange,
      chapterIds,
    };
  });
}