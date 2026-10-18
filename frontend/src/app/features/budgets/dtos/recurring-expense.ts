export interface RecurringExpense {
  id : number;
  categoryName : string;
  description : string;
  amount : number;
  dueDay : string;
  active : boolean;
}
