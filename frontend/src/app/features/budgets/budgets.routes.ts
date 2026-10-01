import { Routes } from '@angular/router';
import {BudgetsComponent} from './budgets/budgets.component';

/**
 * Routes for the budgets feature.
 *
 * Load them lazily from the main route config, inside the app shell:
 *
 *   {
 *     path: 'budgets',
 *     loadChildren: () => import('./features/budgets/budgets.routes').then((m) => m.BUDGETS_ROUTES),
 *   }
 */
export const BUDGETS_ROUTES: Routes = [
  {
    path: '',
    component: BudgetsComponent,
    title: 'Budgets | BudgetFlow',
  },
];
