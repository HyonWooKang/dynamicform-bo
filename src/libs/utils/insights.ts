import type { TrendPoint } from '@/types/charts';
import type { BranchRow } from '@/types/branch';
import type { MenuItem } from '@/types/menu';

const HISTORY_LENGTH = 13;

const formatMonthLabel = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;

const computeSeed = (id: string) =>
  id
    .split('')
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

export const buildBranchRevenueHistory = (
  branch?: BranchRow | null,
): TrendPoint[] => {
  if (!branch) return [];

  const seed = computeSeed(branch.id);
  const multipliers = Array.from({ length: HISTORY_LENGTH }, (_, idx) => {
    const drift = 0.82 + idx * 0.015;
    const noise = Math.sin(seed + idx * 1.7) * 0.05;
    return Math.max(0.6, drift + noise);
  });

  const latest = multipliers[multipliers.length - 1] ?? 1;
  const normalized = multipliers.map((value) => value / latest);
  const now = new Date();

  return normalized.map((multiplier, idx) => {
    const monthOffset = HISTORY_LENGTH - 1 - idx;
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const value = Math.max(
      12_000_000,
      Math.round((branch.monthlyRevenue * multiplier) / 1000) * 1000,
    );

    return {
      label: formatMonthLabel(date),
      value,
    };
  });
};

const icedPattern = /아이스|ice|콜드|냉/i;
const winterPattern = /라떼|핫|초코|윈터|연말|따뜻/i;

export const isIcedMenu = (menu: MenuItem) =>
  icedPattern.test(menu.name) ||
  menu.tags.some((tag) => icedPattern.test(tag));

export const isWinterMenu = (menu: MenuItem) =>
  winterPattern.test(menu.name) ||
  menu.tags.some((tag) => winterPattern.test(tag));

export const buildMenuSalesHistory = (
  menu?: MenuItem | null,
): TrendPoint[] => {
  if (!menu) return [];

  const now = new Date();
  const seed = computeSeed(menu.id);

  return Array.from({ length: HISTORY_LENGTH }, (_, idx) => {
    const offset = HISTORY_LENGTH - 1 - idx;
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const month = date.getMonth();

    const seasonalBoost = (() => {
      if (isIcedMenu(menu)) {
        if (month >= 5 && month <= 8) return 1.35;
        if (month === 4 || month === 9) return 1.15;
        return 0.85;
      }
      if (isWinterMenu(menu)) {
        if (month === 11 || month <= 1) return 1.4;
        if (month === 2 || month === 10) return 1.15;
        return 0.9;
      }
      return 1;
    })();

    const base = 1600 + (menu.price / 100) * 8;
    const trend = 1 + (idx - HISTORY_LENGTH / 2) * 0.01;
    const noise = 1 + Math.sin(seed + idx * 1.2) * 0.08;
    const value = Math.max(
      400,
      Math.round(base * seasonalBoost * trend * noise),
    );

    return {
      label: formatMonthLabel(date),
      value,
    };
  });
};

