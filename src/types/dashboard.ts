import type { PieSlice, TrendPoint } from './charts';

export type StoreRow = {
  rank: number;
  store: string;
  revenue: number;
  growth: string;
};

export type MenuRow = {
  rank: number;
  menu: string;
  ratio: string;
  orders: number;
};

export type RegionRow = {
  region: string;
  sales: number;
  wow: string;
};

export type KioskStatusItem = {
  label: string;
  count: number;
  description: string;
  color: string;
};

export type StatHighlight = {
  label: string;
  value: string;
  helper?: string;
  trend?: {
    label: string;
    value: string;
    isPositive?: boolean;
  };
};

export type HourlySalesPoint = TrendPoint;
export type CategoryShare = PieSlice;
