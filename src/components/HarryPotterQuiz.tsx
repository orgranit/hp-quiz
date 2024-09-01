"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Question } from '@/types/quiz';

interface HarryPotterQuizProps {
  questions: Question[];
}

const HarryPotterQuiz: React.FC<HarryPotterQuizProps> = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        setScore(score + 1);
      }
      setShowResult(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowHint(false);
      setShowResult(false);
    } else {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setScore(0);
    setGameOver(false);
    setShowResult(false);
  };

  if (gameOver) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">Your score: {score} / {questions.length}</p>
          <Button onClick={handleRestart} className="w-full">Restart Quiz</Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Harry Potter Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">Question {currentQuestion + 1} of {questions.length}</p>
        <p className="text-xl mb-4">{currentQuestionData.text}</p>
        <div className="space-y-2">
          {currentQuestionData.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              variant={selectedAnswer === option ? "secondary" : "outline"}
              className="w-full justify-start text-left whitespace-normal break-words"
            >
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Button onClick={handleSubmit} disabled={!selectedAnswer || showResult} className="w-full">
            Submit
          </Button>
          <Button onClick={() => setShowHint(!showHint)} variant="outline" className="w-full">
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
        </div>
        {showHint && (
          <p className="mt-4 text-sm italic">{currentQuestionData.hint}</p>
        )}
        {showResult && (
          <div className="mt-4">
            <p className={selectedAnswer === currentQuestionData.correctAnswer ? "text-green-600" : "text-red-600"}>
              {selectedAnswer === currentQuestionData.correctAnswer ? "Correct!" : "Incorrect!"}
            </p>
            <p className="mt-2">Correct answer: {currentQuestionData.correctAnswer}</p>
            <p className="mt-1">Hebrew translation: {currentQuestionData.hebrewTranslation}</p>
            <Button onClick={handleNextQuestion} className="w-full mt-4">
              {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </div>
        )}
        <p className="mt-4 text-sm">Score: {score} / {questions.length}</p>
      </CardContent>
    </Card>
  );
};

export default HarryPotterQuiz;