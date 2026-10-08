import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Expense } from '../dtos/expense';
import {CreateExpenseRequest} from '../dtos/create-expense';
import { DevelopmentUrl } from '../../../shared/models/developmentUrl';
import {PageResponse} from '../../../shared/models/PageResponse';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${DevelopmentUrl}/api/expenses`;

  createExpense(request: CreateExpenseRequest): Observable<Expense> {
    console.log(JSON.stringify(request));
    return this.http.post<Expense>(this.baseUrl, request);
  }

  getAllPaginatedExpensesByBudgetCategoryId(
    budgetCategoryId : number,
    page : number,
    size : number
  ) : Observable<PageResponse<Expense>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Expense>>(`${this.baseUrl}/filter-expenses/${budgetCategoryId}`, { params });
  }
}
