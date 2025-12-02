import type { MenuItem } from '@/types/menu';

export const MENU_CATEGORIES = [
  '커피',
  '논커피',
  '티/에이드',
  '스무디',
  '디저트',
  '스페셜티',
] as const;

export const MENU_AVAILABILITY_OPTIONS: MenuItem['availability'][] = [
  '상시',
  '시즌',
];
