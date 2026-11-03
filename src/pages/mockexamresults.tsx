import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import { MOCK_EXAM_IMAGE_BASE_PATH } from "../config/constants";
import { normalizeLegacySymbols, normalizeMathDelimiters } from "../lib/textFormat";
import { trackEvent } from "../lib/analytics";
import {
  ArrowClockwiseIcon,
  ArrowsOutIcon,
  ArrowSquareOutIcon,
  BookmarkSimpleIcon,
  CaretDownIcon,
  CheckCircleIcon,
  LightbulbIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  bookmarkMultipleQuestions,
  formatClockFromSeconds,
  isQuestionBookmarked,
  loadMockExamResult,
  saveExamHistoryEntry,
  saveMockExamSession,
  toggleQuestionBookmark,
  type WrongQuestionReview,
} from "../exam/mockExamModel";
import { buildMockExamSession, resolveVaultImageUrl } from "../exam/mockExamQuestionBank";
import "katex/dist/katex.min.css";

// Disable KaTeX warning console spam for snappy performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KATEX_REHYPE_PLUGINS: any[] = [[rehypeKatex, { strict: false, throwOnError: false }]];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REMARK_MATH_GFM_PLUGINS: any[] = [remarkGfm, remarkMath];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REMARK_GFM_PLUGINS: any[] = [remarkGfm];

const PASSING_PERCENTAGE = 60;

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

interface WrongQuestionReviewItemProps {
  wrongQuestion: WrongQuestionReview;
  index: number;
  isOpen: boolean;
  isBookmarked: boolean;
  onToggleOpen: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onZoomImage: (url: string) => void;
}

const WrongQuestionReviewItem = React.memo(function WrongQuestionReviewItem({
  wrongQuestion,
  index,
  isOpen,
  isBookmarked,
  onToggleOpen,
  onToggleBookmark,
  onZoomImage,
}: WrongQuestionReviewItemProps) {
  const resolvedImgUrl = resolveImageUrl(wrongQuestion.questionImagePath);

  const renderedPreviewStem = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={REMARK_MATH_GFM_PLUGINS}
        rehypePlugins={KATEX_REHYPE_PLUGINS}
      >
        {normalizeMathDelimiters(normalizeLegacySymbols(wrongQuestion.questionText))}
      </ReactMarkdown>
    ),
    [wrongQuestion.questionText],
  );

  return (
    <article className="card-brut overflow-hidden flex flex-col">
      {/* Accordion Trigger Header */}
      <button
        type="button"
        onClick={() => onToggleOpen(wrongQuestion.id)}
        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-2 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="badge-brut bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 border-red-500 font-bold">
              MISSED #{index + 1}
            </span>
            <span className="badge-brut bg-zinc-100 dark:bg-zinc-800">
              Item #{wrongQuestion.questionNumber}
            </span>
            <span className="badge-brut bg-zinc-100 dark:bg-zinc-800">
              {wrongQuestion.sourceYear}
            </span>
            {wrongQuestion.subjectCategory ? (
              <span className="badge-brut hidden sm:inline-flex bg-zinc-100 dark:bg-zinc-800">
                {wrongQuestion.subjectCategory}
              </span>
            ) : null}
            <span className="opacity-70 truncate max-w-xs">
              {wrongQuestion.subjectTopic}
            </span>

            {/* Individual Star / Bookmark Button */}
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(wrongQuestion.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  onToggleBookmark(wrongQuestion.id);
                }
              }}
              className={`badge-brut cursor-pointer transition-colors ${
                isBookmarked
                  ? "bg-amber-400 text-zinc-950 border-zinc-950 font-bold"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-950"
              }`}
              title={isBookmarked ? "Starred in Weak Spots" : "Star question"}
            >
              <BookmarkSimpleIcon className="h-3 w-3" weight={isBookmarked ? "fill" : "bold"} />
              <span>{isBookmarked ? "STARRED" : "STAR"}</span>
            </span>
          </div>

          {/* Preview Question Stem */}
          <div className="text-sm md:text-base leading-relaxed prose prose-zinc dark:prose-invert max-w-none line-clamp-2 prose-p:my-0">
            {renderedPreviewStem}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 pt-1">
          <CaretDownIcon
            className={`h-5 w-5 opacity-70 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            weight="bold"
          />
        </div>
      </button>

      {/* Expanded Question Review Panel */}
      {isOpen ? (
        <div className="border-t-2 border-zinc-950/15 dark:border-zinc-200/15 overflow-hidden">
          <div className="p-4 sm:p-6 flex flex-col gap-5 bg-zinc-50/50 dark:bg-zinc-900/50">
            {/* Full Question Text */}
            <div className="text-sm md:text-base leading-relaxed prose prose-zinc dark:prose-invert max-w-none prose-p:my-1">
              {renderedPreviewStem}
            </div>

            {/* Question Markdown Table */}
            {wrongQuestion.tableText ? (
              <div className="question-table-wrap border-2 border-zinc-950/20 dark:border-zinc-200/20 bg-white dark:bg-zinc-900 p-3 sm:p-4">
                <div className="text-xs sm:text-sm">
                  <ReactMarkdown remarkPlugins={REMARK_GFM_PLUGINS}>
                    {wrongQuestion.tableText}
                  </ReactMarkdown>
                </div>
              </div>
            ) : null}

            {/* Question Diagram Image */}
            {resolvedImgUrl ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-70">
                  Question Diagram
                </span>
                <div
                  className="group relative border-2 border-zinc-950/20 dark:border-zinc-200/20 bg-white dark:bg-zinc-900 p-3 flex flex-col items-center cursor-zoom-in self-start"
                  onClick={() => onZoomImage(resolvedImgUrl)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onZoomImage(resolvedImgUrl);
                    }
                  }}
                >
                  <img
                    src={resolvedImgUrl}
                    alt={`Diagram for item #${wrongQuestion.questionNumber}`}
                    className="max-h-60 w-auto object-contain block py-2"
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

            {/* Answer Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Selection */}
              <div className="border-2 border-red-500 bg-red-50/80 dark:bg-red-950/30 p-3.5 sm:p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-900 dark:text-red-300 font-mono text-xs font-bold uppercase tracking-wide">
                  <XCircleIcon className="h-4 w-4 shrink-0" weight="fill" />
                  <span>YOUR ANSWER</span>
                </div>
                <div className="text-sm md:text-base font-mono text-red-950 dark:text-red-100 prose prose-zinc dark:prose-invert max-w-none prose-p:my-0">
                  {wrongQuestion.selectedOption ? (
                    <ReactMarkdown
                      remarkPlugins={REMARK_MATH_GFM_PLUGINS}
                      rehypePlugins={KATEX_REHYPE_PLUGINS}
                    >
                      {normalizeMathDelimiters(
                        normalizeLegacySymbols(
                          `**Option ${wrongQuestion.selectedOption}**${
                            wrongQuestion.selectedOptionText
                              ? ` — ${wrongQuestion.selectedOptionText}`
                              : ""
                          }`,
                        ),
                      )}
                    </ReactMarkdown>
                  ) : (
                    <span className="italic opacity-70">
                      No answer selected (Question skipped)
                    </span>
                  )}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 sm:p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wide">
                  <CheckCircleIcon className="h-4 w-4 shrink-0" weight="fill" />
                  <span>CORRECT ANSWER</span>
                </div>
                <div className="text-sm md:text-base font-mono text-emerald-950 dark:text-emerald-100 prose prose-zinc dark:prose-invert max-w-none prose-p:my-0">
                  <ReactMarkdown
                    remarkPlugins={REMARK_MATH_GFM_PLUGINS}
                    rehypePlugins={KATEX_REHYPE_PLUGINS}
                  >
                    {normalizeMathDelimiters(
                      normalizeLegacySymbols(
                        `**Option ${wrongQuestion.correctOption}**${
                          wrongQuestion.correctOptionText
                            ? ` — ${wrongQuestion.correctOptionText}`
                            : ""
                        }`,
                      ),
                    )}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Step-by-Step Explanation Card */}
            <div className="border-2 border-zinc-950/20 dark:border-zinc-200/20 bg-white dark:bg-zinc-900 p-4 sm:p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                <LightbulbIcon className="h-4 w-4" weight="bold" />
                <span>Step-by-Step Solution & Explanation</span>
              </div>
              <div className="text-sm md:text-base leading-relaxed prose prose-zinc dark:prose-invert max-w-none prose-p:my-1">
                {wrongQuestion.answerExplanation ? (
                  <ReactMarkdown
                    remarkPlugins={REMARK_MATH_GFM_PLUGINS}
                    rehypePlugins={KATEX_REHYPE_PLUGINS}
                  >
                    {normalizeMathDelimiters(
                      normalizeLegacySymbols(wrongQuestion.answerExplanation),
                    )}
                  </ReactMarkdown>
                ) : (
                  <p className="opacity-60 italic text-xs font-mono">
                    No detailed markdown explanation available in the source archive for this question item.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
});

function BackToTopButton() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0
          ? Math.round((scrollTop / scrollableHeight) * 100)
          : 0;
      const nextShowBackToTop = scrollTop > window.innerHeight;
      const nextProgress = Math.min(100, Math.max(0, progress));

      setShowBackToTop((current) =>
        current === nextShowBackToTop ? current : nextShowBackToTop,
      );
      setScrollProgress((current) =>
        current === nextProgress ? current : nextProgress,
      );
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 transition-all duration-200 ${
        showBackToTop
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <p className="text-xs font-mono font-bold px-2 py-0.5 border border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(244,244,245,1)]">
        {scrollProgress}%
      </p>
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className="btn-solid px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider"
      >
        TOP
      </button>
    </div>
  );
}

export default function MockExamResultsPage() {
  const navigate = useNavigate();
  const [result] = useState(() => loadMockExamResult());

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openWrongQuestions, setOpenWrongQuestions] = useState<Record<string, boolean>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [allMissedSaved, setAllMissedSaved] = useState(false);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    if (result?.wrongQuestions) {
      result.wrongQuestions.forEach((q) => {
        initialMap[q.id] = isQuestionBookmarked(q.id);
      });
    }
    return initialMap;
  });
  const hasSavedHistoryRef = useRef(false);

  const totalQuestions = result?.totalQuestions ?? 0;
  const correctAnswers = result?.correctAnswers ?? 0;
  const rawScorePercentage =
    totalQuestions === 0 ? 0 : (correctAnswers / totalQuestions) * 100;
  const scorePercentage = Number(rawScorePercentage.toFixed(1));
  const didPass = rawScorePercentage >= PASSING_PERCENTAGE;

  useEffect(() => {
    if (!result) {
      return;
    }
    if (!hasSavedHistoryRef.current) {
      hasSavedHistoryRef.current = true;
      saveExamHistoryEntry({
        id: `result-${result.completedAtMs}`,
        completedAtMs: result.completedAtMs,
        examType: result.settings.examType,
        score: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        percentage: Number(((result.correctAnswers / result.totalQuestions) * 100).toFixed(1)),
        passed: (result.correctAnswers / result.totalQuestions) >= (PASSING_PERCENTAGE / 100),
        totalTimeSeconds: result.totalTimeSeconds,
        categorySummary: result.categoryBreakdown.map((c) => ({
          name: c.name,
          score: c.correct,
          total: c.total,
        })),
      });
    }

    trackEvent("results_viewed", {
      score_percentage: scorePercentage,
      total_questions: totalQuestions,
      passed: didPass,
    });
  }, [result, scorePercentage, totalQuestions, didPass]);

  const handleBookmarkAllMissed = () => {
    if (!result || result.wrongQuestions.length === 0) return;
    const ids = result.wrongQuestions.map((q) => q.id);
    bookmarkMultipleQuestions(ids);
    setAllMissedSaved(true);
    setBookmarkedMap((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  };

  const handleToggleSingleBookmark = useCallback((questionId: string) => {
    const next = toggleQuestionBookmark(questionId);
    setBookmarkedMap((prev) => ({
      ...prev,
      [questionId]: next,
    }));
  }, []);

  // Retake with same settings handler
  const handleRetakeExam = () => {
    if (!result) {
      return;
    }
    try {
      const newSession = buildMockExamSession(result.settings);
      if (newSession && newSession.questions.length > 0) {
        saveMockExamSession(newSession);
        navigate("/mockexam");
        return;
      }
    } catch {
      // Fallback to prep page if creation fails
    }
    navigate("/mockexamprep");
  };

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((current) => ({
      ...current,
      [categoryName]: !current[categoryName],
    }));
  };

  const toggleWrongQuestion = useCallback((questionId: string) => {
    setOpenWrongQuestions((current) => ({
      ...current,
      [questionId]: !current[questionId],
    }));
  }, []);

  const wrongQuestions = useMemo(() => result?.wrongQuestions ?? [], [result]);

  // Extract unique category names for filter pills
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    wrongQuestions.forEach((q) => {
      if (q.subjectCategory) {
        categories.add(q.subjectCategory);
      }
    });
    return Array.from(categories);
  }, [wrongQuestions]);

  // Filtered wrong questions based on category filter and search query
  const filteredWrongQuestions = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return wrongQuestions.filter((q) => {
      if (selectedCategoryFilter !== "ALL" && q.subjectCategory !== selectedCategoryFilter) {
        return false;
      }
      if (trimmedQuery) {
        const matchesText = q.questionText.toLowerCase().includes(trimmedQuery);
        const matchesTopic = q.subjectTopic.toLowerCase().includes(trimmedQuery);
        const matchesNumber = q.questionNumber.toLowerCase().includes(trimmedQuery);
        const matchesCategory = (q.subjectCategory ?? "").toLowerCase().includes(trimmedQuery);
        const matchesYear = (q.sourceYear ?? "").toLowerCase().includes(trimmedQuery);
        return matchesText || matchesTopic || matchesNumber || matchesCategory || matchesYear;
      }
      return true;
    });
  }, [wrongQuestions, selectedCategoryFilter, searchQuery]);

  const handleToggleExpandAll = () => {
    const areAllExpanded =
      filteredWrongQuestions.length > 0 &&
      filteredWrongQuestions.every((q) => openWrongQuestions[q.id]);

    const nextState: Record<string, boolean> = {};
    filteredWrongQuestions.forEach((q) => {
      nextState[q.id] = !areAllExpanded;
    });
    setOpenWrongQuestions((current) => ({
      ...current,
      ...nextState,
    }));
  };

  if (!result) {
    return (
      <Layout className="py-10 md:py-0 dark:text-zinc-100 gap-6 md:gap-10 select-none">
        <div className="flex-1 w-full flex items-center justify-center px-6 md:px-20 min-h-[60vh]">
          <div className="card-brut p-8 md:p-10 w-full max-w-xl flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-mono">No exam result found</h1>
            <p className="text-sm md:text-base opacity-75">
              Take a mock exam first so this analytics page can display your score, domain mastery breakdown, and wrong question review.
            </p>
            <button
              type="button"
              onClick={() => navigate("/mockexamprep")}
              className="btn-solid px-6 py-3 font-mono"
            >
              GO TO MOCK EXAM PREP
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const totalTime = formatClockFromSeconds(result.totalTimeSeconds, true);
  const averageTimePerQuestion = formatClockFromSeconds(
    result.averageTimePerQuestionSeconds,
    false,
  );
  const sourceYearsLabel =
    result.sourceYears?.length && result.sourceYears.length > 0
      ? result.sourceYears.join(", ")
      : "Unknown";

  // SVG Gauge Calculations
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <>
      <Layout className="py-6 sm:py-10 px-4 sm:px-6 md:px-10 lg:px-16 dark:text-zinc-100 flex flex-col gap-8 md:gap-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
          {/* Header Title */}
          <div className="flex flex-col gap-1 border-b-2 border-zinc-950 dark:border-zinc-100 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-mono">
                EXAM RESULTS & ANALYTICS
              </h1>
              <span className="badge-brut bg-zinc-100 dark:bg-zinc-800 font-mono text-xs">
                {result.settings.examType} · {result.totalQuestions} Questions
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono opacity-70">
              Completed on {new Date(result.completedAtMs).toLocaleDateString()} at{" "}
              {new Date(result.completedAtMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Top Section: Hero Score Card + Quick Actions & Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Hero Score Card with SVG Radial Ring */}
            <div className="lg:col-span-5 card-brut p-6 sm:p-8 flex flex-col items-center justify-between text-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-xs uppercase font-bold tracking-widest opacity-70">
                  Performance Assessment
                </span>
                <div
                  className={`badge-brut text-xs font-mono font-bold px-3 py-1 ${
                    didPass
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                      : "border-red-600 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                  }`}
                >
                  {didPass ? "PASSED · 60% BENCHMARK MET" : "NEEDS WORK · BELOW 60% THRESHOLD"}
                </div>
              </div>

              {/* Radial Progress Ring */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 160 160">
                  {/* Track ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="11"
                    className="text-zinc-200 dark:text-zinc-800"
                  />
                  {/* Progress stroke */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={didPass ? "#10b981" : "#ef4444"}
                    strokeWidth="11"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Score numbers in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-zinc-950 dark:text-zinc-50">
                    {scorePercentage}%
                  </span>
                  <span className="text-xs font-mono font-bold opacity-60 mt-0.5">
                    {correctAnswers} / {totalQuestions} Correct
                  </span>
                </div>
              </div>

              {/* Benchmark comparison caption */}
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-col gap-1 text-xs font-mono">
                <div className="flex justify-between items-center opacity-80">
                  <span>Passing Threshold</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">60.0%</strong>
                </div>
                <div className="flex justify-between items-center opacity-80">
                  <span>Your Score</span>
                  <strong className={didPass ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {scorePercentage}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Telemetry Grid & Quick Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="card-brut p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-mono font-semibold uppercase opacity-60">
                    Score
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono">
                    {correctAnswers}/{totalQuestions}
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Questions</span>
                </div>

                <div className="card-brut p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-mono font-semibold uppercase opacity-60">
                    Total Time
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono">
                    {totalTime}
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Duration</span>
                </div>

                <div className="card-brut p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-mono font-semibold uppercase opacity-60">
                    Avg / Item
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono">
                    {averageTimePerQuestion}
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Minutes:Seconds</span>
                </div>

                <div className="card-brut p-4 flex flex-col gap-1">
                  <span className="text-[11px] font-mono font-semibold uppercase opacity-60">
                    Hints Used
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono">
                    {result.hintsUsed}
                  </span>
                  <span className="text-[10px] font-mono opacity-50">Eliminations</span>
                </div>
              </div>

              {/* Exam Settings Summary Card */}
              <div className="card-brut p-4 sm:p-5 flex flex-col gap-3 text-xs sm:text-sm font-mono">
                <span className="font-bold uppercase tracking-wider text-[11px] opacity-70 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                  Exam Configuration Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 opacity-80">
                  <div>
                    <span className="opacity-60 block text-[10px]">MODE</span>
                    <strong>{result.settings.isTimed ? `Timed (${result.settings.durationMinutes}m)` : "Untimed"}</strong>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">REVEAL</span>
                    <strong>{result.settings.instantAnswers ? "Instant Mode" : "Exam Mode"}</strong>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">TOPICS</span>
                    <strong>{result.selectedTopicCount} Selected</strong>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[10px]">SOURCE YEARS</span>
                    <strong className="truncate block" title={sourceYearsLabel}>{sourceYearsLabel}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleRetakeExam}
                  className="btn-solid py-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <ArrowClockwiseIcon className="h-4 w-4" weight="bold" />
                  <span>RETAKE EXAM</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/mockexamprep")}
                  className="btn-outline py-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>NEW EXAM SETUP</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/previousexams")}
                  className="btn-outline py-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <ArrowSquareOutIcon className="h-4 w-4" weight="bold" />
                  <span>BROWSE ARCHIVE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Domain & Topic Mastery Breakdown */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-100 pb-2">
              <h2 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-wide">
                Domain & Topic Mastery Breakdown
              </h2>
              <span className="text-xs font-mono opacity-60">Click categories to inspect topics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.categoryBreakdown.map((category) => {
                const isOpen = Boolean(openCategories[category.name]);
                const catTotal = category.total;
                const catCorrect = category.correct;
                const catPct = catTotal === 0 ? 0 : Math.round((catCorrect / catTotal) * 100);

                return (
                  <div key={category.name} className="card-brut p-4 sm:p-5 flex flex-col justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between text-left cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-sm font-bold uppercase tracking-wider">
                          {category.name}
                        </span>
                        <span className="text-xs font-mono opacity-60">
                          {catCorrect} / {catTotal} items
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge-brut font-mono text-xs font-bold ${
                            catPct >= 70
                              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                              : catPct >= 50
                              ? "border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                              : "border-red-600 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {catPct}%
                        </span>
                        <CaretDownIcon
                          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                          weight="bold"
                        />
                      </div>
                    </button>

                    {/* Horizontal Progress Bar */}
                    <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 border border-zinc-950/25 dark:border-zinc-200/25">
                      <div
                        style={{ width: `${catPct}%` }}
                        className={`h-full transition-all duration-500 ${
                          catPct >= 70
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : catPct >= 50
                            ? "bg-amber-500 dark:bg-amber-400"
                            : "bg-red-500 dark:bg-red-400"
                        }`}
                      />
                    </div>

                    {/* Expandable Topic-Level Details */}
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          key={`${category.name}-topics`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800 pt-3"
                        >
                          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                            {category.topics.map((topic) => {
                              const topicPct =
                                topic.total === 0 ? 0 : Math.round((topic.correct / topic.total) * 100);

                              return (
                                <div key={topic.name} className="flex flex-col gap-1 text-xs font-mono">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate opacity-80" title={topic.name}>
                                      {topic.name}
                                    </span>
                                    <span className="shrink-0 font-bold">
                                      {topic.correct}/{topic.total} ({topicPct}%)
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                                    <div
                                      style={{ width: `${topicPct}%` }}
                                      className={`h-full ${
                                        topicPct >= 70
                                          ? "bg-emerald-600"
                                          : topicPct >= 50
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Filterable Wrong-Answer Review */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-zinc-950 dark:border-zinc-100 pb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-wide">
                  Incorrect Questions Review
                </h2>
                <span className="badge-brut font-mono text-xs">
                  {wrongQuestions.length} Missed
                </span>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                {wrongQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBookmarkAllMissed}
                    disabled={allMissedSaved}
                    className="btn-solid py-1 px-3 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 bg-amber-400 text-zinc-950 border-zinc-950 hover:bg-amber-300 disabled:opacity-50"
                  >
                    <BookmarkSimpleIcon className="h-3.5 w-3.5" weight="fill" />
                    <span>{allMissedSaved ? "SAVED TO WEAK SPOTS!" : `STAR ALL MISSED (${wrongQuestions.length})`}</span>
                  </button>
                )}

                {/* Action: Expand / Collapse All */}
                {filteredWrongQuestions.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleToggleExpandAll}
                    className="btn-outline py-1 px-3 text-xs font-mono uppercase tracking-wider"
                  >
                    {filteredWrongQuestions.every((q) => openWrongQuestions[q.id])
                      ? "COLLAPSE ALL"
                      : "EXPAND ALL"}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Filter Pills & Search Input */}
            {wrongQuestions.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter("ALL")}
                    className={`badge-brut cursor-pointer transition-colors ${
                      selectedCategoryFilter === "ALL"
                        ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200"
                    }`}
                  >
                    ALL ({wrongQuestions.length})
                  </button>

                  {availableCategories.map((cat) => {
                    const count = wrongQuestions.filter((q) => q.subjectCategory === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`badge-brut cursor-pointer transition-colors ${
                          selectedCategoryFilter === cat
                            ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold"
                            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-950 dark:hover:border-zinc-200"
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search missed items..."
                    className="form-input w-full pl-9 py-1 text-xs font-mono"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Questions List */}
            {wrongQuestions.length === 0 ? (
              <div className="card-brut p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-600 dark:border-emerald-500">
                <CheckCircleIcon className="h-12 w-12 text-emerald-600 dark:text-emerald-400" weight="fill" />
                <h3 className="text-xl font-bold font-mono uppercase text-emerald-900 dark:text-emerald-100">
                  PERFECT SCORE — 100% ACCURACY!
                </h3>
                <p className="text-xs sm:text-sm font-mono opacity-80 max-w-md">
                  You answered all questions correctly in this exam session. Excellent work!
                </p>
              </div>
            ) : filteredWrongQuestions.length === 0 ? (
              <div className="card-brut p-8 text-center flex flex-col items-center gap-2 font-mono text-xs sm:text-sm opacity-70">
                <p>No missed questions match your search or filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="btn-outline px-3 py-1 text-xs mt-2"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredWrongQuestions.map((wrongQuestion, index) => (
                  <WrongQuestionReviewItem
                    key={wrongQuestion.id}
                    wrongQuestion={wrongQuestion}
                    index={index}
                    isOpen={Boolean(openWrongQuestions[wrongQuestion.id])}
                    isBookmarked={Boolean(bookmarkedMap[wrongQuestion.id])}
                    onToggleOpen={toggleWrongQuestion}
                    onToggleBookmark={handleToggleSingleBookmark}
                    onZoomImage={setZoomedImageUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>

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

      <BackToTopButton />
    </>
  );
}
