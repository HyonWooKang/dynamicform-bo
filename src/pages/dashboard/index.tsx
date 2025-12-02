import {
  dashboardRegionColumns,
  dashboardTopMenuColumns,
  dashboardTopStoreColumns,
} from '@/columns/dashboard';
import {
  dashboardCategoryShare,
  dashboardHourlySalesTrend,
  dashboardKioskStatus,
  dashboardOverviewMetrics,
  dashboardRegionData,
  dashboardStatHighlights,
  dashboardTopMenuData,
  dashboardTopStoreData,
} from '@/data/dashboard';

import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import DataBoard from '@/components/data-board/DataBoard';
import KioskStatusMonitor from '@/components/kiosk/KioskStatusMonitor';
import StatHighlights from '@/components/stats/StatHighlights';

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <p className="text-sm font-semibold text-amber-600">MEGI COFFEE</p>
        <h1 className="text-3xl font-bold text-gray-900">
          MEGI COFFEE 대시보드
        </h1>
        <p className="text-gray-600">
          전국 매장의 실시간 매출 흐름, 인기 메뉴, 키오스크 상태까지 한 번에
          확인하세요.
        </p>
      </div>

      <StatHighlights items={dashboardStatHighlights} />

      <AnalyticsOverview
        title="시간대별 매출 & 카테고리 비중"
        description="모닝/카페 피크 시간과 카테고리별 매출 비율을 동시에 모니터링합니다."
        trend={dashboardHourlySalesTrend}
        pie={dashboardCategoryShare}
        metrics={dashboardOverviewMetrics}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <DataBoard
          title="지점별 매출 TOP 10"
          columns={dashboardTopStoreColumns}
          data={dashboardTopStoreData}
          searchPlaceholder="지점명 검색"
        />
        <DataBoard
          title="가장 많이 팔린 메뉴 TOP 10"
          columns={dashboardTopMenuColumns}
          data={dashboardTopMenuData}
          searchPlaceholder="메뉴 검색"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataBoard
          title="지역별 매출 비교"
          columns={dashboardRegionColumns}
          data={dashboardRegionData}
          searchPlaceholder="지역명 검색"
        />

        <KioskStatusMonitor items={dashboardKioskStatus} />
      </div>
    </div>
  );
}
