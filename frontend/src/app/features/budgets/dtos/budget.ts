import {BudgetCategory} from './budget-category';

export interface Budget {
  id: number;
  month: number; // 1 to 12
  year: number;
  totalIncome: number;
  categories: BudgetCategory[];
  leftToAssign: number;
  givenToCategories : number;
  overAllocatedAmount: number;
}
