import { createClient } from '@supabase/supabase-js';
import {
  TenantClinic,
  Specialist,
  ClinicService,
  Appointment,
  PatientClient,
  PosServiceNote,
  ClinicExpense,
  ClinicalSupply,
  ClinicUserMember,
  RolePermissionConfig,
  StaffRoleType,
  SPECIALTY_CATALOG,
  SpecialtyType,
  PatientOdontogram,
  SpecialistEvaluationRecord,
  ClinicalPrescription,
  TreatmentPlanPackage,
  ClinicalImagingStudy,
  ExternalLabOrder,
  WaitingRoomTicket,
  RecallCampaignItem,
  LabWorkStatus,
  WaitingTicketStatus
} from '../types/clinic';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('tu-proyecto.supabase.co')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEY = 'pepemedic_saas_multitenant_store_v4';

interface MultiTenantStore {
  tenants: TenantClinic[];
  specialists: Specialist[];
  services: ClinicService[];
  appointments: Appointment[];
  patients: PatientClient[];
  posNotes: PosServiceNote[];
  expenses: ClinicExpense[];
  supplies: ClinicalSupply[];
  members: ClinicUserMember[];
  rolePermissions: RolePermissionConfig[];
  odontograms: PatientOdontogram[];
  evaluations: SpecialistEvaluationRecord[];
  prescriptions: ClinicalPrescription[];
  treatmentPlans: TreatmentPlanPackage[];
  imagingStudies: ClinicalImagingStudy[];
  labOrders: ExternalLabOrder[];
  waitingTickets: WaitingRoomTicket[];
  recallCampaigns: RecallCampaignItem[];
}

const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

const initialStore: MultiTenantStore = {
  tenants: [
    {
      id: 'tenant-dental-1',
      name: 'Clínica Dental Sonrisa Perfecta',
      slug: 'sonrisa-dental',
      specialty: 'dental',
      description:
        'Especialistas en Diseño de Sonrisa, Ortodoncia Invisible, Implantes y Odontología General.',
      address: 'Av. Principal #450, Edificio Médico Piso 3',
      phone: '+591 70012345',
      whatsapp_number: '59170012345',
      theme_color: '#0284c7',
      requires_deposit: true,
      deposit_percentage: 30,
      payment_instructions:
        'Escanea el QR Simple o transfiere a Cuenta Corriente #400-998877 (Banco Unión) a nombre de Sonrisa Perfecta SRL.',
      plan: 'pro',
      subscription_status: 'active'
    },
    {
      id: 'tenant-fisio-2',
      name: 'FisioActiva Centro de Rehabilitación',
      slug: 'fisio-activa',
      specialty: 'fisioterapia',
      description:
        'Fisioterapia Deportiva, Rehabilitación Traumatológica, Punción Seca y Quiropraxia Clínica.',
      address: 'Calle Los Pinos #128, Zona Sur',
      phone: '+591 71299887',
      whatsapp_number: '59171299887',
      theme_color: '#0d9488',
      requires_deposit: true,
      deposit_percentage: 40,
      payment_instructions:
        'Pago por QR Simple o transferencia bancaria para confirmar tu box de fisioterapia.',
      plan: 'starter',
      subscription_status: 'active'
    }
  ],
  specialists: [
    {
      id: 'spec-d1',
      tenant_id: 'tenant-dental-1',
      name: 'Dra. Valeria Mendoza',
      role_title: 'Odontóloga Estética & Rehabilitación',
      bio: '10 años de experiencia en carillas de porcelana y blanqueamiento láser.',
      color_tag: '#0284c7',
      active: true,
      work_days: [1, 2, 3, 4, 5, 6],
      start_time: '09:00',
      end_time: '18:00'
    },
    {
      id: 'spec-d2',
      tenant_id: 'tenant-dental-1',
      name: 'Dr. Martín Rojas',
      role_title: 'Ortodoncista & Cirujano Maxilofacial',
      bio: 'Especialista certificado en alineadores invisibles e implantología.',
      color_tag: '#6366f1',
      active: true,
      work_days: [1, 2, 3, 4, 5],
      start_time: '10:00',
      end_time: '19:00'
    },
    {
      id: 'spec-f1',
      tenant_id: 'tenant-fisio-2',
      name: 'Lic. Diego Vargas',
      role_title: 'Fisioterapeuta Deportivo',
      bio: 'Rehabilitación de lesiones de rodilla, hombro y descarga muscular.',
      color_tag: '#0d9488',
      active: true,
      work_days: [1, 2, 3, 4, 5, 6],
      start_time: '08:30',
      end_time: '17:30'
    },
    {
      id: 'spec-f2',
      tenant_id: 'tenant-fisio-2',
      name: 'Lic. Camila Suárez',
      role_title: 'Kinesióloga & Rehabilitación Postural',
      bio: 'Terapia manual ortopédica, columna cervical/lumbar y electroterapia.',
      color_tag: '#10b981',
      active: true,
      work_days: [1, 2, 3, 4, 5],
      start_time: '09:00',
      end_time: '18:00'
    }
  ],
  services: [
    // Dental
    {
      id: 'srv-d1',
      tenant_id: 'tenant-dental-1',
      name: 'Limpieza Dental Ultrasónica + Fluorización',
      category: 'Prevención',
      description: 'Eliminación de sarro con ultrasonido, pulido con bicarbonato y profilaxis completa.',
      duration_min: 45,
      price: 35,
      deposit_amount: 10,
      active: true
    },
    {
      id: 'srv-d2',
      tenant_id: 'tenant-dental-1',
      name: 'Consulta + Diagnóstico Digital 3D',
      category: 'Diagnóstico',
      description: 'Evaluación integral con cámara intraoral y plan de tratamiento detallado.',
      duration_min: 30,
      price: 20,
      deposit_amount: 10,
      active: true
    },
    {
      id: 'srv-d3',
      tenant_id: 'tenant-dental-1',
      name: 'Blanqueamiento Dental LED Clínico',
      category: 'Estética Dental',
      description: 'Sesión de aclaramiento dental fotoactivado sin sensibilidad.',
      duration_min: 60,
      price: 120,
      deposit_amount: 35,
      active: true
    },
    {
      id: 'srv-d4',
      tenant_id: 'tenant-dental-1',
      name: 'Control de Ortodoncia / Alineadores',
      category: 'Ortodoncia',
      description: 'Ajuste mensual de brackets o entrega de nueva etapa de alineadores.',
      duration_min: 30,
      price: 40,
      deposit_amount: 15,
      active: true
    },
    {
      id: 'srv-d5',
      tenant_id: 'tenant-dental-1',
      name: 'Resina Fotocurada Estética (Por Pieza)',
      category: 'Operatoria',
      description: 'Restauración estética con resina nanohíbrida 3M.',
      duration_min: 45,
      price: 30,
      deposit_amount: 10,
      active: true
    },
    // Fisioterapia
    {
      id: 'srv-f1',
      tenant_id: 'tenant-fisio-2',
      name: 'Evaluación Fisioterapéutica + 1ra Sesión',
      category: 'Evaluación Inicial',
      description: 'Valoración biomecánica funcional, diagnóstico kinésico y primera descarga analgésica.',
      duration_min: 60,
      price: 40,
      deposit_amount: 15,
      active: true
    },
    {
      id: 'srv-f2',
      tenant_id: 'tenant-fisio-2',
      name: 'Sesión de Fisioterapia Deportiva & Descarga',
      category: 'Deportiva',
      description: 'Terapia manual profunda, punción seca, ventosas (cupping) y electroanalgesia.',
      duration_min: 45,
      price: 35,
      deposit_amount: 15,
      active: true
    },
    {
      id: 'srv-f3',
      tenant_id: 'tenant-fisio-2',
      name: 'Rehabilitación de Columna y Dolor Ciático',
      category: 'Columna',
      description: 'Tracción vertebral suave, termoterapia, ultrasonido y ejercicios de estabilización.',
      duration_min: 45,
      price: 35,
      deposit_amount: 15,
      active: true
    }
  ],
  patients: [
    {
      id: 'pat-1',
      tenant_id: 'tenant-dental-1',
      name: 'María Fernanda Gómez',
      phone: '+59170055112',
      email: 'mfernanda@email.com',
      dni: '6841290',
      birth_date: '1992-05-14',
      clinical_notes: 'Sensibilidad en molares inferiores. Sin alergias a anestésicos locales.',
      tags: ['Ortodoncia', 'Paciente Frecuente'],
      created_at: '2026-09-10T10:00:00Z'
    },
    {
      id: 'pat-2',
      tenant_id: 'tenant-dental-1',
      name: 'Jorge Luis Torrico',
      phone: '+59176543210',
      email: 'jtorrico@email.com',
      dni: '5190823',
      birth_date: '1986-11-22',
      clinical_notes: 'Interesado en blanqueamiento LED y carillas superiores.',
      tags: ['Estética Dental'],
      created_at: '2026-10-02T14:30:00Z'
    },
    {
      id: 'pat-3',
      tenant_id: 'tenant-dental-1',
      name: 'Andrea Paz Soldán',
      phone: '+59172188765',
      email: 'andrea.paz@email.com',
      dni: '7310944',
      birth_date: '1998-03-09',
      clinical_notes: 'Etapa 4 de alineadores invisibles. Excelente evolución.',
      tags: ['Alineadores VIP'],
      created_at: '2026-08-19T09:15:00Z'
    },
    {
      id: 'pat-4',
      tenant_id: 'tenant-fisio-2',
      name: 'Carlos Eduardo Mamani',
      phone: '+59171544332',
      email: 'cmamani@runner.bo',
      dni: '6019283',
      birth_date: '1990-07-18',
      clinical_notes: 'Corredor de maratón. Sobrecarga en gemelo derecho e isquiotibiales.',
      tags: ['Deportista', 'Punción Seca'],
      created_at: '2026-10-12T16:00:00Z'
    }
  ],
  appointments: [
    {
      id: 'appt-1',
      tenant_id: 'tenant-dental-1',
      service_id: 'srv-d1',
      specialist_id: 'spec-d1',
      patient_name: 'María Fernanda Gómez',
      patient_phone: '+59170055112',
      patient_email: 'mfernanda@email.com',
      patient_dni: '6841290',
      appointment_date: todayStr,
      start_time: '10:00',
      end_time: '10:45',
      status: 'confirmed',
      payment_status: 'deposit_paid',
      payment_method: 'qr_transfer',
      amount_paid: 10,
      payment_reference: 'QR-99281',
      notes: 'Sensibilidad en molares inferiores. Solicita profilaxis suave.',
      conclusion_notes: '',
      reminder_24h_sent: true,
      reminder_2h_sent: false,
      created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
    },
    {
      id: 'appt-2',
      tenant_id: 'tenant-dental-1',
      service_id: 'srv-d3',
      specialist_id: 'spec-d1',
      patient_name: 'Jorge Luis Torrico',
      patient_phone: '+59176543210',
      patient_email: 'jtorrico@email.com',
      patient_dni: '5190823',
      appointment_date: todayStr,
      start_time: '11:30',
      end_time: '12:30',
      status: 'pending_payment',
      payment_status: 'unpaid',
      payment_method: 'qr_transfer',
      amount_paid: 0,
      notes: 'Solicita confirmar por WhatsApp antes de llegar.',
      conclusion_notes: '',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
    },
    {
      id: 'appt-3',
      tenant_id: 'tenant-dental-1',
      service_id: 'srv-d4',
      specialist_id: 'spec-d2',
      patient_name: 'Andrea Paz Soldán',
      patient_phone: '+59172188765',
      patient_dni: '7310944',
      appointment_date: tomorrowStr,
      start_time: '15:00',
      end_time: '15:30',
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'online_card',
      amount_paid: 40,
      payment_reference: 'CHK-88412',
      notes: 'Control mensual alineadores etapa 4.',
      conclusion_notes: '',
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'appt-4',
      tenant_id: 'tenant-fisio-2',
      service_id: 'srv-f2',
      specialist_id: 'spec-f1',
      patient_name: 'Carlos Eduardo Mamani',
      patient_phone: '+59171544332',
      patient_dni: '6019283',
      appointment_date: todayStr,
      start_time: '15:30',
      end_time: '16:15',
      status: 'confirmed',
      payment_status: 'deposit_paid',
      payment_method: 'qr_transfer',
      amount_paid: 15,
      payment_reference: 'QR-33109',
      notes: 'Sobrecarga en gemelo derecho post maratón.',
      conclusion_notes: '',
      reminder_24h_sent: true,
      reminder_2h_sent: true,
      created_at: new Date().toISOString()
    }
  ],
  posNotes: [
    {
      id: 'pos-note-101',
      tenant_id: 'tenant-dental-1',
      appointment_id: 'appt-1',
      folio_number: 'PEPE-000101',
      note_type: 'nota_reserva',
      patient_name: 'María Fernanda Gómez',
      patient_phone: '+59170055112',
      patient_dni: '6841290',
      specialist_name: 'Dra. Valeria Mendoza',
      items: [
        {
          id: 'item-1',
          service_id: 'srv-d1',
          name: 'Limpieza Dental Ultrasónica + Fluorización (Seña de Reserva)',
          category: 'Prevención',
          qty: 1,
          unit_price: 35,
          subtotal: 35
        }
      ],
      subtotal: 35,
      deposit_deducted: 0,
      discount: 0,
      total_paid: 10,
      payment_method: 'qr_transfer',
      payment_reference: 'QR-99281',
      reservation_notes:
        'Reserva confirmada con seña de $10. Saldo restante de $25 a cancelar al concluir el tratamiento.',
      conclusion_notes: 'Pendiente de realización en consultorio.',
      created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
    },
    {
      id: 'pos-note-102',
      tenant_id: 'tenant-dental-1',
      folio_number: 'PEPE-000102',
      note_type: 'nota_conclusion',
      patient_name: 'Roberto Carlos Gutiérrez',
      patient_phone: '+59170911223',
      patient_dni: '4918271',
      specialist_name: 'Dr. Martín Rojas',
      items: [
        {
          id: 'item-2',
          service_id: 'srv-d1',
          name: 'Limpieza Dental Ultrasónica + Fluorización',
          category: 'Prevención',
          qty: 1,
          unit_price: 35,
          subtotal: 35
        },
        {
          id: 'item-3',
          service_id: 'srv-d5',
          name: 'Resina Fotocurada Estética (Pieza 36 y 37)',
          category: 'Operatoria',
          qty: 2,
          unit_price: 30,
          subtotal: 60
        }
      ],
      subtotal: 95,
      deposit_deducted: 10,
      discount: 5,
      total_paid: 80,
      payment_method: 'qr_transfer',
      payment_reference: 'QR-CONCL-7741',
      reservation_notes: 'Paciente ingresó con seña previa de $10 por cita de limpieza.',
      conclusion_notes:
        'Se realizó detartraje ultrasónico completo + restauración con resina 3M en molares 36 y 37 sin complicaciones. Recomendación: evitar alimentos con colorantes por 24h. Próximo control en 6 meses.',
      created_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString()
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      tenant_id: 'tenant-dental-1',
      category: 'insumos_clinicos',
      description: 'Compra de Jeringas de Resina 3M Filtek + Guantes de Nitrilo',
      amount: 25,
      payment_method: 'qr_transfer',
      expense_date: todayStr,
      created_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString()
    },
    {
      id: 'exp-2',
      tenant_id: 'tenant-dental-1',
      category: 'comision_especialista',
      description: 'Adelanto comisión tratamientos de ortodoncia',
      amount: 15,
      payment_method: 'qr_transfer',
      specialist_name: 'Dr. Martín Rojas',
      expense_date: todayStr,
      created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
    },
    {
      id: 'exp-3',
      tenant_id: 'tenant-fisio-2',
      category: 'insumos_clinicos',
      description: 'Agujas de punción seca + Gel conductor de ultrasonido',
      amount: 18,
      payment_method: 'cash',
      expense_date: todayStr,
      created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
    }
  ],
  supplies: [
    {
      id: 'sup-d1',
      tenant_id: 'tenant-dental-1',
      name: 'Resina Fotocurada 3M Filtek Z350 (Tono A2)',
      sku: 'OD-3M-A2',
      category: 'Operatoria Dental',
      current_stock: 12,
      min_stock: 5,
      unit: 'Jeringas',
      unit_cost: 28,
      supplier: 'Importadora Dental Boliviana',
      updated_at: todayStr
    },
    {
      id: 'sup-d2',
      tenant_id: 'tenant-dental-1',
      name: 'Anestésico Lidocaína 2% con Epinefrina',
      sku: 'OD-LIDO-50',
      category: 'Anestesia',
      current_stock: 3,
      min_stock: 5,
      unit: 'Cajas x50',
      unit_cost: 22,
      supplier: 'Septodont Distribuidor',
      updated_at: todayStr
    },
    {
      id: 'sup-d3',
      tenant_id: 'tenant-dental-1',
      name: 'Guantes de Nitrilo Quirúrgicos (Talla M)',
      sku: 'BIO-NIT-M',
      category: 'Bioseguridad',
      current_stock: 18,
      min_stock: 8,
      unit: 'Cajas x100',
      unit_cost: 9,
      supplier: 'MedSupply SRL',
      updated_at: todayStr
    },
    {
      id: 'sup-d4',
      tenant_id: 'tenant-dental-1',
      name: 'Kit Blanqueamiento Peróxido de Hidrógeno 35%',
      sku: 'EST-BLANQ-35',
      category: 'Estética Dental',
      current_stock: 2,
      min_stock: 4,
      unit: 'Kits Clínicos',
      unit_cost: 45,
      supplier: 'FGM Dental Group',
      updated_at: todayStr
    },
    {
      id: 'sup-f1',
      tenant_id: 'tenant-fisio-2',
      name: 'Agujas de Punción Seca 0.30x40mm con Guía',
      sku: 'FIS-AGUJ-40',
      category: 'Fisioterapia Invasiva',
      current_stock: 4,
      min_stock: 6,
      unit: 'Cajas x100',
      unit_cost: 15,
      supplier: 'PhysioTech Import',
      updated_at: todayStr
    },
    {
      id: 'sup-f2',
      tenant_id: 'tenant-fisio-2',
      name: 'Gel Conductor para Ultrasonido Terapéutico (5L)',
      sku: 'FIS-GEL-5L',
      category: 'Electroterapia',
      current_stock: 9,
      min_stock: 3,
      unit: 'Bidones 5L',
      unit_cost: 12,
      supplier: 'MedSupply SRL',
      updated_at: todayStr
    }
  ],
  members: [
    {
      id: 'mem-1',
      tenant_id: 'tenant-dental-1',
      name: 'Dra. Valeria Mendoza (Directora)',
      email: 'valeria@sonrisadental.com',
      role: 'owner',
      active: true,
      last_login: 'Hace 5 min'
    },
    {
      id: 'mem-2',
      tenant_id: 'tenant-dental-1',
      name: 'Dr. Martín Rojas',
      email: 'mrojas@sonrisadental.com',
      role: 'specialist',
      active: true,
      last_login: 'Hace 2 horas'
    },
    {
      id: 'mem-3',
      tenant_id: 'tenant-dental-1',
      name: 'Carla Flores (Recepción & Caja POS)',
      email: 'recepcion@sonrisadental.com',
      role: 'receptionist',
      active: true,
      last_login: 'Hoy 08:30'
    },
    {
      id: 'mem-4',
      tenant_id: 'tenant-dental-1',
      name: 'Lucía Mamani (Asistente Dental)',
      email: 'asistente@sonrisadental.com',
      role: 'assistant',
      active: true,
      last_login: 'Ayer 18:10'
    },
    {
      id: 'mem-5',
      tenant_id: 'tenant-fisio-2',
      name: 'Lic. Diego Vargas (Director)',
      email: 'dvargas@fisioactiva.com',
      role: 'owner',
      active: true,
      last_login: 'Hace 10 min'
    }
  ],
  rolePermissions: [
    {
      role: 'owner',
      label: 'Dueño / Director Clínico',
      description:
        'Control total del consultorio, finanzas, sucursales, personal y configuración de roles.',
      allowed_modules: [
        'dashboard',
        'saas',
        'pos',
        'finanzas',
        'calendario',
        'reservas',
        'turnero',
        'clientes',
        'odontograma',
        'evaluacion',
        'recetario',
        'planes',
        'imagenes',
        'laboratorio',
        'campanas',
        'personal',
        'servicios',
        'insumos',
        'roles',
        'railway'
      ],
      can_collect_pos: true,
      can_view_finances: true,
      can_manage_supplies: true,
      can_manage_roles: true
    },
    {
      role: 'admin',
      label: 'Administrador General',
      description:
        'Gestión operativa completa de caja POS, finanzas, inventario e historial clínico.',
      allowed_modules: [
        'dashboard',
        'pos',
        'finanzas',
        'calendario',
        'reservas',
        'turnero',
        'clientes',
        'planes',
        'laboratorio',
        'campanas',
        'personal',
        'servicios',
        'insumos',
        'railway'
      ],
      can_collect_pos: true,
      can_view_finances: true,
      can_manage_supplies: true,
      can_manage_roles: false
    },
    {
      role: 'specialist',
      label: 'Especialista / Doctor(a)',
      description:
        'Acceso a su calendario, reservas, evolución clínica de pacientes y conclusión de servicio.',
      allowed_modules: [
        'dashboard',
        'calendario',
        'reservas',
        'turnero',
        'clientes',
        'odontograma',
        'evaluacion',
        'recetario',
        'planes',
        'imagenes',
        'laboratorio',
        'insumos'
      ],
      can_collect_pos: false,
      can_view_finances: false,
      can_manage_supplies: false,
      can_manage_roles: false
    },
    {
      role: 'receptionist',
      label: 'Recepcionista / Cajero POS',
      description:
        'Atención de agenda, confirmación de señas QR, emisión de Notas POS y registro de clientes.',
      allowed_modules: [
        'dashboard',
        'pos',
        'calendario',
        'reservas',
        'turnero',
        'clientes',
        'planes',
        'campanas'
      ],
      can_collect_pos: true,
      can_view_finances: false,
      can_manage_supplies: false,
      can_manage_roles: false
    },
    {
      role: 'assistant',
      label: 'Asistente Clínico / Enfermería',
      description:
        'Control de insumos de consultorio, preparación de box y apoyo en agenda diaria.',
      allowed_modules: [
        'calendario',
        'turnero',
        'clientes',
        'imagenes',
        'laboratorio',
        'insumos'
      ],
      can_collect_pos: false,
      can_view_finances: false,
      can_manage_supplies: true,
      can_manage_roles: false
    }
  ],
  odontograms: [
    {
      id: 'odo-init-1',
      tenant_id: 'tenant-dental-1',
      patient_id: 'pat-1',
      patient_name: 'María Fernanda Gómez',
      specialist_name: 'Dra. Valeria Mendoza',
      general_diagnosis:
        'Caries oclusal en pieza 36 y restauración estética requerida en pieza 11. Plan de profilaxis general.',
      updated_at: todayStr,
      teeth: {
        11: {
          toothNumber: 11,
          condition: 'resina',
          procedureName: 'Resina Fotocurada Estética (Pieza 11)',
          estimatedCost: 30,
          notes: 'Borde incisal desgastado'
        },
        36: {
          toothNumber: 36,
          condition: 'caries',
          procedureName: 'Resina Fotocurada Estética (Pieza 36)',
          estimatedCost: 30,
          notes: 'Caries dentinaria superficial'
        },
        46: {
          toothNumber: 46,
          condition: 'endodoncia',
          procedureName: 'Endodoncia Molar (Pieza 46)',
          estimatedCost: 90,
          notes: 'Requiere conducto + futura corona'
        }
      }
    }
  ],
  evaluations: [
    {
      id: 'eval-init-1',
      tenant_id: 'tenant-dental-1',
      patient_id: 'pat-1',
      patient_name: 'María Fernanda Gómez',
      specialist_name: 'Dra. Valeria Mendoza',
      vital_signs: {
        bloodPressure: '118/76',
        heartRate: 70,
        temperature: 36.5,
        spo2: 98,
        weightKg: 62,
        heightCm: 165
      },
      body_zones: {
        atm_mandibular: {
          zoneId: 'atm_mandibular',
          zoneLabel: 'Articulación Temporomandibular (ATM)',
          evaPain: 4,
          mobilityRom: 'limitacion_leve',
          therapyAssigned: 'Férula de Descarga Miorrelajante + Fisioterapia ATM',
          sessionCost: 45
        }
      },
      functional_diagnosis:
        'Bruxismo nocturno leve con tensión maseterina. Signos vitales óptimos para procedimiento.',
      created_at: todayStr
    },
    {
      id: 'eval-init-2',
      tenant_id: 'tenant-fisio-2',
      patient_id: 'pat-4',
      patient_name: 'Carlos Eduardo Mamani',
      specialist_name: 'Lic. Diego Vargas',
      vital_signs: {
        bloodPressure: '122/78',
        heartRate: 64,
        temperature: 36.6,
        spo2: 99,
        weightKg: 74,
        heightCm: 175
      },
      body_zones: {
        lumbar_ciatico: {
          zoneId: 'lumbar_ciatico',
          zoneLabel: 'Columna Lumbar (L4-L5) y Ciático',
          evaPain: 7,
          mobilityRom: 'limitacion_severa',
          therapyAssigned: 'Tracción Lumbar + Electroanalgesia TENS + Punción Seca',
          sessionCost: 35
        },
        gemelo_tobillo: {
          zoneId: 'gemelo_tobillo',
          zoneLabel: 'Gemelo Derecho / Tendón de Aquiles',
          evaPain: 6,
          mobilityRom: 'limitacion_leve',
          therapyAssigned: 'Descarga Deportiva + Cupping + Ultrasonido',
          sessionCost: 35
        }
      },
      functional_diagnosis:
        'Contractura miofascial paravertebral lumbar y sobrecarga de tríceps sural derecho post-maratón.',
      created_at: todayStr
    }
  ],
  prescriptions: [
    {
      id: 'rx-101',
      tenant_id: 'tenant-dental-1',
      folio: 'RX-PEPE-0101',
      doc_type: 'receta',
      patient_name: 'María Fernanda Gómez',
      patient_phone: '+59170055112',
      patient_dni: '6841290',
      specialist_name: 'Dra. Valeria Mendoza',
      specialist_role: 'Odontóloga Estética & Rehabilitación',
      diagnosis: 'Pulpitis reversible en pieza 36 y profilaxis ultrasónica.',
      items: [
        {
          id: 'rx-i1',
          title: 'Ibuprofeno 600 mg (Comprimidos)',
          dosageOrSpec: 'Tomar 1 comprimido cada 8 horas después de alimentos por 3 días.'
        },
        {
          id: 'rx-i2',
          title: 'Enjuague Bucal Clorhexidina 0.12%',
          dosageOrSpec: 'Realizar colutorios de 15 ml cada 12 horas durante 5 días.'
        }
      ],
      indications:
        'Evitar bebidas muy frías o calientes y alimentos con colorantes fuertes durante las próximas 24 horas.',
      created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
    },
    {
      id: 'rx-102',
      tenant_id: 'tenant-dental-1',
      folio: 'ORD-PEPE-0102',
      doc_type: 'orden_estudio',
      patient_name: 'Jorge Luis Torrico',
      patient_phone: '+59176543210',
      patient_dni: '5190823',
      specialist_name: 'Dr. Martín Rojas',
      specialist_role: 'Ortodoncista & Cirujano Maxilofacial',
      diagnosis: 'Evaluación pre-quirúrgica de terceros molares y ortodoncia.',
      items: [
        {
          id: 'rx-i3',
          title: 'Radiografía Panorámica Digital (Ortopantomografía)',
          dosageOrSpec: 'Proyección maxilomandibular completa con informe digital.'
        },
        {
          id: 'rx-i4',
          title: 'Tomografía Cone Beam 3D Sector Mandibular Posterior',
          dosageOrSpec: 'Relación de raíces de piezas 38 y 48 con conducto dentario inferior.'
        }
      ],
      indications: 'Traer resultados digitales o enviarlos al WhatsApp de la clínica antes de la cirugía.',
      created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
    }
  ],
  treatmentPlans: [
    {
      id: 'plan-1',
      tenant_id: 'tenant-dental-1',
      patient_id: 'pat-2',
      patient_name: 'Jorge Luis Torrico',
      patient_phone: '+59176543210',
      specialist_name: 'Dr. Martín Rojas',
      plan_title: 'Plan Ortodoncia Autoligado + 12 Controles Mensuales',
      category: 'ortodoncia',
      total_sessions: 12,
      completed_sessions: 4,
      total_budget: 540,
      amount_paid: 180,
      installment_price: 45,
      next_session_date: tomorrowStr,
      status: 'activo',
      clinical_evolution: 'Alineación arcada superior fase II (arco NiTi 0.016). Buena higiene.',
      created_at: todayStr
    },
    {
      id: 'plan-2',
      tenant_id: 'tenant-dental-1',
      patient_id: 'pat-1',
      patient_name: 'María Fernanda Gómez',
      patient_phone: '+59170055112',
      specialist_name: 'Dra. Valeria Mendoza',
      plan_title: 'Rehabilitación Endodoncia + Corona Zirconio Pieza 46',
      category: 'implantes_protesis',
      total_sessions: 4,
      completed_sessions: 2,
      total_budget: 310,
      amount_paid: 150,
      installment_price: 80,
      next_session_date: todayStr,
      status: 'activo',
      clinical_evolution: 'Obturación radicular concluida. Pendiente toma de impresión digital CAD/CAM.',
      created_at: todayStr
    },
    {
      id: 'plan-3',
      tenant_id: 'tenant-fisio-2',
      patient_id: 'pat-4',
      patient_name: 'Carlos Eduardo Mamani',
      patient_phone: '+59172011223',
      specialist_name: 'Lic. Diego Vargas',
      plan_title: 'Pack 10 Sesiones Rehabilitación Deportiva & Lumbociatalgia',
      category: 'rehabilitacion_fisio',
      total_sessions: 10,
      completed_sessions: 5,
      total_budget: 300,
      amount_paid: 150,
      installment_price: 30,
      next_session_date: todayStr,
      status: 'activo',
      clinical_evolution: 'Reducción de dolor EVA de 8/10 a 3/10. Inicia fortalecimiento excéntrico.',
      created_at: todayStr
    }
  ],
  imagingStudies: [
    {
      id: 'img-1',
      tenant_id: 'tenant-dental-1',
      patient_name: 'María Fernanda Gómez',
      patient_phone: '+59170055112',
      specialist_name: 'Dra. Valeria Mendoza',
      study_type: 'antes_despues',
      title: 'Diseño de Sonrisa Digital & Blanqueamiento LED (Arcada Superior)',
      zone_or_tooth: 'Piezas 13 a 23 (Sector Anterior)',
      findings_notes:
        'Cambio de tono VITA A3.5 a VITA B1 + reconstrucción de bordes incisales en piezas 11 y 21.',
      before_label: 'Inicial: Tono A3.5 + desgaste incisal en 11 y 21',
      after_label: 'Final: Tono B1 + armonización estética con resina nano-híbrida',
      created_at: todayStr
    },
    {
      id: 'img-2',
      tenant_id: 'tenant-dental-1',
      patient_name: 'Jorge Luis Torrico',
      patient_phone: '+59176543210',
      specialist_name: 'Dr. Martín Rojas',
      study_type: 'rx_panoramica',
      title: 'Ortopantomografía Digital Panorámica Pre-Ortodoncia',
      zone_or_tooth: 'Maxilar Superior y Mandíbula Completa',
      findings_notes:
        'Terceros molares inferiores (38 y 48) mesioangulados. Cresta alveolar conservada.',
      before_label: 'Vista Panorámica Original',
      after_label: 'Trazado Cefalométrico y Ejes Radiculares',
      created_at: todayStr
    },
    {
      id: 'img-3',
      tenant_id: 'tenant-fisio-2',
      patient_name: 'Carlos Eduardo Mamani',
      patient_phone: '+59172011223',
      specialist_name: 'Lic. Diego Vargas',
      study_type: 'ecografia_muscular',
      title: 'Ecografía Musculoesquelética Tendón de Aquiles & Gemelo',
      zone_or_tooth: 'Tríceps Sural Derecho',
      findings_notes:
        'Disminución de edema interfibrilar tras 5 sesiones de electroterapia y punción seca.',
      before_label: 'Sesión 1: Hipoecogenicidad y edema peritendinoso',
      after_label: 'Sesión 5: Patrón fibrilar continuo y desinflamado',
      created_at: todayStr
    }
  ],
  labOrders: [
    {
      id: 'lab-1',
      tenant_id: 'tenant-dental-1',
      order_code: 'LAB-0201',
      patient_name: 'María Fernanda Gómez',
      patient_phone: '+59170055112',
      specialist_name: 'Dra. Valeria Mendoza',
      laboratory_name: 'BioDental CAD/CAM Studio',
      work_type: 'Corona de Zirconio Monolítico Multicapa',
      tooth_or_zone: 'Pieza 46 (Primer Molar Inferior Derecho)',
      shade_color: 'VITA A2',
      lab_cost: 65,
      patient_price: 220,
      due_date: tomorrowStr,
      status: 'prueba_clinica',
      notes: 'Oclusión ajustada en escaneo intraoral STL. Enviar con perno fibra.',
      created_at: todayStr
    },
    {
      id: 'lab-2',
      tenant_id: 'tenant-dental-1',
      order_code: 'LAB-0202',
      patient_name: 'Ana Lucía Peñaranda',
      patient_phone: '+59171299881',
      specialist_name: 'Dr. Martín Rojas',
      laboratory_name: 'OrthoAlign Digital Lab',
      work_type: 'Férula Miorrelajante Michigan (Bruxismo)',
      tooth_or_zone: 'Arcada Superior Completa',
      shade_color: 'Acrílico Termocurado Cristal',
      lab_cost: 35,
      patient_price: 110,
      due_date: todayStr,
      status: 'listo_instalar',
      notes: 'Guía canina bilateral verificada en articulador semi-ajustable.',
      created_at: todayStr
    },
    {
      id: 'lab-3',
      tenant_id: 'tenant-fisio-2',
      order_code: 'LAB-0301',
      patient_name: 'Carlos Eduardo Mamani',
      patient_phone: '+59172011223',
      specialist_name: 'Lic. Diego Vargas',
      laboratory_name: 'OrtoBiomecánica 3D FootLab',
      work_type: 'Plantillas Ortopédicas Termoconformadas Running',
      tooth_or_zone: 'Bilateral Talla 42 (Descarga Metatarsal y Talón)',
      shade_color: 'EVA Densidad Media Azul/Negro',
      lab_cost: 40,
      patient_price: 115,
      due_date: tomorrowStr,
      status: 'diseno_cad_cam',
      notes: 'Según baropodometría computerizada de pisada pronadora.',
      created_at: todayStr
    }
  ],
  waitingTickets: [
    {
      id: 'wt-1',
      tenant_id: 'tenant-dental-1',
      ticket_code: 'ODO-01',
      patient_name: 'María Fernanda Gómez',
      specialist_name: 'Dra. Valeria Mendoza',
      box_room: 'Consultorio Dental 1',
      service_name: 'Limpieza Dental Ultrasónica + Pulido Pro',
      arrival_time: '09:50',
      status: 'llamando_pantalla',
      priority: 'normal'
    },
    {
      id: 'wt-2',
      tenant_id: 'tenant-dental-1',
      ticket_code: 'ODO-02',
      patient_name: 'Jorge Luis Torrico',
      specialist_name: 'Dr. Martín Rojas',
      box_room: 'Consultorio Maxilofacial 2',
      service_name: 'Consulta + Control de Ortodoncia',
      arrival_time: '11:15',
      status: 'en_espera',
      priority: 'normal'
    },
    {
      id: 'wt-3',
      tenant_id: 'tenant-dental-1',
      ticket_code: 'ODO-03',
      patient_name: 'Ana Lucía Peñaranda',
      specialist_name: 'Dra. Valeria Mendoza',
      box_room: 'Consultorio Dental 1',
      service_name: 'Urgencia Dolor Molar / Endodoncia',
      arrival_time: '11:25',
      status: 'en_espera',
      priority: 'preferencial_urgencia'
    },
    {
      id: 'wt-4',
      tenant_id: 'tenant-fisio-2',
      ticket_code: 'FIS-01',
      patient_name: 'Carlos Eduardo Mamani',
      specialist_name: 'Lic. Diego Vargas',
      box_room: 'Box Fisioterapia 1',
      service_name: 'Sesión Fisioterapia Deportiva & Punción Seca',
      arrival_time: '09:55',
      status: 'llamando_pantalla',
      priority: 'normal'
    }
  ],
  recallCampaigns: [
    {
      id: 'rec-1',
      tenant_id: 'tenant-dental-1',
      patient_name: 'Ana Lucía Peñaranda',
      patient_phone: '+59171299881',
      campaign_type: 'limpieza_semestral',
      reason_label: '6 meses desde su última Profilaxis / Limpieza Ultrasónica',
      last_visit_date: '2026-05-04',
      recommended_service: 'Limpieza Dental Ultrasónica + Fluorización',
      promo_discount_pct: 20,
      message_template:
        'Hola Ana Lucía 👋, en Sonrisa Perfecta Dental cuidamos tu salud bucal. Ya pasaron 6 meses desde tu última limpieza dental y tienes un 20% OFF reservando esta semana.',
      status: 'pendiente'
    },
    {
      id: 'rec-2',
      tenant_id: 'tenant-dental-1',
      patient_name: 'Jorge Luis Torrico',
      patient_phone: '+59176543210',
      campaign_type: 'plan_incompleto',
      reason_label: 'Control mensual de Ortodoncia pendiente (Sesión 5 de 12)',
      last_visit_date: '2026-10-05',
      recommended_service: 'Control de Ortodoncia Autoligado',
      promo_discount_pct: 0,
      message_template:
        'Hola Jorge Luis 🦷, te recordamos agendar tu 5to control mensual de Ortodoncia con el Dr. Martín Rojas para mantener el avance óptimo de tu tratamiento.',
      status: 'pendiente'
    },
    {
      id: 'rec-3',
      tenant_id: 'tenant-dental-1',
      patient_name: 'María Fernanda Gómez',
      patient_phone: '+59170055112',
      campaign_type: 'control_post_op',
      reason_label: 'Seguimiento 48h post-restauración y profilaxis',
      last_visit_date: todayStr,
      recommended_service: 'Control Post-Procedimiento Sin Costo',
      promo_discount_pct: 100,
      message_template:
        'Hola María Fernanda 💙, te escribimos de Sonrisa Perfecta Dental para saber cómo te sientes tras tu atención con la Dra. Valeria Mendoza. Cualquier consulta estamos atentos.',
      status: 'enviado_wa'
    },
    {
      id: 'rec-4',
      tenant_id: 'tenant-fisio-2',
      patient_name: 'Carlos Eduardo Mamani',
      patient_phone: '+59172011223',
      campaign_type: 'plan_incompleto',
      reason_label: 'Continuidad Pack 10 Sesiones Lumbociatalgia (Va en 5/10)',
      last_visit_date: todayStr,
      recommended_service: 'Sesión 6 Rehabilitación Deportiva',
      promo_discount_pct: 10,
      message_template:
        'Hola Carlos 💪, vas a mitad de tu Pack de 10 sesiones en FisioActiva. ¡No pierdas el ritmo de tu recuperación lumbar!',
      status: 'pendiente'
    }
  ]
};

function loadStore(): MultiTenantStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
      return initialStore;
    }
    const parsed = JSON.parse(raw) as MultiTenantStore;
    if (!parsed.patients) parsed.patients = initialStore.patients;
    if (!parsed.posNotes) parsed.posNotes = initialStore.posNotes;
    if (!parsed.expenses) parsed.expenses = initialStore.expenses;
    if (!parsed.supplies) parsed.supplies = initialStore.supplies;
    if (!parsed.members) parsed.members = initialStore.members;
    if (!parsed.rolePermissions)
      parsed.rolePermissions = initialStore.rolePermissions;
    if (!parsed.odontograms) parsed.odontograms = initialStore.odontograms;
    if (!parsed.evaluations) parsed.evaluations = initialStore.evaluations;
    if (!parsed.prescriptions)
      parsed.prescriptions = initialStore.prescriptions;
    if (!parsed.treatmentPlans)
      parsed.treatmentPlans = initialStore.treatmentPlans;
    if (!parsed.imagingStudies)
      parsed.imagingStudies = initialStore.imagingStudies;
    if (!parsed.labOrders) parsed.labOrders = initialStore.labOrders;
    if (!parsed.waitingTickets)
      parsed.waitingTickets = initialStore.waitingTickets;
    if (!parsed.recallCampaigns)
      parsed.recallCampaigns = initialStore.recallCampaigns;
    return parsed;
  } catch {
    return initialStore;
  }
}

function saveStore(store: MultiTenantStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export const db = {
  getTenants(): TenantClinic[] {
    return loadStore().tenants;
  },

  getTenantBySlug(slug: string): TenantClinic | undefined {
    return loadStore().tenants.find((t) => t.slug === slug);
  },

  getTenantById(id: string): TenantClinic | undefined {
    return loadStore().tenants.find((t) => t.id === id);
  },

  createTenant(
    data: Omit<TenantClinic, 'id' | 'subscription_status'>
  ): TenantClinic {
    const store = loadStore();
    const preset = SPECIALTY_CATALOG[data.specialty] || SPECIALTY_CATALOG.dental;

    const newTenant: TenantClinic = {
      ...data,
      description: data.description || preset.description,
      theme_color: data.theme_color || preset.defaultColor,
      id: `tenant-${Date.now()}`,
      subscription_status: 'active'
    };
    store.tenants.push(newTenant);

    const defaultSpecialist: Specialist = {
      id: `spec-${Date.now()}-1`,
      tenant_id: newTenant.id,
      name: `Dr(a) / Lic. Titular (${preset.shortName})`,
      role_title: preset.specialistDefaultRole,
      bio: `Especialista principal en ${preset.label}.`,
      color_tag: newTenant.theme_color,
      active: true,
      work_days: [1, 2, 3, 4, 5, 6],
      start_time: '09:00',
      end_time: '18:00'
    };
    store.specialists.push(defaultSpecialist);

    preset.defaultServices.forEach((srv, idx) => {
      store.services.push({
        id: `srv-${Date.now()}-${idx}`,
        tenant_id: newTenant.id,
        name: srv.name,
        category: srv.category,
        description: srv.description,
        duration_min: srv.duration_min,
        price: srv.price,
        deposit_amount: srv.deposit_amount,
        active: true
      });
    });

    preset.defaultSupplies.forEach((sup, idx) => {
      store.supplies.push({
        id: `sup-${Date.now()}-${idx}`,
        tenant_id: newTenant.id,
        name: sup.name,
        sku: sup.sku,
        category: sup.category,
        current_stock: 10,
        min_stock: sup.min_stock,
        unit: sup.unit,
        unit_cost: sup.unit_cost,
        supplier: 'Proveedor Inicial PEPEMEDIC',
        updated_at: new Date().toISOString().split('T')[0]
      });
    });

    store.members.push({
      id: `mem-${Date.now()}-owner`,
      tenant_id: newTenant.id,
      name: `Director(a) — ${newTenant.name}`,
      email: `admin@${newTenant.slug}.com`,
      role: 'owner',
      active: true,
      last_login: 'Recién creado'
    });

    saveStore(store);
    return newTenant;
  },

  changeTenantSpecialty(
    tenantId: string,
    specialty: SpecialtyType,
    loadPresetCatalog = true
  ): TenantClinic | null {
    const store = loadStore();
    const idx = store.tenants.findIndex((t) => t.id === tenantId);
    if (idx === -1) return null;
    const preset = SPECIALTY_CATALOG[specialty];

    store.tenants[idx] = {
      ...store.tenants[idx],
      specialty,
      description: preset.description,
      theme_color: preset.defaultColor
    };

    if (loadPresetCatalog) {
      preset.defaultServices.forEach((srv, i) => {
        const alreadyExists = store.services.some(
          (s) => s.tenant_id === tenantId && s.name === srv.name
        );
        if (!alreadyExists) {
          store.services.push({
            id: `srv-${Date.now()}-${i}`,
            tenant_id: tenantId,
            name: srv.name,
            category: srv.category,
            description: srv.description,
            duration_min: srv.duration_min,
            price: srv.price,
            deposit_amount: srv.deposit_amount,
            active: true
          });
        }
      });

      preset.defaultSupplies.forEach((sup, i) => {
        const alreadyExists = store.supplies.some(
          (s) => s.tenant_id === tenantId && s.name === sup.name
        );
        if (!alreadyExists) {
          store.supplies.push({
            id: `sup-${Date.now()}-${i}`,
            tenant_id: tenantId,
            name: sup.name,
            sku: sup.sku,
            category: sup.category,
            current_stock: 8,
            min_stock: sup.min_stock,
            unit: sup.unit,
            unit_cost: sup.unit_cost,
            supplier: 'Plantilla Especialidad PEPEMEDIC',
            updated_at: new Date().toISOString().split('T')[0]
          });
        }
      });
    }

    saveStore(store);
    return store.tenants[idx];
  },

  updateTenant(id: string, patch: Partial<TenantClinic>): TenantClinic | null {
    const store = loadStore();
    const idx = store.tenants.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    store.tenants[idx] = { ...store.tenants[idx], ...patch };
    saveStore(store);
    return store.tenants[idx];
  },

  getSpecialists(tenantId: string): Specialist[] {
    return loadStore().specialists.filter((s) => s.tenant_id === tenantId);
  },

  createSpecialist(spec: Omit<Specialist, 'id'>): Specialist {
    const store = loadStore();
    const created: Specialist = { ...spec, id: `spec-${Date.now()}` };
    store.specialists.push(created);
    saveStore(store);
    return created;
  },

  toggleSpecialist(id: string): void {
    const store = loadStore();
    const target = store.specialists.find((s) => s.id === id);
    if (target) {
      target.active = !target.active;
      saveStore(store);
    }
  },

  getServices(tenantId: string): ClinicService[] {
    return loadStore().services.filter((s) => s.tenant_id === tenantId);
  },

  createService(srv: Omit<ClinicService, 'id'>): ClinicService {
    const store = loadStore();
    const created: ClinicService = { ...srv, id: `srv-${Date.now()}` };
    store.services.push(created);
    saveStore(store);
    return created;
  },

  toggleService(id: string): void {
    const store = loadStore();
    const target = store.services.find((s) => s.id === id);
    if (target) {
      target.active = !target.active;
      saveStore(store);
    }
  },

  getPatients(tenantId: string): PatientClient[] {
    return loadStore().patients.filter((p) => p.tenant_id === tenantId);
  },

  createPatient(
    pat: Omit<PatientClient, 'id' | 'created_at'>
  ): PatientClient {
    const store = loadStore();
    const created: PatientClient = {
      ...pat,
      id: `pat-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    store.patients.unshift(created);
    saveStore(store);
    return created;
  },

  updatePatient(
    id: string,
    patch: Partial<PatientClient>
  ): PatientClient | null {
    const store = loadStore();
    const idx = store.patients.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    store.patients[idx] = { ...store.patients[idx], ...patch };
    saveStore(store);
    return store.patients[idx];
  },

  getAppointments(tenantId: string): Appointment[] {
    return loadStore()
      .appointments.filter((a) => a.tenant_id === tenantId)
      .sort((a, b) =>
        `${a.appointment_date} ${a.start_time}`.localeCompare(
          `${b.appointment_date} ${b.start_time}`
        )
      );
  },

  createAppointment(
    appt: Omit<Appointment, 'id' | 'created_at' | 'reminder_24h_sent' | 'reminder_2h_sent'>
  ): Appointment {
    const store = loadStore();
    const created: Appointment = {
      ...appt,
      id: `appt-${Date.now()}`,
      reminder_24h_sent: false,
      reminder_2h_sent: false,
      created_at: new Date().toISOString()
    };
    store.appointments.push(created);

    // Sincronizar automáticamente en el directorio de clientes/pacientes si no existe
    const exists = store.patients.some(
      (p) =>
        p.tenant_id === appt.tenant_id &&
        (p.phone === appt.patient_phone ||
          p.name.toLowerCase() === appt.patient_name.toLowerCase())
    );
    if (!exists) {
      store.patients.unshift({
        id: `pat-${Date.now()}-auto`,
        tenant_id: appt.tenant_id,
        name: appt.patient_name,
        phone: appt.patient_phone,
        email: appt.patient_email,
        dni: appt.patient_dni,
        clinical_notes: appt.notes || 'Paciente registrado desde portal online.',
        tags: ['Reserva Online'],
        created_at: new Date().toISOString()
      });
    }

    saveStore(store);
    return created;
  },

  updateAppointment(
    id: string,
    patch: Partial<Appointment>
  ): Appointment | null {
    const store = loadStore();
    const idx = store.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    store.appointments[idx] = { ...store.appointments[idx], ...patch };
    saveStore(store);
    return store.appointments[idx];
  },

  getPosNotes(tenantId: string): PosServiceNote[] {
    return loadStore()
      .posNotes.filter((n) => n.tenant_id === tenantId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createPosNote(
    note: Omit<PosServiceNote, 'id' | 'folio_number' | 'created_at'>
  ): PosServiceNote {
    const store = loadStore();
    const nextNum = 100 + store.posNotes.length + 1;
    const created: PosServiceNote = {
      ...note,
      id: `pos-note-${Date.now()}`,
      folio_number: `PEPE-000${nextNum}`,
      created_at: new Date().toISOString()
    };
    store.posNotes.unshift(created);

    // Si está vinculada a una cita (appointment_id), actualizar su estado y pago automáticamente
    if (note.appointment_id) {
      const apptIdx = store.appointments.findIndex(
        (a) => a.id === note.appointment_id
      );
      if (apptIdx !== -1) {
        const existingAppt = store.appointments[apptIdx];
        if (note.note_type === 'nota_conclusion') {
          store.appointments[apptIdx] = {
            ...existingAppt,
            status: 'completed',
            payment_status: 'paid',
            amount_paid: note.deposit_deducted + note.total_paid,
            notes: note.reservation_notes || existingAppt.notes,
            conclusion_notes: note.conclusion_notes
          };
        } else {
          store.appointments[apptIdx] = {
            ...existingAppt,
            status: 'confirmed',
            payment_status: 'deposit_paid',
            amount_paid: note.total_paid,
            notes: note.reservation_notes || existingAppt.notes
          };
        }
      }
    }

    // Actualizar también la evolución clínica del paciente si es una Nota de Conclusión
    if (note.note_type === 'nota_conclusion' && note.conclusion_notes.trim()) {
      const patIdx = store.patients.findIndex(
        (p) =>
          p.tenant_id === note.tenant_id &&
          (p.phone === note.patient_phone ||
            p.name.toLowerCase() === note.patient_name.toLowerCase())
      );
      if (patIdx !== -1) {
        const dateLabel = new Date().toISOString().split('T')[0];
        store.patients[patIdx].clinical_notes = `[${dateLabel} - ${created.folio_number}]: ${note.conclusion_notes} | ${store.patients[patIdx].clinical_notes || ''}`;
      }
    }

    saveStore(store);
    return created;
  },

  getExpenses(tenantId: string): ClinicExpense[] {
    return loadStore()
      .expenses.filter((e) => e.tenant_id === tenantId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createExpense(
    exp: Omit<ClinicExpense, 'id' | 'created_at'>
  ): ClinicExpense {
    const store = loadStore();
    const created: ClinicExpense = {
      ...exp,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    store.expenses.unshift(created);
    saveStore(store);
    return created;
  },

  deleteExpense(id: string): void {
    const store = loadStore();
    store.expenses = store.expenses.filter((e) => e.id !== id);
    saveStore(store);
  },

  getSupplies(tenantId: string): ClinicalSupply[] {
    return loadStore().supplies.filter((s) => s.tenant_id === tenantId);
  },

  createSupply(
    sup: Omit<ClinicalSupply, 'id' | 'updated_at'>
  ): ClinicalSupply {
    const store = loadStore();
    const created: ClinicalSupply = {
      ...sup,
      id: `sup-${Date.now()}`,
      updated_at: new Date().toISOString().split('T')[0]
    };
    store.supplies.unshift(created);
    saveStore(store);
    return created;
  },

  adjustSupplyStock(
    id: string,
    delta: number,
    recordAsExpense = false
  ): ClinicalSupply | null {
    const store = loadStore();
    const idx = store.supplies.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const item = store.supplies[idx];
    const nextStock = Math.max(0, item.current_stock + delta);
    store.supplies[idx] = {
      ...item,
      current_stock: nextStock,
      updated_at: new Date().toISOString().split('T')[0]
    };

    if (recordAsExpense && delta > 0) {
      store.expenses.unshift({
        id: `exp-sup-${Date.now()}`,
        tenant_id: item.tenant_id,
        category: 'insumos_clinicos',
        description: `Reposición de Stock (+${delta} ${item.unit}): ${item.name}`,
        amount: delta * item.unit_cost,
        payment_method: 'qr_transfer',
        expense_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      });
    }

    saveStore(store);
    return store.supplies[idx];
  },

  getMembers(tenantId: string): ClinicUserMember[] {
    return loadStore().members.filter((m) => m.tenant_id === tenantId);
  },

  createMember(
    mem: Omit<ClinicUserMember, 'id' | 'last_login'>
  ): ClinicUserMember {
    const store = loadStore();
    const created: ClinicUserMember = {
      ...mem,
      id: `mem-${Date.now()}`,
      last_login: 'Invitación enviada'
    };
    store.members.push(created);
    saveStore(store);
    return created;
  },

  updateMemberRole(id: string, role: StaffRoleType): void {
    const store = loadStore();
    const target = store.members.find((m) => m.id === id);
    if (target) {
      target.role = role;
      saveStore(store);
    }
  },

  toggleMemberStatus(id: string): void {
    const store = loadStore();
    const target = store.members.find((m) => m.id === id);
    if (target) {
      target.active = !target.active;
      saveStore(store);
    }
  },

  getRolePermissions(): RolePermissionConfig[] {
    return loadStore().rolePermissions;
  },

  toggleRoleModulePermission(role: StaffRoleType, moduleId: string): void {
    const store = loadStore();
    const rp = store.rolePermissions.find((r) => r.role === role);
    if (!rp) return;
    if (rp.allowed_modules.includes(moduleId)) {
      rp.allowed_modules = rp.allowed_modules.filter((m) => m !== moduleId);
    } else {
      rp.allowed_modules.push(moduleId);
    }
    saveStore(store);
  },

  getOdontograms(tenantId: string): PatientOdontogram[] {
    return loadStore().odontograms.filter((o) => o.tenant_id === tenantId);
  },

  saveOdontogram(record: PatientOdontogram): PatientOdontogram {
    const store = loadStore();
    const idx = store.odontograms.findIndex(
      (o) =>
        o.tenant_id === record.tenant_id && o.patient_id === record.patient_id
    );
    const updated: PatientOdontogram = {
      ...record,
      updated_at: new Date().toISOString().split('T')[0]
    };
    if (idx !== -1) {
      store.odontograms[idx] = updated;
    } else {
      store.odontograms.unshift(updated);
    }
    saveStore(store);
    return updated;
  },

  getEvaluations(tenantId: string): SpecialistEvaluationRecord[] {
    return loadStore().evaluations.filter((e) => e.tenant_id === tenantId);
  },

  saveEvaluation(
    record: SpecialistEvaluationRecord
  ): SpecialistEvaluationRecord {
    const store = loadStore();
    const idx = store.evaluations.findIndex(
      (e) =>
        e.tenant_id === record.tenant_id && e.patient_id === record.patient_id
    );
    if (idx !== -1) {
      store.evaluations[idx] = record;
    } else {
      store.evaluations.unshift(record);
    }
    saveStore(store);
    return record;
  },

  getPrescriptions(tenantId: string): ClinicalPrescription[] {
    return loadStore()
      .prescriptions.filter((p) => p.tenant_id === tenantId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createPrescription(
    data: Omit<ClinicalPrescription, 'id' | 'folio' | 'created_at'>
  ): ClinicalPrescription {
    const store = loadStore();
    const prefix =
      data.doc_type === 'receta'
        ? 'RX'
        : data.doc_type === 'orden_estudio'
        ? 'ORD'
        : data.doc_type === 'consentimiento'
        ? 'CONS'
        : 'CERT';
    const created: ClinicalPrescription = {
      ...data,
      id: `rx-${Date.now()}`,
      folio: `${prefix}-PEPE-0${100 + store.prescriptions.length + 1}`,
      created_at: new Date().toISOString()
    };
    store.prescriptions.unshift(created);
    saveStore(store);
    return created;
  },

  // =========================================================================
  // MÓDULO: PLANES DE TRATAMIENTO POR SESIONES Y CUOTAS
  // =========================================================================
  getTreatmentPlans(tenantId: string): TreatmentPlanPackage[] {
    return loadStore().treatmentPlans.filter((p) => p.tenant_id === tenantId);
  },

  createTreatmentPlan(
    data: Omit<TreatmentPlanPackage, 'id' | 'created_at'>
  ): TreatmentPlanPackage {
    const store = loadStore();
    const created: TreatmentPlanPackage = {
      ...data,
      id: `plan-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    store.treatmentPlans.unshift(created);
    saveStore(store);
    return created;
  },

  advanceTreatmentPlanSession(
    planId: string,
    paymentAdded = 0
  ): TreatmentPlanPackage | null {
    const store = loadStore();
    const idx = store.treatmentPlans.findIndex((p) => p.id === planId);
    if (idx === -1) return null;
    const plan = store.treatmentPlans[idx];
    const nextCompleted = Math.min(
      plan.total_sessions,
      plan.completed_sessions + 1
    );
    const nextPaid = Math.min(
      plan.total_budget,
      plan.amount_paid + paymentAdded
    );
    store.treatmentPlans[idx] = {
      ...plan,
      completed_sessions: nextCompleted,
      amount_paid: nextPaid,
      status:
        nextCompleted >= plan.total_sessions ? 'completado' : plan.status
    };
    saveStore(store);
    return store.treatmentPlans[idx];
  },

  // =========================================================================
  // MÓDULO: GALERÍA CLÍNICA ANTES/DESPUÉS Y VISOR RX / 3D
  // =========================================================================
  getImagingStudies(tenantId: string): ClinicalImagingStudy[] {
    return loadStore().imagingStudies.filter((i) => i.tenant_id === tenantId);
  },

  createImagingStudy(
    data: Omit<ClinicalImagingStudy, 'id' | 'created_at'>
  ): ClinicalImagingStudy {
    const store = loadStore();
    const created: ClinicalImagingStudy = {
      ...data,
      id: `img-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    store.imagingStudies.unshift(created);
    saveStore(store);
    return created;
  },

  // =========================================================================
  // MÓDULO: CONTROL DE TRABAJOS DE LABORATORIO DENTAL / ORTOPÉDICO
  // =========================================================================
  getLabOrders(tenantId: string): ExternalLabOrder[] {
    return loadStore().labOrders.filter((l) => l.tenant_id === tenantId);
  },

  createLabOrder(
    data: Omit<ExternalLabOrder, 'id' | 'order_code' | 'created_at'>,
    recordExpenseInFinance = true
  ): ExternalLabOrder {
    const store = loadStore();
    const created: ExternalLabOrder = {
      ...data,
      id: `lab-${Date.now()}`,
      order_code: `LAB-0${200 + store.labOrders.length + 1}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    store.labOrders.unshift(created);

    if (recordExpenseInFinance && data.lab_cost > 0) {
      store.expenses.unshift({
        id: `exp-lab-${Date.now()}`,
        tenant_id: data.tenant_id,
        category: 'laboratorio_externo',
        description: `Orden ${created.order_code} (${data.laboratory_name}): ${data.work_type} - Pac. ${data.patient_name}`,
        amount: data.lab_cost,
        payment_method: 'qr_transfer',
        specialist_name: data.specialist_name,
        expense_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      });
    }

    saveStore(store);
    return created;
  },

  updateLabOrderStatus(
    id: string,
    status: LabWorkStatus
  ): ExternalLabOrder | null {
    const store = loadStore();
    const idx = store.labOrders.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    store.labOrders[idx] = { ...store.labOrders[idx], status };
    saveStore(store);
    return store.labOrders[idx];
  },

  // =========================================================================
  // MÓDULO: SALA DE ESPERA DIGITAL (TV / TURNERO EN TIEMPO REAL)
  // =========================================================================
  getWaitingTickets(tenantId: string): WaitingRoomTicket[] {
    return loadStore().waitingTickets.filter((w) => w.tenant_id === tenantId);
  },

  createWaitingTicket(
    data: Omit<WaitingRoomTicket, 'id' | 'ticket_code'>
  ): WaitingRoomTicket {
    const store = loadStore();
    const tenantTickets = store.waitingTickets.filter(
      (t) => t.tenant_id === data.tenant_id
    );
    const prefix = data.tenant_id.includes('fisio') ? 'FIS' : 'ODO';
    const created: WaitingRoomTicket = {
      ...data,
      id: `wt-${Date.now()}`,
      ticket_code: `${prefix}-0${tenantTickets.length + 1}`
    };
    store.waitingTickets.push(created);
    saveStore(store);
    return created;
  },

  updateWaitingTicketStatus(
    id: string,
    status: WaitingTicketStatus
  ): WaitingRoomTicket | null {
    const store = loadStore();
    const idx = store.waitingTickets.findIndex((w) => w.id === id);
    if (idx === -1) return null;
    store.waitingTickets[idx] = { ...store.waitingTickets[idx], status };
    saveStore(store);
    return store.waitingTickets[idx];
  },

  // =========================================================================
  // MÓDULO: CAMPAÑAS DE REACTIVACIÓN WHATSAPP / RECALL CLÍNICO
  // =========================================================================
  getRecallCampaigns(tenantId: string): RecallCampaignItem[] {
    return loadStore().recallCampaigns.filter((r) => r.tenant_id === tenantId);
  },

  createRecallCampaign(
    data: Omit<RecallCampaignItem, 'id'>
  ): RecallCampaignItem {
    const store = loadStore();
    const created: RecallCampaignItem = {
      ...data,
      id: `rec-${Date.now()}`
    };
    store.recallCampaigns.unshift(created);
    saveStore(store);
    return created;
  },

  updateRecallStatus(
    id: string,
    status: RecallCampaignItem['status']
  ): RecallCampaignItem | null {
    const store = loadStore();
    const idx = store.recallCampaigns.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    store.recallCampaigns[idx] = { ...store.recallCampaigns[idx], status };
    saveStore(store);
    return store.recallCampaigns[idx];
  }
};
