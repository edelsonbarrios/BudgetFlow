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
import {environment} from '../../../shared/environments/environment';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/budgets`

  getBudgets(filter: BudgetFilter): Observable<PageResponse<Budget>> {
    return this.http.post<PageResponse<Budget>>(`${this.baseUrl}/filter-by-user`, filter);
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
