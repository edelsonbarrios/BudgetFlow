import { CurrencyPipe } from '@angular/common';
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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Budget } from '../dtos/budget';
import { BudgetCategory } from '../dtos/budget-category';
import { BudgetCategoryService } from '../budget-category-service/budget-category.service';
import { CURRENCY_CODE, allocatedTotal, leftToAssign, monthLabel } from '../budget-helpers/budget-helpers';

/**
 * The popup for adding a category to a budget, or editing one.
 *
 * How to use it (from a parent template):
 *
 *   <app-budget-category-dialog #categoryDialog (saved)="onCategorySaved($event)" />
 *   <button (click)="categoryDialog.open(budget)">Add category</button>
 *   <button (click)="categoryDialog.open(budget, category)">Edit</button>
 *
 * The dialog saves the category itself (POST or PUT) and then emits `saved`.
 * The parent decides what to do next (usually: load the budget again).
 */
@Component({
  selector: 'app-budget-category-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './budget-category-dialog.component.html',
  styleUrls: ['./budget-category-dialog.component.scss'],
})
export class BudgetCategoryDialogComponent {
  private readonly budgetCategoryService = inject(BudgetCategoryService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencyCode = CURRENCY_CODE;

  /** Sent up to the parent after a category was saved. */
  @Output() readonly saved = new EventEmitter<BudgetCategory>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  // ---- State ----
  /** The budget this category belongs to (or will belong to). */
  readonly budget = signal<Budget | null>(null);
  /** null = adding a new category, a number = editing that category. */
  readonly editingCategoryId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  // ---- Values worked out from the budget, for the line under the title ----
  readonly title = computed(() => {
    const budget = this.budget();
    return budget ? monthLabel(budget) : '';
  });
  readonly left = computed(() => {
    const budget = this.budget();
    return budget ? leftToAssign(budget) : 0;
  });
  readonly leftShown = computed(() => Math.abs(this.left()));

  /**
   * Same rules as CreateBudgetCategoryRequest and UpdateBudgetCategoryRequest on the backend.
   * The pattern rejects a name made only of spaces. The amount must be above 0.
   */
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    allocatedAmount: [0, [Validators.required, Validators.min(0.01)]],
  });

  /**
   * Opens the popup. Without a category it is a new one, with a category it is an edit.
   * Everything is set here every time, so no old values are left from the last use.
   */
  open(budget: Budget, category?: BudgetCategory): void {
    this.budget.set(budget);
    this.editingCategoryId.set(category?.id ?? null);
    this.form.reset({
      name: category?.name ?? '',
      allocatedAmount: category?.allocatedAmount ?? 0,
    });
    this.formError.set(null);
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
    const budget = this.budget();
    if (budget === null) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, allocatedAmount } = this.form.getRawValue();
    const trimmedName = name.trim();
    const id = this.editingCategoryId();

    // Create needs the budgetId in the body. Edit does not: the category id goes in the URL.
    const call =
      id === null
        ? this.budgetCategoryService.createCategory({
          budgetId: budget.id,
          name: trimmedName,
          allocatedAmount,
        })
        : this.budgetCategoryService.updateCategory(id, {
          name: trimmedName,
          allocatedAmount,
        });

    this.saving.set(true);
    this.formError.set(null);

    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedCategory) => {
        this.saving.set(false);
        this.close();
        this.saved.emit(savedCategory);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(this.errorMessage(error));
      },
    });
  }

  /**
   * How much the budget would be over its income if the category were saved with the
   * amount typed right now. 0 means it still fits. This only warns, it never blocks.
   * When editing, the category's old amount is taken out first so it is not counted twice.
   */
  overBy(): number {
    const budget = this.budget();
    if (budget === null) {
      return 0;
    }
    const typed = this.form.controls.allocatedAmount.value || 0;
    const editingId = this.editingCategoryId();
    const oldAmount = budget.categories.find((c) => c.id === editingId)?.allocatedAmount ?? 0;
    const over = allocatedTotal(budget) - oldAmount + typed - budget.totalIncome;
    return over > 0 ? over : 0;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail;
      if (typeof message === 'string' && message.trim() !== '') {
        return message;
      }
      if (error.status === 409) {
        return 'A category with this name already exists in this budget.';
      }
      if (error.status === 404) {
        return 'This budget no longer exists. Close this window and reload the page.';
      }
      if (error.status === 0) {
        return 'We could not reach the server. Check your connection and try again.';
      }
    }
    return 'Something went wrong. Check the values and try again.';
  }
}
