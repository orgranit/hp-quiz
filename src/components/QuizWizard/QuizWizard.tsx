import React, { useState } from 'react';
import BookSelection from './BookSelection';
import ChapterSelection from './ChapterSelection';
import PageSelection from './PageSelection';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface WizardData {
  bookNumber: number;
  chapters: number[];
  pages?: [number, number];
}

interface QuizWizardProps {
  onComplete: (data: WizardData) => void;
}

const QuizWizard: React.FC<QuizWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [selectedPages, setSelectedPages] = useState<[number, number] | null>(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    if (selectedBook !== null) {
      onComplete({
        bookNumber: selectedBook,
        chapters: selectedChapters,
        pages: selectedPages || undefined
      });
    }
  };

  const isNextDisabled = () => {
    if (step === 1) return selectedBook === null;
    if (step === 2) return selectedChapters.length === 0;
    if (step === 3 && selectedChapters.length === 1) return selectedPages === null;
    return false;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quiz Setup Wizard - Step {step}</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && <BookSelection onSelect={setSelectedBook} selectedBook={selectedBook} />}
        {step === 2 && <ChapterSelection onSelect={setSelectedChapters} selectedChapters={selectedChapters} />}
        {step === 3 && selectedChapters.length === 1 && (
          <PageSelection onSelect={setSelectedPages} selectedPages={selectedPages} />
        )}
        <div className="flex justify-between mt-4">
          {step > 1 && (
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={isNextDisabled()}>
            {step === 3 ? 'Generate Quiz' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizWizard;