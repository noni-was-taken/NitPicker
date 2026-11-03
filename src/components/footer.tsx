const contributors = [
  { name: 'mingotrees', url: 'https://github.com/mingotrees' },
  { name: 'saiimonn', url: 'https://github.com/saiimonn' },
  { name: 'miggycarumba', url: 'https://github.com/DemonAcolyte' },
  { name: 'matchacone', url: 'https://github.com/matchacone' },
  { name: 'choonhows', url: 'https://github.com/choonhows' },
]

export default function Footer() {
  return (
    <footer className="w-full border-t-2 border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Project Metadata */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-sm uppercase tracking-wider text-zinc-950 dark:text-zinc-100">
              NitPicker
            </span>
            <span className="inline-flex items-center px-2 py-0.2 border border-zinc-950 dark:border-zinc-400 text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              PHILNITS FE VAULT
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            Free, open-source preparation platform for the PhilNITS Fundamental Engineer (FE) Examination.
          </p>
        </div>

        {/* Right: Contributors */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Created by:</span>
            <a
              href="https://github.com/noni-was-taken"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-0.5 border border-zinc-950 dark:border-zinc-300 font-mono text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-950 shadow-[1px_1px_0px_0px_#09090b] dark:shadow-[1px_1px_0px_0px_#f4f4f5] transition"
            >
              nonua
            </a>
          </div>

          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">|</span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Contributors:</span>
            {contributors.map((contrib) => (
              <a
                key={contrib.name}
                href={contrib.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-0.5 border border-zinc-950 dark:border-zinc-300 font-mono text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-950 shadow-[1px_1px_0px_0px_#09090b] dark:shadow-[1px_1px_0px_0px_#f4f4f5] transition"
              >
                {contrib.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
