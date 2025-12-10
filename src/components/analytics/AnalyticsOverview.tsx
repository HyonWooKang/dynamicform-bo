import { useMemo } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

import type {
  HighlightMetric,
  PieSlice,
  TrendPoint,
} from '@/types/charts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
);

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
  const safeTrend = trend.length
    ? trend
    : [{ label: '데이터 없음', value: 0 }];
  const safePie = pie.length
    ? pie
    : [{ label: '데이터 없음', value: 1, color: '#e5e7eb' }];

  const lineData = useMemo(
    () => ({
      labels: safeTrend.map((point) => point.label),
      datasets: [
        {
          label: '매출',
          data: safeTrend.map((point) => point.value),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          tension: 0.35,
          fill: {
            target: 'origin',
            above: 'rgba(99, 102, 241, 0.12)',
          },
          pointRadius: 3,
          pointBackgroundColor: '#4f46e5',
        },
      ],
    }),
    [safeTrend],
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' as const },
      plugins: { legend: { display: false } },
      scales: {
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            callback: (value: string | number) =>
              `${Math.round(Number(value) / 1_000_000)}백만`,
          },
        },
        x: { grid: { display: false } },
      },
    }),
    [],
  );

  const doughnutData = useMemo(
    () => ({
      labels: safePie.map((slice) => slice.label),
      datasets: [
        {
          data: safePie.map((slice) => slice.value),
          backgroundColor: safePie.map((slice) => slice.color),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }),
    [safePie],
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: { legend: { display: false } },
    }),
    [],
  );

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
          <div className="h-64 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold text-gray-500">판매 비중</p>
          <div className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-gray-50 p-6 md:flex-row md:items-center">
            <div className="mx-auto h-40 w-40">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>

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
                    {Math.round((slice.value / pieTotal) * 100)}%
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
