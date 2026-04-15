import { useMemo, useState } from 'react'

export type FeaturedNote = {
  title: string
  description: string
  url: string
  embedUrl: string
}

function getDomainLabel(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '')
  }
  catch {
    return 'External link'
  }
}

export default function FeaturedNoteCard({ note }: { note: FeaturedNote }) {
  const [showFallback, setShowFallback] = useState(false)

  const domainLabel = useMemo(() => getDomainLabel(note.url), [note.url])
  const faviconUrl = useMemo(
    () => `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(note.url)}&sz=128`,
    [note.url],
  )

  return (
    <a
      href={note.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${note.title}`}
      className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <article>
        <div className="h-44 w-full border-b border-zinc-200 bg-zinc-50 sm:h-52 lg:h-56 dark:border-zinc-800 dark:bg-zinc-950">
          {showFallback
            ? (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-100 via-zinc-50 to-zinc-200 p-4 text-center dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-800">
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={faviconUrl}
                      alt={`${domainLabel} icon`}
                      className="h-12 w-12 rounded-xl border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
                      loading="lazy"
                    />
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Preview unavailable</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">{domainLabel}</p>
                  </div>
                </div>
              )
            : (
                <iframe
                  src={note.embedUrl}
                  title={`${note.title} preview`}
                  loading="lazy"
                  className="h-full w-full pointer-events-none"
                  referrerPolicy="no-referrer"
                  onError={() => setShowFallback(true)}
                />
              )}
        </div>

        <div className="flex h-fit flex-col justify-between space-y-2 p-3 sm:p-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-white">{note.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{note.description}</p>
          </div>
        </div>
      </article>
    </a>
  )
}