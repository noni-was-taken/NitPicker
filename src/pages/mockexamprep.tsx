import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sliders,
  Clock,
  HelpCircle,
  AlertTriangle,
  Layers,
  Calendar,
  Play,
  Trash2,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  allTopics,
  categoryTopics,
  clearMockExamResult,
  clearMockExamSession,
  loadBookmarkedQuestionIds,
  loadMockExamSession,
  saveMockExamSession,
  type CategoryName,
  type MockExamSettings,
} from "../exam/mockExamModel";
import {
  buildMockExamSession,
  buildStarredQuestionsSession,
  getAllAvailableYears,
  getEligibleQuestionCount,
} from "../exam/mockExamQuestionBank";
import { UI_LIMITS } from "../config/constants";
import { trackEvent } from "../lib/analytics";

const DURATION_CHIPS = [30, 60, 90, 150];
const QUESTION_CHIPS = [10, 20, 40, 80];

export default function MockExamPrepPage() {
  const navigate = useNavigate();
  const allYears = useMemo(() => getAllAvailableYears(), []);
  const bookmarkedIds = useMemo(() => loadBookmarkedQuestionIds(), []);
  const bookmarkedCount = bookmarkedIds.length;

  const [examType, setExamType] = useState<"AM EXAM" | "PM EXAM">("AM EXAM");
  const [isTimed, setIsTimed] = useState(true);
  const [durationInput, setDurationInput] = useState<string>(
    String(UI_LIMITS.defaultDurationMinutes),
  );
  const [questionCountInput, setQuestionCountInput] = useState<string>(
    String(UI_LIMITS.defaultQuestionCount),
  );
  const [instantAnswers, setInstantAnswers] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(allTopics);
  const [selectedYears, setSelectedYears] = useState<string[]>(allYears);

  const [startError, setStartError] = useState<string | null>(null);
  const [inputValidationError, setInputValidationError] = useState<string | null>(
    null,
  );
  const [hasActiveSession, setHasActiveSession] = useState(() => {
    const session = loadMockExamSession();
    return Boolean(session && session.questions && session.questions.length > 0);
  });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);

  const closeStartErrorModal = () => setStartError(null);
  const closeInputValidationModal = () => setInputValidationError(null);
  const closeResumeModal = () => setShowResumeModal(false);

  const availableCount = useMemo(() => {
    return getEligibleQuestionCount({
      examType,
      isTimed,
      durationMinutes: 1,
      questionCount: 1,
      instantAnswers,
      selectedTopics,
      selectedYears,
    });
  }, [examType, selectedTopics, selectedYears, isTimed, instantAnswers]);

  const parseWholeNumber = (rawValue: string): number | null => {
    const trimmed = rawValue.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getQuestionCountValidationError = (
    rawValue: string,
    currentPool: number,
  ): string | null => {
    const parsed = parseWholeNumber(rawValue);
    if (parsed === null || parsed < 1 || parsed > UI_LIMITS.maxQuestionCount) {
      return `Input not allowed. Questions must be between 1 and ${UI_LIMITS.maxQuestionCount}.`;
    }
    if (parsed > currentPool) {
      return `Input not allowed. Only ${currentPool} questions match the current filters.`;
    }
    return null;
  };

  const handleStartExam = (forceStartNew = false) => {
    // 1. Validate all inputs FIRST before touching any session state
    if (selectedTopics.length === 0) {
      setInputValidationError("You have to choose at least 1 topic.");
      return;
    }

    if (selectedYears.length === 0) {
      setInputValidationError("You have to choose at least 1 year.");
      return;
    }

    const parsedDurationMinutes = parseWholeNumber(durationInput);
    if (isTimed && (parsedDurationMinutes === null || parsedDurationMinutes < 1)) {
      setInputValidationError("Input not allowed. Duration must be at least 1 minute.");
      return;
    }

    const countError = getQuestionCountValidationError(questionCountInput, availableCount);
    if (countError) {
      setInputValidationError(countError);
      return;
    }

    if (availableCount <= 0) {
      setInputValidationError(
        "No questions match your current filters. Select more topics or years.",
      );
      return;
    }

    // 2. If user already has an active session and hasn't explicitly chosen to overwrite, prompt them
    if (hasActiveSession && !forceStartNew) {
      setShowResumeModal(true);
      return;
    }

    // 3. Inputs are completely valid. Now proceed to create the session.
    setIsStartingExam(true);

    if (forceStartNew) {
      clearMockExamSession();
      setHasActiveSession(false);
      setShowResumeModal(false);
    }

    const safeQuestionCount = Number(questionCountInput);
    const safeDurationMin = isTimed
      ? (parsedDurationMinutes ?? UI_LIMITS.defaultDurationMinutes)
      : UI_LIMITS.defaultDurationMinutes;

    const examSettings: MockExamSettings = {
      examType,
      isTimed,
      durationMinutes: safeDurationMin,
      questionCount: safeQuestionCount,
      instantAnswers,
      selectedTopics,
      selectedYears,
    };

    const session = buildMockExamSession(examSettings);

    if (session.questions.length === 0) {
      setStartError("No questions match your current filters. Try selecting more topics or years.");
      setIsStartingExam(false);
      return;
    }

    if (session.questions.length < safeQuestionCount) {
      setStartError(
        `Only ${session.questions.length} matching questions are available. Reduce the question count or broaden selection.`,
      );
      setIsStartingExam(false);
      return;
    }

    setStartError(null);
    clearMockExamResult();
    saveMockExamSession(session);
    setHasActiveSession(true);

    trackEvent("exam_started", {
      exam_type: examType,
      question_count: safeQuestionCount,
      timed: isTimed,
    });

    navigate("/mockexam");
  };

  const handleResumeExam = () => {
    setShowResumeModal(false);
    navigate("/mockexam");
  };

  const handleDiscardSession = () => {
    clearMockExamSession();
    setHasActiveSession(false);
    setShowResumeModal(false);
  };

  // Pure state update handlers without side effects in updaters
  const toggleYear = (year: string) => {
    const isSelected = selectedYears.includes(year);
    const nextYears = isSelected
      ? selectedYears.filter((item) => item !== year)
      : [...selectedYears, year];

    setSelectedYears(nextYears);
    if (nextYears.length > 0 && inputValidationError?.includes("year")) {
      setInputValidationError(null);
    }
  };

  const handleSelectAllYears = () => {
    setSelectedYears(allYears);
    if (inputValidationError?.includes("year")) {
      setInputValidationError(null);
    }
  };

  const handleClearYears = () => {
    setSelectedYears([]);
  };

  const toggleTopic = (topic: string) => {
    const isSelected = selectedTopics.includes(topic);
    const nextTopics = isSelected
      ? selectedTopics.filter((item) => item !== topic)
      : [...selectedTopics, topic];

    setSelectedTopics(nextTopics);
    if (nextTopics.length > 0 && inputValidationError?.includes("topic")) {
      setInputValidationError(null);
    }
  };

  const toggleCategory = (categoryName: CategoryName) => {
    const topicsInCategory: readonly string[] = categoryTopics[categoryName];
    const hasAllTopics = topicsInCategory.every((topic) =>
      selectedTopics.includes(topic),
    );

    const nextTopics = hasAllTopics
      ? selectedTopics.filter((topic) => !topicsInCategory.includes(topic))
      : [...new Set([...selectedTopics, ...topicsInCategory])];

    setSelectedTopics(nextTopics);
    if (nextTopics.length > 0 && inputValidationError?.includes("topic")) {
      setInputValidationError(null);
    }
  };

  const handleSelectAllTopics = () => {
    setSelectedTopics(allTopics);
    if (inputValidationError?.includes("topic")) {
      setInputValidationError(null);
    }
  };

  const handleClearTopics = () => {
    setSelectedTopics([]);
  };

  // Preset Handlers
  const applyPreset = (preset: {
    examType?: "AM EXAM" | "PM EXAM";
    isTimed: boolean;
    durationMinutes: number;
    questionCount: number;
    instantAnswers: boolean;
    topics: string[];
    years: string[];
  }) => {
    if (preset.examType) setExamType(preset.examType);
    setIsTimed(preset.isTimed);
    setDurationInput(String(preset.durationMinutes));
    setQuestionCountInput(String(preset.questionCount));
    setInstantAnswers(preset.instantAnswers);
    setSelectedTopics(preset.topics);
    setSelectedYears(preset.years);
    setInputValidationError(null);
    setStartError(null);
  };

  const isAllYearsSelected = allYears.length > 0 && selectedYears.length === allYears.length;
  const isAllTopicsSelected = allTopics.length > 0 && selectedTopics.length === allTopics.length;

  const currentCountNum = parseWholeNumber(questionCountInput) ?? 0;
  const isCountExceedingPool = currentCountNum > availableCount && availableCount > 0;

  return (
    <Layout className="dark:text-white select-none py-6 md:py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Heading & Brutalist Banner */}
        <div className="border-b-2 border-zinc-950 dark:border-zinc-100 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-2 bg-blue-100 dark:bg-blue-950/60 border border-blue-600 dark:border-blue-400 text-blue-900 dark:text-blue-200 text-xs font-mono font-bold uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" /> PhilNITS FE Exam Studio
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-heading">
                Mock Exam Prep
              </h1>
              <p className="mt-2 text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Configure your tailored FE exam session, practice high-yield topics, or launch a full timed simulation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="badge-brut bg-zinc-100 dark:bg-zinc-800">
                {allYears.length} Exam Years
              </span>
              <span className="badge-brut bg-zinc-100 dark:bg-zinc-800">
                {allTopics.length} Topics
              </span>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> One-Click Quick Presets
              </p>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${bookmarkedCount > 0 ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-3`}>
              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    examType: "AM EXAM",
                    isTimed: true,
                    durationMinutes: 150,
                    questionCount: 80,
                    instantAnswers: false,
                    topics: allTopics,
                    years: allYears,
                  })
                }
                className="card-brut p-3.5 text-left transition hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Official Spec
                  </span>
                  <Clock className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </div>
                <div className="font-bold text-sm md:text-base mt-1">Full FE Simulation</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  80Q · 150m · Final Exam Mode
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    examType: "AM EXAM",
                    isTimed: true,
                    durationMinutes: 30,
                    questionCount: 20,
                    instantAnswers: true,
                    topics: allTopics,
                    years: allYears,
                  })
                }
                className="card-brut p-3.5 text-left transition hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Rapid Practice
                  </span>
                  <RotateCcw className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </div>
                <div className="font-bold text-sm md:text-base mt-1">Quick Sprint</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  20Q · 30m · Instant Reveal
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    examType: "AM EXAM",
                    isTimed: true,
                    durationMinutes: 75,
                    questionCount: 40,
                    instantAnswers: false,
                    topics: [...categoryTopics.Technology],
                    years: allYears,
                  })
                }
                className="card-brut p-3.5 text-left transition hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Core Engineering
                  </span>
                  <Layers className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </div>
                <div className="font-bold text-sm md:text-base mt-1">Technology Focus</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  40Q · 75m · Tech Topics Only
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    examType: "AM EXAM",
                    isTimed: true,
                    durationMinutes: 45,
                    questionCount: 25,
                    instantAnswers: false,
                    topics: [
                      ...categoryTopics.Management,
                      ...categoryTopics.Strategy,
                    ],
                    years: allYears,
                  })
                }
                className="card-brut p-3.5 text-left transition hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                    Business & Ops
                  </span>
                  <Calendar className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </div>
                <div className="font-bold text-sm md:text-base mt-1">Mgmt & Strategy</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                  25Q · 45m · Non-Technical Core
                </div>
              </button>

              {bookmarkedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (hasActiveSession && !window.confirm("This replaces your mock exam in progress. Start the starred drill anyway?")) {
                      return;
                    }
                    const session = buildStarredQuestionsSession(bookmarkedIds);
                    if (session && session.questions.length > 0) {
                      clearMockExamResult();
                      saveMockExamSession(session);
                      navigate("/mockexam");
                    }
                  }}
                  className="card-brut p-3.5 text-left border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 transition hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-amber-100/70 dark:hover:bg-amber-900/40 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                      Targeted Drill
                    </span>
                    <Bookmark className="w-4 h-4 text-amber-500 fill-current opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="font-bold text-sm md:text-base mt-1">Starred Weak Spots</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                    {bookmarkedCount}Q · Adaptive Review
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Configuration Workbench (Left Column) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Session Alert Banner (if any) */}
            {hasActiveSession ? (
              <div className="border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-bold text-base md:text-lg text-amber-900 dark:text-amber-200">
                      Active Exam Session In Progress
                    </h2>
                    <p className="text-xs md:text-sm text-amber-800/80 dark:text-amber-300/80">
                      You have an unfinished mock exam stored in this browser. You can resume immediately or discard it.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleResumeExam}
                    className="btn-solid text-xs md:text-sm px-4 py-2 flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> RESUME EXAM
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardSession}
                    className="btn-outline text-xs md:text-sm px-3 py-2 flex items-center justify-center gap-1 hover:text-red-600 dark:hover:text-red-400"
                    title="Discard Active Session"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DISCARD
                  </button>
                </div>
              </div>
            ) : null}

            {/* Exam Mode & Timing Card */}
            <div className="card-brut p-5 md:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Exam Mode & Duration
                </h2>
                <span className="badge-brut bg-zinc-100 dark:bg-zinc-800">AM FE Exam</span>
              </div>

              {/* Exam Type Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Exam Type
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setExamType("AM EXAM")}
                    className={`py-2.5 px-4 text-sm font-bold border-2 transition cursor-pointer ${
                      examType === "AM EXAM"
                        ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-zinc-300 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    AM EXAM (80 Questions)
                  </button>
                  {/* ponytail: PM case studies have multi-part answers the question model can't hold yet; re-enable when it can. */}
                  <button
                    type="button"
                    disabled
                    title="PM case studies are not available yet"
                    className="py-2.5 px-4 text-sm font-bold border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 opacity-50 cursor-not-allowed"
                  >
                    PM EXAM (Coming soon)
                  </button>
                </div>
              </div>

              {/* Timer Mode & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <span className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Timer Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTimed(true)}
                      className={`py-2 px-3 text-xs md:text-sm font-bold border-2 transition cursor-pointer ${
                        isTimed
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                          : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      Timed Exam
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTimed(false)}
                      className={`py-2 px-3 text-xs md:text-sm font-bold border-2 transition cursor-pointer ${
                        !isTimed
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                          : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      Untimed (Practice)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Duration (Minutes)
                    </span>
                    {!isTimed && (
                      <span className="text-[11px] font-mono text-zinc-400">
                        (Disabled in untimed mode)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={!isTimed}
                      value={durationInput}
                      onChange={(e) => setDurationInput(e.target.value.replace(/\D/g, ""))}
                      className="form-input w-28 text-center text-sm font-bold disabled:opacity-40"
                    />
                    <div className="flex items-center gap-1">
                      {DURATION_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          disabled={!isTimed}
                          onClick={() => setDurationInput(String(chip))}
                          className={`px-2.5 py-1 text-xs font-mono font-semibold border transition cursor-pointer disabled:opacity-40 ${
                            durationInput === String(chip)
                              ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                              : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-zinc-200"
                          }`}
                        >
                          {chip}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Count & Quick Chips */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Question Count
                  </span>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    Matching Pool: <strong className="text-zinc-950 dark:text-zinc-100">{availableCount}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={questionCountInput}
                    onChange={(e) => setQuestionCountInput(e.target.value.replace(/\D/g, ""))}
                    className="form-input w-28 text-center text-sm font-bold"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {QUESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setQuestionCountInput(String(chip))}
                        className={`px-2.5 py-1 text-xs font-mono font-semibold border transition cursor-pointer ${
                          questionCountInput === String(chip)
                            ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-zinc-200"
                        }`}
                      >
                        {chip}Q
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionCountInput(
                          String(Math.min(availableCount, UI_LIMITS.maxQuestionCount)),
                        )
                      }
                      className="px-3 py-1 text-xs font-mono font-bold border-2 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                      title="Set to maximum matching questions"
                    >
                      MAX ({availableCount})
                    </button>
                  </div>
                </div>

                {isCountExceedingPool && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Requested {currentCountNum}Q exceeds available pool of {availableCount}Q.
                    <button
                      type="button"
                      onClick={() => setQuestionCountInput(String(availableCount))}
                      className="underline font-bold ml-1 cursor-pointer"
                    >
                      Clamp to {availableCount}
                    </button>
                  </p>
                )}
              </div>

              {/* Instant Answer Reveal Toggle */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={instantAnswers}
                    onChange={(e) => setInstantAnswers(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded-none border-2 border-zinc-950 dark:border-zinc-100 accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-sm md:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Instant Answer Reveal Mode
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Show official answers and detailed explanations immediately after answering each question. Recommended for active learning and topic sprints.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Interactive Year Filter Chips */}
            <div className="card-brut p-5 md:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg md:text-xl font-bold">Exam Source Years</h2>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 ml-1">
                    ({selectedYears.length}/{allYears.length} selected)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllYears}
                    className={`text-xs font-mono font-bold px-2.5 py-1 border transition cursor-pointer ${
                      isAllYearsSelected
                        ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950"
                    }`}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearYears}
                    className="text-xs font-mono font-bold px-2.5 py-1 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 transition cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-red-600"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Year Pills Strip */}
              <div className="flex flex-wrap gap-2 pt-1">
                {allYears.map((year) => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => toggleYear(year)}
                      className={`px-3.5 py-1.5 text-xs font-mono font-bold border-2 transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                          : "border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-950 dark:hover:border-zinc-300 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Domain & Topic Filter Matrix */}
            <div className="card-brut p-5 md:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg md:text-xl font-bold">Knowledge Domains & Topics</h2>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 ml-1">
                    ({selectedTopics.length}/{allTopics.length} selected)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllTopics}
                    className={`text-xs font-mono font-bold px-2.5 py-1 border transition cursor-pointer ${
                      isAllTopicsSelected
                        ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950"
                    }`}
                  >
                    Select All Topics
                  </button>
                  <button
                    type="button"
                    onClick={handleClearTopics}
                    className="text-xs font-mono font-bold px-2.5 py-1 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 transition cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-red-600"
                  >
                    Clear Topics
                  </button>
                </div>
              </div>

              {/* 3 Domain Sections */}
              <div className="space-y-6">
                {(["Technology", "Management", "Strategy"] as CategoryName[]).map((categoryName) => {
                  const topics = categoryTopics[categoryName];
                  const selectedCount = topics.filter((t) => selectedTopics.includes(t)).length;
                  const isAllCategorySelected = selectedCount === topics.length;

                  return (
                    <div
                      key={categoryName}
                      className="border-2 border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-extrabold text-sm md:text-base tracking-wide uppercase">
                            {categoryName}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            [{selectedCount}/{topics.length}]
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCategory(categoryName)}
                          className={`text-xs font-mono font-semibold px-2 py-0.5 border transition cursor-pointer ${
                            isAllCategorySelected
                              ? "bg-zinc-200 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200"
                              : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-950 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {isAllCategorySelected ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => {
                          const isSelected = selectedTopics.includes(topic);
                          return (
                            <button
                              key={topic}
                              type="button"
                              onClick={() => toggleTopic(topic)}
                              className={`px-3 py-1.5 text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                                  : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-950 dark:hover:border-zinc-300 bg-white dark:bg-zinc-900"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isSelected
                                    ? "bg-blue-500 dark:bg-blue-400"
                                    : "bg-zinc-300 dark:bg-zinc-700"
                                }`}
                              />
                              {topic}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Summary & Launch Sidebar (Right Column) */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="card-brut p-6 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-100 pb-3">
                <div>
                  <span className="badge-brut bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-600 dark:border-blue-400">
                    LIVE BLUEPRINT
                  </span>
                  <h3 className="text-xl font-heading font-extrabold mt-1">
                    Exam Specification
                  </h3>
                </div>
              </div>

              {/* Prominent Monospace Counter */}
              <div className="border-2 border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 p-4 text-center space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">
                  Eligible Question Pool
                </span>
                <div className="text-4xl md:text-5xl font-mono font-black text-blue-600 dark:text-blue-400">
                  {availableCount}
                </div>
                <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  Target: <strong>{questionCountInput || 0} Questions</strong>
                </div>
              </div>

              {/* Spec Rows */}
              <div className="space-y-2.5 text-xs md:text-sm font-mono divide-y divide-zinc-200 dark:divide-zinc-800">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Exam Mode:</span>
                  <strong className="text-zinc-950 dark:text-zinc-100">{examType}</strong>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Time Limit:</span>
                  <strong className="text-zinc-950 dark:text-zinc-100">
                    {isTimed ? `${durationInput || 0} minutes` : "Untimed"}
                  </strong>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Answer Reveal:</span>
                  <strong className="text-zinc-950 dark:text-zinc-100">
                    {instantAnswers ? "Instant Reveal" : "Standard (End of Exam)"}
                  </strong>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Selected Years:</span>
                  <strong className="text-zinc-950 dark:text-zinc-100">
                    {selectedYears.length} of {allYears.length}
                  </strong>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Selected Topics:</span>
                  <strong className="text-zinc-950 dark:text-zinc-100">
                    {selectedTopics.length} of {allTopics.length}
                  </strong>
                </div>
              </div>

              {/* Live Inline Validation Warnings */}
              {availableCount === 0 ? (
                <div className="border border-red-500 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>
                    No questions match your current filters. Select more topics or years to generate an exam.
                  </span>
                </div>
              ) : selectedTopics.length === 0 ? (
                <div className="border border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>Please select at least 1 topic to proceed.</span>
                </div>
              ) : selectedYears.length === 0 ? (
                <div className="border border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>Please select at least 1 year to proceed.</span>
                </div>
              ) : isCountExceedingPool ? (
                <div className="border border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Question count ({currentCountNum}) exceeds the available pool ({availableCount}).
                  </span>
                </div>
              ) : null}

              {/* Start Mock Exam Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleStartExam()}
                  disabled={isStartingExam || availableCount === 0}
                  className="btn-solid w-full py-4 text-center text-base md:text-lg uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingExam ? (
                    <>
                      <LoadingSpinner label="" />
                      <span>BUILDING EXAM...</span>
                    </>
                  ) : (
                    <>
                      <span>START MOCK EXAM</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Real PhilNITS vault questions · Randomized order
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Error Modal */}
      {startError ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-start-error-title"
          onClick={closeStartErrorModal}
        >
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h2 id="mock-exam-start-error-title" className="text-xl md:text-2xl font-bold dark:text-white">
                Unable to Start Mock Exam
              </h2>
            </div>
            <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {startError}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeStartErrorModal}
                className="btn-outline px-5 py-2 text-sm"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Input Validation Error Modal */}
      {inputValidationError ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-input-validation-title"
          onClick={closeInputValidationModal}
        >
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <HelpCircle className="w-6 h-6" />
              <h2 id="mock-exam-input-validation-title" className="text-xl md:text-2xl font-bold dark:text-white">
                Configuration Notice
              </h2>
            </div>
            <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {inputValidationError}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeInputValidationModal}
                className="btn-outline px-5 py-2 text-sm"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Resume Session Confirmation Modal */}
      {showResumeModal ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-resume-title"
          onClick={closeResumeModal}
        >
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <h2 id="mock-exam-resume-title" className="text-2xl md:text-3xl font-bold mb-3 dark:text-white">
              Resume Active Mock Exam?
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              You already have an active mock exam session in progress. Would you like to resume where you left off, or start a new exam and replace your current progress?
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResumeExam}
                className="btn-solid px-5 py-2.5 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> RESUME EXAM
              </button>
              <button
                type="button"
                onClick={() => handleStartExam(true)}
                className="btn-outline px-5 py-2.5 flex items-center justify-center gap-2 hover:border-red-600 hover:text-red-600"
              >
                <RotateCcw className="w-4 h-4" /> START NEW EXAM
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
