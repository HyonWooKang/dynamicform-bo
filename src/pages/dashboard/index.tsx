import { useMemo } from 'react';

import {
  dashboardRegionColumns,
  dashboardTopMenuColumns,
  dashboardTopStoreColumns,
} from '@/columns/dashboard';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import DataBoard from '@/components/data-board/DataBoard';
import KioskStatusMonitor from '@/components/kiosk/KioskStatusMonitor';
import StatHighlights from '@/components/stats/StatHighlights';
import { useBranch } from '@/contexts/branch';
import { useKiosk } from '@/contexts/kiosk';
import { useMenu } from '@/contexts/menu';
import { buildBranchRevenueHistory, buildMenuSalesHistory } from '@/libs/utils/insights';
import type { HighlightMetric, PieSlice, TrendPoint } from '@/types/charts';
import type { MenuRow, RegionRow, StoreRow } from '@/types/dashboard';

const categoryPalette = [
  '#6366f1',
  '#f97316',
  '#14b8a6',
  '#f43f5e',
  '#a855f7',
  '#0ea5e9',
];

const formatCurrency = (value: number) => `${value.toLocaleString()}원`;
const formatPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
const formatVolume = (value: number) => `${value.toLocaleString()}잔`;

const normalizeRegion = (value: string) => {
  if (/(서울|경기|인천)/.test(value)) return '수도권';
  if (/(부산|울산|대구|경남|경북|창원|김해)/.test(value)) return '영남권';
  if (/(대전|세종|충청|충북|충남)/.test(value)) return '충청권';
  if (/(광주|전주|전남|전북|호남)/.test(value)) return '호남권';
  if (/(강원|제주)/.test(value)) return '강원/제주';
  return '기타';
};

export default function DashboardPage() {
  const { branches } = useBranch();
  const { menus } = useMenu();
  const { kiosks } = useKiosk();

  const branchInsights = useMemo(
    () =>
      branches.map((branch) => {
        const history = buildBranchRevenueHistory(branch);
        const latest = history.at(-1)?.value ?? branch.monthlyRevenue;
        const previous = history.at(-2)?.value ?? latest;
        return { branch, history, latest, previous };
      }),
    [branches],
  );

  const menuInsights = useMemo(
    () =>
      menus.map((menu) => {
        const history = buildMenuSalesHistory(menu);
        const latest = history.at(-1)?.value ?? 0;
        const previous = history.at(-2)?.value ?? latest;
        return { menu, history, latest, previous };
      }),
    [menus],
  );

  const salesTrend: TrendPoint[] = useMemo(() => {
    if (!branchInsights.length) return [];
    const length = branchInsights[0].history.length;
    return Array.from({ length }, (_, idx) => {
      const label = branchInsights[0].history[idx]?.label ?? '';
      const value = branchInsights.reduce(
        (sum, item) => sum + (item.history[idx]?.value ?? 0),
        0,
      );
      return { label, value };
    });
  }, [branchInsights]);

  const branchTotals = useMemo(() => {
    const total = branchInsights.reduce((sum, item) => sum + item.latest, 0);
    const previous = branchInsights.reduce(
      (sum, item) => sum + item.previous,
      0,
    );
    const sorted = [...branchInsights].sort((a, b) => b.latest - a.latest);
    return {
      total,
      previous,
      sorted,
      top: sorted[0] ?? null,
    };
  }, [branchInsights]);

  const menuTotals = useMemo(() => {
    const total = menuInsights.reduce((sum, item) => sum + item.latest, 0);
    const previous = menuInsights.reduce(
      (sum, item) => sum + item.previous,
      0,
    );
    const sorted = [...menuInsights].sort((a, b) => b.latest - a.latest);
    return {
      total,
      previous,
      sorted,
      top: sorted[0] ?? null,
    };
  }, [menuInsights]);

  const categoryShare: PieSlice[] = useMemo(() => {
    const totals = new Map<string, number>();
    menuInsights.forEach(({ menu, latest }) => {
      totals.set(menu.category, (totals.get(menu.category) ?? 0) + latest);
    });
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], index) => ({
        label,
        value,
        color: categoryPalette[index % categoryPalette.length],
      }));
  }, [menuInsights]);

  const overviewMetrics: HighlightMetric[] = useMemo(() => {
    const metrics: HighlightMetric[] = [];
    if (branchTotals.top) {
      metrics.push({
        label: '최고 매출 지점',
        value: branchTotals.top.branch.branch,
        helper: formatCurrency(branchTotals.top.latest),
      });
    }
    if (menuTotals.top) {
      metrics.push({
        label: '베스트셀러',
        value: menuTotals.top.menu.name,
        helper: formatVolume(menuTotals.top.latest),
      });
    }
    metrics.push({
      label: '카테고리 수',
      value: `${categoryShare.length}개`,
      helper: '활성 판매 카테고리',
    });
    return metrics;
  }, [branchTotals.top, menuTotals.top, categoryShare.length]);

  const statHighlights = useMemo(() => {
    const revenueTrend =
      branchTotals.previous > 0
        ? ((branchTotals.total - branchTotals.previous) /
            branchTotals.previous) *
          100
        : 0;
    const menuTrend =
      menuTotals.previous > 0
        ? ((menuTotals.total - menuTotals.previous) / menuTotals.previous) * 100
        : 0;
    const onlineCount = kiosks.filter((kiosk) => kiosk.powerStatus === 'on').length;
    const cautionCount = kiosks.filter(
      (kiosk) => kiosk.networkStatus === '주의',
    ).length;
    const maintenanceCount = kiosks.filter(
      (kiosk) => kiosk.networkStatus === '점검 필요',
    ).length;
    const totalKiosks = kiosks.length || 1;

    return [
      {
        label: '이번 달 총 매출',
        value: formatCurrency(branchTotals.total),
        helper: `${branches.length.toLocaleString()}개 지점`,
        trend: {
          label: '전월 대비',
          value: formatPercent(revenueTrend),
          isPositive: revenueTrend >= 0,
        },
      },
      {
        label: '월간 주문 수',
        value: formatVolume(menuTotals.total),
        helper: menuTotals.top
          ? `${menuTotals.top.menu.name} 베스트셀러`
          : '등록된 메뉴 없음',
        trend: {
          label: '전월 대비',
          value: formatPercent(menuTrend),
          isPositive: menuTrend >= 0,
        },
      },
      {
        label: '운영 중 키오스크',
        value: `${onlineCount.toLocaleString()}대 / ${kiosks.length.toLocaleString()}대`,
        helper: `${Math.round((onlineCount / totalKiosks) * 100)}% 정상`,
        trend: {
          label: 'OFF',
          value: `${(kiosks.length - onlineCount).toLocaleString()}대`,
          isPositive: onlineCount >= kiosks.length - onlineCount,
        },
      },
      {
        label: '네트워크 주의 알림',
        value: `${cautionCount.toLocaleString()}건`,
        helper: `점검 필요 ${maintenanceCount.toLocaleString()}건`,
        trend: {
          label: '전체 대비',
          value: `${Math.round(
            ((cautionCount + maintenanceCount) / totalKiosks) * 100,
          )}%`,
          isPositive: false,
        },
      },
    ];
  }, [branchTotals, menuTotals, kiosks, branches.length]);

  const topStoreRows: StoreRow[] = useMemo(
    () =>
      branchTotals.sorted.slice(0, 10).map((item, index) => {
        const growth =
          item.previous > 0
            ? ((item.latest - item.previous) / item.previous) * 100
            : 0;
        return {
          rank: index + 1,
          store: item.branch.branch,
          revenue: item.latest,
          growth: formatPercent(growth),
        };
      }),
    [branchTotals.sorted],
  );

  const totalOrders = menuTotals.total || 1;
  const topMenuRows: MenuRow[] = useMemo(
    () =>
      menuTotals.sorted.slice(0, 10).map((item, index) => ({
        rank: index + 1,
        menu: item.menu.name,
        ratio: `${Math.round((item.latest / totalOrders) * 100)}%`,
        orders: item.latest,
      })),
    [menuTotals.sorted, totalOrders],
  );

  const regionRows: RegionRow[] = useMemo(() => {
    const regionMap = new Map<
      string,
      { latest: number; previous: number }
    >();
    branchInsights.forEach((item) => {
      const key = normalizeRegion(item.branch.region);
      const entry = regionMap.get(key) ?? { latest: 0, previous: 0 };
      entry.latest += item.latest;
      entry.previous += item.previous;
      regionMap.set(key, entry);
    });

    return Array.from(regionMap.entries())
      .map(([region, value]) => {
        const wow =
          value.previous > 0
            ? ((value.latest - value.previous) / value.previous) * 100
            : 0;
        return {
          region,
          sales: value.latest,
          wow: formatPercent(wow),
        };
      })
      .sort((a, b) => b.sales - a.sales);
  }, [branchInsights]);

  const kioskStatusItems = useMemo(() => {
    const online = kiosks.filter((item) => item.powerStatus === 'on').length;
    const offline = kiosks.length - online;
    const caution = kiosks.filter((item) => item.networkStatus === '주의').length;
    const maintenance = kiosks.filter(
      (item) => item.networkStatus === '점검 필요',
    ).length;

    return [
      { label: '온라인', count: online, description: '정상 운영', color: '#10b981' },
      {
        label: '전원 OFF',
        count: offline,
        description: '현장 점검 필요',
        color: '#f97316',
      },
      {
        label: '네트워크 주의',
        count: caution,
        description: '속도 저하 감지',
        color: '#facc15',
      },
      {
        label: '점검 필요',
        count: maintenance,
        description: '원격 복구 예정',
        color: '#ef4444',
      },
    ];
  }, [kiosks]);

  return (
    <div className="space-y-8 p-8">
      <div>
        <p className="text-sm font-semibold text-amber-600">SUPER COFFEE</p>
        <h1 className="text-3xl font-bold text-gray-900">
          SUPER COFFEE 대시보드
        </h1>
        <p className="text-gray-600">
          지점 데이터와 실시간 메뉴 판매 추이를 바탕으로 매출 흐름과
          키오스크 운영 상태를 확인하세요.
        </p>
      </div>

      <StatHighlights items={statHighlights} />

      <AnalyticsOverview
        title="월간 매출 & 카테고리 비중"
        description="지점 매출 히스토리와 메뉴 카테고리별 판매 비중을 한 화면에서 비교합니다."
        trend={salesTrend}
        pie={categoryShare}
        metrics={overviewMetrics}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <DataBoard
          title="지점별 매출 TOP 10"
          columns={dashboardTopStoreColumns}
          data={topStoreRows}
          searchPlaceholder="지점명 검색"
        />
        <DataBoard
          title="가장 많이 팔린 메뉴 TOP 10"
          columns={dashboardTopMenuColumns}
          data={topMenuRows}
          searchPlaceholder="메뉴 검색"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataBoard
          title="지역별 매출 비교"
          columns={dashboardRegionColumns}
          data={regionRows}
          searchPlaceholder="지역명 검색"
        />

        <KioskStatusMonitor items={kioskStatusItems} />
      </div>
    </div>
  );
}
