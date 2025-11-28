import type { ReportRow } from '@/types/analytics';
import type { HighlightMetric } from '@/types/charts';
import type { PieSlice, TrendPoint } from '@/types/charts';

export const retentionTrendData: TrendPoint[] = [
  { label: '1주', value: 82 },
  { label: '2주', value: 68 },
  { label: '3주', value: 54 },
  { label: '4주', value: 41 },
];

export const retentionPieData: PieSlice[] = [
  { label: '핵심 사용자', value: 48, color: '#22c55e' },
  { label: '일시 사용자', value: 32, color: '#a855f7' },
  { label: '이탈 위험', value: 20, color: '#f87171' },
];

export const retentionMetrics: HighlightMetric[] = [
  { label: '4주차 리텐션', value: '41%', helper: '전주 대비 +3%' },
  { label: '재방문 폼 수', value: '126개', helper: '지난달 +11%' },
  { label: '이탈 경고', value: '8건', helper: '담당자 확인 필요' },
];

export const analyticsReportData: ReportRow[] = [
  {
    id: 'report-001',
    name: '월간 리텐션 분석',
    owner: '김지현',
    interval: '매주',
    status: '자동 배포',
  },
  {
    id: 'report-002',
    name: '캠페인 유입 리포트',
    owner: '이민수',
    interval: '격주',
    status: '검토 중',
  },
  {
    id: 'report-003',
    name: 'CS VOC 집계',
    owner: '박소영',
    interval: '월 1회',
    status: '중지',
  },
];
