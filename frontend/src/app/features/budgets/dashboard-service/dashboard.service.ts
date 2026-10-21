import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BudgetSummary } from '../dtos/budget-summary';
import {environment} from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/summary`;

  getBudgetSummary(month: number, year: number): Observable<BudgetSummary> {
    return this.http.get<BudgetSummary>(`${this.baseUrl}/budget/${month}/${year}`);
  }
}
