import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import SkeletonLoader from "../components/SkeletonLoader";
import {
  allTopics,
  categoryTopics,
  clearMockExamResult,
  clearMockExamSession,
  loadMockExamSession,
  saveMockExamSession,
  type CategoryName,
  type MockExamSettings,
} from "../exam/mockExamModel";
import { buildMockExamSession } from "../exam/mockExamQuestionBank";
import { UI_LIMITS } from "../config/constants";
import { trackEvent } from "../lib/analytics";

// This is a temporary page to show the exam maker page
export default function MockExamPrepPage() {
  const navigate = useNavigate();
  const [examType, setExamType] = useState<"AM EXAM" | "PM EXAM">("AM EXAM");
  const [isTimed, setIsTimed] = useState(true);
  const [durationInput, setDurationInput] = useState<string>(String(UI_LIMITS.defaultDurationMinutes));
  const [questionCountInput, setQuestionCountInput] = useState<string>(String(UI_LIMITS.defaultQuestionCount));
  const [instantAnswers, setInstantAnswers] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(allTopics);
  const [startError, setStartError] = useState<string | null>(null);
  const [inputValidationError, setInputValidationError] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(() => {
    const session = loadMockExamSession();
    return Boolean(session && session.questions.length > 0);
  });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);
  const formControlClassName = "h-6 w-6 md:h-4 md:w-4 accent-black dark:accent-white shrink-0 cursor-pointer";
  const closeStartErrorModal = () => setStartError(null);
  const closeInputValidationModal = () => setInputValidationError(null);
  const closeResumeModal = () => setShowResumeModal(false);

  const parseWholeNumber = (rawValue: string): number | null => {
    const trimmed = rawValue.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getQuestionCountValidationError = (rawValue: string): string | null => {
    const parsed = parseWholeNumber(rawValue);
    if (parsed === null || parsed < 1 || parsed > UI_LIMITS.maxQuestionCount) {
      return `Input not allowed. Questions must be between 1 and ${UI_LIMITS.maxQuestionCount}.`;
    }

    return null;
  };

  const handleStartExam = (forceStartNew = false) => {
    setIsStartingExam(true);

    if (hasActiveSession && !forceStartNew) {
      setShowResumeModal(true);
      setIsStartingExam(false);
      return;
    }

    if (forceStartNew) {
      clearMockExamSession();
      setHasActiveSession(false);
      setShowResumeModal(false);
    }
    
    const questionCountValidationError = getQuestionCountValidationError(questionCountInput);
    if (questionCountValidationError) {
      setInputValidationError(questionCountValidationError);
      setIsStartingExam(false);
      return;
    }

    if (selectedTopics.length === 0) {
      setInputValidationError("You have to choose at least 1 topic.");
      setIsStartingExam(false);
      return;
    }

    const safeQuestionCount = Number(questionCountInput);
    const parsedDurationMinutes = parseWholeNumber(durationInput);
    if (isTimed && (parsedDurationMinutes === null || parsedDurationMinutes < 1)) {
      setInputValidationError("Input not allowed. Duration must be at least 1 minute.");
      setIsStartingExam(false);
      return;
    }

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
    };

    const session = buildMockExamSession(examSettings);

    if (session.questions.length === 0) {
      setStartError("No questions match your current filters. Try selecting more topics.");
      setIsStartingExam(false);
      return;
    }

    if (session.questions.length < safeQuestionCount) {
      setStartError(
        `Only ${session.questions.length} matching questions are available. Reduce the question count or broaden topic selection.`,
      );
      setIsStartingExam(false);
      return;
    }

    setStartError(null);
    clearMockExamResult();
    saveMockExamSession(session);
    setHasActiveSession(true);
    trackEvent('exam_started', {
      exam_type: examType,
      question_count: safeQuestionCount,
      timed: isTimed,
    })
    navigate("/mockexam");
  };

  const handleResumeExam = () => {
    setShowResumeModal(false);
    navigate("/mockexam");
  };

  const applyActualExamDefaults = () => {
    setIsTimed(true);
    setDurationInput(String(UI_LIMITS.defaultDurationMinutes));
    setQuestionCountInput(String(UI_LIMITS.defaultQuestionCount));
    setInstantAnswers(false);
    setSelectedTopics(allTopics);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((currentTopics) => {
      const isSelected = currentTopics.includes(topic);
      const nextTopics = isSelected
        ? currentTopics.filter((currentTopic) => currentTopic !== topic)
        : [...currentTopics, topic];

      if (nextTopics.length === 0) {
        setInputValidationError("You have to choose at least 1 topic.");
      }

      return nextTopics;
    });
  };

  const toggleCategory = (categoryName: CategoryName) => {
    const topicsInCategory: readonly string[] = categoryTopics[categoryName];

    setSelectedTopics((currentTopics) => {
      const hasAllTopics = topicsInCategory.every((topic) => currentTopics.includes(topic));
      const nextTopics = hasAllTopics
        ? currentTopics.filter((topic) => !topicsInCategory.includes(topic))
        : [...new Set([...currentTopics, ...topicsInCategory])];

      if (nextTopics.length === 0) {
        setInputValidationError("You have to choose at least 1 topic.");
      }

      return nextTopics;
    });
  };

  const renderCategoryFieldset = (categoryName: CategoryName) => {
    const topics = categoryTopics[categoryName];
    const isCategoryFullySelected = topics.every((topic) => selectedTopics.includes(topic));

    return (
      <fieldset key={categoryName} className="border-2 p-3 lg:p-4 dark:border-white/30">
        <div className="mb-3">
          <label className="inline-flex items-center gap-3 py-1 text-base lg:text-lg font-medium cursor-pointer">
            <input
              type="checkbox"
              className={formControlClassName}
              checked={isCategoryFullySelected}
              onChange={() => toggleCategory(categoryName)}
            />
            <span>{categoryName}</span>
          </label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {topics.map((topic) => (
            <label key={topic} className="flex items-center gap-3 py-1 text-sm lg:text-base cursor-pointer">
              <input
                type="checkbox"
                className={formControlClassName}
                checked={selectedTopics.includes(topic)}
                onChange={() => toggleTopic(topic)}
              />
              <span>{topic}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  };

  return (
    <>
      <Layout className="gap-10 select-none py-10 md:py-0">

        <div className="min-h-[78vh] w-full flex flex-col lg:flex-row items-center  justify-between px-6 lg:px-20 gap-10">
          
          <div className="flex flex-col gap-10 w-full lg:w-auto lg:items-start items-center">
            <h1 className="-tracking-widest text-6xl lg:text-8xl">You ready?</h1>
            <button
              type="button"
              onClick={() => handleStartExam()}
              disabled={isStartingExam}
              className="flex py-6 lg:py-8 items-center justify-center border-2 duration-300 group hover:bg-black dark:border-white dark:hover:bg-white cursor-pointer"
            >
              <h1 className="text-2xl w-50 group-hover:text-white font-bold group-hover:font-light duration-300 dark:text-white dark:group-hover:text-black">
                {isStartingExam ? "BUILDING..." : "LETS GO"}
              </h1>
            </button>
            {isStartingExam ? <LoadingSpinner label="Building exam session" /> : null}
          </div>

          <div className="border border-black dark:border-white h-[70vh] w-full lg:w-[52vw] flex flex-col overflow-hidden">
            <div className="flex md:gap-10 border-b-2 dark:border-white/30 py-7 md:py-0">
              
              <div className="p-4 lg:p-6 flex flex-col gap-4 flex-1">  
                <h1 className="font-light text-3xl">Exam Type</h1>
                <div className="w-full flex gap-3">
                  <button
                    type="button"
                    onClick={() => setExamType("AM EXAM")}
                    className={`font-medium text-base lg:text-xl px-4 py-2 border-2 flex-1 duration-200 cursor-pointer ${
                      examType === "AM EXAM" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white text-black dark:bg-zinc-950 dark:text-white"
                    }`}
                  >
                    AM EXAM
                  </button>
      
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center border-l-2 dark:border-white/30 gap-4 px-2">
                <p className="text-gray-700 dark:text-gray-300 text-center text-sm">
                  If you want an actual exam simulation settings:
                </p>
                <button
                  type="button"
                  onClick={applyActualExamDefaults}
                  className="border-2 py-2 px-4 font-extrabold duration-75 hover:bg-black hover:text-white hover:font-light cursor-pointer dark:border-white dark:hover:bg-white dark:hover:text-black"
                >
                  ACTUAL EXAM
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-7">
              <div className="flex flex-col md:flex-row md:justify-between gap-6 p-4">
                {/* TIMER */}
                <section className="flex flex-col gap-3 lg:flex-1">
                  <h2 className="text-2xl font-light">Timer</h2>
                  <div className="flex gap-5 items-center">
                    <label className="flex items-center gap-3 py-1 text-sm lg:text-base cursor-pointer">
                      <input
                        type="radio"
                        name="timed-mode"
                        className={formControlClassName}
                        checked={isTimed}
                        onChange={() => setIsTimed(true)}
                      />
                      Timed
                    </label>
                    <label className="flex items-center gap-3 py-1 text-sm lg:text-base cursor-pointer">
                      <input
                        type="radio"
                        name="timed-mode"
                        className={formControlClassName}
                        checked={!isTimed}
                        onChange={() => setIsTimed(false)}
                      />
                      Not timed
                    </label>
                  </div>
                  
                {/* NUMBER OF QUESTIONS */}
                  <label className="flex flex-col gap-2 w-1/2">
                    <span className="text-sm lg:text-base">Duration (minutes)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={durationInput}
                      onChange = {(e) => {
                        const value = e.target.value;

                        const numericOnly = value.replace(/\D/g, "");
                        setDurationInput(numericOnly);
                      }}
                      className="form-input"
                    />
                  </label>
                  <p className="text-xs opacity-70">Default: {UI_LIMITS.defaultDurationMinutes} minutes. Minimum: 1 minute.</p>
                </section>
                
                {/* QUESTIONS */}
                <section className="flex flex-col gap-3 lg:flex-1">
                  <h2 className="text-2xl font-light">Questions</h2>
                  <label className="flex flex-col gap-2 max-w-xs">
                    <span className="text-sm lg:text-base">How many questions?</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={questionCountInput}
                      onChange={(e) => {
                        const value = e.target.value;

                        const numericOnly = value.replace(/\D/g, "");
                        setQuestionCountInput(numericOnly);
                      }}
                      onBlur={() => {
                        const validationError = getQuestionCountValidationError(questionCountInput);
                        if (validationError) {
                          setInputValidationError(validationError);
                        }
                      }}
                      className="form-input"
                    />
                  </label>
                  <p className="text-xs opacity-70">Default: {UI_LIMITS.defaultQuestionCount} questions. Maximum: {UI_LIMITS.maxQuestionCount} questions.</p>
                </section>
              </div>
              
              <section className="flex flex-col gap-3 pb-2">
                <h2 className="text-2xl font-light">Answer Reveal</h2>
                <label className="flex items-center gap-3 py-1 text-sm lg:text-base cursor-pointer">
                  <input
                    type="checkbox"
                    className={formControlClassName}
                    checked={instantAnswers}
                    onChange={(event) => setInstantAnswers(event.target.checked)}
                  />
                  Show the correct answer instantly after each question
                </label>
              </section>

              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-light">Categories & Topics</h2>
                <p className="text-xs opacity-70">
                  Default: all topics selected. You can deselect all topics, but you need at least one to start.
                </p>

                {isStartingExam ? <SkeletonLoader lines={5} /> : null}

                <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
                  <div className="w-full">{renderCategoryFieldset("Technology")}</div>
                  <div className="w-full flex flex-col gap-4">
                    {renderCategoryFieldset("Management")}
                    {renderCategoryFieldset("Strategy")}
                  </div>
                </div>
              </section>

              
            </div>
          </div>
        </div>

      </Layout>

      {startError ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-start-error-title"
          onClick={closeStartErrorModal}
        >
          <div
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="mock-exam-start-error-title" className="text-2xl md:text-3xl font-bold mb-3 dark:text-white">
              Unable to Start Mock Exam
            </h2>
            <p className="text-sm md:text-base text-red-700 leading-relaxed">{startError}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeStartErrorModal}
                className="btn-outline px-5 py-2"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {inputValidationError ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-input-validation-title"
          onClick={closeInputValidationModal}
        >
          <div
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="mock-exam-input-validation-title" className="text-xl md:text-2xl font-bold mb-3 dark:text-white">
              Input Not Allowed
            </h2>
            <p className="text-sm md:text-base text-red-700 leading-relaxed">{inputValidationError}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeInputValidationModal}
                className="btn-outline px-5 py-2"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showResumeModal ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-resume-title"
          onClick={closeResumeModal}
        >
          <div
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="mock-exam-resume-title" className="text-2xl md:text-3xl font-bold mb-3 dark:text-white">
              Resume Mock Exam?
            </h2>
            <p className="text-sm md:text-base leading-relaxed opacity-80">
              You already have an active mock exam in progress. Continue where you left off, or start a new exam and replace it.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResumeExam}
                className="btn-solid px-5 py-2"
              >
                RESUME EXAM
              </button>
              <button
                type="button"
                onClick={() => handleStartExam(true)}
                className="btn-outline px-5 py-2"
              >
                START NEW EXAM
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
