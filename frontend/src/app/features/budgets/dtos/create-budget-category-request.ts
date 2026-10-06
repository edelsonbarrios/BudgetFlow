/** Matches CreateBudgetCategoryRequest on the backend. */
export interface CreateBudgetCategoryRequest {
  budgetId: number;
  categoryId: number; // up to 100 characters
  allocatedAmount: number; // above 0
}
