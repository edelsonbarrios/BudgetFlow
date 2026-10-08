export interface CreateExpenseRequest {
  /** The budget category row id (BudgetCategory.id), NOT the shared categoryId. */
  budgetCategoryId: number;
  amount: number;
  expenseDate: string; // 'YYYY-MM-DD'
  description: string | null;
}
