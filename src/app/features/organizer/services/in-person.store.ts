import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { RealtimeSyncService } from '../../../core/services/realtime-sync.service';

export type PaymentMethod = 'cash' | 'qr';
export type PaymentStatus = 'paid' | 'installments' | 'pending';

export interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  voucherUrl?: string;
  note?: string;
  date: string;
}

export interface Attendee {
  id: string;
  code: string;
  eventId: string;
  fullName: string;
  email: string;
  ci: string;
  phone: string;
  ticketType: string;
  shirtSize?: string;
  registeredBy?: string;
  totalPrice: number;
  payments: PaymentRecord[];
  status: PaymentStatus;
  createdAt: string;
}

const STORAGE_KEY = 'events_world_attendees_beta';

@Injectable({
  providedIn: 'root',
})
export class InPersonStore {
  private readonly syncService = inject(RealtimeSyncService);

  readonly attendees = signal<Attendee[]>(this.loadFromStorage());

  readonly totalCollected = computed(() => {
    return this.attendees().reduce((sum, a) => {
      const attendeePaid = a.payments.reduce((pSum, p) => pSum + p.amount, 0);
      return sum + attendeePaid;
    }, 0);
  });

  readonly cashCollected = computed(() => {
    return this.attendees().reduce((sum, a) => {
      const cash = a.payments
        .filter((p) => p.method === 'cash')
        .reduce((pSum, p) => pSum + p.amount, 0);
      return sum + cash;
    }, 0);
  });

  readonly qrCollected = computed(() => {
    return this.attendees().reduce((sum, a) => {
      const qr = a.payments
        .filter((p) => p.method === 'qr')
        .reduce((pSum, p) => pSum + p.amount, 0);
      return sum + qr;
    }, 0);
  });

  readonly pendingBalance = computed(() => {
    return this.attendees().reduce((sum, a) => {
      const paid = a.payments.reduce((pSum, p) => pSum + p.amount, 0);
      const remaining = Math.max(0, a.totalPrice - paid);
      return sum + remaining;
    }, 0);
  });

  readonly totalAttendeesCount = computed(() => this.attendees().length);

  readonly paidAttendeesCount = computed(
    () => this.attendees().filter((a) => a.status === 'paid').length,
  );

  readonly installmentAttendeesCount = computed(
    () => this.attendees().filter((a) => a.status === 'installments').length,
  );

  readonly pendingAttendeesCount = computed(
    () => this.attendees().filter((a) => a.status === 'pending').length,
  );

  constructor() {
    effect(() => {
      const data = this.attendees();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    });

    this.syncService.registerCallbacks({
      onAttendeeReceived: (syncedAttendee: Attendee) => {
        this.attendees.update((prev) => {
          const idx = prev.findIndex(
            (a) => a.id === syncedAttendee.id || a.code === syncedAttendee.code,
          );
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = syncedAttendee;
            return copy;
          }
          return [syncedAttendee, ...prev];
        });
      },
      onInitState: (serverAttendees: Attendee[]) => {
        if (serverAttendees && serverAttendees.length > 0) {
          this.attendees.update((prev) => {
            const merged = [...prev];
            for (const sAtt of serverAttendees) {
              const idx = merged.findIndex(
                (a) => a.id === sAtt.id || a.code === sAtt.code,
              );
              if (idx >= 0) {
                merged[idx] = sAtt;
              } else {
                merged.push(sAtt);
              }
            }
            return merged;
          });
        }
      },
    });
  }

  private loadFromStorage(): Attendee[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.getSeedData();
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = this.getSeedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw) as Attendee[];
    } catch {
      return this.getSeedData();
    }
  }

  private getSeedData(): Attendee[] {
    return [
      {
        id: 'att-1',
        code: 'EW-4H8QD',
        eventId: 'demo-event',
        fullName: 'Juan Pérez',
        email: 'juan.perez@email.com',
        ci: '8492012 LP',
        phone: '77218934',
        ticketType: 'General',
        shirtSize: 'M',
        registeredBy: 'Ana Quispe',
        totalPrice: 120,
        status: 'paid',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        payments: [
          {
            id: 'pay-1',
            amount: 120,
            method: 'cash',
            date: new Date(Date.now() - 3600000 * 5).toISOString(),
            note: 'Cobro presencial efectivo',
          },
        ],
      },
      {
        id: 'att-2',
        code: 'EW-7F3K2',
        eventId: 'demo-event',
        fullName: 'Valentina Rojas',
        email: 'valentina.rojas@email.com',
        ci: '9123847 CB',
        phone: '68124930',
        ticketType: 'General',
        shirtSize: 'S',
        registeredBy: 'Shadith Cuenca',
        totalPrice: 120,
        status: 'installments',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        payments: [
          {
            id: 'pay-2',
            amount: 40,
            method: 'qr',
            date: new Date(Date.now() - 3600000 * 3).toISOString(),
            note: 'Cuota 1 de 3 aprobada',
          },
        ],
      },
      {
        id: 'att-3',
        code: 'EW-9K2LM',
        eventId: 'demo-event',
        fullName: 'Carlos Mendoza',
        email: 'carlos.mendoza@email.com',
        ci: '4392011 SC',
        phone: '71092834',
        ticketType: 'VIP',
        shirtSize: 'L',
        registeredBy: 'Shadith Cuenca',
        totalPrice: 120,
        status: 'paid',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        payments: [
          {
            id: 'pay-3',
            amount: 120,
            method: 'qr',
            date: new Date(Date.now() - 3600000 * 12).toISOString(),
            note: 'Pago presencial QR',
          },
        ],
      },
    ];
  }

  getAttendeeRemainingDebt(attendee: Attendee): number {
    const paid = attendee.payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, attendee.totalPrice - paid);
  }

  getAttendeeTotalPaid(attendee: Attendee): number {
    return attendee.payments.reduce((sum, p) => sum + p.amount, 0);
  }

  registerAttendee(data: {
    eventId: string;
    fullName: string;
    email?: string;
    ci: string;
    phone: string;
    ticketType: string;
    shirtSize?: string;
    registeredBy?: string;
    totalPrice: number;
    initialPayment?: {
      amount: number;
      method: PaymentMethod;
      voucherUrl?: string;
      note?: string;
    };
  }): Attendee {
    const payments: PaymentRecord[] = [];

    if (data.initialPayment && data.initialPayment.amount > 0) {
      payments.push({
        id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        amount: data.initialPayment.amount,
        method: data.initialPayment.method,
        voucherUrl: data.initialPayment.voucherUrl,
        note: data.initialPayment.note,
        date: new Date().toISOString(),
      });
    }

    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    let status: PaymentStatus = 'pending';
    if (paid >= data.totalPrice && data.totalPrice > 0) {
      status = 'paid';
    } else if (paid > 0) {
      status = 'installments';
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newAttendee: Attendee = {
      id: `att-${Date.now()}`,
      code: `EW-${randomSuffix}`,
      eventId: data.eventId,
      fullName: data.fullName.trim(),
      email: (data.email || '').trim(),
      ci: data.ci.trim(),
      phone: data.phone.trim(),
      ticketType: data.ticketType,
      shirtSize: data.shirtSize,
      registeredBy: data.registeredBy || 'Shadith Cuenca',
      totalPrice: data.totalPrice,
      payments,
      status,
      createdAt: new Date().toISOString(),
    };

    this.attendees.update((prev) => [newAttendee, ...prev]);
    void this.syncService.broadcastAttendee(newAttendee);
    return newAttendee;
  }

  addInstallment(
    attendeeId: string,
    payment: {
      amount: number;
      method: PaymentMethod;
      voucherUrl?: string;
      note?: string;
    },
  ): void {
    let broadcastedPayment: PaymentRecord | null = null;

    this.attendees.update((prev) =>
      prev.map((attendee) => {
        if (attendee.id !== attendeeId) return attendee;

        const newPayment: PaymentRecord = {
          id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          amount: payment.amount,
          method: payment.method,
          voucherUrl: payment.voucherUrl,
          note: payment.note,
          date: new Date().toISOString(),
        };

        broadcastedPayment = newPayment;

        const updatedPayments = [...attendee.payments, newPayment];
        const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);

        let status: PaymentStatus = 'pending';
        if (totalPaid >= attendee.totalPrice) {
          status = 'paid';
        } else if (totalPaid > 0) {
          status = 'installments';
        }

        return {
          ...attendee,
          payments: updatedPayments,
          status,
        };
      }),
    );

    if (broadcastedPayment) {
      void this.syncService.broadcastPayment(attendeeId, broadcastedPayment);
    }
  }
}
