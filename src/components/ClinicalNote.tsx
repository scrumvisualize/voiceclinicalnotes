import { useState } from 'react';
import type { ClinicalNote as ClinicalNoteType } from '../types/clinical';

interface Props {
  note: ClinicalNoteType;
  onNoteChange: (updatedNote: ClinicalNoteType) => void;
}

export default function ClinicalNote({ note, onNoteChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Clinical Note
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Patient Documentation
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {note.patientId}
          </span>

          <button
            type="button"
            onClick={() => setIsEditing((current) => !current)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {isEditing ? 'Done Editing' : 'Edit Note'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Diagnosis
          </p>

          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            {note.diagnosis || 'Not documented'}
          </p>
        </div>

        <div>
          <label
            htmlFor="clinical-note"
            className="text-xs font-medium text-slate-400 dark:text-slate-500"
          >
            Note
          </label>

          {isEditing ? (
            <textarea
              id="clinical-note"
              value={note.note}
              onChange={(event) =>
                onNoteChange({
                  ...note,
                  note: event.target.value
                })
              }
              rows={8}
              placeholder="Enter or edit the clinical note..."
              className="mt-2 w-full resize-y rounded-lg border border-blue-300 bg-white p-4 text-sm leading-6 text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100 dark:border-blue-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-blue-900"
            />
          ) : (
            <div className="mt-2 min-h-24 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {note.note || 'No clinical note available yet.'}
            </div>
          )}
        </div>

        {isEditing && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your changes update the current note. Re-run AI analysis to refresh
            the findings.
          </p>
        )}
      </div>
    </section>
  );
}
