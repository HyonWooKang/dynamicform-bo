import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { MENU_AVAILABILITY_OPTIONS, MENU_CATEGORIES } from '@/constants/menu';
import { X } from 'lucide-react';

import type { MenuItem } from '@/types/menu';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useTags } from '@/contexts/tags';

type MenuFormValues = {
  name: string;
  category: string;
  price: string;
  availability: MenuItem['availability'];
  seasonTerm: string;
  kioskExposure: boolean;
  releaseDate: string;
  imageUrl: string;
  description: string;
  tags: string[];
  highlights: string;
  ingredients: string;
  recipe: string;
  calories: string;
  sugar: string;
  caffeine: string;
  allergens: string;
};

const textareaStyles =
  'min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring';

const createDefaultMenuFormValues = (): MenuFormValues => ({
  name: '',
  category: MENU_CATEGORIES[0],
  price: '4500',
  availability: '상시',
  seasonTerm: '',
  kioskExposure: true,
  releaseDate: new Date().toISOString().split('T')[0],
  imageUrl: '',
  description: '',
  tags: [],
  highlights: '',
  ingredients: '',
  recipe: '',
  calories: '0',
  sugar: '0',
  caffeine: '0',
  allergens: '',
});

const mapMenuToFormValues = (menu: MenuItem): MenuFormValues => ({
  name: menu.name,
  category: menu.category,
  price: String(menu.price),
  availability: menu.availability,
  seasonTerm: menu.seasonTerm ?? '',
  kioskExposure: menu.kioskExposure,
  releaseDate: menu.releaseDate,
  imageUrl: menu.imageUrl,
  description: menu.description,
  tags: menu.tags,
  highlights: menu.highlights.join('\n'),
  ingredients: menu.ingredients
    .map((item) => (item.detail ? `${item.name} - ${item.detail}` : item.name))
    .join('\n'),
  recipe: menu.recipe.map((step) => step.instruction).join('\n'),
  calories: String(menu.nutrition.calories),
  sugar: String(menu.nutrition.sugar),
  caffeine: String(menu.nutrition.caffeine),
  allergens: menu.allergens.join(', '),
});

const buildMenuItemFromForm = (
  values: MenuFormValues,
  baseMenu?: MenuItem,
): MenuItem => {
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
    id: baseMenu?.id ?? `menu-${Date.now()}`,
    name: values.name.trim(),
    category: values.category,
    price: Number(values.price) || 0,
    availability: values.availability,
    kioskExposure: values.kioskExposure,
    seasonTerm:
      values.availability === '시즌' ? values.seasonTerm.trim() : undefined,
    imageUrl:
      values.imageUrl.trim() ||
      baseMenu?.imageUrl ||
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    description: values.description.trim(),
    releaseDate: values.releaseDate || new Date().toISOString().split('T')[0],
    tags: values.tags,
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

type MenuFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (menu: MenuItem) => void;
  initialMenu?: MenuItem;
};

export default function MenuFormDialog({
  open,
  mode,
  onClose,
  onSubmit,
  initialMenu,
}: MenuFormDialogProps) {
  const { tags: managedTags } = useTags();
  const tagOptions = useMemo(
    () =>
      Array.from(
        new Set([...(initialMenu?.tags ?? []), ...managedTags]).values(),
      ),
    [initialMenu?.tags, managedTags],
  );
  const hasTagOptions = tagOptions.length > 0;

  const form = useForm<MenuFormValues>({
    mode: 'onChange',
    defaultValues: initialMenu
      ? mapMenuToFormValues(initialMenu)
      : createDefaultMenuFormValues(),
  });

  useEffect(() => {
    if (open) {
      form.reset(
        initialMenu
          ? mapMenuToFormValues(initialMenu)
          : createDefaultMenuFormValues(),
      );
    }
  }, [form, initialMenu, open]);

  const availability = form.watch('availability');

  const handleClose = () => {
    form.reset(
      initialMenu
        ? mapMenuToFormValues(initialMenu)
        : createDefaultMenuFormValues(),
    );
    onClose();
  };

  const handleSubmit = (values: MenuFormValues) => {
    const menu = buildMenuItemFromForm(values, initialMenu);
    onSubmit(menu);
    if (mode === 'create') {
      form.reset(createDefaultMenuFormValues());
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-600">
              {mode === 'create' ? '신규 메뉴 등록' : '메뉴 수정'}
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === 'create'
                ? '레시피 정보 입력'
                : (initialMenu?.name ?? '')}
            </h3>
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {MENU_CATEGORIES.map((category) => (
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="판매 구분" />
                        </SelectTrigger>
                        <SelectContent>
                          {MENU_AVAILABILITY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm">
                        키오스크 기본 노출
                      </FormLabel>
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
              rules={{
                validate: (value) =>
                  value && value.length > 0
                    ? true
                    : '태그를 한 개 이상 선택하세요',
              }}
              render={({ field }) => {
                const selectedTags = field.value ?? [];

                const toggleTag = (tag: string, checked: boolean) => {
                  if (checked) {
                    field.onChange([...selectedTags, tag]);
                  } else {
                    field.onChange(selectedTags.filter((item) => item !== tag));
                  }
                };

                return (
                  <FormItem>
                    <FormLabel>태그</FormLabel>
                    <FormControl>
                      <div className="rounded-lg border border-gray-200 p-4">
                        {hasTagOptions ? (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {tagOptions.map((tag) => (
                              <label
                                key={tag}
                                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                              >
                                <Checkbox
                                  checked={selectedTags.includes(tag)}
                                  onCheckedChange={(checked) =>
                                    toggleTag(tag, checked === true)
                                  }
                                />
                                <span>#{tag}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            등록된 태그가 없습니다. 설정 &gt; 태그 관리에서 태그를
                            먼저 추가하세요.
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      태그는 태그 관리 화면에서만 추가/삭제할 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="allergens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>알러지</FormLabel>
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
              <Button type="submit" disabled={!hasTagOptions}>
                {mode === 'create' ? '메뉴 등록' : '변경사항 저장'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
