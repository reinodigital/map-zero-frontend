import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class PaginationComponent implements OnInit, OnChanges {
  public total = input<number>(0);
  public factor = input<number>(2);
  public offsetEmitter = output<number>();

  // Offsets will be emitted
  public arrOffsets = signal<number[]>([]);

  // This + 1 = pages
  public rangeOffsets = signal<number>(0);

  // Case total products is multiple of factor
  public rest = signal<number | null>(null);

  // Square pages in frontend
  public pages = signal<number>(0);
  public arrPages = signal<number[]>([]);

  public initialOffset = input<number>(0); // to visualize the last page user was at correctly
  public activePage = signal<number>(1);

  ngOnInit(): void {
    this.calculatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['total'] && !changes['total'].firstChange) {
      // If 'total' input changes after the first change, recalculate pagination
      this.calculatePagination();
    }
  }

  public calculatePagination(): void {
    // Clean previous pagination to avoid duplicated rectangular pagination div at frontend
    this.arrOffsets.set([]);
    // this.pages.set(0);
    this.arrPages.set([]);

    // visualize correctly the current square page
    const pageFromOffset = Math.floor(this.initialOffset() / this.factor()) + 1;
    this.activePage.set(pageFromOffset);

    // Ppal logic control of Pagination
    this.rest.set(this.total() % this.factor());
    this.rangeOffsets.set(Math.floor(this.total() / this.factor()));
    this.pages.set(
      this.rest() === 0 ? this.rangeOffsets() : this.rangeOffsets() + 1
    );

    // it will create the offsets that will be the output of one page click
    for (let i = 0; i < this.pages(); i++) {
      this.arrOffsets().push(i * this.factor());
      this.arrPages().push(i + 1);
    }

    this.updateDisplayedPages();
  }

  public updateDisplayedPages(): void {
    const totalPages = this.pages();
    const currentPage = this.activePage();
    const visiblePages: number[] = [];

    if (totalPages <= 7) {
      // If there are only a few pages, show them all
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Always include the first and last page
      visiblePages.push(1);

      // Add "..." if there's a gap after page 1
      if (currentPage > 3) {
        visiblePages.push(-1); // -1 represents "..."
      }

      // Add pages around the current page
      for (
        let i = Math.max(2, currentPage - 2);
        i <= Math.min(totalPages - 1, currentPage + 2);
        i++
      ) {
        visiblePages.push(i);
      }

      // Add "..." if there's a gap before the last page
      if (currentPage < totalPages - 2) {
        visiblePages.push(-1);
      }

      // Always include the last page
      visiblePages.push(totalPages);
    }

    this.arrPages.set(visiblePages);
  }

  public changePage(i: number) {
    if (i === -1 || this.activePage() === i) return; // Ignore clicks on "..."
    this.activePage.set(i);
    this.offsetEmitter.emit(this.arrOffsets()[i - 1]);
    this.updateDisplayedPages(); // Update pagination dynamically
  }
}
