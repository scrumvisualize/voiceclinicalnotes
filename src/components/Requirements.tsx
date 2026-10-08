export default function Requirements() {
  const requirements = [
    'Diagnosis must be documented',
    'Symptoms must be documented',
    'Medical necessity must be supported',
    'Treatment provided must be documented',
    'Treatment duration must be documented',
    'Patient progress must be documented'
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Checked Against
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Payer & Compliance Requirements
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Payer</p>

          <p className="mt-1 text-sm font-medium text-slate-800">
            Synthetic Payer A
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Service</p>

          <p className="mt-1 text-sm font-medium text-slate-800">
            Physical Therapy
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400">Policy</p>

          <p className="mt-1 text-sm font-medium text-slate-800">
            Documentation Policy 2026
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {requirements.map((requirement) => (
          <div
            key={requirement}
            className="flex items-center gap-2 text-sm text-slate-600"
          >
            <span className="text-slate-400">•</span>
            {requirement}
          </div>
        ))}
      </div>
    </section>
  );
}
