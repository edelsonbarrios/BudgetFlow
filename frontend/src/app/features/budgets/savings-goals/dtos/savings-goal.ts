export type SavingsGoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export interface SavingsGoal {
  id : number;
  name : string;
  targetAmount : number;
  currentAmount : number;
  remainingAmount : number;
  percentAmount : number;
  completed : boolean;
  overdue : boolean;
  targetDate: string;
  status : SavingsGoalStatus;
}
