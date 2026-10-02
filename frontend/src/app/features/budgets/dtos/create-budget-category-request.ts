/** Matches CreateBudgetCategoryRequest on the backend. */
export interface CreateBudgetCategoryRequest {
  budgetId: number;
  name: string; // up to 100 characters
  allocatedAmount: number; // above 0
}
