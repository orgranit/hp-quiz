"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WizardProps {
  onComplete: (data: WizardData) => void;
}

export interface WizardData {
  bookNumber: number;
  chapters: number[];
  pages?: number[];
}

const QuizWizard: React.FC<WizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [bookNumber, setBookNumber] = useState<number>(1);
  const [chapters, setChapters] = useState<string>("");
  const [pages, setPages] = useState<string>("");

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    const chapterArray = chapters.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c));
    const pageArray = pages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    onComplete({
      bookNumber,
      chapters: chapterArray,
      pages: chapterArray.length > 1 ? undefined : pageArray
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Quiz Setup Wizard</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <Label htmlFor="bookNumber">Book Number (1-7)</Label>
            <Input
              id="bookNumber"
              type="number"
              min="1"
              max="7"
              value={bookNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookNumber(parseInt(e.target.value))}
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Label htmlFor="chapters">Chapter(s) (comma-separated)</Label>
            <Input
              id="chapters"
              value={chapters}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChapters(e.target.value)}
              placeholder="e.g., 1,2,3 or 1"
            />
          </div>
        )}
        {step === 3 && chapters.split(',').length === 1 && (
          <div className="space-y-4">
            <Label htmlFor="pages">Page Range (comma-separated)</Label>
            <Input
              id="pages"
              value={pages}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPages(e.target.value)}
              placeholder="e.g., 1,20"
            />
          </div>
        )}
        <Button onClick={handleNext} className="mt-4 w-full">
          {step < 3 ? "Next" : "Generate Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizWizard;