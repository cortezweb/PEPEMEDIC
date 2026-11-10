import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Activity,
  MessageSquare,
  CreditCard,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  Server,
  Database,
  Globe,
  Building2,
  X
} from 'lucide-react';
import { db } from '../lib/supabase';
import {
  SPECIALTY_CATALOG,
  SpecialtyType,
  TenantClinic
} from '../types/clinic';

export const SaasLanding: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantClinic[]>(() => db.getTenants());
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Estado formulario nueva clínica
  const [clinicName, setClinicName] = useState('');
  const [slug, setSlug] = useState('');
  const [specialty, setSpecialty] = useState<SpecialtyType>('dental');
  const [whatsapp, setWhatsapp] = useState('59170000000');
  const [address, setAddress] = useState('');
  const [themeColor, setThemeColor] = useState('#0284c7');

  const handleNameChange = (val: string) => {
    setClinicName(val);
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(autoSlug);
  };

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !slug.trim()) return;

    const preset = SPECIALTY_CATALOG[specialty];
    const created = db.createTenant({
      name: clinicName.trim(),
      slug: slug.trim(),
      specialty,
      description: preset.description,
      address: address || 'Av. Principal #100',
      phone: `+${whatsapp}`,
      whatsapp_number: whatsapp.replace(/[^0-9]/g, ''),
      theme_color: themeColor || preset.defaultColor,
      requires_deposit: true,
      deposit_percentage: 30,
      payment_instructions: 'Pago por QR Simple o transferencia bancaria.',
      plan: 'trial'
    });

    setTenants(db.getTenants());
    setShowOnboarding(false);
    navigate(`/c/${created.slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                PEPE<span className="text-sky-600">MEDIC</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                SaaS Multi-Tenant PWA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="text-sm font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Panel Clínica (/admin)
            </Link>
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Registrar mi Clínica
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:py-20 bg-gradient-to-b from-white via-sky-50/40 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Diseñado para Clínicas Dentales, Fisioterapia y Consultorios</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Tu consultorio con reservas online 24/7, cobro de señas y{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                recordatorios por WhatsApp
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Reduce las inasistencias de pacientes hasta en un 80%. Cada clínica obtiene su propio portal PWA instalable (ej.{' '}
              <code className="text-xs font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-800">
                /c/sonrisa-dental
              </code>
              ) conectado a Supabase y automatizado con Railway.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/c/sonrisa-dental"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition"
              >
                <CalendarCheck className="w-4 h-4" />
                Probar Demo Clínica Dental
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/c/fisio-activa"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition"
              >
                <Activity className="w-4 h-4" />
                Probar Demo Fisioterapia
              </Link>

              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-sm transition"
              >
                Abrir Dashboard Admin
              </Link>
            </div>

            {/* Arquitectura Híbrida Badges */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <Globe className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Cloudflare Pages</div>
                  <div className="text-slate-500">PWA Edge + Service Worker</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <Database className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Supabase Multi-Tenant</div>
                  <div className="text-slate-500">PostgreSQL + Políticas RLS</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <Server className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Railway Worker</div>
                  <div className="text-slate-500">Cron 24h + Bot WhatsApp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta Derecha: Clínicas Activas en el SaaS */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Directorio Multi-Tenant Activo
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    Consultorios en la Plataforma ({tenants.length})
                  </h2>
                </div>
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>

              <div className="space-y-3">
                {tenants.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/60 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: t.theme_color }}
                        />
                        <h3 className="font-bold text-slate-900 text-sm">
                          {t.name}
                        </h3>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {t.specialty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {t.description}
                      </p>
                      <div className="text-[11px] font-mono text-sky-700">
                        Ruta PWA: /c/{t.slug}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/c/${t.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition"
                      >
                        Reservar Cita
                      </Link>
                      <Link
                        to={`/admin?tenant=${t.id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
                      >
                        Admin
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowOnboarding(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-sky-300 hover:border-sky-500 text-sky-700 hover:bg-sky-50/50 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Crear Nuevo Consultorio / Clínica (Prueba Multi-Tenant)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Características del SaaS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Todo lo que necesita un consultorio moderno
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Pensado específicamente para el flujo de trabajo de odontólogos, fisioterapeutas y clínicas médicas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Agenda Inteligente por Box y Especialista
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calcula automáticamente los bloques disponibles según la duración de cada tratamiento (30, 45 o 60 min) evitando cruces de horario.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Worker de WhatsApp en Railway (24h y 2h antes)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nuestro servicio en Railway revisa cada 15 minutos las citas en Supabase y envía recordatorios automáticos por WhatsApp al paciente.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Cobro de Señas (Anti No-Show) por QR o Tarjeta
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solicita un anticipo (ej. 30% o monto fijo) mediante QR Simple / transferencia o pasarela online antes de bloquear el sillón dental o camilla.
            </p>
          </div>
        </div>
      </section>

      {/* Planes de Suscripción SaaS para Clínicas */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Modelo de Negocio SaaS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Planes de Suscripción para Consultorios
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Consultorio Individual',
                price: '$19',
                period: '/mes',
                desc: 'Ideal para 1 odontólogo o fisioterapeuta independiente.',
                features: [
                  'Portal PWA propio (/c/tu-clinica)',
                  'Hasta 2 especialistas en agenda',
                  'Recordatorios por WhatsApp ilimitados',
                  'Cobro de señas por QR Simple'
                ],
                highlight: false
              },
              {
                name: 'Clínica Pro',
                price: '$39',
                period: '/mes',
                desc: 'Para clínicas dentales o centros de rehabilitación con equipo.',
                features: [
                  'Hasta 10 especialistas y sillones/boxes',
                  'Worker Railway 24/7 (Recordatorios 24h y 2h)',
                  'Pasarela de cobro de señas + Reportes',
                  'Soporte prioritario y dominio personalizado'
                ],
                highlight: true
              },
              {
                name: 'Multi-Sede Enterprise',
                price: '$79',
                period: '/mes',
                desc: 'Para redes de clínicas o franquicias de salud.',
                features: [
                  'Especialistas y sucursales ilimitadas',
                  'API dedicada en Railway + Webhook CRM',
                  'Personalización blanca (White-label PWA)',
                  'SLA garantizado 99.9%'
                ],
                highlight: false
              }
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border flex flex-col justify-between ${
                  plan.highlight
                    ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 shadow-lg'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                    {plan.highlight && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-sky-600 text-white">
                        Más Elegido
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{plan.desc}</p>

                  <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setShowOnboarding(true)}
                  className={`mt-6 w-full py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                    plan.highlight
                      ? 'bg-sky-600 hover:bg-sky-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Comenzar Prueba de 14 Días
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de Onboarding SaaS (Crear nuevo Tenant) */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Onboarding Multi-Tenant
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Registrar Nuevo Consultorio en el SaaS
                </h3>
              </div>
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClinic} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Clínica o Consultorio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. VitalDent Clínica Odontológica"
                  value={clinicName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Identificador URL (Slug) *
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden">
                    <span className="bg-slate-100 text-slate-500 px-2.5 py-2 text-xs font-mono border-r border-slate-300">
                      /c/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área / Especialidad Contratada *
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => {
                      const nextSpec = e.target.value as SpecialtyType;
                      setSpecialty(nextSpec);
                      setThemeColor(SPECIALTY_CATALOG[nextSpec].defaultColor);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:border-sky-500 focus:outline-none font-semibold"
                  >
                    {(Object.keys(SPECIALTY_CATALOG) as SpecialtyType[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {SPECIALTY_CATALOG[k].label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Resumen de Plantilla Pre-configurada para el Área Elegida */}
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-xs space-y-1">
                <div className="font-bold text-sky-900">
                  Plantilla Automática: {SPECIALTY_CATALOG[specialty].label} (
                  {SPECIALTY_CATALOG[specialty].boxName})
                </div>
                <div className="text-slate-600 text-[11px]">
                  Se pre-cargarán automáticamente:{' '}
                  {SPECIALTY_CATALOG[specialty].defaultServices
                    .map((s) => s.name)
                    .join(' • ')}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp de Recepción *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Color Corporativo PWA
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-9 w-14 rounded cursor-pointer border border-slate-300"
                    />
                    <span className="text-xs font-mono text-slate-600">{themeColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección del Consultorio
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. Las Américas #230, Consultorio 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnboarding(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Crear Clínica y Abrir Portal PWA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
