import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import DataBoard from '@/components/data-board/DataBoard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { menuBoardColumns } from '@/columns/menu';
import { initialMenuItems } from '@/data/menu';
import type { MenuItem } from '@/types/menu';

type MenuFormValues = {
  name: string;
  category: string;
  price: string;
  availability: '상시' | '시즌';
  seasonTerm: string;
  kioskExposure: boolean;
  releaseDate: string;
  imageUrl: string;
  description: string;
  tags: string;
  highlights: string;
  ingredients: string;
  recipe: string;
  calories: string;
  sugar: string;
  caffeine: string;
  allergens: string;
};

type MenuFilters = {
  keyword: string;
  category: string;
  availability: '전체' | '상시' | '시즌';
  kioskOnly: boolean;
};

const menuCategories = [
  '커피',
  '논커피',
  '티/에이드',
  '스무디',
  '디저트',
  '스페셜티',
];
const availabilityOptions: MenuFilters['availability'][] = ['전체', '상시', '시즌'];
const defaultFilters: MenuFilters = {
  keyword: '',
  category: '전체',
  availability: '전체',
  kioskOnly: false,
};
const pageSize = 10;
const pageWindowSize = 5;

const textareaStyles =
  'min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring';

const createDefaultMenuFormValues = (): MenuFormValues => ({
  name: '',
  category: menuCategories[0],
  price: '4500',
  availability: '상시',
  seasonTerm: '',
  kioskExposure: true,
  releaseDate: new Date().toISOString().split('T')[0],
  imageUrl: '',
  description: '',
  tags: '',
  highlights: '',
  ingredients: '',
  recipe: '',
  calories: '0',
  sugar: '0',
  caffeine: '0',
  allergens: '',
});

const buildMenuItemFromForm = (values: MenuFormValues): MenuItem => {
  const parseList = (value: string, delimiter: RegExp | string) =>
    value
      .split(delimiter)
      .map((item) => item.trim())
      .filter(Boolean);

  const recipe = parseList(values.recipe, /\n+/).map((instruction, index) => ({
    order: index + 1,
    instruction: instruction.replace(/^\d+\.\s*/, ''),
  }));

  const ingredients = parseList(values.ingredients, /\n+/).map((line) => {
    const [name, detail] = line.split('-').map((part) => part.trim());
    return {
      name,
      detail: detail || undefined,
    };
  });

  return {
    id: `menu-${Date.now()}`,
    name: values.name.trim(),
    category: values.category,
    price: Number(values.price) || 0,
    availability: values.availability,
    kioskExposure: values.kioskExposure,
    seasonTerm: values.availability === '시즌' ? values.seasonTerm.trim() : undefined,
    imageUrl:
      values.imageUrl.trim() ||
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    description: values.description.trim(),
    releaseDate: values.releaseDate || new Date().toISOString().split('T')[0],
    tags: parseList(values.tags, ','),
    highlights: parseList(values.highlights, /\n+/),
    ingredients,
    recipe,
    nutrition: {
      calories: Number(values.calories) || 0,
      sugar: Number(values.sugar) || 0,
      caffeine: Number(values.caffeine) || 0,
    },
    allergens: parseList(values.allergens, ','),
  };
};

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenuItems);
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
    setMenus((prev) => [menu, ...prev]);
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
                {menuCategories.map((category) => (
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

      {isFormOpen ? (
        <MenuFormDialog
          onClose={() => setIsFormOpen(false)}
          onCreate={handleMenuCreate}
        />
      ) : null}

    </div>
  );
}

type MenuFormDialogProps = {
  onClose: () => void;
  onCreate: (menu: MenuItem) => void;
};

function MenuFormDialog({ onClose, onCreate }: MenuFormDialogProps) {
  const form = useForm<MenuFormValues>({
    mode: 'onChange',
    defaultValues: createDefaultMenuFormValues(),
  });
  const availability = form.watch('availability');

  const handleClose = () => {
    form.reset(createDefaultMenuFormValues());
    onClose();
  };

  const handleSubmit = (values: MenuFormValues) => {
    const newMenu = buildMenuItemFromForm(values);
    onCreate(newMenu);
    form.reset(createDefaultMenuFormValues());
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-600">
              신규 메뉴 등록
            </p>
            <h3 className="text-2xl font-bold text-gray-900">레시피 정보 입력</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-6 space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: '메뉴명을 입력하세요' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>메뉴명</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 제주말차 라떼" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {menuCategories.map((category) => (
                            <SelectItem value={category} key={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                rules={{ required: '가격을 입력하세요' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>판매가(원)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>출시일</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>판매 구분</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="판매 구분" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="상시">상시</SelectItem>
                          <SelectItem value="시즌">시즌</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seasonTerm"
                rules={{
                  validate: (value) =>
                    availability === '시즌'
                      ? value.trim().length > 0 || '시즌 운영 기간을 입력하세요'
                      : true,
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시즌 운영 기간</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 3월~5월, 산지 상황에 따라 변동"
                        disabled={availability !== '시즌'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대표 이미지 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kioskExposure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm">키오스크 기본 노출</FormLabel>
                      <p className="text-xs text-gray-500">
                        해제 시 매장에서 수동으로 노출해야 합니다.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              rules={{ required: '메뉴 소개를 입력하세요' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메뉴 소개</FormLabel>
                  <FormControl>
                    <textarea
                      className={textareaStyles}
                      placeholder="메뉴의 컨셉과 고객 메시지를 입력하세요."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>태그</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="콤마(,)로 구분 · 예: Signature, Local"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>알레르겐</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="콤마(,)로 구분 · 예: 우유, 견과류"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="highlights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>판매 포인트</FormLabel>
                  <FormControl>
                    <textarea
                      className={textareaStyles}
                      placeholder="줄바꿈으로 구분 · 예: SNS 인증샷 1위 메뉴"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>원재료</FormLabel>
                    <FormControl>
                      <textarea
                        className={textareaStyles}
                        placeholder="줄마다 '재료 - 설명' 형식으로 입력하세요."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recipe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>레시피 단계</FormLabel>
                    <FormControl>
                      <textarea
                        className={textareaStyles}
                        placeholder="줄바꿈으로 구분 · 예: 1. 베이스 준비"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>칼로리(kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>당류(g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="caffeine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카페인(mg)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit">메뉴 등록</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
