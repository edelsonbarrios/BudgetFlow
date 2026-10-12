export interface CreateSavingsGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount : number;
  targetDate: string | null; // 'YYYY-MM-DD', or null when there is no deadline
}
