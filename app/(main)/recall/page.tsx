"use client";

import * as React from "react";
import { bookStore, Book, highlightStore, flashcardStore, recallStore } from "@/lib/store";
import { RecallDashboard } from "@/components/recall/RecallDashboard";
import { RecallSession } from "@/components/recall/RecallSession";

/**
 * Main Recall Page Container
 * Manages the high-level state for the recall session and switches between 
 * the dashboard view and the active session view.
 */
export default function RecallPage() {
    // -- State Management --
    const [view, setView] = React.useState<"dashboard" | "session">("dashboard");
    const [books, setBooks] = React.useState<Book[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Session State
    const [questions, setQuestions] = React.useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [step, setStep] = React.useState<"prompt" | "review" | "loading">("prompt");
    const [userAnswer, setUserAnswer] = React.useState("");
    const [evaluation, setEvaluation] = React.useState<{ isCorrect: boolean; feedback: string; score: number } | null>(null);
    const [isEvaluating, setIsEvaluating] = React.useState(false);
    const [confidence, setConfidence] = React.useState<number>(50);

    // -- Effects --
    React.useEffect(() => {
        loadData();
    }, []);

    // -- Handlers --

    /**
     * Loads the initial list of books/subjects.
     */
    async function loadData() {
        setIsLoading(true);
        try {
            const allBooks = await bookStore.getAll();
            setBooks(allBooks);
        } catch (err) {
            console.error("Failed to load books:", err);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Initializes a new recall session for the selected book.
     * Generates questions based on highlights and flashcards.
     */
    async function startSession(book: Book) {
        setIsLoading(true);
        try {
            // Fetch context data
            const [h, f] = await Promise.all([
                highlightStore.getByBook(book.id),
                flashcardStore.getByBook(book.id)
            ]);

            if (h.length === 0 && f.length === 0) {
                alert("This book has no context (highlights or flashcards) to generate recall sessions!");
                setIsLoading(false);
                return;
            }

            // Initialize Session State
            setView("session");
            setStep("loading");

            // Generate Questions via AI
            const aiQuestions = await recallStore.generateQuestions(book.id, book.title, f, h);
            setQuestions(aiQuestions);
            setCurrentIndex(0);
            setStep("prompt");
        } catch (err) {
            console.error("Failed to start recall session:", err);
            alert("Failed to initialize session. Please try again.");
            setView("dashboard");
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Submits the user's answer for AI evaluation.
     */
    async function handleAnswerSubmit() {
        if (!userAnswer.trim() || isEvaluating) return;

        setIsEvaluating(true);
        try {
            const currentQ = questions[currentIndex];
            const result = await recallStore.evaluateAnswer(
                currentQ.question,
                currentQ.correctReference,
                userAnswer
            );
            setEvaluation(result);
            setStep("review");
        } catch (err) {
            console.error("Evaluation failed:", err);
        } finally {
            setIsEvaluating(false);
        }
    }

    /**
     * Resets state for a retry of the current question.
     */
    function handleRetry() {
        setStep("prompt");
        setEvaluation(null);
    }

    /**
     * Moves to the next question or finishes the session.
     */
    function handleNext() {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStep("prompt");
            setUserAnswer("");
            setEvaluation(null);
            setConfidence(50);
        } else {
            setView("dashboard");
        }
    }

    /**
     * Skips the current question.
     */
    function handleSkip() {
        // Same logic as next for now, but arguably could track skips differently
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer("");
        } else {
            setView("dashboard");
        }
    }

    // -- Render --
    if (view === "dashboard") {
        return (
            <RecallDashboard
                books={books}
                isLoading={isLoading}
                onStartSession={startSession}
            />
        );
    }

    return (
        <RecallSession
            step={step}
            questions={questions}
            currentIndex={currentIndex}
            userAnswer={userAnswer}
            evaluation={evaluation}
            confidence={confidence}
            isEvaluating={isEvaluating}
            setUserAnswer={setUserAnswer}
            setConfidence={setConfidence}
            onSubmit={handleAnswerSubmit}
            onSkip={handleSkip}
            onRetry={handleRetry}
            onNext={handleNext}
            onExit={() => setView("dashboard")}
        />
    );
}
