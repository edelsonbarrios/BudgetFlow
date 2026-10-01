import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {Budget} from '../dtos/budget';
import {BudgetCategory} from '../dtos/budget-category';
import {BudgetService} from '../budget-service/budget.service';
import {BudgetRequest} from '../dtos/budget-request';

const PAGE_SIZE = 12;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Lists budgets (newest month first, sorted by the backend) and lets the user
 * create or edit one. Categories are shown read-only for now.
 *
 * The page owns its own width. It sits inside the app shell, and the route
 * configuration (budgets.routes.ts) places it there.
 */
@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss'],
})
export class BudgetsComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Change this one value if your money is not in dollars. */
  readonly currencyCode = 'USD';

  readonly monthOptions = MONTH_NAMES.map((name, index) => ({ value: index + 1, name }));
  readonly skeletonRows = [1, 2, 3];

  // ---- List state ----
  readonly budgets = signal<Budget[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly totalElements = signal(0);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // ---- Filters ----
  readonly yearFilter = signal<number | null>(null);
  readonly monthFilter = signal<number | null>(null);
  readonly hasFilters = computed(() => this.yearFilter() !== null || this.monthFilter() !== null);

  // ---- Form dialog state ----
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  private readonly now = new Date();

  /** Same rules as CreateBudgetRequest and UpdateBudgetRequest on the backend. */
  readonly form = this.fb.group({
    month: [this.now.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    year: [this.now.getFullYear(), [Validators.required, Validators.min(1)]],
    totalIncome: [0, [Validators.required, Validators.min(0)]],
  });

  @ViewChild('formDialog') private formDialog?: ElementRef<HTMLDialogElement>;

  ngOnInit(): void {
    this.load();
  }

  // ===========================================================================
  // Loading
  // ===========================================================================

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.budgetService
      .getBudgets({
        year: this.yearFilter(),
        month: this.monthFilter(),
        page: this.page(),
        size: PAGE_SIZE,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.budgets.set(response.content);
          this.totalPages.set(Math.max(response.totalPages, 1));
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('We could not load your budgets. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // ===========================================================================
  // Filters and paging
  // ===========================================================================

  onYearFilter(value: string): void {
    const year = value.trim() === '' ? null : Number(value);
    this.yearFilter.set(year !== null && Number.isInteger(year) && year > 0 ? year : null);
    this.resetToFirstPage();
  }

  onMonthFilter(value: string): void {
    this.monthFilter.set(value === '' ? null : Number(value));
    this.resetToFirstPage();
  }

  clearFilters(): void {
    this.yearFilter.set(null);
    this.monthFilter.set(null);
    this.resetToFirstPage();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  private resetToFirstPage(): void {
    this.successMessage.set(null);
    this.page.set(1);
    this.load();
  }

  // ===========================================================================
  // Create and edit
  // ===========================================================================

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      month: this.now.getMonth() + 1,
      year: this.now.getFullYear(),
      totalIncome: 0,
    });
    this.openDialog();
  }

  openEdit(budget: Budget): void {
    this.editingId.set(budget.id);
    this.form.reset({
      month: budget.month,
      year: budget.year,
      totalIncome: budget.totalIncome,
    });
    this.openDialog();
  }

  closeDialog(): void {
    this.formDialog?.nativeElement.close();
  }

  /** Runs when the dialog closes in any way (Cancel, Escape, or after saving). */
  onDialogClosed(): void {
    this.formError.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: BudgetRequest = this.form.getRawValue();
    const id = this.editingId();
    const call =
      id === null
        ? this.budgetService.createBudget(request)
        : this.budgetService.updateBudget(id, request);

    this.saving.set(true);
    this.formError.set(null);

    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.closeDialog();
        this.successMessage.set(`${this.monthLabel(saved)} budget saved, nice.`);
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(this.errorMessage(error));
      },
    });
  }

  private openDialog(): void {
    this.successMessage.set(null);
    this.formError.set(null);
    this.formDialog?.nativeElement.showModal();
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      if (typeof message === 'string' && message.trim() !== '') {
        return message;
      }
      if (error.status === 0) {
        return 'We could not reach the server. Check your connection and try again.';
      }
    }
    return 'Something went wrong. Check the values and try again.';
  }

  // ===========================================================================
  // Small helpers used by the template
  // ===========================================================================

  monthLabel(budget: Budget): string {
    return `${MONTH_NAMES[budget.month - 1]} ${budget.year}`;
  }

  allocated(budget: Budget): number {
    return budget.categories.reduce((sum, category) => sum + category.allocatedAmount, 0);
  }

  /** Income not yet given to a category. Negative means the categories add up to more than the income. */
  left(budget: Budget): number {
    return budget.totalIncome - this.allocated(budget);
  }

  isOver(budget: Budget): boolean {
    return this.left(budget) < 0;
  }

  /** Whole-number percent of income given to categories (can pass 100). */
  allocatedPercent(budget: Budget): number {
    if (budget.totalIncome <= 0) {
      return budget.categories.length > 0 ? 100 : 0;
    }
    return Math.round((this.allocated(budget) / budget.totalIncome) * 100);
  }

  /** Bar width, capped at 100 so an over-allocated bar never spills out. */
  barFill(budget: Budget): number {
    return Math.min(this.allocatedPercent(budget), 100);
  }
}
