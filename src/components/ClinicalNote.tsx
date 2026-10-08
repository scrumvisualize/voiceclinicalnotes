import type { ClinicalNote as ClinicalNoteType } from '../types/clinical';

interface Props {
  note: ClinicalNoteType;
}

export default function ClinicalNote({ note }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Clinical Note
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Patient Documentation
          </h2>
        </div>

        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {note.patientId}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-400">Diagnosis</p>

          <p className="mt-1 text-sm font-medium text-slate-800">
            {note.diagnosis}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400">Note</p>

          <div className="mt-2 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {note.note}
          </div>
        </div>
      </div>
    </section>
  );
}
