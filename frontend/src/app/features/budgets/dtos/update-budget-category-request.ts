/**
 * Matches UpdateBudgetCategoryRequest on the backend.
 * There is no budgetId: a category cannot move to another budget.
 */
export interface UpdateBudgetCategoryRequest {
  budgetId: number;
  name: string; // up to 100 characters
  allocatedAmount: number; // above 0
}
