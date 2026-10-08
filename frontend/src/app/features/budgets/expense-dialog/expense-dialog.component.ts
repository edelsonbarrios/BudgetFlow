import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Budget } from '../dtos/budget';
import { BudgetCategory } from '../dtos/budget-category';
import { CreateExpenseRequest } from '../dtos/create-expense';
import { Expense } from '../dtos/expense';
import { ExpenseService } from '../expense-service/expense.service';
import { monthLabel } from '../budget-helpers/budget-helpers';

/** 5 becomes "05", so dates always look like 2026-10-05. */
const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * The popup for adding an expense to one budget.
 *
 * How to use it (from a parent template):
 *
 *   <app-expense-dialog #expenseDialog (saved)="onExpenseSaved($event)" />
 *   <button (click)="expenseDialog.open(budget)">Add expense</button>
 *   <button (click)="expenseDialog.open(budget, category)">Add to this category</button>
 *
 * The user picks one of the budget's categories (already chosen when one is passed),
 * then types an amount, a date and a note.
 * The dialog saves the expense itself (POST) and then emits `saved`.
 */
@Component({
  selector: 'app-expense-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expense-dialog.component.html',
  styleUrls: ['./expense-dialog.component.scss'],
})
export class ExpenseDialogComponent {
  private readonly expenseService = inject(ExpenseService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Sent up to the parent after an expense was saved. */
  @Output() readonly saved = new EventEmitter<Expense>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  // ---- State ----
  /** The budget this expense will belong to. null until open() runs. */
  readonly budget = signal<Budget | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  // ---- Values worked out from the budget (they update by themselves) ----
  /** The month shown under the title, like "October 2026". */
  readonly title = computed(() => {
    const budget = this.budget();
    return budget ? monthLabel(budget) : '';
  });

  /** The categories for the dropdown: only the ones in this budget. */
  readonly categories = computed<BudgetCategory[]>(() => this.budget()?.categories ?? []);

  /** The first allowed date, like '2026-10-01'. Built by hand: toISOString() would shift it in UTC+8. */
  readonly minDate = computed(() => {
    const budget = this.budget();
    return budget ? `${budget.year}-${pad(budget.month)}-01` : '';
  });

  /**
   * The last allowed date, like '2026-10-31'.
   * new Date(year, month, 0) is day 0 of the NEXT month (JavaScript months start at 0),
   * which is the last day of THIS month. Leap years work too.
   */
  readonly maxDate = computed(() => {
    const budget = this.budget();
    if (budget === null) {
      return '';
    }
    const lastDay = new Date(budget.year, budget.month, 0).getDate();
    return `${budget.year}-${pad(budget.month)}-${pad(lastDay)}`;
  });

  /**
   * The picker's min and max are only a hint: a date can still be typed by keyboard.
   * This check makes the date field invalid when it is outside the budget's month.
   * ISO dates compare correctly as plain text. The backend checks the date again.
   */
  private readonly dateInMonth = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value || this.minDate() === '') {
      return null;
    }
    return value >= this.minDate() && value <= this.maxDate() ? null : { outOfMonth: true };
  };

  /** Same rules as CreateExpenseRequest on the backend. The note is optional. */
  readonly form = this.fb.group({
    budgetCategoryId: this.fb.control<number | null>(null, Validators.required),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    expenseDate: this.fb.control('', [Validators.required, this.dateInMonth]),
    description: this.fb.control('', Validators.maxLength(255)),
  });

  /**
   * Opens the popup for one budget. Pass a category to start with it already chosen.
   * Everything is set here every time, so no old values are left from the last use.
   */
  open(budget: Budget, category?: BudgetCategory): void {
    // The budget goes first, so the date check below already knows which month to use.
    this.budget.set(budget);
    this.form.reset({
      budgetCategoryId: category?.id ?? null,
      amount: null,
      expenseDate: this.defaultDate(budget),
      description: '',
    });
    this.formError.set(null);
    this.saving.set(false);
    this.dialog?.nativeElement.showModal();
  }

  close(): void {
    this.dialog?.nativeElement.close();
  }

  /** Runs when the popup closes in any way (Cancel, Escape, or after saving). */
  onClosed(): void {
    this.formError.set(null);
  }

  submit(): void {
    if (this.budget() === null) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { budgetCategoryId, amount, expenseDate, description } = this.form.getRawValue();
    // The form is valid here, but TypeScript does not know that.
    if (budgetCategoryId === null || amount === null) {
      return;
    }

    const request: CreateExpenseRequest = {
      budgetCategoryId,
      amount,
      expenseDate,
      description: description.trim() || null,
    };

    this.saving.set(true);
    this.formError.set(null);

    this.expenseService
      .createExpense(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (expense) => {
          this.saving.set(false);
          this.close();
          this.saved.emit(expense);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.formError.set(this.errorMessage(error));
        },
      });
  }

  /** Today when it falls inside the budget's month, otherwise the first day of that month. */
  private defaultDate(budget: Budget): string {
    const today = new Date();
    if (today.getFullYear() === budget.year && today.getMonth() + 1 === budget.month) {
      return `${budget.year}-${pad(budget.month)}-${pad(today.getDate())}`;
    }
    return `${budget.year}-${pad(budget.month)}-01`;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail;
      if (typeof message === 'string' && message.trim() !== '') {
        return message;
      }
      if (error.status === 404) {
        return 'This category no longer exists. Close this window and reload the page.';
      }
      if (error.status === 0) {
        return 'We could not reach the server. Check your connection and try again.';
      }
    }
    return 'Something went wrong. Check the values and try again.';
  }
}
