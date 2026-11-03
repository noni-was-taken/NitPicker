import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ChevronDown,
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  Image as ImageIcon,
  ChevronsUpDown,
  ChevronsDownUp,
  RotateCcw,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Layout from "../components/Layout";
import {
  getGroupedPreviousExamQuestions,
  resolveVaultImageUrl,
  type PreviousExamQuestion,
} from "../exam/mockExamQuestionBank";
import {
  type CategoryName,
  loadBookmarkedQuestionIds,
  toggleQuestionBookmark,
} from "../exam/mockExamModel";
import { normalizeLegacySymbols, normalizeMathDelimiters } from "../lib/textFormat";
import "katex/dist/katex.min.css";

const KATEX_REHYPE_PLUGINS = [[rehypeKatex, { strict: false, throwOnError: false }]] as any;
const REMARK_MATH_GFM_PLUGINS = [remarkGfm, remarkMath] as any;
const REMARK_GFM_PLUGINS = [remarkGfm] as any;
const PAGE_SIZE = 25;

const CATEGORY_OPTIONS: Array<"ALL" | CategoryName> = [
  "ALL",
  "Technology",
  "Management",
  "Strategy",
];

const EXAM_TYPE_OPTIONS: Array<"ALL" | "AM EXAM" | "PM EXAM"> = [
  "ALL",
  "AM EXAM",
  "PM EXAM",
];

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "Technology":
      return "border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40";
    case "Management":
      return "border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40";
    case "Strategy":
      return "border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40";
    default:
      return "border-zinc-500 text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800";
  }
};

interface QuestionAccordionItemProps {
  question: PreviousExamQuestion;
  isOpen: boolean;
  isBookmarked: boolean;
  onToggleOpen: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onZoomImage: (url: string) => void;
}

const QuestionAccordionItem = React.memo(function QuestionAccordionItem({
  question,
  isOpen,
  isBookmarked,
  onToggleOpen,
  onToggleBookmark,
  onZoomImage,
}: QuestionAccordionItemProps) {
  const categoryStyle = getCategoryBadgeColor(question.subjectCategory);
  const resolvedImageUrl = question.questionImagePath
    ? resolveVaultImageUrl(question.questionImagePath) ?? question.questionImagePath
    : null;

  const renderedPrompt = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={REMARK_MATH_GFM_PLUGINS}
      rehypePlugins={KATEX_REHYPE_PLUGINS}
    >
      {normalizeMathDelimiters(
        normalizeLegacySymbols(question.questionText),
      )}
    </ReactMarkdown>
  ), [question.questionText]);

  return (
    <article className="border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-900 transition shadow-xs">
      {/* Question Accordion Header */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`question-content-${question.id}`}
        onClick={() => onToggleOpen(question.id)}
        className="w-full p-4 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="space-y-2 flex-1">
          {/* Badge Metadata Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-brut bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100">
              Q{question.questionNumber}
            </span>
            <span className="badge-brut bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {question.examCode}
            </span>
            <span className={`badge-brut ${categoryStyle}`}>
              {question.subjectCategory}
            </span>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              · {question.subjectTopic}
            </span>

            {/* Star / Bookmark Button */}
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(question.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  onToggleBookmark(question.id);
                }
              }}
              className={`badge-brut cursor-pointer transition-colors ${
                isBookmarked
                  ? "bg-amber-400 text-zinc-950 border-zinc-950 font-bold"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-950"
              }`}
              title={isBookmarked ? "Starred in Weak Spots" : "Star question"}
            >
              <Bookmark className="w-3 h-3 fill-current" />
              <span>{isBookmarked ? "STARRED" : "STAR"}</span>
            </span>

            {question.questionImagePath || question.options.some((opt) => Boolean(opt.imagePath)) ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                <ImageIcon className="w-3 h-3" /> Diagram
              </span>
            ) : null}
          </div>

          {/* Question Prompt Preview */}
          <div className="text-sm md:text-base leading-relaxed font-sans text-zinc-900 dark:text-zinc-100 prose prose-sm max-w-none prose-p:my-1">
            {renderedPrompt}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 mt-1 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Expanded Question Content */}
      {isOpen ? (
        <div
          id={`question-content-${question.id}`}
          className="border-t-2 border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          <div className="p-4 md:p-6 space-y-5 bg-white dark:bg-zinc-900">
            {/* Markdown Table if present */}
            {question.tableText ? (
              <div className="question-table-wrap border-2 border-zinc-950 dark:border-zinc-300 p-3 bg-zinc-50 dark:bg-zinc-800/40">
                <div className="text-xs md:text-sm">
                  <ReactMarkdown remarkPlugins={REMARK_GFM_PLUGINS}>
                    {question.tableText}
                  </ReactMarkdown>
                </div>
              </div>
            ) : null}

            {/* Diagram Image if present */}
            {resolvedImageUrl ? (
              <div className="question-image-container border-2 border-zinc-950 dark:border-zinc-300 p-2 bg-zinc-50 dark:bg-zinc-800/40">
                <img
                  src={resolvedImageUrl}
                  alt={`Diagram for question ${question.questionNumber}`}
                  className="max-w-full h-auto block mx-auto cursor-zoom-in hover:opacity-95 transition-opacity"
                  loading="lazy"
                  onClick={() => onZoomImage(resolvedImageUrl)}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <div
                  className="hidden items-center justify-center p-6 text-xs font-mono opacity-60 gap-2"
                  style={{ display: "none" }}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Diagram pending preview: {question.questionImagePath?.split("/").pop()}</span>
                </div>
              </div>
            ) : null}

            {/* Choices Matrix */}
            {question.options.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Answer Choices
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option) => {
                    const isCorrect = option.key === question.correctOption;

                    return (
                      <div
                        key={`${question.id}-${option.key}`}
                        className={`p-3.5 border-2 transition ${
                          isCorrect
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs"
                            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`font-mono font-bold text-sm px-2 py-0.5 border ${
                              isCorrect
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-zinc-400 dark:border-zinc-600 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            {option.key}
                          </span>

                          <div className="flex-1 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-0">
                            {option.text ? (
                              <ReactMarkdown
                                remarkPlugins={REMARK_MATH_GFM_PLUGINS}
                                rehypePlugins={KATEX_REHYPE_PLUGINS}
                              >
                                {normalizeMathDelimiters(
                                  normalizeLegacySymbols(option.text),
                                )}
                              </ReactMarkdown>
                            ) : null}

                            {option.imagePath ? (
                              <div className="mt-2 border border-zinc-200 dark:border-zinc-700 p-2 bg-white dark:bg-zinc-900 inline-block max-w-xs">
                                <img
                                  src={resolveVaultImageUrl(option.imagePath) ?? option.imagePath}
                                  alt={`Option ${option.key} visual`}
                                  className="max-h-36 w-auto object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                                  loading="lazy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const src = resolveVaultImageUrl(option.imagePath) ?? option.imagePath;
                                    if (src) onZoomImage(src);
                                  }}
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = "none";
                                    const fallback = target.nextElementSibling as HTMLElement | null;
                                    if (fallback) fallback.style.display = "flex";
                                  }}
                                />
                                <div
                                  className="hidden items-center justify-center p-2 text-[11px] font-mono opacity-60 gap-1.5 text-zinc-500"
                                  style={{ display: "none" }}
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>Visual pending: {option.imagePath.split("/").pop()}</span>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {isCorrect && (
                            <span className="badge-brut bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-600 text-[10px] shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Official Explanation Box */}
            <div className="border-l-4 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Official Walkthrough & Explanation
                </span>
              </div>

              <div className="text-sm leading-relaxed prose prose-sm max-w-none text-zinc-800 dark:text-zinc-200">
                {question.answerExplanation ? (
                  <ReactMarkdown
                    remarkPlugins={REMARK_MATH_GFM_PLUGINS}
                    rehypePlugins={KATEX_REHYPE_PLUGINS}
                  >
                    {normalizeMathDelimiters(
                      normalizeLegacySymbols(question.answerExplanation),
                    )}
                  </ReactMarkdown>
                ) : (
                  <p className="text-xs font-mono text-zinc-500 italic">
                    No additional written explanation is recorded in the vault for this question. Refer to choice {question.correctOption} for the verified answer.
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

export default function PreviousExamsPage() {
  const rawGroupedQuestions = useMemo(() => getGroupedPreviousExamQuestions(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | CategoryName>("ALL");
  const [selectedExamType, setSelectedExamType] = useState<"ALL" | "AM EXAM" | "PM EXAM">("ALL");

  const [openYears, setOpenYears] = useState<Record<string, boolean>>(() => {
    // Default open the most recent year
    if (rawGroupedQuestions.length > 0) {
      return { [rawGroupedQuestions[0].year]: true };
    }
    return {};
  });

  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});
  const [visibleCountByYear, setVisibleCountByYear] = useState<Record<string, number>>({});
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zoomedImageUrl) {
        setZoomedImageUrl(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedImageUrl]);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(() => {
    const ids = loadBookmarkedQuestionIds();
    const map: Record<string, boolean> = {};
    ids.forEach((id) => {
      map[id] = true;
    });
    return map;
  });

  const handleToggleBookmark = useCallback((questionId: string) => {
    const next = toggleQuestionBookmark(questionId);
    setBookmarkedMap((prev) => ({
      ...prev,
      [questionId]: next,
    }));
  }, []);

  const toggleYear = useCallback((year: string) => {
    setOpenYears((current) => ({
      ...current,
      [year]: !current[year],
    }));
  }, []);

  const toggleQuestion = useCallback((questionId: string) => {
    setOpenQuestions((current) => ({
      ...current,
      [questionId]: !current[questionId],
    }));
  }, []);

  // Filtered grouped questions
  const filteredGroupedQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rawGroupedQuestions
      .map((group) => {
        const matchingQuestions = group.questions.filter((question: PreviousExamQuestion) => {
          if (selectedCategory !== "ALL" && question.subjectCategory !== selectedCategory) {
            return false;
          }

          if (selectedExamType !== "ALL" && question.examType !== selectedExamType) {
            return false;
          }

          if (query) {
            const inText = question.questionText.toLowerCase().includes(query);
            const inTopic = question.subjectTopic.toLowerCase().includes(query);
            const inNum = question.questionNumber.toLowerCase().includes(query);
            const inCode = question.examCode.toLowerCase().includes(query);
            const inCategory = question.subjectCategory.toLowerCase().includes(query);
            const inChoices = question.options.some((opt) =>
              opt.text.toLowerCase().includes(query),
            );

            // Match full compound question codes like "2024A_FE-A_16", "2023S_FE-A_49", "2021A_FE_AM_55", or "Q16"
            const compoundCode = `${question.examCode}_${question.questionNumber}`.toLowerCase();
            const compoundCodeHyphen = `${question.examCode}-${question.questionNumber}`.toLowerCase();
            const cleanQuery = query.replace(/[^a-z0-9]/g, "");
            const cleanCompound = `${question.examCode}${question.questionNumber}`.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normalizedQueryAlias = cleanQuery.replace(/fea(?=\d)/g, "feam");
            const normalizedCompoundAlias = cleanCompound.replace(/fea(?=\d)/g, "feam");

            const inCompound =
              compoundCode.includes(query) ||
              compoundCodeHyphen.includes(query) ||
              question.id.toLowerCase().includes(query) ||
              (cleanQuery.length > 2 && cleanCompound.includes(cleanQuery)) ||
              (normalizedQueryAlias.length > 2 && normalizedCompoundAlias.includes(normalizedQueryAlias)) ||
              query === `q${question.questionNumber}`.toLowerCase();

            return inText || inTopic || inNum || inCode || inCategory || inChoices || inCompound;
          }

          return true;
        });

        return {
          year: group.year,
          questions: matchingQuestions,
        };
      })
      .filter((group) => group.questions.length > 0);
  }, [rawGroupedQuestions, searchQuery, selectedCategory, selectedExamType]);

  const totalQuestionsInArchive = useMemo(() => {
    return rawGroupedQuestions.reduce((sum, group) => sum + group.questions.length, 0);
  }, [rawGroupedQuestions]);

  const totalMatchingQuestions = useMemo(() => {
    return filteredGroupedQuestions.reduce((sum, group) => sum + group.questions.length, 0);
  }, [filteredGroupedQuestions]);

  const areAllYearsExpanded =
    filteredGroupedQuestions.length > 0 &&
    filteredGroupedQuestions.every((g) => openYears[g.year]);

  const handleToggleExpandAllYears = () => {
    if (areAllYearsExpanded) {
      setOpenYears({});
    } else {
      const allOpen: Record<string, boolean> = {};
      filteredGroupedQuestions.forEach((g) => {
        allOpen[g.year] = true;
      });
      setOpenYears(allOpen);
    }
  };

  const handleJumpToYear = (year: string) => {
    setOpenYears((current) => ({
      ...current,
      [year]: true,
    }));

    const element = document.getElementById(`year-section-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedExamType("ALL");
  };

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "ALL" ||
    selectedExamType !== "ALL";

  return (
    <Layout className="dark:text-white select-none py-6 md:py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="border-b-2 border-zinc-950 dark:border-zinc-100 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-2 bg-blue-100 dark:bg-blue-950/60 border border-blue-600 dark:border-blue-400 text-blue-900 dark:text-blue-200 text-xs font-mono font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> PhilNITS Historical Archive
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-heading">
                Previous Exam Vault
              </h1>
              <p className="mt-2 text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                Comprehensive archive of verified Fundamental Information Technology Engineers (FE) examination questions, curated from{" "}
                <a
                  href="https://github.com/usc-cisco/philnits-vault"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                >
                  philnits-vault
                  <ExternalLink className="w-3.5 h-3.5 inline" />
                </a>
                . Explore questions by year, search topic patterns, and inspect detailed solution walk-throughs.
              </p>
            </div>

            {/* Monospace Counters */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="card-brut px-3 py-2 text-center">
                <div className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
                  Questions
                </div>
                <div className="text-xl md:text-2xl font-mono font-black text-blue-600 dark:text-blue-400">
                  {totalQuestionsInArchive}
                </div>
              </div>
              <div className="card-brut px-3 py-2 text-center">
                <div className="text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
                  Exam Years
                </div>
                <div className="text-xl md:text-2xl font-mono font-black text-zinc-950 dark:text-zinc-100">
                  {rawGroupedQuestions.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Search & Filter Bar */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md py-4 border-b-2 border-zinc-950 dark:border-zinc-100 shadow-sm space-y-3">
          {/* Top Row: Search Input + Expand/Collapse Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by text, topic, #code, or keywords..."
                className="form-input w-full pl-10 pr-9 text-sm"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleExpandAllYears}
                className="btn-outline px-3.5 py-2 text-xs font-mono flex items-center justify-center gap-1.5 shrink-0"
              >
                {areAllYearsExpanded ? (
                  <>
                    <ChevronsDownUp className="w-3.5 h-3.5" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                    <span>Expand All</span>
                  </>
                )}
              </button>

              {isFiltered ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-outline px-3 py-2 text-xs font-mono text-red-600 dark:text-red-400 flex items-center gap-1 shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Filter Pills: Category, Exam Type, and Jump-to-Year */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 pt-1 text-xs">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase mr-1">
                Domain:
              </span>
              {CATEGORY_OPTIONS.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2.5 py-1 font-mono font-semibold border transition cursor-pointer ${
                      isActive
                        ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Exam Type Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase mr-1">
                Type:
              </span>
              {EXAM_TYPE_OPTIONS.map((examType) => {
                const isActive = selectedExamType === examType;
                return (
                  <button
                    key={examType}
                    type="button"
                    onClick={() => setSelectedExamType(examType)}
                    className={`px-2.5 py-1 font-mono font-semibold border transition cursor-pointer ${
                      isActive
                        ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    {examType}
                  </button>
                );
              })}
            </div>

            {/* Jump-to-Year Strip */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase mr-1">
                Jump:
              </span>
              {rawGroupedQuestions.map((g) => (
                <button
                  key={g.year}
                  type="button"
                  onClick={() => handleJumpToYear(g.year)}
                  className="px-2 py-0.5 text-[11px] font-mono border border-zinc-300 dark:border-zinc-700 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  {g.year}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-1">
            <div>
              Showing <strong className="text-zinc-950 dark:text-zinc-100">{totalMatchingQuestions}</strong> matching questions across <strong className="text-zinc-950 dark:text-zinc-100">{filteredGroupedQuestions.length}</strong> years
            </div>
            {isFiltered && (
              <span className="badge-brut bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-600">
                Filtered View Active
              </span>
            )}
          </div>
        </div>

        {/* Empty Search State */}
        {filteredGroupedQuestions.length === 0 ? (
          <div className="card-brut p-10 text-center space-y-4 my-8">
            <div className="w-12 h-12 mx-auto border-2 border-zinc-950 dark:border-zinc-100 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <Search className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold font-heading">No Matching Questions Found</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              We couldn't find any archive questions matching "{searchQuery}". Try broadening your search or resetting category filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-solid px-4 py-2 text-xs font-mono"
            >
              Reset All Filters
            </button>
          </div>
        ) : null}

        {/* Year Accordions & Questions List */}
        <div className="space-y-6">
          {filteredGroupedQuestions.map((entry) => {
            const isFilteredOrSearching = Boolean(
              searchQuery.trim() || selectedCategory !== "ALL" || selectedExamType !== "ALL",
            );
            const isYearOpen = isFilteredOrSearching ? true : Boolean(openYears[entry.year]);
            const visibleLimit = visibleCountByYear[entry.year] ?? PAGE_SIZE;
            const displayedQuestions = isFilteredOrSearching
              ? entry.questions
              : entry.questions.slice(0, visibleLimit);
            const hasMore = !isFilteredOrSearching && entry.questions.length > displayedQuestions.length;

            return (
              <section
                key={entry.year}
                id={`year-section-${entry.year}`}
                className="card-brut overflow-hidden scroll-mt-48 transition"
              >
                {/* Year Header Accordion Button */}
                <button
                  type="button"
                  aria-expanded={isYearOpen}
                  aria-controls={`year-panel-${entry.year}`}
                  onClick={() => toggleYear(entry.year)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {entry.year}
                    </span>
                    <span className="badge-brut bg-zinc-100 dark:bg-zinc-800 text-xs">
                      {entry.questions.length} Questions
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                      {isYearOpen ? "Collapse Year" : "Expand Year"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isYearOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </button>

                {/* Collapsible Year Panel */}
                <AnimatePresence initial={false}>
                  {isYearOpen ? (
                    <motion.div
                      id={`year-panel-${entry.year}`}
                      key={`${entry.year}-panel`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="border-t-2 border-zinc-950 dark:border-zinc-100 overflow-hidden"
                    >
                      <div className="p-4 md:p-6 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/40">
                        {displayedQuestions.map((question: PreviousExamQuestion) => (
                          <QuestionAccordionItem
                            key={question.id}
                            question={question}
                            isOpen={Boolean(openQuestions[question.id])}
                            isBookmarked={Boolean(bookmarkedMap[question.id])}
                            onToggleOpen={toggleQuestion}
                            onToggleBookmark={handleToggleBookmark}
                            onZoomImage={setZoomedImageUrl}
                          />
                        ))}

                        {hasMore ? (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-zinc-950 dark:border-zinc-200">
                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                              Showing <strong>{displayedQuestions.length}</strong> of <strong>{entry.questions.length}</strong> questions in {entry.year}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setVisibleCountByYear((prev) => ({
                                    ...prev,
                                    [entry.year]: (prev[entry.year] ?? PAGE_SIZE) + PAGE_SIZE,
                                  }))
                                }
                                className="btn-outline px-3.5 py-1.5 text-xs font-mono font-bold"
                              >
                                + Load 25 More
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setVisibleCountByYear((prev) => ({
                                    ...prev,
                                    [entry.year]: entry.questions.length,
                                  }))
                                }
                                className="btn-outline px-3.5 py-1.5 text-xs font-mono font-bold"
                              >
                                Show All ({entry.questions.length})
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </section>
            );
          })}
        </div>
      </div>

      {/* Diagram Zoom Modal */}
      {zoomedImageUrl ? (
        <div
          className="modal-overlay fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setZoomedImageUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 p-4 flex flex-col items-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b-2 border-zinc-950 dark:border-zinc-100 mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-70">
                Diagram Preview (Press Esc or Click Outside)
              </span>
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold cursor-pointer"
                aria-label="Close diagram preview"
              >
                <X className="w-5 h-5" />
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
    </Layout>
  );
}
