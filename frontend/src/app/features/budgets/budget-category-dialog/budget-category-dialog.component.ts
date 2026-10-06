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
import { Category } from '../dtos/category';
import { BudgetCategoryService } from '../budget-category-service/budget-category.service';
import { CategoryService } from '../category-service/category.service';
import { CURRENCY_CODE, monthLabel } from '../budget-helpers/budget-helpers';

/**
 * The popup for adding a category to a budget, or editing one.
 *
 * How to use it (from a parent template):
 *
 *   <app-budget-category-dialog #categoryDialog (saved)="onCategorySaved($event)" />
 *   <button (click)="categoryDialog.open(budget)">Add category</button>
 *   <button (click)="categoryDialog.open(budget, category)">Edit</button>
 *
 * The category is chosen from the shared `categories` list (loaded from /api/categories).
 *  - Adding: a dropdown. Categories already in this budget are left out, so the user
 *    cannot pick a duplicate.
 *  - Editing: the category is shown read-only, only the amount can change. Expenses are
 *    attached to this row, so switching "Foods" to "Shopping" would silently move them.
 *    To use another category, add a new row instead.
 *
 * The dialog saves the category itself (POST or PUT) and then emits `saved`.
 * The parent decides what to do next (usually: load the budget again).
 *
 * The budget totals (givenToCategories, leftToAssign, overAllocatedAmount) come from the
 * backend, so the budget passed to open() should be a fresh one.
 *
 * Over-allocation is allowed. If the typed amount would put the budget over its income,
 * the first click on Save shows a confirmation inside the same dialog. Only "Save anyway"
 * sends the request. The backend does not know about the confirmation.
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
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencyCode = CURRENCY_CODE;

  /** Sent up to the parent after a category was saved. */
  @Output() readonly saved = new EventEmitter<BudgetCategory>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('amountInput') private amountInput?: ElementRef<HTMLInputElement>;
  @ViewChild('goBackButton') private goBackButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('categoryList') private categoryList?: ElementRef<HTMLUListElement>;

  // ---- State ----
  /** The budget this category belongs to (or will belong to). */
  readonly budget = signal<Budget | null>(null);
  /** null = adding a new category, a number = editing that budget category row. */
  readonly editingCategoryId = signal<number | null>(null);
  /** The name shown (read-only) while editing. */
  readonly editingCategoryName = signal('');
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  /** true = the "This puts your budget over income. Save anyway?" step is showing. */
  readonly confirmingOverAllocation = signal(false);

  // ---- Dropdown data ----
  /** Every category from the shared `categories` table. */
  readonly categories = signal<Category[]>([]);
  readonly categoriesLoading = signal(false);
  readonly categoriesError = signal(false);
  /** true = the dropdown list is showing. */
  readonly categoryOpen = signal(false);
  /** Index (in availableCategories) of the option highlighted by keyboard or mouse. */
  readonly activeOptionIndex = signal(0);

  /** Categories the user can still add: the ones this budget does not already use. */
  readonly availableCategories = computed(() => {
    const usedIds = new Set((this.budget()?.categories ?? []).map((c) => c.categoryId));
    return this.categories().filter((c) => !usedIds.has(c.id));
  });

  /** Loaded fine, but every category is already in this budget. */
  readonly allCategoriesUsed = computed(
    () =>
      !this.categoriesLoading() &&
      !this.categoriesError() &&
      this.categories().length > 0 &&
      this.availableCategories().length === 0,
  );

  // ---- Values read from the budget, for the line under the title ----
  readonly title = computed(() => {
    const budget = this.budget();
    return budget ? monthLabel(budget) : '';
  });
  /** True when the budget's categories already add up to more than its income. */
  readonly isOver = computed(() => (this.budget()?.overAllocatedAmount ?? 0) > 0);
  /** The number shown in the hint: the over amount when over, otherwise what is left to assign. */
  readonly hintAmount = computed(() => {
    const budget = this.budget();
    if (budget === null) {
      return 0;
    }
    return budget.overAllocatedAmount > 0 ? budget.overAllocatedAmount : budget.leftToAssign;
  });

  /**
   * Same rules as CreateBudgetCategoryRequest and UpdateBudgetCategoryRequest on the backend.
   * categoryId is null until the user picks one. The amount must be above 0.
   */
  readonly form = this.fb.group({
    categoryId: this.fb.control<number | null>(null, [Validators.required]),
    allocatedAmount: [0, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    // The confirmation message shows a specific amount. If the user changes any field,
    // that amount may be out of date, so the confirmation step is dropped and the
    // normal Save button comes back.
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.confirmingOverAllocation.set(false));
  }

  /**
   * Opens the popup. Without a category it is a new one, with a category it is an edit.
   * Everything is set here every time, so no old values are left from the last use.
   */
  open(budget: Budget, category?: BudgetCategory): void {
    this.budget.set(budget);
    this.editingCategoryId.set(category?.id ?? null);
    this.editingCategoryName.set(category?.name ?? '');
    this.form.reset({
      categoryId: category?.categoryId ?? null,
      allocatedAmount: category?.allocatedAmount ?? 0,
    });
    this.formError.set(null);
    this.confirmingOverAllocation.set(false);

    this.categoryOpen.set(false);

    // The dropdown is only shown when adding, so only load then. Loading on every open
    // keeps the list fresh if categories were added since the last time.
    if (category === undefined) {
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
    this.confirmingOverAllocation.set(false);
  }

  /** Loads the category list. Also used by the "Try again" button. */
  loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesError.set(false);

    this.categoryService
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

  /**
   * Runs when the form is submitted (Save button or Enter key).
   * If the amount puts the budget over income, this only shows the confirmation step.
   * The request is sent by save(), from the "Save anyway" button.
   */
  submit(): void {
    if (this.budget() === null) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // While the confirmation is showing, Enter must not count as "yes".
    // The user has to click "Save anyway" on purpose.
    if (this.confirmingOverAllocation()) {
      return;
    }
    if (this.overBy() > 0) {
      this.confirmingOverAllocation.set(true);
      // The Save button disappears, so move focus to the safe choice.
      setTimeout(() => this.goBackButton?.nativeElement.focus());
      return;
    }
    this.save();
  }

  /** The user chose "Go back": return to editing, with the cursor in the amount field. */
  goBack(): void {
    this.confirmingOverAllocation.set(false);
    this.amountInput?.nativeElement.focus();
  }

  /** Sends the request. Called directly when the amount fits, or from "Save anyway". */
  save(): void {
    const budget = this.budget();
    if (budget === null || this.form.invalid) {
      return;
    }

    const { categoryId, allocatedAmount } = this.form.getRawValue();
    if (categoryId === null) {
      return;
    }
    const id = this.editingCategoryId();

    // Create needs the budgetId in the body. Edit does not: the row id goes in the URL,
    // and the row already knows its budget.
    const call =
      id === null
        ? this.budgetCategoryService.createCategory({
          budgetId: budget.id,
          categoryId,
          allocatedAmount,
        })
        : this.budgetCategoryService.updateCategory(id, {
          budgetId: budget.id,
          categoryId,
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
        // Start the flow again, so the next Save asks for confirmation again.
        this.confirmingOverAllocation.set(false);
        this.formError.set(this.errorMessage(error));
      },
    });
  }

  /**
   * How much the budget would be over its income if the category were saved with the
   * amount typed right now. 0 means it still fits. It triggers the confirmation step,
   * it never blocks saving.
   *
   * This stays on the frontend because it changes with every keystroke. It starts from the
   * backend's givenToCategories. When editing, the category's old amount is taken out first
   * so it is not counted twice.
   */
  overBy(): number {
    const budget = this.budget();
    if (budget === null) {
      return 0;
    }
    const typed = this.form.controls.allocatedAmount.value || 0;
    const editingId = this.editingCategoryId();
    const oldAmount = budget.categories.find((c) => c.id === editingId)?.allocatedAmount ?? 0;
    const over = budget.givenToCategories - oldAmount + typed - budget.totalIncome;
    return over > 0 ? over : 0;
  }

  // ---- Category dropdown (custom, so the list can be short and scrollable) ----

  /** The name of the chosen category, or null when nothing is chosen yet. */
  selectedCategoryName(): string | null {
    const id = this.form.controls.categoryId.value;
    return this.categories().find((c) => c.id === id)?.name ?? null;
  }

  /** The DOM id of the highlighted option, for aria-activedescendant. */
  activeOptionId(): string | null {
    const option = this.availableCategories()[this.activeOptionIndex()];
    return this.categoryOpen() && option ? `category-option-${option.id}` : null;
  }

  toggleCategoryList(): void {
    if (this.categoryOpen()) {
      this.closeCategoryList();
    } else {
      this.openCategoryList();
    }
  }

  openCategoryList(): void {
    if (this.categoriesLoading() || this.availableCategories().length === 0) {
      return;
    }
    const selectedId = this.form.controls.categoryId.value;
    const index = this.availableCategories().findIndex((c) => c.id === selectedId);
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
    const options = this.availableCategories();
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
      return 'category-select-error';
    }
    if (this.allCategoriesUsed()) {
      return 'category-select-hint';
    }
    const control = this.form.controls.categoryId;
    return control.touched && control.invalid ? 'category-select-error' : null;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail;
      if (typeof message === 'string' && message.trim() !== '') {
        return message;
      }
      if (error.status === 409) {
        return 'This category is already in this budget.';
      }
      if (error.status === 404) {
        return 'This budget or category no longer exists. Close this window and reload the page.';
      }
      if (error.status === 0) {
        return 'We could not reach the server. Check your connection and try again.';
      }
    }
    return 'Something went wrong. Check the values and try again.';
  }
}
