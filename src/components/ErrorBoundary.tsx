import { Component, type ReactNode } from 'react'
import { trackError } from '../lib/errorTracking'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    trackError(error, { source: 'ErrorBoundary' })
    console.error('ErrorBoundary caught error:', error)
  }

  handleResetExamData = () => {
    try {
      localStorage.removeItem('ofa.mockExam.currentSession')
      localStorage.removeItem('ofa.mockExam.latestResult')
    } catch {
      // Ignore storage access errors in private browsing modes
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-sans">
          <div className="w-full max-w-xl card-brut p-6 sm:p-8 bg-white dark:bg-zinc-900 flex flex-col gap-6 shadow-[5px_5px_0px_0px_#09090b] dark:shadow-[5px_5px_0px_0px_#f4f4f5]">
            {/* Error Badge & Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-brut bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider">
                  SYSTEM EXCEPTION
                </span>
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase">
                  ERROR BOUNDARY
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-zinc-950 dark:text-zinc-100 uppercase">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
                An unexpected runtime error occurred. If this happened during an active mock exam session or result calculation, saved exam session data might be in an inconsistent state.
              </p>
            </div>

            {/* Dev Mode Stack Dump */}
            {import.meta.env.DEV && this.state.error && (
              <div className="border-2 border-zinc-950 dark:border-zinc-300 bg-zinc-100 dark:bg-zinc-950 p-4 font-mono text-xs overflow-x-auto max-h-48 text-rose-700 dark:text-rose-400">
                <p className="font-bold mb-1">Developer Error Details:</p>
                <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-solid flex-1 py-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                Refresh Page
              </button>
              <button
                type="button"
                onClick={this.handleResetExamData}
                className="btn-outline flex-1 py-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center border-rose-600 text-rose-700 dark:border-rose-400 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-zinc-950 cursor-pointer"
              >
                Reset Exam Data & Reload
              </button>
            </div>

            <a
              href="/"
              className="text-xs font-mono font-bold text-center underline text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
