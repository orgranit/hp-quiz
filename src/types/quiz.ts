export interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  hebrewTranslation: string;
  hint: string;
  chapterIds: number[];
  pageStart: number | null;
  pageEnd: number | null;
}

export interface OpenAIQuestionResponse {
  text: string;
  options: string[];
  correctAnswer: string;
  hebrewTranslation: string;
  hint: string;
  pageRange: string;
  chapterIds: number[];
}