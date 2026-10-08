export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            ClinAI
          </h1>

          <p className="text-sm text-slate-500">
            Clinical AI Documentation Assistant
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Synthetic Data
          </span>

          <span className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System Ready
          </span>
        </div>
      </div>
    </header>
  );
}
