import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  UserCheck,
  Sparkles,
  MapPin,
  Phone,
  CheckCircle2,
  QrCode,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Stethoscope
} from 'lucide-react';
import { db } from '../lib/supabase';
import { sendWhatsAppViaRailway } from '../lib/railwayApi';
import { Appointment, ClinicService, Specialist } from '../types/clinic';

function generateTimeSlots(start = '09:00', end = '18:00', stepMin = 45): string[] {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let current = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const slots: string[] = [];

  while (current + stepMin <= endMinutes) {
    const h = Math.floor(current / 60)
      .toString()
      .padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += stepMin;
  }
  return slots;
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const nm = (total % 60).toString().padStart(2, '0');
  return `${nh}:${nm}`;
}

export const PublicBooking: React.FC = () => {
  const { slug = 'sonrisa-dental' } = useParams<{ slug: string }>();
  const tenant = db.getTenantBySlug(slug);

  const services = useMemo(
    () => (tenant ? db.getServices(tenant.id).filter((s) => s.active) : []),
    [tenant]
  );
  const specialists = useMemo(
    () => (tenant ? db.getSpecialists(tenant.id).filter((s) => s.active) : []),
    [tenant]
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<ClinicService | null>(
    () => services[0] || null
  );
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(
    () => specialists[0] || null
  );

  // Fechas próximas (hoy + 6 días)
  const upcomingDates = useMemo(() => {
    const list: { iso: string; label: string; dayName: string }[] = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dayNames[d.getDay()];
      const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      list.push({ iso, label, dayName });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0].iso);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  // Datos del paciente y pago
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('+5917');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientDni, setPatientDni] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'qr_transfer' | 'online_card' | 'cash_at_clinic'
  >('qr_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);
  const [railwayNotified, setRailwayNotified] = useState(false);

  if (!tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Consultorio no encontrado ({slug})
        </h1>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Verifica el enlace o selecciona una clínica activa desde el directorio SaaS.
        </p>
        <Link
          to="/"
          className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold"
        >
          Volver al Inicio SaaS
        </Link>
      </div>
    );
  }

  const existingAppointments = db.getAppointments(tenant.id);
  const occupiedTimes = new Set(
    existingAppointments
      .filter(
        (a) =>
          a.appointment_date === selectedDate &&
          a.specialist_id === selectedSpecialist?.id &&
          a.status !== 'cancelled'
      )
      .map((a) => a.start_time)
  );

  const timeSlots = generateTimeSlots(
    selectedSpecialist?.start_time || '09:00',
    selectedSpecialist?.end_time || '18:00',
    selectedService?.duration_min || 45
  );

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSpecialist || !patientName.trim()) return;

    setSubmitting(true);
    const endTime = addMinutes(selectedTime, selectedService.duration_min);
    const depositPaid =
      paymentMethod === 'online_card' ||
      (paymentMethod === 'qr_transfer' && paymentReference.trim().length > 0);

    const newAppt = db.createAppointment({
      tenant_id: tenant.id,
      service_id: selectedService.id,
      specialist_id: selectedSpecialist.id,
      patient_name: patientName.trim(),
      patient_phone: patientPhone.trim(),
      patient_email: patientEmail.trim() || undefined,
      patient_dni: patientDni.trim() || undefined,
      appointment_date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      status: depositPaid ? 'confirmed' : 'pending_payment',
      payment_status: depositPaid ? 'deposit_paid' : 'unpaid',
      payment_method: paymentMethod,
      amount_paid: depositPaid ? selectedService.deposit_amount : 0,
      payment_reference:
        paymentReference.trim() ||
        (paymentMethod === 'online_card' ? `RAILWAY-CARD-${Date.now().toString().slice(-4)}` : undefined),
      notes: notes.trim() || undefined
    });

    // Disparar confirmación inmediata mediante el servicio de Railway
    await sendWhatsAppViaRailway({
      to: newAppt.patient_phone,
      patientName: newAppt.patient_name,
      clinicName: tenant.name,
      serviceName: selectedService.name,
      specialistName: selectedSpecialist.name,
      date: newAppt.appointment_date,
      time: newAppt.start_time,
      type: 'confirmation'
    });

    setRailwayNotified(true);
    setConfirmedAppt(newAppt);
    setSubmitting(false);
    setStep(5);
  };

  const whatsappDirectUrl = confirmedAppt
    ? `https://wa.me/${tenant.whatsapp_number}?text=${encodeURIComponent(
        `Hola *${tenant.name}*, acabo de reservar mi cita:\n• Paciente: ${confirmedAppt.patient_name}\n• Tratamiento: ${selectedService?.name}\n• Especialista: ${selectedSpecialist?.name}\n• Fecha: ${confirmedAppt.appointment_date} a las ${confirmedAppt.start_time}\n• Ref Seña: ${confirmedAppt.payment_reference || 'Pendiente'}`
      )}`
    : '#';

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Cabecera Personalizada del Tenant (Clínica) */}
      <header
        className="text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${tenant.theme_color}, #0f172a)`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between text-xs text-white/80 mb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Directorio PEPEMEDIC SaaS
            </Link>
            <Link
              to={`/admin?tenant=${tenant.id}`}
              className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-semibold transition"
            >
              Panel Admin de esta Clínica →
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                    {tenant.specialty === 'dental'
                      ? 'Clínica Odontológica'
                      : tenant.specialty === 'fisioterapia'
                      ? 'Centro de Fisioterapia'
                      : 'Consultorio Especializado'}
                  </span>
                  <span className="text-[11px] text-emerald-300 font-medium">
                    ● Agenda Online Activa
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold mt-1">
                  {tenant.name}
                </h1>
                <p className="text-xs text-white/80 mt-0.5">{tenant.description}</p>
              </div>
            </div>

            <div className="text-xs space-y-1 bg-black/20 p-3 rounded-xl border border-white/10 shrink-0">
              <div className="flex items-center gap-1.5 text-white/90">
                <MapPin className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>{tenant.address}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>WhatsApp: {tenant.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal del Wizard de Reserva */}
      <main className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Barra de Progreso */}
          {step < 5 && (
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
              {[
                { num: 1, title: '1. Tratamiento' },
                { num: 2, title: '2. Especialista' },
                { num: 3, title: '3. Fecha y Hora' },
                { num: 4, title: '4. Tus Datos y Seña' }
              ].map((item) => {
                const active = step === item.num;
                const done = step > item.num;
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => {
                      if (item.num < step) setStep(item.num as 1 | 2 | 3 | 4);
                    }}
                    className={`py-3 px-2 text-center border-b-2 transition cursor-pointer ${
                      active
                        ? 'border-sky-600 text-sky-700 bg-white font-bold'
                        : done
                        ? 'border-emerald-500 text-emerald-700'
                        : 'border-transparent text-slate-400'
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-5 sm:p-7">
            {/* PASO 1: SELECCIONAR SERVICIO */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Selecciona el Servicio o Tratamiento
                  </h2>
                  <p className="text-xs text-slate-500">
                    Precios transparentes con tiempo de sesión asignado en agenda.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {services.map((srv) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {srv.category}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {srv.duration_min} min
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-2">
                            {srv.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {srv.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Precio total: </span>
                            <span className="text-base font-extrabold text-slate-900">
                              ${srv.price}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Seña reserva: ${srv.deposit_amount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedService}
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
                  >
                    Continuar con Especialista
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: SELECCIONAR ESPECIALISTA */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Elige tu Profesional Especialista
                  </h2>
                  <p className="text-xs text-slate-500">
                    Todos nuestros profesionales cuentan con agenda sincronizada en tiempo real.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {specialists.map((spec) => {
                    const isSelected = selectedSpecialist?.id === spec.id;
                    return (
                      <div
                        key={spec.id}
                        onClick={() => setSelectedSpecialist(spec)}
                        className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center shrink-0 text-sm"
                          style={{ backgroundColor: spec.color_tag }}
                        >
                          {spec.name
                            .split(' ')
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {spec.name}
                          </h3>
                          <div className="text-xs font-semibold text-sky-700">
                            {spec.role_title}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {spec.bio}
                          </p>
                          <div className="text-[11px] text-slate-400 pt-1">
                            Horario: {spec.start_time} a {spec.end_time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="button"
                    disabled={!selectedSpecialist}
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Ver Horarios Disponibles
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: FECHA Y HORARIO */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Selecciona Fecha y Hora Disponible
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mostrando bloques de {selectedService?.duration_min} min con{' '}
                    <strong>{selectedSpecialist?.name}</strong>.
                  </p>
                </div>

                {/* Selector rápido de 7 días */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {upcomingDates.map((d) => {
                    const active = selectedDate === d.iso;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setSelectedDate(d.iso)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          active
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="text-[11px] font-medium opacity-80">
                          {d.dayName}
                        </div>
                        <div className="text-sm font-extrabold mt-0.5">{d.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Grilla de horarios */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Horarios para el {selectedDate}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {timeSlots.map((slot) => {
                      const isOccupied = occupiedTimes.has(slot);
                      const isSelected = selectedTime === slot && !isOccupied;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                            isOccupied
                              ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs cursor-pointer'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-sky-400 cursor-pointer'
                          }`}
                        >
                          {slot} {isOccupied ? '(Ocupado)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold cursor-pointer"
                  >
                    Completar Datos y Seña
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: DATOS DEL PACIENTE Y PAGO DE SEÑA */}
            {step === 4 && selectedService && selectedSpecialist && (
              <form onSubmit={handleConfirmBooking} className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedService.name}
                    </div>
                    <div className="text-slate-600">
                      Con <strong>{selectedSpecialist.name}</strong> • Fecha:{' '}
                      <strong>{selectedDate}</strong> a las{' '}
                      <strong>{selectedTime}</strong>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-slate-500">Total: ${selectedService.price}</div>
                    <div className="font-extrabold text-emerald-700 text-sm">
                      Seña ahora: ${selectedService.deposit_amount}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo del Paciente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ana Lucía Flores"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp (para recibir recordatorio 24h) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+59170012345"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cédula / DNI (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 6492018"
                      value={patientDni}
                      onChange={(e) => setPatientDni(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Motivo o molestia principal (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Dolor lumbar al correr / Limpieza anual"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Módulo de Cobro de Seña / Anticipo */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Método de Pago de Seña (${selectedService.deposit_amount})
                    </label>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Reserva Garantizada
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qr_transfer')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        paymentMethod === 'qr_transfer'
                          ? 'border-sky-600 bg-sky-50/50 font-bold text-sky-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-sky-600 shrink-0" />
                      <div>
                        <div>QR Simple / Transferencia</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Confirmación inmediata
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online_card')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        paymentMethod === 'online_card'
                          ? 'border-sky-600 bg-sky-50/50 font-bold text-sky-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-purple-600 shrink-0" />
                      <div>
                        <div>Tarjeta Débito/Crédito</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Procesado por Railway API
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash_at_clinic')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        paymentMethod === 'cash_at_clinic'
                          ? 'border-sky-600 bg-sky-50/50 font-bold text-sky-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div>Pagar en Consultorio</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Sujeto a confirmación
                        </div>
                      </div>
                    </button>
                  </div>

                  {paymentMethod === 'qr_transfer' && (
                    <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row items-center gap-4 text-xs">
                      <div className="w-24 h-24 rounded-xl bg-white border border-slate-300 flex flex-col items-center justify-center p-2 shrink-0">
                        <QrCode className="w-14 h-14 text-slate-800" />
                        <span className="text-[9px] font-mono text-slate-500">
                          QR ${selectedService.deposit_amount}
                        </span>
                      </div>
                      <div className="space-y-2 flex-1">
                        <p className="text-slate-700 font-medium">
                          {tenant.payment_instructions}
                        </p>
                        <input
                          type="text"
                          placeholder="Nro. de Comprobante o Referencia QR (Ej. 994821)"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    ← Cambiar Horario
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {submitting ? 'Procesando Reserva...' : 'Confirmar Cita Ahora'}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 5: TICKET DE CITA CONFIRMADA */}
            {step === 5 && confirmedAppt && (
              <div className="text-center max-w-lg mx-auto py-4 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Cita Registrada con Éxito
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                    ¡Te esperamos, {confirmedAppt.patient_name}!
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {railwayNotified
                      ? 'Nuestro servicio en Railway ha enviado tu confirmación y programó un recordatorio automático 24h antes.'
                      : 'Tu horario ha quedado bloqueado en la agenda de la clínica.'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clínica:</span>
                    <span className="font-bold text-slate-900">{tenant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tratamiento:</span>
                    <span className="font-bold text-slate-900">
                      {selectedService?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Especialista:</span>
                    <span className="font-bold text-slate-900">
                      {selectedSpecialist?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha y Hora:</span>
                    <span className="font-bold text-sky-700">
                      {confirmedAppt.appointment_date} • {confirmedAppt.start_time} a{' '}
                      {confirmedAppt.end_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estado de Seña:</span>
                    <span className="font-bold text-emerald-700 uppercase">
                      {confirmedAppt.payment_status === 'deposit_paid'
                        ? `Seña Pagada ($${confirmedAppt.amount_paid})`
                        : 'Pago en Consultorio'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir WhatsApp de la Clínica
                  </a>

                  <Link
                    to={`/admin?tenant=${tenant.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                  >
                    Ver esta Cita en el Panel Admin →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
