import type { DataBoardColumn } from '@/components/data-board/DataBoard';
import type { MenuRow, RegionRow, StoreRow } from '@/types/dashboard';

export const dashboardTopStoreColumns: DataBoardColumn<StoreRow>[] = [
  {
    key: 'rank',
    header: '순위',
    render: (row) => `#${row.rank}`,
  },
  { key: 'store', header: '지점명' },
  {
    key: 'revenue',
    header: '일매출',
    render: (row) => `${row.revenue.toLocaleString()}원`,
  },
  { key: 'growth', header: '주간 증감' },
];

export const dashboardTopMenuColumns: DataBoardColumn<MenuRow>[] = [
  {
    key: 'rank',
    header: '순위',
    render: (row) => `#${row.rank}`,
  },
  { key: 'menu', header: '메뉴' },
  { key: 'ratio', header: '판매 비중' },
  {
    key: 'orders',
    header: '주문 수',
    render: (row) => `${row.orders.toLocaleString()}건`,
  },
];

export const dashboardRegionColumns: DataBoardColumn<RegionRow>[] = [
  { key: 'region', header: '권역' },
  {
    key: 'sales',
    header: '일매출',
    render: (row) => `${row.sales.toLocaleString()}원`,
  },
  { key: 'wow', header: '전주 대비' },
];
