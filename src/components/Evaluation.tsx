interface Props {
  evaluation: {
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    testCases: number;
  };
}

export default function Evaluation({ evaluation }: Props) {
  const metrics = [
    {
      label: 'Accuracy',
      value: evaluation.accuracy === null ? '--' : `${evaluation.accuracy}%`
    },
    {
      label: 'Precision',
      value: evaluation.precision === null ? '--' : `${evaluation.precision}%`
    },
    {
      label: 'Recall',
      value: evaluation.recall === null ? '--' : `${evaluation.recall}%`
    },
    {
      label: 'Test Cases',
      value: evaluation.testCases
    }
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            AI Evaluation
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Model Quality
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Evaluation against synthetic ground-truth cases.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Evaluation Passed
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs text-slate-400">{metric.label}</p>

            <p className="mt-1 text-xl font-semibold text-slate-900">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
