import type { HighlightMetric } from '@/types/charts';
import type {
  CategoryShare,
  HourlySalesPoint,
  KioskStatusItem,
  MenuRow,
  RegionRow,
  StatHighlight,
  StoreRow,
} from '@/types/dashboard';

export const dashboardStatHighlights: StatHighlight[] = [
  {
    label: '오늘 총 매출',
    value: '128,450,000원',
    helper: '오전 11시 기준',
    trend: { label: '어제 대비', value: '+6.4%', isPositive: true },
  },
  {
    label: '오늘 주문 수',
    value: '17,230건',
    helper: '모바일 오더 34%',
    trend: { label: '어제 대비', value: '+4.1%', isPositive: true },
  },
  {
    label: '운영 중 키오스크',
    value: '468대 / 512대',
    helper: '91% 정상 운영',
    trend: { label: '복구 진행', value: '12건', isPositive: true },
  },
  {
    label: '고장 신고 처리',
    value: '6건',
    helper: '평균 대응 15분',
    trend: { label: '미조치', value: '0건', isPositive: true },
  },
];

export const dashboardHourlySalesTrend: HourlySalesPoint[] = [
  { label: '07시', value: 850000 },
  { label: '08시', value: 1500000 },
  { label: '09시', value: 2600000 },
  { label: '10시', value: 3200000 },
  { label: '11시', value: 2800000 },
  { label: '12시', value: 2100000 },
  { label: '13시', value: 1850000 },
  { label: '14시', value: 2700000 },
  { label: '15시', value: 3100000 },
  { label: '16시', value: 3350000 },
  { label: '17시', value: 2480000 },
  { label: '18시', value: 1680000 },
];

export const dashboardCategoryShare: CategoryShare[] = [
  { label: '커피류', value: 55, color: '#7c3aed' },
  { label: '논커피', value: 17, color: '#f97316' },
  { label: '스무디', value: 15, color: '#14b8a6' },
  { label: '디저트', value: 13, color: '#facc15' },
];

export const dashboardOverviewMetrics: HighlightMetric[] = [
  { label: '모닝 피크', value: '09~11시', helper: '전체 매출 34%' },
  { label: '카페 피크', value: '14~17시', helper: '전체 매출 29%' },
  { label: '메뉴 다양화 지수', value: '0.78', helper: '균형 유지' },
];

export const dashboardTopStoreData: StoreRow[] = [
  { rank: 1, store: '강남역 2호점', revenue: 7200000, growth: '+8%' },
  { rank: 2, store: '홍대입구점', revenue: 6680000, growth: '+6%' },
  { rank: 3, store: '잠실롯데월드몰점', revenue: 6420000, growth: '+5%' },
  { rank: 4, store: '김포공항점', revenue: 6100000, growth: '+11%' },
  { rank: 5, store: '부산서면점', revenue: 5840000, growth: '+4%' },
  { rank: 6, store: '대구동성로점', revenue: 5620000, growth: '+3%' },
  { rank: 7, store: '광주충장로점', revenue: 5480000, growth: '+2%' },
  { rank: 8, store: '수원인계점', revenue: 5320000, growth: '+4%' },
  { rank: 9, store: '제주공항점', revenue: 5180000, growth: '+7%' },
  { rank: 10, store: '울산삼산점', revenue: 5050000, growth: '+2%' },
];

export const dashboardTopMenuData: MenuRow[] = [
  { rank: 1, menu: '아이스 아메리카노', ratio: '19%', orders: 2280 },
  { rank: 2, menu: '바닐라라떼', ratio: '12%', orders: 1580 },
  { rank: 3, menu: '흑당버블티', ratio: '10%', orders: 1340 },
  { rank: 4, menu: '초코딥라떼', ratio: '9%', orders: 1210 },
  { rank: 5, menu: '메가에이드 청포도', ratio: '8%', orders: 1120 },
  { rank: 6, menu: '딸기요거트 스무디', ratio: '7%', orders: 1030 },
  { rank: 7, menu: '카페라떼', ratio: '7%', orders: 980 },
  { rank: 8, menu: '메가쿠키 크림라떼', ratio: '5%', orders: 840 },
  { rank: 9, menu: '티라미수 라떼', ratio: '5%', orders: 760 },
  { rank: 10, menu: '레몬 허니티', ratio: '4%', orders: 690 },
];

export const dashboardRegionData: RegionRow[] = [
  { region: '수도권', sales: 43200000, wow: '+5%' },
  { region: '영남권', sales: 25400000, wow: '+4%' },
  { region: '충청권', sales: 17600000, wow: '+2%' },
  { region: '호남권', sales: 15400000, wow: '+3%' },
  { region: '강원/제주', sales: 10200000, wow: '+4%' },
];

export const dashboardKioskStatus: KioskStatusItem[] = [
  { label: '온라인', count: 468, description: '정상 운영', color: '#10b981' },
  { label: '오프라인', count: 22, description: '현장 점검 필요', color: '#f97316' },
  { label: '프린터 오류', count: 14, description: '영수증 출력 불가', color: '#facc15' },
  { label: '카드 단말 오류', count: 8, description: '결제 실패 신고', color: '#ef4444' },
];
