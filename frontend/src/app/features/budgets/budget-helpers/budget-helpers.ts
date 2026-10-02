import {Budget} from '../dtos/budget';

/** Change this one value if your money is not in pesos. */
export const CURRENCY_CODE = 'PHP';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Text like "October 2026". The month number starts at 1, the list starts at 0, so we subtract 1. */
export function monthLabel(budget: Budget): string {
  return `${MONTH_NAMES[budget.month - 1]} ${budget.year}`;
}

/** Sum of every category amount in the budget. */
export function allocatedTotal(budget: Budget): number {
  return budget.categories.reduce((sum, category) => sum + category.allocatedAmount, 0);
}

/** Income not yet given to a category. Negative means the categories add up to more than the income. */
export function leftToAssign(budget: Budget): number {
  return budget.totalIncome - allocatedTotal(budget);
}

/** Whole-number percent of income given to categories (can pass 100). */
export function allocatedPercent(budget: Budget): number {
  if (budget.totalIncome <= 0) {
    return budget.categories.length > 0 ? 100 : 0;
  }
  return Math.round((allocatedTotal(budget) / budget.totalIncome) * 100);
}
