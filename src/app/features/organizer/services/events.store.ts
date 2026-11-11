import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { RealtimeSyncService } from '../../../core/services/realtime-sync.service';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'closed'
  | 'completed'
  | 'cancelled';

export interface PricingPhase {
  id: string;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
  limitSpots?: number;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  country: string;
  city: string;
  location: string;
  price: number;
  pricingMode?: 'single' | 'phases';
  phases?: PricingPhase[];
  currency: string;
  capacityMax: number;
  registeredCount: number;
  minAge?: number;
  qrImageUrl?: string;
  qrAmount?: number;
  qrExpiresAt?: string;
  status: EventStatus;
  coverUrl?: string;
  contactInfo: string;
  customFields?: { label: string; type: string; required: boolean }[];
  createdAt: string;
}

const EVENTS_STORAGE_KEY = 'events_world_organizer_events';

@Injectable({
  providedIn: 'root',
})
export class EventsStore {
  private readonly syncService = inject(RealtimeSyncService);

  readonly events = signal<EventItem[]>(this.loadFromStorage());

  readonly activeEventId = signal<string>('electric-neon-fest-2026');

  readonly activeEvent = computed(() => {
    const list = this.events();
    const id = this.activeEventId();
    return list.find((e) => e.id === id || e.slug === id) || list[0] || null;
  });

  readonly totalEventsCount = computed(() => this.events().length);

  readonly publishedEventsCount = computed(
    () => this.events().filter((e) => e.status === 'published').length,
  );

  readonly draftEventsCount = computed(
    () => this.events().filter((e) => e.status === 'draft').length,
  );

  constructor() {
    effect(() => {
      const data = this.events();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(data));
      }
    });

    this.syncService.registerCallbacks({
      onEventReceived: (syncedEvent: EventItem) => {
        this.events.update((prev) => {
          const idx = prev.findIndex((e) => e.id === syncedEvent.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = syncedEvent;
            return copy;
          }
          return [syncedEvent, ...prev];
        });
      },
    });
  }

  private loadFromStorage(): EventItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.getInitialSeed();
    }
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!raw) {
        const seed = this.getInitialSeed();
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw) as EventItem[];
    } catch {
      return this.getInitialSeed();
    }
  }

  private getInitialSeed(): EventItem[] {
    return [
      {
        id: 'electric-neon-fest-2026',
        slug: 'electric-neon-fest-2026',
        title: 'Electric Neon Fest 2026',
        description:
          'Festival nocturno de música electrónica, luces y arte digital en el corazón de La Paz.',
        category: 'Festival y música',
        startDate: '2026-11-15T18:00',
        endDate: '2026-11-16T02:00',
        country: 'Bolivia',
        city: 'La Paz',
        location: 'Arena Central',
        price: 120,
        currency: 'BOB',
        capacityMax: 500,
        registeredCount: 320,
        minAge: 18,
        status: 'published',
        contactInfo: 'contacto@electricneon.bo · +591 70012345',
        customFields: [
          { label: 'Nombres', type: 'text', required: true },
          { label: 'Apellidos', type: 'text', required: true },
          { label: 'Email', type: 'email', required: true },
          { label: 'Celular', type: 'tel', required: true },
          { label: 'Talla de polera', type: 'select', required: true },
        ],
        createdAt: '2026-10-15T10:00:00Z',
      },
      {
        id: 'carrera-10k-solidaria',
        slug: 'carrera-10k-solidaria',
        title: 'Carrera 10K Solidaria',
        description: 'Carrera benéfica por los valles de Cochabamba.',
        category: 'Deporte',
        startDate: '2026-12-07T07:00',
        endDate: '2026-12-07T12:00',
        country: 'Bolivia',
        city: 'Cochabamba',
        location: 'Plaza Principal',
        price: 60,
        currency: 'BOB',
        capacityMax: 600,
        registeredCount: 410,
        minAge: 14,
        status: 'published',
        contactInfo: '+591 71234567',
        createdAt: '2026-10-20T10:00:00Z',
      },
      {
        id: 'yoga-al-amanecer',
        slug: 'yoga-al-amanecer',
        title: 'Yoga al amanecer',
        description: 'Sesión de meditación y yoga al aire libre.',
        category: 'Salud y bienestar',
        startDate: '2026-10-30T06:00',
        endDate: '2026-10-30T09:00',
        country: 'Bolivia',
        city: 'Santa Cruz',
        location: 'Parque Los Mangales',
        price: 0,
        currency: 'BOB',
        capacityMax: 25,
        registeredCount: 18,
        status: 'published',
        contactInfo: 'yoga@santacruz.bo',
        createdAt: '2026-10-22T10:00:00Z',
      },
    ];
  }

  createEvent(data: Omit<EventItem, 'id' | 'slug' | 'registeredCount' | 'createdAt'>): EventItem {
    const slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newEvent: EventItem = {
      ...data,
      id: slug || `evento-${Date.now()}`,
      slug: slug || `evento-${Date.now()}`,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.events.update((prev) => [newEvent, ...prev]);
    this.activeEventId.set(newEvent.id);
    void this.syncService.broadcastEvent(newEvent);
    return newEvent;
  }

  setActiveEvent(id: string): void {
    this.activeEventId.set(id);
  }
}
