import { SavingsGoalStatus } from './savings-goal';

export interface SavingsGoalFilter {
  searchQuery: string; // '' means no search
  status: SavingsGoalStatus | null; // null means any status
  page: number; // starts at 1
  size: number; // the backend allows at most 10
}
