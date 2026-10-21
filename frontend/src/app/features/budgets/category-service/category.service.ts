import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DevelopmentUrl} from '../../../shared/models/developmentUrl';
import {Observable} from 'rxjs';
import {Category} from '../dtos/category';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = `${environment.apiUrl}/api/categories`
  private readonly httpClient = inject(HttpClient)

  getCategories() : Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.baseUrl}`);
  }
}
