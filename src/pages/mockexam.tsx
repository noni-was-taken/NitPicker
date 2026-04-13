import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Layout from "../components/Layout";
import { MOCK_EXAM_IMAGE_BASE_PATH } from "../config/constants";
import { normalizeLegacySymbols, normalizeMathDelimiters } from "../lib/textFormat";
import { trackEvent } from "../lib/analytics";
import { CaretLeftIcon, CaretRightIcon, PauseCircleIcon, PlayCircleIcon, EyeSlashIcon, EyeIcon, SmileySadIcon } from "@phosphor-icons/react";
import {
    clearMockExamSession,
    computeMockExamResult,
    formatClockFromSeconds,
    loadMockExamSession,
    saveMockExamResult,
    saveMockExamSession,
} from "../exam/mockExamModel";
import "katex/dist/katex.min.css";

const resolveChoiceImageUrl = (imagePath: string): string => {
    const normalizedPath = imagePath.trim().replace(/\\/g, "/").replace(/^\.?\//, "");

    if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://") || normalizedPath.startsWith("/")) {
        return normalizedPath;
    }

    return `${MOCK_EXAM_IMAGE_BASE_PATH}${normalizedPath}`;
};

export default function MockExamPage() {
    const navigate = useNavigate();
    const [session] = useState(() => loadMockExamSession());
    const [currentIndex, setCurrentIndex] = useState(session?.currentQuestionIndex ?? 0);
    const [answers, setAnswers] = useState<Record<string, string>>(session?.answers ?? {});
    const [hintsUsed, setHintsUsed] = useState(session?.hintsUsed ?? 0);
    const [hintShownByQuestion, setHintShownByQuestion] = useState<Record<string, boolean>>({});
    const [eliminatedOptionsByQuestion, setEliminatedOptionsByQuestion] = useState<Record<string, string[]>>({});
    const [showExplanationByQuestion, setShowExplanationByQuestion] = useState<Record<string, boolean>>({});
    const [elapsedSeconds, setElapsedSeconds] = useState(() =>
        session ? Math.floor((Date.now() - session.startedAtMs) / 1000) : 0,
    );
    const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);
    const [isOverallTimerPaused, setIsOverallTimerPaused] = useState(false);
    const [isQuestionTimerPaused, setIsQuestionTimerPaused] = useState(false);
    const [isQuestionTimerVisible, setIsQuestionTimerVisible] = useState(true);
    const hasFinalizedRef = useRef(false);

    const questions = session?.questions ?? [];
    const totalQuestions = questions.length;
    const currentQuestion = questions[currentIndex];
    const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

    const isTimed = session?.settings.isTimed ?? false;
    const totalDurationSeconds = (session?.settings.durationMinutes ?? 0) * 60;

    const finalizeExam = useCallback((forcedElapsedSeconds?: number) => {
        if (!session || hasFinalizedRef.current) {
            return;
        }

        hasFinalizedRef.current = true;

        const totalExamSeconds = Math.max(0, Math.floor(forcedElapsedSeconds ?? elapsedSeconds));
        const result = computeMockExamResult(session, answers, totalExamSeconds, hintsUsed);

        trackEvent('exam_completed', {
            score: result.correctAnswers,
            total_questions: result.totalQuestions,
            duration_seconds: result.totalTimeSeconds,
            passed: result.totalQuestions > 0 && result.correctAnswers / result.totalQuestions >= 0.6,
        });

        saveMockExamResult(result);
        clearMockExamSession();
        navigate("/mockexamresults");
    }, [session, answers, elapsedSeconds, hintsUsed, navigate]);

    useEffect(() => {
        if (!session || hasFinalizedRef.current || isOverallTimerPaused) {
            return;
        }

        const timerId = window.setInterval(() => {
            setElapsedSeconds((currentSeconds) => currentSeconds + 1);
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [session, isOverallTimerPaused]);

    useEffect(() => {
        if (!currentQuestion || isQuestionTimerPaused) {
            return;
        }

        const timerId = window.setInterval(() => {
            setQuestionElapsedSeconds((currentSeconds) => currentSeconds + 1);
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [currentQuestion, isQuestionTimerPaused]);

    useEffect(() => {
        if (!session || !isTimed || hasFinalizedRef.current || totalDurationSeconds <= 0) {
            return;
        }

        if (elapsedSeconds >= totalDurationSeconds) {
            finalizeExam(totalDurationSeconds);
        }
    }, [elapsedSeconds, isTimed, session, totalDurationSeconds, finalizeExam]);

    useEffect(() => {
        if (!session) {
            return;
        }

        saveMockExamSession({
            ...session,
            currentQuestionIndex: currentIndex,
            answers,
            hintsUsed,
        });
    }, [session, currentIndex, answers, hintsUsed]);

    const moveToQuestion = (nextIndex: number) => {
        const boundedIndex = Math.max(0, Math.min(totalQuestions - 1, nextIndex));
        setCurrentIndex(boundedIndex);
        setQuestionElapsedSeconds(0);
    };

    const handleNextQuestion = () => {
        if (currentIndex >= totalQuestions - 1) {
            finalizeExam();
            return;
        }

        moveToQuestion(currentIndex + 1);
    };

    const handlePreviousQuestion = () => {
        moveToQuestion(currentIndex - 1);
    };

    const handleSelectAnswer = (optionKey: string) => {
        if (!currentQuestion) {
            return;
        }

        setAnswers((currentAnswers) => {
            const hasExistingAnswer = Boolean(currentAnswers[currentQuestion.id]);

            if (session?.settings.instantAnswers && hasExistingAnswer) {
                return currentAnswers;
            }

            return {
                ...currentAnswers,
                [currentQuestion.id]: optionKey,
            };
        });
    };

    const handleUseHint = () => {
        if (!currentQuestion) {
            return;
        }

        if (hintShownByQuestion[currentQuestion.id]) {
            return;
        }

        const removableOptionKeys = answerLetterKeys.filter((letter) => {
            const option = optionByKey.get(letter);
            const hasChoiceContent = Boolean(option && (option.text || option.imagePath));
            const isCorrectOption = letter === currentQuestion.correctOption;
            const isCurrentlySelected = selectedAnswer === letter;

            return hasChoiceContent && !isCorrectOption && !isCurrentlySelected;
        });

        const shuffledWrongOptions = [...removableOptionKeys].sort(() => Math.random() - 0.5);
        const eliminatedKeys = shuffledWrongOptions.slice(0, 2);

        setEliminatedOptionsByQuestion((currentEliminated) => ({
            ...currentEliminated,
            [currentQuestion.id]: eliminatedKeys,
        }));

        setHintsUsed((currentCount) => currentCount + 1);
        setHintShownByQuestion((currentHints) => ({
            ...currentHints,
            [currentQuestion.id]: true,
        }));
    };

    const handleToggleExplanation = () => {
        if (!currentQuestion) {
            return;
        }

        setShowExplanationByQuestion((current) => {
            const nextVisible = !current[currentQuestion.id];
            if (nextVisible) {
                setIsQuestionTimerPaused(true);
            }

            return {
                ...current,
                [currentQuestion.id]: nextVisible,
            };
        });
    };

    const handleToggleQuestionTimerPause = () => {
        setIsQuestionTimerPaused((currentValue) => {
            const nextValue = !currentValue;

            if (currentValue && !isQuestionTimerVisible) {
                setIsQuestionTimerVisible(true);
            }

            return nextValue;
        });
    };

    const handleToggleQuestionTimerVisibility = () => {
        setIsQuestionTimerVisible((currentValue) => {
            const nextVisible = !currentValue;
            if (!nextVisible) {
                setIsQuestionTimerPaused(true);
            }
            return nextVisible;
        });
    };

    const handleToggleOverallTimerPause = () => {
        setIsOverallTimerPaused((currentValue) => !currentValue);
    };

    if (!session || !currentQuestion) {
        return (
            <Layout className="py-10 md:py-0 gap-6 md:gap-10 select-none">
                    <div className="flex-1 w-full flex items-center justify-center px-6 md:px-20">
                        <div className="border-2 border-black dark:border-white p-8 md:p-10 w-full max-w-xl flex flex-col items-center gap-6 text-center dark:text-white">
                            <SmileySadIcon className="h-16 w-auto" weight="bold"></SmileySadIcon>
                            <h1 className="text-3xl md:text-4xl font-bold">No active mock exam found</h1>
                            <p className="text-sm md:text-base opacity-75">Start from the prep page so we can build an exam from your selected settings.</p>
                            <button
                                type="button"
                                onClick={() => navigate("/mockexamprep")}
                                className="border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white transition-colors duration-200 dark:border-white dark:hover:bg-white dark:hover:text-black"
                            >
                                GO TO MOCK EXAM PREP
                            </button>
                        </div>
                    </div>
            </Layout>
        );
    }

    const examTimerDisplay = isTimed
        ? formatClockFromSeconds(Math.max(0, totalDurationSeconds - elapsedSeconds), true)
        : formatClockFromSeconds(elapsedSeconds, true);

    const instantRevealEnabled = session.settings.instantAnswers && Boolean(selectedAnswer);
    const answerLockedForCurrentQuestion = session.settings.instantAnswers && Boolean(selectedAnswer);
    const selectedAnswerIsCorrect = selectedAnswer === currentQuestion.correctOption;
    const currentAnswerExplanation = currentQuestion.answerExplanation?.trim() ?? "";
    const canShowExplanationButton = instantRevealEnabled && Boolean(currentAnswerExplanation);
    const explanationVisible = Boolean(showExplanationByQuestion[currentQuestion.id]) && canShowExplanationButton;
    const hintVisible = Boolean(hintShownByQuestion[currentQuestion.id]);
    const answerLetterKeys = ["A", "B", "C", "D"] as const;
    const optionByKey = new Map(currentQuestion.options.map((option) => [option.key, option]));
    const eliminatedOptionSet = new Set(eliminatedOptionsByQuestion[currentQuestion.id] ?? []);
    const allQuestionImagePaths = Array.from(
        new Set(
            [
                currentQuestion.questionImagePath,
                ...currentQuestion.options.map((choice) => choice.imagePath),
            ].filter((path): path is string => Boolean(path)),
        ),
    );
    const renderedChoices = answerLetterKeys.map((letter) => {
        const option = optionByKey.get(letter);

        return (
            option ?? {
                key: letter,
                text: "",
                imagePath: null,
            }
        );
    });

    return (
        <Layout className="py-10 md:py-0 md:min-h-screen md:w-full dark:text-white gap-4 md:gap-10 select-none">

                <div className="w-[79vw] md:w-full flex justify-between md:px-10 items-center">
                    <button
                        type="button"
                        onClick={handlePreviousQuestion}
                        disabled={currentIndex === 0}
                        className="disabled:opacity-30"
                    >
                        <CaretLeftIcon className="h-10 md:h-15 w-auto hover:scale-110 duration-150 cursor-pointer" weight="bold"></CaretLeftIcon>
                    </button>
                    <div className="flex items-center gap-3 md:gap-4">
                        <h1 className="text-3xl md:text-5xl font-light">{examTimerDisplay}</h1>
                        <button
                            type="button"
                            onClick={handleToggleOverallTimerPause}
                            className="p-1 md:p-2 hover:scale-110 duration-150 cursor-pointer"
                            aria-label={isOverallTimerPaused ? "Resume overall timer" : "Pause overall timer"}
                        >
                            {isOverallTimerPaused ? (
                                <PlayCircleIcon className="h-6 md:h-10 w-auto" weight="bold"></PlayCircleIcon>
                            ) : (
                                <PauseCircleIcon className="h-6 md:h-10 w-auto" weight="bold"></PauseCircleIcon>
                            )}
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="disabled:opacity-30"
                    >
                        <CaretRightIcon className="h-10 md:h-15 w-auto hover:scale-110 duration-150 cursor-pointer" weight="bold"></CaretRightIcon>
                    </button>
                </div>

                <div className="md:min-h-[69vh] flex-col md:flex-row w-full flex items-center justify-between gap-10 md:gap-0 px-4 lg:px-20">
                    <div className="flex flex-col md:w-1/2 md:max-w-5xl border-black dark:border-white md:p-6 gap-5 md:gap-6 bg-white dark:bg-zinc-950 text-black dark:text-white">
                        <div className="flex md:w-full justify-between items-center gap-4">
                            <div className="flex gap-1 items-center">
                                <h1 className="font-extrabold md:text-3xl text-3xl">Q{currentIndex + 1}</h1>
                                <p className="opacity-85 md:text-lg text-lg">/{totalQuestions}</p>
                            </div>
                            <h1 className="text-sm md:text-2xl opacity-55 font-extrabold text-right">{currentQuestion.subjectTopic.toUpperCase()}</h1>
                        </div>

                        <div className="md:text-base text-justify leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {normalizeMathDelimiters(normalizeLegacySymbols(currentQuestion.questionText))}
                            </ReactMarkdown>
                        </div>

                        {currentQuestion.tableText ? (
                            <div className="question-table-wrap border border-black/25 dark:border-white/25 bg-black/2 dark:bg-white/5 p-3 md:p-4 overflow-x-auto">
                                <div className="text-xs md:text-sm leading-relaxed">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                    >
                                        {currentQuestion.tableText}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : null}

                        {allQuestionImagePaths.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                <p className="font-extrabold text-xs md:text-sm tracking-wide">IMAGES</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {allQuestionImagePaths.map((imagePath, imageIndex) => (
                                        <img
                                            key={`${currentQuestion.id}-question-image-${imageIndex}`}
                                            src={resolveChoiceImageUrl(imagePath)}
                                            alt={`Question visual ${imageIndex + 1}`}
                                            className="max-h-56 w-auto object-contain border border-black/10 bg-white"
                                            loading="lazy"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-2 flex flex-col gap-3">
                            {renderedChoices.map((choice) => (
                                <div key={`${currentQuestion.id}-choice-${choice.key}`} className="border-b border-black/25 pb-3">
                                    <p className="font-extrabold text-sm md:text-base mb-2">{choice.key}.</p>
                                    {choice.imagePath ? (
                                        <img
                                            src={resolveChoiceImageUrl(choice.imagePath)}
                                            alt={`Choice ${choice.key}`}
                                            className="max-h-48 w-auto object-contain border border-black/10"
                                            loading="lazy"
                                        />
                                    ) : null}
                                    {choice.text ? (
                                        <div className="text-sm md:text-base mt-2 prose prose-sm max-w-none prose-p:my-0">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {normalizeMathDelimiters(normalizeLegacySymbols(choice.text))}
                                            </ReactMarkdown>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <p className="text-xs opacity-60">Source: {currentQuestion.pdfName} · #{currentQuestion.questionNumber} · Philnits Vault</p>
                    </div>

                    <div className="md:w-1/2 w-full md:px-10 flex flex-col md:flex-col md:gap-12 gap-8">
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex md:gap-5 gap-2 flex-col-reverse md:flex-row">
                                <button
                                    type="button"
                                    onClick={handleUseHint}
                                    disabled={hintVisible}
                                    className="font-extrabold md:px-5 md:py-2 px-5 py-2 border-2 md:h-15 w-35 disabled:opacity-40 disabled:cursor-not-allowed
                                    hover:font-light hover:bg-black hover:text-white duration-150 cursor-pointer dark:border-white dark:hover:bg-white dark:hover:text-black"
                                >
                                    HINT
                                </button>
                            </div>  

                            <div className="flex md:gap-5 gap-4">
                                <div className="md:h-36 h-24 aspect-square rounded-full flex items-center justify-center border-3 md:border-5">
                                    {isQuestionTimerVisible ? (
                                        <h1 className="md:text-2xl text-xl font-bold">{formatClockFromSeconds(questionElapsedSeconds, false)}</h1>
                                    ) : (
                                        <h1 className="md:text-lg text-sm font-bold tracking-wide">HIDDEN</h1>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center md:gap-5 gap-2">
                                    <button
                                        type="button"
                                        onClick={handleToggleQuestionTimerVisibility}
                                        className="cursor-pointer"
                                        aria-label={isQuestionTimerVisible ? "Hide question timer" : "Show question timer"}
                                    >
                                        {isQuestionTimerVisible ? (
                                            <EyeSlashIcon className="md:h-8 w-auto h-10 hover:scale-110 duration-150" weight="bold"></EyeSlashIcon>
                                        ) : (
                                            <EyeIcon className="md:h-8 w-auto h-10 hover:scale-110 duration-150" weight="bold"></EyeIcon>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleToggleQuestionTimerPause}
                                        className="cursor-pointer hover:scale-110 duration-150"
                                        aria-label={isQuestionTimerPaused ? "Resume question timer" : "Pause question timer"}
                                    >
                                        {isQuestionTimerPaused ? (
                                            <PlayCircleIcon className="md:h-8 w-auto h-10 " weight="bold"></PlayCircleIcon>
                                        ) : (
                                            <PauseCircleIcon className="md:h-8 w-auto h-10" weight="bold"></PauseCircleIcon>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {hintVisible ? (
                            <p className="text-sm border-l-4 border-black dark:border-white pl-3">
                                Hint used: {eliminatedOptionSet.size} incorrect {eliminatedOptionSet.size === 1 ? "option" : "options"} removed.
                            </p>
                        ) : null}

                        {instantRevealEnabled ? (
                            <p className={`text-sm border-l-4 pl-3 ${selectedAnswerIsCorrect ? "border-green-700 text-green-700" : "border-red-700 text-red-700"}`}>
                                {selectedAnswerIsCorrect
                                    ? "Correct answer!"
                                    : `Incorrect. Correct answer is ${currentQuestion.correctOption}.`}
                            </p>
                        ) : null}

                        {canShowExplanationButton ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={handleToggleExplanation}
                                    className="border-2 border-black py-2 px-4 text-sm md:text-base font-bold hover:bg-black hover:text-white transition-colors duration-200 dark:border-white dark:hover:bg-white dark:hover:text-black"
                                >
                                    {explanationVisible ? "HIDE EXPLANATION" : "SHOW EXPLANATION"}
                                </button>

                                {explanationVisible ? (
                                    <div className="border border-black/25 dark:border-white/25 bg-black/5 dark:bg-white/5 p-3 md:p-4">
                                        <p className="font-extrabold text-xs md:text-sm mb-2 tracking-wide">HOW THIS IS ANSWERED</p>
                                        <div className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {normalizeMathDelimiters(normalizeLegacySymbols(currentAnswerExplanation))}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="grid grid-cols-2 gap-2 md:gap-0">
                            {answerLetterKeys.map((letter) => {
                                const choice = optionByKey.get(letter);
                                const hasChoiceContent = Boolean(choice && (choice.text || choice.imagePath));
                                const isSelected = selectedAnswer === letter;
                                const isEliminated = eliminatedOptionSet.has(letter);
                                const isDisabled = !hasChoiceContent || answerLockedForCurrentQuestion || isEliminated;

                                return (
                                    <button
                                        key={`${currentQuestion.id}-${letter}`}
                                        type="button"
                                        onClick={() => handleSelectAnswer(letter)}
                                        disabled={isDisabled}
                                        className={`duration-300 cursor-pointer px-5 py-7 md:px-10 md:py-5 md:text-2xl border ${
                                            !hasChoiceContent
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                                                : answerLockedForCurrentQuestion
                                                    ? isSelected
                                                        ? "text-black bg-white border-black font-extrabold cursor-not-allowed dark:text-white dark:bg-zinc-950 dark:border-white"
                                                        : "text-black/60 bg-white border-black/30 cursor-not-allowed dark:text-white/60 dark:bg-zinc-950 dark:border-white/30"
                                                    : isEliminated
                                                        ? "bg-gray-200 text-gray-500 border-black/20 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500 dark:border-white/20"
                                                    : isSelected
                                                        ? "text-black bg-white border-black font-extrabold dark:text-white dark:bg-zinc-950 dark:border-white"
                                                        : "text-white bg-black border-white hover:text-black hover:bg-white hover:font-extrabold dark:text-black dark:bg-white dark:border-black dark:hover:text-white dark:hover:bg-black"
                                        }`}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="border-2 border-black py-3 font-bold hover:bg-black hover:text-white transition-colors duration-200 dark:border-white dark:hover:bg-white dark:hover:text-black"
                        >
                            NEXT QUESTION
                        </button>

                        <button
                            type="button"
                            onClick={() => finalizeExam()}
                            className="border-2 border-black py-3 font-bold hover:bg-black hover:text-white transition-colors duration-200 dark:border-white dark:hover:bg-white dark:hover:text-black"
                        >
                            SUBMIT EXAM
                        </button>
                    </div>
                </div>

        </Layout>
    );
}
