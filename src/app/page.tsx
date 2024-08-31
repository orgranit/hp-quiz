"use client";

import React, { useState } from 'react';
import QuizWizard, { WizardData } from '@/components/QuizWizard';
import HarryPotterQuiz from '@/components/HarryPotterQuiz';
import { Question } from '@/types/quiz';

export default function Home() {
  const [quizData, setQuizData] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWizardComplete = async (data: WizardData) => {
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const generatedQuestions: Question[] = await response.json();
      setQuizData(generatedQuestions);
      setError(null);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      {!quizData ? (
        <QuizWizard onComplete={handleWizardComplete} />
      ) : (
        <HarryPotterQuiz questions={quizData} />
      )}
    </main>
  );
}
