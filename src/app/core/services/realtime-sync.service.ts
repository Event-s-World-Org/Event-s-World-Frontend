import { Injectable, signal } from '@angular/core';
import { Attendee, PaymentRecord } from '../../features/organizer/services/in-person.store';
import { EventItem } from '../../features/organizer/services/events.store';

export type SyncStatus = 'connected' | 'connecting' | 'disconnected';

export interface RealtimeSyncCallbacks {
  readonly onAttendeeReceived?: (attendee: Attendee) => void;
  readonly onEventReceived?: (event: EventItem) => void;
  readonly onInitState?: (attendees: Attendee[], events?: EventItem[]) => void;
}

@Injectable({
  providedIn: 'root',
})
export class RealtimeSyncService {
  readonly status = signal<SyncStatus>('connecting');
  private eventSource: EventSource | null = null;
  private readonly callbacksList: RealtimeSyncCallbacks[] = [];

  getBaseUrl(): string {
    if (typeof window === 'undefined') return '';
    try {
      const custom = localStorage.getItem('EW_SYNC_URL');
      if (custom && custom.trim().length > 0) {
        return custom.trim().replace(/\/$/, '');
      }
    } catch {}

    const isNativeCapacitor =
      (window as any)?.Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80'));

    if (isNativeCapacitor) {
      return 'http://192.168.0.174:4201';
    }

    return '';
  }

  setCustomSyncUrl(url: string): void {
    if (typeof window === 'undefined') return;
    try {
      if (!url || url.trim().length === 0) {
        localStorage.removeItem('EW_SYNC_URL');
      } else {
        localStorage.setItem('EW_SYNC_URL', url.trim());
      }
      this.reconnect();
    } catch {}
  }

  registerCallbacks(callbacks: RealtimeSyncCallbacks): void {
    this.callbacksList.push(callbacks);
  }

  onAttendeeReceived(cb: (attendee: Attendee) => void): void {
    this.registerCallbacks({ onAttendeeReceived: cb });
  }

  onEventReceived(cb: (event: EventItem) => void): void {
    this.registerCallbacks({ onEventReceived: cb });
  }

  onInitState(cb: (attendees: Attendee[], events?: EventItem[]) => void): void {
    this.registerCallbacks({ onInitState: cb });
  }

  connect(): void {
    if (typeof window === 'undefined') return;
    if (this.eventSource) return;

    try {
      const base = this.getBaseUrl();
      const sseUrl = `${base}/api/sync/events`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.status.set('connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INIT_STATE' && data.state) {
            for (const cb of this.callbacksList) {
              cb.onInitState?.(data.state.attendees || [], data.state.events || []);
            }
          } else if (data.type === 'ATTENDEE_SAVED' && data.attendee) {
            for (const cb of this.callbacksList) {
              cb.onAttendeeReceived?.(data.attendee);
            }
          } else if (data.type === 'EVENT_SAVED' && data.event) {
            for (const cb of this.callbacksList) {
              cb.onEventReceived?.(data.event);
            }
          }
        } catch {}
      };

      this.eventSource.onerror = () => {
        this.status.set('disconnected');
      };
    } catch {
      this.status.set('disconnected');
    }
  }

  async broadcastAttendee(attendee: Attendee): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const base = this.getBaseUrl();
      await fetch(`${base}/api/sync/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendee),
      });
    } catch {}
  }

  async broadcastEvent(event: EventItem): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const base = this.getBaseUrl();
      await fetch(`${base}/api/sync/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch {}
  }

  async broadcastPayment(attendeeId: string, payment: PaymentRecord): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const base = this.getBaseUrl();
      await fetch(`${base}/api/sync/attendees/${attendeeId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
    } catch {}
  }

  reconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connect();
  }
}
