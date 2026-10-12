import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import { SavingsGoal, SavingsGoalStatus } from '../dtos/savings-goal';
import { SavingsGoalService } from '../savings-goal-service/savings-goal.service';
import { SavingsGoalDialogComponent } from '../savings-goal-dialog/savings-goal-dialog.component';
import {CURRENCY_CODE} from '../../budget-helpers/budget-helpers';
import {AddSavingsDialogComponent} from '../add-savings-dialog/add-savings-dialog.component';

/** The backend allows at most 10 per page. */
const PAGE_SIZE = 6;

/** How long to wait after the last key press before searching. */
const SEARCH_DELAY_MS = 300;

/** What a card shows next to the title. "none" means the goal is simply in progress. */
type CardState = 'archived' | 'completed' | 'overdue' | 'none';

/**
 * The savings goals page: a name search, status pills, one card per goal, and paging.
 * A goal is not tied to a month. Every number and every flag (percent, remaining,
 * completed, overdue) comes from the backend. This page only shows them.
 *
 * Creating a goal happens in SavingsGoalDialogComponent.
 */
@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, SavingsGoalDialogComponent, AddSavingsDialogComponent],
  templateUrl: './savings-goals.component.html',
  styleUrls: ['./savings-goals.component.scss'],
})
export class SavingsGoalsComponent implements OnInit {
  private readonly savingsGoalService = inject(SavingsGoalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currencyCode = CURRENCY_CODE;
  readonly skeletonRows = [1, 2, 3];

  /** The status pills. null means "any status". */
  readonly statusOptions: { value: SavingsGoalStatus | null; label: string }[] = [
    { value: null, label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  // ---- List state ----
  readonly goals = signal<SavingsGoal[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly totalElements = signal(0);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  /**
   * False for the first load, so the cards appear slowly one by one.
   * True for every later load (filters, paging, after a save), so the same
   * sequence plays much faster and does not make you wait.
   */
  readonly quickReplay = signal(false);

  // ---- Filters ----
  /** What is typed in the search box, exactly as typed. */
  readonly searchInput = signal('');
  /** The trimmed text that was actually searched for. It follows searchInput after a short pause. */
  readonly searchText = signal('');
  readonly statusFilter = signal<SavingsGoalStatus | null>('ACTIVE');
  /** True when the filters are not the defaults (no search, Active only). */
  readonly hasFilters = computed(
    () => this.searchText() !== '' || this.statusFilter() !== 'ACTIVE',
  );

  private firstLoadDone = false;
  private loadSubscription?: Subscription;
  private searchTimer?: ReturnType<typeof setTimeout>;

  @ViewChild('goalDialog') private goalDialog?: SavingsGoalDialogComponent;
  @ViewChild('addSavingsDialog') private addSavingsDialog ?: AddSavingsDialogComponent;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.searchTimer));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // Cancel the request that is still running. Without this, clicking filters
    // quickly lets an older, slower answer arrive last and replace the newer one.
    this.loadSubscription?.unsubscribe();

    this.quickReplay.set(this.firstLoadDone);
    this.loading.set(true);
    this.loadError.set(null);

    this.loadSubscription = this.savingsGoalService
      .filterPaginatedSavingsGoals({
        searchQuery: this.searchText(),
        status: this.statusFilter(),
        page: this.page(),
        size: PAGE_SIZE,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.goals.set(response.content);
          this.totalPages.set(Math.max(response.totalPages, 1));
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
          this.firstLoadDone = true;
        },
        error: () => {
          this.loadError.set('We could not load your savings goals. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // ===========================================================================
  // Filters and paging
  // ===========================================================================

  /** Runs on every key press. The search itself waits until the typing pauses. */
  onSearchInput(value: string): void {
    this.searchInput.set(value);

    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const text = value.trim();
      // Typing a space at the end changes nothing, so there is nothing to load again.
      if (text === this.searchText()) {
        return;
      }
      this.searchText.set(text);
      this.resetToFirstPage();
    }, SEARCH_DELAY_MS);
  }

  onStatusFilter(status: SavingsGoalStatus | null): void {
    if (status === this.statusFilter()) {
      return;
    }
    this.statusFilter.set(status);
    this.resetToFirstPage();
  }

  /** Back to the defaults: no search, Active goals only. */
  clearFilters(): void {
    clearTimeout(this.searchTimer);
    this.searchInput.set('');
    this.searchText.set('');
    this.statusFilter.set('ACTIVE');
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
  // Create
  // ===========================================================================

  openCreate(): void {
    this.successMessage.set(null);
    this.goalDialog?.open();
  }

  /**
   * Runs when the dialog saved a goal. The filters go back to the defaults,
   * so the new goal (newest first) is on the first page and is not hidden by a search.
   */
  onGoalSaved(goal: SavingsGoal): void {
    clearTimeout(this.searchTimer);
    this.searchInput.set('');
    this.searchText.set('');
    this.statusFilter.set('ACTIVE');
    this.page.set(1);
    this.successMessage.set(`${goal.name} goal created, nice.`);
    this.load();
  }

  // ===========================================================================
  // Small helpers used by the template
  // ===========================================================================

  /** Which tone a card uses. An archived goal wins, then reached, then overdue. */
  cardState(goal: SavingsGoal): CardState {
    if (goal.status === 'ARCHIVED') {
      return 'archived';
    }
    if (goal.completed) {
      return 'completed';
    }
    if (goal.overdue) {
      return 'overdue';
    }
    return 'none';
  }

  /** The word next to the title, so color is never the only clue. */
  stateText(goal: SavingsGoal): string {
    switch (this.cardState(goal)) {
      case 'archived':
        return 'Archived';
      case 'completed':
        return 'Goal reached';
      case 'overdue':
        return 'Target date passed';
      default:
        return '';
    }
  }

  /** Bar width, between 0 and 100, so a bar never spills out. */
  barWidth(percent: number): number {
    return Math.min(Math.max(percent, 0), 100);
  }

  onUpdate(goal : SavingsGoal) {

  }

  onAddSavings(goal : SavingsGoal) {
    this.addSavingsDialog?.open(goal);
  }

  onSavingsAdded(goal : SavingsGoal) {
    this.successMessage.set(`Savings added to ${goal.name}, keep it up.`)
    this.load();
  }
}
