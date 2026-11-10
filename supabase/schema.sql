-- ============================================================================
-- CLINICAS SAAS - ESQUEMA MULTI-TENANT PARA SUPABASE (POSTGRESQL + RLS)
-- Soporta Clínicas Dentales, Centros de Fisioterapia y Consultorios Médicos
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE TENANTS (CLÍNICAS / CONSULTORIOS)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    specialty TEXT NOT NULL CHECK (specialty IN ('dental', 'fisioterapia', 'medicina', 'estetica', 'traumatologia', 'pediatria', 'psicologia')),
    description TEXT,
    address TEXT,
    phone TEXT,
    whatsapp_number TEXT NOT NULL,
    logo_url TEXT,
    theme_color TEXT DEFAULT '#0ea5e9',
    -- Configuración de cobros / señas para pacientes
    requires_deposit BOOLEAN DEFAULT true,
    deposit_percentage INTEGER DEFAULT 30 CHECK (deposit_percentage BETWEEN 0 AND 100),
    payment_qr_url TEXT,
    payment_instructions TEXT DEFAULT 'Transferencia bancaria o pago por QR simple.',
    -- Estado de suscripción SaaS de la clínica
    plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled')),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MIEMBROS DE LA CLÍNICA (VINCULACIÓN CON SUPABASE AUTH)
CREATE TABLE IF NOT EXISTS public.tenant_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'specialist', 'receptionist')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tenant_id, user_id)
);

-- 3. ESPECIALISTAS (ODONTÓLOGOS, FISIOTERAPEUTAS, DOCTORES)
CREATE TABLE IF NOT EXISTS public.specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    color_tag TEXT DEFAULT '#0284c7',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICIOS / TRATAMIENTOS
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    duration_min INTEGER NOT NULL DEFAULT 45,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HORARIOS DE ATENCIÓN POR ESPECIALISTA
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES public.specialists(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Domingo, 1 = Lunes ... 6 = Sábado
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '18:00',
    slot_interval_min INTEGER NOT NULL DEFAULT 45,
    is_working BOOLEAN DEFAULT true,
    UNIQUE (specialist_id, day_of_week)
);

-- 6. CITAS / RESERVAS DE PACIENTES
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    specialist_id UUID NOT NULL REFERENCES public.specialists(id) ON DELETE RESTRICT,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    patient_dni TEXT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid')),
    payment_method TEXT DEFAULT 'qr_transfer' CHECK (payment_method IN ('qr_transfer', 'online_card', 'cash_at_clinic')),
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    payment_reference TEXT,
    notes TEXT,
    -- Control de recordatorios procesados por el Worker en Railway
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_2h_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTAS POS (NOTA DE RESERVA Y NOTA DE CONCLUSIÓN DE SERVICIO)
CREATE TABLE IF NOT EXISTS public.pos_service_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    folio_number TEXT NOT NULL,
    note_type TEXT NOT NULL CHECK (note_type IN ('nota_reserva', 'nota_conclusion')),
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_dni TEXT,
    specialist_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ service_id, name, qty, unit_price, subtotal }]
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    deposit_deducted NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'qr_transfer' CHECK (payment_method IN ('cash', 'qr_transfer', 'card')),
    payment_reference TEXT,
    reservation_notes TEXT,
    conclusion_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FINANZAS: EGRESOS, GASTOS OPERATIVOS Y PAGO DE COMISIONES A DOCTORES
CREATE TABLE IF NOT EXISTS public.clinic_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('insumos_clinicos', 'comision_especialista', 'alquiler_servicios', 'equipamiento', 'marketing', 'otros')),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'qr_transfer' CHECK (payment_method IN ('cash', 'qr_transfer', 'card')),
    specialist_id UUID REFERENCES public.specialists(id) ON DELETE SET NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVENTARIO DE INSUMOS Y MATERIALES CLÍNICOS
CREATE TABLE IF NOT EXISTS public.clinical_supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT NOT NULL DEFAULT 'Material Clínico',
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    unit TEXT NOT NULL DEFAULT 'Unidades',
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    supplier TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MATRIZ DE PERMISOS POR ROL (RBAC MULTI-TENANT)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'specialist', 'receptionist', 'assistant')),
    allowed_modules JSONB NOT NULL DEFAULT '["dashboard", "calendario", "reservas", "clientes"]'::jsonb,
    can_collect_pos BOOLEAN DEFAULT false,
    can_view_finances BOOLEAN DEFAULT false,
    can_manage_supplies BOOLEAN DEFAULT false,
    can_manage_roles BOOLEAN DEFAULT false,
    UNIQUE (tenant_id, role)
);

-- 11. EVALUACIONES DE ESPECIALISTA (TRIAJE, SIGNOS VITALES, ODONTOGRAMA Y MAPA CORPORAL EVA)
CREATE TABLE IF NOT EXISTS public.specialist_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_id UUID,
    patient_name TEXT NOT NULL,
    specialist_name TEXT NOT NULL,
    specialty_area TEXT NOT NULL,
    vital_signs JSONB DEFAULT '{}'::jsonb, -- { bp, hr, temp, spo2, weight, height, bmi }
    body_map_zones JSONB DEFAULT '[]'::jsonb, -- [{ zoneId, zoneLabel, evaPain, therapy, cost }]
    clinical_diagnosis TEXT,
    treatment_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RECETARIO MÉDICO, ÓRDENES DE ESTUDIO Y CONSENTIMIENTOS INFORMADOS
CREATE TABLE IF NOT EXISTS public.clinical_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    folio TEXT NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('receta', 'orden_estudio', 'certificado', 'consentimiento')),
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_dni TEXT,
    specialist_name TEXT NOT NULL,
    specialist_role TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    medications_or_studies JSONB NOT NULL DEFAULT '[]'::jsonb,
    indications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES PARA RENDIMIENTO MULTI-TENANT Y CRON DE RAILWAY
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON public.appointments(tenant_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_reminders ON public.appointments(appointment_date, status, reminder_24h_sent, reminder_2h_sent);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - AISLAMIENTO MULTI-TENANT
-- ============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Función auxiliar: verifica si el usuario autenticado pertenece al tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_id = target_tenant_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de lectura pública para el portal de reservas (/c/:slug)
CREATE POLICY "Lectura pública de clínicas activas"
    ON public.tenants FOR SELECT
    USING (true);

CREATE POLICY "Lectura pública de especialistas activos"
    ON public.specialists FOR SELECT
    USING (active = true OR public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Lectura pública de servicios activos"
    ON public.services FOR SELECT
    USING (active = true OR public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Lectura pública de horarios"
    ON public.schedules FOR SELECT
    USING (true);

-- Citas: Los pacientes pueden crear reservas públicamente y consultar disponibilidad
CREATE POLICY "Creación pública de reservas por pacientes"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Lectura de citas para disponibilidad y miembros del tenant"
    ON public.appointments FOR SELECT
    USING (true);

-- Políticas de administración (solo miembros del tenant pueden modificar su clínica)
CREATE POLICY "Admin actualiza su clínica"
    ON public.tenants FOR UPDATE
    USING (public.user_belongs_to_tenant(id));

CREATE POLICY "Admin gestiona especialistas de su clínica"
    ON public.specialists FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Admin gestiona servicios de su clínica"
    ON public.services FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Admin gestiona horarios de su clínica"
    ON public.schedules FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Admin actualiza citas de su clínica"
    ON public.appointments FOR UPDATE
    USING (public.user_belongs_to_tenant(tenant_id));

-- ============================================================================
-- 7. PLANES DE TRATAMIENTO POR SESIONES Y CUOTAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    specialist_name TEXT NOT NULL,
    plan_title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'rehabilitacion_fisio',
    total_sessions INTEGER NOT NULL DEFAULT 5,
    completed_sessions INTEGER NOT NULL DEFAULT 0,
    total_budget NUMERIC(10, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    installment_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    next_session_date DATE,
    status TEXT NOT NULL DEFAULT 'activo',
    clinical_evolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. GALERÍA CLÍNICA ANTES/DESPUÉS Y VISOR DE RADIOGRAFÍAS / 3D
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clinical_imaging_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    specialist_name TEXT NOT NULL,
    study_type TEXT NOT NULL DEFAULT 'rx_panoramica',
    title TEXT NOT NULL,
    zone_or_tooth TEXT NOT NULL,
    findings_notes TEXT,
    before_label TEXT,
    after_label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. CONTROL DE TRABAJOS DE LABORATORIO DENTAL / ORTOPÉDICO EXTERNO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.external_lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    order_code TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    specialist_name TEXT NOT NULL,
    laboratory_name TEXT NOT NULL,
    work_type TEXT NOT NULL,
    tooth_or_zone TEXT NOT NULL,
    shade_color TEXT NOT NULL DEFAULT 'VITA A2',
    lab_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    patient_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'enviado_lab',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. SALA DE ESPERA DIGITAL (TV / TURNERO EN TIEMPO REAL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.waiting_room_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    ticket_code TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    specialist_name TEXT NOT NULL,
    box_room TEXT NOT NULL,
    service_name TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'en_espera',
    priority TEXT NOT NULL DEFAULT 'normal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. CAMPAÑAS DE REACTIVACIÓN POR WHATSAPP / RECALL CLÍNICO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recall_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    campaign_type TEXT NOT NULL DEFAULT 'limpieza_semestral',
    reason_label TEXT NOT NULL,
    last_visit_date DATE NOT NULL,
    recommended_service TEXT NOT NULL,
    promo_discount_pct INTEGER NOT NULL DEFAULT 15,
    message_template TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_room_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recall_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestiona planes de sesiones de su clínica"
    ON public.treatment_plans FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Admin gestiona estudios de imagen de su clínica"
    ON public.clinical_imaging_studies FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Admin gestiona órdenes de laboratorio de su clínica"
    ON public.external_lab_orders FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Admin gestiona turnero de sala de espera"
    ON public.waiting_room_tickets FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

CREATE POLICY "Admin gestiona campañas de recall de su clínica"
    ON public.recall_campaigns FOR ALL
    USING (public.user_belongs_to_tenant(tenant_id));

