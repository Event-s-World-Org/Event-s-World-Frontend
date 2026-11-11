import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideCalendar,
  LucidePlus,
  LucideSearch,
  LucideZap,
} from '@lucide/angular';
import { EventItem, EventsStore } from '../services/events.store';

@Component({
  selector: 'app-my-events-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideCalendar,
    LucidePlus,
    LucideSearch,
    LucideZap,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-events.page.html',
  styleUrl: './my-events.page.css',
})
export class MyEventsPage {
  readonly eventsStore = inject(EventsStore);
  readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly selectedFilter = signal<'all' | 'published' | 'draft'>('all');

  readonly filteredEvents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const f = this.selectedFilter();

    return this.eventsStore.events().filter((e) => {
      const matchesFilter =
        f === 'all' ? true : f === 'published' ? e.status === 'published' : e.status === 'draft';
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  });

  selectEvent(event: EventItem): void {
    this.eventsStore.setActiveEvent(event.id);
    void this.router.navigate(['/panel/eventos', event.id]);
  }
}
