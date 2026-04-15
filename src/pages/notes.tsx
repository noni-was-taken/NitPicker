import Layout from '../components/Layout'
import FeaturedNoteCard, { type FeaturedNote } from '../components/FeaturedNoteCard'

const featuredNotes: FeaturedNote[] = [
  {
    title: "Yza's Strategy and Management Gizmo Deck",
    description: 'Interactive Gizmo deck for quick review and recall practice.',
    url: 'https://app.gizmo.ai/decks/66373942',
    embedUrl: 'https://app.gizmo.ai/decks/66373942',
  },
  {
    title: "Yza's IT Fundamentals Gizmo Deck",
    description: 'Note that this is still ongoing and is not completed',
    url: 'https://app.gizmo.ai/decks/66373943',
    embedUrl: 'https://app.gizmo.ai/decks/66373943',
  },
  {
    title: "Ethan's Study Notes",
    description: 'Shared document with structured study notes and references.',
    url: 'https://docs.google.com/document/d/1gsgeDGyGu1NOGHgT9dXdReiJnPbj08vmvGQqcP10G5A/edit?usp=sharing',
    embedUrl: 'https://docs.google.com/document/d/1gsgeDGyGu1NOGHgT9dXdReiJnPbj08vmvGQqcP10G5A/preview',
  },
  {
    title: 'Yza, Ethan, Jhanell Notes',
    description: 'Curated questions, concepts, and solutions',
    url: 'https://docs.google.com/document/d/1pgmVXpfEJxhkbpgRbgKjjsmPJNNFkWdPDsrHjpW_6Pc/edit?usp=sharing',
    embedUrl: 'https://docs.google.com/document/d/1pgmVXpfEJxhkbpgRbgKjjsmPJNNFkWdPDsrHjpW_6Pc/preview',
  },
]

export default function NotesPage() {
  return (
    <Layout className="py-10 md:py-0 gap-6 md:gap-10 select-none">
      <main className="flex-1 w-full flex items-start justify-center px-6 md:px-20">
        <div className="w-full max-w-7xl py-6 md:py-10">
          <div className="mb-8 text-center md:mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">Featured Notes</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 md:text-base">
              DM Jose Miguel Carumba on Facebook if you would like your notes to be featured
            </p>
          </div>

          <section className="grid grid-cols-1 gap-4 pb-7 sm:gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {featuredNotes.map(note => <FeaturedNoteCard key={note.url} note={note} />)}
          </section>
        </div>
      </main>
    </Layout>
  )
}
