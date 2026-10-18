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
import { Subscription } from 'rxjs';

import { Category } from '../dtos/category';
import { CategoryService } from '../category-service/category.service';
import {CreateRecurringExpenseRequest} from '../dtos/create-recurring-expense-request';
import { RecurringExpense } from '../dtos/recurring-expense';
import { RecurringExpenseService } from '../recurring-expense-service/recurring-expense.service';

/** A name made only of spaces counts as empty, like @NotBlank on the backend. */
const notBlank = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { blank: true } : null;

/**
 * The popup for creating a recurring expense (something paid every month, like rent).
 * A recurring expense is only a template: it does not belong to any budget or month.
 * Short months are handled by the backend, which suggests the last day of the month
 * when the due day does not exist (day 31 in February).
 *
 * How to use it (from a parent template):
 *
 *   <app-recurring-expense-dialog #recurringDialog (saved)="onRecurringSaved($event)" />
 *   <button (click)="recurringDialog.open()">Add recurring expense</button>
 *
 * The category is chosen from the shared `categories` list (loaded from /api/categories).
 * Every category can be used, because a template is not tied to a budget.
 * The dropdown is the same custom one as in BudgetCategoryDialogComponent. The form keeps
 * the category id, and the name is looked up when saving, because the backend asks for it.
 *
 * The dialog saves the template itself (POST) and then emits `saved`.
 */
@Component({
  selector: 'app-recurring-expense-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './recurring-expense-dialog.component.html',
  styleUrls: ['./recurring-expense-dialog.component.scss'],
})
export class RecurringExpenseDialogComponent {
  private readonly recurringService = inject(RecurringExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Sent up to the parent after a recurring expense was saved. */
  @Output() readonly saved = new EventEmitter<RecurringExpense>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('categoryList') private categoryList?: ElementRef<HTMLUListElement>;

  // ---- State ----
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  // ---- Dropdown data ----
  /** Every category from the shared `categories` table. Loaded the first time the popup opens. */
  readonly categories = signal<Category[]>([]);
  readonly categoriesLoading = signal(false);
  readonly categoriesError = signal(false);
  /** true = the dropdown list is showing. */
  readonly categoryOpen = signal(false);
  /** Index (in categories) of the option highlighted by keyboard or mouse. */
  readonly activeOptionIndex = signal(0);

  /** Loaded fine, but the list is empty. */
  readonly noCategories = computed(
    () => !this.categoriesLoading() && !this.categoriesError() && this.categories().length === 0,
  );

  private categoriesSubscription?: Subscription;

  /** Same rules as CreateRecurringExpenseRequest on the backend. */
  readonly form = this.fb.group({
    description: this.fb.control('', [
      Validators.required,
      notBlank,
      Validators.maxLength(255),
    ]),
    categoryId: this.fb.control<number | null>(null, Validators.required),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    dueDay: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(31),
      Validators.pattern(/^\d+$/),
    ]),
  });

  /**
   * Opens the popup with an empty form.
   * Everything is set here every time, so no old values are left from the last use.
   */
  open(): void {
    this.form.reset({
      description: '',
      categoryId: null,
      amount: null,
      dueDay: null,
    });
    this.formError.set(null);
    this.saving.set(false);
    this.categoryOpen.set(false);

    if (this.categories().length === 0) {
      this.loadCategories();
    }

    this.dialog?.nativeElement.showModal();
  }

  close(): void {
    this.dialog?.nativeElement.close();
  }

  /** Runs when the popup closes in any way (Cancel, Escape, or after saving). */
  onClosed(): void {
    this.categoryOpen.set(false);
    this.formError.set(null);
  }

  /**
   * Loads the category list. Also used by the "Try again" button.
   * The request that is still running is cancelled first, so an older answer
   * can never replace a newer one.
   */
  loadCategories(): void {
    this.categoriesSubscription?.unsubscribe();
    this.categoriesLoading.set(true);
    this.categoriesError.set(false);

    this.categoriesSubscription = this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.categoriesLoading.set(false);
        },
        error: () => {
          this.categoriesError.set(true);
          this.categoriesLoading.set(false);
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { description, categoryId, amount, dueDay } = this.form.getRawValue();
    // The form is valid here, but TypeScript does not know that.
    if (categoryId === null || amount === null || dueDay === null) {
      return;
    }

    // The backend asks for the category name, so it is looked up from the chosen id.
    const categoryName = this.selectedCategoryName();
    if (categoryName === null) {
      return;
    }

    const request: CreateRecurringExpenseRequest = {
      categoryName,
      description: description.trim(),
      amount,
      dueDay,
    };

    this.saving.set(true);
    this.formError.set(null);

    this.recurringService
      .createRecurringExpense(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (recurringExpense) => {
          this.saving.set(false);
          this.close();
          this.saved.emit(recurringExpense);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.formError.set(this.errorMessage(error));
        },
      });
  }

  // ---- Category dropdown (custom, so the list can be short and scrollable) ----

  /** The name of the chosen category, or null when nothing is chosen yet. */
  selectedCategoryName(): string | null {
    const id = this.form.controls.categoryId.value;
    return this.categories().find((c) => c.id === id)?.name ?? null;
  }

  /** The DOM id of the highlighted option, for aria-activedescendant. */
  activeOptionId(): string | null {
    const option = this.categories()[this.activeOptionIndex()];
    return this.categoryOpen() && option ? `recurring-category-option-${option.id}` : null;
  }

  toggleCategoryList(): void {
    if (this.categoryOpen()) {
      this.closeCategoryList();
    } else {
      this.openCategoryList();
    }
  }

  openCategoryList(): void {
    if (this.categoriesLoading() || this.categories().length === 0) {
      return;
    }
    const selectedId = this.form.controls.categoryId.value;
    const index = this.categories().findIndex((c) => c.id === selectedId);
    this.activeOptionIndex.set(index >= 0 ? index : 0);
    this.categoryOpen.set(true);
    this.scrollActiveOptionIntoView();
  }

  /** Also runs when the button loses focus, which counts as "the user is done with it". */
  closeCategoryList(): void {
    this.categoryOpen.set(false);
    this.form.controls.categoryId.markAsTouched();
  }

  chooseCategory(category: Category): void {
    this.form.controls.categoryId.setValue(category.id);
    this.closeCategoryList();
  }

  /** Keyboard support: arrows move, Enter or Space choose, Escape closes only the list. */
  onCategoryKeydown(event: KeyboardEvent): void {
    const options = this.categories();
    const open = this.categoryOpen();

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!open) {
          this.openCategoryList();
          return;
        }
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = Math.min(Math.max(this.activeOptionIndex() + step, 0), options.length - 1);
        this.activeOptionIndex.set(next);
        this.scrollActiveOptionIntoView();
        return;
      }
      case 'Home':
      case 'End':
        if (open) {
          event.preventDefault();
          this.activeOptionIndex.set(event.key === 'Home' ? 0 : options.length - 1);
          this.scrollActiveOptionIntoView();
        }
        return;
      case 'Enter':
      case ' ':
        if (open) {
          event.preventDefault();
          const option = options[this.activeOptionIndex()];
          if (option) {
            this.chooseCategory(option);
          }
        }
        return;
      case 'Escape':
        if (open) {
          // Without this, Escape would also close the whole dialog.
          event.preventDefault();
          event.stopPropagation();
          this.closeCategoryList();
        }
        return;
      case 'Tab':
        this.closeCategoryList();
        return;
    }
  }

  /** Keeps the highlighted option visible inside the scrollable list. */
  private scrollActiveOptionIntoView(): void {
    setTimeout(() =>
      this.categoryList?.nativeElement
        .querySelector<HTMLElement>('[data-active="true"]')
        ?.scrollIntoView({ block: 'nearest' }),
    );
  }

  /** Which message element (if any) the category dropdown should point to for screen readers. */
  categorySelectDescribedBy(): string | null {
    if (this.categoriesError()) {
      return 'recurring-category-error';
    }
    if (this.noCategories()) {
      return 'recurring-category-hint';
    }
    const control = this.form.controls.categoryId;
    return control.touched && control.invalid ? 'recurring-category-error' : null;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail;
      if (typeof message === 'string' && message.trim() !== '') {
        return message;
      }
      if (error.status === 404) {
        return 'That category is not available. Close this window and try again.';
      }
      if (error.status === 0) {
        return 'We could not reach the server. Check your connection and try again.';
      }
    }
    return 'Something went wrong. Check the values and try again.';
  }

  clampDueDay(input: HTMLInputElement): void {
    const value = input.value;

    if (value === '') {
      return;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return;
    }

    const correctedValue = Math.max(1, Math.min(31, Math.floor(number)));

    if (number !== correctedValue) {
      input.value = String(correctedValue);
      this.form.controls.dueDay.setValue(correctedValue);
    }
  }
}
