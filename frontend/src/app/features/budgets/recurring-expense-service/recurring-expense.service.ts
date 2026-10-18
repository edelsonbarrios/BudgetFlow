import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, ObservedValuesFromArray} from 'rxjs';
import {RecurringMonthItem} from '../dtos/recurring-month-item';
import {DevelopmentUrl} from '../../../shared/models/developmentUrl';
import {CreateRecurringExpenseRequest} from '../dtos/create-recurring-expense-request';
import {RecurringExpense} from '../dtos/recurring-expense';

@Injectable({
  providedIn: 'root'
})
export class RecurringExpenseService {
  private httpClient = inject(HttpClient);
  private baseUrl = `${DevelopmentUrl}/api/recurring-expenses`

  getMonthItems(budgetId :number) : Observable<RecurringMonthItem[]> {
    return this.httpClient.get<RecurringMonthItem[]>(`${this.baseUrl}?budgetId=${budgetId}`);
  }

  createRecurringExpense(request : CreateRecurringExpenseRequest) : Observable<RecurringExpense> {
    return this.httpClient.post<RecurringExpense>(`${this.baseUrl}`, request);
  }
}
