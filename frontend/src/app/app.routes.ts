import { Routes } from '@angular/router';
import {PublicLayoutComponent} from './core/layout/public-layout/public-layout.component';
import {AppLayoutComponent} from './core/layout/app-layout/app-layout.component';
import {authGuard} from './core/auth/auth.guard';

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
      },
      {
        path: 'login',
        loadComponent: () => {
          return import('./features/login/login.component')
            .then(m => m.LoginComponent)
        }
      }
    ]
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => {
          return import('./features/dashboard/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
        },
      },
      {
        path: 'budgets',
        loadComponent: () => {
          return import('./features/budgets/budgets/budgets.component')
            .then(m => m.BudgetsComponent)
        }
      },
      {
        path: 'budgets/:id',
        loadComponent: () => {
          return import('./features/budgets/budget-detail/budget-detail.component')
            .then(m => m.BudgetDetailComponent)
        }
      },
      {
        path: 'savings',
        loadComponent: () => {
          return import('./features/budgets/savings-goals/savings-goals/savings-goals.component')
            .then(m => m.SavingsGoalsComponent);
        }
      }
    ]
  }
];
