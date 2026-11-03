import { Link } from 'react-router-dom'
import { ArrowLeft, House, Exam, BookOpenText, Archive } from '@phosphor-icons/react'
import Layout from '../components/Layout'

export default function NotFoundPage() {
  return (
    <Layout>
      <main className="flex-1 w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <section className="w-full max-w-xl card-brut p-6 sm:p-10 text-center flex flex-col items-center gap-6 shadow-[5px_5px_0px_0px_#09090b] dark:shadow-[5px_5px_0px_0px_#f4f4f5]">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="badge-brut bg-amber-300 dark:bg-amber-400 text-zinc-950">
              STATUS 404
            </span>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
              ROUTE NOT FOUND
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight text-zinc-950 dark:text-zinc-100 uppercase">
              Page Missing
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
              The requested URL path does not exist in the NitPicker exam vault or has been relocated to another section.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="w-full pt-2">
            <Link
              to="/"
              className="btn-solid w-full py-3 px-6 text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer"
            >
              <House className="h-4 w-4" />
              <span>RETURN TO HOMEPAGE</span>
              <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="w-full pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold mb-3">
              DIRECT PORTAL SHORTCUTS:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/mockexamprep"
                className="btn-outline px-3 py-1.5 text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Exam className="h-3.5 w-3.5" />
                <span>Mock Exam</span>
              </Link>
              <Link
                to="/notes"
                className="btn-outline px-3 py-1.5 text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpenText className="h-3.5 w-3.5" />
                <span>Study Notes</span>
              </Link>
              <Link
                to="/previousexams"
                className="btn-outline px-3 py-1.5 text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Previous Exams</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
