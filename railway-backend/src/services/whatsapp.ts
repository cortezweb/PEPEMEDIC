export interface WhatsAppPayload {
  to: string;
  patientName: string;
  clinicName: string;
  serviceName: string;
  specialistName: string;
  date: string;
  time: string;
  type: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation';
}

export interface WhatsAppDeliveryLog {
  id: string;
  timestamp: string;
  to: string;
  clinicName: string;
  type: WhatsAppPayload['type'];
  status: 'delivered' | 'simulated' | 'failed';
  messagePreview: string;
}

const recentLogs: WhatsAppDeliveryLog[] = [
  {
    id: 'wa-init-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    to: '+59170012345',
    clinicName: 'Clínica Dental Sonrisa Perfecta',
    type: 'reminder_24h',
    status: 'delivered',
    messagePreview: 'Recordatorio 24h: Hola María, te esperamos mañana a las 10:00 para Limpieza Dental Ultrasónica.'
  },
  {
    id: 'wa-init-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    to: '+59171299887',
    clinicName: 'FisioActiva Centro de Rehabilitación',
    type: 'confirmation',
    status: 'delivered',
    messagePreview: 'Confirmación: Hola Carlos, tu sesión de Fisioterapia Deportiva quedó agendada para hoy a las 15:30.'
  }
];

export function buildWhatsAppTemplate(payload: WhatsAppPayload): string {
  switch (payload.type) {
    case 'confirmation':
      return `✅ *Reserva Confirmada - ${payload.clinicName}*\n\nHola *${payload.patientName}*, tu cita ha sido registrada con éxito:\n• *Tratamiento:* ${payload.serviceName}\n• *Especialista:* ${payload.specialistName}\n• *Fecha:* ${payload.date}\n• *Hora:* ${payload.time}\n\nPor favor llega 10 minutos antes.`;
    case 'reminder_24h':
      return `⏰ *Recordatorio de Cita (Mañana) - ${payload.clinicName}*\n\nHola *${payload.patientName}*, te recordamos que mañana *${payload.date}* a las *${payload.time}* tienes programada tu cita de *${payload.serviceName}* con *${payload.specialistName}*.\n\nResponde *CONFIRMAR* o avísanos si necesitas reprogramar.`;
    case 'reminder_2h':
      return `🔔 *Tu cita es en 2 horas - ${payload.clinicName}*\n\nHola *${payload.patientName}*, te esperamos hoy a las *${payload.time}* con *${payload.specialistName}* para *${payload.serviceName}*.`;
    case 'cancellation':
      return `❌ *Cita Cancelada - ${payload.clinicName}*\n\nHola *${payload.patientName}*, tu cita del ${payload.date} a las ${payload.time} ha sido cancelada. Puedes volver a agendar desde nuestra app cuando gustes.`;
  }
}

export async function sendWhatsAppMessage(payload: WhatsAppPayload): Promise<WhatsAppDeliveryLog> {
  const message = buildWhatsAppTemplate(payload);
  const provider = process.env.WHATSAPP_PROVIDER || 'simulation';
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  let status: WhatsAppDeliveryLog['status'] = 'simulated';

  if (provider !== 'simulation' && apiUrl && apiToken) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: payload.to.replace(/[^0-9]/g, ''),
          type: 'text',
          text: { body: message }
        })
      });

      status = response.ok ? 'delivered' : 'failed';
    } catch (error) {
      console.error('[Railway WhatsApp Error]:', error);
      status = 'failed';
    }
  }

  const logEntry: WhatsAppDeliveryLog = {
    id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    to: payload.to,
    clinicName: payload.clinicName,
    type: payload.type,
    status,
    messagePreview: message.replace(/\n+/g, ' ').slice(0, 140) + '...'
  };

  recentLogs.unshift(logEntry);
  if (recentLogs.length > 50) recentLogs.pop();

  return logEntry;
}

export function getRecentWhatsAppLogs(): WhatsAppDeliveryLog[] {
  return recentLogs;
}
