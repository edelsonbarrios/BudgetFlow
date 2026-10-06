import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { BudgetSummary } from '../dtos/budget-summary';
import { DevelopmentUrl } from '../../../shared/models/developmentUrl';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${DevelopmentUrl}/api/summary`;

  getBudgetSummary(month: number, year: number): Observable<BudgetSummary> {
    return this.http.get<BudgetSummary>(`${this.baseUrl}/budget/${month}/${year}`);
  }
}
