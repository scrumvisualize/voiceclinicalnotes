import type { Finding } from '../types/clinical';

export interface ClinicalHistoryItem {
  id: string;
  createdAt: string;
  note: string;
  findings: Finding[];
  score: number;
}

interface Props {
  history: ClinicalHistoryItem[];
  onView: (item: ClinicalHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function getScore(findings: Finding[]) {
  if (findings.length === 0) {
    return 0;
  }

  const total = findings.reduce((sum, finding) => {
    switch (finding.status) {
      case 'PASS':
        return sum + 100;
      case 'REVIEW':
        return sum + 50;
      case 'FAIL':
        return sum;
      default:
        return sum;
    }
  }, 0);

  return Math.round(total / findings.length);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ClinicalHistory({
  history,
  onView,
  onDelete,
  onClearAll
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            History
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent Clinical Notes
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your latest 5 analysed clinical notes.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No analysed clinical notes yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const score = getScore(item.findings);

            return (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(item.createdAt)}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.note}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                        Score: {score}%
                      </span>

                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {
                          item.findings.filter(
                            (finding) => finding.status === 'PASS'
                          ).length
                        }{' '}
                        / {item.findings.length} passed
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => onView(item)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      View
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded-md border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
        History is stored locally in this browser.
      </p>
    </section>
  );
}
