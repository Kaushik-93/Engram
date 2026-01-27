"use client";

import * as React from "react";
import { SessionHeader } from "./SessionHeader";
import { SessionLoading } from "./SessionLoading";
import { SessionPrompt } from "./SessionPrompt";
import { SessionReview } from "./SessionReview";

interface RecallSessionProps {
    step: "prompt" | "review" | "loading";
    questions: any[];
    currentIndex: number;
    userAnswer: string;
    evaluation: any;
    confidence: number;
    isEvaluating: boolean;
    setUserAnswer: (answer: string) => void;
    setConfidence: (confidence: number) => void;
    onSubmit: () => void;
    onSkip: () => void;
    onRetry: () => void;
    onNext: () => void;
    onExit: () => void;
}

export function RecallSession({
    step,
    questions,
    currentIndex,
    userAnswer,
    evaluation,
    confidence,
    isEvaluating,
    setUserAnswer,
    setConfidence,
    onSubmit,
    onSkip,
    onRetry,
    onNext,
    onExit
}: RecallSessionProps) {
    const currentQuestion = questions[currentIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-3xl mx-auto px-6 py-12">
            <SessionHeader
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                onExit={onExit}
            />

            <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-700">
                {step === "loading" && <SessionLoading />}

                {step === "prompt" && (
                    <SessionPrompt
                        currentQuestion={currentQuestion}
                        userAnswer={userAnswer}
                        isEvaluating={isEvaluating}
                        setUserAnswer={setUserAnswer}
                        onSkip={onSkip}
                        onSubmit={onSubmit}
                    />
                )}

                {step === "review" && (
                    <SessionReview
                        evaluation={evaluation}
                        currentQuestion={currentQuestion}
                        confidence={confidence}
                        setConfidence={setConfidence}
                        onRetry={onRetry}
                        onNext={onNext}
                    />
                )}
            </div>
        </div>
    );
}
