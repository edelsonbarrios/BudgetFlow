import { BudgetAlert } from './budget-alert';

export interface CategorySummary {
  budgetCategoryId: number;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number; // negative when overspent
  percentUsed: number; // one decimal place, can pass 100
  alert: BudgetAlert;
}
