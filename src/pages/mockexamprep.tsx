import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import Footer from "../components/footer";
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

// This is a temporary page to show the exam maker page
export default function MockExamPrepPage() {
  const navigate = useNavigate();
  const [examType, setExamType] = useState<"AM EXAM" | "PM EXAM">("AM EXAM");
  const [isTimed, setIsTimed] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(90);
  const [questionCount, setQuestionCount] = useState<number | ''>(80);
  const [instantAnswers, setInstantAnswers] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(allTopics);
  const [startError, setStartError] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(() => {
    const session = loadMockExamSession();
    return Boolean(session && session.questions.length > 0);
  });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const formControlClassName = "h-6 w-6 md:h-4 md:w-4 accent-black shrink-0 cursor-pointer";
  const closeStartErrorModal = () => setStartError(null);
  const closeResumeModal = () => setShowResumeModal(false);

  const handleStartExam = (forceStartNew = false) => {
    if (hasActiveSession && !forceStartNew) {
      setShowResumeModal(true);
      return;
    }

    if (forceStartNew) {
      clearMockExamSession();
      setHasActiveSession(false);
      setShowResumeModal(false);
    }
    
    if (questionCount === '') {
      setStartError("Please enter the number of questions");
      return;
    }
    
    if (durationMinutes === '') {
      setStartError("Please enter the timer duration");
      return;
    }
    
    const safeQuestionCount = questionCount;
    const safeDurationMin = durationMinutes;
    
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
      return;
    }

    if (session.questions.length < questionCount) {
      setStartError(
        `Only ${session.questions.length} matching questions are available. Reduce the question count or broaden topic selection.`,
      );
      return;
    }

    setStartError(null);
    clearMockExamResult();
    saveMockExamSession(session);
    setHasActiveSession(true);
    navigate("/mockexam");
  };

  const handleResumeExam = () => {
    setShowResumeModal(false);
    navigate("/mockexam");
  };

  const applyActualExamDefaults = () => {
    setIsTimed(true);
    setDurationMinutes(90);
    setQuestionCount(80);
    setInstantAnswers(false);
    setSelectedTopics(allTopics);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((currentTopics) => {
      const isSelected = currentTopics.includes(topic);

      if (isSelected) {
        // At least one topic should remain selected.
        if (currentTopics.length === 1) {
          return currentTopics;
        }

        return currentTopics.filter((currentTopic) => currentTopic !== topic);
      }

      return [...currentTopics, topic];
    });
  };

  const toggleCategory = (categoryName: CategoryName) => {
    const topicsInCategory: readonly string[] = categoryTopics[categoryName];

    setSelectedTopics((currentTopics) => {
      const hasAllTopics = topicsInCategory.every((topic) => currentTopics.includes(topic));

      if (hasAllTopics) {
        const remainingTopics = currentTopics.filter((topic) => !topicsInCategory.includes(topic));

        // Keep at least one selected topic across all categories.
        if (remainingTopics.length === 0) {
          return currentTopics;
        }

        return remainingTopics;
      }

      return [...new Set([...currentTopics, ...topicsInCategory])];
    });
  };

  const renderCategoryFieldset = (categoryName: CategoryName) => {
    const topics = categoryTopics[categoryName];
    const isCategoryFullySelected = topics.every((topic) => selectedTopics.includes(topic));

    return (
      <fieldset key={categoryName} className="border-2 p-3 lg:p-4">
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
      <div className="min-h-screen flex w-full flex-col items-center bg-white gap-10 select-none py-10 md:py-0">
        <NavBar></NavBar>

        <div className="min-h-[78vh] w-full flex flex-col lg:flex-row items-center  justify-between px-6 lg:px-20 gap-10">
          
          <div className="flex flex-col gap-10 w-full lg:w-auto lg:items-start items-center">
            <h1 className="-tracking-widest text-6xl lg:text-8xl">You ready?</h1>
            <button
              type="button"
              onClick={() => handleStartExam()}
              className="flex py-6 lg:py-8 items-center justify-center border-2 duration-300 group hover:bg-black cursor-pointer"
            >
              <h1 className="text-2xl w-50 group-hover:text-white font-bold group-hover:font-light duration-300">
                LETS GO
              </h1>
            </button>
          </div>

          <div className="border border-black h-[70vh] w-full lg:w-[52vw] flex flex-col overflow-hidden">
            <div className="flex md:gap-10 border-b-2 py-7 md:py-0">
              
              <div className="p-4 lg:p-6 flex flex-col gap-4 flex-1">  
                <h1 className="font-light text-3xl">Exam Type</h1>
                <div className="w-full flex gap-3">
                  <button
                    type="button"
                    onClick={() => setExamType("AM EXAM")}
                    className={`font-medium text-base lg:text-xl px-4 py-2 border-2 flex-1 duration-200 cursor-pointer ${
                      examType === "AM EXAM" ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    AM EXAM
                  </button>
      
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center border-l-2 gap-4 px-2">
                <p className="text-gray-700 text-center text-sm">
                  If you want an actual exam simulation settings:
                </p>
                <button
                  type="button"
                  onClick={applyActualExamDefaults}
                  className="border-2 py-2 px-4 font-extrabold duration-75 hover:bg-black hover:text-white hover:font-light cursor-pointer "
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
                      value={durationMinutes}
                      onChange = {(e) => {
                        const value = e.target.value;
                        
                        if (value === "") {
                          setDurationMinutes('');
                          return;
                        }
                        
                        if (!/^\d+$/.test(value)) {
                          return;
                        }
                        
                        const parsedCount = Number(value);
                        
                        const clamped = Math.min(180, Math.max(1, parsedCount));
                        
                        setDurationMinutes(clamped);
                      }}
                      className = "border-2 px-3 py-2"
                    />
                  </label>
                  <p className="text-xs opacity-70">Default: 90 minutes. Maximum: 180 minutes.</p>
                </section>
                
                {/* QUESTIONS */}
                <section className="flex flex-col gap-3 lg:flex-1">
                  <h2 className="text-2xl font-light">Questions</h2>
                  <label className="flex flex-col gap-2 max-w-xs">
                    <span className="text-sm lg:text-base">How many questions?</span>
                    <input
                      type="text"
                      value={questionCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        
                        if (value === "") {
                          setQuestionCount('');
                          return;
                        }
                        
                        if (!/^\d+$/.test(value)) {
                          return;
                        }
                        
                        const parsedCount = Number(value);
                        
                        const clamped = Math.min(100, Math.max(1, parsedCount));
                        
                        setQuestionCount(clamped);
                      }}
                      className = "border-2 px-3 py-2"
                    />
                  </label>
                  <p className="text-xs opacity-70">Default: 80 questions. Maximum: 100 questions.</p>
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
                  Default: all topics selected. At least one topic must stay selected.
                </p>

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

        <Footer></Footer>
      </div>

      {startError ? (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/45 backdrop-blur-md px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-start-error-title"
          onClick={closeStartErrorModal}
        >
          <div
            className="w-full max-w-xl border-2 border-black bg-white p-6 md:p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="mock-exam-start-error-title" className="text-2xl md:text-3xl font-bold mb-3">
              Unable to Start Mock Exam
            </h2>
            <p className="text-sm md:text-base text-red-700 leading-relaxed">{startError}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeStartErrorModal}
                className="border-2 border-black px-5 py-2 font-bold hover:bg-black hover:text-white transition-colors duration-200"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showResumeModal ? (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/45 backdrop-blur-md px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-exam-resume-title"
          onClick={closeResumeModal}
        >
          <div
            className="w-full max-w-xl border-2 border-black bg-white p-6 md:p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="mock-exam-resume-title" className="text-2xl md:text-3xl font-bold mb-3">
              Resume Mock Exam?
            </h2>
            <p className="text-sm md:text-base leading-relaxed opacity-80">
              You already have an active mock exam in progress. Continue where you left off, or start a new exam and replace it.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResumeExam}
                className="border-2 border-black bg-black text-white px-5 py-2 font-bold hover:bg-white hover:text-black transition-colors duration-200"
              >
                RESUME EXAM
              </button>
              <button
                type="button"
                onClick={() => handleStartExam(true)}
                className="border-2 border-black px-5 py-2 font-bold hover:bg-black hover:text-white transition-colors duration-200"
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
