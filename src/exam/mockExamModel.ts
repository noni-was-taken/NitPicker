export const categoryTopics = {
  Technology: [
    "Number Systems & Data Representation",
    "Applied Mathematics",
    "Discrete Math & Algorithms",
    "Computer Architecture & Hardware",
    "Operating Systems",
    "Digital Logic",
    "Computer Graphics",
    "Databases",
    "Networking",
    "Cybersecurity",
    "Software Engineering & Design",
    "Software Testing",
    "Emerging Technologies",
  ],
  Management: [
    "Project Management",
    "IT Service Management (ITSM)",
    "System Auditing",
    "Quality Management",
    "Corporate Finance",
  ],
  Strategy: [
    "Business Strategy",
    "System Strategy",
    "Law & Intellectual Property",
    "Digital Trends",
  ],
} as const;

export type CategoryName = keyof typeof categoryTopics;
export type ExamType = "AM EXAM" | "PM EXAM";

export const allTopics: string[] = Object.values(categoryTopics).flat();

export type MockExamSettings = {
  examType: ExamType;
  isTimed: boolean;
  durationMinutes: number;
  questionCount: number;
  instantAnswers: boolean;
  selectedTopics: string[];
};

export type MockExamOption = {
  key: string;
  text: string;
  imagePath: string | null;
};

export type MockExamQuestion = {
  id: string;
  pdfName: string;
  sourceYear: string;
  questionNumber: string;
  questionText: string;
  tableText: string | null;
  questionImagePath: string | null;
  options: MockExamOption[];
  correctOption: string;
  answerExplanation: string | null;
  subjectCategory: string;
  subjectTopic: string;
};

export type MockExamSession = {
  schemaVersion: number;
  sessionId: string;
  createdAtMs: number;
  startedAtMs: number;
  settings: MockExamSettings;
  questions: MockExamQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  hintsUsed: number;
};

export type TopicBreakdown = {
  name: string;
  correct: number;
  total: number;
};

export type CategoryBreakdown = {
  name: string;
  correct: number;
  total: number;
  topics: TopicBreakdown[];
};

export type WrongQuestionReview = {
  id: string;
  sourceYear: string;
  questionNumber: string;
  subjectTopic: string;
  questionText: string;
  selectedOption: string | null;
  selectedOptionText: string | null;
  correctOption: string;
  correctOptionText: string | null;
  answerExplanation: string | null;
};

export type MockExamResult = {
  completedAtMs: number;
  settings: MockExamSettings;
  sourceYears: string[];
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSeconds: number;
  averageTimePerQuestionSeconds: number;
  hintsUsed: number;
  selectedCategories: string[];
  selectedTopicCount: number;
  categoryBreakdown: CategoryBreakdown[];
  wrongQuestions: WrongQuestionReview[];
};

const SESSION_STORAGE_KEY = "ofa.mockExam.currentSession";
const RESULT_STORAGE_KEY = "ofa.mockExam.latestResult";
const SESSION_SCHEMA_VERSION = 3;

const extractYearFromText = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const matchedYear = value.match(/\b(19|20)\d{2}\b/)?.[0];
  return matchedYear ?? null;
};

const resolveQuestionSourceYear = (question: Pick<MockExamQuestion, "id" | "pdfName" | "sourceYear">): string => {
  const explicitSourceYear = typeof question.sourceYear === "string" ? question.sourceYear.trim() : "";
  if (explicitSourceYear) {
    return explicitSourceYear;
  }

  return extractYearFromText(question.pdfName) ?? extractYearFromText(question.id) ?? "Unknown";
};

type LegacyWrongQuestionReview = Omit<WrongQuestionReview, "sourceYear"> & {
  sourceYear?: string;
};

type LegacyMockExamResult = Omit<MockExamResult, "sourceYears" | "wrongQuestions"> & {
  sourceYears?: string[];
  wrongQuestions?: LegacyWrongQuestionReview[];
};

const migrateMockExamResult = (result: LegacyMockExamResult): MockExamResult => {
  const normalizedWrongQuestions: WrongQuestionReview[] = (result.wrongQuestions ?? []).map((wrongQuestion) => ({
    ...wrongQuestion,
    sourceYear: extractYearFromText(wrongQuestion.sourceYear) ?? extractYearFromText(wrongQuestion.id) ?? "Unknown",
  }));

  const normalizedSourceYears = (result.sourceYears ?? [])
    .map((entry) => extractYearFromText(entry) ?? entry)
    .filter((entry): entry is string => Boolean(entry && entry.trim().length > 0));

  const sourceYears = (normalizedSourceYears.length > 0
    ? [...new Set(normalizedSourceYears)]
    : [...new Set(normalizedWrongQuestions.map((question) => question.sourceYear))]
  ).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

  return {
    ...result,
    sourceYears,
    wrongQuestions: normalizedWrongQuestions,
  } as MockExamResult;
};

const safeSave = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage failures and keep app functional.
  }
};

const safeLoad = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const isMockExamSession = (value: unknown): value is MockExamSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<MockExamSession>;

  return (
    session.schemaVersion === SESSION_SCHEMA_VERSION &&
    typeof session.sessionId === "string" &&
    typeof session.createdAtMs === "number" &&
    typeof session.startedAtMs === "number" &&
    typeof session.currentQuestionIndex === "number" &&
    typeof session.hintsUsed === "number" &&
    Boolean(session.settings) &&
    Array.isArray(session.questions) &&
    Boolean(session.answers) &&
    typeof session.answers === "object"
  );
};

export const saveMockExamSession = (session: MockExamSession) => {
  safeSave(SESSION_STORAGE_KEY, session);
};

export const loadMockExamSession = (): MockExamSession | null => {
  const loaded = safeLoad<unknown>(SESSION_STORAGE_KEY);

  if (!isMockExamSession(loaded)) {
    clearMockExamSession();
    return null;
  }

  return loaded;
};

export const attachSessionSchema = (session: Omit<MockExamSession, "schemaVersion">): MockExamSession => ({
  ...session,
  schemaVersion: SESSION_SCHEMA_VERSION,
});

export const clearMockExamSession = () => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore localStorage failures and keep app functional.
  }
};

export const saveMockExamResult = (result: MockExamResult) => {
  safeSave(RESULT_STORAGE_KEY, result);
};

export const loadMockExamResult = (): MockExamResult | null => {
  const loaded = safeLoad<LegacyMockExamResult>(RESULT_STORAGE_KEY);

  if (!loaded || typeof loaded !== "object") {
    return null;
  }

  return migrateMockExamResult(loaded);
};

export const clearMockExamResult = () => {
  try {
    localStorage.removeItem(RESULT_STORAGE_KEY);
  } catch {
    // Ignore localStorage failures and keep app functional.
  }
};

export const deriveSelectedCategories = (selectedTopics: string[]): string[] => {
  const selectedSet = new Set(selectedTopics);

  return (Object.keys(categoryTopics) as CategoryName[]).filter((categoryName) =>
    categoryTopics[categoryName].some((topic) => selectedSet.has(topic)),
  );
};

export const formatClockFromSeconds = (seconds: number, alwaysShowHours = true): string => {
  const clamped = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const remainingSeconds = clamped % 60;

  if (!alwaysShowHours && hours === 0) {
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const topicOrderMap = new Map<string, number>(allTopics.map((topic, index) => [topic, index]));

export const computeMockExamResult = (
  session: MockExamSession,
  answers: Record<string, string>,
  totalTimeSeconds: number,
  hintsUsed: number,
): MockExamResult => {
  const totalQuestions = session.questions.length;

  let correctAnswers = 0;
  const wrongQuestions: WrongQuestionReview[] = [];

  const categoryStats = new Map<
    string,
    {
      name: string;
      total: number;
      correct: number;
      topics: Map<string, TopicBreakdown>;
    }
  >();

  for (const question of session.questions) {
    const selectedAnswer = answers[question.id];
    const isCorrect = selectedAnswer === question.correctOption;
    const sourceYear = resolveQuestionSourceYear(question);

    if (!isCorrect) {
      const selectedChoice = question.options.find((choice) => choice.key === selectedAnswer);
      const correctChoice = question.options.find((choice) => choice.key === question.correctOption);

      wrongQuestions.push({
        id: question.id,
        sourceYear,
        questionNumber: question.questionNumber,
        subjectTopic: question.subjectTopic,
        questionText: question.questionText,
        selectedOption: selectedAnswer ?? null,
        selectedOptionText: selectedChoice?.text?.trim() ? selectedChoice.text : null,
        correctOption: question.correctOption,
        correctOptionText: correctChoice?.text?.trim() ? correctChoice.text : null,
        answerExplanation: question.answerExplanation,
      });
    }

    if (isCorrect) {
      correctAnswers += 1;
    }

    const categoryName = question.subjectCategory;

    if (!categoryStats.has(categoryName)) {
      categoryStats.set(categoryName, {
        name: categoryName,
        total: 0,
        correct: 0,
        topics: new Map<string, TopicBreakdown>(),
      });
    }

    const category = categoryStats.get(categoryName);
    if (!category) {
      continue;
    }

    category.total += 1;
    if (isCorrect) {
      category.correct += 1;
    }

    const existingTopic = category.topics.get(question.subjectTopic) ?? {
      name: question.subjectTopic,
      total: 0,
      correct: 0,
    };

    existingTopic.total += 1;
    if (isCorrect) {
      existingTopic.correct += 1;
    }

    category.topics.set(question.subjectTopic, existingTopic);
  }

  const categoryBreakdown = [...categoryStats.values()]
    .sort((a, b) => {
      const aOrder = (Object.keys(categoryTopics) as string[]).indexOf(a.name);
      const bOrder = (Object.keys(categoryTopics) as string[]).indexOf(b.name);
      if (aOrder === -1 || bOrder === -1) {
        return a.name.localeCompare(b.name);
      }
      return aOrder - bOrder;
    })
    .map((category) => ({
      name: category.name,
      total: category.total,
      correct: category.correct,
      topics: [...category.topics.values()].sort((a, b) => {
        const aOrder = topicOrderMap.get(a.name) ?? Number.MAX_SAFE_INTEGER;
        const bOrder = topicOrderMap.get(b.name) ?? Number.MAX_SAFE_INTEGER;
        if (aOrder === bOrder) {
          return a.name.localeCompare(b.name);
        }
        return aOrder - bOrder;
      }),
    }));

  const averageTimePerQuestionSeconds =
    totalQuestions === 0 ? 0 : Math.max(0, Math.round(totalTimeSeconds / totalQuestions));

  const sourceYears = [...new Set(session.questions.map((question) => resolveQuestionSourceYear(question)))]
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

  return {
    completedAtMs: Date.now(),
    settings: session.settings,
    sourceYears,
    totalQuestions,
    correctAnswers,
    totalTimeSeconds,
    averageTimePerQuestionSeconds,
    hintsUsed,
    selectedCategories: deriveSelectedCategories(session.settings.selectedTopics),
    selectedTopicCount: session.settings.selectedTopics.length,
    categoryBreakdown,
    wrongQuestions,
  };
};
