interface Props {
  evaluation: {
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    testCases: number;
  };
}

const threshold = 80;

const metricDescriptions: Record<string, string> = {
  Accuracy: 'Overall proportion of correct predictions.',
  Precision: 'How many positive predictions were correct.',
  Recall: 'How many actual positive cases were identified.'
};

export default function Evaluation({ evaluation }: Props) {
  const metrics = [
    {
      label: 'Accuracy',
      value: evaluation.accuracy,
      description: metricDescriptions.Accuracy
    },
    {
      label: 'Precision',
      value: evaluation.precision,
      description: metricDescriptions.Precision
    },
    {
      label: 'Recall',
      value: evaluation.recall,
      description: metricDescriptions.Recall
    }
  ];

  const validTestCount =
    Number.isInteger(evaluation.testCases) && evaluation.testCases > 0;

  const validMetrics = metrics.every(
    (metric) =>
      metric.value !== null &&
      Number.isFinite(metric.value) &&
      metric.value >= 0 &&
      metric.value <= 100
  );

  const hasResults = validTestCount && validMetrics;

  const passed =
    hasResults && metrics.every((metric) => metric.value! >= threshold);

  const status = !hasResults
    ? {
        label: 'Evaluation Incomplete',
        classes:
          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      }
    : passed
      ? {
          label: 'Evaluation Passed',
          classes:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        }
      : {
          label: 'Needs Improvement',
          classes:
            'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        };

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
      aria-labelledby="evaluation-title"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            AI Evaluation
          </p>

          <h2
            id="evaluation-title"
            className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100"
          >
            Model Quality
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Performance against synthetic ground-truth cases.
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${status.classes}`}
          role="status"
        >
          {status.label}
        </span>
      </div>

      {/* Evaluation metrics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const value = metric.value;
          const valid =
            value !== null &&
            Number.isFinite(value) &&
            value >= 0 &&
            value <= 100;

          const metricPassed = valid && value >= threshold;

          return (
            <div
              key={metric.label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {metric.label}
              </p>

              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {valid ? `${value}%` : '--'}
              </p>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                role="progressbar"
                aria-label={`${metric.label} score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={valid ? value : undefined}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    !valid
                      ? 'bg-slate-400'
                      : metricPassed
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${valid ? value : 0}%`
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {metric.description}
              </p>
            </div>
          );
        })}

        {/* Test case count */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Test Cases
          </p>

          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {validTestCount ? evaluation.testCases : '--'}
          </p>

          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Number of synthetic cases evaluated against expected results.
          </p>
        </div>
      </div>

      {/* Evaluation criteria */}
      <div className="mt-5 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-slate-500 dark:text-slate-400">
            {passed ? '✓' : hasResults ? '!' : 'i'}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Evaluation criteria
            </p>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {hasResults
                ? passed
                  ? `All three metrics meet the ${threshold}% threshold.`
                  : `One or more metrics are below the ${threshold}% threshold.`
                : 'Valid results for all three metrics and at least one test case are required.'}
            </p>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Threshold: {threshold}% per metric. This is a configurable
              demonstration criterion, not a clinical safety standard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
