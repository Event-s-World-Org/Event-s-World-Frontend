const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4201;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sync-store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let state = {
  events: [],
  attendees: [],
  lastUpdated: new Date().toISOString(),
};

if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    state = JSON.parse(raw);
    console.log(`[SyncServer] Estado cargado: ${state.attendees.length} asistentes, ${state.events.length} eventos.`);
  } catch (e) {
    console.error('[SyncServer] Error al leer sync-store.json:', e.message);
  }
}

function saveToDisk() {
  try {
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('[SyncServer] Error al guardar en disco:', e.message);
  }
}

const sseClients = new Set();

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url || '';

  if (url === '/events-world-organizer.apk' || url.startsWith('/download/apk')) {
    const apkPath = path.join(__dirname, 'public', 'events-world-organizer.apk');
    if (fs.existsSync(apkPath)) {
      const stat = fs.statSync(apkPath);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="events-world-organizer.apk"',
      });
      fs.createReadStream(apkPath).pipe(res);
      return;
    }
  }

  if (url.startsWith('/api/sync/stream')) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    sseClients.add(res);
    console.log(`[SyncServer] Nuevo cliente conectado. Total conectados: ${sseClients.size}`);

    res.write(`data: ${JSON.stringify({ type: 'INIT_STATE', state })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
      console.log(`[SyncServer] Cliente desconectado. Restantes: ${sseClients.size}`);
    });
    return;
  }

  if (req.method === 'GET' && url.startsWith('/api/sync/state')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  if (req.method === 'POST' && url.startsWith('/api/sync/attendees')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { action, attendee, paymentUpdate } = payload;

        if (action === 'ADD' && attendee) {
          const idx = state.attendees.findIndex(a => a.id === attendee.id || a.code === attendee.code);
          if (idx >= 0) {
            state.attendees[idx] = attendee;
          } else {
            state.attendees.unshift(attendee);
          }
          saveToDisk();
          broadcastSSE({ type: 'ATTENDEE_SAVED', attendee });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, attendee }));
          return;
        }

        if (action === 'RECORD_PAYMENT' && paymentUpdate) {
          const { attendeeId, payment } = paymentUpdate;
          const target = state.attendees.find(a => a.id === attendeeId);
          if (target) {
            target.payments.push(payment);
            const totalPaid = target.payments.reduce((s, p) => s + p.amount, 0);
            if (totalPaid >= target.totalPrice) {
              target.status = 'paid';
            } else {
              target.status = 'installments';
            }
            saveToDisk();
            broadcastSSE({ type: 'ATTENDEE_SAVED', attendee: target });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, attendee: target }));
            return;
          }
        }

        if (action === 'SYNC_ALL' && Array.isArray(payload.attendees)) {
          state.attendees = payload.attendees;
          saveToDisk();
          broadcastSSE({ type: 'ALL_ATTENDEES_SYNCED', attendees: state.attendees });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, count: state.attendees.length }));
          return;
        }

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Acción no reconocida' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && url.startsWith('/api/sync/events')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { event, events } = payload;
        if (event) {
          const idx = state.events.findIndex(e => e.id === event.id);
          if (idx >= 0) {
            state.events[idx] = event;
          } else {
            state.events.unshift(event);
          }
          saveToDisk();
          broadcastSSE({ type: 'EVENT_SAVED', event });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, event }));
          return;
        }
        if (Array.isArray(events)) {
          state.events = events;
          saveToDisk();
          broadcastSSE({ type: 'ALL_EVENTS_SYNCED', events: state.events });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, count: state.events.length }));
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Evento inválido' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SyncServer] Servidor de sincronización en vivo corriendo en http://0.0.0.0:${PORT}`);
});
