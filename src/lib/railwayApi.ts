export const RAILWAY_API_URL =
  import.meta.env.VITE_RAILWAY_API_URL || 'http://localhost:4000';

export interface RailwayHealthResponse {
  ok: boolean;
  service: string;
  uptimeSeconds: number;
  online: boolean;
  cron: {
    lastRunAt: string | null;
    totalRuns: number;
    remindersSent24h: number;
    remindersSent2h: number;
    mode: 'supabase_live' | 'simulation';
  };
  whatsappLogsCount: number;
}

export interface WhatsAppSendRequest {
  to: string;
  patientName: string;
  clinicName: string;
  serviceName: string;
  specialistName: string;
  date: string;
  time: string;
  type: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation';
}

export interface WhatsAppLogItem {
  id: string;
  timestamp: string;
  to: string;
  clinicName: string;
  type: WhatsAppSendRequest['type'];
  status: 'delivered' | 'simulated' | 'failed';
  messagePreview: string;
}

const localFallbackLogs: WhatsAppLogItem[] = [
  {
    id: 'local-wa-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    to: '+59170055112',
    clinicName: 'Clínica Dental Sonrisa Perfecta',
    type: 'reminder_24h',
    status: 'delivered',
    messagePreview:
      'Recordatorio 24h: Hola María Fernanda, te recordamos tu cita de Limpieza Dental Ultrasónica a las 10:00.'
  }
];

export async function checkRailwayHealth(): Promise<RailwayHealthResponse> {
  try {
    const res = await fetch(`${RAILWAY_API_URL}/health`, {
      signal: AbortSignal.timeout(2500)
    });
    if (!res.ok) throw new Error('Status not OK');
    const data = await res.json();
    return { ...data, online: true };
  } catch {
    return {
      ok: true,
      service: 'clinicas-saas-railway-worker (Local Fallback)',
      uptimeSeconds: 3600,
      online: false,
      cron: {
        lastRunAt: new Date().toISOString(),
        totalRuns: 4,
        remindersSent24h: 3,
        remindersSent2h: 2,
        mode: 'simulation'
      },
      whatsappLogsCount: localFallbackLogs.length
    };
  }
}

export async function fetchWhatsAppLogs(): Promise<WhatsAppLogItem[]> {
  try {
    const res = await fetch(`${RAILWAY_API_URL}/api/whatsapp/logs`, {
      signal: AbortSignal.timeout(2500)
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.logs || localFallbackLogs;
  } catch {
    return localFallbackLogs;
  }
}

export async function sendWhatsAppViaRailway(
  payload: WhatsAppSendRequest
): Promise<WhatsAppLogItem> {
  try {
    const res = await fetch(`${RAILWAY_API_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.log;
  } catch {
    const fallbackItem: WhatsAppLogItem = {
      id: `wa-local-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to: payload.to,
      clinicName: payload.clinicName,
      type: payload.type,
      status: 'simulated',
      messagePreview: `[${payload.type.toUpperCase()}] Hola ${payload.patientName}, cita en ${payload.clinicName} (${payload.serviceName}) el ${payload.date} a las ${payload.time}.`
    };
    localFallbackLogs.unshift(fallbackItem);
    return fallbackItem;
  }
}

export async function triggerRailwayCronNow() {
  try {
    const res = await fetch(`${RAILWAY_API_URL}/api/reminders/run-now`, {
      method: 'POST',
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch {
    return {
      ok: true,
      stats: {
        lastRunAt: new Date().toISOString(),
        totalRuns: 5,
        remindersSent24h: 4,
        remindersSent2h: 2,
        mode: 'simulation'
      }
    };
  }
}
