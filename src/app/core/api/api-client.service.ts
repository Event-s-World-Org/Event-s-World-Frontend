import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RuntimeConfigService } from '../config/runtime-config.service';
import {
  CreateEventRequest,
  DashboardMetricsDto,
  EventDto,
  InPersonRegistrationRequest,
  ParticipantDto,
  RecordPaymentRequest,
} from './api.types';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RuntimeConfigService);

  private get baseUrl(): string {
    return this.config.apiUrl();
  }

  getEvents(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${this.baseUrl}/events`);
  }

  getEventById(eventId: string): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.baseUrl}/events/${eventId}`);
  }

  createEvent(request: CreateEventRequest): Observable<EventDto> {
    return this.http.post<EventDto>(`${this.baseUrl}/events`, request);
  }

  getDashboardMetrics(eventId: string): Observable<DashboardMetricsDto> {
    return this.http.get<DashboardMetricsDto>(
      `${this.baseUrl}/events/${eventId}/dashboard`,
    );
  }

  getParticipants(eventId: string): Observable<ParticipantDto[]> {
    return this.http.get<ParticipantDto[]>(
      `${this.baseUrl}/events/${eventId}/participants`,
    );
  }

  registerInPerson(
    request: InPersonRegistrationRequest,
  ): Observable<ParticipantDto> {
    return this.http.post<ParticipantDto>(
      `${this.baseUrl}/registrations/in-person`,
      request,
    );
  }

  recordPayment(
    participantId: string,
    request: RecordPaymentRequest,
  ): Observable<ParticipantDto> {
    return this.http.post<ParticipantDto>(
      `${this.baseUrl}/participants/${participantId}/payments`,
      request,
    );
  }

  updateParticipant(
    participantId: string,
    data: Partial<ParticipantDto>,
  ): Observable<ParticipantDto> {
    return this.http.patch<ParticipantDto>(
      `${this.baseUrl}/participants/${participantId}`,
      data,
    );
  }
}
