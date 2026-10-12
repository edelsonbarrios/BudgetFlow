import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
}

/**
 * Frame for every page a logged-in user can open (dashboard, budgets, and more later).
 *
 * Pages never import this layout. The route configuration wraps them in it
 * (the `app` route in app.routes.ts).
 */
@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements AfterViewInit, OnDestroy {
  /** Add a page to the menu by adding a line here. */
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'Budgets', path: '/app/budgets' },
    { label: 'Savings', path: '/app/savings'}
  ];

  /** True once the page has been scrolled a little; the header uses it to "lift" off the page. */
  readonly scrolled = signal(false);

  /** A tiny invisible element at the very top of the page, watched by the observer below. */
  @ViewChild('scrollSentinel') private scrollSentinel?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const sentinel = this.scrollSentinel?.nativeElement;
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }

    // The observer only fires when the sentinel enters or leaves the screen, which is
    // far cheaper than listening to every scroll event. Sentinel out of view = scrolled.
    this.observer = new IntersectionObserver(([entry]) => {
      this.scrolled.set(!entry.isIntersecting);
    });
    this.observer.observe(sentinel);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /**
   * "Skip to content" link for keyboard and screen-reader users.
   * A plain href="#main-content" would send the router to "/#main-content"
   * (because of <base href="/">), so we move focus to <main> ourselves.
   */
  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView();
  }
}
