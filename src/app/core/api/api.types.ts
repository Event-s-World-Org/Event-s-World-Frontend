export interface EventPricingPhaseDto {
  id: string;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
  limitSpots?: number;
}

export interface EventDto {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'suspended';
  price: number;
  currency: string;
  isFree: boolean;
  pricingPhases?: EventPricingPhaseDto[];
  paymentQrUrl?: string;
  totalSpots?: number;
  occupiedSpots?: number;
}

export interface CreateEventRequest {
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  currency: string;
  isFree: boolean;
}

export interface PaymentRecordDto {
  id: string;
  amount: number;
  method: 'cash' | 'qr';
  timestamp: string;
  receiptNumber?: string;
  receiptPhotoUrl?: string;
  note?: string;
}

export interface ParticipantDto {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  age?: number;
  customData?: Record<string, string>;
  totalPrice: number;
  status: 'paid' | 'installments';
  registeredAt: string;
  payments: PaymentRecordDto[];
}

export interface InPersonRegistrationRequest {
  eventId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  age?: number;
  customData?: Record<string, string>;
  amountPaid: number;
  totalPrice: number;
  paymentMethod: 'cash' | 'qr';
  receiptNumber?: string;
  receiptPhotoUrl?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  method: 'cash' | 'qr';
  receiptNumber?: string;
  receiptPhotoUrl?: string;
  note?: string;
}

export interface DashboardMetricsDto {
  eventId: string;
  totalAttendees: number;
  totalCapacity: number;
  totalCollected: number;
  totalPendingDebt: number;
  collectedCash: number;
  collectedQr: number;
  currency: string;
  paidCount: number;
  installmentsCount: number;
}
