import {inject, Injectable} from '@angular/core';
import {DevelopmentUrl} from '../../../../shared/models/developmentUrl';
import {HttpClient, HttpParams} from '@angular/common/http';
import {SavingsGoalFilter} from '../dtos/SavingsGoalFilter';
import {Observable} from 'rxjs';
import {SavingsGoal} from '../dtos/savings-goal';
import {PageResponse} from '../../../../shared/models/PageResponse';
import {CreateSavingsGoalRequest} from '../dtos/create-savings-goal-request';
import {AddSavingsRequest} from '../dtos/add-savings-request';
import {UpdateSavingsGoalRequest} from '../dtos/update-savings-goal-request';

@Injectable({
  providedIn: 'root'
})
export class SavingsGoalService {
  private baseUrl = `${DevelopmentUrl}/api/savings-goal`
  private readonly http = inject(HttpClient);

  filterPaginatedSavingsGoals(
    request : SavingsGoalFilter
  ): Observable<PageResponse<SavingsGoal>> {
    return this.http.post<PageResponse<SavingsGoal>>(`${this.baseUrl}/filter-goals`, request);
  }

  createSavingsGoal(
    request : CreateSavingsGoalRequest
  ) : Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${this.baseUrl}`, request);
  }

  addSavings(
    request : AddSavingsRequest
  ) : Observable<SavingsGoal> {
    return this. http.patch<SavingsGoal>(`${this.baseUrl}/add-savings`, request);
  }

  updateSavingsGoal(
    request : UpdateSavingsGoalRequest
  ) : Observable<SavingsGoal> {
    return this.http.put<SavingsGoal>(`${this.baseUrl}`, request);
  }
}
