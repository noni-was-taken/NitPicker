import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpenText,
  Archive,
  ArrowRight,
  Clock,
  ChartLineUp,
  BookmarkSimple,
  Play,
  ArrowSquareOut,
  Target,
  GraduationCap,
} from '@phosphor-icons/react'
import Lenis from 'lenis'
import Layout from '../components/Layout'
import {
  loadExamHistory,
  loadBookmarkedQuestionIds,
  loadMockExamSession,
  clearMockExamSession,
  saveMockExamSession,
  type ExamHistoryEntry,
  type MockExamSession,
} from '../exam/mockExamModel'
import { buildMockExamSession, buildStarredQuestionsSession } from '../exam/mockExamQuestionBank'

export default function HomePage() {
  const navigate = useNavigate()
  const [activeSession, setActiveSession] = useState<MockExamSession | null>(() => loadMockExamSession())
  const [examHistory] = useState<ExamHistoryEntry[]>(() => loadExamHistory())
  const [bookmarkedIds] = useState<string[]>(() => loadBookmarkedQuestionIds())

  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: true,
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  // Fast launch handlers
  const handleLaunchFullSim = () => {
    const newSession = buildMockExamSession({
      examType: 'AM EXAM',
      isTimed: true,
      durationMinutes: 150,
      questionCount: 80,
      instantAnswers: false,
      selectedTopics: [],
      selectedYears: [],
    })
    saveMockExamSession(newSession)
    navigate('/mockexam')
  }

  const handleLaunchQuickSprint = () => {
    const newSession = buildMockExamSession({
      examType: 'AM EXAM',
      isTimed: true,
      durationMinutes: 30,
      questionCount: 20,
      instantAnswers: true,
      selectedTopics: [],
      selectedYears: [],
    })
    saveMockExamSession(newSession)
    navigate('/mockexam')
  }

  const handleLaunchStarredDrill = () => {
    if (bookmarkedIds.length === 0) return
    const newSession = buildStarredQuestionsSession(bookmarkedIds)
    if (newSession && newSession.questions.length > 0) {
      saveMockExamSession(newSession)
      navigate('/mockexam')
    } else {
      navigate('/mockexamprep')
    }
  }

  const handleDiscardActiveSession = () => {
    clearMockExamSession()
    setActiveSession(null)
  }

  // Calculate high-level stats from history
  const totalAttempts = examHistory.length
  const passedAttempts = examHistory.filter((h) => h.passed).length
  const latestAttempt = examHistory[0] ?? null
  const highestScore = examHistory.length > 0 ? Math.max(...examHistory.map((h) => h.percentage)) : 0

  return (
    <Layout>
      {/* Top Technical Metadata Bar */}
      <div className="w-full border-b-2 border-zinc-950 dark:border-zinc-200 bg-zinc-100 dark:bg-zinc-900/90 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold text-zinc-950 dark:text-zinc-100">PHILNITS FE EXAM PREP</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <span>BENCHMARK: 60%</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">700+ PAST QUESTIONS</span>
            <span className="hidden lg:inline">•</span>
            <span className="hidden lg:inline">JAPAN-PHILIPPINES IT CURRICULUM</span>
          </div>
          <div className="font-mono text-zinc-950 dark:text-zinc-100 font-bold">
            USC CCIS INITIATIVE
          </div>
        </div>
      </div>

      {/* Main Workspace Cockpit */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Command Center & Launchers (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="badge-brut bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold">
                  <GraduationCap className="h-3.5 w-3.5" />
                  PHILNITS FE SIMULATOR
                </span>
                <span className="badge-brut bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  APRIL 26 SITTING
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-zinc-950 dark:text-zinc-100 uppercase leading-[1.1]">
                Targeted Practice For Engineering Certification.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl">
                Timed 80-question simulations, KaTeX-formatted technical explanations, and instant domain analytics replicating authentic PhilNITS FE examination criteria.
              </p>
            </div>

            {/* Active Session Callout (if in progress) */}
            {activeSession && (
              <div className="card-brut p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 border-amber-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      ACTIVE EXAM IN PROGRESS
                    </span>
                    <p className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-100 mt-0.5">
                      {activeSession.settings.examType} • {Object.keys(activeSession.answers).length} / {activeSession.questions.length} Answered
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/mockexam')}
                      className="btn-solid px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider"
                    >
                      RESUME EXAM →
                    </button>
                    <button
                      type="button"
                      onClick={handleDiscardActiveSession}
                      className="btn-outline px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider"
                    >
                      DISCARD
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Exam Launchpad Card */}
            <div className="card-brut p-5 sm:p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-200 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  RAPID SIMULATION LAUNCHPAD
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/mockexamprep')}
                  className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  CUSTOMIZE SETTINGS →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-zinc-950 dark:border-zinc-200 p-4 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      STANDARD BENCHMARK
                    </span>
                    <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-100 mt-1">
                      Full Exam Simulation
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                      80 questions • 150 min timer • Strict benchmark scoring (60% to pass).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLaunchFullSim}
                    className="btn-solid w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <span>START FULL EXAM</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="border-2 border-zinc-950 dark:border-zinc-200 p-4 flex flex-col justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/50">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      SPEED PRACTICE
                    </span>
                    <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-100 mt-1">
                      Quick Sprint Drill
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                      20 questions • 30 min timer • Instant step-by-step answer reveals.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLaunchQuickSprint}
                    className="btn-outline w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <span>START QUICK SPRINT</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-brut p-3.5 text-center">
                <span className="font-mono text-2xl font-bold text-zinc-950 dark:text-zinc-100">60%</span>
                <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Passing Score</p>
              </div>
              <div className="card-brut p-3.5 text-center">
                <span className="font-mono text-2xl font-bold text-zinc-950 dark:text-zinc-100">150m</span>
                <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Morning Session</p>
              </div>
              <div className="card-brut p-3.5 text-center">
                <span className="font-mono text-2xl font-bold text-zinc-950 dark:text-zinc-100">100%</span>
                <p className="text-[11px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Free & Open</p>
              </div>
            </div>
          </div>

          {/* Right Column: Your Personal Study Tracker & Starred Weak Spots (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Study Progress & History Card */}
            <div className="card-brut p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-200 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-100">
                  <ChartLineUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  STUDY PERFORMANCE
                </div>
                <span className="text-xs font-mono text-zinc-500">
                  {totalAttempts} {totalAttempts === 1 ? 'ATTEMPT' : 'ATTEMPTS'}
                </span>
              </div>

              {latestAttempt ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-zinc-950 dark:border-zinc-300 p-3 bg-zinc-50 dark:bg-zinc-800/60">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">LATEST SCORE</span>
                      <p className={`font-mono text-2xl font-bold ${latestAttempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {latestAttempt.percentage.toFixed(1)}%
                      </p>
                      <span className="text-[10px] font-mono font-bold">
                        {latestAttempt.passed ? 'PASSED (≥ 60%)' : 'NEEDS WORK (< 60%)'}
                      </span>
                    </div>

                    <div className="border border-zinc-950 dark:border-zinc-300 p-3 bg-zinc-50 dark:bg-zinc-800/60">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">HIGHEST SCORE</span>
                      <p className="font-mono text-2xl font-bold text-zinc-950 dark:text-zinc-100">
                        {highestScore.toFixed(1)}%
                      </p>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {passedAttempts} / {totalAttempts} passed
                      </span>
                    </div>
                  </div>

                  {/* Recent Attempts List */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono uppercase font-bold text-zinc-500">RECENT SESSIONS</span>
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                      {examHistory.slice(0, 4).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${entry.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span>{new Date(entry.completedAtMs).toLocaleDateString()}</span>
                            <span className="text-zinc-400">({entry.score}/{entry.totalQuestions}Q)</span>
                          </div>
                          <span className={`font-bold ${entry.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {entry.percentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-4">
                  <Target className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
                  <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">No Mock Exam Attempts Yet</p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                    Take your first mock exam to establish your PhilNITS FE readiness baseline and track progression.
                  </p>
                </div>
              )}
            </div>

            {/* Starred Weak Spots Deck Card */}
            <div className="card-brut p-5 sm:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-200 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-100">
                  <BookmarkSimple className="h-4 w-4 text-amber-500" weight="fill" />
                  STARRED WEAK SPOTS DECK
                </div>
                <span className="badge-brut bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200">
                  {bookmarkedIds.length} SAVED
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Bookmark challenging questions during exams or archive review to compile a targeted spaced-repetition deck.
              </p>

              {bookmarkedIds.length > 0 ? (
                <button
                  type="button"
                  onClick={handleLaunchStarredDrill}
                  className="btn-solid w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>DRILL {bookmarkedIds.length} STARRED QUESTIONS</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="text-xs font-mono text-zinc-500 border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-800/40 text-center">
                  Star questions using the [B] button in exams or archive to enable targeted drills.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Dual Portals: Archive & Notes */}
        <div className="mt-12 pt-8 border-t-2 border-zinc-950 dark:border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate('/previousexams')}
            className="card-brut p-6 hover:shadow-[5px_5px_0px_0px_#09090b] dark:hover:shadow-[5px_5px_0px_0px_#f4f4f5] transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="badge-brut bg-zinc-100 dark:bg-zinc-800">
                  700+ PAST QUESTIONS
                </span>
                <Archive className="h-6 w-6 text-zinc-700 dark:text-zinc-300 group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-100">
                Previous Exams Archive
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">
                Browse official past papers from 2011 to 2025 organized by year, topic, and category with complete solutions and KaTeX mathematical notation.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>EXPLORE PAST PAPERS</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigate('/notes')}
            className="card-brut p-6 hover:shadow-[5px_5px_0px_0px_#09090b] dark:hover:shadow-[5px_5px_0px_0px_#f4f4f5] transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="badge-brut bg-zinc-100 dark:bg-zinc-800">
                  FLASHCARDS & STUDY DOCS
                </span>
                <BookOpenText className="h-6 w-6 text-zinc-700 dark:text-zinc-300 group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-100">
                Curated Study Guides
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">
                High-yield community study materials, interactive Gizmo flashcard decks, and Strategy/Management summary documents contributed by passers.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>ACCESS STUDY NOTES</span>
              <ArrowSquareOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
