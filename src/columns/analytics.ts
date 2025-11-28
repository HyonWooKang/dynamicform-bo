import type { DataBoardColumn } from '@/components/data-board/DataBoard';
import type { ReportRow } from '@/types/analytics';

export const analyticsReportColumns: DataBoardColumn<ReportRow>[] = [
  { key: 'name', header: '리포트' },
  { key: 'owner', header: '담당자' },
  { key: 'interval', header: '수집 주기' },
  { key: 'status', header: '상태' },
];
