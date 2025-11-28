import { useMemo } from 'react';

import type {
  HighlightMetric,
  PieSlice,
  TrendPoint,
} from '@/types/charts';

function buildPieGradient(slices: PieSlice[]) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total === 0) {
    return 'conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)';
  }

  let currentAngle = 0;
  const stops = slices.map((slice) => {
    const degrees = (slice.value / total) * 360;
    const start = currentAngle;
    const end = currentAngle + degrees;
    currentAngle = end;
    return `${slice.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(', ')})`;
}

type AnalyticsOverviewProps = {
  title: string;
  description?: string;
  trend: TrendPoint[];
  pie: PieSlice[];
  metrics?: HighlightMetric[];
};

export default function AnalyticsOverview({
  title,
  description,
  trend,
  pie,
  metrics = [],
}: AnalyticsOverviewProps) {
  const maxValue = Math.max(...trend.map((point) => point.value), 1);
  const pieGradient = useMemo(() => buildPieGradient(pie), [pie]);
  const pieTotal = pie.reduce((sum, slice) => sum + slice.value, 0) || 1;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        ) : null}
      </header>

      <div className="grid gap-8 px-6 py-6 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-semibold text-gray-500">매출 추이</p>
          <div className="flex h-48 items-end gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 pb-4 pt-6">
            {trend.map((point) => (
              <div key={point.label} className="flex-1 text-center">
                <div
                  className="mx-auto w-4 rounded-full bg-indigo-500"
                  style={{
                    height: `${(point.value / maxValue) * 100}%`,
                    minHeight: point.value ? 12 : 4,
                  }}
                />
                <div className="mt-3 text-xs text-gray-500">{point.label}</div>
                <div className="text-xs font-semibold text-gray-700">
                  {point.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold text-gray-500">판매 비중</p>
          <div className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-gray-50 p-6 md:flex-row md:items-center">
            <div
              className="mx-auto h-40 w-40 rounded-full border border-white shadow-inner"
              style={{ backgroundImage: pieGradient }}
            />

            <div className="flex-1 space-y-3">
              {pie.map((slice) => (
                <div key={slice.label} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="flex-1 text-sm text-gray-600">
                    {slice.label}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.round((slice.value / pieTotal) * 100)}
                    %
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {metrics.length > 0 ? (
        <div className="grid gap-4 border-t border-gray-100 px-6 py-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {metric.label}
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              {metric.helper ? (
                <div className="text-xs text-gray-500">{metric.helper}</div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
