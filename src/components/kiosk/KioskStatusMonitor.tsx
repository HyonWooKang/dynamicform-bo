import type { KioskStatusItem } from '@/types/dashboard';

type KioskStatusMonitorProps = {
  items: KioskStatusItem[];
};

export default function KioskStatusMonitor({
  items,
}: KioskStatusMonitorProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="md:min-w-[220px]">
          <h3 className="text-lg font-semibold text-gray-900">
            키오스크 상태 모니터링
          </h3>
          <p className="text-sm text-gray-500">
            실시간 점검 상태 – 총 {total.toLocaleString()}대
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {item.label}
                </div>
                <div className="text-xs text-gray-500">
                  {item.count.toLocaleString()}대 · {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
