import { BudgetAlert } from './budget-alert';
import { CategorySummary } from './category-summary';

export interface BudgetSummary {
  budgetId: number;
  month: number; // 1 to 12
  year: number;
  totalIncome: number;
  givenToCategories: number;
  leftToAssign: number;
  overAllocatedAmount: number;
  totalSpent: number;
  leftToSpend: number; // income minus spent, negative when overspent
  percentUsed: number; // spent as a percent of income
  alert: BudgetAlert;
  categories: CategorySummary[];
}
