export interface CreateExpenseRequest {
  budgetCategoryId: number;
  recurringExpenseId?: number | null;
  amount: number;
  expenseDate: string;
  description: string | null;
}
