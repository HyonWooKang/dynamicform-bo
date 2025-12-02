export type BranchOrderItem = {
  name: string;
  quantity: number;
  isDelivery: boolean;
};

export type BranchRow = {
  id: string;
  branch: string;
  region: string;
  operatingHours: string;
  monthlyRevenue: number;
  revenueTrend: string;
  orders: BranchOrderItem[];
  manager: string;
  staffCount: number;
  complaintsLastQuarter: number;
};
