import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import type { BranchRow } from '@/types/branch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BranchFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (branch: BranchRow) => void;
  initialBranch?: BranchRow;
};

type BranchFormState = {
  branch: string;
  region: string;
  operatingHours: string;
  monthlyRevenue: string;
  revenueTrend: string;
  manager: string;
  staffCount: string;
  complaintsLastQuarter: string;
  ordersText: string;
};

const buildOrdersText = (branch?: BranchRow) =>
  branch
    ? branch.orders
        .map(
          (order) => `${order.name}, ${order.quantity}, ${order.isDelivery ? '배달' : '직접'}`,
        )
        .join('\n')
    : '';

const mapBranchToState = (branch?: BranchRow): BranchFormState => ({
  branch: branch?.branch ?? '',
  region: branch?.region ?? '',
  operatingHours: branch?.operatingHours ?? '',
  monthlyRevenue: branch ? String(branch.monthlyRevenue) : '',
  revenueTrend: branch?.revenueTrend ?? '',
  manager: branch?.manager ?? '',
  staffCount: branch ? String(branch.staffCount) : '',
  complaintsLastQuarter: branch ? String(branch.complaintsLastQuarter) : '',
  ordersText: buildOrdersText(branch),
});

const parseOrders = (ordersText: string) =>
  ordersText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = '', qty = '0', delivery = ''] = line
        .split(',')
        .map((part) => part.trim());
      return {
        name,
        quantity: Number(qty) || 0,
        isDelivery: delivery.includes('배달'),
      };
    });

export default function BranchFormDialog({
  open,
  mode,
  onClose,
  onSubmit,
  initialBranch,
}: BranchFormDialogProps) {
  const [state, setState] = useState<BranchFormState>(() =>
    mapBranchToState(initialBranch),
  );

  useEffect(() => {
    if (open) {
      setState(mapBranchToState(initialBranch));
    }
  }, [initialBranch, open]);

  const isEdit = mode === 'edit';
  const title = useMemo(
    () => (isEdit ? '지점 정보 수정' : '새 지점 추가'),
    [isEdit],
  );

  if (!open) return null;

  const handleChange = (key: keyof BranchFormState, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!state.branch.trim()) return;
    const nextBranch: BranchRow = {
      id: initialBranch?.id ?? `BR-${Date.now()}`,
      branch: state.branch.trim(),
      region: state.region.trim(),
      operatingHours: state.operatingHours.trim(),
      monthlyRevenue: Number(state.monthlyRevenue) || 0,
      revenueTrend: state.revenueTrend.trim(),
      manager: state.manager.trim(),
      staffCount: Number(state.staffCount) || 0,
      complaintsLastQuarter: Number(state.complaintsLastQuarter) || 0,
      orders: parseOrders(state.ordersText),
    };
    onSubmit(nextBranch);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-600">
              {isEdit ? '지점 수정' : '지점 등록'}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">지점명</label>
              <Input
                value={state.branch}
                onChange={(event) => handleChange('branch', event.target.value)}
                placeholder="예) 강남역점"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">권역</label>
              <Input
                value={state.region}
                onChange={(event) => handleChange('region', event.target.value)}
                placeholder="예) 서울 강남"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">운영 시간</label>
              <Input
                value={state.operatingHours}
                onChange={(event) =>
                  handleChange('operatingHours', event.target.value)
                }
                placeholder="07:00 ~ 23:00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">이번달 매출</label>
              <Input
                type="number"
                min="0"
                value={state.monthlyRevenue}
                onChange={(event) =>
                  handleChange('monthlyRevenue', event.target.value)
                }
                placeholder="숫자만 입력"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">매출 추이</label>
              <Input
                value={state.revenueTrend}
                onChange={(event) => handleChange('revenueTrend', event.target.value)}
                placeholder="예) +4.2%"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">점장</label>
              <Input
                value={state.manager}
                onChange={(event) => handleChange('manager', event.target.value)}
                placeholder="점장 이름"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">근무 인원</label>
              <Input
                type="number"
                min="0"
                value={state.staffCount}
                onChange={(event) => handleChange('staffCount', event.target.value)}
                placeholder="숫자 입력"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">최근 3개월 컴플레인</label>
              <Input
                type="number"
                min="0"
                value={state.complaintsLastQuarter}
                onChange={(event) =>
                  handleChange('complaintsLastQuarter', event.target.value)
                }
                placeholder="숫자 입력"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-gray-800">
              <span>최근 주문 재료 (줄바꿈으로 구분)</span>
              <span className="text-xs font-normal text-gray-500">예: 우유, 100, 배달</span>
            </div>
            <textarea
              value={state.ordersText}
              onChange={(event) => handleChange('ordersText', event.target.value)}
              className="min-h-[120px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="재료명, 수량, 배달/직접"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              취소
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {isEdit ? '변경사항 저장' : '지점 추가'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
