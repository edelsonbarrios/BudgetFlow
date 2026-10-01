import { Component, ElementRef, OnDestroy, AfterViewInit, ViewChild, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

/**
 * Frame for every page a logged-out visitor can open
 * (landing page now; login and register later).
 *
 * Pages never import this layout. The route configuration wraps them in it.
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss'],
})
export class PublicLayoutComponent implements AfterViewInit, OnDestroy {
  readonly currentYear = new Date().getFullYear();

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
