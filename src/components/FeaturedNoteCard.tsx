import { useMemo, useState } from 'react'
import { ArrowSquareOut, Cards, FileText } from '@phosphor-icons/react'

export type FeaturedNote = {
  title: string
  description: string
  url: string
  embedUrl: string
}

function getDomainLabel(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'external resource'
  }
}

export default function FeaturedNoteCard({ note }: { note: FeaturedNote }) {
  const [showFallback, setShowFallback] = useState(false)
  const domainLabel = useMemo(() => getDomainLabel(note.url), [note.url])

  // Gizmo.ai sets X-Frame-Options: DENY and does not fire onError in browsers.
  // We detect gizmo.ai or non-embeddable URLs and display a tailored interactive deck card instead.
  const isGizmo = note.url.includes('gizmo.ai') || note.embedUrl.includes('gizmo.ai')
  const isGoogleDoc = note.embedUrl.includes('docs.google.com')

  return (
    <article className="card-brut flex flex-col justify-between overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#09090b] dark:hover:shadow-[5px_5px_0px_0px_#f4f4f5]">
      {/* Visual Header / Preview */}
      <div className="relative h-48 sm:h-52 w-full border-b-2 border-zinc-950 dark:border-zinc-200 bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
        {/* Domain & Type Badge Bar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <span className="badge-brut bg-white/95 dark:bg-zinc-900/95 text-zinc-950 dark:text-zinc-100 shadow-[1px_1px_0px_0px_#09090b] dark:shadow-[1px_1px_0px_0px_#f4f4f5]">
            {domainLabel}
          </span>
          {isGizmo && (
            <span className="badge-brut bg-amber-400 text-zinc-950 dark:bg-amber-400 dark:text-zinc-950 shadow-[1px_1px_0px_0px_#09090b] dark:shadow-[1px_1px_0px_0px_#f4f4f5]">
              FLASHCARDS
            </span>
          )}
          {isGoogleDoc && (
            <span className="badge-brut bg-blue-600 text-white dark:bg-blue-500 dark:text-zinc-950 shadow-[1px_1px_0px_0px_#09090b] dark:shadow-[1px_1px_0px_0px_#f4f4f5]">
              STUDY DOC
            </span>
          )}
        </div>

        {isGizmo ? (
          // Bespoke Neo-Brutalist Deck Showcase (avoiding broken iframe refusal)
          <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-amber-100/60 via-zinc-100 to-zinc-200 dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-950 text-center">
            <div className="p-3.5 border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-[3px_3px_0px_0px_#09090b] dark:shadow-[3px_3px_0px_0px_#f4f4f5] mb-3">
              <Cards className="h-8 w-8" />
            </div>
            <p className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-zinc-100">
              Interactive Gizmo Deck
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
              Active recall & spaced repetition flashcards
            </p>
          </div>
        ) : isGoogleDoc && !showFallback ? (
          // Google Docs Preview Embed
          <iframe
            src={note.embedUrl}
            title={`${note.title} preview`}
            loading="lazy"
            className="h-full w-full pointer-events-none opacity-90 hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
            onError={() => setShowFallback(true)}
          />
        ) : (
          // Document Fallback Banner
          <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-zinc-100 dark:bg-zinc-900 text-center">
            <div className="p-3.5 border-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-[3px_3px_0px_0px_#09090b] dark:shadow-[3px_3px_0px_0px_#f4f4f5] mb-3">
              <FileText className="h-8 w-8" />
            </div>
            <p className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-zinc-100">
              Curated Study Material
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
              {domainLabel}
            </p>
          </div>
        )}
      </div>

      {/* Card Content & Action Button */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-base sm:text-lg text-zinc-950 dark:text-zinc-100 leading-snug">
            {note.title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
            {note.description}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-solid w-full py-2.5 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{isGizmo ? 'LAUNCH FLASHCARDS' : 'OPEN DOCUMENT'}</span>
            <ArrowSquareOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  )
}
