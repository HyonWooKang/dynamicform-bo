import type { PieSlice, TrendPoint } from './charts';

export type ReportRow = {
  id: string;
  name: string;
  owner: string;
  interval: string;
  status: string;
};

export type RetentionTrendPoint = TrendPoint;
export type RetentionSlice = PieSlice;
