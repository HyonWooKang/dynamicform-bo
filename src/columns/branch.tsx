import type { DataBoardColumn } from '@/components/data-board/DataBoard';
import type { BranchRow } from '@/types/branch';

export const branchColumns: DataBoardColumn<BranchRow>[] = [
  { key: 'branch', header: '지점' },
  { key: 'operatingHours', header: '운영 시간' },
  {
    key: 'monthlyRevenue',
    header: '이번달 매출',
    render: (row) => `${row.monthlyRevenue.toLocaleString()}원`,
  },
  { key: 'revenueTrend', header: '매출 추이' },
  {
    key: 'manager',
    header: '점장 / 근무 인원',
    render: (row) => (
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800">{row.manager}</p>
        <p className="text-xs text-gray-500">근무 {row.staffCount}명</p>
      </div>
    ),
  },
  {
    key: 'complaintsLastQuarter',
    header: '최근 3개월 컴플레인',
    render: (row) => `${row.complaintsLastQuarter.toLocaleString()}건`,
  },
];
