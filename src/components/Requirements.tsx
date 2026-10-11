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
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Checked Against
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Payer & Compliance Requirements
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500">Payer</p>

          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            Synthetic Payer A
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500">Service</p>

          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            Physical Therapy
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500">Policy</p>

          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
            Documentation Policy 2026
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {requirements.map((requirement) => (
          <div
            key={requirement}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <span className="text-slate-400 dark:text-slate-500">•</span>
            {requirement}
          </div>
        ))}
      </div>
    </section>
  );
}
