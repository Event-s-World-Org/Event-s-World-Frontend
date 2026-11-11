import { Attendee } from '../../features/organizer/services/in-person.store';

export function exportAttendeesToExcel(attendees: Attendee[], eventTitle: string): void {
  if (typeof window === 'undefined') return;

  const headers = [
    'Código EW',
    'Nombre Completo',
    'C.I. / Documento',
    'Celular / WhatsApp',
    'Email',
    'Talla Polera',
    'Tipo Entrada',
    'Precio Total (BOB)',
    'Monto Pagado (BOB)',
    'Saldo Pendiente (BOB)',
    'Estado de Pago',
    'Método de Pago',
    'Fecha de Registro',
    'Registrado Por',
  ];

  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = attendees.map((a) => {
    const paid = a.payments.reduce((sum, p) => sum + p.amount, 0);
    const pending = Math.max(0, a.totalPrice - paid);
    const methods =
      Array.from(
        new Set(a.payments.map((p) => (p.method === 'cash' ? 'Efectivo' : 'QR'))),
      ).join(' + ') || 'Ninguno';
    const statusText =
      a.status === 'paid'
        ? 'Totalmente Pagado'
        : a.status === 'installments'
          ? 'En Cuotas (Deuda pendiente)'
          : 'Pendiente de Pago';

    return [
      escapeCell(a.code),
      escapeCell(a.fullName),
      escapeCell(a.ci),
      escapeCell(a.phone),
      escapeCell(a.email),
      escapeCell(a.shirtSize || 'N/A'),
      escapeCell(a.ticketType),
      escapeCell(a.totalPrice),
      escapeCell(paid),
      escapeCell(pending),
      escapeCell(statusText),
      escapeCell(methods),
      escapeCell(a.createdAt ? new Date(a.createdAt).toLocaleString('es-BO') : 'N/A'),
      escapeCell(a.registeredBy || 'Shadith'),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const safeEventName =
    eventTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'evento';
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `registros-${safeEventName}-${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
