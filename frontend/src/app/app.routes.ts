import { Routes } from '@angular/router';
import {PublicLayoutComponent} from './core/layout/public-layout/public-layout.component';
import {AppLayoutComponent} from './core/layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => {
          return import('./features/landing-page/landing-page/landing-page.component')
            .then(m => m.LandingPageComponent)
        }
      }
    ]
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => {
          return import('./features/dashboard/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
        }
      },
      {
        path: 'budgets',
        loadComponent: () => {
          return import('./features/budgets/budgets/budgets.component')
            .then(m => m.BudgetsComponent)
        }
      }
    ]
  }
];
