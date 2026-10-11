import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  LucideArrowDownRight,
  LucideArrowUpRight,
  LucideBox,
  LucideCheckCircle2,
  LucideChevronLeft,
  LucideChevronRight,
  LucideDownload,
  LucideFileText,
  LucideHandshake,
  LucidePackage,
  LucidePlusCircle,
  LucideSearch,
  LucideShoppingBag,
  LucideSparkles,
  LucideTrendingUp,
  LucideUsers,
} from '@lucide/angular';
import { AppStore } from '../../core/state/app-store';

@Component({
  selector: 'app-dashboard',
  imports: [
    LucideDownload,
    LucidePlusCircle,
    LucideTrendingUp,
    LucideArrowUpRight,
    LucidePackage,
    LucideArrowDownRight,
    LucideShoppingBag,
    LucideSparkles,
    LucideUsers,
    LucideCheckCircle2,
    LucideChevronLeft,
    LucideChevronRight,
    LucideSearch,
    LucideBox,
    LucideHandshake,
    LucideFileText,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard implements AfterViewInit {
  protected readonly store = inject(AppStore);

  protected readonly modulesContainer = viewChild<ElementRef<HTMLDivElement>>('modulesContainer');
  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(true);

  protected readonly filterModule = signal<string>('all');

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScroll(), 100);
  }

  protected checkScroll(): void {
    const el = this.modulesContainer()?.nativeElement;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    this.canScrollLeft.set(scrollLeft > 10);
    this.canScrollRight.set(scrollLeft < scrollWidth - clientWidth - 10);
  }

  protected scrollModules(direction: 'left' | 'right'): void {
    const el = this.modulesContainer()?.nativeElement;
    if (!el) return;
    const scrollAmount = 390;
    el.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(() => this.checkScroll(), 350);
  }

  protected readonly filteredTransactions = computed(() =>
    this.store.transactions().filter((t) => {
      if (this.filterModule() === 'all') return true;
      return t.module.toLowerCase() === this.filterModule().toLowerCase();
    }),
  );

  protected exportReport(): void {
    const rows = this.store
      .transactions()
      .map((t) => `${t.id},${t.module},"${t.description}",${t.status},${t.amount}`)
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,ID,Modulo,Descripcion,Estado,Monto\n' + rows;
    // Same CSV payload/filename as the original, with a URL-safe encoding.
    const encodedUri = encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'reporte_general.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
