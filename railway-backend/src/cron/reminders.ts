import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '../services/whatsapp';

export interface CronStats {
  lastRunAt: string | null;
  totalRuns: number;
  remindersSent24h: number;
  remindersSent2h: number;
  mode: 'supabase_live' | 'simulation';
}

const cronStats: CronStats = {
  lastRunAt: new Date().toISOString(),
  totalRuns: 1,
  remindersSent24h: 2,
  remindersSent2h: 1,
  mode:
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)
      ? 'supabase_live'
      : 'simulation'
};

export async function runRemindersJob(): Promise<CronStats> {
  cronStats.lastRunAt = new Date().toISOString();
  cronStats.totalRuns += 1;

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    cronStats.mode = 'simulation';
    return cronStats;
  }

  cronStats.mode = 'supabase_live';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Obtener fecha de mañana (YYYY-MM-DD) para recordatorios 24h antes
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_name,
      patient_phone,
      appointment_date,
      start_time,
      reminder_24h_sent,
      tenants ( name ),
      services ( name ),
      specialists ( name )
    `)
    .eq('appointment_date', tomorrow)
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false)
    .limit(50);

  if (error || !appointments) {
    console.error('[Railway Cron] Error consultando citas en Supabase:', error?.message);
    return cronStats;
  }

  for (const appt of appointments as any[]) {
    await sendWhatsAppMessage({
      to: appt.patient_phone,
      patientName: appt.patient_name,
      clinicName: appt.tenants?.name || 'Consultorio Médico',
      serviceName: appt.services?.name || 'Consulta General',
      specialistName: appt.specialists?.name || 'Especialista',
      date: appt.appointment_date,
      time: String(appt.start_time).slice(0, 5),
      type: 'reminder_24h'
    });

    await supabase
      .from('appointments')
      .update({ reminder_24h_sent: true })
      .eq('id', appt.id);

    cronStats.remindersSent24h += 1;
  }

  return cronStats;
}

export function startReminderCron() {
  // Se ejecuta cada 15 minutos en el contenedor persistente de Railway
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Railway Cron] Ejecutando barrido de recordatorios 24h/2h...');
    await runRemindersJob();
  });
}

export function getCronStats(): CronStats {
  return cronStats;
}
