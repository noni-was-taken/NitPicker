import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Layout from "../components/Layout";
import { categoryTopics, type CategoryName } from "../exam/mockExamModel";
import { normalizeLegacySymbols, normalizeMathDelimiters } from "../lib/textFormat";
import "katex/dist/katex.min.css";

type PreviousExamQuestion = {
  id: string;
  year: string;
  examCode: string;
  questionNumber: string;
  subjectTopic: string;
  subjectCategory: CategoryName | "Uncategorized";
  questionText: string;
  tableText: string | null;
  questionImagePath: string | null;
  options: { key: string; text: string }[];
  correctOption: string;
  correctOptionText: string | null;
  answerExplanation: string | null;
};

const shouldIgnoreSourcePath = (sourcePath: string): boolean => {
  const normalizedPath = sourcePath.replace(/\\/g, "/");
  const fileName = normalizedPath.split("/").pop()?.toLowerCase() ?? "";
  return fileName.endsWith("_questions.md");
};

const stripInlineMarkdown = (text: string): string =>
  text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\[\[(.*?)\]\]/g, "$1")
    .trim();

const normalizeSpaces = (text: string): string =>
  text.replace(/\s+/g, " ").trim();

const isVaultCommentLine = (line: string): boolean => {
  const trimmed = line.trim();
  return /^%%.*%%$/.test(trimmed) || trimmed === "%%";
};

const isString = (value: unknown): value is string => typeof value === "string";

const deriveCategoryFromTopic = (
  topic: string,
): CategoryName | "Uncategorized" => {
  const foundCategory = (Object.keys(categoryTopics) as CategoryName[]).find(
    (categoryName) =>
      categoryTopics[categoryName].some((knownTopic) => knownTopic === topic),
  );

  return foundCategory ?? "Uncategorized";
};

const topicByTag: Record<string, string> = {
  "number-systems": "Number Systems & Data Representation",
  "data-encoding": "Number Systems & Data Representation",
  sets: "Applied Mathematics",
  math: "Applied Mathematics",
  probability: "Applied Mathematics",
  statistics: "Applied Mathematics",
  algorithms: "Discrete Math & Algorithms",
  "data-structures": "Discrete Math & Algorithms",
  "automata-theory": "Discrete Math & Algorithms",
  hardware: "Computer Architecture & Hardware",
  "systems-architecture": "Computer Architecture & Hardware",
  "digital-logic": "Digital Logic",
  "operating-systems": "Operating Systems",
  software: "Software Engineering & Design",
  programming: "Software Engineering & Design",
  "object-oriented-programming": "Software Engineering & Design",
  "software-engineering": "Software Engineering & Design",
  "software-testing": "Software Testing",
  networking: "Networking",
  cybersecurity: "Cybersecurity",
  "web-technologies": "Emerging Technologies",
  devops: "IT Service Management (ITSM)",
  "service-management": "IT Service Management (ITSM)",
  "project-management": "Project Management",
  accounting: "Corporate Finance",
  "business-administration": "Business Strategy",
  "information-management": "System Strategy",
};

const genericTags = new Set([
  "math",
  "software",
  "programming",
  "business-administration",
]);

const inferTopicFromText = (text: string): string => {
  const normalized = text.toLowerCase();

  const rules: Array<[RegExp, string]> = [
    [
      /\b(hex|binary|octal|number base|floating point|twos complement)\b/i,
      "Number Systems & Data Representation",
    ],
    [
      /\b(probability|set|matrix|permutation|combination|statistics|expected value)\b/i,
      "Applied Mathematics",
    ],
    [
      /\b(algorithm|graph theory|sorting|search|automata|state transition)\b/i,
      "Discrete Math & Algorithms",
    ],
    [
      /\b(cpu|cache|memory|instruction|register|bus|clock)\b/i,
      "Computer Architecture & Hardware",
    ],
    [
      /\b(process|thread|paging|virtual memory|scheduler|deadlock|semaphore)\b/i,
      "Operating Systems",
    ],
    [
      /\b(boolean|karnaugh|truth table|logic circuit|flip-flop)\b/i,
      "Digital Logic",
    ],
    [/\b(render|pixel|vector|raster|3d|graphics)\b/i, "Computer Graphics"],
    [
      /\b(sql|database|normalization|relation|index|transaction)\b/i,
      "Databases",
    ],
    [/\b(tcp|ip|subnet|router|switch|dns|http|network)\b/i, "Networking"],
    [
      /\b(crypt|cipher|security|xss|csrf|malware|firewall|auth)\b/i,
      "Cybersecurity",
    ],
    [
      /\b(test case|white-box|black-box|integration test|unit test)\b/i,
      "Software Testing",
    ],
    [
      /\b(uml|class diagram|design pattern|refactor|object-oriented|programming)\b/i,
      "Software Engineering & Design",
    ],
    [
      /\b(cloud|iot|ai|machine learning|blockchain|emerging)\b/i,
      "Emerging Technologies",
    ],
    [
      /\b(project|wbs|gantt|critical path|pmbok|scope)\b/i,
      "Project Management",
    ],
    [
      /\b(incident|sla|service desk|change management|itil)\b/i,
      "IT Service Management (ITSM)",
    ],
    [/\b(audit|governance|compliance|control objective)\b/i, "System Auditing"],
    [/\b(quality|iso 9001|defect|qa|qc)\b/i, "Quality Management"],
    [
      /\b(npv|irr|roi|cash flow|balance sheet|accounting|finance)\b/i,
      "Corporate Finance",
    ],
    [
      /\b(strategy|marketing|business model|competitive|enterprise)\b/i,
      "Business Strategy",
    ],
    [
      /\b(information system strategy|systemization|roadmap|portfolio)\b/i,
      "System Strategy",
    ],
    [
      /\b(copyright|patent|license|trademark|intellectual property|law)\b/i,
      "Law & Intellectual Property",
    ],
    [
      /\b(digital transformation|dx|platform economy|digital trend)\b/i,
      "Digital Trends",
    ],
  ];

  const matched = rules.find(([pattern]) => pattern.test(normalized));
  return matched?.[1] ?? "Software Engineering & Design";
};

const extractTagsFromCategoryLine = (rawMarkdown: string): string[] => {
  const categoryLine = rawMarkdown.match(/^Category:\s*(.+)$/im)?.[1] ?? "";
  return [...categoryLine.matchAll(/#([a-z0-9-]+)/gi)].map((match) =>
    match[1].toLowerCase(),
  );
};

const mapTagsToTopic = (tags: string[], fallbackText: string): string => {
  const mappedTopics = tags
    .map((tag) => ({ tag, topic: topicByTag[tag] }))
    .filter((entry): entry is { tag: string; topic: string } =>
      isString(entry.topic),
    );

  const specific = mappedTopics.find((entry) => !genericTags.has(entry.tag));
  if (specific) {
    return specific.topic;
  }

  if (mappedTopics.length > 0) {
    return mappedTopics[0].topic;
  }

  return inferTopicFromText(fallbackText);
};

const parseOptionPrefix = (
  line: string,
): { key: string; text: string } | null => {
  const stripped = stripInlineMarkdown(line);
  const match = stripped.match(/^([A-Da-d])[.)]\s*(.+)$/);
  if (!match) {
    return null;
  }

  return {
    key: match[1].toUpperCase(),
    text: normalizeSpaces(match[2]),
  };
};

const parseCorrectOption = (rawAnswerLine: string): string | null => {
  const cleaned = stripInlineMarkdown(rawAnswerLine);
  if (!cleaned) {
    return null;
  }

  if (/[A-Za-z]\s*[,/]/.test(cleaned)) {
    return null;
  }

  const direct = cleaned.match(/^\(?([A-Da-d])\)?[.)]?\s*/);
  if (direct) {
    return direct[1].toUpperCase();
  }

  if (/^[A-Da-d]$/.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  return null;
};

const extractExplanationText = (linesAfterAnswer: string[]): string | null => {
  const explanationLines: string[] = [];

  for (const rawLine of linesAfterAnswer) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (
        explanationLines.length > 0 &&
        explanationLines[explanationLines.length - 1] !== ""
      ) {
        explanationLines.push("");
      }
      continue;
    }

    if (
      isVaultCommentLine(trimmed) ||
      /^---+$/.test(trimmed) ||
      /^#\s*References\b/i.test(trimmed)
    ) {
      break;
    }

    if (/^!\[\[/.test(trimmed)) {
      continue;
    }

    const cleaned = normalizeLegacySymbols(rawLine)
      .replace(/\[\[(.*?)\]\]/g, "$1")
      .trimEnd();

    if (cleaned.trim()) {
      explanationLines.push(cleaned);
    }
  }

  const explanation = explanationLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return explanation || null;
};

const parseVaultQuestion = (
  sourcePath: string,
  rawMarkdown: string,
): PreviousExamQuestion | null => {
  if (shouldIgnoreSourcePath(sourcePath)) {
    return null;
  }

  const normalizedPath = sourcePath.replace(/\\/g, "/");
  const lines = rawMarkdown.split(/\r?\n/);

  const year =
    normalizedPath.match(/\/philnits-vault\/(\d{4})\//)?.[1] ?? "Unknown";
  const headingIndex = lines.findIndex((line) => /^#\s+/.test(line.trim()));
  if (headingIndex < 0) {
    return null;
  }

  const heading = lines[headingIndex].trim();
  const headingId =
    heading.match(/^#\s+([A-Za-z0-9._-]+)/)?.[1] ?? "unknown-question";

  const delimiterIndex = lines.findIndex(
    (line, index) => index > headingIndex && /^\?\s*$/.test(line.trim()),
  );
  if (delimiterIndex < 0) {
    return null;
  }

  const answerLineIndex = lines.findIndex(
    (line, index) => index > delimiterIndex && line.trim().length > 0,
  );
  if (answerLineIndex < 0) {
    return null;
  }

  const answerLine = lines[answerLineIndex] ?? "";
  const correctOption = parseCorrectOption(answerLine);
  if (!correctOption) {
    return null;
  }

  const bodyLines = lines.slice(headingIndex + 1, delimiterIndex);

  // Detect and extract markdown tables from the question body.
  const tableLineRanges: Array<{ start: number; end: number }> = [];
  let tableStart = -1;
  for (let i = 0; i < bodyLines.length; i++) {
    const trimmed = bodyLines[i].trim();
    const isTableLine = /^\|.+\|$/.test(trimmed) || (/^[\s|:|-]+$/.test(trimmed) && trimmed.includes("|") && trimmed.includes("-"));
    if (isTableLine) {
      if (tableStart < 0) {
        tableStart = i;
      }
    } else if (tableStart >= 0) {
      tableLineRanges.push({ start: tableStart, end: i - 1 });
      tableStart = -1;
    }
  }
  if (tableStart >= 0) {
    tableLineRanges.push({ start: tableStart, end: bodyLines.length - 1 });
  }

  const tableLineIndices = new Set<number>();
  const tableChunks: string[] = [];
  for (const range of tableLineRanges) {
    if (range.end - range.start >= 1) {
      const chunk = bodyLines.slice(range.start, range.end + 1).map((l) => l.trimEnd()).join("\n");
      tableChunks.push(chunk);
      for (let i = range.start; i <= range.end; i++) {
        tableLineIndices.add(i);
      }
    }
  }

  const tableText = tableChunks.length > 0 ? tableChunks.join("\n\n") : null;

  const questionParts: string[] = [];
  const options: { key: string; text: string }[] = [];
  let currentOptionIndex = -1;
  let firstImagePath: string | null = null;

  bodyLines.forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();
    if (!line || isVaultCommentLine(line)) {
      return;
    }

    // Capture Obsidian-style image embeds and keep only the first image path.
    const embedImageMatch = line.match(/^!\[\[([^\]]+)\]\]$/);
    if (embedImageMatch) {
      if (!firstImagePath) {
        const normalizedPath = sourcePath.replace(/\\/g, "/");
        const sourceDir = normalizedPath.split("/").slice(0, -1).join("/");
        const rootRelative = `${sourceDir}/${embedImageMatch[1].trim().replace(/\\/g, "/")}`
          .replace(/^(?:\.\.\/)+/, "/")
          .replace(/^\.\//, "/");
        firstImagePath = rootRelative.startsWith("/") ? rootRelative : `/${rootRelative}`;
      }
      return;
    }

    // Skip lines that belong to an extracted table.
    if (tableLineIndices.has(lineIndex)) {
      return;
    }

    // Detect inline bracket image references like [2025A_FE-S_4.png]
    const inlineImageMatch = line.match(/^\[([^\]]+\.(?:png|jpg|jpeg|gif|webp|svg))\]$/i);
    if (inlineImageMatch) {
      if (!firstImagePath) {
        const normalizedPath = sourcePath.replace(/\\/g, "/");
        const sourceDir = normalizedPath.split("/").slice(0, -1).join("/");
        const rootRelative = `${sourceDir}/images/${inlineImageMatch[1]}`
          .replace(/^(?:\.\.\/)+/, "/")
          .replace(/^\.\//, "/");
        firstImagePath = rootRelative.startsWith("/") ? rootRelative : `/${rootRelative}`;
      }
      return;
    }

    const parsedOption = parseOptionPrefix(line);
    if (parsedOption) {
      options.push(parsedOption);
      currentOptionIndex = options.length - 1;
      return;
    }

    if (currentOptionIndex >= 0) {
      const continuedText = normalizeSpaces(stripInlineMarkdown(line));
      if (continuedText) {
        options[currentOptionIndex] = {
          ...options[currentOptionIndex],
          text: `${options[currentOptionIndex].text} ${continuedText}`.trim(),
        };
      }
      return;
    }

    const cleanedQuestionLine = normalizeSpaces(stripInlineMarkdown(line));
    if (cleanedQuestionLine) {
      questionParts.push(cleanedQuestionLine);
    }
  });

  const questionText = normalizeLegacySymbols(questionParts.join(" "));
  if (!questionText) {
    return null;
  }

  const split = headingId.match(/^(.*?)[_-](\d+(?:\.\d+)?)$/);
  const examCode = split?.[1] ?? headingId;
  const questionNumber = split?.[2] ?? headingId;
  const categoryTags = extractTagsFromCategoryLine(rawMarkdown);
  const subjectTopic = mapTagsToTopic(categoryTags, questionText);
  const subjectCategory = deriveCategoryFromTopic(subjectTopic);
  const answerExplanation = extractExplanationText(
    lines.slice(answerLineIndex + 1),
  );
  const correctChoice = options.find((choice) => choice.key === correctOption);

  return {
    id: `${normalizedPath}::${headingId}`,
    year,
    examCode,
    questionNumber,
    subjectTopic,
    subjectCategory,
    questionText,
    tableText,
    questionImagePath: firstImagePath,
    options,
    correctOption,
    correctOptionText: correctChoice?.text ?? null,
    answerExplanation,
  };
};

const compareQuestionNumbers = (a: string, b: string): number => {
  const numericA = Number(a);
  const numericB = Number(b);

  if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) {
    return numericA - numericB;
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
};

const vaultMarkdownModules = import.meta.glob("../../philnits-vault/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const parsedQuestions = Object.entries(vaultMarkdownModules)
  .map(([sourcePath, rawMarkdown]) =>
    parseVaultQuestion(sourcePath, rawMarkdown),
  )
  .filter((entry): entry is PreviousExamQuestion => Boolean(entry));

const groupedQuestionsByYear = Object.entries(
  parsedQuestions.reduce<Record<string, PreviousExamQuestion[]>>(
    (accumulator, question) => {
      if (!accumulator[question.year]) {
        accumulator[question.year] = [];
      }

      accumulator[question.year].push(question);
      return accumulator;
    },
    {},
  ),
)
  .map(([year, questions]) => ({
    year,
    questions: [...questions].sort((first, second) =>
      compareQuestionNumbers(first.questionNumber, second.questionNumber),
    ),
  }))
  .sort((first, second) =>
    second.year.localeCompare(first.year, undefined, { numeric: true }),
  );

export default function PreviousExamsPage() {
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>(
    {},
  );

  const toggleYear = (year: string) => {
    setOpenYears((current) => ({
      ...current,
      [year]: !current[year],
    }));
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions((current) => ({
      ...current,
      [questionId]: !current[questionId],
    }));
  };

  return (
    <Layout className="dark:text-white gap-8 md:gap-10 select-none py-8 md:py-0">

        <main className="w-full px-4 md:px-10 lg:px-20 xl:px-28 pb-8 md:pb-12">
          <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl md:text-5xl font-light">
              Previous Exam Questions
            </h1>
            <p className="mt-3 text-sm md:text-base opacity-75 max-w-3xl">
              All of the questions by year, taken from{" "}
              <a
                href="https://github.com/usc-cisco/philnits-vault"
                className="underline text-black dark:text-white"
              >
                philnits-vault
              </a>{" "}
              <br></br>
              These are the questions used in the mock exam simulation
            </p>

            <div className="mt-6 md:mt-8 flex flex-col gap-4">
              {groupedQuestionsByYear.map((entry) => {
                const isYearOpen = Boolean(openYears[entry.year]);

                return (
                  <section
                    key={entry.year}
                    className="border-2 border-black/20 dark:border-white/20"
                  >
                    <button
                      type="button"
                      onClick={() => toggleYear(entry.year)}
                      className="w-full px-4 py-3 md:px-5 md:py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-xl md:text-2xl font-bold">
                          {entry.year}
                        </h2>
                        <p className="text-sm md:text-base opacity-70">
                          {entry.questions.length} questions
                        </p>
                      </div>
                      <CaretDownIcon
                        className={`h-5 w-5 transition-transform duration-300 ${isYearOpen ? "rotate-180" : "rotate-0"}`}
                        weight="bold"
                      ></CaretDownIcon>
                    </button>

                    <AnimatePresence initial={false}>
                      {isYearOpen ? (
                        <motion.div
                          key={`${entry.year}-panel`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="border-t border-black/20 dark:border-white/20 overflow-hidden"
                        >
                          <div className="p-3 md:p-4 flex flex-col gap-3">
                            {entry.questions.map((question) => {
                              const isQuestionOpen = Boolean(
                                openQuestions[question.id],
                              );

                              return (
                                <article
                                  key={question.id}
                                  className="border border-black/20 dark:border-white/20 bg-white dark:bg-zinc-900"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleQuestion(question.id)}
                                    className="w-full px-3 py-3 md:px-4 md:py-4 text-left flex items-start justify-between gap-3"
                                  >
                                    <div className="flex flex-col gap-1">
                                      <p className="text-sm md:text-base font-bold">
                                        Q{question.questionNumber} ·{" "}
                                        {question.examCode} ·{" "}
                                        {question.subjectCategory}
                                      </p>
                                      <div className="text-sm md:text-base leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                                        <ReactMarkdown
                                          remarkPlugins={[
                                            remarkGfm,
                                            remarkMath,
                                          ]}
                                          rehypePlugins={[rehypeKatex]}
                                        >
                                          {normalizeMathDelimiters(
                                            normalizeLegacySymbols(
                                              question.questionText,
                                            ),
                                          )}
                                        </ReactMarkdown>
                                      </div>
                                      {question.tableText ? (
                                        <div className="question-table-wrap mt-2 border border-black/25 dark:border-white/25 bg-black/2 dark:bg-white/5 p-2 md:p-3 overflow-x-auto">
                                          <div className="text-xs md:text-sm leading-relaxed">
                                            <ReactMarkdown
                                              remarkPlugins={[remarkGfm]}
                                            >
                                              {question.tableText}
                                            </ReactMarkdown>
                                          </div>
                                        </div>
                                      ) : null}
                                      {question.questionImagePath ? (
                                        <div className="question-image-container mt-2 border border-black/25 dark:border-white/25 bg-black/2 dark:bg-white/5 overflow-hidden">
                                          <img
                                            src={question.questionImagePath}
                                            alt={`Diagram for question ${question.questionNumber}`}
                                            className="max-w-full h-auto block"
                                            onError={(e) => {
                                              const target = e.currentTarget;
                                              target.style.display = "none";
                                              const placeholder = target.nextElementSibling as HTMLElement | null;
                                              if (placeholder) placeholder.style.display = "flex";
                                            }}
                                          />
                                          <div
                                            className="hidden items-center justify-center p-4 text-xs opacity-60 gap-2"
                                            style={{ display: "none" }}
                                          >
                                            <span>📷</span>
                                            <span>Image pending: {question.questionImagePath.split("/").pop()}</span>
                                          </div>
                                        </div>
                                      ) : null}
                                      <p className="text-xs md:text-sm opacity-70">
                                        Topic: {question.subjectTopic}
                                      </p>
                                    </div>
                                    <CaretDownIcon
                                      className={`h-4 w-4 mt-1 shrink-0 transition-transform duration-300 ${
                                        isQuestionOpen
                                          ? "rotate-180"
                                          : "rotate-0"
                                      }`}
                                      weight="bold"
                                    ></CaretDownIcon>
                                  </button>

                                  <AnimatePresence initial={false}>
                                    {isQuestionOpen ? (
                                      <motion.div
                                        key={`${question.id}-panel`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                          duration: 0.22,
                                          ease: "easeInOut",
                                        }}
                                        className="border-t border-black/10 dark:border-white/10 overflow-hidden"
                                      >
                                        <div className="px-3 pb-4 md:px-4">
                                          {question.options.length > 0 ? (
                                            <div className="pt-3 flex flex-col gap-2">
                                              <p className="text-xs uppercase tracking-wide opacity-70">
                                                Choices
                                              </p>
                                              {question.options.map(
                                                (option) => (
                                                  <div
                                                    key={`${question.id}-${option.key}`}
                                                    className="text-sm md:text-base"
                                                  >
                                                    <span className="font-semibold">
                                                      {option.key}.
                                                    </span>{" "}
                                                    <div className="inline-block align-top prose prose-sm max-w-none prose-p:my-0">
                                                      <ReactMarkdown
                                                        remarkPlugins={[
                                                          remarkGfm,
                                                          remarkMath,
                                                        ]}
                                                        rehypePlugins={[
                                                          rehypeKatex,
                                                        ]}
                                                      >
                                                        {normalizeMathDelimiters(
                                                          normalizeLegacySymbols(
                                                            option.text,
                                                          ),
                                                        )}
                                                      </ReactMarkdown>
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          ) : null}

                                          <div className="mt-3 border-l-4 border-green-700 pl-3">
                                            <p className="text-xs uppercase tracking-wide opacity-70">
                                              Correct Answer
                                            </p>
                                            <div className="text-sm md:text-base text-green-700 font-semibold mt-1 prose prose-sm max-w-none prose-p:my-0">
                                              <ReactMarkdown
                                                remarkPlugins={[
                                                  remarkGfm,
                                                  remarkMath,
                                                ]}
                                                rehypePlugins={[rehypeKatex]}
                                              >
                                                {normalizeMathDelimiters(
                                                  normalizeLegacySymbols(
                                                    `${question.correctOption}${question.correctOptionText ? ` - ${question.correctOptionText}` : ""}`,
                                                  ),
                                                )}
                                              </ReactMarkdown>
                                            </div>
                                          </div>

                                          <div className="mt-3 border-l-4 border-black dark:border-white pl-3">
                                            <p className="text-xs uppercase tracking-wide opacity-70">
                                              How to answer it
                                            </p>
                                            <div className="text-sm md:text-base mt-1 leading-relaxed prose prose-sm max-w-none">
                                              {question.answerExplanation ? (
                                                <ReactMarkdown
                                                  remarkPlugins={[
                                                    remarkGfm,
                                                    remarkMath,
                                                  ]}
                                                  rehypePlugins={[rehypeKatex]}
                                                >
                                                  {normalizeMathDelimiters(
                                                    normalizeLegacySymbols(
                                                      question.answerExplanation,
                                                    ),
                                                  )}
                                                </ReactMarkdown>
                                              ) : (
                                                <p>
                                                  No detailed explanation
                                                  available in the source
                                                  markdown for this question.
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ) : null}
                                  </AnimatePresence>
                                </article>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </section>
                );
              })}
            </div>
          </div>
        </main>

    </Layout>
  );
}
