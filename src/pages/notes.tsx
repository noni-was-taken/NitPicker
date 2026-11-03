import Layout from '../components/Layout'
import FeaturedNoteCard, { type FeaturedNote } from '../components/FeaturedNoteCard'
import { BookOpenText, EnvelopeSimple, ChatCircleDots } from '@phosphor-icons/react'

const featuredNotes: FeaturedNote[] = [
  {
    title: "Yza's Strategy and Management Gizmo Deck",
    description: 'Interactive Gizmo flashcard deck for quick recall and high-frequency business & management terminology.',
    url: 'https://app.gizmo.ai/decks/66373942',
    embedUrl: 'https://app.gizmo.ai/decks/66373942',
  },
  {
    title: "Yza's IT Fundamentals Gizmo Deck",
    description: 'Ongoing interactive deck covering computer systems, hardware architectures, and fundamental IT principles.',
    url: 'https://app.gizmo.ai/decks/66373943',
    embedUrl: 'https://app.gizmo.ai/decks/66373943',
  },
  {
    title: "Ethan's Study Notes",
    description: 'Comprehensive shared document featuring structured concept breakdowns, formulas, and domain summaries.',
    url: 'https://docs.google.com/document/d/1gsgeDGyGu1NOGHgT9dXdReiJnPbj08vmvGQqcP10G5A/edit?usp=sharing',
    embedUrl: 'https://docs.google.com/document/d/1gsgeDGyGu1NOGHgT9dXdReiJnPbj08vmvGQqcP10G5A/preview',
  },
  {
    title: 'Yza, Ethan, Jhanell Notes',
    description: 'Collaborative repository of curated sample questions, domain formulas, and detailed step-by-step solutions.',
    url: 'https://docs.google.com/document/d/1pgmVXpfEJxhkbpgRbgKjjsmPJNNFkWdPDsrHjpW_6Pc/edit?usp=sharing',
    embedUrl: 'https://docs.google.com/document/d/1pgmVXpfEJxhkbpgRbgKjjsmPJNNFkWdPDsrHjpW_6Pc/preview',
  },
]

const contactEmails = [
  '22101691@usc.edu.ph',
  '22101440@usc.edu.ph',
  '31200250@usc.edu.ph',
  '11820049@usc.edu.ph',
]

const gmailComposeLink = (email: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(email)}`

export default function NotesPage() {
  return (
    <Layout>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Editorial Page Header */}
        <div className="mb-10 pb-6 border-b-2 border-zinc-950 dark:border-zinc-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-brut bg-blue-600 text-white dark:bg-blue-500 dark:text-zinc-950">
              <BookOpenText className="h-3 w-3" />
              COMMUNITY VAULT
            </span>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              PHILNITS FE NOTES & DECKS
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-zinc-950 dark:text-zinc-100 uppercase">
            Featured Study Notes
          </h1>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
            Curated reference sheets, active-recall flashcard decks, and collaborative study guides contributed by PhilNITS examinees and student mentors.
          </p>
        </div>

        {/* Contribution Callout Banner */}
        <section className="mb-10 p-5 sm:p-6 card-brut bg-zinc-50 dark:bg-zinc-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="p-2 border border-zinc-950 dark:border-zinc-200 bg-amber-200 dark:bg-amber-400 text-zinc-950 shrink-0">
              <ChatCircleDots className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                Want to feature your notes?
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Direct message{' '}
                <a
                  href="https://www.facebook.com/demonacolyte9123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Jose Miguel Carumba
                </a>{' '}
                on Facebook or send study decks to the student maintainers.
              </p>
            </div>
          </div>

          {/* Email Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 mr-1">
              <EnvelopeSimple className="h-4 w-4" />
              <span>Contact:</span>
            </div>
            {contactEmails.map((email) => (
              <a
                key={email}
                href={gmailComposeLink(email)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-0.5 border border-zinc-950 dark:border-zinc-300 font-mono text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-950 shadow-[1px_1px_0px_0px_#09090b] dark:shadow-[1px_1px_0px_0px_#f4f4f5] transition"
              >
                {email}
              </a>
            ))}
          </div>
        </section>

        {/* Featured Notes Grid */}
        <section
          aria-label="Study notes list"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pb-10"
        >
          {featuredNotes.map((note) => (
            <FeaturedNoteCard key={note.url} note={note} />
          ))}
        </section>
      </main>
    </Layout>
  )
}
