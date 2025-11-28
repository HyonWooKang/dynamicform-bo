import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import DataBoard from '@/components/data-board/DataBoard';
import { analyticsReportColumns } from '@/columns/analytics';
import {
  analyticsReportData,
  retentionMetrics,
  retentionPieData,
  retentionTrendData,
} from '@/data/analytics';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">통계</h1>
        <p className="text-gray-600">
          고객 리텐션·캠페인 성과 데이터를 한 곳에 모아 매장 운영 전략을
          수립하세요.
        </p>
      </div>

      <AnalyticsOverview
        title="사용자 리텐션 리포트"
        description="주차별 유지율과 사용자 군집 비중을 함께 비교합니다."
        trend={retentionTrendData}
        pie={retentionPieData}
        metrics={retentionMetrics}
      />

      <DataBoard
        title="자동 배포 리포트"
        columns={analyticsReportColumns}
        data={analyticsReportData}
        searchPlaceholder="리포트명 또는 담당자 검색"
        onSearch={(keyword) => console.log('search', keyword)}
        actions={[
          { label: '열기', onClick: (row) => console.log('open', row) },
          {
            label: '중지',
            variant: 'ghost',
            onClick: (row) => console.log('pause', row),
          },
        ]}
      />
    </div>
  );
}
