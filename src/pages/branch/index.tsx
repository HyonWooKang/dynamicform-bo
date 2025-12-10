import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DataBoard from '@/components/data-board/DataBoard';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { createBranchColumns } from '@/columns/branch';
import { useBranch } from '@/contexts/branch';

const PAGE_SIZE = 10;
const PAGE_WINDOW = 5;

export default function BranchManagementPage() {
  const { branches } = useBranch();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return branches;
    return branches.filter((row) =>
      [
        row.branch,
        row.region,
        row.manager,
        row.revenueTrend,
        row.operatingHours,
        ...row.orders.map((order) => `${order.name} ${order.quantity}`),
      ]
        .join(' ')
        .toLowerCase()
        .includes(value),
    );
  }, [branches, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const windowStart = Math.floor((safePage - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
  const windowEnd = Math.min(windowStart + PAGE_WINDOW - 1, totalPages);
  const pageItems = filtered.length
    ? Array.from({ length: windowEnd - windowStart + 1 }, (_, idx) =>
        windowStart + idx,
      )
    : [];

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleNavigateDetail = useCallback(
    (branchId: string) => {
      navigate(`/branch/${branchId}`);
    },
    [navigate],
  );

  const columns = useMemo(
    () => createBranchColumns((row) => handleNavigateDetail(row.id)),
    [handleNavigateDetail],
  );

  const handleNavigateCreate = () => {
    navigate('/branch/create');
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-600">지점 오퍼레이션</p>
          <h1 className="text-3xl font-bold text-gray-900">지점관리</h1>
          <p className="text-gray-600">
            운영 시간, 매출 추이, 재료 주문, 인력 현황, 컴플레인까지 한눈에 모아 관리하세요.
          </p>
        </div>
        <Button type="button" onClick={handleNavigateCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          지점 추가
        </Button>
      </div>

      <DataBoard
        title="지점 현황 보드"
        columns={columns}
        data={paged}
        totalCount={filtered.length}
        searchPlaceholder="지점명 · 점장 · 권역 검색"
        onSearch={handleSearch}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600">
            {filtered.length > 0
              ? `${filtered.length.toLocaleString()}건 중 ${start + 1}~${Math.min(
                  start + PAGE_SIZE,
                  filtered.length,
                ).toLocaleString()}건을 보고 있습니다.`
              : '조건에 맞는 지점이 없습니다.'}
          </p>
          {filtered.length > 0 ? (
            <Pagination className="md:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (safePage > 1) setPage(safePage - 1);
                    }}
                    className={
                      safePage === 1 ? 'pointer-events-none opacity-50' : undefined
                    }
                  />
                </PaginationItem>
                {pageItems.map((item) => (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === safePage}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (safePage < totalPages) setPage(safePage + 1);
                    }}
                    className={
                      safePage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </div>
    </div>
  );
}
