import { useMemo, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranch } from '@/contexts/branch';
import type { BranchRow } from '@/types/branch';

export default function BranchCreatePage() {
  const navigate = useNavigate();
  const { branches, addBranch } = useBranch();
  const [form, setForm] = useState({
    branch: '',
    region: '',
    operatingHours: '',
    monthlyRevenue: '',
    revenueTrend: '',
    manager: '',
    staffCount: '',
    complaintsLastQuarter: '',
    ordersText: '',
  });

  const nextId = useMemo(() => {
    const maxNum = branches.reduce((max, item) => {
      const num = Number(item.id.replace(/[^0-9]/g, ''));
      return Number.isFinite(num) && num > max ? num : max;
    }, 0);
    return `BR-${String(maxNum + 1).padStart(3, '0')}`;
  }, [branches]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleSubmit = () => {
    if (!form.branch.trim()) return;
    const newBranch: BranchRow = {
      id: nextId,
      branch: form.branch.trim(),
      region: form.region.trim(),
      operatingHours: form.operatingHours.trim(),
      monthlyRevenue: Number(form.monthlyRevenue) || 0,
      revenueTrend: form.revenueTrend.trim(),
      manager: form.manager.trim(),
      staffCount: Number(form.staffCount) || 0,
      complaintsLastQuarter: Number(form.complaintsLastQuarter) || 0,
      orders: parseOrders(form.ordersText),
    };
    addBranch(newBranch);
    navigate('/branch');
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/branch')} className="gap-2 px-0">
          <ArrowLeft className="h-4 w-4" />
          지점 보드로 돌아가기
        </Button>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          신규 ID 예정: {nextId}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-amber-600">새 지점 등록</p>
        <h1 className="text-3xl font-bold text-gray-900">지점 추가</h1>
        <p className="text-gray-600">기본 운영 정보와 최근 주문 재료를 입력해 주세요.</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="지점명">
            <Input
              value={form.branch}
              onChange={(event) => handleChange('branch', event.target.value)}
              placeholder="예) 강남역점"
            />
          </Field>
          <Field label="권역">
            <Input
              value={form.region}
              onChange={(event) => handleChange('region', event.target.value)}
              placeholder="예) 서울 강남"
            />
          </Field>
          <Field label="운영 시간">
            <Input
              value={form.operatingHours}
              onChange={(event) => handleChange('operatingHours', event.target.value)}
              placeholder="07:00 ~ 23:00"
            />
          </Field>
          <Field label="이번달 매출">
            <Input
              type="number"
              min="0"
              value={form.monthlyRevenue}
              onChange={(event) => handleChange('monthlyRevenue', event.target.value)}
              placeholder="숫자만 입력"
            />
          </Field>
          <Field label="매출 추이">
            <Input
              value={form.revenueTrend}
              onChange={(event) => handleChange('revenueTrend', event.target.value)}
              placeholder="예) +4.2%"
            />
          </Field>
          <Field label="점장">
            <Input
              value={form.manager}
              onChange={(event) => handleChange('manager', event.target.value)}
              placeholder="점장 이름"
            />
          </Field>
          <Field label="근무 인원">
            <Input
              type="number"
              min="0"
              value={form.staffCount}
              onChange={(event) => handleChange('staffCount', event.target.value)}
              placeholder="숫자 입력"
            />
          </Field>
          <Field label="최근 3개월 컴플레인">
            <Input
              type="number"
              min="0"
              value={form.complaintsLastQuarter}
              onChange={(event) =>
                handleChange('complaintsLastQuarter', event.target.value)
              }
              placeholder="숫자 입력"
            />
          </Field>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-gray-800">
            <span>최근 주문 재료 (줄바꿈으로 구분)</span>
            <span className="text-xs font-normal text-gray-500">예: 우유, 100, 배달</span>
          </div>
          <textarea
            value={form.ordersText}
            onChange={(event) => handleChange('ordersText', event.target.value)}
            className="min-h-[140px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="재료명, 수량, 배달/직접"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/branch')}>
            취소
          </Button>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <Plus className="h-4 w-4" />
            지점 추가
          </Button>
        </div>
      </section>
    </div>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {children}
    </div>
  );
}
