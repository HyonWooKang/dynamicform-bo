import { useMemo, useState, type ReactNode } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import BranchFormDialog from '@/components/branch/BranchFormDialog';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/contexts/branch';
import type { BranchRow } from '@/types/branch';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const HISTORY_LENGTH = 13;

type RevenuePoint = {
  label: string;
  value: number;
};

const formatCurrency = (value: number) =>
  `${value.toLocaleString()}원`;

const formatPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

const buildRevenueHistory = (branch: BranchRow | null): RevenuePoint[] => {
  if (!branch) return [];

  const seed = branch.id
    .split('')
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

  const multipliers = Array.from({ length: HISTORY_LENGTH }, (_, idx) => {
    const drift = 0.82 + idx * 0.015;
    const noise = Math.sin(seed + idx * 1.7) * 0.05;
    return Math.max(0.6, drift + noise);
  });

  const latest = multipliers[multipliers.length - 1] ?? 1;
  const normalized = multipliers.map((value) => value / latest);
  const now = new Date();

  return normalized.map((multiplier, idx) => {
    const monthOffset = HISTORY_LENGTH - 1 - idx;
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset,
      1,
    );
    const label = `${monthDate.getFullYear()}.${String(
      monthDate.getMonth() + 1,
    ).padStart(2, '0')}`;
    const value = Math.max(
      12000000,
      Math.round((branch.monthlyRevenue * multiplier) / 1000) * 1000,
    );

    return { label, value };
  });
};

export default function BranchDetailPage() {
  const navigate = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();
  const location = useLocation();
  const state = location.state as { branch?: BranchRow } | null;
  const { branches, updateBranch } = useBranch();
  const branchFromContext = branches.find((branch) => branch.id === branchId);
  const branch = branchFromContext ?? state?.branch ?? null;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const revenueHistory = useMemo(
    () => buildRevenueHistory(branch),
    [branch],
  );

  const revenueChartData = useMemo(
    () => ({
      labels: revenueHistory.map((item) => item.label),
      datasets: [
        {
          label: '월 매출',
          data: revenueHistory.map((item) => item.value),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          tension: 0.4,
          fill: {
            target: 'origin',
            above: 'rgba(99, 102, 241, 0.12)',
          },
          pointRadius: 3,
          pointBackgroundColor: '#4f46e5',
        },
      ],
    }),
    [revenueHistory],
  );

  const revenueChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) =>
              formatCurrency(Number(context.raw)),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value: string | number) =>
              `${Math.round(Number(value) / 1000000)}백만원`,
          },
          grid: {
            color: '#f1f5f9',
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    }),
    [],
  );

  const revenueSummary = useMemo(() => {
    if (revenueHistory.length === 0) {
      return [];
    }

    const latestValue = revenueHistory[revenueHistory.length - 1]?.value ?? 0;
    const previousValue =
      revenueHistory[revenueHistory.length - 2]?.value ?? latestValue;
    const yearAgoValue = revenueHistory[0]?.value ?? latestValue;
    const avgMonths = Math.min(3, revenueHistory.length);
    const threeMonthAverage = Math.round(
      revenueHistory
        .slice(-avgMonths)
        .reduce((sum, item) => sum + item.value, 0) / avgMonths,
    );
    const bestMonth = revenueHistory.reduce(
      (prev, item) => (item.value > prev.value ? item : prev),
      revenueHistory[0],
    );

    const momPercent = previousValue
      ? ((latestValue - previousValue) / previousValue) * 100
      : 0;
    const yoyPercent = yearAgoValue
      ? ((latestValue - yearAgoValue) / yearAgoValue) * 100
      : 0;

    return [
      {
        label: '이번 달 매출',
        value: formatCurrency(latestValue),
        helper: `전년 동월 대비 ${formatPercent(yoyPercent)}`,
      },
      {
        label: '전월 대비',
        value: formatPercent(momPercent),
        helper: `${formatCurrency(Math.abs(latestValue - previousValue))} ${
          latestValue >= previousValue ? '증가' : '감소'
        }`,
      },
      {
        label: '3개월 평균',
        value: formatCurrency(threeMonthAverage),
        helper: '최근 3개월 기준',
      },
      {
        label: '최고 매출',
        value: formatCurrency(bestMonth.value),
        helper: bestMonth.label,
      },
    ];
  }, [revenueHistory]);

  const ordersSummary = useMemo(() => {
    if (!branch) return [];
    return branch.orders.map((order) => ({
      ...order,
      label: `${order.name} · ${order.quantity.toLocaleString()}개`,
    }));
  }, [branch]);

  const handleGoBack = () => {
    navigate('/branch');
  };

  const handleUpdate = (updated: BranchRow) => {
    updateBranch(updated);
    setIsEditOpen(false);
  };

  if (!branch) {
    return (
      <div className="space-y-6 p-8">
        <Button variant="ghost" onClick={handleGoBack} className="gap-2 px-0">
          <ArrowLeft className="h-4 w-4" />
          지점 보드로 돌아가기
        </Button>
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
          요청하신 지점 정보를 찾을 수 없습니다. 다시 목록에서 선택해 주세요.
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" onClick={handleGoBack} className="gap-2 px-0">
            <ArrowLeft className="h-4 w-4" />
            지점 보드로 돌아가기
          </Button>
          <p className="text-sm font-semibold text-amber-600">운영 정보</p>
          <h1 className="text-3xl font-bold text-gray-900">{branch.branch}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1 text-gray-700">
              <MapPin className="h-4 w-4" /> {branch.region}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              ID: {branch.id}
            </span>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => setIsEditOpen(true)}>
          정보 수정
        </Button>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard label="운영 시간" value={branch.operatingHours} icon={<ClipboardList className="h-4 w-4" />} />
          <InfoCard
            label="이번달 매출"
            value={`${branch.monthlyRevenue.toLocaleString()}원`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <InfoCard label="매출 추이" value={branch.revenueTrend} icon={<TrendingUp className="h-4 w-4" />} />
          <InfoCard
            label="컴플레인(최근 3개월)"
            value={`${branch.complaintsLastQuarter.toLocaleString()}건`}
            icon={<ClipboardList className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold">13개월 매출 추이</h3>
              </div>
              <p className="text-xs text-gray-500">단위: 원</p>
            </div>
            <div className="mt-4 h-72">
              <Line data={revenueChartData} options={revenueChartOptions} />
            </div>
          </div>
          <div className="grid flex-shrink-0 gap-3 sm:grid-cols-2 lg:w-72">
            {revenueSummary.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <p className="text-xs uppercase text-gray-500">{card.label}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">{card.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <Users className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">점장 및 인력</h3>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">점장</p>
              <p className="text-base font-semibold text-gray-900">{branch.manager}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500">근무 인원</p>
              <p className="text-base font-semibold text-gray-900">{branch.staffCount}명</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">최근 주문 재료</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {ordersSummary.map((order) => (
              <li
                key={order.name}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-semibold text-gray-900">{order.label}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    order.isDelivery
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {order.isDelivery ? '배달' : '직접 수령'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BranchFormDialog
        open={isEditOpen}
        mode="edit"
        initialBranch={branchFromContext ?? branch}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

type InfoCardProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

function InfoCard({ label, value, icon }: InfoCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      {icon ? <span className="text-gray-500">{icon}</span> : null}
      <div>
        <p className="text-xs uppercase text-gray-500">{label}</p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
