import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  inject,
  signal, DestroyRef,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SavingsGoal } from '../dtos/savings-goal';
import { CURRENCY_CODE } from '../../budget-helpers/budget-helpers';
import {SavingsGoalService} from '../savings-goal-service/savings-goal.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {HttpErrorResponse} from '@angular/common/http';

/**
 * The popup for adding money to a savings goal. The amount is ADDED to what is
 * already saved. It never replaces it.
 *
 * How to use it (from a parent template):
 *
 *   <app-add-savings-dialog #addSavingsDialog (saved)="onSavingsAdded($event)" />
 *   <button (click)="addSavingsDialog.open(goal)">Add savings</button>
 *
 * The dialog will save the amount itself (POST) and then emit `saved` with the
 * updated goal. The save call is still a placeholder, see submit().
 */
@Component({
  selector: 'app-add-savings-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './add-savings-dialog.component.html',
  styleUrls: ['./add-savings-dialog.component.scss'],
})
export class AddSavingsDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly savingsGoalService = inject(SavingsGoalService)
  private readonly destroyRef = inject(DestroyRef)

  readonly currencyCode = CURRENCY_CODE;

  /** Sent up to the parent after the savings were added. It carries the updated goal. */
  @Output() readonly saved = new EventEmitter<SavingsGoal>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  // ---- State ----
  /** The goal the money is added to. Set every time the popup opens. */
  readonly goal = signal<SavingsGoal | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  /**
   * The amount must be above 0, with at most 2 decimal places (like money).
   * The pattern also limits the whole part to 10 digits. The backend checks again.
   */
  readonly form = this.fb.group({
    amount: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.pattern(/^\d{1,10}(\.\d{1,2})?$/),
    ]),
  });

  /** Opens the popup for one goal. Everything is set here every time, so no old values are left from the last use. */
  open(goal: SavingsGoal): void {
    this.goal.set(goal);

    // With no argument, the form goes back to the values it started with.
    this.form.reset();
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const goal = this.goal();
    const { amount } = this.form.getRawValue();
    // The form is valid here, but TypeScript does not know that.
    if (goal === null || amount === null) {
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    this.savingsGoalService.addSavings(
      {amountToAdd: amount, id : goal.id}
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedGoal) => {
          this.saving.set(false);
          this.close();
          this.saved.emit(updatedGoal);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.formError.set(this.errorMessage(error));
        }
      })
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.detail;
      if (typeof message === 'string' && message.trim() !== '') {
        return message;
      }
      if (error.status === 0) {
        return 'We could not reach the server. Check your connection and try again.';
      }
    }
    return 'Something went wrong. Check the values and try again.';
  }
}
