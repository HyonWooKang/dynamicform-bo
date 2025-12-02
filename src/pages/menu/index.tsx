import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DataBoard from '@/components/data-board/DataBoard';
import MenuFormDialog from '@/components/menu/MenuFormDialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { MENU_AVAILABILITY_OPTIONS, MENU_CATEGORIES } from '@/constants/menu';
import { menuBoardColumns } from '@/columns/menu';
import { useMenu } from '@/contexts/menu';
import type { MenuItem } from '@/types/menu';

type MenuFilters = {
  keyword: string;
  category: string;
  availability: '전체' | '상시' | '시즌';
  kioskOnly: boolean;
};

const availabilityOptions: MenuFilters['availability'][] = [
  '전체',
  ...MENU_AVAILABILITY_OPTIONS,
];
const defaultFilters: MenuFilters = {
  keyword: '',
  category: '전체',
  availability: '전체',
  kioskOnly: false,
};
const pageSize = 10;
const pageWindowSize = 5;

export default function MenuManagementPage() {
  const { menus, addMenu } = useMenu();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<MenuFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filteredMenus = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return menus.filter((menu) => {
      const matchesKeyword = keyword
        ? [
            menu.name,
            menu.description,
            menu.category,
            menu.tags.join(' '),
          ]
            .map((field) => field.toLowerCase())
            .some((field) => field.includes(keyword))
        : true;

      const matchesCategory =
        filters.category === '전체' ? true : menu.category === filters.category;

      const matchesAvailability =
        filters.availability === '전체'
          ? true
          : menu.availability === filters.availability;

      const matchesKiosk = filters.kioskOnly ? menu.kioskExposure : true;

      return (
        matchesKeyword && matchesCategory && matchesAvailability && matchesKiosk
      );
    });
  }, [menus, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredMenus.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageWindowStart =
    Math.floor((safePage - 1) / pageWindowSize) * pageWindowSize + 1;
  const pageWindowEnd = Math.min(
    pageWindowStart + pageWindowSize - 1,
    totalPages,
  );

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    setPage(1);
  }, [filters.keyword, filters.category, filters.availability, filters.kioskOnly]);

  const paginatedMenus = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredMenus.slice(start, start + pageSize);
  }, [filteredMenus, safePage]);

  const showingFrom =
    filteredMenus.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo =
    filteredMenus.length === 0
      ? 0
      : Math.min(showingFrom + pageSize - 1, filteredMenus.length);

  const paginationItems = useMemo(() => {
    if (filteredMenus.length === 0) {
      return [];
    }
    return Array.from(
      { length: pageWindowEnd - pageWindowStart + 1 },
      (_, index) => pageWindowStart + index,
    );
  }, [filteredMenus.length, pageWindowEnd, pageWindowStart]);

  const handleMenuCreate = (menu: MenuItem) => {
    addMenu(menu);
    setIsFormOpen(false);
    setPage(1);
  };

  const updateFilter = <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleNavigateDetail = (menu: MenuItem) => {
    navigate(`/menu/${menu.id}`, { state: { menu } });
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <p className="text-sm font-semibold text-amber-600">메뉴 오퍼레이션</p>
        <h1 className="text-3xl font-bold text-gray-900">메뉴 관리</h1>
        <p className="text-gray-600">
          시즌 한정 메뉴부터 상시 베스트셀러까지, 레시피·키오스크 노출·성분
          정보를 한 화면에서 관리하세요.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">상세 검색</h2>
            <p className="text-sm text-gray-500">
              키워드, 카테고리, 판매 구분, 키오스크 노출 조건으로 필터링합니다.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
          >
            필터 초기화
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label
              htmlFor="menu-keyword"
              className="text-sm font-medium text-gray-700"
            >
              키워드
            </label>
            <Input
              id="menu-keyword"
              placeholder="메뉴명, 태그, 설명 검색"
              value={filters.keyword}
              onChange={(event) => updateFilter('keyword', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">카테고리</p>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                {MENU_CATEGORIES.map((category) => (
                  <SelectItem value={category} key={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">판매 구분</p>
            <Select
              value={filters.availability}
              onValueChange={(value) =>
                updateFilter(
                  'availability',
                  value as MenuFilters['availability'],
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="판매 구분" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem value={option} key={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">키오스크 노출</p>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <Checkbox
                id="kiosk-only"
                checked={filters.kioskOnly}
                onCheckedChange={(checked) =>
                  updateFilter('kioskOnly', checked === true)
                }
              />
              <label htmlFor="kiosk-only" className="text-sm text-gray-600">
                노출 중인 메뉴만 보기
              </label>
            </div>
          </div>
        </div>
      </section>

      <DataBoard
        title="메뉴 보드"
        columns={menuBoardColumns}
        data={paginatedMenus}
        totalCount={filteredMenus.length}
        showSearch={false}
        headerActions={
          <Button type="button" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" />
            새 메뉴 등록
          </Button>
        }
        actions={[
          {
            label: '상세보기',
            variant: 'ghost',
            onClick: (row) => handleNavigateDetail(row),
          },
        ]}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-600">
            {filteredMenus.length > 0
              ? `총 ${filteredMenus.length.toLocaleString()}건 중 ${showingFrom.toLocaleString()}~${showingTo.toLocaleString()}건을 보고 있습니다.`
              : '조건에 맞는 메뉴가 없습니다.'}
          </p>
          {filteredMenus.length > 0 ? (
            <Pagination className="md:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (safePage > 1) {
                        setPage(safePage - 1);
                      }
                    }}
                    className={
                      safePage === 1 ? 'pointer-events-none opacity-50' : undefined
                    }
                  />
                </PaginationItem>
                {paginationItems.map((item) => (
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
                      if (safePage < totalPages) {
                        setPage(safePage + 1);
                      }
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

      <MenuFormDialog
        open={isFormOpen}
        mode="create"
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleMenuCreate}
      />
    </div>
  );
}
