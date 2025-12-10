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

export default function DashboardPage() {
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
