import type { StatHighlight } from '@/types/dashboard';

type StatHighlightsProps = {
  items: StatHighlight[];
};

export default function StatHighlights({ items }: StatHighlightsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {item.value}
          </p>
          {item.helper ? (
            <p className="text-sm text-gray-500">{item.helper}</p>
          ) : null}
          {item.trend ? (
            <div className="mt-3 text-sm">
              <span
                className={
                  item.trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }
              >
                {item.trend.value}
              </span>{' '}
              <span className="text-gray-500">{item.trend.label}</span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
