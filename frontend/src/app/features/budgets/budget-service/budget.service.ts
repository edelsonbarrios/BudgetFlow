import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Budget} from '../dtos/budget';
import {BudgetCategory} from '../dtos/budget-category';
import {BudgetFilter} from '../dtos/budget-filter';
import {PageResponse} from '../../../shared/models/PageResponse';
import {CreateBudgetRequest} from '../dtos/create-budget-request';
import {UpdateBudgetRequest} from '../dtos/update-budget-request';
import {DevelopmentUrl} from '../../../shared/models/developmentUrl';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${DevelopmentUrl}/api/budgets`

  getBudgets(filter: BudgetFilter): Observable<PageResponse<Budget>> {
    let params = new HttpParams().set('page', filter.page).set('size', filter.size);

    if (filter.year !== null) {
      params = params.set('year', filter.year);
    }
    if (filter.month !== null) {
      params = params.set('month', filter.month);
    }

    return this.http.get<PageResponse<Budget>>(this.baseUrl, { params });
  }

  createBudget(request: CreateBudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.baseUrl, request);
  }

  updateBudget(id: number, request: UpdateBudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.baseUrl}/${id}`, request);
  }

  getBudgetById(
    id: number
  ) : Observable<Budget> {
    return this.http.get<Budget>(`${this.baseUrl}/${id}`);
  }
}
