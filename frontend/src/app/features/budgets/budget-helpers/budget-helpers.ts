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

/**
 * Whole-number percent of income given to categories (can pass 100).
 * The sum itself comes from the backend (givenToCategories); this only turns it into a percent.
 */
export function allocatedPercent(budget: Budget): number {
  if (budget.totalIncome <= 0) {
    return budget.givenToCategories > 0 ? 100 : 0;
  }
  return Math.round((budget.givenToCategories / budget.totalIncome) * 100);
}
