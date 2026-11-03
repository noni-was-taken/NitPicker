import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Layout from "../components/Layout";
import { MOCK_EXAM_IMAGE_BASE_PATH } from "../config/constants";
import { normalizeLegacySymbols, normalizeMathDelimiters } from "../lib/textFormat";
import { trackEvent } from "../lib/analytics";
import {
  ArrowsOutIcon,
  BookmarkSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  LightbulbIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  QuestionIcon,
  SmileySadIcon,
  SquaresFourIcon,
  WarningIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  clearMockExamSession,
  computeMockExamResult,
  formatClockFromSeconds,
  loadBookmarkedQuestionIds,
  loadMockExamSession,
  saveMockExamResult,
  saveMockExamSession,
  toggleQuestionBookmark,
  type MockExamOption,
} from "../exam/mockExamModel";
import { resolveVaultImageUrl } from "../exam/mockExamQuestionBank";
import "katex/dist/katex.min.css";

// Disable KaTeX warning console spam for better performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const katexPlugins: any[] = [[rehypeKatex, { strict: false, throwOnError: false }]];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mathGfmPlugins: any[] = [remarkGfm, remarkMath];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gfmPlugins: any[] = [remarkGfm];

const resolveImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) {
    return null;
  }
  const vaultUrl = resolveVaultImageUrl(imagePath);
  if (vaultUrl) {
    return vaultUrl;
  }
  const normalizedPath = imagePath.trim().replace(/\\/g, "/");
  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://") ||
    normalizedPath.startsWith("/")
  ) {
    return normalizedPath;
  }
  const withoutTraversal = normalizedPath.replace(/^(?:\.\.\/)+/, "").replace(/^\.\//, "");
  if (withoutTraversal.startsWith("philnits-vault/")) {
    return `/${withoutTraversal}`;
  }
  return `${MOCK_EXAM_IMAGE_BASE_PATH}${withoutTraversal}`;
};

export default function MockExamPage() {
  const navigate = useNavigate();
  const [session] = useState(() => loadMockExamSession());

  const [currentIndex, setCurrentIndex] = useState(session?.currentQuestionIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, string>>(session?.answers ?? {});
  const [hintsUsed, setHintsUsed] = useState(session?.hintsUsed ?? 0);
  const [hintShownByQuestion, setHintShownByQuestion] = useState<Record<string, boolean>>(
    session?.hintShownByQuestion ?? {},
  );
  const [eliminatedOptionsByQuestion, setEliminatedOptionsByQuestion] = useState<Record<string, string[]>>(
    session?.eliminatedOptionsByQuestion ?? {},
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>(
    session?.flaggedQuestions ?? {},
  );
  const [showExplanationByQuestion, setShowExplanationByQuestion] = useState<Record<string, boolean>>({});

  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    session?.elapsedSeconds ?? (session ? Math.floor((Date.now() - session.startedAtMs) / 1000) : 0),
  );
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(0);
  const [isOverallTimerPaused, setIsOverallTimerPaused] = useState(session?.isPaused ?? false);
  const [isQuestionTimerPaused, setIsQuestionTimerPaused] = useState(false);
  const [isQuestionTimerVisible, setIsQuestionTimerVisible] = useState(true);

  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>(() => {
    const ids = loadBookmarkedQuestionIds();
    const map: Record<string, boolean> = {};
    ids.forEach((id: string) => {
      map[id] = true;
    });
    return map;
  });

  const hasFinalizedRef = useRef(false);

  const questions = useMemo(() => session?.questions ?? [], [session]);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isBookmarked = currentQuestion ? Boolean(bookmarkMap[currentQuestion.id]) : false;

  const handleToggleBookmark = useCallback(() => {
    if (!currentQuestion) {
      return;
    }
    const next = toggleQuestionBookmark(currentQuestion.id);
    setBookmarkMap((prev) => ({
      ...prev,
      [currentQuestion.id]: next,
    }));
  }, [currentQuestion]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isTimed = session?.settings.isTimed ?? false;
  const totalDurationSeconds = (session?.settings.durationMinutes ?? 0) * 60;
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const isTimeCritical = isTimed && remainingSeconds <= 300 && remainingSeconds > 0;

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const flaggedCount = useMemo(
    () => Object.values(flaggedQuestions).filter(Boolean).length,
    [flaggedQuestions],
  );
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  // Finalize exam function
  const finalizeExam = useCallback(
    (forcedElapsedSeconds?: number) => {
      if (!session || hasFinalizedRef.current) {
        return;
      }

      hasFinalizedRef.current = true;
      const totalExamSeconds = Math.max(0, Math.floor(forcedElapsedSeconds ?? elapsedSeconds));
      const result = computeMockExamResult(session, answers, totalExamSeconds, hintsUsed);

      trackEvent("exam_completed", {
        score: result.correctAnswers,
        total_questions: result.totalQuestions,
        duration_seconds: result.totalTimeSeconds,
        passed: result.totalQuestions > 0 && result.correctAnswers / result.totalQuestions >= 0.6,
      });

      saveMockExamResult(result);
      clearMockExamSession();
      navigate("/mockexamresults");
    },
    [session, answers, elapsedSeconds, hintsUsed, navigate],
  );

  // Overall timer interval
  useEffect(() => {
    if (!session || hasFinalizedRef.current || isOverallTimerPaused) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [session, isOverallTimerPaused]);

  // Per-question timer interval (Synchronized Pause: paused when overall timer is paused!)
  useEffect(() => {
    if (!currentQuestion || isOverallTimerPaused || isQuestionTimerPaused) {
      return;
    }

    const timerId = window.setInterval(() => {
      setQuestionElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [currentQuestion, isOverallTimerPaused, isQuestionTimerPaused]);

  // Timed limit auto-submit
  useEffect(() => {
    if (!session || !isTimed || hasFinalizedRef.current || totalDurationSeconds <= 0) {
      return;
    }

    if (elapsedSeconds >= totalDurationSeconds) {
      finalizeExam(totalDurationSeconds);
    }
  }, [elapsedSeconds, isTimed, session, totalDurationSeconds, finalizeExam]);

  const elapsedSecondsRef = useRef(elapsedSeconds);
  elapsedSecondsRef.current = elapsedSeconds;

  // Session persistence on user interaction (answers, navigation, hints, flags, pause)
  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = setTimeout(() => {
      saveMockExamSession({
        ...session,
        currentQuestionIndex: currentIndex,
        answers,
        hintsUsed,
        elapsedSeconds: elapsedSecondsRef.current,
        isPaused: isOverallTimerPaused,
        hintShownByQuestion,
        eliminatedOptionsByQuestion,
        flaggedQuestions,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [
    session,
    currentIndex,
    answers,
    hintsUsed,
    isOverallTimerPaused,
    hintShownByQuestion,
    eliminatedOptionsByQuestion,
    flaggedQuestions,
  ]);

  // Throttled periodic backup of elapsed timer every 10s (prevents disk IO locks every second)
  useEffect(() => {
    if (!session || isOverallTimerPaused) return;
    const timer = setInterval(() => {
      saveMockExamSession({
        ...session,
        currentQuestionIndex: currentIndex,
        answers,
        hintsUsed,
        elapsedSeconds: elapsedSecondsRef.current,
        isPaused: isOverallTimerPaused,
        hintShownByQuestion,
        eliminatedOptionsByQuestion,
        flaggedQuestions,
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [session, currentIndex, answers, hintsUsed, isOverallTimerPaused, hintShownByQuestion, eliminatedOptionsByQuestion, flaggedQuestions]);

  const moveToQuestion = useCallback(
    (nextIndex: number) => {
      const boundedIndex = Math.max(0, Math.min(totalQuestions - 1, nextIndex));
      setCurrentIndex(boundedIndex);
      setQuestionElapsedSeconds(0);
      setIsNavigatorOpen(false);
    },
    [totalQuestions],
  );

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      moveToQuestion(currentIndex + 1);
    }
  }, [currentIndex, totalQuestions, moveToQuestion]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      moveToQuestion(currentIndex - 1);
    }
  }, [currentIndex, moveToQuestion]);

  const handleSelectAnswer = useCallback(
    (optionKey: string) => {
      if (!currentQuestion) {
        return;
      }

      const eliminated = eliminatedOptionsByQuestion[currentQuestion.id] ?? [];
      if (eliminated.includes(optionKey)) {
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
    },
    [currentQuestion, eliminatedOptionsByQuestion, session?.settings.instantAnswers],
  );

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) {
      return;
    }
    setFlaggedQuestions((current) => ({
      ...current,
      [currentQuestion.id]: !current[currentQuestion.id],
    }));
  }, [currentQuestion]);

  const handleUseHint = useCallback(() => {
    if (!currentQuestion) {
      return;
    }
    if (hintShownByQuestion[currentQuestion.id]) {
      return;
    }

    const answerLetterKeys = ["A", "B", "C", "D"] as const;
    const currentAnswer = answers[currentQuestion.id];

    const removableOptionKeys = answerLetterKeys.filter((letter) => {
      const option = currentQuestion.options.find((choice) => choice.key === letter);
      const hasChoiceContent = Boolean(option && (option.text || option.imagePath));
      const isCorrectOption = letter === currentQuestion.correctOption;
      const isCurrentlySelected = currentAnswer === letter;

      return hasChoiceContent && !isCorrectOption && !isCurrentlySelected;
    });

    const shuffled = [...removableOptionKeys].sort(() => Math.random() - 0.5);
    const eliminatedKeys = shuffled.slice(0, 2);

    setEliminatedOptionsByQuestion((current) => ({
      ...current,
      [currentQuestion.id]: eliminatedKeys,
    }));
    setHintsUsed((count) => count + 1);
    setHintShownByQuestion((current) => ({
      ...current,
      [currentQuestion.id]: true,
    }));
  }, [currentQuestion, hintShownByQuestion, answers]);

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
    setIsQuestionTimerPaused((current) => {
      const next = !current;
      if (current && !isQuestionTimerVisible) {
        setIsQuestionTimerVisible(true);
      }
      return next;
    });
  };

  const handleToggleQuestionTimerVisibility = () => {
    setIsQuestionTimerVisible((current) => {
      const next = !current;
      if (!next) {
        setIsQuestionTimerPaused(true);
      }
      return next;
    });
  };

  const handleToggleOverallTimerPause = useCallback(() => {
    setIsOverallTimerPaused((current) => !current);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (zoomedImageUrl) {
          setZoomedImageUrl(null);
          return;
        }
        if (isShortcutModalOpen) {
          setIsShortcutModalOpen(false);
          return;
        }
        if (isSubmitModalOpen) {
          setIsSubmitModalOpen(false);
          return;
        }
        if (isNavigatorOpen) {
          setIsNavigatorOpen(false);
          return;
        }
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutModalOpen((prev) => !prev);
        return;
      }

      if (isSubmitModalOpen || isShortcutModalOpen || zoomedImageUrl) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === "P") {
        e.preventDefault();
        handleToggleOverallTimerPause();
        return;
      }

      if (isOverallTimerPaused) {
        return;
      }

      if (key === "A" || key === "1") {
        e.preventDefault();
        handleSelectAnswer("A");
      } else if (key === "B" || key === "2") {
        e.preventDefault();
        handleSelectAnswer("B");
      } else if (key === "C" || key === "3") {
        e.preventDefault();
        handleSelectAnswer("C");
      } else if (key === "D" || key === "4") {
        e.preventDefault();
        handleSelectAnswer("D");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePreviousQuestion();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextQuestion();
      } else if (key === "F") {
        e.preventDefault();
        handleToggleFlag();
      } else if (key === "S") {
        e.preventDefault();
        handleToggleBookmark();
      } else if (key === "H") {
        e.preventDefault();
        handleUseHint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    zoomedImageUrl,
    isSubmitModalOpen,
    isShortcutModalOpen,
    isNavigatorOpen,
    isOverallTimerPaused,
    handleSelectAnswer,
    handlePreviousQuestion,
    handleNextQuestion,
    handleToggleFlag,
    handleToggleBookmark,
    handleUseHint,
    handleToggleOverallTimerPause,
  ]);

  if (!session || !currentQuestion) {
    return (
      <Layout className="py-10 md:py-0 gap-6 md:gap-10 select-none">
        <div className="flex-1 w-full flex items-center justify-center px-6 md:px-20 min-h-[60vh]">
          <div className="card-brut p-8 md:p-10 w-full max-w-xl flex flex-col items-center gap-6 text-center">
            <SmileySadIcon className="h-16 w-auto text-zinc-700 dark:text-zinc-300" weight="bold" />
            <h1 className="text-3xl md:text-4xl font-bold">No active mock exam found</h1>
            <p className="text-sm md:text-base opacity-75">
              Start from the prep page so we can build an exam tailored to your selected settings.
            </p>
            <button
              type="button"
              onClick={() => navigate("/mockexamprep")}
              className="btn-solid px-6 py-3"
            >
              GO TO MOCK EXAM PREP
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const examTimerDisplay = isTimed
    ? formatClockFromSeconds(remainingSeconds, true)
    : formatClockFromSeconds(elapsedSeconds, true);

  const instantRevealEnabled = session.settings.instantAnswers && Boolean(selectedAnswer);
  const answerLockedForCurrentQuestion = session.settings.instantAnswers && Boolean(selectedAnswer);
  const selectedAnswerIsCorrect = selectedAnswer === currentQuestion.correctOption;
  const currentAnswerExplanation = currentQuestion.answerExplanation?.trim() ?? "";
  const canShowExplanationButton = instantRevealEnabled && Boolean(currentAnswerExplanation);
  const explanationVisible = Boolean(showExplanationByQuestion[currentQuestion.id]) && canShowExplanationButton;
  const hintVisible = Boolean(hintShownByQuestion[currentQuestion.id]);
  const isFlagged = Boolean(flaggedQuestions[currentQuestion.id]);

  const answerLetterKeys = ["A", "B", "C", "D"] as const;
  const optionByKey = useMemo(
    () =>
      new Map<string, MockExamOption>(
        currentQuestion.options.map((option) => [option.key, option]),
      ),
    [currentQuestion.options],
  );
  const eliminatedOptionSet = useMemo(
    () => new Set(eliminatedOptionsByQuestion[currentQuestion.id] ?? []),
    [eliminatedOptionsByQuestion, currentQuestion.id],
  );

  const renderedQuestionStem = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={mathGfmPlugins}
      rehypePlugins={katexPlugins}
    >
      {normalizeMathDelimiters(normalizeLegacySymbols(currentQuestion.questionText))}
    </ReactMarkdown>
  ), [currentQuestion.questionText]);

  const renderedChoiceTexts = useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    answerLetterKeys.forEach((letter) => {
      const choice = optionByKey.get(letter);
      if (choice?.text) {
        map[letter] = (
          <ReactMarkdown
            remarkPlugins={mathGfmPlugins}
            rehypePlugins={katexPlugins}
          >
            {normalizeMathDelimiters(normalizeLegacySymbols(choice.text))}
          </ReactMarkdown>
        );
      }
    });
    return map;
  }, [optionByKey]);

  const resolvedQuestionImageUrl = resolveImageUrl(currentQuestion.questionImagePath);
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <Layout className="p-0 min-h-screen dark:text-zinc-100 flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top Edge Progress Bar */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b-2 border-zinc-950 dark:border-zinc-100">
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800">
          <div
            style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
            className="h-full bg-blue-600 dark:bg-blue-500 transition-[width] duration-300"
          />
        </div>

        {/* Sticky Top Exam HUD */}
        <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 md:gap-4">
          {/* Left HUD: Counters & Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="badge-brut bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono">
              {session.settings.examType}
            </span>
            <div className="badge-brut border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 font-mono font-bold">
              Q {String(currentIndex + 1).padStart(2, "0")} / {totalQuestions}
            </div>
            <span className="badge-brut hidden md:inline-flex bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 truncate max-w-xs">
              {currentQuestion.subjectCategory}
            </span>
          </div>

          {/* Center HUD: Per-question stopwatch & Overall countdown */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Per-question stopwatch */}
            <div className="hidden lg:flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 bg-white dark:bg-zinc-900 text-xs font-mono">
              <ClockIcon className="h-4 w-4 opacity-70" weight="bold" />
              <span className="w-12 text-center font-bold">
                {isQuestionTimerVisible ? formatClockFromSeconds(questionElapsedSeconds, false) : "••:••"}
              </span>
              <button
                type="button"
                onClick={handleToggleQuestionTimerVisibility}
                className="hover:opacity-70 cursor-pointer p-0.5"
                title={isQuestionTimerVisible ? "Hide stopwatch" : "Show stopwatch"}
                aria-label={isQuestionTimerVisible ? "Hide question stopwatch" : "Show question stopwatch"}
              >
                {isQuestionTimerVisible ? (
                  <EyeSlashIcon className="h-3.5 w-3.5" weight="bold" />
                ) : (
                  <EyeIcon className="h-3.5 w-3.5" weight="bold" />
                )}
              </button>
              <button
                type="button"
                onClick={handleToggleQuestionTimerPause}
                className="hover:opacity-70 cursor-pointer p-0.5"
                title={isQuestionTimerPaused ? "Resume stopwatch" : "Pause stopwatch"}
                aria-label={isQuestionTimerPaused ? "Resume question stopwatch" : "Pause question stopwatch"}
              >
                {isQuestionTimerPaused ? (
                  <PlayCircleIcon className="h-3.5 w-3.5 text-amber-500" weight="bold" />
                ) : (
                  <PauseCircleIcon className="h-3.5 w-3.5" weight="bold" />
                )}
              </button>
            </div>

            {/* Overall Exam Countdown */}
            <div className="flex items-center gap-2">
              <div
                className={`font-mono text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${
                  isTimeCritical
                    ? "text-red-600 dark:text-red-400 animate-pulse font-black"
                    : "text-zinc-950 dark:text-zinc-50"
                }`}
                title={isTimed ? "Remaining Time" : "Elapsed Time"}
              >
                {examTimerDisplay}
              </div>
              <button
                type="button"
                onClick={handleToggleOverallTimerPause}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                title={isOverallTimerPaused ? "Resume exam timer (P)" : "Pause exam timer (P)"}
                aria-label={isOverallTimerPaused ? "Resume overall exam timer" : "Pause overall exam timer"}
              >
                {isOverallTimerPaused ? (
                  <PlayCircleIcon className="h-6 sm:h-7 w-auto text-emerald-600 dark:text-emerald-400" weight="bold" />
                ) : (
                  <PauseCircleIcon className="h-6 sm:h-7 w-auto text-zinc-950 dark:text-zinc-100" weight="bold" />
                )}
              </button>
            </div>
          </div>

          {/* Right HUD: Controls & Submit */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Flag for Review Toggle */}
            <button
              type="button"
              onClick={handleToggleFlag}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-mono font-bold uppercase transition duration-150 cursor-pointer border ${
                isFlagged
                  ? "border-amber-500 bg-amber-400 text-zinc-950 dark:bg-amber-400 dark:text-zinc-950 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]"
                  : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200"
              }`}
              title="Flag for review [F]"
              aria-label="Flag question for review"
            >
              <FlagIcon className="h-3.5 w-3.5" weight={isFlagged ? "fill" : "bold"} />
              <span className="hidden sm:inline">{isFlagged ? "FLAGGED" : "FLAG"}</span>
              <span className="hidden lg:inline text-[10px] opacity-60">[F]</span>
            </button>

            {/* Bookmark / Star Question */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-mono font-bold uppercase transition duration-150 cursor-pointer border ${
                isBookmarked
                  ? "border-amber-500 bg-amber-400 text-zinc-950 dark:bg-amber-400 dark:text-zinc-950 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]"
                  : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200"
              }`}
              title="Bookmark to Weak Spots deck [S]"
              aria-label="Bookmark question"
            >
              <BookmarkSimpleIcon className="h-3.5 w-3.5" weight={isBookmarked ? "fill" : "bold"} />
              <span className="hidden sm:inline">{isBookmarked ? "SAVED" : "STAR"}</span>
              <span className="hidden lg:inline text-[10px] opacity-60">[S]</span>
            </button>

            {/* Hint Button */}
            <button
              type="button"
              onClick={handleUseHint}
              disabled={hintVisible}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-mono font-bold uppercase transition duration-150 cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Use 50/50 hint [H]"
              aria-label="Eliminate up to two incorrect options"
            >
              <LightbulbIcon className="h-3.5 w-3.5" weight={hintVisible ? "fill" : "bold"} />
              <span className="hidden sm:inline">HINT</span>
              <span className="hidden lg:inline text-[10px] opacity-60">[H]</span>
            </button>

            {/* Question Matrix Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsNavigatorOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-mono font-bold uppercase transition duration-150 cursor-pointer border ${
                isNavigatorOpen
                  ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-zinc-950"
                  : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200"
              }`}
              title="Open question matrix"
              aria-label="Toggle question navigator matrix"
            >
              <SquaresFourIcon className="h-3.5 w-3.5" weight="bold" />
              <span className="hidden sm:inline">MATRIX</span>
            </button>

            {/* Keyboard Shortcuts Help */}
            <button
              type="button"
              onClick={() => setIsShortcutModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-bold uppercase border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200 cursor-pointer"
              title="Keyboard shortcuts [?]"
              aria-label="View keyboard shortcuts"
            >
              <QuestionIcon className="h-3.5 w-3.5" weight="bold" />
              <span>[?]</span>
            </button>

            {/* Zen / Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden lg:inline-flex items-center p-1 text-xs font-mono border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200 cursor-pointer"
              title="Toggle Fullscreen Zen Mode"
              aria-label="Toggle Fullscreen"
            >
              <ArrowsOutIcon className="h-3.5 w-3.5" weight="bold" />
            </button>

            {/* Submit Exam Button */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="border-2 border-zinc-950 dark:border-zinc-100 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2.5 sm:px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-500 hover:text-white dark:hover:text-white hover:border-red-600 transition-colors cursor-pointer"
            >
              FINISH
            </button>
          </div>
        </div>

        {/* Paused State Banner */}
        {isOverallTimerPaused ? (
          <div className="bg-amber-400 text-zinc-950 border-t border-zinc-950 px-4 py-2 flex items-center justify-between font-mono text-xs md:text-sm font-bold">
            <div className="flex items-center gap-2">
              <PauseCircleIcon className="h-5 w-5 shrink-0" weight="bold" />
              <span>EXAM PAUSED — Timers and question progress are paused.</span>
            </div>
            <button
              type="button"
              onClick={handleToggleOverallTimerPause}
              className="px-3 py-1 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors uppercase text-xs font-bold shrink-0 cursor-pointer"
            >
              RESUME (P)
            </button>
          </div>
        ) : null}
      </div>

      {/* Question Navigator Drawer / Popover */}
      {isNavigatorOpen ? (
        <div className="border-b-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 p-4 sm:p-6 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                  Question Navigator Matrix
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-zinc-950 dark:bg-zinc-100 inline-block" />
                    Answered: <strong>{answeredCount}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 border border-amber-500 bg-amber-200 dark:bg-amber-800 inline-block" />
                    Flagged: <strong>{flaggedCount}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 opacity-70">
                    <span className="w-2.5 h-2.5 border border-zinc-300 dark:border-zinc-700 inline-block" />
                    Unanswered: <strong>{unansweredCount}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNavigatorOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                aria-label="Close question matrix"
              >
                <XIcon className="h-5 w-5" weight="bold" />
              </button>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 sm:gap-2 max-h-60 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                const isQFlagged = Boolean(flaggedQuestions[q.id]);

                let statusClass = "border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900";
                if (isCurrent) {
                  statusClass = "ring-2 ring-blue-500 border-2 border-blue-600 bg-blue-100 dark:bg-blue-950/70 text-blue-950 dark:text-blue-200 font-extrabold";
                } else if (isQFlagged) {
                  statusClass = "border-2 border-amber-500 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold";
                } else if (isAnswered) {
                  statusClass = "border border-zinc-950 dark:border-zinc-200 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => moveToQuestion(idx)}
                    className={`h-9 flex items-center justify-center font-mono text-xs transition-transform hover:scale-105 cursor-pointer relative ${statusClass}`}
                  >
                    {idx + 1}
                    {isQFlagged && !isCurrent ? (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Unified Question Body */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
        {/* Unified Question Card */}
        <div className="card-brut p-5 sm:p-7 md:p-9 flex flex-col gap-6">
          {/* Question Header & Meta Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Item #{currentQuestion.questionNumber}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="badge-brut text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800">
                Year: {currentQuestion.sourceYear}
              </span>
              <span className="badge-brut text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800">
                {currentQuestion.subjectCategory}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isFlagged ? (
                <span className="badge-brut border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 font-bold text-[11px]">
                  FLAGGED
                </span>
              ) : null}
              <span className="font-mono text-xs uppercase opacity-70">
                Topic: <strong>{currentQuestion.subjectTopic}</strong>
              </span>
            </div>
          </div>

          {/* Question Stem */}
          <div className="text-zinc-900 dark:text-zinc-100 text-base md:text-lg leading-relaxed prose prose-zinc dark:prose-invert max-w-none prose-p:my-2">
            {renderedQuestionStem}
          </div>

          {/* Markdown Table if present */}
          {currentQuestion.tableText ? (
            <div className="question-table-wrap border-2 border-zinc-950/20 dark:border-zinc-200/20 bg-zinc-50 dark:bg-zinc-900/50 p-3 sm:p-4 my-1">
              <div className="text-xs sm:text-sm">
                <ReactMarkdown remarkPlugins={gfmPlugins}>
                  {currentQuestion.tableText}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}

          {/* Question Diagram / Image if present */}
          {resolvedQuestionImageUrl ? (
            <div className="flex flex-col gap-2 my-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-70">
                  Question Diagram
                </span>
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                  Click image to expand
                </span>
              </div>
              <div
                className="group relative border-2 border-zinc-950/25 dark:border-zinc-200/25 bg-white dark:bg-zinc-900 p-3 flex flex-col items-center justify-center cursor-zoom-in transition hover:border-zinc-950 dark:hover:border-zinc-200"
                onClick={() => setZoomedImageUrl(resolvedQuestionImageUrl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setZoomedImageUrl(resolvedQuestionImageUrl);
                  }
                }}
              >
                <img
                  src={resolvedQuestionImageUrl}
                  alt="Question illustration"
                  className="max-h-72 w-auto object-contain block mx-auto py-2"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2 py-1 text-xs font-mono font-bold flex items-center gap-1 shadow-md">
                  <ArrowsOutIcon className="h-3.5 w-3.5" weight="bold" />
                  <span>ZOOM</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Hint Active Notice */}
          {hintVisible ? (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 text-xs md:text-sm font-mono flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <LightbulbIcon className="h-4 w-4 shrink-0" weight="fill" />
              <span>Hint active: {eliminatedOptionSet.size} wrong option(s) eliminated.</span>
            </div>
          ) : null}

          {/* Unified Interactive Choice Cards (A, B, C, D) */}
          <div className="flex flex-col gap-3 pt-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Select Your Answer:
            </span>

            {answerLetterKeys.map((letter) => {
              const choice = optionByKey.get(letter);
              const hasChoiceContent = Boolean(choice && (choice.text || choice.imagePath));
              const isSelected = selectedAnswer === letter;
              const isEliminated = eliminatedOptionSet.has(letter);
              const isDisabled = !hasChoiceContent || answerLockedForCurrentQuestion || isEliminated;
              const choiceImageUrl = choice?.imagePath ? resolveImageUrl(choice.imagePath) : null;
              const isCorrectOption = letter === currentQuestion.correctOption;

              // Compute Card Styling based on state
              let cardClasses = "border-2 transition duration-150 p-3.5 sm:p-4 text-left flex items-start gap-3 sm:gap-4 ";

              if (!hasChoiceContent) {
                cardClasses += "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 opacity-40 cursor-not-allowed";
              } else if (isEliminated) {
                cardClasses += "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 opacity-35 line-through cursor-not-allowed";
              } else if (instantRevealEnabled) {
                if (isCorrectOption) {
                  cardClasses += "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] cursor-default";
                } else if (isSelected) {
                  cardClasses += "border-red-600 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-100 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] cursor-default";
                } else {
                  cardClasses += "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-50 cursor-default";
                }
              } else if (isSelected) {
                cardClasses += "border-zinc-950 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(244,244,245,1)] translate-x-[-1px] translate-y-[-1px] cursor-pointer";
              } else {
                cardClasses += "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-950 dark:hover:border-zinc-200 hover:shadow-[2px_2px_0px_0px_rgba(9,9,11,0.5)] cursor-pointer";
              }

              // Letter badge styling
              let badgeClasses = "w-8 h-8 shrink-0 flex items-center justify-center font-mono font-bold text-sm border-2 ";
              if (instantRevealEnabled && isCorrectOption) {
                badgeClasses += "border-emerald-600 bg-emerald-600 text-white";
              } else if (instantRevealEnabled && isSelected && !isCorrectOption) {
                badgeClasses += "border-red-600 bg-red-600 text-white";
              } else if (isSelected) {
                badgeClasses += "border-zinc-950 dark:border-zinc-100 bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950";
              } else {
                badgeClasses += "border-zinc-400 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200";
              }

              return (
                <button
                  key={`${currentQuestion.id}-${letter}`}
                  type="button"
                  onClick={() => handleSelectAnswer(letter)}
                  disabled={isDisabled}
                  className={cardClasses}
                >
                  <span className={badgeClasses}>{letter}</span>

                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    {choice?.text ? (
                      <div className="text-sm sm:text-base leading-relaxed prose prose-zinc dark:prose-invert max-w-none prose-p:my-0">
                        {renderedChoiceTexts[letter]}
                      </div>
                    ) : (
                      <span className="text-xs font-mono opacity-50 italic">
                        {isEliminated ? "Option eliminated" : "Diagram only"}
                      </span>
                    )}

                    {choiceImageUrl ? (
                      <div className="border border-zinc-200 dark:border-zinc-800 p-2 bg-zinc-50 dark:bg-zinc-900 inline-block max-w-xs mt-1">
                        <img
                          src={choiceImageUrl}
                          alt={`Visual option ${letter}`}
                          className="max-h-36 w-auto object-contain cursor-zoom-in"
                          loading="lazy"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedImageUrl(choiceImageUrl);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Status Indicator Icon */}
                  {instantRevealEnabled ? (
                    <div className="shrink-0 self-center">
                      {isCorrectOption ? (
                        <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" weight="fill" />
                      ) : isSelected ? (
                        <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" weight="fill" />
                      ) : null}
                    </div>
                  ) : isSelected ? (
                    <div className="shrink-0 self-center w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-zinc-100" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Instant Answer Semantic Status Banner */}
          {instantRevealEnabled ? (
            <div className="flex flex-col gap-3 mt-2">
              {selectedAnswerIsCorrect ? (
                <div className="border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-4 flex items-center gap-3 text-emerald-950 dark:text-emerald-100 font-mono font-bold text-sm">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-600 shrink-0" weight="fill" />
                  <div>CORRECT ANSWER! Well done.</div>
                </div>
              ) : (
                <div className="border-2 border-red-600 bg-red-50 dark:bg-red-950/40 p-4 flex items-center gap-3 text-red-950 dark:text-red-100 font-mono font-bold text-sm">
                  <XCircleIcon className="h-6 w-6 text-red-600 shrink-0" weight="fill" />
                  <div>
                    INCORRECT — The correct answer is Option {currentQuestion.correctOption}.
                  </div>
                </div>
              )}

              {/* Instant Explanation Panel */}
              {canShowExplanationButton ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleToggleExplanation}
                    className="btn-outline py-2 px-4 text-xs font-mono font-bold uppercase tracking-wider self-start"
                  >
                    {explanationVisible ? "HIDE EXPLANATION" : "SHOW EXPLANATION"}
                  </button>

                  {explanationVisible ? (
                    <div className="border-2 border-zinc-950 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-4 sm:p-5 flex flex-col gap-2 animate-in fade-in duration-200">
                      <p className="font-mono text-xs font-bold uppercase tracking-wider opacity-75">
                        Step-by-Step Solution
                      </p>
                      <div className="text-sm sm:text-base leading-relaxed prose prose-zinc dark:prose-invert max-w-none prose-p:my-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={katexPlugins}
                        >
                          {normalizeMathDelimiters(normalizeLegacySymbols(currentAnswerExplanation))}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handlePreviousQuestion}
            disabled={currentIndex === 0}
            className="btn-outline px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <CaretLeftIcon className="h-4 w-4" weight="bold" />
            <span>PREVIOUS</span>
          </button>

          <div className="flex items-center gap-2">
            {isLastQuestion ? (
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="btn-solid bg-red-600 border-red-600 hover:bg-red-700 text-white px-5 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm uppercase font-mono tracking-wider"
              >
                FINISH & SUBMIT EXAM
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={currentIndex === totalQuestions - 1}
                className="btn-solid px-5 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2 text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>NEXT QUESTION</span>
                <CaretRightIcon className="h-4 w-4" weight="bold" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Desktop Keyboard Shortcut Legend Bar */}
      <footer className="hidden md:flex items-center justify-center gap-4 lg:gap-6 py-2.5 px-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono opacity-70 flex-wrap">
        <span>[A/B/C/D] Select Option</span>
        <span>•</span>
        <span>[← / →] Navigate</span>
        <span>•</span>
        <span>[F] Flag</span>
        <span>•</span>
        <span>[S] Star / Bookmark</span>
        <span>•</span>
        <span>[H] Hint</span>
        <span>•</span>
        <span>[P] Pause</span>
        <span>•</span>
        <button
          type="button"
          onClick={() => setIsShortcutModalOpen(true)}
          className="underline hover:opacity-100 cursor-pointer"
        >
          [?] All Shortcuts
        </button>
      </footer>

      {/* Image Zoom Modal */}
      {zoomedImageUrl ? (
        <div
          className="modal-overlay"
          onClick={() => setZoomedImageUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-70">
                Diagram Preview (Press Esc or Click Outside)
              </span>
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold cursor-pointer"
                aria-label="Close diagram preview"
              >
                <XIcon className="h-5 w-5" weight="bold" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2">
              <img
                src={zoomedImageUrl}
                alt="Enlarged diagram"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen ? (
        <div
          className="modal-overlay"
          onClick={() => setIsSubmitModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-panel flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-950 dark:border-zinc-100">
              <h2 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-tight">
                Submit Exam Confirmation
              </h2>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                aria-label="Close submit confirmation dialog"
              >
                <XIcon className="h-5 w-5" weight="bold" />
              </button>
            </div>

            {/* Submission Telemetry Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-zinc-300 dark:border-zinc-700 p-3 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center text-center">
                <span className="text-xs font-mono opacity-70">ANSWERED</span>
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </span>
                <span className="text-[10px] font-mono opacity-50">/ {totalQuestions}</span>
              </div>

              <div
                className={`border p-3 flex flex-col items-center text-center ${
                  unansweredCount > 0
                    ? "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200"
                    : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                }`}
              >
                <span className="text-xs font-mono opacity-70">UNANSWERED</span>
                <span
                  className={`text-2xl font-bold font-mono ${
                    unansweredCount > 0 ? "text-red-600 dark:text-red-400" : ""
                  }`}
                >
                  {unansweredCount}
                </span>
                <span className="text-[10px] font-mono opacity-50">/ {totalQuestions}</span>
              </div>

              <div className="border border-zinc-300 dark:border-zinc-700 p-3 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center text-center">
                <span className="text-xs font-mono opacity-70">FLAGGED</span>
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {flaggedCount}
                </span>
                <span className="text-[10px] font-mono opacity-50">for review</span>
              </div>
            </div>

            {unansweredCount > 0 ? (
              <div className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs sm:text-sm font-mono flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
                <WarningIcon className="h-5 w-5 shrink-0 text-amber-600" weight="fill" />
                <span>
                  You have <strong>{unansweredCount} unanswered questions</strong>. Once submitted, your answers cannot be modified and unanswered items will count as incorrect.
                </span>
              </div>
            ) : (
              <p className="text-sm font-mono opacity-75">
                All questions have been answered. You are ready to compute your final score and review analytics!
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="btn-outline px-5 py-2.5 text-xs font-mono uppercase"
              >
                RETURN TO EXAM
              </button>
              <button
                type="button"
                onClick={() => finalizeExam()}
                className="btn-solid bg-red-600 border-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-xs font-mono uppercase tracking-wider"
              >
                CONFIRM & SUBMIT
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Keyboard Shortcuts Help Modal */}
      {isShortcutModalOpen ? (
        <div
          className="modal-overlay"
          onClick={() => setIsShortcutModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-panel max-w-lg flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-950 dark:border-zinc-100">
              <div className="flex items-center gap-2">
                <QuestionIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" weight="bold" />
                <h2 className="text-xl font-bold font-mono uppercase tracking-tight">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutModalOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                aria-label="Close shortcuts modal"
              >
                <XIcon className="h-5 w-5" weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Select Options</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">A, B, C, D</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Numeric Select</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">1, 2, 3, 4</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Next Question</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">→</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Previous Question</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">←</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Flag for Review</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">F</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Star / Bookmark</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">S</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Use 50/50 Hint</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">H</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Pause / Resume</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">P</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Dismiss Modals</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">Esc</span>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="opacity-70">Shortcuts Help</span>
                <span className="font-bold border border-zinc-400 px-1.5 py-0.5 bg-white dark:bg-zinc-900">?</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsShortcutModalOpen(false)}
                className="btn-solid px-5 py-2 text-xs font-mono uppercase"
              >
                GOT IT [Esc]
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
