import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Registration states (database.md) and event states (FR-02.4). */
export type RegistrationStatus =
  'pending' | 'in_observation' | 'approved' | 'rejected' | 'confirmed';
export type EventStatus =
  'draft' | 'published' | 'registrations_closed' | 'finished' | 'suspended' | 'cancelled';
export type Status = RegistrationStatus | EventStatus;

type Tone = 'pending' | 'approved' | 'observed' | 'rejected' | 'info' | 'neutral';

const STATUSES: Record<Status, { tone: Tone; label: string }> = {
  pending: { tone: 'pending', label: $localize`:@@status.pending:Pendiente` },
  in_observation: { tone: 'observed', label: $localize`:@@status.inObservation:En observación` },
  approved: { tone: 'approved', label: $localize`:@@status.approved:Aprobado` },
  rejected: { tone: 'rejected', label: $localize`:@@status.rejected:Rechazado` },
  confirmed: { tone: 'approved', label: $localize`:@@status.confirmed:Confirmada` },
  draft: { tone: 'neutral', label: $localize`:@@status.draft:Borrador` },
  published: { tone: 'approved', label: $localize`:@@status.published:Publicado` },
  registrations_closed: {
    tone: 'pending',
    label: $localize`:@@status.registrationsClosed:Inscripciones cerradas`,
  },
  finished: { tone: 'info', label: $localize`:@@status.finished:Finalizado` },
  suspended: { tone: 'rejected', label: $localize`:@@status.suspended:Suspendido` },
  cancelled: { tone: 'rejected', label: $localize`:@@status.cancelled:Cancelado` },
};

const TONES: Record<Tone, string> = {
  pending: 'bg-pending-bg text-pending',
  approved: 'bg-approved-bg text-approved',
  observed: 'bg-observed-bg text-observed',
  rejected: 'bg-rejected-bg text-rejected',
  info: 'bg-info-bg text-info',
  neutral: 'bg-surface-2 text-muted',
};

/**
 * Solid status badge: coloured dot plus text, never colour alone (design-system.md §2.2).
 * The default label can be replaced with `label`.
 */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center gap-2 rounded-pill px-3 py-1 text-secondary font-semibold',
    '[class]': 'toneClasses()',
  },
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  readonly status = input.required<Status>();
  readonly label = input<string>();

  protected readonly text = computed(() => this.label() ?? STATUSES[this.status()].label);
  protected readonly toneClasses = computed(() => TONES[STATUSES[this.status()].tone]);
}
