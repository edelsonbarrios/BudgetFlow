import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
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

import { SavingsGoal, SavingsGoalStatus } from '../dtos/savings-goal';
import { UpdateSavingsGoalRequest } from '../dtos/update-savings-goal-request';
import { SavingsGoalService } from '../savings-goal-service/savings-goal.service';
import { applyServerFieldErrors } from '../../../../shared/utilities/apply-server-error';

/** 5 becomes "05", so dates always look like 2026-10-05. */
const pad = (n: number): string => String(n).padStart(2, '0');

/** The statuses the user can pick, in the order they appear. */
const STATUS_OPTIONS: { value: SavingsGoalStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ARCHIVED', label: 'Archived' },
];

/**
 * The popup for updating a savings goal (name, target amount, target date, status).
 * It does NOT change the saved amount. Money is added in AddSavingsDialogComponent.
 *
 * How to use it (from a parent template):
 *
 *   <app-update-savings-goal-dialog #updateGoalDialog (saved)="onGoalUpdated($event)" />
 *   <button (click)="updateGoalDialog.open(goal)">Update</button>
 *
 * The dialog saves the changes itself (PUT) and then emits `saved` with the
 * updated goal.
 */
@Component({
  selector: 'app-update-savings-goal-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './update-savings-goal-dialog.component.html',
  styleUrls: ['./update-savings-goal-dialog.component.scss'],
})
export class UpdateSavingsGoalDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly savingsGoalService = inject(SavingsGoalService);
  private readonly destroyRef = inject(DestroyRef);

  /** Sent up to the parent after the goal was updated. It carries the updated goal. */
  @Output() readonly saved = new EventEmitter<SavingsGoal>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  // ---- State ----
  /** The goal being updated. Set every time the popup opens. */
  readonly goal = signal<SavingsGoal | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  /** Today, as text like '2026-10-12'. Set every time the popup opens. Built by hand because toISOString() can shift the date in UTC+8. */
  readonly minDate = signal('');

  /**
   * The date the goal had when the popup opened ('' when it had none).
   * A goal can already be overdue. Without this, its old date would count as
   * "in the past" and the user could not change just the name.
   */
  private readonly originalDate = signal('');

  /** The status pills the template shows. */
  readonly statusOptions = STATUS_OPTIONS;

  /**
   * Makes the field invalid when the date is before today.
   * Exception: the date the goal already had. The date is optional, so empty is fine.
   * The backend checks the date again.
   */
  private readonly notInPast = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value || this.minDate() === '' || value === this.originalDate()) {
      return null;
    }
    return value >= this.minDate() ? null : { inPast: true };
  };

  /** Same rules as the backend UpdateSavingsGoalRequest. The backend checks again. */
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    targetAmount: [0, [Validators.required, Validators.min(0.01)]],
    targetDate: ['', [this.notInPast]],
    // The type is written here, so the value is 'ACTIVE' | 'PAUSED' | ... and not any string.
    status: this.fb.control<SavingsGoalStatus>('ACTIVE', [Validators.required]),
  });

  /** Opens the popup for one goal. The form is filled with the goal's current values every time. */
  open(goal: SavingsGoal): void {
    const today = new Date();
    this.minDate.set(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);

    // Keep only the 'yyyy-MM-dd' part, because <input type="date"> cannot show anything longer.
    const date = goal.targetDate ? goal.targetDate.slice(0, 10) : '';
    this.originalDate.set(date);

    this.goal.set(goal);
    this.form.reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: date,
      status: goal.status,
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const goal = this.goal();
    const { name, targetAmount, targetDate, status } = this.form.getRawValue();
    // The form is valid here, but TypeScript does not know that.
    if (goal === null) {
      return;
    }

    const request: UpdateSavingsGoalRequest = {
      id: goal.id,
      name: name.trim(),
      targetAmount,
      targetDate: targetDate || null,
      status,
    };

    this.saving.set(true);
    this.formError.set(null);

    this.savingsGoalService
      .updateSavingsGoal(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedGoal) => {
          this.saving.set(false);
          this.close();
          this.saved.emit(updatedGoal);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.showError(error);
        },
      });
  }

  /**
   * Field errors from the server go under their own fields (the red outline and the message).
   * Anything else (a rule like "date in the past", a lost connection) goes in the message
   * at the bottom of the form.
   */
  private showError(error: unknown): void {
    const leftover = applyServerFieldErrors(this.form, error);

    if (leftover === null) {
      this.formError.set(this.errorMessage(error));
      return;
    }
    this.formError.set(leftover.length > 0 ? leftover.join(' ') : null);
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
