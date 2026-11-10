export type SpecialtyType =
  | 'dental'
  | 'fisioterapia'
  | 'medicina'
  | 'estetica'
  | 'traumatologia'
  | 'pediatria'
  | 'psicologia';

export type PlanType = 'trial' | 'starter' | 'pro' | 'enterprise';

export interface SpecialtyPreset {
  id: SpecialtyType;
  label: string;
  shortName: string;
  boxName: string; // Ej: "Sillón Dental", "Box Fisio", "Consultorio"
  specialistDefaultRole: string;
  defaultColor: string;
  description: string;
  defaultServices: {
    name: string;
    category: string;
    description: string;
    duration_min: number;
    price: number;
    deposit_amount: number;
  }[];
  defaultSupplies: {
    name: string;
    sku: string;
    category: string;
    unit: string;
    unit_cost: number;
    min_stock: number;
  }[];
}

export const SPECIALTY_CATALOG: Record<SpecialtyType, SpecialtyPreset> = {
  dental: {
    id: 'dental',
    label: 'Clínica Dental / Odontología',
    shortName: 'Odontología',
    boxName: 'Sillón Dental',
    specialistDefaultRole: 'Odontólogo(a) Especialista',
    defaultColor: '#0284c7',
    description:
      'Ortodoncia, Implante Dental, Diseño de Sonrisa, Endodoncia y Odontopediatría.',
    defaultServices: [
      {
        name: 'Limpieza Dental Ultrasónica + Fluorización',
        category: 'Prevención Dental',
        description: 'Detartraje por ultrasonido, profilaxis y pulido.',
        duration_min: 45,
        price: 35,
        deposit_amount: 10
      },
      {
        name: 'Resina Fotocurada Estética (Por Pieza)',
        category: 'Operatoria Dental',
        description: 'Restauración estética con resina nanohíbrida.',
        duration_min: 45,
        price: 30,
        deposit_amount: 10
      },
      {
        name: 'Blanqueamiento Dental LED Clínico',
        category: 'Estética Dental',
        description: 'Aclaramiento fotoactivado en consultorio.',
        duration_min: 60,
        price: 120,
        deposit_amount: 35
      },
      {
        name: 'Control Mensual de Ortodoncia',
        category: 'Ortodoncia',
        description: 'Ajuste de brackets o alineadores invisibles.',
        duration_min: 30,
        price: 40,
        deposit_amount: 15
      },
      {
        name: 'Endodoncia Unirradicular / Multirradicular (Conducto)',
        category: 'Endodoncia',
        description: 'Tratamiento de conducto mecanizado con localizador apical.',
        duration_min: 60,
        price: 90,
        deposit_amount: 30
      },
      {
        name: 'Cirugía de Tercer Molar (Muela del Juicio)',
        category: 'Cirugía Maxilofacial',
        description: 'Exodoncia quirúrgica con sutura y control post-operatorio.',
        duration_min: 60,
        price: 80,
        deposit_amount: 25
      },
      {
        name: 'Corona de Porcelana Libre de Metal / Zirconio',
        category: 'Rehabilitación Oral',
        description: 'Prótesis fija estética sobre diente o implante.',
        duration_min: 60,
        price: 180,
        deposit_amount: 60
      },
      {
        name: 'Implante Dental de Titanio (Fase Quirúrgica)',
        category: 'Implantología',
        description: 'Colocación de implante osteointegrado de titanio grado médico.',
        duration_min: 90,
        price: 350,
        deposit_amount: 100
      }
    ],
    defaultSupplies: [
      {
        name: 'Resina 3M Filtek Z350 (Tono A2)',
        sku: 'OD-RES-A2',
        category: 'Operatoria',
        unit: 'Jeringas',
        unit_cost: 28,
        min_stock: 5
      },
      {
        name: 'Anestésico Lidocaína 2% Cárpules',
        sku: 'OD-LIDO-50',
        category: 'Anestesia',
        unit: 'Cajas x50',
        unit_cost: 22,
        min_stock: 4
      }
    ]
  },
  fisioterapia: {
    id: 'fisioterapia',
    label: 'Fisioterapia y Rehabilitación',
    shortName: 'Fisioterapia',
    boxName: 'Box de Fisioterapia',
    specialistDefaultRole: 'Lic. en Fisioterapia y Kinesiología',
    defaultColor: '#0d9488',
    description:
      'Fisioterapia Deportiva, Rehabilitación de Columna, Punción Seca y Electroterapia.',
    defaultServices: [
      {
        name: 'Evaluación Funcional + 1ra Sesión Fisioterapia',
        category: 'Evaluación Kinésica',
        description: 'Valoración biomecánica y primera descarga analgésica.',
        duration_min: 60,
        price: 40,
        deposit_amount: 15
      },
      {
        name: 'Sesión Fisioterapia Deportiva & Descarga Muscular',
        category: 'Fisioterapia Deportiva',
        description: 'Terapia manual profunda, punción seca y cupping.',
        duration_min: 45,
        price: 35,
        deposit_amount: 15
      },
      {
        name: 'Rehabilitación de Columna y Nervio Ciático',
        category: 'Rehabilitación Postural',
        description: 'Electroanalgesia TENS, ultrasonido y terapia manual.',
        duration_min: 45,
        price: 35,
        deposit_amount: 15
      }
    ],
    defaultSupplies: [
      {
        name: 'Agujas de Punción Seca 0.30x40mm',
        sku: 'FIS-AGUJ-40',
        category: 'Punción Seca',
        unit: 'Cajas x100',
        unit_cost: 15,
        min_stock: 5
      },
      {
        name: 'Gel Conductor Ultrasonido (Bidón 5L)',
        sku: 'FIS-GEL-5L',
        category: 'Electroterapia',
        unit: 'Bidones',
        unit_cost: 12,
        min_stock: 3
      }
    ]
  },
  medicina: {
    id: 'medicina',
    label: 'Consultorio Médico General / Especialidades',
    shortName: 'Medicina General',
    boxName: 'Consultorio Médico',
    specialistDefaultRole: 'Médico(a) Cirujano / Internista',
    defaultColor: '#2563eb',
    description:
      'Consulta Médica Integral, Chequeos Preventivos, Electrocardiograma y Certificados.',
    defaultServices: [
      {
        name: 'Consulta Médica Integral + Historia Clínica',
        category: 'Consulta Médica',
        description: 'Evaluación clínica completa, signos vitales y receta médica.',
        duration_min: 30,
        price: 30,
        deposit_amount: 10
      },
      {
        name: 'Chequeo Ejecutivo + Electrocardiograma',
        category: 'Cardiología / Prevención',
        description: 'Valoración cardiovascular y lectura de resultados.',
        duration_min: 45,
        price: 55,
        deposit_amount: 20
      }
    ],
    defaultSupplies: [
      {
        name: 'Guantes de Examen Nitrilo',
        sku: 'MED-GUA-M',
        category: 'Bioseguridad',
        unit: 'Cajas x100',
        unit_cost: 9,
        min_stock: 6
      },
      {
        name: 'Papel Térmico para Electrocardiógrafo',
        sku: 'MED-ECG-01',
        category: 'Diagnóstico',
        unit: 'Rollos',
        unit_cost: 8,
        min_stock: 4
      }
    ]
  },
  estetica: {
    id: 'estetica',
    label: 'Medicina Estética y Dermatología',
    shortName: 'Estética & Derma',
    boxName: 'Cabina Estética',
    specialistDefaultRole: 'Especialista en Medicina Estética',
    defaultColor: '#db2777',
    description:
      'Armonización Facial, Toxina Botulínica, Ácido Hialurónico, Hydrafacial y Láser.',
    defaultServices: [
      {
        name: 'Limpieza Facial Profunda Hydrafacial + Punta de Diamante',
        category: 'Estética Facial',
        description: 'Higiene profunda con extracción ultrasónica y máscara LED.',
        duration_min: 60,
        price: 45,
        deposit_amount: 15
      },
      {
        name: 'Aplicación de Toxina Botulínica (3 Zonas)',
        category: 'Armonización Facial',
        description: 'Rejuvenecimiento de frente, entrecejo y patas de gallo.',
        duration_min: 45,
        price: 180,
        deposit_amount: 50
      }
    ],
    defaultSupplies: [
      {
        name: 'Ácido Hialurónico Reticulado 1ml',
        sku: 'EST-AH-1ML',
        category: 'Rellenos Dérmicos',
        unit: 'Jeringas',
        unit_cost: 65,
        min_stock: 4
      }
    ]
  },
  traumatologia: {
    id: 'traumatologia',
    label: 'Traumatología y Ortopedia',
    shortName: 'Traumatología',
    boxName: 'Consultorio Trauma',
    specialistDefaultRole: 'Médico Traumatólogo Ortopedista',
    defaultColor: '#4f46e5',
    description:
      'Lesiones Deportivas, Infiltraciones Articulares, Yesos y Ortopedia.',
    defaultServices: [
      {
        name: 'Consulta Traumatológica Especializada',
        category: 'Traumatología',
        description: 'Evaluación osteomuscular y revisión de imágenes.',
        duration_min: 30,
        price: 40,
        deposit_amount: 15
      },
      {
        name: 'Infiltración Articular Ecoguiada (Rodilla/Hombro)',
        category: 'Procedimiento',
        description: 'Aplicación intraarticular para alivio del dolor.',
        duration_min: 45,
        price: 85,
        deposit_amount: 30
      }
    ],
    defaultSupplies: [
      {
        name: 'Venda de Fibra de Vidrio para Inmovilización',
        sku: 'TRA-VEN-04',
        category: 'Ortopedia',
        unit: 'Rollos',
        unit_cost: 14,
        min_stock: 6
      }
    ]
  },
  pediatria: {
    id: 'pediatria',
    label: 'Pediatría y Desarrollo Infantil',
    shortName: 'Pediatría',
    boxName: 'Consultorio Pediátrico',
    specialistDefaultRole: 'Médico(a) Pediatra',
    defaultColor: '#ea580c',
    description:
      'Control de Niño Sano, Vacunación, Crecimiento y Urgencias Pediátricas.',
    defaultServices: [
      {
        name: 'Control de Niño Sano (Peso, Talla y Desarrollo)',
        category: 'Pediatría Preventiva',
        description: 'Evaluación integral pediátrica y esquema de nutrición.',
        duration_min: 30,
        price: 35,
        deposit_amount: 10
      }
    ],
    defaultSupplies: [
      {
        name: 'Bajadas de Lengua Pediátricas Descartables',
        sku: 'PED-BAJ-100',
        category: 'Insumos Pediátricos',
        unit: 'Cajas x100',
        unit_cost: 6,
        min_stock: 5
      }
    ]
  },
  psicologia: {
    id: 'psicologia',
    label: 'Psicología Clínica y Salud Mental',
    shortName: 'Psicología',
    boxName: 'Consultorio Terapéutico',
    specialistDefaultRole: 'Lic. en Psicología Clínica',
    defaultColor: '#7c3aed',
    description:
      'Terapia Individual, Terapia de Pareja, Evaluación Psicodiagnóstica y Ansiedad.',
    defaultServices: [
      {
        name: 'Sesión de Psicoterapia Individual (50 min)',
        category: 'Terapia Individual',
        description: 'Sesión clínica cognitivo-conductual presencial o híbrida.',
        duration_min: 50,
        price: 35,
        deposit_amount: 15
      },
      {
        name: 'Sesión de Terapia de Pareja o Familiar',
        category: 'Terapia Familiar',
        description: 'Abordaje vincular y resolución de conflictos.',
        duration_min: 60,
        price: 45,
        deposit_amount: 20
      }
    ],
    defaultSupplies: [
      {
        name: 'Batería de Tests Psicométricos Impresos',
        sku: 'PSI-TEST-01',
        category: 'Evaluación',
        unit: 'Carpetas',
        unit_cost: 10,
        min_stock: 5
      }
    ]
  }
};

export interface TenantClinic {
  id: string;
  name: string;
  slug: string;
  specialty: SpecialtyType;
  description: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  theme_color: string;
  requires_deposit: boolean;
  deposit_percentage: number;
  payment_instructions: string;
  plan: PlanType;
  subscription_status: 'active' | 'past_due' | 'cancelled';
}

export interface Specialist {
  id: string;
  tenant_id: string;
  name: string;
  role_title: string;
  bio: string;
  color_tag: string;
  active: boolean;
  work_days: number[]; // 1 = Lunes ... 6 = Sábado
  start_time: string;  // "09:00"
  end_time: string;    // "18:00"
}

export interface ClinicService {
  id: string;
  tenant_id: string;
  name: string;
  category: string;
  description: string;
  duration_min: number;
  price: number;
  deposit_amount: number;
  active: boolean;
}

export interface PatientClient {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email?: string;
  dni?: string;
  birth_date?: string;
  clinical_notes?: string;
  tags: string[];
  created_at: string;
}

export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid';

export interface Appointment {
  id: string;
  tenant_id: string;
  service_id: string;
  specialist_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_dni?: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string;       // HH:mm
  end_time: string;         // HH:mm
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_method: 'qr_transfer' | 'online_card' | 'cash_at_clinic';
  amount_paid: number;
  payment_reference?: string;
  notes?: string;
  conclusion_notes?: string;
  reminder_24h_sent: boolean;
  reminder_2h_sent: boolean;
  created_at: string;
}

export interface PosLineItem {
  id: string;
  service_id?: string;
  name: string;
  category: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export type PosNoteType = 'nota_reserva' | 'nota_conclusion';

export interface PosServiceNote {
  id: string;
  tenant_id: string;
  appointment_id?: string;
  folio_number: string;
  note_type: PosNoteType;
  patient_name: string;
  patient_phone: string;
  patient_dni?: string;
  specialist_name: string;
  items: PosLineItem[];
  subtotal: number;
  deposit_deducted: number;
  discount: number;
  total_paid: number;
  payment_method: 'cash' | 'qr_transfer' | 'card';
  payment_reference?: string;
  reservation_notes: string;
  conclusion_notes: string;
  created_at: string;
}

export type ExpenseCategory =
  | 'insumos_clinicos'
  | 'laboratorio_externo'
  | 'comision_especialista'
  | 'alquiler_servicios'
  | 'equipamiento'
  | 'marketing'
  | 'otros';

export interface ClinicExpense {
  id: string;
  tenant_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  payment_method: 'cash' | 'qr_transfer' | 'card';
  specialist_name?: string;
  expense_date: string;
  created_at: string;
}

export interface ClinicalSupply {
  id: string;
  tenant_id: string;
  name: string;
  sku: string;
  category: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  unit_cost: number;
  supplier: string;
  updated_at: string;
}

export type StaffRoleType =
  | 'owner'
  | 'admin'
  | 'specialist'
  | 'receptionist'
  | 'assistant';

export interface ClinicUserMember {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: StaffRoleType;
  active: boolean;
  last_login: string;
}

export interface RolePermissionConfig {
  role: StaffRoleType;
  label: string;
  description: string;
  allowed_modules: string[];
  can_collect_pos: boolean;
  can_view_finances: boolean;
  can_manage_supplies: boolean;
  can_manage_roles: boolean;
}

export type ToothCondition =
  | 'sano'
  | 'caries'
  | 'resina'
  | 'endodoncia'
  | 'corona'
  | 'extraccion'
  | 'implante';

export interface ToothTreatmentEntry {
  toothNumber: number; // Sistema FDI: 11-18, 21-28, 31-38, 41-48
  condition: ToothCondition;
  procedureName: string;
  estimatedCost: number;
  notes?: string;
}

export interface PatientOdontogram {
  id: string;
  tenant_id: string;
  patient_id: string;
  patient_name: string;
  specialist_name: string;
  teeth: Record<number, ToothTreatmentEntry>;
  general_diagnosis: string;
  updated_at: string;
}

export interface VitalSigns {
  bloodPressure: string; // "120/80"
  heartRate: number;     // 72 bpm
  temperature: number;   // 36.6 °C
  spo2: number;          // 98 %
  weightKg: number;      // 70 kg
  heightCm: number;      // 170 cm
}

export interface BodyZonePainEntry {
  zoneId: string;
  zoneLabel: string;
  evaPain: number; // Escala 1 a 10
  mobilityRom: 'normal' | 'limitacion_leve' | 'limitacion_severa';
  therapyAssigned: string;
  sessionCost: number;
}

export interface SpecialistEvaluationRecord {
  id: string;
  tenant_id: string;
  patient_id: string;
  patient_name: string;
  specialist_name: string;
  vital_signs: VitalSigns;
  body_zones: Record<string, BodyZonePainEntry>;
  functional_diagnosis: string;
  created_at: string;
}

export type ClinicalDocType =
  | 'receta'
  | 'orden_estudio'
  | 'certificado'
  | 'consentimiento';

export interface PrescriptionItem {
  id: string;
  title: string;      // Ej: "Amoxicilina 500mg" o "Radiografía Panorámica Digital"
  dosageOrSpec: string; // Ej: "1 cápsula cada 8 horas por 7 días"
}

export interface ClinicalPrescription {
  id: string;
  tenant_id: string;
  folio: string;
  doc_type: ClinicalDocType;
  patient_name: string;
  patient_phone: string;
  patient_dni?: string;
  specialist_name: string;
  specialist_role: string;
  diagnosis: string;
  items: PrescriptionItem[];
  indications: string;
  created_at: string;
}

// ============================================================================
// NUEVOS MÓDULOS AVANZADOS: PLANES POR SESIONES, IMÁGENES/RX, LABORATORIO,
// SALA DE ESPERA (TURNERO TV) Y CAMPAÑAS DE RECALL / REACTIVACIÓN
// ============================================================================

export interface TreatmentPlanPackage {
  id: string;
  tenant_id: string;
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  specialist_name: string;
  plan_title: string; // Ej: "Plan Ortodoncia Metálica 12 Controles" o "Pack 10 Sesiones Lumbalgia"
  category: 'ortodoncia' | 'rehabilitacion_fisio' | 'implantes_protesis' | 'estetica_integral';
  total_sessions: number;
  completed_sessions: number;
  total_budget: number;
  amount_paid: number;
  installment_price: number; // Costo sugerido por cuota o sesión
  next_session_date: string;
  status: 'activo' | 'completado' | 'pausado';
  clinical_evolution: string;
  created_at: string;
}

export interface ClinicalImagingStudy {
  id: string;
  tenant_id: string;
  patient_name: string;
  patient_phone: string;
  specialist_name: string;
  study_type:
    | 'rx_panoramica'
    | 'tomografia_3d'
    | 'rx_periapical'
    | 'ecografia_muscular'
    | 'antes_despues';
  title: string;
  zone_or_tooth: string; // Ej: "Arcada Completa", "Pieza 36", "Hombro Derecho"
  findings_notes: string;
  before_label: string;
  after_label: string;
  created_at: string;
}

export type LabWorkStatus =
  | 'enviado_lab'
  | 'diseno_cad_cam'
  | 'prueba_clinica'
  | 'listo_instalar'
  | 'entregado_paciente';

export interface ExternalLabOrder {
  id: string;
  tenant_id: string;
  order_code: string;
  patient_name: string;
  patient_phone: string;
  specialist_name: string;
  laboratory_name: string; // Ej: "DentalLab Pro CAD/CAM" o "OrtoTech Plantillas 3D"
  work_type: string; // Ej: "Corona Zirconio Monolítico", "Prótesis Removible", "Plantilla Propioceptiva"
  tooth_or_zone: string; // Ej: "Pieza 21 y 22" o "Pie Bilateral"
  shade_color: string; // Ej: "VITA A2", "VITA BL2", "N/A"
  lab_cost: number; // Costo que cobra el laboratorio externo a la clínica
  patient_price: number; // Precio cobrado al paciente
  due_date: string;
  status: LabWorkStatus;
  notes: string;
  created_at: string;
}

export type WaitingTicketStatus =
  | 'en_espera'
  | 'llamando_pantalla'
  | 'en_consultorio'
  | 'atendido';

export interface WaitingRoomTicket {
  id: string;
  tenant_id: string;
  ticket_code: string; // Ej: "ODO-01", "FIS-04"
  patient_name: string;
  specialist_name: string;
  box_room: string; // Ej: "Sillón Dental 1", "Box Fisio 2"
  service_name: string;
  arrival_time: string;
  status: WaitingTicketStatus;
  priority: 'normal' | 'preferencial_urgencia';
}

export interface RecallCampaignItem {
  id: string;
  tenant_id: string;
  patient_name: string;
  patient_phone: string;
  campaign_type:
    | 'limpieza_semestral'
    | 'control_post_op'
    | 'plan_incompleto'
    | 'cumpleanos_descuento';
  reason_label: string;
  last_visit_date: string;
  recommended_service: string;
  promo_discount_pct: number;
  message_template: string;
  status: 'pendiente' | 'enviado_wa' | 'cita_recuperada';
}

