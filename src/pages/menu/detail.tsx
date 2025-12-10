import { useMemo, useState } from 'react';
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
  ChefHat,
  MonitorCheck,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import MenuFormDialog from '@/components/menu/MenuFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMenu } from '@/contexts/menu';
import type { MenuItem } from '@/types/menu';

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

const isIcedMenu = (menu: MenuItem) =>
  /아이스|ICE/i.test(menu.name) || menu.tags.some((tag) => /아이스/i.test(tag));

const isWinterMenu = (menu: MenuItem) =>
  /라떼|핫|초코|윈터|연말/.test(menu.name) ||
  menu.tags.some((tag) => /겨울|핫/i.test(tag));

const buildSalesHistory = (menu: MenuItem | null) => {
  if (!menu) return [];
  const now = new Date();
  const seed = menu.id
    .split('')
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

  return Array.from({ length: HISTORY_LENGTH }, (_, idx) => {
    const offset = HISTORY_LENGTH - 1 - idx;
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const month = monthDate.getMonth();

    const seasonalBoost = (() => {
      if (isIcedMenu(menu)) {
        if (month >= 5 && month <= 8) return 1.35;
        if (month === 4 || month === 9) return 1.15;
        return 0.85;
      }
      if (isWinterMenu(menu)) {
        if (month === 11 || month <= 1) return 1.4;
        if (month === 2 || month === 10) return 1.15;
        return 0.9;
      }
      return 1;
    })();

    const base = 1600 + (menu.price / 100) * 8;
    const trend = 1 + (idx - HISTORY_LENGTH / 2) * 0.01;
    const noise = 1 + Math.sin(seed + idx * 1.2) * 0.08;
    const value = Math.max(
      400,
      Math.round(base * seasonalBoost * trend * noise),
    );

    return {
      label: `${monthDate.getFullYear()}.${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
      value,
    };
  });
};

const formatVolume = (value: number) =>
  `${value.toLocaleString()}잔`;

const formatPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

export default function MenuDetailPage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const navigate = useNavigate();
  const { menuId } = useParams<{ menuId: string }>();
  const location = useLocation();
  const state = location.state as { menu?: MenuItem } | null;
  const { menus, updateMenu } = useMenu();
  const menuFromContext = menus.find((item) => item.id === menuId);
  const menu = menuFromContext ?? state?.menu ?? null;
  const canEdit = !!menuFromContext;
  const salesHistory = useMemo(() => buildSalesHistory(menu), [menu]);

  const salesChartData = useMemo(
    () => ({
      labels: salesHistory.map((point) => point.label),
      datasets: [
        {
          label: '월 판매량',
          data: salesHistory.map((point) => point.value),
          borderColor: '#fb7185',
          backgroundColor: 'rgba(251, 113, 133, 0.15)',
          tension: 0.4,
          fill: {
            target: 'origin',
            above: 'rgba(251, 113, 133, 0.12)',
          },
          pointRadius: 3,
          pointBackgroundColor: '#f43f5e',
        },
      ],
    }),
    [salesHistory],
  );

  const salesChartOptions = useMemo(
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
              formatVolume(Number(context.raw)),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: string | number) =>
              `${Math.round(Number(value) / 100)}백잔`,
          },
          grid: { color: '#f1f5f9' },
        },
        x: { grid: { display: false } },
      },
    }),
    [],
  );

  const salesSummary = useMemo(() => {
    if (salesHistory.length === 0) return [];

    const latest = salesHistory[salesHistory.length - 1]!;
    const previous = salesHistory[salesHistory.length - 2] ?? latest;
    const yearAgo = salesHistory[0] ?? latest;
    const avgMonths = Math.min(3, salesHistory.length);
    const rollingAvg = Math.round(
      salesHistory
        .slice(-avgMonths)
        .reduce((sum, item) => sum + item.value, 0) / avgMonths,
    );
    const best = salesHistory.reduce(
      (prev, item) => (item.value > prev.value ? item : prev),
      salesHistory[0],
    );

    const momPercent = previous.value
      ? ((latest.value - previous.value) / previous.value) * 100
      : 0;
    const yoyPercent = yearAgo.value
      ? ((latest.value - yearAgo.value) / yearAgo.value) * 100
      : 0;

    const peakSeason = (() => {
      if (isIcedMenu(menu!)) return '여름 (6~8월)';
      if (isWinterMenu(menu!)) return '겨울 (12~2월)';
      return '연중 고른 판매';
    })();

    return [
      {
        label: '최근 월 판매량',
        value: formatVolume(latest.value),
        helper: `전년 동월 대비 ${formatPercent(yoyPercent)}`,
      },
      {
        label: '전월 대비',
        value: formatPercent(momPercent),
        helper: `${formatVolume(Math.abs(latest.value - previous.value))} ${
          latest.value >= previous.value ? '증가' : '감소'
        }`,
      },
      {
        label: '3개월 평균',
        value: formatVolume(rollingAvg),
        helper: '최근 3개월 기준',
      },
      {
        label: '피크 시즌',
        value: peakSeason,
        helper: `${best.label} 최고 ${formatVolume(best.value)}`,
      },
    ];
  }, [salesHistory, menu]);

  const handleGoBack = () => {
    navigate('/menu');
  };

  const handleMenuUpdate = (updatedMenu: MenuItem) => {
    updateMenu(updatedMenu);
    setIsEditOpen(false);
  };

  if (!menu) {
    return (
      <div className="space-y-6 p-8">
        <Button variant="ghost" onClick={handleGoBack} className="gap-2 px-0">
          <ArrowLeft className="h-4 w-4" />
          메뉴 보드로 돌아가기
        </Button>
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
          요청하신 메뉴 정보를 찾을 수 없습니다. 다시 목록에서 선택해 주세요.
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
            메뉴 보드로 돌아가기
          </Button>
          <p className="text-sm font-semibold text-amber-600">
            레시피 & 영양 정보
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{menu.name}</h1>
          <p className="text-gray-600">{menu.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={
              menu.availability === '시즌'
                ? 'bg-orange-50 text-orange-700'
                : 'bg-emerald-50 text-emerald-700'
            }
          >
            {menu.availability}
          </Badge>
          <Badge
            variant={menu.kioskExposure ? 'secondary' : 'outline'}
            className={
              menu.kioskExposure
                ? 'bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-600'
            }
          >
            {menu.kioskExposure ? '키오스크 노출' : '키오스크 숨김'}
          </Badge>
          {menu.seasonTerm ? (
            <Badge variant="outline" className="border-amber-200 text-amber-700">
              {menu.seasonTerm}
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            disabled={!canEdit}
            className="ml-auto"
            title={
              canEdit ? undefined : '목록에서 진입한 메뉴만 수정할 수 있습니다.'
            }
          >
            레시피 수정
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-gray-500">카테고리</dt>
                <dd className="text-base font-semibold text-gray-900">
                  {menu.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">판매가</dt>
                <dd className="text-base font-semibold text-gray-900">
                  {menu.price.toLocaleString()}원
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">출시일</dt>
                <dd className="text-base font-semibold text-gray-900">
                  {menu.releaseDate}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-gray-500">알레르겐</dt>
                <dd className="text-base font-semibold text-gray-900">
                  {menu.allergens.length > 0 ? menu.allergens.join(', ') : '없음'}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              {menu.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full overflow-hidden rounded-2xl bg-gray-100 lg:w-80">
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="h-64 w-full object-cover lg:h-full"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-semibold">13개월 판매 추이</h3>
              </div>
              <p className="text-xs text-gray-500">단위: 잔</p>
            </div>
            <div className="mt-4 h-72">
              <Line data={salesChartData} options={salesChartOptions} />
            </div>
          </div>
          <div className="grid flex-shrink-0 gap-3 sm:grid-cols-2 lg:w-72">
            {salesSummary.map((card) => (
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
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <UtensilsCrossed className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">성분 & 원재료</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {menu.ingredients.map((ingredient) => (
              <li key={ingredient.name}>
                <p className="font-medium text-gray-900">{ingredient.name}</p>
                {ingredient.detail ? (
                  <p className="text-sm text-gray-500">{ingredient.detail}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <ChefHat className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">레시피</h3>
          </div>
          <ol className="mt-4 space-y-4">
            {menu.recipe.map((step) => (
              <li key={step.order} className="flex gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-600">
                  {step.order}
                </span>
                <p className="text-sm text-gray-700">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <MonitorCheck className="h-5 w-5 text-sky-500" />
            <h3 className="text-lg font-semibold">영양 정보</h3>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { label: '칼로리', value: `${menu.nutrition.calories} kcal` },
              { label: '당류', value: `${menu.nutrition.sugar} g` },
              { label: '카페인', value: `${menu.nutrition.caffeine} mg` },
            ].map((nutrient) => (
              <div
                key={nutrient.label}
                className="rounded-lg bg-gray-50 p-3 text-center"
              >
                <dt className="text-xs text-gray-500">{nutrient.label}</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {nutrient.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <Sparkles className="h-5 w-5 text-fuchsia-500" />
            <h3 className="text-lg font-semibold">판매 포인트</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {menu.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-sm text-gray-700">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                <span>{highlight}</span>
              </li>
            ))}
            {menu.highlights.length === 0 ? (
              <li className="text-sm text-gray-500">
                등록된 판매 포인트가 없습니다.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
      <MenuFormDialog
        open={isEditOpen}
        mode="edit"
        initialMenu={menuFromContext ?? menu}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleMenuUpdate}
      />
    </div>
  );
}
