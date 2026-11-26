import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Newest first. Add an entry here when you deploy something students will notice;
// the dialog opens once for everyone who hasn't seen the newest entry yet.
const UPDATES = [
  {
    date: "2026-11-19",
    title: "Broken questions fixed, and a Report button",
    items: [
      "Every question has a Report button. Tell us when something looks wrong and we'll fix it.",
      "About 300 questions cleaned up: tables are real tables again, and pictures that only repeated the text are gone.",
      "The two \"Q1\" questions that were really the exam's instructions are replaced with the real Q1s.",
      "Start full exam and Start quick sprint on the home page work again.",
    ],
  },
  {
    date: "2026-11-16",
    title: "Cleaner look, calmer dark mode",
    items: [
      "Simpler home page: the exam buttons sit higher and the clutter is gone.",
      "Dark mode uses soft gray borders instead of glowing white ones.",
      "Small touches of motion: questions slide in, wrong answers shake once.",
    ],
  },
  {
    date: "2026-11-05",
    title: "1,500+ questions and a fairer timer",
    items: [
      "333 questions that never loaded now appear in exams and the archive.",
      "Wrong answer keys corrected against the official ITPEC papers.",
      "The exam timer keeps real time, even in a background tab or after a refresh.",
      "The theme follows your device's dark mode setting.",
    ],
  },
  {
    date: "2026-11-03",
    title: "Missing figures restored",
    items: [
      "170 figures and tables restored from the official ITPEC past papers.",
      "Math, symbols and dollar amounts display correctly.",
    ],
  },
];

const SEEN_KEY = "nitpicker.whatsNew.seen";
const latest = UPDATES[0].date;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

/** "What's new" footer link plus the dialog. Opens by itself once per new update, never mid-exam. */
export default function WhatsNew() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(SEEN_KEY);
    } catch {
      return; // storage blocked: don't nag on every page
    }
    if (seen !== latest && window.location.pathname !== "/mockexam") {
      dialogRef.current?.showModal();
    }
  }, []);

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, latest);
    } catch {
      // storage blocked: nothing to remember
    }
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="font-mono text-xs underline underline-offset-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer self-start"
      >
        What's new
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="whats-new-title"
        onClose={markSeen}
        onClick={(event) => event.target === dialogRef.current && close()}
        className="modal-panel m-auto p-0 w-[calc(100%-2rem)] max-h-[85dvh] overflow-y-auto overscroll-contain backdrop:bg-black/60 text-zinc-950 dark:text-zinc-100"
      >
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="whats-new-title" className="text-2xl font-bold font-heading">
              What's new
            </h2>
            <button type="button" onClick={close} aria-label="Close" className="p-1 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <ol className="flex flex-col gap-6">
            {UPDATES.map((update) => (
              <li key={update.date} className="flex flex-col gap-2">
                <time dateTime={update.date} className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(update.date)}
                </time>
                <h3 className="font-bold">{update.title}</h3>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {update.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <button type="button" onClick={close} className="btn-solid px-4 py-2.5 text-xs font-mono uppercase self-start">
            Got it
          </button>
        </div>
      </dialog>
    </>
  );
}
