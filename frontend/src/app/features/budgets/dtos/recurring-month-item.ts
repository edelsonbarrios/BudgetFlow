export interface RecurringMonthItem {
  recurringExpenseId: number;
  description: string;
  amount: number;
  categoryName: string;
  suggestedDate: string;
  paid: boolean;
  paidDate: string | null;
}
