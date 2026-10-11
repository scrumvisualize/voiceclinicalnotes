interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="border-b border-slate-200 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            ClinAI
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Clinical AI Documentation Assistant
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-flex dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
            Synthetic Data
          </span>

          <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System Ready
          </span>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            aria-pressed={isDark}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
            <span>{isDark ? 'Light' : 'Dark'} mode</span>
          </button>
        </div>
      </div>
    </header>
  );
}
