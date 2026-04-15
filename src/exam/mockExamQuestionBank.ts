import {
  allTopics,
  categoryTopics,
  type CategoryName,
  type MockExamQuestion,
  type MockExamSession,
  type MockExamSettings,
} from "./mockExamModel";

type ParsedVaultQuestion = {
  sourcePath: string;
  examType: MockExamSettings["examType"];
  examCode: string;
  questionNumber: string;
  questionText: string;
  optionLines: string[];
  correctOption: string;
  answerExplanation: string | null;
  subjectTopic: string;
  questionImagePath: string | null;
  containsMarkdownTable: boolean;
  tableMarkdown: string | null;
};

const isString = (value: unknown): value is string => typeof value === "string";

const normalizeLegacySymbols = (text: string): string =>
  text
    .replace(/\uF0AE|\uF0E0/g, "→")
    .replace(/\uF0DF/g, "←")
    .replace(/\uF0A3/g, "≤")
    .replace(/\uF0B3/g, "≥")
    .replace(/\uF0B8/g, "÷")
    .replace(/\uF0B4/g, "×")
    .replace(/\uF0B9/g, "≠");

const stripInlineMarkdown = (text: string): string =>
  text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\[\[(.*?)\]\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const normalizeSpaces = (text: string): string => text.replace(/\s+/g, " ").trim();

const isVaultCommentLine = (line: string): boolean => {
  const trimmed = line.trim();
  return /^%%.*%%$/.test(trimmed) || trimmed === "%%";
};

const deriveCategoryFromTopic = (topic: string): CategoryName | "Uncategorized" => {
  const foundCategory = (Object.keys(categoryTopics) as CategoryName[]).find((categoryName) =>
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

const genericTags = new Set(["math", "software", "programming", "business-administration"]);

const inferTopicFromText = (text: string): string => {
  const normalized = text.toLowerCase();

  const rules: Array<[RegExp, string]> = [
    [/\b(hex|binary|octal|number base|floating point|twos complement)\b/i, "Number Systems & Data Representation"],
    [/\b(probability|set|matrix|permutation|combination|statistics|expected value)\b/i, "Applied Mathematics"],
    [/\b(algorithm|graph theory|sorting|search|automata|state transition)\b/i, "Discrete Math & Algorithms"],
    [/\b(cpu|cache|memory|instruction|register|bus|clock)\b/i, "Computer Architecture & Hardware"],
    [/\b(process|thread|paging|virtual memory|scheduler|deadlock|semaphore)\b/i, "Operating Systems"],
    [/\b(boolean|karnaugh|truth table|logic circuit|flip-flop)\b/i, "Digital Logic"],
    [/\b(render|pixel|vector|raster|3d|graphics)\b/i, "Computer Graphics"],
    [/\b(sql|database|normalization|relation|index|transaction)\b/i, "Databases"],
    [/\b(tcp|ip|subnet|router|switch|dns|http|network)\b/i, "Networking"],
    [/\b(crypt|cipher|security|xss|csrf|malware|firewall|auth)\b/i, "Cybersecurity"],
    [/\b(test case|white-box|black-box|integration test|unit test)\b/i, "Software Testing"],
    [/\b(uml|class diagram|design pattern|refactor|object-oriented|programming)\b/i, "Software Engineering & Design"],
    [/\b(cloud|iot|ai|machine learning|blockchain|emerging)\b/i, "Emerging Technologies"],
    [/\b(project|wbs|gantt|critical path|pmbok|scope)\b/i, "Project Management"],
    [/\b(incident|sla|service desk|change management|itil)\b/i, "IT Service Management (ITSM)"],
    [/\b(audit|governance|compliance|control objective)\b/i, "System Auditing"],
    [/\b(quality|iso 9001|defect|qa|qc)\b/i, "Quality Management"],
    [/\b(npv|irr|roi|cash flow|balance sheet|accounting|finance)\b/i, "Corporate Finance"],
    [/\b(strategy|marketing|business model|competitive|enterprise)\b/i, "Business Strategy"],
    [/\b(information system strategy|systemization|roadmap|portfolio)\b/i, "System Strategy"],
    [/\b(copyright|patent|license|trademark|intellectual property|law)\b/i, "Law & Intellectual Property"],
    [/\b(digital transformation|dx|platform economy|digital trend)\b/i, "Digital Trends"],
  ];

  const matched = rules.find(([pattern]) => pattern.test(normalized));
  return matched?.[1] ?? "Software Engineering & Design";
};

const extractTagsFromCategoryLine = (rawMarkdown: string): string[] => {
  const categoryLine = rawMarkdown.match(/^Category:\s*(.+)$/im)?.[1] ?? "";
  const tags = [...categoryLine.matchAll(/#([a-z0-9-]+)/gi)].map((match) => match[1].toLowerCase());
  return tags;
};

const mapTagsToTopic = (tags: string[], fallbackText: string): string => {
  const mappedTopics = tags
    .map((tag) => ({ tag, topic: topicByTag[tag] }))
    .filter((entry): entry is { tag: string; topic: string } => isString(entry.topic));

  const specific = mappedTopics.find((entry) => !genericTags.has(entry.tag));
  if (specific) {
    return specific.topic;
  }

  if (mappedTopics.length > 0) {
    return mappedTopics[0].topic;
  }

  return inferTopicFromText(fallbackText);
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
      if (explanationLines.length > 0 && explanationLines[explanationLines.length - 1] !== "") {
        explanationLines.push("");
      }
      continue;
    }

    if (isVaultCommentLine(trimmed) || /^---+$/.test(trimmed) || /^#\s*References\b/i.test(trimmed)) {
      break;
    }

    if (/^!\[\[/.test(trimmed)) {
      continue;
    }

    const cleaned = normalizeLegacySymbols(stripInlineMarkdown(trimmed)).replace(/^#{1,6}\s*/, "").trim();
    if (cleaned) {
      explanationLines.push(cleaned);
    }
  }

  const explanation = explanationLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return explanation || null;
};

const requiresVisualContent = (
  questionText: string,
  optionLines: string[],
  questionImagePath: string | null,
  containsMarkdownTable: boolean,
  tableMarkdown: string | null,
): boolean => {
  // If the question has an inline image reference, it can render an image container — don't exclude it.
  if (questionImagePath) {
    return false;
  }

  // If the question has a markdown table, it can be rendered — don't exclude it.
  if (containsMarkdownTable && tableMarkdown) {
    return false;
  }

  const combined = `${questionText}\n${optionLines.join("\n")}`;
  return /\b(figure|diagram|graph|chart|flowchart|shown below|as shown|refer to the (?:following )?(?:figure|table)|legend|in the figure|in the table|see figure|see table)\b/i.test(combined);
};

const toQuestionImagePath = (sourcePath: string, imageFileName: string): string => {
  const normalizedFileName = imageFileName.trim().replace(/\\/g, "/");
  const sourceDir = sourcePath.split("/").slice(0, -1).join("/");
  const candidate = `${sourceDir}/${normalizedFileName}`;

  // The app currently resolves relative media from project root at runtime.
  return candidate.replace(/^\.\//, "");
};

const parseOptionPrefix = (line: string): { key: string; text: string } | null => {
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

const extractOptionsFromLines = (optionLines: string[]): { key: string; text: string }[] => {
  const byKey = new Map<string, string>();

  optionLines.forEach((line) => {
    const parsed = parseOptionPrefix(line);
    if (!parsed) {
      return;
    }

    byKey.set(parsed.key, parsed.text);
  });

  return ["A", "B", "C", "D"]
    .filter((key) => byKey.has(key))
    .map((key) => ({
      key,
      text: byKey.get(key) ?? "",
    }));
};

const parseMarkdownQuestion = (sourcePath: string, rawMarkdown: string): ParsedVaultQuestion | null => {
  const normalizedPath = sourcePath.replace(/\\/g, "/");
  const fileName = normalizedPath.split("/").pop() ?? "";
  const fileStem = fileName.replace(/\.md$/i, "");

  const lines = rawMarkdown.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => /^#\s+/.test(line.trim()));
  if (headingIndex < 0) {
    return null;
  }

  const headingLine = lines[headingIndex].trim();
  const headingId = headingLine.match(/^#\s+([A-Za-z0-9._-]+)/)?.[1] ?? fileStem;

  const delimiterIndex = lines.findIndex((line, index) => index > headingIndex && /^\?\s*$/.test(line.trim()));
  if (delimiterIndex < 0) {
    return null;
  }

  const answerLineIndex = lines.findIndex((line, index) => index > delimiterIndex && line.trim().length > 0);
  if (answerLineIndex < 0) {
    return null;
  }

  const answerLine = lines[answerLineIndex] ?? "";
  const correctOption = parseCorrectOption(answerLine);
  if (!correctOption) {
    return null;
  }

  const answerExplanation = extractExplanationText(lines.slice(answerLineIndex + 1));

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
    // A valid markdown table needs at least a header row and a separator row.
    if (range.end - range.start >= 1) {
      const chunk = bodyLines.slice(range.start, range.end + 1).map((l) => l.trimEnd()).join("\n");
      tableChunks.push(chunk);
      for (let i = range.start; i <= range.end; i++) {
        tableLineIndices.add(i);
      }
    }
  }

  const containsMarkdownTable = tableChunks.length > 0;
  const tableMarkdown = containsMarkdownTable ? tableChunks.join("\n\n") : null;

  const questionParts: string[] = [];
  const optionLines: string[] = [];
  let firstImagePath: string | null = null;
  let currentOptionIndex = -1;

  bodyLines.forEach((rawLine, lineIndex) => {
    const line = rawLine.trim();
    if (!line) {
      return;
    }

    // Skip lines that belong to an extracted table.
    if (tableLineIndices.has(lineIndex)) {
      return;
    }

    if (isVaultCommentLine(line)) {
      return;
    }

    const imageMatch = line.match(/^!\[\[([^\]]+)\]\]$/);
    if (imageMatch) {
      if (!firstImagePath) {
        firstImagePath = toQuestionImagePath(normalizedPath, imageMatch[1]);
      }
      return;
    }

    // Detect inline bracket image references like [2025A_FE-S_4.png]
    const inlineImageMatch = line.match(/^\[([^\]]+\.(?:png|jpg|jpeg|gif|webp|svg))\]$/i);
    if (inlineImageMatch) {
      if (!firstImagePath) {
        // Build a root-relative URL: strip the leading ../../ from the vault glob path,
        // then replace the filename with images/<imagefile>.
        // e.g. ../../philnits-vault/2025/2025A_FE-S_4.md -> /philnits-vault/2025/images/2025A_FE-S_4.png
        const rootRelativeDir = normalizedPath
          .replace(/^\.\.\/\.\.\//, "/")
          .split("/")
          .slice(0, -1)
          .join("/");
        firstImagePath = `${rootRelativeDir}/images/${inlineImageMatch[1]}`;
      }
      return;
    }

    const option = parseOptionPrefix(line);
    if (option) {
      optionLines.push(`${option.key}. ${option.text}`);
      currentOptionIndex = optionLines.length - 1;
      return;
    }

    if (currentOptionIndex >= 0) {
      const continuedText = normalizeSpaces(stripInlineMarkdown(line));
      if (continuedText) {
        optionLines[currentOptionIndex] = `${optionLines[currentOptionIndex]} ${continuedText}`.trim();
      }
      return;
    }

    const cleanedQuestionLine = normalizeSpaces(stripInlineMarkdown(line));
    if (cleanedQuestionLine) {
      questionParts.push(cleanedQuestionLine);
    }
  });

  const questionText = normalizeLegacySymbols(questionParts.join(" "));
  if (!questionText || optionLines.length < 2) {
    return null;
  }

  const categoryTags = extractTagsFromCategoryLine(rawMarkdown);
  const subjectTopic = mapTagsToTopic(categoryTags, questionText);

  const examMarker = `${normalizedPath} ${headingId}`.toLowerCase();
  const examType: MockExamSettings["examType"] =
    /(^|[\\/])pm([\\/]|$)|_pm_|fe-b/.test(examMarker) ? "PM EXAM" : "AM EXAM";

  const split = headingId.match(/^(.*?)[_-](\d+(?:\.\d+)?)$/);
  const examCode = split?.[1] ?? fileStem;
  const questionNumber = split?.[2] ?? headingId;

  return {
    sourcePath: normalizedPath,
    examType,
    examCode,
    questionNumber,
    questionText,
    optionLines,
    correctOption,
    answerExplanation,
    subjectTopic,
    questionImagePath: firstImagePath,
    containsMarkdownTable,
    tableMarkdown,
  };
};

const vaultMarkdownModules = import.meta.glob("../../philnits-vault/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const parsedVaultQuestions: ParsedVaultQuestion[] = Object.entries(vaultMarkdownModules)
  .map(([sourcePath, rawMarkdown]) => parseMarkdownQuestion(sourcePath, rawMarkdown))
  .filter((entry): entry is ParsedVaultQuestion => Boolean(entry));

const buildQuestionPool = (settings: MockExamSettings): MockExamQuestion[] => {
  const selectedTopics = new Set(settings.selectedTopics);

  return parsedVaultQuestions
    .filter((question) => question.examType === settings.examType)
    .filter((question) => selectedTopics.has(question.subjectTopic))
    .filter((question) => !requiresVisualContent(question.questionText, question.optionLines, question.questionImagePath, question.containsMarkdownTable, question.tableMarkdown))
    .map<MockExamQuestion | null>((question, index) => {
      const options = extractOptionsFromLines(question.optionLines);
      if (options.length !== 4) {
        return null;
      }

      if (!["A", "B", "C", "D"].includes(question.correctOption)) {
        return null;
      }

      const subjectCategory = deriveCategoryFromTopic(question.subjectTopic);
      return {
        id: `${question.examCode}::${question.questionNumber}::${index}`,
        pdfName: `${question.examCode}.md`,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        tableText: question.tableMarkdown,
        questionImagePath: question.questionImagePath,
        options: options.map((option) => ({
          key: option.key,
          text: option.text,
          imagePath: null as string | null,
        })),
        correctOption: question.correctOption,
        answerExplanation: question.answerExplanation,
        subjectCategory,
        subjectTopic: question.subjectTopic,
      } satisfies MockExamQuestion;
    })
    .filter((question): question is MockExamQuestion => question !== null);
};

const shuffleQuestions = <T>(items: T[]): T[] => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temporary = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = temporary;
  }

  return result;
};

export const buildMockExamSession = (settings: MockExamSettings): MockExamSession => {
  const pool = buildQuestionPool(settings);
  const selectedQuestions = shuffleQuestions(pool).slice(0, Math.min(pool.length, settings.questionCount));

  return {
    sessionId: `mock-session-${Date.now()}`,
    createdAtMs: Date.now(),
    startedAtMs: Date.now(),
    settings,
    questions: selectedQuestions,
    currentQuestionIndex: 0,
    answers: {},
    hintsUsed: 0,
  };
};

export const getEligibleQuestionCount = (settings: MockExamSettings): number => buildQuestionPool(settings).length;

export const getAllAvailableTopics = (): string[] => [...allTopics];
