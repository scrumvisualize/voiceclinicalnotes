import type { ClinicalNote as ClinicalNoteType } from '../types/clinical';

interface Props {
  note: ClinicalNoteType;
}

export default function ClinicalNote({ note }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Clinical Note
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Patient Documentation
          </h2>
        </div>

        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {note.patientId}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Diagnosis
          </p>

          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            {note.diagnosis}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Note
          </p>

          <div className="mt-2 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {note.note}
          </div>
        </div>
      </div>
    </section>
  );
}
