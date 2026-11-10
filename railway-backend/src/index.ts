import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  sendWhatsAppMessage,
  getRecentWhatsAppLogs,
  WhatsAppPayload
} from './services/whatsapp';
import { createCheckoutSession, CheckoutRequest } from './services/payments';
import {
  startReminderCron,
  runRemindersJob,
  getCronStats
} from './cron/reminders';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
  })
);
app.use(express.json());

// 1. Healthcheck para Railway y Panel de Administración
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'clinicas-saas-railway-worker',
    uptimeSeconds: Math.round(process.uptime()),
    cron: getCronStats(),
    whatsappLogsCount: getRecentWhatsAppLogs().length
  });
});

// 2. Obtener historial reciente de envíos de WhatsApp y estado del Cron
app.get('/api/whatsapp/logs', (_req, res) => {
  res.json({
    ok: true,
    cron: getCronStats(),
    logs: getRecentWhatsAppLogs()
  });
});

// 3. Enviar notificación inmediata por WhatsApp (Confirmación, Recordatorio o Cancelación)
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const payload = req.body as WhatsAppPayload;
    if (!payload?.to || !payload?.patientName) {
      return res.status(400).json({ ok: false, error: 'Faltan datos del destinatario' });
    }
    const log = await sendWhatsAppMessage(payload);
    return res.json({ ok: true, log });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// 4. Ejecutar manualmente el Cron de recordatorios 24h/2h desde el Dashboard
app.post('/api/reminders/run-now', async (_req, res) => {
  const stats = await runRemindersJob();
  res.json({ ok: true, stats });
});

// 5. Crear sesión de pago (Seña de cita o Suscripción SaaS de la clínica)
app.post('/api/payments/checkout', (req, res) => {
  const body = req.body as CheckoutRequest;
  if (!body?.tenantId || typeof body.amount !== 'number') {
    return res.status(400).json({ ok: false, error: 'Parámetros de pago inválidos' });
  }
  const session = createCheckoutSession(body);
  return res.json({ ok: true, session });
});

// Iniciar Cron Worker persistente en Railway
startReminderCron();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Railway Backend] Servidor escuchando en http://0.0.0.0:${PORT}`);
});
