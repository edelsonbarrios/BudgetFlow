import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {DevelopmentUrl} from '../../../shared/models/developmentUrl';

import { BudgetCategory } from '../dtos/budget-category';
import { CreateBudgetCategoryRequest } from '../dtos/create-budget-category-request';
import { UpdateBudgetCategoryRequest } from '../dtos/update-budget-category-request';


/**
 * Talks to /api/budget-categories. Only does the HTTP calls.
 *
 * The page does not need "get by id" or "get by budget": categories already
 * arrive inside each budget from /api/budgets.
 */
@Injectable({ providedIn: 'root' })
export class BudgetCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${DevelopmentUrl}/api/budget-categories`

  createCategory(request: CreateBudgetCategoryRequest): Observable<BudgetCategory> {
    return this.http.post<BudgetCategory>(this.baseUrl, request);
  }

  updateCategory(id: number, request: UpdateBudgetCategoryRequest): Observable<BudgetCategory> {
    console.log(`Update is being called here.`);
    console.log(`Budget Category Identifier: ${id}`);
    console.log(`Request body: ${JSON.stringify(request)}`);
    return this.http.put<BudgetCategory>(`${this.baseUrl}/${id}`, request);
  }
}
