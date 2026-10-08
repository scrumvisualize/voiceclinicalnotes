import type { Finding } from '../types/clinical';

interface Props {
  findings: Finding[];
}

function getStatusClasses(status: Finding['status']) {
  switch (status) {
    case 'PASS':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';

    case 'REVIEW':
      return 'bg-amber-50 text-amber-700 border-amber-200';

    case 'FAIL':
      return 'bg-red-50 text-red-700 border-red-200';
  }
}

function getStatusIcon(status: Finding['status']) {
  switch (status) {
    case 'PASS':
      return '✓';

    case 'REVIEW':
      return '⚠';

    case 'FAIL':
      return '×';
  }
}

function calculateScore(findings: Finding[]) {
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

export default function AIAnalysis({ findings }: Props) {
  const score = calculateScore(findings);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            AI Analysis
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            GPT-6 Sol
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Clinical documentation compliance analysis.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {findings.length > 0 ? score : '--'}
          </p>

          <p className="text-[10px] uppercase tracking-wide text-blue-500">
            Score
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {findings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              Enter a clinical note and run AI analysis to see the results.
            </p>
          </div>
        ) : (
          findings.map((finding) => (
            <div
              key={finding.requirement}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${getStatusClasses(
                      finding.status
                    )}`}
                  >
                    {getStatusIcon(finding.status)}
                  </span>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {finding.requirement}
                    </p>

                    {finding.value && (
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {finding.value}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-500">
                      {finding.explanation}
                    </p>
                  </div>
                </div>

                <span className="ml-3 shrink-0 text-xs font-medium text-slate-400">
                  {Math.round(finding.confidence * 100)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
