CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id INTEGER NOT NULL,
  chapter_ids INTEGER[] NOT NULL,
  page_start INTEGER,
  page_end INTEGER,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR NOT NULL,
  hebrew_translation VARCHAR NOT NULL,
  hint TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);