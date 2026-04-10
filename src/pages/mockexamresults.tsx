import NavBar from "../components/navbar";
import Footer from "../components/footer";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useNavigate } from "react-router-dom";
import { formatClockFromSeconds, loadMockExamResult } from "../exam/mockExamModel";
import "katex/dist/katex.min.css";

const PASSING_PERCENTAGE = 60;

const normalizeLegacySymbols = (text: string): string =>
    text
        .replace(/\uF0AE|\uF0E0/g, "→")
        .replace(/\uF0DF/g, "←")
        .replace(/\uF0A3/g, "≤")
        .replace(/\uF0B3/g, "≥")
        .replace(/\uF0B8/g, "÷")
        .replace(/\uF0B4/g, "×")
        .replace(/\uF0B9/g, "≠");

const normalizeMathDelimiters = (text: string): string =>
    text
        .replace(/\\\((.+?)\\\)/gs, (_, expression: string) => `$${expression}$`)
        .replace(/\\\[(.+?)\\\]/gs, (_, expression: string) => `$$${expression}$$`);

export default function MockExamResultsPage() {
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [openWrongQuestions, setOpenWrongQuestions] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();
    const result = loadMockExamResult();

    if (!result) {
        return (
            <>
                <div className="py-10 md:py-0 min-h-screen flex w-full flex-col items-center bg-white dark:bg-zinc-950 dark:text-white gap-6 md:gap-10 select-none">
                    <NavBar></NavBar>
                    <div className="flex-1 w-full flex items-center justify-center px-6 md:px-20">
                        <div className="border-2 border-black dark:border-white p-8 md:p-10 w-full max-w-xl flex flex-col items-center gap-6 text-center">
                            <h1 className="text-3xl md:text-4xl font-bold">No exam result found</h1>
                            <p className="text-sm md:text-base opacity-75">Take a mock exam first so this page can display your score and breakdown.</p>
                            <button
                                type="button"
                                onClick={() => navigate("/mockexamprep")}
                                className="border-2 border-black px-6 py-3 font-bold hover:bg-black hover:text-white transition-colors duration-200 dark:border-white dark:hover:bg-white dark:hover:text-black"
                            >
                                GO TO MOCK EXAM PREP
                            </button>
                        </div>
                    </div>
                    <Footer></Footer>
                </div>
            </>
        );
    }

    const totalTime = formatClockFromSeconds(result.totalTimeSeconds, true);
    const averageTimePerQuestion = formatClockFromSeconds(result.averageTimePerQuestionSeconds, false);
    const rawScorePercentage = result.totalQuestions === 0 ? 0 : (result.correctAnswers / result.totalQuestions) * 100;
    const scorePercentage = Number(rawScorePercentage.toFixed(1));
    const didPass = rawScorePercentage >= PASSING_PERCENTAGE;
    const wrongQuestions = result.wrongQuestions ?? [];

    const toggleCategory = (categoryName: string) => {
        setOpenCategories((current) => ({
            ...current,
            [categoryName]: !current[categoryName],
        }));
    };

    const toggleWrongQuestion = (questionId: string) => {
        setOpenWrongQuestions((current) => ({
            ...current,
            [questionId]: !current[questionId],
        }));
    };

    return (
        <>
            <div className="py-10 md:py-0 md:min-h-screen flex md:w-full flex-col items-center bg-white dark:bg-zinc-950 dark:text-white gap-4 md:gap-10 select-none">
                <NavBar></NavBar>
                <div className="w-full min-h-[78vh] px-4 sm:px-6 md:px-10 lg:px-20 xl:px-32 pb-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                        <section className="flex flex-col items-stretch lg:items-start px-2 sm:px-4 md:px-10">
                            <div className="flex items-end gap-3 sm:gap-5">
                                <h1 className="text-7xl sm:text-8xl md:text-9xl leading-none font-bold">{result.correctAnswers}</h1>
                                <h1 className="font-semibold text-2xl sm:text-3xl text-black opacity-50 dark:text-white">/{result.totalQuestions}</h1>
                            </div>
                            <p className={`mt-3 text-lg sm:text-xl font-bold ${didPass ? "text-green-700" : "text-red-700"}`}>
                                {didPass ? `We did it bro (${PASSING_PERCENTAGE}% or higher)` : `NT tried bro (below ${PASSING_PERCENTAGE}%)`}
                            </p>

                            <div className="mt-6 md:mt-8 flex flex-col gap-4 md:gap-5 w-full lg:max-w-sm">
                                <div className="flex items-baseline justify-between border-b pb-2">
                                    <p className="text-sm uppercase tracking-wide opacity-60">Score</p>
                                    <p className="text-2xl sm:text-3xl font-bold">{result.correctAnswers}/{result.totalQuestions}</p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2">
                                    <p className="text-sm uppercase tracking-wide opacity-60">Score Percentage</p>
                                    <p className="text-2xl sm:text-3xl font-bold">{scorePercentage}%</p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2">
                                    <p className="text-sm uppercase tracking-wide opacity-60">Result</p>
                                    <p className={`text-2xl sm:text-3xl font-bold ${didPass ? "text-green-700" : "text-red-700"}`}>
                                        {didPass ? "Inom with Mam Pena" : "Cry to Mam Pena"}
                                    </p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2">
                                    <p className="text-sm uppercase tracking-wide opacity-60">Total Time</p>
                                    <p className="text-2xl sm:text-3xl font-bold">{totalTime}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3 w-full lg:max-w-md">
                                <h2 className="text-sm uppercase tracking-wide opacity-60">Exam Setup Summary</h2>
                                <div className="flex items-baseline justify-between border-b pb-2 gap-4">
                                    <p className="text-sm opacity-70">Exam Type</p>
                                    <p className="text-lg sm:text-xl font-bold text-right">{result.settings.examType}</p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2 gap-4">
                                    <p className="text-sm opacity-70">Timer</p>
                                    <p className="text-lg sm:text-xl font-bold text-right">{result.settings.isTimed ? "Timed" : "Not timed"}</p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2 gap-4">
                                    <p className="text-sm opacity-70">Duration</p>
                                    <p className="text-lg sm:text-xl font-bold text-right">
                                        {result.settings.isTimed ? `${result.settings.durationMinutes} mins` : "No limit"}
                                    </p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2 gap-4">
                                    <p className="text-sm opacity-70">Questions</p>
                                    <p className="text-lg sm:text-xl font-bold text-right">{result.totalQuestions}</p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2 gap-4">
                                    <p className="text-sm opacity-70">Answer Reveal</p>
                                    <p className="text-lg sm:text-xl font-bold text-right">{result.settings.instantAnswers ? "Instant" : "No reveal"}</p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2 gap-4">
                                    <p className="text-sm opacity-70">Categories</p>
                                    <p className="text-lg sm:text-xl font-bold text-right">
                                        {result.selectedCategories.length === 3 ? "All categories" : result.selectedCategories.join(", ")}
                                    </p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2 gap-4">
                                    <p className="text-sm opacity-70">Topics Selected</p>
                                    <p className="text-lg sm:text-xl font-bold text-right">{result.selectedTopicCount}</p>
                                </div>
                            </div>
                        </section>

                        <section className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
                            <h2 className="text-2xl sm:text-3xl font-light">Results Breakdown</h2>

                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm uppercase tracking-wide opacity-60">Correct Answers by Category</h3>
                                <div className="flex flex-col gap-3 pr-1">
                                    {result.categoryBreakdown.map((category) => {
                                        const isOpen = Boolean(openCategories[category.name]);

                                        return (
                                            <div key={category.name} className="border-b pb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCategory(category.name)}
                                                    className="w-full flex items-center justify-between cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-base md:text-lg">{category.name}</p>
                                                        <CaretDownIcon
                                                            className={`h-4 w-4 opacity-70 transition-transform duration-300 ease-out ${
                                                                isOpen ? "rotate-180" : "rotate-0"
                                                            }`}
                                                            weight="bold"
                                                        />
                                                    </div>
                                                    <p className="text-xl sm:text-2xl font-bold">{category.correct}/{category.total}</p>
                                                </button>
                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-out ${
                                                        isOpen ? "max-h-250 opacity-100" : "max-h-0 opacity-0"
                                                    }`}
                                                >
                                                    <ul className="mt-3 flex flex-col gap-2 text-sm md:text-base opacity-75">
                                                        {category.topics.map((topic) => (
                                                            <li key={`${category.name}-${topic.name}`} className="flex items-start sm:items-center justify-between gap-2 sm:gap-4 border-b border-black/10 pb-1">
                                                                <span className="pr-2">{topic.name}</span>
                                                                <span className="font-semibold whitespace-nowrap">{topic.correct}/{topic.total}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="mt-2 flex flex-col gap-3">
                                <div className="flex items-baseline justify-between border-b pb-2">
                                    <p className="text-sm uppercase tracking-wide opacity-60">Hints Used</p>
                                    <p className="text-xl sm:text-2xl font-bold">{result.hintsUsed}</p>
                                </div>
                                <div className="flex items-baseline justify-between border-b pb-2">
                                    <p className="text-sm uppercase tracking-wide opacity-60">Avg Time per Question</p>
                                    <p className="text-xl sm:text-2xl font-bold">{averageTimePerQuestion}</p>
                                </div>

                                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/mockexamprep")}
                                        className="w-full border-2 border-black bg-black text-white font-bold py-3 px-4 hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
                                    >
                                        TAKE TEST AGAIN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/")}
                                        className="w-full border-2 border-black bg-white text-black font-bold py-3 px-4 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer dark:border-white dark:bg-zinc-950 dark:text-white dark:hover:bg-white dark:hover:text-black"
                                    >
                                        GO HOME
                                    </button>
                                </div>
                            </div>

                            {/* WRONGED QUESTIONS SECTION */}
                            <div className="flex flex-col gap-4 mt-2">
                                <h3 className="text-sm uppercase tracking-wide opacity-60">Questions You Got Wrong</h3>
                                {wrongQuestions.length === 0 ? (
                                    <p className="text-sm border-l-4 border-green-700 text-green-700 pl-3">
                                        Perfect score. No incorrect questions.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {wrongQuestions.map((wrongQuestion, index) => {
                                            const isOpen = Boolean(openWrongQuestions[wrongQuestion.id]);

                                            return (
                                                <article key={wrongQuestion.id} className="border-2 border-black/20 dark:border-white/20 bg-white dark:bg-zinc-900">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleWrongQuestion(wrongQuestion.id)}
                                                        className="w-full p-3 md:p-4 text-left flex items-start justify-between gap-3"
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <p className="font-bold text-sm md:text-base">#{wrongQuestion.questionNumber} · {wrongQuestion.subjectTopic}</p>
                                                            <div className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                                                                <ReactMarkdown
                                                                    remarkPlugins={[remarkGfm, remarkMath]}
                                                                    rehypePlugins={[rehypeKatex]}
                                                                >
                                                                    {normalizeMathDelimiters(normalizeLegacySymbols(wrongQuestion.questionText))}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                                            <p className="text-xs md:text-sm opacity-60">Missed {index + 1}</p>
                                                            <CaretDownIcon
                                                                className={`h-4 w-4 opacity-70 transition-transform duration-300 ease-out ${
                                                                    isOpen ? "rotate-180" : "rotate-0"
                                                                }`}
                                                                weight="bold"
                                                            />
                                                        </div>
                                                    </button>

                                                    <div
                                                        className={`overflow-hidden transition-all duration-300 ease-out ${
                                                            isOpen ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0"
                                                        }`}
                                                    >
                                                        <div className="px-3 md:px-4 pb-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-3">
                                                            <div className="pt-3 flex flex-col gap-2 text-sm md:text-base">
                                                                <div>
                                                                    <p><span className="font-semibold">Your answer:</span></p>
                                                                    <div className="prose prose-sm max-w-none prose-p:my-0">
                                                                        {wrongQuestion.selectedOption ? (
                                                                            <ReactMarkdown
                                                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                                                rehypePlugins={[rehypeKatex]}
                                                                            >
                                                                                {normalizeMathDelimiters(
                                                                                    normalizeLegacySymbols(
                                                                                        `${wrongQuestion.selectedOption}${wrongQuestion.selectedOptionText ? ` - ${wrongQuestion.selectedOptionText}` : ""}`,
                                                                                    ),
                                                                                )}
                                                                            </ReactMarkdown>
                                                                        ) : (
                                                                            <p>No answer selected</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-green-700">
                                                                    <p><span className="font-semibold">Correct answer:</span></p>
                                                                    <div className="prose prose-sm max-w-none prose-p:my-0">
                                                                        <ReactMarkdown
                                                                            remarkPlugins={[remarkGfm, remarkMath]}
                                                                            rehypePlugins={[rehypeKatex]}
                                                                        >
                                                                            {normalizeMathDelimiters(
                                                                                normalizeLegacySymbols(
                                                                                    `${wrongQuestion.correctOption}${wrongQuestion.correctOptionText ? ` - ${wrongQuestion.correctOptionText}` : ""}`,
                                                                                ),
                                                                            )}
                                                                        </ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="border-l-4 border-black pl-3 max-h-72 overflow-y-auto
                                                                [&::-webkit-scrollbar]:w-[6px]
                                                                [&::-webkit-scrollbar-track]:bg-transparent
                                                                [&::-webkit-scrollbar-thumb]:bg-black"
                                                                 style={{scrollbarColor: "black transparent", scrollbarWidth: "auto", direction: "rtl"}}
                                                            >
                                                                <div style={{direction: "ltr"}}>
                                                                    <p className="text-xs uppercase tracking-wide opacity-70 font-semibold">How to answer it</p>
                                                                    <div className="mt-1 text-sm md:text-base leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                                                                        {wrongQuestion.answerExplanation ? (
                                                                            <ReactMarkdown
                                                                                remarkPlugins={[remarkGfm, remarkMath]}
                                                                                rehypePlugins={[rehypeKatex]}
                                                                            >
                                                                                {normalizeMathDelimiters(normalizeLegacySymbols(wrongQuestion.answerExplanation))}
                                                                            </ReactMarkdown>
                                                                        ) : (
                                                                            <p>No detailed explanation available in the source markdown for this item.</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            
                        </section>
                    </div>
                </div>
                <Footer></Footer>
            </div>
        </>
    );
}