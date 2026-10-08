export interface Expense {
  id: number;
  budgetCategoryId: number;
  categoryName: string;
  amount: number;
  recurringExpenseId: number | null;
  description: string | null;
  expenseDate: string;
}
