export interface UpdateSavingsGoalRequest {
  id: number;
  name : string;
  targetAmount : number;
  targetDate : string | null;
  status : string;
}
