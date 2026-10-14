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

import { CreateSavingsGoalRequest } from '../dtos/create-savings-goal-request';
import { SavingsGoal } from '../dtos/savings-goal';
import { SavingsGoalService } from '../savings-goal-service/savings-goal.service';
import {applyServerFieldErrors} from '../../../../shared/utilities/apply-server-error';
import {JsonPipe} from '@angular/common';

/** 5 becomes "05", so dates always look like 2026-10-05. */
const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * The popup for creating a savings goal.
 *
 * How to use it (from a parent template):
 *
 *   <app-savings-goal-dialog #goalDialog (saved)="onGoalSaved($event)" />
 *   <button (click)="goalDialog.open()">New goal</button>
 *
 * The dialog saves the goal itself (POST) and then emits `saved`.
 * A new goal starts with 0 saved and the ACTIVE status. The backend sets both.
 */
@Component({
  selector: 'app-savings-goal-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './savings-goal-dialog.component.html',
  styleUrls: ['./savings-goal-dialog.component.scss'],
})
export class SavingsGoalDialogComponent {
  private readonly savingsGoalService = inject(SavingsGoalService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  /** Sent up to the parent after a goal was saved. */
  @Output() readonly saved = new EventEmitter<SavingsGoal>();

  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;

  // ---- State ----
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  /**
   * Today, as text like '2026-10-12'. It is the earliest date the picker allows.
   * Set every time the popup opens, so it stays right if the page is left open overnight.
   * Built by hand: toISOString() converts to UTC and can shift the date in UTC+8.
   */
  readonly minDate = signal('');

  /**
   * The picker's min is only a hint: a date can still be typed by keyboard.
   * This check makes the field invalid when the date is before today.
   * The date is optional, so an empty field is fine. ISO dates compare correctly as text.
   * The backend checks the date again.
   */
  private readonly notInPast = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value || this.minDate() === '') {
      return null;
    }
    return value >= this.minDate() ? null : { inPast: true };
  };

  /**
   * Same rules as CreateSavingsGoalRequest on the backend.
   * The pattern rejects a name made only of spaces. The amount must be above 0.
   */
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    targetAmount: this.fb.control<number>(0, [
      Validators.required,
      Validators.min(0.01),
    ]),
    targetDate: this.fb.control('', [this.notInPast]),
  });

  /** Opens the popup. Everything is set here every time, so no old values are left from the last use. */
  open(): void {
    const today = new Date();
    this.minDate.set(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);

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

    const { name, targetAmount, targetDate } = this.form.getRawValue();
    // The form is valid here, but TypeScript does not know that.
    if (targetAmount === null) {
      return;
    }

    const request: CreateSavingsGoalRequest = {
      name: name.trim(),
      targetAmount,
      currentAmount : 0.00,
      targetDate: targetDate || null,
    };

    this.saving.set(true);
    this.formError.set(null);

    this.savingsGoalService
      .createSavingsGoal(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (goal) => {
          this.saving.set(false);
          this.close();
          this.saved.emit(goal);
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
