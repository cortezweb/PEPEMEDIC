import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  UserCog,
  Stethoscope,
  Server,
  Menu,
  X,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Clock,
  CreditCard,
  Sparkles,
  Phone,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Receipt,
  ShoppingCart,
  Trash2,
  Printer,
  QrCode,
  Banknote,
  FileCheck2,
  BarChart3,
  PieChart,
  Download,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Package,
  Shield,
  AlertTriangle,
  KeyRound,
  Building2,
  Layers,
  Smile,
  Activity,
  Pill,
  HeartPulse,
  Tv,
  Image as ImageIcon,
  FlaskConical,
  Megaphone,
  Repeat
} from 'lucide-react';
import { db } from '../lib/supabase';
import {
  checkRailwayHealth,
  fetchWhatsAppLogs,
  sendWhatsAppViaRailway,
  triggerRailwayCronNow,
  RailwayHealthResponse,
  WhatsAppLogItem
} from '../lib/railwayApi';
import {
  Appointment,
  AppointmentStatus,
  BodyZonePainEntry,
  ClinicalDocType,
  ClinicalImagingStudy,
  ClinicalPrescription,
  ClinicalSupply,
  ClinicExpense,
  ClinicService,
  ClinicUserMember,
  ExpenseCategory,
  ExternalLabOrder,
  LabWorkStatus,
  PatientClient,
  PatientOdontogram,
  PosLineItem,
  PosNoteType,
  PosServiceNote,
  PrescriptionItem,
  RecallCampaignItem,
  RolePermissionConfig,
  Specialist,
  SpecialistEvaluationRecord,
  SPECIALTY_CATALOG,
  SpecialtyType,
  StaffRoleType,
  PlanType,
  TenantClinic,
  ToothCondition,
  ToothTreatmentEntry,
  TreatmentPlanPackage,
  VitalSigns,
  WaitingRoomTicket,
  WaitingTicketStatus
} from '../types/clinic';

type AdminSection =
  | 'dashboard'
  | 'saas'
  | 'pos'
  | 'finanzas'
  | 'calendario'
  | 'reservas'
  | 'turnero'
  | 'clientes'
  | 'odontograma'
  | 'evaluacion'
  | 'recetario'
  | 'planes'
  | 'imagenes'
  | 'laboratorio'
  | 'campanas'
  | 'personal'
  | 'servicios'
  | 'insumos'
  | 'roles'
  | 'railway';

const BODY_ZONES_CATALOG: {
  id: string;
  label: string;
  defaultTherapy: string;
  defaultCost: number;
}[] = [
  {
    id: 'atm_mandibular',
    label: 'Articulación Temporomandibular (ATM) / Bruxismo',
    defaultTherapy: 'Férula Miorrelajante + Terapia Manual ATM',
    defaultCost: 45
  },
  {
    id: 'cervical_trapecio',
    label: 'Columna Cervical y Trapecios',
    defaultTherapy: 'Terapia Manual Ortopédica + Ultrasonido + Punción Seca',
    defaultCost: 35
  },
  {
    id: 'hombro_manguito',
    label: 'Hombro / Manguito Rotador',
    defaultTherapy: 'Electroanalgesia TENS + Movilización Articular + Ejercicios',
    defaultCost: 35
  },
  {
    id: 'dorsal_escapular',
    label: 'Columna Dorsal y Escápulas',
    defaultTherapy: 'Descarga Miofascial + Ventosas (Cupping) + Termoterapia',
    defaultCost: 35
  },
  {
    id: 'lumbar_ciatico',
    label: 'Columna Lumbar (L4-L5) y Nervio Ciático',
    defaultTherapy: 'Tracción Vertebral + Punción Seca + Neurodinamia',
    defaultCost: 40
  },
  {
    id: 'codo_muneca',
    label: 'Codo / Muñeca / Túnel Carpiano',
    defaultTherapy: 'Láser Terapéutico + Ultrasonido + Vendaje Neuromuscular',
    defaultCost: 30
  },
  {
    id: 'cadera_pelvis',
    label: 'Cadera, Glúteo Medio y Sacroilíaca',
    defaultTherapy: 'Liberación Miofascial Piramidal + Estabilización Pélvica',
    defaultCost: 35
  },
  {
    id: 'rodilla_ligamentos',
    label: 'Rodilla (Ligamentos / Meniscos / Tendón Rotuliano)',
    defaultTherapy: 'Fisioterapia Deportiva + Electroestimulación + Propiocepción',
    defaultCost: 40
  },
  {
    id: 'gemelo_tobillo',
    label: 'Gemelos / Tendón de Aquiles / Esguince Tobillo',
    defaultTherapy: 'Descarga Deportiva + Crioterapia + Vendaje Funcional',
    defaultCost: 35
  }
];

const UPPER_TEETH_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_TEETH_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_TEETH_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const TOOTH_TOOLKIT: {
  id: ToothCondition;
  label: string;
  procedure: string;
  cost: number;
  bg: string;
  border: string;
  text: string;
}[] = [
  {
    id: 'caries',
    label: 'Caries / Lesión',
    procedure: 'Resina Fotocurada Estética',
    cost: 30,
    bg: '#ffe4e6',
    border: '#e11d48',
    text: '#9f1239'
  },
  {
    id: 'resina',
    label: 'Restauración Resina',
    procedure: 'Resina Nanohíbrida 3M',
    cost: 30,
    bg: '#e0f2fe',
    border: '#0284c7',
    text: '#075985'
  },
  {
    id: 'endodoncia',
    label: 'Endodoncia (Conducto)',
    procedure: 'Endodoncia Mecanizada',
    cost: 90,
    bg: '#f3e8ff',
    border: '#7c3aed',
    text: '#5b21b6'
  },
  {
    id: 'corona',
    label: 'Corona Zirconio/Porcelana',
    procedure: 'Corona Libre de Metal',
    cost: 180,
    bg: '#fef3c7',
    border: '#d97706',
    text: '#92400e'
  },
  {
    id: 'implante',
    label: 'Implante de Titanio',
    procedure: 'Implante Osteointegrado',
    cost: 350,
    bg: '#d1fae5',
    border: '#059669',
    text: '#065f46'
  },
  {
    id: 'extraccion',
    label: 'Exodoncia / Extracción',
    procedure: 'Cirugía / Exodoncia Dental',
    cost: 45,
    bg: '#e2e8f0',
    border: '#475569',
    text: '#1e293b'
  },
  {
    id: 'sano',
    label: 'Marcar Diente Sano',
    procedure: 'Sin tratamiento requerido',
    cost: 0,
    bg: '#ffffff',
    border: '#cbd5e1',
    text: '#334155'
  }
];

const HOURS_GRID = [
  '08:30',
  '09:00',
  '10:00',
  '11:00',
  '11:30',
  '12:00',
  '14:00',
  '15:00',
  '15:30',
  '16:00',
  '17:00',
  '18:00'
];

export const ClinicAdmin: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tenants = db.getTenants();
  const initialTenantId = searchParams.get('tenant') || tenants[0]?.id;

  // Navegación y Menú Hamburguesa (Desktop colapsable + Móvil Drawer)
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Datos Multi-Tenant
  const [selectedTenantId, setSelectedTenantId] = useState<string>(initialTenantId);
  const [tenant, setTenant] = useState<TenantClinic | undefined>(() =>
    db.getTenantById(selectedTenantId)
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [patients, setPatients] = useState<PatientClient[]>([]);
  const [posNotes, setPosNotes] = useState<PosServiceNote[]>([]);
  const [expenses, setExpenses] = useState<ClinicExpense[]>([]);
  const [supplies, setSupplies] = useState<ClinicalSupply[]>([]);
  const [members, setMembers] = useState<ClinicUserMember[]>([]);
  const [rolePermissions, setRolePermissions] = useState<
    RolePermissionConfig[]
  >([]);
  const [simulatedRole, setSimulatedRole] = useState<StaffRoleType>('owner');

  // Estado del Odontograma Clínico Interactivo
  const [odontograms, setOdontograms] = useState<PatientOdontogram[]>([]);
  const [selectedOdoPatientId, setSelectedOdoPatientId] = useState<string>('');
  const [activeToothTool, setActiveToothTool] =
    useState<ToothCondition>('caries');
  const [currentTeethMap, setCurrentTeethMap] = useState<
    Record<number, ToothTreatmentEntry>
  >({});
  const [odoDiagnosis, setOdoDiagnosis] = useState<string>('');

  // Estado Evaluación Especialista (Signos Vitales + Mapa Corporal EVA)
  const [evaluations, setEvaluations] = useState<SpecialistEvaluationRecord[]>(
    []
  );
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 36.6,
    spo2: 98,
    weightKg: 68,
    heightCm: 168
  });
  const [bodyZonesMap, setBodyZonesMap] = useState<
    Record<string, BodyZonePainEntry>
  >({});
  const [selectedEvaScale, setSelectedEvaScale] = useState<number>(6);
  const [selectedRom, setSelectedRom] = useState<
    'normal' | 'limitacion_leve' | 'limitacion_severa'
  >('limitacion_leve');
  const [evalDiagnosis, setEvalDiagnosis] = useState<string>(
    'Evaluación biomecánica y triaje de signos vitales.'
  );

  // Estado Recetario Médico, Órdenes de Estudio y Consentimientos
  const [prescriptions, setPrescriptions] = useState<ClinicalPrescription[]>(
    []
  );
  const [rxDocType, setRxDocType] = useState<ClinicalDocType>('receta');
  const [rxPatientName, setRxPatientName] = useState<string>('');
  const [rxPatientPhone, setRxPatientPhone] = useState<string>('+5917');
  const [rxPatientDni, setRxPatientDni] = useState<string>('');
  const [rxSpecialistName, setRxSpecialistName] = useState<string>('');
  const [rxDiagnosis, setRxDiagnosis] = useState<string>('');
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([
    {
      id: 'rx-init-1',
      title: 'Ibuprofeno 600 mg (Comprimidos)',
      dosageOrSpec: 'Tomar 1 comprimido cada 8 horas por 3 días.'
    }
  ]);
  const [rxNewTitle, setRxNewTitle] = useState<string>('');
  const [rxNewDosage, setRxNewDosage] = useState<string>('');
  const [rxIndications, setRxIndications] = useState<string>(
    'Reposo relativo, hidratación adecuada y acudir a control programado.'
  );
  const [viewingPrescription, setViewingPrescription] =
    useState<ClinicalPrescription | null>(null);

  // Estado Módulo 1: Planes de Tratamiento por Sesiones y Cuotas
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlanPackage[]>(
    []
  );
  const [tpPatientName, setTpPatientName] = useState('');
  const [tpPatientPhone, setTpPatientPhone] = useState('+5917');
  const [tpTitle, setTpTitle] = useState('');
  const [tpCategory, setTpCategory] =
    useState<TreatmentPlanPackage['category']>('ortodoncia');
  const [tpTotalSessions, setTpTotalSessions] = useState(6);
  const [tpTotalBudget, setTpTotalBudget] = useState(240);
  const [tpEvolution, setTpEvolution] = useState('');

  // Estado Módulo 2: Galería Clínica Antes/Después y Visor Rx / 3D
  const [imagingStudies, setImagingStudies] = useState<ClinicalImagingStudy[]>(
    []
  );
  const [activeStudyId, setActiveStudyId] = useState<string>('');
  const [beforeAfterSlider, setBeforeAfterSlider] = useState<number>(50);
  const [rxInvertContrast, setRxInvertContrast] = useState<boolean>(false);
  const [rxZoomLevel, setRxZoomLevel] = useState<number>(100);
  const [imgTitle, setImgTitle] = useState('');
  const [imgType, setImgType] =
    useState<ClinicalImagingStudy['study_type']>('rx_panoramica');
  const [imgZone, setImgZone] = useState('Arcada Superior / Inferior');
  const [imgFindings, setImgFindings] = useState('');

  // Estado Módulo 3: Control de Trabajos de Laboratorio Dental / Ortopédico
  const [labOrders, setLabOrders] = useState<ExternalLabOrder[]>([]);
  const [labName, setLabName] = useState('BioDental CAD/CAM Studio');
  const [labWorkType, setLabWorkType] = useState(
    'Corona de Zirconio Monolítico'
  );
  const [labZone, setLabZone] = useState('Pieza 21');
  const [labShade, setLabShade] = useState('VITA A2');
  const [labCost, setLabCost] = useState(60);
  const [labPatientPrice, setLabPatientPrice] = useState(200);
  const [labDueDate, setLabDueDate] = useState('');
  const [labNotes, setLabNotes] = useState('');

  // Estado Módulo 4: Sala de Espera Digital (TV / Turnero en Tiempo Real)
  const [waitingTickets, setWaitingTickets] = useState<WaitingRoomTicket[]>([]);
  const [tvFullMode, setTvFullMode] = useState(false);
  const [wtPatientName, setWtPatientName] = useState('');
  const [wtBoxRoom, setWtBoxRoom] = useState('Consultorio Dental 1');
  const [wtServiceName, setWtServiceName] = useState('Consulta Especializada');
  const [wtPriority, setWtPriority] =
    useState<WaitingRoomTicket['priority']>('normal');

  // Estado Módulo 5: Campañas de Reactivación WhatsApp / Recall Clínico
  const [recallCampaigns, setRecallCampaigns] = useState<RecallCampaignItem[]>(
    []
  );
  const [recReason, setRecReason] = useState(
    'Control semestral de limpieza ultrasónica'
  );
  const [recService, setRecService] = useState(
    'Limpieza Dental Ultrasónica + Pulido'
  );
  const [recDiscount, setRecDiscount] = useState(15);
  const [sendingRecallId, setSendingRecallId] = useState<string | null>(null);

  // Formulario Nuevo Insumo Clínico
  const [supName, setSupName] = useState('');
  const [supSku, setSupSku] = useState('');
  const [supCategory, setSupCategory] = useState('Operatoria / General');
  const [supStock, setSupStock] = useState(10);
  const [supMinStock, setSupMinStock] = useState(5);
  const [supUnit, setSupUnit] = useState('Cajas');
  const [supCost, setSupCost] = useState(15);
  const [supSupplier, setSupSupplier] = useState('');

  // Formulario Nuevo Usuario con Rol
  const [memName, setMemName] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memRole, setMemRole] = useState<StaffRoleType>('receptionist');

  // Formulario Alta de Nuevo Cliente SaaS por Área / Especialidad
  const [saasClientName, setSaasClientName] = useState('');
  const [saasClientSlug, setSaasClientSlug] = useState('');
  const [saasSpecialty, setSaasSpecialty] = useState<SpecialtyType>('dental');
  const [saasPlan, setSaasPlan] = useState<PlanType>('pro');
  const [saasWhatsapp, setSaasWhatsapp] = useState('59170000000');
  const [saasAddress, setSaasAddress] = useState('');

  // Estado Formulario de Egresos / Gastos en Finanzas
  const [expCategory, setExpCategory] =
    useState<ExpenseCategory>('insumos_clinicos');
  const [expDescription, setExpDescription] = useState<string>('');
  const [expAmount, setExpAmount] = useState<number>(20);
  const [expMethod, setExpMethod] = useState<'cash' | 'qr_transfer' | 'card'>(
    'qr_transfer'
  );
  const [commissionRate, setCommissionRate] = useState<number>(40);

  // Filtros en Reservas, Calendario Estilo Google Calendar y Clientes
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [calendarDate, setCalendarDate] = useState<string>(todayIso);
  const [calendarViewMode, setCalendarViewMode] = useState<
    'week' | 'day' | 'month' | 'agenda'
  >('week');
  const [calendarSearch, setCalendarSearch] = useState<string>('');
  const [hiddenSpecIds, setHiddenSpecIds] = useState<string[]>([]);
  const [selectedCalAppt, setSelectedCalAppt] = useState<Appointment | null>(
    null
  );
  const [reservationFilter, setReservationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clientSearch, setClientSearch] = useState<string>('');

  // =========================================================================
  // ESTADO DEL TERMINAL POS (NOTAS DE RESERVA Y NOTAS DE CONCLUSIÓN)
  // =========================================================================
  const [posLinkedApptId, setPosLinkedApptId] = useState<string>('');
  const [posNoteType, setPosNoteType] = useState<PosNoteType>('nota_conclusion');
  const [posPatientName, setPosPatientName] = useState<string>('');
  const [posPatientPhone, setPosPatientPhone] = useState<string>('+5917');
  const [posPatientDni, setPosPatientDni] = useState<string>('');
  const [posSpecialistName, setPosSpecialistName] = useState<string>('');
  const [posItems, setPosItems] = useState<PosLineItem[]>([]);
  const [posDepositDeducted, setPosDepositDeducted] = useState<number>(0);
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<
    'cash' | 'qr_transfer' | 'card'
  >('qr_transfer');
  const [posPaymentRef, setPosPaymentRef] = useState<string>('');
  const [posReservationNotes, setPosReservationNotes] = useState<string>('');
  const [posConclusionNotes, setPosConclusionNotes] = useState<string>('');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemPrice, setCustomItemPrice] = useState<number>(15);
  const [viewingPosReceipt, setViewingPosReceipt] =
    useState<PosServiceNote | null>(null);

  // Modales Rápidos
  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientClient | null>(null);

  // Estado Railway Backend & Logs
  const [railwayHealth, setRailwayHealth] = useState<RailwayHealthResponse | null>(
    null
  );
  const [waLogs, setWaLogs] = useState<WhatsAppLogItem[]>([]);
  const [runningCron, setRunningCron] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Formulario Nueva Cita Recepción
  const [newApptPatient, setNewApptPatient] = useState('');
  const [newApptPhone, setNewApptPhone] = useState('+5917');
  const [newApptServiceId, setNewApptServiceId] = useState('');
  const [newApptSpecId, setNewApptSpecId] = useState('');
  const [newApptDate, setNewApptDate] = useState(todayIso);
  const [newApptTime, setNewApptTime] = useState('10:00');
  const [newApptNotes, setNewApptNotes] = useState('');

  // Formulario Nuevo Cliente / Paciente
  const [patName, setPatName] = useState('');
  const [patPhone, setPatPhone] = useState('+5917');
  const [patEmail, setPatEmail] = useState('');
  const [patDni, setPatDni] = useState('');
  const [patNotes, setPatNotes] = useState('');
  const [patTag, setPatTag] = useState('Consulta General');

  // Formulario Nuevo Servicio
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState('General');
  const [srvDuration, setSrvDuration] = useState(45);
  const [srvPrice, setSrvPrice] = useState(40);
  const [srvDeposit, setSrvDeposit] = useState(15);

  // Formulario Nuevo Personal / Especialista
  const [specName, setSpecName] = useState('');
  const [specRole, setSpecRole] = useState('');
  const [specBio, setSpecBio] = useState('');
  const [specColor, setSpecColor] = useState('#0284c7');
  const [specStart, setSpecStart] = useState('09:00');
  const [specEnd, setSpecEnd] = useState('18:00');

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshData = () => {
    const current = db.getTenantById(selectedTenantId) || db.getTenants()[0];
    if (!current) return;
    setTenant(current);
    const appts = db.getAppointments(current.id);
    const srvs = db.getServices(current.id);
    const specs = db.getSpecialists(current.id);
    const pats = db.getPatients(current.id);
    const notes = db.getPosNotes(current.id);
    const exps = db.getExpenses(current.id);
    const sups = db.getSupplies(current.id);
    const mems = db.getMembers(current.id);
    const perms = db.getRolePermissions();
    const odos = db.getOdontograms(current.id);
    const evals = db.getEvaluations(current.id);
    const rxs = db.getPrescriptions(current.id);
    const plans = db.getTreatmentPlans(current.id);
    const imgs = db.getImagingStudies(current.id);
    const labs = db.getLabOrders(current.id);
    const tickets = db.getWaitingTickets(current.id);
    const recalls = db.getRecallCampaigns(current.id);
    setAppointments(appts);
    setServices(srvs);
    setSpecialists(specs);
    setPatients(pats);
    setPosNotes(notes);
    setExpenses(exps);
    setSupplies(sups);
    setMembers(mems);
    setRolePermissions(perms);
    setOdontograms(odos);
    setEvaluations(evals);
    setPrescriptions(rxs);
    setTreatmentPlans(plans);
    setImagingStudies(imgs);
    setLabOrders(labs);
    setWaitingTickets(tickets);
    setRecallCampaigns(recalls);
    if (!activeStudyId && imgs[0]) setActiveStudyId(imgs[0].id);
    if (!tpPatientName && pats[0]) {
      setTpPatientName(pats[0].name);
      setTpPatientPhone(pats[0].phone);
    }
    if (!labDueDate) setLabDueDate(todayIso);
    if (!rxSpecialistName && specs[0]) setRxSpecialistName(specs[0].name);
    if (!rxPatientName && pats[0]) {
      setRxPatientName(pats[0].name);
      setRxPatientPhone(pats[0].phone);
      setRxPatientDni(pats[0].dni || '');
    }
    if (!selectedOdoPatientId && pats[0]) {
      const firstPat = pats[0];
      setSelectedOdoPatientId(firstPat.id);
      const foundOdo = odos.find((o) => o.patient_id === firstPat.id);
      setCurrentTeethMap(foundOdo ? foundOdo.teeth : {});
      setOdoDiagnosis(
        foundOdo?.general_diagnosis ||
          firstPat.clinical_notes ||
          'Evaluación odontológica integral.'
      );
      const foundEval = evals.find((ev) => ev.patient_id === firstPat.id);
      if (foundEval) {
        setVitalSigns(foundEval.vital_signs);
        setBodyZonesMap(foundEval.body_zones);
        setEvalDiagnosis(foundEval.functional_diagnosis);
      }
    }
    if (!newApptServiceId && srvs[0]) setNewApptServiceId(srvs[0].id);
    if (!newApptSpecId && specs[0]) setNewApptSpecId(specs[0].id);
    if (!posSpecialistName && specs[0]) setPosSpecialistName(specs[0].name);
  };

  const refreshRailway = async () => {
    const [health, logs] = await Promise.all([
      checkRailwayHealth(),
      fetchWhatsAppLogs()
    ]);
    setRailwayHealth(health);
    setWaLogs(logs);
  };

  useEffect(() => {
    refreshData();
  }, [selectedTenantId]);

  useEffect(() => {
    refreshRailway();
  }, []);

  if (!tenant) return null;

  const handleSelectTenant = (id: string) => {
    setSelectedTenantId(id);
    setSearchParams({ tenant: id });
  };

  // =========================================================================
  // FUNCIONES DEL POS (CARGAR CITA, AGREGAR SERVICIO, EMITIR NOTA)
  // =========================================================================
  const loadAppointmentIntoPos = (
    appt: Appointment,
    mode: PosNoteType = 'nota_conclusion'
  ) => {
    const srv = services.find((s) => s.id === appt.service_id);
    const spec = specialists.find((s) => s.id === appt.specialist_id);

    setPosLinkedApptId(appt.id);
    setPosNoteType(mode);
    setPosPatientName(appt.patient_name);
    setPosPatientPhone(appt.patient_phone);
    setPosPatientDni(appt.patient_dni || '');
    setPosSpecialistName(spec?.name || specialists[0]?.name || 'Especialista');
    setPosReservationNotes(
      appt.notes ||
        `Cita reservada para el ${appt.appointment_date} a las ${appt.start_time}.`
    );
    setPosConclusionNotes(
      appt.conclusion_notes ||
        (mode === 'nota_conclusion'
          ? `Servicio de ${srv?.name || 'consulta'} concluido satisfactoriamente en consultorio.`
          : 'Pendiente de realización en consultorio.')
    );

    if (srv) {
      setPosItems([
        {
          id: `item-${Date.now()}`,
          service_id: srv.id,
          name: srv.name,
          category: srv.category,
          qty: 1,
          unit_price: mode === 'nota_reserva' ? srv.deposit_amount : srv.price,
          subtotal: mode === 'nota_reserva' ? srv.deposit_amount : srv.price
        }
      ]);
    }

    setPosDepositDeducted(mode === 'nota_conclusion' ? appt.amount_paid : 0);
    setPosDiscount(0);
    setPosPaymentRef(appt.payment_reference || '');
    setActiveSection('pos');
    notify(`Cita de ${appt.patient_name} cargada en el Terminal POS`);
  };

  const addServiceToPos = (srv: ClinicService) => {
    setPosItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.service_id === srv.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const nextQty = item.qty + 1;
        updated[existingIdx] = {
          ...item,
          qty: nextQty,
          subtotal: nextQty * item.unit_price
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `pos-item-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          service_id: srv.id,
          name: srv.name,
          category: srv.category,
          qty: 1,
          unit_price: srv.price,
          subtotal: srv.price
        }
      ];
    });
  };

  const addCustomItemToPos = () => {
    if (!customItemName.trim() || customItemPrice <= 0) return;
    setPosItems((prev) => [
      ...prev,
      {
        id: `pos-custom-${Date.now()}`,
        name: customItemName.trim(),
        category: 'Adicional / Insumo',
        qty: 1,
        unit_price: Number(customItemPrice),
        subtotal: Number(customItemPrice)
      }
    ]);
    setCustomItemName('');
  };

  const updatePosItemQty = (itemId: string, delta: number) => {
    setPosItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          return {
            ...item,
            qty: nextQty,
            subtotal: nextQty * item.unit_price
          };
        })
        .filter(Boolean) as PosLineItem[]
    );
  };

  const removePosItem = (itemId: string) => {
    setPosItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const posSubtotal = useMemo(
    () => posItems.reduce((acc, item) => acc + item.subtotal, 0),
    [posItems]
  );

  const posNetTotal = useMemo(
    () => Math.max(0, posSubtotal - posDepositDeducted - posDiscount),
    [posSubtotal, posDepositDeducted, posDiscount]
  );

  const handleEmitPosNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posPatientName.trim() || posItems.length === 0) {
      notify('Agrega al menos un servicio y el nombre del paciente en el POS');
      return;
    }

    const createdNote = db.createPosNote({
      tenant_id: tenant.id,
      appointment_id: posLinkedApptId || undefined,
      note_type: posNoteType,
      patient_name: posPatientName.trim(),
      patient_phone: posPatientPhone.trim(),
      patient_dni: posPatientDni.trim() || undefined,
      specialist_name: posSpecialistName || specialists[0]?.name || 'Especialista',
      items: posItems,
      subtotal: posSubtotal,
      deposit_deducted: posDepositDeducted,
      discount: posDiscount,
      total_paid: posNetTotal,
      payment_method: posPaymentMethod,
      payment_reference:
        posPaymentRef.trim() || `POS-${Date.now().toString().slice(-5)}`,
      reservation_notes:
        posReservationNotes.trim() || 'Sin notas previas de reserva.',
      conclusion_notes:
        posConclusionNotes.trim() ||
        'Servicio concluido de acuerdo a protocolo clínico.'
    });

    // Enviar notificación vía Railway de comprobante emitido
    await sendWhatsAppViaRailway({
      to: createdNote.patient_phone,
      patientName: createdNote.patient_name,
      clinicName: tenant.name,
      serviceName: createdNote.items.map((i) => `${i.qty}x ${i.name}`).join(', '),
      specialistName: createdNote.specialist_name,
      date: todayIso,
      time: new Date().toLocaleTimeString().slice(0, 5),
      type: 'confirmation'
    });

    refreshData();
    await refreshRailway();
    setViewingPosReceipt(createdNote);

    // Limpiar carrito para siguiente cobro
    setPosLinkedApptId('');
    setPosPatientName('');
    setPosPatientDni('');
    setPosItems([]);
    setPosDepositDeducted(0);
    setPosDiscount(0);
    setPosPaymentRef('');
    setPosReservationNotes('');
    setPosConclusionNotes('');

    notify(
      `${
        createdNote.note_type === 'nota_conclusion'
          ? 'Nota de Conclusión de Servicio'
          : 'Nota de Reserva'
      } (${createdNote.folio_number}) emitida con éxito`
    );
  };

  // =========================================================================
  // OTRAS ACCIONES DE GESTIÓN
  // =========================================================================
  const handleStatusChange = (apptId: string, status: AppointmentStatus) => {
    db.updateAppointment(apptId, { status });
    refreshData();
    notify(`Estado de reserva actualizado a: ${status.toUpperCase()}`);
  };

  const handleSendManualReminder = async (appt: Appointment) => {
    const srv = services.find((s) => s.id === appt.service_id);
    const spec = specialists.find((s) => s.id === appt.specialist_id);

    await sendWhatsAppViaRailway({
      to: appt.patient_phone,
      patientName: appt.patient_name,
      clinicName: tenant.name,
      serviceName: srv?.name || 'Consulta Clínica',
      specialistName: spec?.name || 'Especialista',
      date: appt.appointment_date,
      time: appt.start_time,
      type: 'reminder_24h'
    });

    db.updateAppointment(appt.id, { reminder_24h_sent: true });
    refreshData();
    await refreshRailway();
    notify(`Recordatorio WhatsApp enviado a ${appt.patient_name} vía Railway`);
  };

  const handleRunCronNow = async () => {
    setRunningCron(true);
    await triggerRailwayCronNow();
    await refreshRailway();
    setRunningCron(false);
    notify('Worker Cron 24h/2h ejecutado en Railway correctamente');
  };

  const handleCreateQuickAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptPatient.trim() || !newApptServiceId || !newApptSpecId) return;
    const srv = services.find((s) => s.id === newApptServiceId);
    const [h, m] = newApptTime.split(':').map(Number);
    const endMin = h * 60 + m + (srv?.duration_min || 45);
    const endTime = `${Math.floor(endMin / 60)
      .toString()
      .padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;

    db.createAppointment({
      tenant_id: tenant.id,
      service_id: newApptServiceId,
      specialist_id: newApptSpecId,
      patient_name: newApptPatient.trim(),
      patient_phone: newApptPhone.trim(),
      appointment_date: newApptDate,
      start_time: newApptTime,
      end_time: endTime,
      status: 'confirmed',
      payment_status: 'deposit_paid',
      payment_method: 'cash_at_clinic',
      amount_paid: srv?.deposit_amount || 10,
      notes: newApptNotes.trim() || 'Creada desde recepción PEPEMEDIC'
    });

    setNewApptPatient('');
    setNewApptNotes('');
    setShowNewApptModal(false);
    refreshData();
    notify('Reserva creada en agenda y paciente sincronizado');
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName.trim()) return;
    db.createPatient({
      tenant_id: tenant.id,
      name: patName.trim(),
      phone: patPhone.trim(),
      email: patEmail.trim() || undefined,
      dni: patDni.trim() || undefined,
      clinical_notes: patNotes.trim() || 'Sin observaciones médicas registradas.',
      tags: [patTag]
    });
    setPatName('');
    setPatEmail('');
    setPatDni('');
    setPatNotes('');
    setShowNewPatientModal(false);
    refreshData();
    notify('Expediente de cliente/paciente creado con éxito');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) return;
    db.createService({
      tenant_id: tenant.id,
      name: srvName.trim(),
      category: srvCategory,
      description: 'Tratamiento clínico especializado.',
      duration_min: Number(srvDuration),
      price: Number(srvPrice),
      deposit_amount: Number(srvDeposit),
      active: true
    });
    setSrvName('');
    refreshData();
    notify('Nuevo tratamiento agregado al catálogo');
  };

  const handleCreateSpecialist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim() || !specRole.trim()) return;
    db.createSpecialist({
      tenant_id: tenant.id,
      name: specName.trim(),
      role_title: specRole.trim(),
      bio: specBio.trim() || 'Especialista certificado del consultorio.',
      color_tag: specColor,
      active: true,
      work_days: [1, 2, 3, 4, 5, 6],
      start_time: specStart,
      end_time: specEnd
    });
    setSpecName('');
    setSpecRole('');
    setSpecBio('');
    refreshData();
    notify('Especialista incorporado al equipo de PEPEMEDIC');
  };

  const shiftCalendarDate = (days: number) => {
    const d = new Date(calendarDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setCalendarDate(d.toISOString().split('T')[0]);
  };

  // Helpers para el Calendario estilo Google Calendar (Día / Semana / Mes / Agenda)
  const shiftGoogleCalendar = (direction: -1 | 1) => {
    const d = new Date(calendarDate + 'T12:00:00');
    if (calendarViewMode === 'day') {
      d.setDate(d.getDate() + direction);
    } else if (calendarViewMode === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setCalendarDate(d.toISOString().split('T')[0]);
  };

  const toggleCalendarSpecFilter = (specId: string) => {
    setHiddenSpecIds((prev) =>
      prev.includes(specId)
        ? prev.filter((id) => id !== specId)
        : [...prev, specId]
    );
  };

  const activeSpecialistsForCalendar = specialists.filter(
    (s) => !hiddenSpecIds.includes(s.id)
  );

  // 7 días de la semana (Lunes a Domingo) de la fecha seleccionada
  const googleWeekDays = (() => {
    const base = new Date(calendarDate + 'T12:00:00');
    const dayOfWeek = base.getDay(); // 0 Dom .. 6 Sab
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);
    const shortNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    return Array.from({ length: 7 }, (_, idx) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + idx);
      const iso = dt.toISOString().split('T')[0];
      return {
        iso,
        dayNumber: dt.getDate(),
        shortLabel: shortNames[idx],
        monthShort: dt
          .toLocaleDateString('es-ES', { month: 'short' })
          .replace('.', ''),
        isToday: iso === todayIso,
        isSelected: iso === calendarDate
      };
    });
  })();

  // Celdas del mes (35/42 celdas Lunes a Domingo) para el Mini-Calendario y Vista Mes
  const googleMonthGrid = (() => {
    const base = new Date(calendarDate + 'T12:00:00');
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1, 12, 0, 0);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const gridStart = new Date(year, month, 1 - startOffset, 12, 0, 0);
    return Array.from({ length: 35 }, (_, idx) => {
      const dt = new Date(gridStart);
      dt.setDate(gridStart.getDate() + idx);
      const iso = dt.toISOString().split('T')[0];
      return {
        iso,
        dayNum: dt.getDate(),
        inCurrentMonth: dt.getMonth() === month,
        isToday: iso === todayIso,
        isSelected: iso === calendarDate
      };
    });
  })();

  const googleCalendarTitle = (() => {
    const d = new Date(calendarDate + 'T12:00:00');
    const raw = d.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  // Métricas Calculadas
  const totalPosRevenue = posNotes.reduce((acc, n) => acc + n.total_paid, 0);
  const totalCollected =
    appointments.reduce((acc, a) => acc + a.amount_paid, 0) + totalPosRevenue;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalCollected - totalExpenses;

  // Cuentas por cobrar (saldos pendientes en citas activas no pagadas al 100%)
  const accountsReceivable = appointments
    .filter((a) => a.status !== 'cancelled' && a.payment_status !== 'paid')
    .reduce((acc, a) => {
      const srv = services.find((s) => s.id === a.service_id);
      const fullPrice = srv?.price || 0;
      return acc + Math.max(0, fullPrice - a.amount_paid);
    }, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription.trim() || expAmount <= 0) return;
    db.createExpense({
      tenant_id: tenant.id,
      category: expCategory,
      description: expDescription.trim(),
      amount: Number(expAmount),
      payment_method: expMethod,
      expense_date: todayIso
    });
    setExpDescription('');
    refreshData();
    notify('Egreso / Gasto registrado en el libro de finanzas');
  };

  const handlePaySpecialistCommission = (
    specNameStr: string,
    commissionAmount: number
  ) => {
    if (commissionAmount <= 0) return;
    db.createExpense({
      tenant_id: tenant.id,
      category: 'comision_especialista',
      description: `Liquidación de comisión médica (${commissionRate}%) — ${specNameStr}`,
      amount: Math.round(commissionAmount),
      payment_method: 'qr_transfer',
      specialist_name: specNameStr,
      expense_date: todayIso
    });
    refreshData();
    notify(`Comisión de $${Math.round(commissionAmount)} pagada a ${specNameStr}`);
  };

  const handleExportFinanceCsv = () => {
    const rows = [
      ['Tipo', 'Fecha', 'Concepto / Folio', 'Responsable / Paciente', 'Metodo', 'Monto ($)']
    ];
    posNotes.forEach((n) => {
      rows.push([
        n.note_type === 'nota_conclusion' ? 'INGRESO POS CONCLUSION' : 'INGRESO RESERVA',
        n.created_at.split('T')[0],
        n.folio_number,
        n.patient_name,
        n.payment_method,
        String(n.total_paid)
      ]);
    });
    expenses.forEach((e) => {
      rows.push([
        `EGRESO (${e.category.toUpperCase()})`,
        e.expense_date,
        e.description,
        e.specialist_name || 'Administración',
        e.payment_method,
        `-${e.amount}`
      ]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PEPEMEDIC_Reporte_Finanzas_${tenant.slug}_${todayIso}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Reporte financiero exportado en formato CSV (Excel)');
  };
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const todayAppointments = appointments.filter(
    (a) => a.appointment_date === todayIso
  );

  const filteredReservations = appointments.filter((a) => {
    const matchesStatus =
      reservationFilter === 'all' || a.status === reservationFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patient_phone.includes(searchQuery) ||
      (a.payment_reference || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredPatients = patients.filter(
    (p) =>
      !clientSearch.trim() ||
      p.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      p.phone.includes(clientSearch) ||
      (p.dni || '').includes(clientSearch)
  );

  const handleCreateSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    db.createSupply({
      tenant_id: tenant.id,
      name: supName.trim(),
      sku: supSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category: supCategory,
      current_stock: Number(supStock),
      min_stock: Number(supMinStock),
      unit: supUnit,
      unit_cost: Number(supCost),
      supplier: supSupplier.trim() || 'Proveedor Clínico'
    });
    setSupName('');
    setSupSku('');
    setSupSupplier('');
    refreshData();
    notify('Insumo clínico incorporado al inventario');
  };

  const handleAdjustStock = (
    supId: string,
    delta: number,
    recordAsExpense = false
  ) => {
    db.adjustSupplyStock(supId, delta, recordAsExpense);
    refreshData();
    notify(
      delta > 0
        ? `Stock repuesto (+${delta})${recordAsExpense ? ' y compra asentada en Finanzas' : ''}`
        : `Consumo clínico registrado (${delta})`
    );
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memEmail.trim()) return;
    db.createMember({
      tenant_id: tenant.id,
      name: memName.trim(),
      email: memEmail.trim(),
      role: memRole,
      active: true
    });
    setMemName('');
    setMemEmail('');
    refreshData();
    notify(`Usuario creado con el rol: ${memRole.toUpperCase()}`);
  };

  const handleSaasNameChange = (val: string) => {
    setSaasClientName(val);
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSaasClientSlug(autoSlug);
  };

  const handleCreateSaasClientClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saasClientName.trim() || !saasClientSlug.trim()) return;
    const preset = SPECIALTY_CATALOG[saasSpecialty];

    const created = db.createTenant({
      name: saasClientName.trim(),
      slug: saasClientSlug.trim(),
      specialty: saasSpecialty,
      description: preset.description,
      address: saasAddress.trim() || 'Av. Principal #100',
      phone: `+${saasWhatsapp.replace(/[^0-9]/g, '')}`,
      whatsapp_number: saasWhatsapp.replace(/[^0-9]/g, ''),
      theme_color: preset.defaultColor,
      requires_deposit: true,
      deposit_percentage: 30,
      payment_instructions: 'Pago por QR Simple o transferencia bancaria.',
      plan: saasPlan
    });

    setSaasClientName('');
    setSaasClientSlug('');
    setSaasAddress('');
    setSelectedTenantId(created.id);
    setSearchParams({ tenant: created.id });
    refreshData();
    notify(
      `Clínica "${created.name}" creada con plantilla de ${preset.label}`
    );
  };

  const handleSwitchClinicSpecialty = (spec: SpecialtyType) => {
    db.changeTenantSpecialty(tenant.id, spec, true);
    refreshData();
    notify(
      `Área actualizada a ${SPECIALTY_CATALOG[spec].label} (servicios e insumos cargados)`
    );
  };

  // Funciones del Odontograma Clínico
  const handleSelectOdoPatient = (patId: string) => {
    setSelectedOdoPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    const foundOdo = odontograms.find((o) => o.patient_id === patId);
    setCurrentTeethMap(foundOdo ? foundOdo.teeth : {});
    setOdoDiagnosis(
      foundOdo?.general_diagnosis ||
        pat?.clinical_notes ||
        'Evaluación odontológica integral.'
    );
  };

  const handleToothClick = (toothNum: number) => {
    const tool = TOOTH_TOOLKIT.find((t) => t.id === activeToothTool);
    if (!tool) return;

    setCurrentTeethMap((prev) => {
      const next = { ...prev };
      if (activeToothTool === 'sano') {
        delete next[toothNum];
      } else {
        next[toothNum] = {
          toothNumber: toothNum,
          condition: activeToothTool,
          procedureName: `${tool.procedure} (Pieza ${toothNum})`,
          estimatedCost: tool.cost
        };
      }
      return next;
    });
  };

  const handleSaveOdontogram = () => {
    const pat = patients.find((p) => p.id === selectedOdoPatientId);
    if (!pat) return;

    db.saveOdontogram({
      id: `odo-${pat.id}`,
      tenant_id: tenant.id,
      patient_id: pat.id,
      patient_name: pat.name,
      specialist_name: specialists[0]?.name || 'Odontólogo Titular',
      teeth: currentTeethMap,
      general_diagnosis: odoDiagnosis,
      updated_at: todayIso
    });

    db.updatePatient(pat.id, {
      clinical_notes: `[Odontograma Actualizado]: ${odoDiagnosis}`
    });

    refreshData();
    notify(`Odontograma de ${pat.name} guardado en su expediente clínico`);
  };

  const handleSendOdontogramToPos = () => {
    const pat = patients.find((p) => p.id === selectedOdoPatientId);
    const entries = Object.values(currentTeethMap);
    if (!pat || entries.length === 0) {
      notify('Marca al menos una pieza dental con tratamiento para enviar al POS');
      return;
    }

    handleSaveOdontogram();

    setPosLinkedApptId('');
    setPosNoteType('nota_conclusion');
    setPosPatientName(pat.name);
    setPosPatientPhone(pat.phone);
    setPosPatientDni(pat.dni || '');
    setPosSpecialistName(specialists[0]?.name || 'Odontólogo Titular');
    setPosReservationNotes(
      `Plan de Tratamiento desde Odontograma Digital (${entries.length} piezas dentales).`
    );
    setPosConclusionNotes(
      `${odoDiagnosis} — Piezas intervenidas: ${entries
        .map((e) => `#${e.toothNumber} (${e.condition})`)
        .join(', ')}.`
    );
    setPosItems(
      entries.map((e) => ({
        id: `odo-pos-${e.toothNumber}`,
        name: e.procedureName,
        category: 'Odontograma',
        qty: 1,
        unit_price: e.estimatedCost,
        subtotal: e.estimatedCost
      }))
    );
    setPosDepositDeducted(0);
    setPosDiscount(0);
    setActiveSection('pos');
    notify(
      `Presupuesto Dental de ${entries.length} pieza(s) cargado en la Caja POS`
    );
  };

  // Funciones de Evaluación Especialista (Mapa Corporal EVA + Signos Vitales)
  const handleSelectEvalPatient = (patId: string) => {
    setSelectedOdoPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    const foundEval = evaluations.find((ev) => ev.patient_id === patId);
    if (foundEval) {
      setVitalSigns(foundEval.vital_signs);
      setBodyZonesMap(foundEval.body_zones);
      setEvalDiagnosis(foundEval.functional_diagnosis);
    } else {
      setBodyZonesMap({});
      setEvalDiagnosis(
        pat?.clinical_notes || 'Evaluación funcional y signos vitales.'
      );
    }
  };

  const handleToggleBodyZone = (zone: (typeof BODY_ZONES_CATALOG)[0]) => {
    setBodyZonesMap((prev) => {
      const copy = { ...prev };
      if (copy[zone.id]) {
        delete copy[zone.id];
      } else {
        copy[zone.id] = {
          zoneId: zone.id,
          zoneLabel: zone.label,
          evaPain: selectedEvaScale,
          mobilityRom: selectedRom,
          therapyAssigned: zone.defaultTherapy,
          sessionCost: zone.defaultCost
        };
      }
      return copy;
    });
  };

  const handleSaveEvaluation = () => {
    const pat = patients.find((p) => p.id === selectedOdoPatientId);
    if (!pat) return;
    db.saveEvaluation({
      id: `eval-${pat.id}`,
      tenant_id: tenant.id,
      patient_id: pat.id,
      patient_name: pat.name,
      specialist_name: specialists[0]?.name || 'Especialista Titular',
      vital_signs: vitalSigns,
      body_zones: bodyZonesMap,
      functional_diagnosis: evalDiagnosis,
      created_at: todayIso
    });
    db.updatePatient(pat.id, {
      clinical_notes: `[Evaluación Especialista - PA ${vitalSigns.bloodPressure}]: ${evalDiagnosis}`
    });
    refreshData();
    notify(`Evaluación clínica y signos vitales de ${pat.name} guardados`);
  };

  const handleSendEvalToPos = () => {
    const pat = patients.find((p) => p.id === selectedOdoPatientId);
    const zones = Object.values(bodyZonesMap);
    if (!pat || zones.length === 0) {
      notify('Selecciona al menos una zona corporal/terapia para enviar al POS');
      return;
    }
    handleSaveEvaluation();
    setPosLinkedApptId('');
    setPosNoteType('nota_conclusion');
    setPosPatientName(pat.name);
    setPosPatientPhone(pat.phone);
    setPosPatientDni(pat.dni || '');
    setPosSpecialistName(specialists[0]?.name || 'Especialista');
    setPosReservationNotes(
      `Evaluación Funcional Especialista (PA: ${vitalSigns.bloodPressure}, FC: ${vitalSigns.heartRate} bpm).`
    );
    setPosConclusionNotes(
      `${evalDiagnosis} — Zonas tratadas: ${zones
        .map((z) => `${z.zoneLabel} (EVA ${z.evaPain}/10)`)
        .join(', ')}.`
    );
    setPosItems(
      zones.map((z) => ({
        id: `eval-pos-${z.zoneId}`,
        name: `${z.therapyAssigned} (${z.zoneLabel})`,
        category: 'Terapia Especializada',
        qty: 1,
        unit_price: z.sessionCost,
        subtotal: z.sessionCost
      }))
    );
    setPosDepositDeducted(0);
    setPosDiscount(0);
    setActiveSection('pos');
    notify(
      `Plan de Rehabilitación/Terapia (${zones.length} zonas) cargado en Caja POS`
    );
  };

  // Funciones de Recetario Médico, Órdenes de Estudio y Consentimientos
  const handleAddRxItem = () => {
    if (!rxNewTitle.trim()) return;
    setRxItems((prev) => [
      ...prev,
      {
        id: `rxi-${Date.now()}`,
        title: rxNewTitle.trim(),
        dosageOrSpec:
          rxNewDosage.trim() || 'Seguir indicación médica estricta.'
      }
    ]);
    setRxNewTitle('');
    setRxNewDosage('');
  };

  const handleLoadRxTemplate = (presetType: 'dental_postop' | 'rx_3d' | 'fisio_analgesia' | 'consentimiento_quirurgico') => {
    if (presetType === 'dental_postop') {
      setRxDocType('receta');
      setRxDiagnosis('Protocolo analgésico y antibiótico post-procedimiento odontológico.');
      setRxItems([
        {
          id: 't1',
          title: 'Amoxicilina 500 mg (Cápsulas)',
          dosageOrSpec: 'Tomar 1 cápsula cada 8 horas durante 7 días completos.'
        },
        {
          id: 't2',
          title: 'Ketorolaco 20 mg Sublingual / Ibuprofeno 600 mg',
          dosageOrSpec: 'Tomar 1 comprimido cada 8 horas por 3 días en caso de dolor.'
        },
        {
          id: 't3',
          title: 'Colutorio Clorhexidina Digluconato 0.12%',
          dosageOrSpec: 'Enjuagar suavemente 15 ml cada 12 horas por 5 días.'
        }
      ]);
      setRxIndications('Dieta blanda fría o tibia por 24h. No escupir con fuerza ni usar sorbete.');
    } else if (presetType === 'rx_3d') {
      setRxDocType('orden_estudio');
      setRxDiagnosis('Estudio radiográfico y tomográfico de diagnóstico clínico.');
      setRxItems([
        {
          id: 't4',
          title: 'Radiografía Panorámica Digital (Ortopantomografía)',
          dosageOrSpec: 'Proyección maxilomandibular general con informe.'
        },
        {
          id: 't5',
          title: 'Tomografía Computarizada Cone Beam 3D (CBCT)',
          dosageOrSpec: 'Cortes axiales y coronales milimétricos para planificación.'
        }
      ]);
      setRxIndications('Enviar imágenes DICOM / PDF al WhatsApp del consultorio.');
    } else if (presetType === 'fisio_analgesia') {
      setRxDocType('orden_estudio');
      setRxDiagnosis('Evaluación funcional osteomuscular y control kinésico.');
      setRxItems([
        {
          id: 't6',
          title: 'Ecografía Musculoesquelética de Partes Blandas',
          dosageOrSpec: 'Evaluación comparativa de fibras tendinosas y musculares.'
        },
        {
          id: 't7',
          title: 'Protocolo Domiciliario Crioterapia + Estiramientos',
          dosageOrSpec: 'Aplicar hielo local 15 min cada 8 horas y ejercicios guiados.'
        }
      ]);
      setRxIndications('Suspender carga deportiva de impacto hasta próxima sesión.');
    } else if (presetType === 'consentimiento_quirurgico') {
      setRxDocType('consentimiento');
      setRxDiagnosis('Autorización y Consentimiento Informado de Procedimiento Clínico.');
      setRxItems([
        {
          id: 't8',
          title: 'Declaración de Información Clínica y Alternativas',
          dosageOrSpec: 'El paciente declara haber sido informado sobre el alcance, beneficios y cuidados del tratamiento.'
        },
        {
          id: 't9',
          title: 'Autorización de Procedimiento por Especialista',
          dosageOrSpec: 'Se autoriza al profesional tratante la realización del acto clínico programado.'
        }
      ]);
      setRxIndications('Firmado en conformidad por el paciente y el especialista responsable.');
    }
    notify('Plantilla clínica cargada en el editor');
  };

  const handleEmitPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxPatientName.trim() || rxItems.length === 0) return;
    const specObj = specialists.find((s) => s.name === rxSpecialistName);
    const created = db.createPrescription({
      tenant_id: tenant.id,
      doc_type: rxDocType,
      patient_name: rxPatientName.trim(),
      patient_phone: rxPatientPhone.trim(),
      patient_dni: rxPatientDni.trim() || undefined,
      specialist_name: rxSpecialistName || specialists[0]?.name || 'Especialista',
      specialist_role: specObj?.role_title || 'Especialista Clínico Certificado',
      diagnosis: rxDiagnosis.trim() || 'Diagnóstico clínico reservado.',
      items: rxItems,
      indications: rxIndications.trim()
    });
    refreshData();
    setViewingPrescription(created);
    notify(`Documento clínico ${created.folio} emitido correctamente`);
  };

  // =========================================================================
  // HANDLERS DE LOS 5 NUEVOS MÓDULOS AVANZADOS
  // =========================================================================
  const handleCreateTreatmentPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tpPatientName.trim() || !tpTitle.trim()) return;
    const installment = Math.round(
      Number(tpTotalBudget) / Math.max(1, Number(tpTotalSessions))
    );
    db.createTreatmentPlan({
      tenant_id: tenant.id,
      patient_name: tpPatientName.trim(),
      patient_phone: tpPatientPhone.trim(),
      specialist_name: specialists[0]?.name || 'Especialista Titular',
      plan_title: tpTitle.trim(),
      category: tpCategory,
      total_sessions: Number(tpTotalSessions),
      completed_sessions: 0,
      total_budget: Number(tpTotalBudget),
      amount_paid: 0,
      installment_price: installment,
      next_session_date: todayIso,
      status: 'activo',
      clinical_evolution:
        tpEvolution.trim() || 'Plan de sesiones aperturado en consultorio.'
    });
    setTpTitle('');
    setTpEvolution('');
    refreshData();
    notify('Plan de Tratamiento por Sesiones y Cuotas registrado');
  };

  const handleAdvancePlanAndSendToPos = (plan: TreatmentPlanPackage) => {
    const nextSessionNum = Math.min(
      plan.total_sessions,
      plan.completed_sessions + 1
    );
    db.advanceTreatmentPlanSession(plan.id, plan.installment_price);
    refreshData();

    setPosLinkedApptId('');
    setPosNoteType('nota_conclusion');
    setPosPatientName(plan.patient_name);
    setPosPatientPhone(plan.patient_phone);
    setPosPatientDni('');
    setPosSpecialistName(plan.specialist_name);
    setPosReservationNotes(
      `Plan por Sesiones: ${plan.plan_title} (Sesión ${nextSessionNum}/${plan.total_sessions}).`
    );
    setPosConclusionNotes(
      `Sesión #${nextSessionNum} de ${plan.total_sessions} realizada satisfactoriamente. Evolución: ${plan.clinical_evolution}`
    );
    setPosItems([
      {
        id: `plan-pos-${plan.id}-${nextSessionNum}`,
        name: `Cuota / Sesión #${nextSessionNum} — ${plan.plan_title}`,
        category: 'Plan por Sesiones',
        qty: 1,
        unit_price: plan.installment_price,
        subtotal: plan.installment_price
      }
    ]);
    setPosDepositDeducted(0);
    setPosDiscount(0);
    setActiveSection('pos');
    notify(
      `Sesión ${nextSessionNum}/${plan.total_sessions} avanzada y cuota de $${plan.installment_price} cargada en Caja POS`
    );
  };

  const handleCreateImagingStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgTitle.trim()) return;
    const created = db.createImagingStudy({
      tenant_id: tenant.id,
      patient_name: tpPatientName || patients[0]?.name || 'Paciente Clínico',
      patient_phone: tpPatientPhone || patients[0]?.phone || '+59170000000',
      specialist_name: specialists[0]?.name || 'Especialista Titular',
      study_type: imgType,
      title: imgTitle.trim(),
      zone_or_tooth: imgZone.trim(),
      findings_notes:
        imgFindings.trim() ||
        'Estudio radiográfico / fotográfico registrado en ficha.',
      before_label: 'Estado Inicial Pre-Tratamiento',
      after_label: 'Evolución / Control Post-Tratamiento'
    });
    setImgTitle('');
    setImgFindings('');
    refreshData();
    setActiveStudyId(created.id);
    notify('Estudio radiográfico / comparativa Antes-Después guardado');
  };

  const handleCreateLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labWorkType.trim()) return;
    db.createLabOrder(
      {
        tenant_id: tenant.id,
        patient_name: tpPatientName || patients[0]?.name || 'Paciente',
        patient_phone: tpPatientPhone || patients[0]?.phone || '+59170000000',
        specialist_name: specialists[0]?.name || 'Especialista Titular',
        laboratory_name: labName.trim(),
        work_type: labWorkType.trim(),
        tooth_or_zone: labZone.trim(),
        shade_color: labShade.trim(),
        lab_cost: Number(labCost),
        patient_price: Number(labPatientPrice),
        due_date: labDueDate || todayIso,
        status: 'enviado_lab',
        notes: labNotes.trim() || 'Orden enviada a laboratorio externo.'
      },
      true
    );
    setLabNotes('');
    refreshData();
    notify(
      `Orden de laboratorio creada y costo ($${labCost}) asentado en Finanzas`
    );
  };

  const handleCreateWaitingTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wtPatientName.trim()) return;
    const nowTime = new Date().toTimeString().slice(0, 5);
    db.createWaitingTicket({
      tenant_id: tenant.id,
      patient_name: wtPatientName.trim(),
      specialist_name: specialists[0]?.name || 'Especialista de Turno',
      box_room: wtBoxRoom,
      service_name: wtServiceName,
      arrival_time: nowTime,
      status: 'en_espera',
      priority: wtPriority
    });
    setWtPatientName('');
    refreshData();
    notify('Paciente registrado en la Sala de Espera Digital (Turnero TV)');
  };

  const handleSendRecallWhatsApp = async (item: RecallCampaignItem) => {
    setSendingRecallId(item.id);
    await sendWhatsAppViaRailway({
      to: item.patient_phone,
      patientName: item.patient_name,
      clinicName: tenant.name,
      serviceName: `${item.recommended_service} (${item.promo_discount_pct}% OFF)`,
      specialistName: specialists[0]?.name || 'Equipo Clínico',
      date: todayIso,
      time: '10:00',
      type: 'reminder_24h'
    });
    db.updateRecallStatus(item.id, 'enviado_wa');
    await refreshRailway();
    refreshData();
    setSendingRecallId(null);
    notify(`Campaña Recall enviada a ${item.patient_name} vía Railway Bot`);
  };

  const handleCreateRecallCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recReason.trim()) return;
    const patNameTarget = tpPatientName || patients[0]?.name || 'Paciente';
    const patPhoneTarget =
      tpPatientPhone || patients[0]?.phone || '+59170000000';
    db.createRecallCampaign({
      tenant_id: tenant.id,
      patient_name: patNameTarget,
      patient_phone: patPhoneTarget,
      campaign_type: 'limpieza_semestral',
      reason_label: recReason.trim(),
      last_visit_date: todayIso,
      recommended_service: recService.trim(),
      promo_discount_pct: Number(recDiscount),
      message_template: `Hola ${patNameTarget} 👋, te escribimos de ${tenant.name}. Te recordamos tu ${recService.trim()} con un ${recDiscount}% de descuento especial reservando esta semana.`,
      status: 'pendiente'
    });
    refreshData();
    notify('Paciente agregado a la campaña de reactivación WhatsApp');
  };

  const lowStockCount = supplies.filter(
    (s) => s.current_stock <= s.min_stock
  ).length;
  const totalInventoryValue = supplies.reduce(
    (acc, s) => acc + s.current_stock * s.unit_cost,
    0
  );

  const activeRoleConfig = rolePermissions.find(
    (r) => r.role === simulatedRole
  );

  const allMenuItems: {
    id: AdminSection;
    label: string;
    badge?: string | number;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'saas',
      label: 'Especialidad & Clientes SaaS',
      badge: tenants.length,
      icon: Layers
    },
    {
      id: 'pos',
      label: 'Caja POS & Notas',
      badge: posNotes.length,
      icon: Receipt
    },
    {
      id: 'finanzas',
      label: 'Reportes y Finanzas',
      badge: `$${netProfit}`,
      icon: BarChart3
    },
    {
      id: 'calendario',
      label: 'Calendario',
      badge: todayAppointments.length,
      icon: CalendarDays
    },
    {
      id: 'reservas',
      label: 'Reservas',
      badge: appointments.length,
      icon: ClipboardList
    },
    {
      id: 'turnero',
      label: 'Sala de Espera (Turnero TV)',
      badge: waitingTickets.filter((w) => w.status !== 'atendido').length,
      icon: Tv
    },
    {
      id: 'clientes',
      label: 'Clientes / Pacientes',
      badge: patients.length,
      icon: Users
    },
    {
      id: 'odontograma',
      label: 'Odontograma Dental',
      badge: '32 Piezas',
      icon: Smile
    },
    {
      id: 'evaluacion',
      label: 'Evaluación & Mapa EVA',
      badge: 'Triaje',
      icon: HeartPulse
    },
    {
      id: 'recetario',
      label: 'Recetario & Órdenes',
      badge: prescriptions.length,
      icon: Pill
    },
    {
      id: 'planes',
      label: 'Planes Sesiones & Cuotas',
      badge: treatmentPlans.length,
      icon: Repeat
    },
    {
      id: 'imagenes',
      label: 'Galería Antes/Después & Rx',
      badge: imagingStudies.length,
      icon: ImageIcon
    },
    {
      id: 'laboratorio',
      label: 'Trabajos de Laboratorio',
      badge: labOrders.length,
      icon: FlaskConical
    },
    {
      id: 'campanas',
      label: 'Campañas Recall WhatsApp',
      badge: recallCampaigns.filter((r) => r.status === 'pendiente').length,
      icon: Megaphone
    },
    {
      id: 'personal',
      label: 'Personal Médico',
      badge: specialists.length,
      icon: UserCog
    },
    {
      id: 'servicios',
      label: 'Servicios y Aranceles',
      badge: services.length,
      icon: Stethoscope
    },
    {
      id: 'insumos',
      label: 'Inventario de Insumos',
      badge: lowStockCount > 0 ? `${lowStockCount} alerta` : supplies.length,
      icon: Package
    },
    {
      id: 'roles',
      label: 'Usuarios y Roles',
      badge: members.length,
      icon: Shield
    },
    {
      id: 'railway',
      label: 'Railway & Pagos',
      badge: 'Bot',
      icon: Server
    }
  ];

  const menuItems = allMenuItems.filter(
    (item) =>
      !activeRoleConfig ||
      activeRoleConfig.allowed_modules.includes(item.id) ||
      item.id === 'roles' ||
      item.id === 'saas'
  );

  const handleNavClick = (section: AdminSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Toast Flotante */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* OVERLAY DRAWER MÓVIL */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR IZQUIERDO (COLAPSABLE EN DESKTOP + DRAWER EN MÓVIL) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-950 text-slate-200 flex flex-col border-r border-slate-800 transition-all duration-300 ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Cabecera del Sidebar con Logo PEPEMEDIC */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center text-white font-extrabold shadow-md shadow-sky-500/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight text-white leading-none">
                  PEPE<span className="text-sky-400">MEDIC</span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Clinical Suite POS
                </span>
              </div>
            </Link>
          )}

          {sidebarCollapsed && (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Sucursal / Clínica en el Sidebar */}
        {!sidebarCollapsed && (
          <div className="p-3.5 border-b border-slate-800/80">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Consultorio Activo (Tenant)
            </label>
            <select
              value={tenant.id}
              onChange={(e) => handleSelectTenant(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Menú de Ventanas Profesionales */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Módulos PEPEMEDIC
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Estado de Infraestructura en el Pie del Sidebar */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2 text-[11px]">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between text-slate-400">
                <span>Supabase RLS</span>
                <span className="text-emerald-400 font-semibold">● Activo</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Railway Worker</span>
                <span
                  className={`font-semibold ${
                    railwayHealth?.online ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  ● {railwayHealth?.online ? 'Online' : 'Simulación'}
                </span>
              </div>
              <Link
                to={`/c/${tenant.slug}`}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition"
              >
                <span>Abrir Portal Paciente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <Link
              to={`/c/${tenant.slug}`}
              title="Abrir Portal Paciente"
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL DERECHO */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR CON BOTÓN HAMBURGUESA A LA IZQUIERDA */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Botón Hamburguesa (Móvil abre drawer, Desktop colapsa/expande sidebar) */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(true);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Alternar menú lateral PEPEMEDIC"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 capitalize">
                  {menuItems.find((m) => m.id === activeSection)?.label}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {tenant.specialty}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {tenant.name} — URL Pública: <code className="text-sky-700">/c/{tenant.slug}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Selector de Simulación de Rol RBAC */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-500 font-medium">Vista Rol:</span>
              <select
                value={simulatedRole}
                onChange={(e) => {
                  const nextRole = e.target.value as StaffRoleType;
                  setSimulatedRole(nextRole);
                  notify(`Simulando permisos del rol: ${nextRole.toUpperCase()}`);
                }}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="owner">Dueño / Director</option>
                <option value="admin">Administrador</option>
                <option value="specialist">Especialista / Doctor</option>
                <option value="receptionist">Recepcionista POS</option>
                <option value="assistant">Asistente / Enfermería</option>
              </select>
            </div>

            <button
              onClick={() => setActiveSection('pos')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Caja POS</span>
            </button>

            <button
              onClick={() => setShowNewApptModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Reserva</span>
            </button>
          </div>
        </header>

        {/* ÁREA DE TRABAJO DINÁMICA SEGÚN LA VENTANA SELECCIONADA */}
        <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* =================================================================
              VENTANA 1: DASHBOARD EJECUTIVO
          ================================================================== */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Tarjetas KPI Superiores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Caja POS & Señas Cobradas
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      ${totalCollected}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{posNotes.length} notas POS emitidas</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Reservas Totales Activas
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {appointments.length}
                    </div>
                    <div className="text-[11px] text-sky-600 font-semibold mt-1">
                      {confirmedCount} confirmadas • {todayAppointments.length} para hoy
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Clientes / Pacientes
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {patients.length}
                    </div>
                    <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                      Expediente clínico digital activo
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Automatización Railway
                    </span>
                    <div className="text-lg font-extrabold text-slate-900 mt-1">
                      {waLogs.length} envíos WA
                    </div>
                    <div className="text-[11px] text-purple-600 font-semibold mt-1">
                      Recordatorios 24h y 2h activos
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Fila Central: Agenda de Hoy + Ocupación por Personal */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Agenda de Hoy */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Próximas Citas para Concluir / Cobrar en POS
                      </h2>
                      <p className="text-xs text-slate-500">
                        Pasa cualquier cita al POS con 1 clic para emitir su Nota de Conclusión o Nota de Reserva
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('pos')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      Ir al Terminal POS →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {appointments.slice(0, 4).map((appt) => {
                      const srv = services.find((s) => s.id === appt.service_id);
                      const spec = specialists.find(
                        (s) => s.id === appt.specialist_id
                      );
                      return (
                        <div
                          key={appt.id}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-center shrink-0">
                              <div>{appt.start_time}</div>
                              <div className="text-[9px] opacity-80">
                                {appt.appointment_date.slice(5)}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {appt.patient_name}
                              </div>
                              <div className="text-slate-600">
                                {srv?.name} (${srv?.price}) •{' '}
                                <span className="font-semibold text-sky-700">
                                  {spec?.name}
                                </span>
                              </div>
                              {appt.notes && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Nota Reserva: {appt.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                appt.payment_status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : appt.payment_status === 'deposit_paid'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {appt.payment_status === 'paid'
                                ? 'Liquidado'
                                : appt.payment_status === 'deposit_paid'
                                ? `Seña $${appt.amount_paid}`
                                : 'Sin Seña'}
                            </span>

                            <button
                              onClick={() =>
                                loadAppointmentIntoPos(appt, 'nota_conclusion')
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer flex items-center gap-1"
                              title="Concluir servicio y cobrar en POS"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              Concluir en POS
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rendimiento y Ocupación por Especialista */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Carga por Especialista / Box
                      </h2>
                      <p className="text-xs text-slate-500">
                        Distribución de citas asignadas en el consultorio
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('personal')}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      Gestionar Personal →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {specialists.map((spec) => {
                      const specAppts = appointments.filter(
                        (a) => a.specialist_id === spec.id && a.status !== 'cancelled'
                      );
                      const pct = Math.min(100, Math.max(20, specAppts.length * 25));
                      return (
                        <div key={spec.id} className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: spec.color_tag }}
                              />
                              <span className="font-bold text-slate-900">
                                {spec.name}
                              </span>
                            </div>
                            <span className="text-slate-500 font-semibold">
                              {specAppts.length} citas ({pct}% ocupación)
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: spec.color_tag
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setActiveSection('pos')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
                    >
                      + Abrir Caja POS
                    </button>
                    <button
                      onClick={() => setShowNewApptModal(true)}
                      className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition cursor-pointer"
                    >
                      + Agendar Cita
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA: ALTA DE CLIENTES SAAS & SELECCIÓN DE ÁREA / ESPECIALIDAD
          ================================================================== */}
          {activeSection === 'saas' && (
            <div className="space-y-6">
              {/* Sección 1: Cambiar el Área / Especialidad del Consultorio Actual */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      Configuración de Rubro Médico — {tenant.name}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Seleccionar Área o Especialidad del Consultorio Activo
                    </h2>
                    <p className="text-xs text-slate-500">
                      Al seleccionar un área médica, PEPEMEDIC adapta automáticamente el catálogo de tratamientos, precios, insumos y terminología ({SPECIALTY_CATALOG[tenant.specialty]?.boxName || 'Consultorio'}).
                    </p>
                  </div>

                  <span
                    className="px-3 py-1.5 rounded-xl text-white text-xs font-extrabold shrink-0"
                    style={{ backgroundColor: tenant.theme_color }}
                  >
                    Área Actual: {SPECIALTY_CATALOG[tenant.specialty]?.label}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {(Object.keys(SPECIALTY_CATALOG) as SpecialtyType[]).map(
                    (specKey) => {
                      const preset = SPECIALTY_CATALOG[specKey];
                      const isCurrent = tenant.specialty === specKey;
                      return (
                        <div
                          key={specKey}
                          onClick={() => handleSwitchClinicSpecialty(specKey)}
                          className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                            isCurrent
                              ? 'border-sky-600 bg-sky-50/60 shadow-sm'
                              : 'border-slate-200 hover:border-sky-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0"
                                style={{ backgroundColor: preset.defaultColor }}
                              />
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {preset.boxName}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-slate-900 text-sm mt-2">
                              {preset.label}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              {preset.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              {preset.defaultServices.length} servicios +{' '}
                              {preset.defaultSupplies.length} insumos
                            </span>
                            <span className="font-bold text-sky-600">
                              {isCurrent ? '✓ Activa' : 'Aplicar →'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Sección 2: Alta de Nuevo Cliente que Contrata PEPEMEDIC SaaS */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Panel Super-Admin SaaS
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Dar de Alta Nuevo Cliente / Consultorio Contratado
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cuando un doctor o clínica contrata tu servicio SaaS, regístralo aquí eligiendo su especialidad para entregarle su app lista.
                    </p>
                  </div>

                  <form
                    onSubmit={handleCreateSaasClientClinic}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nombre de la Clínica o Consultorio del Cliente *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Centro Traumatológico Santa Cruz / DermaLaser"
                        value={saasClientName}
                        onChange={(e) => handleSaasNameChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Área / Especialidad Contratada *
                        </label>
                        <select
                          value={saasSpecialty}
                          onChange={(e) =>
                            setSaasSpecialty(e.target.value as SpecialtyType)
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
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

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Plan SaaS Contratado *
                        </label>
                        <select
                          value={saasPlan}
                          onChange={(e) =>
                            setSaasPlan(e.target.value as PlanType)
                          }
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-sky-800"
                        >
                          <option value="trial">Prueba Gratis (14 días)</option>
                          <option value="starter">
                            Plan Consultorio ($19/mes)
                          </option>
                          <option value="pro">Plan Clínica Pro ($39/mes)</option>
                          <option value="enterprise">
                            Plan Multi-Sede ($79/mes)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          URL Pública de Reservas (Slug) *
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden">
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-2 font-mono border-r border-slate-300">
                            /c/
                          </span>
                          <input
                            type="text"
                            required
                            value={saasClientSlug}
                            onChange={(e) => setSaasClientSlug(e.target.value)}
                            className="w-full px-2.5 py-2 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          WhatsApp del Cliente *
                        </label>
                        <input
                          type="text"
                          required
                          value={saasWhatsapp}
                          onChange={(e) => setSaasWhatsapp(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    {/* Vista previa de lo que se pre-cargará para esta especialidad */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>
                          Plantilla Automática:{' '}
                          {SPECIALTY_CATALOG[saasSpecialty].label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                          {SPECIALTY_CATALOG[saasSpecialty].boxName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Servicios incluidos:</strong>{' '}
                        {SPECIALTY_CATALOG[saasSpecialty].defaultServices
                          .map((s) => `${s.name} ($${s.price})`)
                          .join(' • ')}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-600/20 cursor-pointer"
                    >
                      Crear Clínica Cliente con Plantilla de{' '}
                      {SPECIALTY_CATALOG[saasSpecialty].shortName}
                    </button>
                  </form>
                </div>

                {/* Directorio de Clientes SaaS Activos */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Cartera de Clínicas Clientes ({tenants.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Todos los consultorios suscritos a tu plataforma PEPEMEDIC SaaS.
                      </p>
                    </div>
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="space-y-3">
                    {tenants.map((t) => {
                      const preset =
                        SPECIALTY_CATALOG[t.specialty] ||
                        SPECIALTY_CATALOG.dental;
                      const isSelected = t.id === tenant.id;
                      return (
                        <div
                          key={t.id}
                          className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                            isSelected
                              ? 'border-sky-600 bg-sky-50/40'
                              : 'border-slate-200 bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: t.theme_color }}
                              />
                              <span className="font-bold text-slate-900 text-sm">
                                {t.name}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                                {preset.shortName}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Plan {t.plan}
                              </span>
                            </div>
                            <div className="text-slate-500">
                              Portal Pacientes:{' '}
                              <code className="text-sky-700 font-mono">
                                /c/{t.slug}
                              </code>{' '}
                              • WhatsApp: {t.phone}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isSelected && (
                              <button
                                type="button"
                                onClick={() => handleSelectTenant(t.id)}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                              >
                                Administrar
                              </button>
                            )}
                            <Link
                              to={`/c/${t.slug}`}
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                            >
                              Abrir App
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 2: CAJA POS (NOTAS DE RESERVA Y NOTAS DE CONCLUSIÓN)
          ================================================================== */}
          {activeSection === 'pos' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Columna Izquierda (7 cols): Selector de Cita + Catálogo de Servicios Clínicos */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Vincular con Cita Existente */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                          Paso 1: Selección de Paciente o Cita
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          Cargar desde Reserva Activa o Atención Directa
                        </h2>
                      </div>
                      {posLinkedApptId && (
                        <button
                          type="button"
                          onClick={() => {
                            setPosLinkedApptId('');
                            setPosPatientName('');
                            setPosItems([]);
                            setPosDepositDeducted(0);
                          }}
                          className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                        >
                          Limpiar selección
                        </button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {appointments
                        .filter((a) => a.status !== 'cancelled')
                        .map((appt) => {
                          const srv = services.find(
                            (s) => s.id === appt.service_id
                          );
                          const isSelected = posLinkedApptId === appt.id;
                          return (
                            <div
                              key={appt.id}
                              onClick={() =>
                                loadAppointmentIntoPos(appt, 'nota_conclusion')
                              }
                              className={`p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'border-sky-600 bg-sky-50/70'
                                  : 'border-slate-200 hover:border-sky-300 bg-slate-50/40'
                              }`}
                            >
                              <div className="truncate">
                                <div className="font-bold text-slate-900 truncate">
                                  {appt.patient_name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {srv?.name} • {appt.start_time}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-semibold">
                                  Seña abonada: ${appt.amount_paid}
                                </div>
                              </div>
                              <span className="px-2 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-bold shrink-0">
                                Cargar POS
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Catálogo Rápido de Tratamientos para Agregar al Detalle POS */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Paso 2: Agregar Tratamientos / Procedimientos Realizados
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        Catálogo Clínico de Servicios y Costos
                      </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {services
                        .filter((s) => s.active)
                        .map((srv) => (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => addServiceToPos(srv)}
                            className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/30 text-left transition cursor-pointer flex items-center justify-between gap-3 group"
                          >
                            <div>
                              <div className="text-[10px] font-bold uppercase text-slate-400">
                                {srv.category} ({srv.duration_min}m)
                              </div>
                              <div className="font-bold text-xs text-slate-900 group-hover:text-sky-700 mt-0.5">
                                {srv.name}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Seña sugerida: ${srv.deposit_amount}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-extrabold text-slate-900">
                                ${srv.price}
                              </div>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-600">
                                <Plus className="w-3 h-3" /> Agregar
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>

                    {/* Agregar Procedimiento o Insumo Extra Manualmente */}
                    <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Agregar Procedimiento Extra / Medicamento / Radiografía
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Ej. Radiografía Periapical Digital / Kit Post-Blanqueamiento"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={customItemPrice}
                            onChange={(e) =>
                              setCustomItemPrice(Number(e.target.value))
                            }
                            className="w-24 px-3 py-2 rounded-xl border border-slate-300 font-bold"
                          />
                          <button
                            type="button"
                            onClick={addCustomItemToPos}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer shrink-0"
                          >
                            + Incluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha (5 cols): Liquidación POS + Notas de Reserva y Conclusión */}
                <div className="lg:col-span-5">
                  <form
                    onSubmit={handleEmitPosNote}
                    className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden"
                  >
                    <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-sky-400" />
                        <div>
                          <h3 className="font-extrabold text-sm">
                            Terminal POS — PEPEMEDIC
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Emisión de Notas de Reserva y Conclusión de Servicio
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-full font-bold">
                        FOLIO AUTO
                      </span>
                    </div>

                    <div className="p-5 space-y-4 text-xs">
                      {/* Selector Tipo de Nota */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setPosNoteType('nota_conclusion')}
                          className={`py-2 px-2.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            posNoteType === 'nota_conclusion'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          Nota de Conclusión
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosNoteType('nota_reserva')}
                          className={`py-2 px-2.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            posNoteType === 'nota_reserva'
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Nota de Reserva (Seña)
                        </button>
                      </div>

                      {/* Datos Paciente y Especialista */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Paciente / Cliente *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nombre completo"
                            value={posPatientName}
                            onChange={(e) => setPosPatientName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            WhatsApp *
                          </label>
                          <input
                            type="text"
                            required
                            value={posPatientPhone}
                            onChange={(e) => setPosPatientPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            CI / DNI / NIT
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. 6841290"
                            value={posPatientDni}
                            onChange={(e) => setPosPatientDni(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Especialista Tratante
                          </label>
                          <select
                            value={posSpecialistName}
                            onChange={(e) => setPosSpecialistName(e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                          >
                            {specialists.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Detalle de Servicios y Costos */}
                      <div className="border-t border-b border-slate-200 py-3 space-y-2">
                        <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                          Detalle de Servicios Realizados y Costo
                        </div>

                        {posItems.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-400">
                            Haz clic en un servicio del catálogo izquierdo o carga una cita para detallar los costos.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {posItems.map((item) => (
                              <div
                                key={item.id}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-slate-900 truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    ${item.unit_price} c/u • {item.category}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => updatePosItemQty(item.id, -1)}
                                    className="w-6 h-6 rounded bg-white border border-slate-300 font-bold cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-5 text-center font-bold">
                                    {item.qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updatePosItemQty(item.id, 1)}
                                    className="w-6 h-6 rounded bg-white border border-slate-300 font-bold cursor-pointer"
                                  >
                                    +
                                  </button>
                                  <span className="w-14 text-right font-extrabold text-slate-900">
                                    ${item.subtotal}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removePosItem(item.id)}
                                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* NOTA DE RESERVA Y NOTA DE CONCLUSIÓN DE SERVICIO */}
                      <div className="space-y-2.5">
                        <div>
                          <label className="block font-bold text-sky-800 mb-1">
                            📋 Nota de Reserva (Condición Inicial / Anticipo)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Ej. Paciente agendó con seña previa de $10 por dolor o profilaxis..."
                            value={posReservationNotes}
                            onChange={(e) =>
                              setPosReservationNotes(e.target.value)
                            }
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-sky-50/30"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-emerald-800 mb-1">
                            ✅ Nota de Conclusión del Servicio (Detalle Clínico y Recomendaciones)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Ej. Se concluyó sesión de limpieza ultrasónica + resina en pieza 36. Se indica control en 6 meses..."
                            value={posConclusionNotes}
                            onChange={(e) =>
                              setPosConclusionNotes(e.target.value)
                            }
                            className="w-full p-2.5 rounded-xl border border-slate-300 bg-emerald-50/30"
                          />
                        </div>
                      </div>

                      {/* Desglose de Costos, Seña Previa y Saldo a Pagar */}
                      <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                        <div className="flex justify-between text-slate-300">
                          <span>Subtotal Servicios:</span>
                          <span className="font-bold">${posSubtotal}</span>
                        </div>

                        <div className="flex items-center justify-between text-sky-300">
                          <span>(-) Seña de Reserva Abonada:</span>
                          <input
                            type="number"
                            min={0}
                            value={posDepositDeducted}
                            onChange={(e) =>
                              setPosDepositDeducted(Number(e.target.value))
                            }
                            className="w-20 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-right font-bold text-sky-300"
                          />
                        </div>

                        <div className="flex items-center justify-between text-amber-300">
                          <span>(-) Descuento Especial ($):</span>
                          <input
                            type="number"
                            min={0}
                            value={posDiscount}
                            onChange={(e) =>
                              setPosDiscount(Number(e.target.value))
                            }
                            className="w-20 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-right font-bold text-amber-300"
                          />
                        </div>

                        <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-base font-extrabold">
                          <span>TOTAL A COBRAR AHORA:</span>
                          <span className="text-emerald-400 text-xl">
                            ${posNetTotal}
                          </span>
                        </div>
                      </div>

                      {/* Método de Cobro */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'qr_transfer', label: 'QR / Transf.', icon: QrCode },
                          { id: 'cash', label: 'Efectivo', icon: Banknote },
                          { id: 'card', label: 'Tarjeta POS', icon: CreditCard }
                        ].map((m) => {
                          const Icon = m.icon;
                          const active = posPaymentMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPosPaymentMethod(m.id as any)}
                              className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                active
                                  ? 'border-sky-600 bg-sky-50 text-sky-900'
                                  : 'border-slate-200 text-slate-600'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Emitir{' '}
                        {posNoteType === 'nota_conclusion'
                          ? 'Nota de Conclusión y Cobrar'
                          : 'Nota de Reserva (Seña)'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Historial de Notas de Reserva y Notas de Conclusión Emitidas */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Historial de Notas de Reserva y Conclusión Emitidas ({posNotes.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Registro auditable de servicios realizados, señas descontadas y liquidaciones finales.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] border-b border-slate-200">
                        <th className="py-3 px-4">Folio / Fecha</th>
                        <th className="py-3 px-4">Tipo de Nota</th>
                        <th className="py-3 px-4">Paciente & Especialista</th>
                        <th className="py-3 px-4">Detalle de Servicios y Notas</th>
                        <th className="py-3 px-4">Liquidación Costos</th>
                        <th className="py-3 px-4 text-right">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {posNotes.map((note) => (
                        <tr key={note.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono font-bold text-slate-900">
                              {note.folio_number}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(note.created_at).toLocaleString()}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                note.note_type === 'nota_conclusion'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {note.note_type === 'nota_conclusion'
                                ? 'Nota Conclusión'
                                : 'Nota Reserva'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {note.patient_name}
                            </div>
                            <div className="text-slate-500">
                              {note.specialist_name}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-md">
                            <div className="font-semibold text-slate-900">
                              {note.items
                                .map((i) => `${i.qty}x ${i.name} ($${i.subtotal})`)
                                .join(' + ')}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              <strong>Conclusión:</strong> {note.conclusion_notes}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-[11px] text-slate-500">
                              Subtotal: ${note.subtotal}{' '}
                              {note.deposit_deducted > 0 &&
                                `| Seña: -$${note.deposit_deducted}`}
                            </div>
                            <div className="font-extrabold text-emerald-700 text-sm">
                              Cobrado: ${note.total_paid}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setViewingPosReceipt(note)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Ver Nota
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA: REPORTES Y FINANZAS (FLUJO DE CAJA, COMISIONES Y GASTOS)
          ================================================================== */}
          {activeSection === 'finanzas' && (
            <div className="space-y-6">
              {/* Barra Superior de Acciones de Reporte */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                    Inteligencia Financiera PEPEMEDIC
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Balance Financiero, Arqueo de Caja y Comisiones Médicas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Consolidado en tiempo real de Notas POS, Señas de Reserva, Cuentas por Cobrar y Gastos Operativos.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <button
                    onClick={handleExportFinanceCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Excel (CSV)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir Balance
                  </button>
                </div>
              </div>

              {/* 4 Tarjetas Ejecutivas de Finanzas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Ingresos Brutos (POS + Señas)
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                      ${totalCollected}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{posNotes.length} notas liquidadas</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Egresos y Comisiones
                    </span>
                    <div className="text-2xl font-extrabold text-rose-600 mt-1">
                      -${totalExpenses}
                    </div>
                    <div className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{expenses.length} gastos registrados</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">
                      Utilidad Neta de Caja
                    </span>
                    <div className="text-2xl font-extrabold text-sky-400 mt-1">
                      ${netProfit}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                      Margen Neto:{' '}
                      {totalCollected > 0
                        ? Math.round((netProfit / totalCollected) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Cuentas por Cobrar (Saldos)
                    </span>
                    <div className="text-2xl font-extrabold text-amber-600 mt-1">
                      ${accountsReceivable}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      De citas con seña parcial
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <PieChart className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Liquidación de Comisiones por Especialista + Arqueo por Método de Pago */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Tabla de Producción y Comisiones por Doctor/Fisioterapeuta */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Producción y Comisiones por Especialista
                      </h3>
                      <p className="text-xs text-slate-500">
                        Cálculo automático sobre Notas POS y citas atendidas.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600 font-semibold">
                        % Comisión:
                      </span>
                      <input
                        type="number"
                        min={5}
                        max={90}
                        value={commissionRate}
                        onChange={(e) =>
                          setCommissionRate(Number(e.target.value))
                        }
                        className="w-16 px-2.5 py-1 rounded-lg border border-slate-300 font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Especialista</th>
                          <th className="py-2.5 px-3">Atenciones</th>
                          <th className="py-2.5 px-3">Facturado ($)</th>
                          <th className="py-2.5 px-3">
                            Comisión ({commissionRate}%)
                          </th>
                          <th className="py-2.5 px-3 text-right">Liquidar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {specialists.map((spec) => {
                          const specNotes = posNotes.filter(
                            (n) => n.specialist_name === spec.name
                          );
                          const specAppts = appointments.filter(
                            (a) =>
                              a.specialist_id === spec.id &&
                              a.status !== 'cancelled'
                          );
                          const billed =
                            specNotes.reduce((s, n) => s + n.total_paid, 0) +
                            specAppts.reduce((s, a) => s + a.amount_paid, 0);
                          const commission = (billed * commissionRate) / 100;

                          return (
                            <tr key={spec.id}>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">
                                  {spec.name}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {spec.role_title}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-semibold">
                                {specAppts.length + specNotes.length}
                              </td>
                              <td className="py-3 px-3 font-bold text-slate-900">
                                ${billed}
                              </td>
                              <td className="py-3 px-3 font-extrabold text-sky-700">
                                ${commission.toFixed(1)}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePaySpecialistCommission(
                                      spec.name,
                                      commission
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition cursor-pointer"
                                >
                                  Pagar Comisión
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Arqueo de Caja por Método de Pago y Ranking de Tratamientos */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Arqueo de Caja por Método de Cobro
                    </h3>
                    <p className="text-xs text-slate-500">
                      Distribución de ingresos recibidos en consultorio y online.
                    </p>
                  </div>

                  {(() => {
                    const qrTotal =
                      posNotes
                        .filter((n) => n.payment_method === 'qr_transfer')
                        .reduce((s, n) => s + n.total_paid, 0) +
                      appointments
                        .filter((a) => a.payment_method === 'qr_transfer')
                        .reduce((s, a) => s + a.amount_paid, 0);

                    const cashTotal =
                      posNotes
                        .filter((n) => n.payment_method === 'cash')
                        .reduce((s, n) => s + n.total_paid, 0) +
                      appointments
                        .filter((a) => a.payment_method === 'cash_at_clinic')
                        .reduce((s, a) => s + a.amount_paid, 0);

                    const cardTotal =
                      posNotes
                        .filter((n) => n.payment_method === 'card')
                        .reduce((s, n) => s + n.total_paid, 0) +
                      appointments
                        .filter((a) => a.payment_method === 'online_card')
                        .reduce((s, a) => s + a.amount_paid, 0);

                    const methods = [
                      {
                        label: 'QR Simple / Transferencia Bancaria',
                        amount: qrTotal,
                        color: 'bg-sky-600'
                      },
                      {
                        label: 'Efectivo en Recepción',
                        amount: cashTotal,
                        color: 'bg-emerald-600'
                      },
                      {
                        label: 'Tarjeta POS / Pasarela Railway',
                        amount: cardTotal,
                        color: 'bg-purple-600'
                      }
                    ];

                    return (
                      <div className="space-y-3 text-xs">
                        {methods.map((m) => {
                          const pct =
                            totalCollected > 0
                              ? Math.round((m.amount / totalCollected) * 100)
                              : 0;
                          return (
                            <div
                              key={m.label}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                            >
                              <div className="flex justify-between font-bold">
                                <span className="text-slate-800">{m.label}</span>
                                <span className="text-slate-900">
                                  ${m.amount} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${m.color}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Libro de Egresos / Gastos Operativos + Formulario de Registro */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Libro de Egresos y Gastos Operativos ({expenses.length})
                  </h3>
                  <div className="divide-y divide-slate-200 text-xs">
                    {expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              {exp.category.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400">
                              {exp.expense_date}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 mt-1">
                            {exp.description}
                          </div>
                          {exp.specialist_name && (
                            <div className="text-[11px] text-slate-500">
                              Beneficiario: {exp.specialist_name}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-extrabold text-rose-600">
                            -${exp.amount}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              db.deleteExpense(exp.id);
                              refreshData();
                              notify('Gasto eliminado');
                            }}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                  <h3 className="text-base font-bold text-slate-900 mb-3">
                    Registrar Nuevo Gasto / Egreso de Caja
                  </h3>
                  <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Categoría del Egreso
                      </label>
                      <select
                        value={expCategory}
                        onChange={(e) =>
                          setExpCategory(e.target.value as ExpenseCategory)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="insumos_clinicos">
                          Insumos Clínicos / Materiales
                        </option>
                        <option value="comision_especialista">
                          Comisión / Honorarios Especialista
                        </option>
                        <option value="alquiler_servicios">
                          Alquiler, Luz, Agua e Internet
                        </option>
                        <option value="equipamiento">
                          Mantenimiento de Equipos
                        </option>
                        <option value="marketing">
                          Publicidad y Redes Sociales
                        </option>
                        <option value="otros">Otros Gastos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Descripción del Gasto *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Compra de anestésicos y agujas"
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Monto ($) *
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={expAmount}
                          onChange={(e) => setExpAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Medio de Pago
                        </label>
                        <select
                          value={expMethod}
                          onChange={(e) =>
                            setExpMethod(e.target.value as any)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="qr_transfer">QR / Transferencia</option>
                          <option value="cash">Efectivo de Caja</option>
                          <option value="card">Tarjeta</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                    >
                      Registrar Egreso en Finanzas
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 3: CALENDARIO ESTILO GOOGLE CALENDAR (DÍA / SEMANA / MES / AGENDA)
          ================================================================== */}
          {activeSection === 'calendario' && (
            <div className="space-y-4">
              {/* BARRA SUPERIOR ESTILO GOOGLE CALENDAR */}
              <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Botón flotante estilo "+ Crear" de Google Calendar */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewApptDate(calendarDate);
                      setShowNewApptModal(true);
                    }}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-md hover:shadow-lg font-extrabold text-xs flex items-center gap-2 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4 text-sky-600 stroke-[3]" />
                    <span>Crear Cita</span>
                  </button>

                  {/* Botón Hoy */}
                  <button
                    type="button"
                    onClick={() => setCalendarDate(todayIso)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition"
                  >
                    Hoy
                  </button>

                  {/* Flechas < > de navegación según la vista */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => shiftGoogleCalendar(-1)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => shiftGoogleCalendar(1)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Título dinámico de Mes y Año como Google Calendar */}
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {googleCalendarTitle}
                  </h2>
                </div>

                {/* Buscador de eventos + Selector de Vistas (Día / Semana / Mes / Agenda) */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar paciente en agenda..."
                      value={calendarSearch}
                      onChange={(e) => setCalendarSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 focus:bg-white text-xs w-48 sm:w-56"
                    />
                  </div>

                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                    {(
                      [
                        { id: 'day', label: 'Día (Boxes)' },
                        { id: 'week', label: 'Semana' },
                        { id: 'month', label: 'Mes' },
                        { id: 'agenda', label: 'Agenda' }
                      ] as const
                    ).map((vm) => (
                      <button
                        key={vm.id}
                        type="button"
                        onClick={() => setCalendarViewMode(vm.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                          calendarViewMode === vm.id
                            ? 'bg-white text-sky-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {vm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CUERPO PRINCIPAL GOOGLE CALENDAR: SIDEBAR MINI-CALENDARIO + GRILLA */}
              <div className="grid lg:grid-cols-12 gap-4">
                {/* COLUMNA IZQUIERDA (3 cols): MINI CALENDARIO MENSUAL + "MIS CALENDARIOS (DOCTORES)" */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Mini Calendario Mensual Interactivo */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold text-slate-800">
                        {googleCalendarTitle}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => shiftCalendarDate(-30)}
                          className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => shiftCalendarDate(30)}
                          className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
                      <span>L</span>
                      <span>M</span>
                      <span>M</span>
                      <span>J</span>
                      <span>V</span>
                      <span>S</span>
                      <span>D</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {googleMonthGrid.map((cell) => {
                        const hasAppts = appointments.some(
                          (a) =>
                            a.appointment_date === cell.iso &&
                            a.status !== 'cancelled'
                        );
                        return (
                          <button
                            key={cell.iso}
                            type="button"
                            onClick={() => setCalendarDate(cell.iso)}
                            className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center relative text-[11px] font-semibold cursor-pointer transition ${
                              cell.isToday
                                ? 'bg-sky-600 text-white font-extrabold shadow-xs'
                                : cell.isSelected
                                ? 'bg-sky-100 text-sky-900 font-extrabold'
                                : cell.inCurrentMonth
                                ? 'text-slate-700 hover:bg-slate-100'
                                : 'text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span>{cell.dayNum}</span>
                            {hasAppts && !cell.isToday && (
                              <span className="w-1 h-1 rounded-full bg-sky-500 absolute bottom-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Capas "Mis Calendarios / Especialistas" igual a Google Calendar */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Agendas de Especialistas
                      </span>
                      <button
                        type="button"
                        onClick={() => setHiddenSpecIds([])}
                        className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                      >
                        Ver todos
                      </button>
                    </div>

                    <div className="space-y-2">
                      {specialists.map((spec) => {
                        const checked = !hiddenSpecIds.includes(spec.id);
                        const specApptCount = appointments.filter(
                          (a) =>
                            a.specialist_id === spec.id &&
                            a.status !== 'cancelled'
                        ).length;
                        return (
                          <label
                            key={spec.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleCalendarSpecFilter(spec.id)
                                }
                                className="w-4 h-4 rounded cursor-pointer"
                                style={{ accentColor: spec.color_tag }}
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: spec.color_tag }}
                              />
                              <div className="truncate">
                                <div className="font-bold text-slate-800 truncate">
                                  {spec.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {spec.role_title}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                              {specApptCount}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leyenda de Estados y Acceso Rápido */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5 text-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Estados en Calendario
                    </span>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Confirmada (Seña pagada)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Pendiente de confirmación</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                      <span>Concluida / Cobrada en POS</span>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA (9 cols): LIENZO PRINCIPAL DE GOOGLE CALENDAR */}
                <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  {/* =========================================================
                      VISTA 1: SEMANA (7 DÍAS LUN-DOM ESTILO GOOGLE CALENDAR)
                  ========================================================== */}
                  {calendarViewMode === 'week' && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs min-w-[820px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/70">
                            <th className="w-16 py-3 px-2 text-center font-mono text-[10px] text-slate-400 border-r border-slate-200">
                              GMT-4
                            </th>
                            {googleWeekDays.map((wd) => (
                              <th
                                key={wd.iso}
                                onClick={() => setCalendarDate(wd.iso)}
                                className={`py-2.5 px-2 text-center border-r border-slate-200 cursor-pointer transition ${
                                  wd.isToday
                                    ? 'bg-sky-50/60'
                                    : wd.isSelected
                                    ? 'bg-slate-100/70'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <div
                                  className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                    wd.isToday
                                      ? 'text-sky-600'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {wd.shortLabel}
                                </div>
                                <div
                                  className={`w-8 h-8 mx-auto mt-1 rounded-full flex items-center justify-center text-sm font-extrabold ${
                                    wd.isToday
                                      ? 'bg-sky-600 text-white shadow-sm'
                                      : wd.isSelected
                                      ? 'bg-sky-100 text-sky-900'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {wd.dayNumber}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200">
                          {HOURS_GRID.map((hour) => {
                            const isCurrentHourRow = hour === '10:00';
                            return (
                              <tr
                                key={hour}
                                className="group hover:bg-slate-50/40 relative"
                              >
                                {/* Columna de Hora */}
                                <td className="py-3 px-2 text-right font-mono text-[11px] font-bold text-slate-400 border-r border-slate-200 align-top bg-slate-50/30">
                                  {hour}
                                </td>

                                {/* 7 Columnas de los días de la semana */}
                                {googleWeekDays.map((wd) => {
                                  const slotAppts = appointments.filter(
                                    (a) =>
                                      a.appointment_date === wd.iso &&
                                      a.start_time === hour &&
                                      a.status !== 'cancelled' &&
                                      !hiddenSpecIds.includes(
                                        a.specialist_id
                                      ) &&
                                      (!calendarSearch.trim() ||
                                        a.patient_name
                                          .toLowerCase()
                                          .includes(
                                            calendarSearch.toLowerCase()
                                          ))
                                  );

                                  return (
                                    <td
                                      key={wd.iso}
                                      onClick={() => {
                                        if (slotAppts.length === 0) {
                                          setNewApptDate(wd.iso);
                                          setNewApptTime(hour);
                                          setShowNewApptModal(true);
                                        }
                                      }}
                                      className={`p-1.5 border-r border-slate-200 align-top min-h-[64px] relative cursor-pointer transition ${
                                        wd.isToday
                                          ? 'bg-sky-50/20 hover:bg-sky-50/50'
                                          : 'hover:bg-slate-100/50'
                                      }`}
                                    >
                                      {/* Indicador de línea roja de hora actual estilo Google Calendar */}
                                      {wd.isToday && isCurrentHourRow && (
                                        <div className="absolute left-0 right-0 top-1.5 z-10 flex items-center pointer-events-none">
                                          <span className="w-2 h-2 rounded-full bg-rose-500 -ml-1" />
                                          <div className="h-[2px] w-full bg-rose-500" />
                                        </div>
                                      )}

                                      {slotAppts.length > 0 ? (
                                        <div className="space-y-1">
                                          {slotAppts.map((appt) => {
                                            const spec = specialists.find(
                                              (s) => s.id === appt.specialist_id
                                            );
                                            const srv = services.find(
                                              (s) => s.id === appt.service_id
                                            );
                                            return (
                                              <div
                                                key={appt.id}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedCalAppt(appt);
                                                }}
                                                className="p-2 rounded-lg text-white shadow-xs hover:scale-[1.01] transition cursor-pointer border-l-4 border-black/25"
                                                style={{
                                                  backgroundColor:
                                                    spec?.color_tag || '#0284c7'
                                                }}
                                              >
                                                <div className="flex items-center justify-between gap-1">
                                                  <span className="font-extrabold text-[11px] truncate">
                                                    {appt.patient_name}
                                                  </span>
                                                  <span className="text-[9px] font-mono opacity-90">
                                                    {appt.start_time}
                                                  </span>
                                                </div>
                                                <div className="text-[10px] opacity-95 truncate">
                                                  {srv?.name || 'Consulta'}
                                                </div>
                                                <div className="flex items-center justify-between text-[9px] opacity-85 mt-0.5">
                                                  <span className="truncate">
                                                    {spec?.name.split(' ')[0]}{' '}
                                                    {spec?.name.split(' ')[1]}
                                                  </span>
                                                  <span className="uppercase font-bold px-1 rounded bg-black/20">
                                                    {appt.status === 'confirmed'
                                                      ? '✓'
                                                      : appt.status ===
                                                        'completed'
                                                      ? 'POS'
                                                      : 'Pend'}
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="h-11 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-bold text-sky-600 hover:bg-sky-50 transition">
                                          + {hour}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* =========================================================
                      VISTA 2: DÍA POR ESPECIALISTA / CONSULTORIO (GOOGLE ROOMS)
                  ========================================================== */}
                  {calendarViewMode === 'day' && (
                    <div className="overflow-x-auto">
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                        <div className="font-bold text-slate-800">
                          Vista Diaria por Sillón / Box Clínico —{' '}
                          <span className="text-sky-600">{calendarDate}</span>
                        </div>
                        <span className="text-slate-500">
                          Haz clic en cualquier bloque libre para agendar o en una cita para ver opciones.
                        </span>
                      </div>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-3 px-4 text-left font-bold text-slate-500 w-20 border-r border-slate-200">
                              Hora
                            </th>
                            {activeSpecialistsForCalendar.map((spec) => (
                              <th
                                key={spec.id}
                                className="py-3 px-4 text-left border-r border-slate-200 min-w-[220px]"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: spec.color_tag }}
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {spec.name}
                                    </div>
                                    <div className="text-[10px] font-normal text-slate-500">
                                      {spec.role_title} ({spec.start_time} -{' '}
                                      {spec.end_time})
                                    </div>
                                  </div>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {HOURS_GRID.map((hour) => (
                            <tr key={hour} className="hover:bg-slate-50/60">
                              <td className="py-3 px-4 font-mono font-bold text-slate-500 border-r border-slate-200 bg-slate-50/40">
                                {hour}
                              </td>
                              {activeSpecialistsForCalendar.map((spec) => {
                                const apptAtSlot = appointments.find(
                                  (a) =>
                                    a.appointment_date === calendarDate &&
                                    a.specialist_id === spec.id &&
                                    a.start_time === hour &&
                                    a.status !== 'cancelled'
                                );
                                const srv = services.find(
                                  (s) => s.id === apptAtSlot?.service_id
                                );

                                return (
                                  <td
                                    key={spec.id}
                                    className="p-2 border-r border-slate-200 align-top"
                                  >
                                    {apptAtSlot ? (
                                      <div
                                        onClick={() =>
                                          setSelectedCalAppt(apptAtSlot)
                                        }
                                        className="p-2.5 rounded-xl text-white shadow-xs space-y-1 cursor-pointer hover:opacity-95 transition border-l-4 border-black/25"
                                        style={{
                                          backgroundColor: spec.color_tag
                                        }}
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-bold text-xs truncate">
                                            {apptAtSlot.patient_name}
                                          </span>
                                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/20 font-bold">
                                            {apptAtSlot.status}
                                          </span>
                                        </div>
                                        <div className="text-[11px] opacity-90 truncate">
                                          {srv?.name}
                                        </div>
                                        <div className="text-[10px] opacity-85 flex items-center justify-between pt-1">
                                          <span>
                                            ${apptAtSlot.amount_paid} abonado
                                          </span>
                                          <span className="underline font-bold">
                                            Ver / POS →
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNewApptDate(calendarDate);
                                          setNewApptTime(hour);
                                          setNewApptSpecId(spec.id);
                                          setShowNewApptModal(true);
                                        }}
                                        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-200 hover:border-sky-400 text-slate-400 hover:text-sky-600 hover:bg-sky-50/40 text-[11px] font-medium transition cursor-pointer text-left"
                                      >
                                        + Agendar ({hour})
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* =========================================================
                      VISTA 3: MES (CUADRÍCULA MENSUAL DE 35 CELDAS)
                  ========================================================== */}
                  {calendarViewMode === 'month' && (
                    <div>
                      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-[11px] font-extrabold text-slate-500">
                        <span>LUN</span>
                        <span>MAR</span>
                        <span>MIÉ</span>
                        <span>JUE</span>
                        <span>VIE</span>
                        <span>SÁB</span>
                        <span>DOM</span>
                      </div>

                      <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
                        {googleMonthGrid.map((cell) => {
                          const dayAppts = appointments.filter(
                            (a) =>
                              a.appointment_date === cell.iso &&
                              a.status !== 'cancelled' &&
                              !hiddenSpecIds.includes(a.specialist_id) &&
                              (!calendarSearch.trim() ||
                                a.patient_name
                                  .toLowerCase()
                                  .includes(calendarSearch.toLowerCase()))
                          );

                          return (
                            <div
                              key={cell.iso}
                              onClick={() => setCalendarDate(cell.iso)}
                              className={`min-h-[115px] p-2 transition cursor-pointer flex flex-col justify-between ${
                                cell.isToday
                                  ? 'bg-sky-50/40'
                                  : cell.inCurrentMonth
                                  ? 'bg-white hover:bg-slate-50/70'
                                  : 'bg-slate-50/50 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    cell.isToday
                                      ? 'bg-sky-600 text-white'
                                      : cell.isSelected
                                      ? 'bg-sky-100 text-sky-900'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {cell.dayNum}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewApptDate(cell.iso);
                                    setShowNewApptModal(true);
                                  }}
                                  className="text-[10px] font-bold text-slate-400 hover:text-sky-600 cursor-pointer"
                                  title="Crear cita en este día"
                                >
                                  + Cita
                                </button>
                              </div>

                              <div className="space-y-1 mt-1.5">
                                {dayAppts.slice(0, 3).map((appt) => {
                                  const spec = specialists.find(
                                    (s) => s.id === appt.specialist_id
                                  );
                                  return (
                                    <div
                                      key={appt.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCalAppt(appt);
                                      }}
                                      className="px-2 py-1 rounded-md text-white text-[10px] font-bold truncate cursor-pointer hover:opacity-90"
                                      style={{
                                        backgroundColor:
                                          spec?.color_tag || '#0284c7'
                                      }}
                                    >
                                      {appt.start_time} • {appt.patient_name}
                                    </div>
                                  );
                                })}
                                {dayAppts.length > 3 && (
                                  <div className="text-[10px] font-bold text-sky-700 pl-1">
                                    +{dayAppts.length - 3} más...
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      VISTA 4: AGENDA / CRONOGRAMA ESTILO GOOGLE SCHEDULE
                  ========================================================== */}
                  {calendarViewMode === 'agenda' && (
                    <div className="divide-y divide-slate-200 text-xs">
                      {appointments
                        .filter(
                          (a) =>
                            a.status !== 'cancelled' &&
                            !hiddenSpecIds.includes(a.specialist_id) &&
                            (!calendarSearch.trim() ||
                              a.patient_name
                                .toLowerCase()
                                .includes(calendarSearch.toLowerCase()))
                        )
                        .map((appt) => {
                          const spec = specialists.find(
                            (s) => s.id === appt.specialist_id
                          );
                          const srv = services.find(
                            (s) => s.id === appt.service_id
                          );
                          return (
                            <div
                              key={appt.id}
                              onClick={() => setSelectedCalAppt(appt)}
                              className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-24 shrink-0">
                                  <div className="font-extrabold text-slate-900">
                                    {appt.appointment_date}
                                  </div>
                                  <div className="font-mono text-sky-600 font-bold">
                                    {appt.start_time} - {appt.end_time}
                                  </div>
                                </div>

                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      spec?.color_tag || '#0284c7'
                                  }}
                                />

                                <div>
                                  <div className="font-extrabold text-sm text-slate-900">
                                    {appt.patient_name}{' '}
                                    <span className="text-xs font-normal text-slate-500">
                                      ({appt.patient_phone})
                                    </span>
                                  </div>
                                  <div className="text-slate-600">
                                    {srv?.name} •{' '}
                                    <strong className="text-slate-800">
                                      {spec?.name}
                                    </strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                                  {appt.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    loadAppointmentIntoPos(
                                      appt,
                                      'nota_conclusion'
                                    );
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                                >
                                  Cobrar POS →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* POPOVER / MODAL DE DETALLE DE EVENTO ESTILO GOOGLE CALENDAR */}
              {selectedCalAppt && (
                <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
                    {(() => {
                      const spec = specialists.find(
                        (s) => s.id === selectedCalAppt.specialist_id
                      );
                      const srv = services.find(
                        (s) => s.id === selectedCalAppt.service_id
                      );
                      return (
                        <>
                          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-start gap-3">
                              <span
                                className="w-4 h-4 rounded-md mt-1 shrink-0"
                                style={{
                                  backgroundColor: spec?.color_tag || '#0284c7'
                                }}
                              />
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                  Detalle de Cita en Calendario
                                </span>
                                <h3 className="text-base font-extrabold text-slate-900">
                                  {selectedCalAppt.patient_name}
                                </h3>
                                <p className="text-slate-500">
                                  {selectedCalAppt.appointment_date} •{' '}
                                  {selectedCalAppt.start_time} a{' '}
                                  {selectedCalAppt.end_time}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedCalAppt(null)}
                              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Tratamiento:
                              </span>
                              <span className="font-bold text-slate-900">
                                {srv?.name} (${srv?.price})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Especialista:
                              </span>
                              <span className="font-bold text-slate-900">
                                {spec?.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                WhatsApp Paciente:
                              </span>
                              <span className="font-bold text-slate-900">
                                {selectedCalAppt.patient_phone}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">
                                Seña / Abonado:
                              </span>
                              <span className="font-extrabold text-emerald-700">
                                ${selectedCalAppt.amount_paid}
                              </span>
                            </div>
                          </div>

                          {/* Acciones rápidas del evento */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const target = selectedCalAppt;
                                setSelectedCalAppt(null);
                                loadAppointmentIntoPos(
                                  target,
                                  'nota_conclusion'
                                );
                              }}
                              className="col-span-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                              <Receipt className="w-4 h-4" />
                              Liquidar / Cobrar Cita en Caja POS →
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                db.createWaitingTicket({
                                  tenant_id: tenant.id,
                                  patient_name: selectedCalAppt.patient_name,
                                  specialist_name:
                                    spec?.name || 'Especialista',
                                  box_room: 'Consultorio 1',
                                  service_name: srv?.name || 'Consulta',
                                  arrival_time: new Date()
                                    .toTimeString()
                                    .slice(0, 5),
                                  status: 'llamando_pantalla',
                                  priority: 'normal'
                                });
                                setSelectedCalAppt(null);
                                refreshData();
                                setActiveSection('turnero');
                                notify(
                                  `${selectedCalAppt.patient_name} enviado a Sala de Espera (Turnero TV)`
                                );
                              }}
                              className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Tv className="w-3.5 h-3.5" />
                              Llamar en Turnero TV
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleStatusChange(
                                  selectedCalAppt.id,
                                  'confirmed'
                                );
                                setSelectedCalAppt(null);
                              }}
                              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Confirmar Cita
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const nextDay = new Date(
                                  selectedCalAppt.appointment_date + 'T12:00:00'
                                );
                                nextDay.setDate(nextDay.getDate() + 1);
                                const nextIso = nextDay
                                  .toISOString()
                                  .split('T')[0];
                                db.updateAppointment(selectedCalAppt.id, {
                                  appointment_date: nextIso
                                });
                                setSelectedCalAppt(null);
                                refreshData();
                                notify(
                                  `Cita reprogramada para el ${nextIso} a las ${selectedCalAppt.start_time}`
                                );
                              }}
                              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                            >
                              Mover +1 Día
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleStatusChange(
                                  selectedCalAppt.id,
                                  'cancelled'
                                );
                                setSelectedCalAppt(null);
                              }}
                              className="py-2 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer"
                            >
                              Cancelar Cita
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              VENTANA 4: RESERVAS Y CONTROL DE SEÑAS
          ================================================================== */}
          {activeSection === 'reservas' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Listado General de Reservas ({filteredReservations.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Emite la Nota de Reserva o pasa la cita al POS para su Nota de Conclusión de Servicio.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar paciente, tel o ref QR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 'all', label: 'Todas' },
                      { id: 'confirmed', label: 'Confirmadas' },
                      { id: 'pending_payment', label: 'Sin Seña' },
                      { id: 'completed', label: 'Concluidas' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setReservationFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          reservationFilter === f.id
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] border-b border-slate-200">
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Paciente / Notas</th>
                      <th className="py-3 px-4">Servicio & Costo</th>
                      <th className="py-3 px-4">Seña / Pago</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">POS & WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredReservations.map((appt) => {
                      const srv = services.find((s) => s.id === appt.service_id);
                      const spec = specialists.find(
                        (s) => s.id === appt.specialist_id
                      );
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900">
                              {appt.appointment_date}
                            </div>
                            <div className="text-sky-700 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appt.start_time} - {appt.end_time}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {appt.patient_name}
                            </div>
                            <div className="text-slate-500">{appt.patient_phone}</div>
                            {appt.notes && (
                              <div className="text-[11px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded mt-1 inline-block">
                                <strong>Nota Reserva:</strong> {appt.notes}
                              </div>
                            )}
                            {appt.conclusion_notes && (
                              <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-1 block">
                                <strong>Conclusión:</strong> {appt.conclusion_notes}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {srv?.name || 'Tratamiento'} (${srv?.price})
                            </div>
                            <div className="text-slate-500">
                              {spec?.name || 'Especialista'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                appt.payment_status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : appt.payment_status === 'deposit_paid'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {appt.payment_status === 'paid'
                                ? `Pagado ($${appt.amount_paid})`
                                : appt.payment_status === 'deposit_paid'
                                ? `Seña ($${appt.amount_paid})`
                                : 'Pendiente'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                appt.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : appt.status === 'completed'
                                  ? 'bg-slate-200 text-slate-800'
                                  : appt.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {appt.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() =>
                                loadAppointmentIntoPos(appt, 'nota_reserva')
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold transition cursor-pointer"
                              title="Emitir Nota de Reserva (Seña)"
                            >
                              Nota Reserva
                            </button>

                            <button
                              onClick={() =>
                                loadAppointmentIntoPos(appt, 'nota_conclusion')
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer"
                              title="Emitir Nota de Conclusión y Liquidar en POS"
                            >
                              Concluir POS
                            </button>

                            <button
                              onClick={() => handleSendManualReminder(appt)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {appt.status !== 'cancelled' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(appt.id, 'cancelled')
                                }
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Cancelar cita"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5: CLIENTES / PACIENTES (CRM E HISTORIAL CLÍNICO)
          ================================================================== */}
          {activeSection === 'clientes' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Directorio de Clientes y Expedientes Clínicos ({filteredPatients.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cada Nota de Conclusión emitida en el POS se agrega automáticamente a la evolución clínica del paciente.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, DNI o celular..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewPatientModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Cliente
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredPatients.map((pat) => {
                  const patAppts = appointments.filter(
                    (a) =>
                      a.patient_phone === pat.phone ||
                      a.patient_name.toLowerCase() === pat.name.toLowerCase()
                  );
                  const totalSpent = patAppts.reduce(
                    (acc, a) => acc + a.amount_paid,
                    0
                  );

                  return (
                    <div
                      key={pat.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-2xs hover:border-sky-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-sm">
                            {pat.name
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">
                              {pat.name}
                            </h3>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span>{pat.phone}</span>
                              {pat.dni && <span>• CI/DNI: {pat.dni}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 justify-end">
                          {pat.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                        <div className="font-bold text-slate-500 text-[10px] uppercase mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Evolución / Notas de Conclusión Clínicas:
                        </div>
                        <p>{pat.clinical_notes}</p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
                        <div className="text-slate-500">
                          Visitas: <strong className="text-slate-900">{patAppts.length}</strong> • Abonado:{' '}
                          <strong className="text-emerald-700">${totalSpent}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              handleSelectOdoPatient(pat.id);
                              setActiveSection('odontograma');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold cursor-pointer"
                          >
                            🦷 Odontograma
                          </button>
                          <button
                            onClick={() => setEditingPatient(pat)}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                          >
                            Editar Ficha
                          </button>
                          <a
                            href={`https://wa.me/${pat.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA ESPECIALIZADA ODONTOLOGÍA: ODONTOGRAMA DIGITAL FDI 32 PIEZAS
          ================================================================== */}
          {activeSection === 'odontograma' && (
            <div className="space-y-6">
              {/* Barra Superior: Selección de Paciente y Paleta de Procedimientos */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      Módulo Especializado de Odontología — PEPEMEDIC
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Odontograma Clínico Interactivo (Sistema Internacional FDI - 32 Piezas)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Selecciona el hallazgo o tratamiento abajo y haz clic sobre las piezas dentales para armar el presupuesto automático.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700">Paciente:</span>
                    <select
                      value={selectedOdoPatientId}
                      onChange={(e) => handleSelectOdoPatient(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-900"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Paleta de Herramientas Odontológicas */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {TOOTH_TOOLKIT.map((tool) => {
                    const active = activeToothTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveToothTool(tool.id)}
                        className={`px-3 py-2 rounded-xl border-2 font-bold transition cursor-pointer flex items-center gap-2 ${
                          active ? 'ring-2 ring-sky-500/30 scale-[1.02]' : ''
                        }`}
                        style={{
                          backgroundColor: tool.bg,
                          borderColor: active ? '#0f172a' : tool.border,
                          color: tool.text
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tool.border }}
                        />
                        <span>{tool.label}</span>
                        {tool.cost > 0 && (
                          <span className="text-[10px] opacity-80">
                            (${tool.cost})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mapa Dental Visual de 32 Piezas (Arcada Superior e Inferior) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6 shadow-2xs overflow-x-auto">
                {/* ARCADA SUPERIOR */}
                <div className="space-y-2 min-w-[680px]">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <span>Cuadrante 1 (Superior Derecho 18 - 11)</span>
                    <span className="text-sky-600">Arcada Maxilar Superior</span>
                    <span>Cuadrante 2 (Superior Izquierdo 21 - 28)</span>
                  </div>

                  <div className="grid grid-cols-16 gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {[...UPPER_TEETH_RIGHT, ...UPPER_TEETH_LEFT].map((num) => {
                      const entry = currentTeethMap[num];
                      const toolStyle = TOOTH_TOOLKIT.find(
                        (t) => t.id === (entry?.condition || 'sano')
                      )!;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleToothClick(num)}
                          className={`p-2 rounded-xl border-2 flex flex-col items-center justify-between transition cursor-pointer hover:scale-105 ${
                            num === 11 ? 'mr-1.5' : ''
                          }`}
                          style={{
                            backgroundColor: toolStyle.bg,
                            borderColor: toolStyle.border,
                            color: toolStyle.text
                          }}
                          title={
                            entry
                              ? `Pieza ${num}: ${entry.procedureName} ($${entry.estimatedCost})`
                              : `Pieza ${num}: Sana`
                          }
                        >
                          <span className="text-[11px] font-extrabold">
                            {num}
                          </span>
                          {/* Corona / Raíz Dental Visual */}
                          <div
                            className="w-6 h-7 rounded-t-lg rounded-b-sm border-2 my-1 flex items-center justify-center text-[9px] font-extrabold"
                            style={{ borderColor: toolStyle.border }}
                          >
                            {entry ? entry.condition.slice(0, 3).toUpperCase() : '✓'}
                          </div>
                          <span className="text-[9px] font-bold">
                            {entry ? `$${entry.estimatedCost}` : 'Sano'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ARCADA INFERIOR */}
                <div className="space-y-2 min-w-[680px]">
                  <div className="grid grid-cols-16 gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    {[...LOWER_TEETH_RIGHT, ...LOWER_TEETH_LEFT].map((num) => {
                      const entry = currentTeethMap[num];
                      const toolStyle = TOOTH_TOOLKIT.find(
                        (t) => t.id === (entry?.condition || 'sano')
                      )!;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleToothClick(num)}
                          className={`p-2 rounded-xl border-2 flex flex-col items-center justify-between transition cursor-pointer hover:scale-105 ${
                            num === 41 ? 'mr-1.5' : ''
                          }`}
                          style={{
                            backgroundColor: toolStyle.bg,
                            borderColor: toolStyle.border,
                            color: toolStyle.text
                          }}
                          title={
                            entry
                              ? `Pieza ${num}: ${entry.procedureName} ($${entry.estimatedCost})`
                              : `Pieza ${num}: Sana`
                          }
                        >
                          <span className="text-[9px] font-bold">
                            {entry ? `$${entry.estimatedCost}` : 'Sano'}
                          </span>
                          <div
                            className="w-6 h-7 rounded-b-lg rounded-t-sm border-2 my-1 flex items-center justify-center text-[9px] font-extrabold"
                            style={{ borderColor: toolStyle.border }}
                          >
                            {entry ? entry.condition.slice(0, 3).toUpperCase() : '✓'}
                          </div>
                          <span className="text-[11px] font-extrabold">
                            {num}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <span>Cuadrante 4 (Inferior Derecho 48 - 41)</span>
                    <span className="text-sky-600">Arcada Mandibular Inferior</span>
                    <span>Cuadrante 3 (Inferior Izquierdo 31 - 38)</span>
                  </div>
                </div>
              </div>

              {/* Resumen de Presupuesto Dental por Pieza + Envío a Caja POS */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      Plan de Tratamiento por Pieza Dental (
                      {Object.keys(currentTeethMap).length} piezas)
                    </h3>
                    <span className="text-sm font-extrabold text-emerald-700">
                      Presupuesto Total: $
                      {Object.values(currentTeethMap).reduce(
                        (s, e) => s + e.estimatedCost,
                        0
                      )}
                    </span>
                  </div>

                  {Object.values(currentTeethMap).length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-400">
                      Haz clic en cualquier diente del mapa superior para agregar procedimientos al plan dental.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 text-xs">
                      {Object.values(currentTeethMap).map((entry) => (
                        <div
                          key={entry.toothNumber}
                          className="py-2.5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-extrabold">
                              Pieza #{entry.toothNumber}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900">
                                {entry.procedureName}
                              </div>
                              <div className="text-[10px] uppercase text-slate-500 font-semibold">
                                Hallazgo: {entry.condition}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-slate-900 text-sm">
                              ${entry.estimatedCost}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentTeethMap((prev) => {
                                  const copy = { ...prev };
                                  delete copy[entry.toothNumber];
                                  return copy;
                                });
                              }}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs h-fit">
                  <h3 className="text-base font-bold text-slate-900">
                    Diagnóstico Odontológico General y Cobro POS
                  </h3>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Diagnóstico y Observaciones del Odontograma
                    </label>
                    <textarea
                      rows={3}
                      value={odoDiagnosis}
                      onChange={(e) => setOdoDiagnosis(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveOdontogram}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      Guardar Odontograma en Ficha del Paciente
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOdontogramToPos}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      Pasar Presupuesto Dental a Caja POS →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5.2: MÓDULO ESPECIALISTA — EVALUACIÓN & MAPA CORPORAL EVA + TRIAJE
          ================================================================== */}
          {activeSection === 'evaluacion' && (
            <div className="space-y-6">
              {/* Barra superior: Selección de Paciente + Signos Vitales (Triaje) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-1">
                      <HeartPulse className="w-3.5 h-3.5" />
                      Módulo de Especialista • Triaje de Signos Vitales & Mapa Corporal EVA
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Evaluación Clínica Funcional, Escala de Dolor (EVA) y Movilidad (ROM)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Registra signos vitales de ingreso, evalúa zonas anatómicas de dolor o intervención y envía el plan terapéutico directo a la Caja POS.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-xs">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Paciente en Evaluación
                      </label>
                      <select
                        value={selectedOdoPatientId}
                        onChange={(e) => handleSelectEvalPatient(e.target.value)}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-900 text-xs"
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.dni || p.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Total Terapias Asignadas
                      </div>
                      <div className="text-lg font-extrabold text-emerald-400">
                        $
                        {Object.values(bodyZonesMap).reduce(
                          (acc, z) => acc + z.sessionCost,
                          0
                        )}{' '}
                        <span className="text-[11px] font-normal text-slate-300">
                          ({Object.keys(bodyZonesMap).length} zonas)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjetas de Signos Vitales y Antropometría con IMC automático */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-500" />
                    1. Triaje Clínico y Signos Vitales de Ingreso
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Presión Arterial (mmHg)
                      </label>
                      <input
                        type="text"
                        value={vitalSigns.bloodPressure}
                        onChange={(e) =>
                          setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-extrabold text-slate-900"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Frec. Cardíaca (BPM)
                      </label>
                      <input
                        type="number"
                        value={vitalSigns.heartRate}
                        onChange={(e) =>
                          setVitalSigns({
                            ...vitalSigns,
                            heartRate: Number(e.target.value)
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-extrabold text-slate-900"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Temperatura (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={vitalSigns.temperature}
                        onChange={(e) =>
                          setVitalSigns({
                            ...vitalSigns,
                            temperature: Number(e.target.value)
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-extrabold text-slate-900"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Saturación SpO2 (%)
                      </label>
                      <input
                        type="number"
                        value={vitalSigns.spo2}
                        onChange={(e) =>
                          setVitalSigns({
                            ...vitalSigns,
                            spo2: Number(e.target.value)
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-extrabold text-emerald-700"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Peso (kg) / Talla (cm)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={vitalSigns.weightKg}
                          onChange={(e) =>
                            setVitalSigns({
                              ...vitalSigns,
                              weightKg: Number(e.target.value)
                            })
                          }
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                        />
                        <input
                          type="number"
                          value={vitalSigns.heightCm}
                          onChange={(e) =>
                            setVitalSigns({
                              ...vitalSigns,
                              heightCm: Number(e.target.value)
                            })
                          }
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase text-sky-700">
                        IMC Calculado
                      </span>
                      <div className="text-lg font-extrabold text-sky-950">
                        {vitalSigns.heightCm > 0
                          ? (
                              vitalSigns.weightKg /
                              Math.pow(vitalSigns.heightCm / 100, 2)
                            ).toFixed(1)
                          : '0.0'}{' '}
                        <span className="text-[10px] font-semibold text-sky-700">
                          kg/m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calibrador EVA + Mapa Anatómico de Zonas Corporales */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        2. Mapa Corporal de Dolor (EVA 1–10) y Movilidad Articular
                      </h3>
                      <p className="text-xs text-slate-500">
                        Configura la intensidad EVA y haz clic en las zonas anatómicas para asignar rehabilitación o procedimiento.
                      </p>
                    </div>
                  </div>

                  {/* Controles de Escala Visual Analógica (EVA) y ROM antes de marcar zona */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-700">
                          Escala de Dolor EVA a aplicar:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-extrabold text-white ${
                            selectedEvaScale >= 7
                              ? 'bg-rose-600'
                              : selectedEvaScale >= 4
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                        >
                          EVA {selectedEvaScale} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={selectedEvaScale}
                        onChange={(e) => setSelectedEvaScale(Number(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>1 (Leve)</span>
                        <span>5 (Moderado)</span>
                        <span>10 (Severo/Agudo)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Rango de Movilidad Articular (ROM):
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { id: 'normal', label: 'Normal (100%)' },
                            { id: 'limitacion_leve', label: 'Limitación Leve' },
                            { id: 'limitacion_severa', label: 'Severo / Bloqueo' }
                          ] as const
                        ).map((rom) => (
                          <button
                            key={rom.id}
                            type="button"
                            onClick={() => setSelectedRom(rom.id)}
                            className={`py-2 px-2 rounded-xl font-bold text-[11px] border cursor-pointer transition ${
                              selectedRom === rom.id
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {rom.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grid interactivo de Zonas Anatómicas */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {BODY_ZONES_CATALOG.map((zone) => {
                      const activeZone = bodyZonesMap[zone.id];
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => handleToggleBodyZone(zone)}
                          className={`p-3.5 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                            activeZone
                              ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-500/20'
                              : 'bg-white border-slate-200 hover:border-sky-400 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900">
                                {zone.label}
                              </span>
                              {activeZone && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white ${
                                    activeZone.evaPain >= 7
                                      ? 'bg-rose-600'
                                      : activeZone.evaPain >= 4
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-600'
                                  }`}
                                >
                                  EVA {activeZone.evaPain}/10
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {activeZone
                                ? `${activeZone.therapyAssigned} • ROM: ${activeZone.mobilityRom.replace('_', ' ')}`
                                : zone.defaultTherapy}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-slate-900">
                              ${activeZone ? activeZone.sessionCost : zone.defaultCost}
                            </span>
                            <div className="text-[10px] font-bold text-sky-600 mt-0.5">
                              {activeZone ? 'Quitar' : '+ Asignar'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Columna derecha: Diagnóstico Funcional y Pase directo al POS */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs h-fit">
                  <h3 className="text-base font-bold text-slate-900">
                    3. Resumen de Zonas Afectadas y Pase a Caja POS
                  </h3>

                  {Object.values(bodyZonesMap).length === 0 ? (
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400">
                      Selecciona una o más zonas anatómicas en el mapa izquierdo para armar el protocolo del especialista.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {Object.values(bodyZonesMap).map((z) => (
                        <div
                          key={z.zoneId}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              {z.zoneLabel}{' '}
                              <span className="text-rose-600 font-extrabold">
                                (EVA {z.evaPain}/10)
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {z.therapyAssigned} • Movilidad: {z.mobilityRom}
                            </div>
                          </div>
                          <div className="font-extrabold text-sm text-slate-900">
                            ${z.sessionCost}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Diagnóstico Funcional / Evolución del Especialista
                    </label>
                    <textarea
                      rows={3}
                      value={evalDiagnosis}
                      onChange={(e) => setEvalDiagnosis(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveEvaluation}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      Guardar Evaluación y Triaje en Historial
                    </button>

                    <button
                      type="button"
                      onClick={handleSendEvalToPos}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      Enviar Plan Terapéutico a Caja POS →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5.3: MÓDULO ESPECIALISTA — RECETARIO DIGITAL, ÓRDENES 3D/RX Y CONSENTIMIENTOS
          ================================================================== */}
          {activeSection === 'recetario' && (
            <div className="space-y-6">
              {/* Plantillas rápidas de 1 clic por especialidad */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold mb-1">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Módulo de Especialista • Documentación Médica Legal & Recetario
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Emisión de Recetas Médicas, Órdenes de Estudio (Rx / Tomografía 3D) y Consentimientos
                  </h2>
                  <p className="text-xs text-slate-500">
                    Genera documentos foliados listos para imprimir o enviar al WhatsApp del paciente con 1 clic.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">
                    Plantillas Rápidas:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLoadRxTemplate('dental_postop')}
                    className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold cursor-pointer"
                  >
                    🦷 Receta Dental Post-Op
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadRxTemplate('rx_3d')}
                    className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold cursor-pointer"
                  >
                    🔬 Orden Tomografía 3D / Panorámica
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadRxTemplate('fisio_analgesia')}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold cursor-pointer"
                  >
                    🦴 Orden Ecografía & Fisio
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadRxTemplate('consentimiento_quirurgico')}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold cursor-pointer"
                  >
                    ✍️ Consentimiento Informado
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                {/* Editor de Receta / Orden / Consentimiento */}
                <form
                  onSubmit={handleEmitPrescription}
                  className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      Emitir Nuevo Documento del Especialista
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                      Folio Automático
                    </span>
                  </div>

                  {/* Selector de Tipo de Documento */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'receta', label: '💊 Receta Médica' },
                        { id: 'orden_estudio', label: '🔬 Orden Rx / Lab' },
                        { id: 'certificado', label: '📄 Certificado' },
                        { id: 'consentimiento', label: '✍️ Consentimiento' }
                      ] as const
                    ).map((dt) => (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setRxDocType(dt.id)}
                        className={`py-2.5 px-3 rounded-xl font-extrabold border text-center cursor-pointer transition ${
                          rxDocType === dt.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {dt.label}
                      </button>
                    ))}
                  </div>

                  {/* Datos del Paciente y Especialista */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Seleccionar Paciente
                      </label>
                      <select
                        value={rxPatientName}
                        onChange={(e) => {
                          const found = patients.find(
                            (p) => p.name === e.target.value
                          );
                          setRxPatientName(e.target.value);
                          if (found) {
                            setRxPatientPhone(found.phone);
                            setRxPatientDni(found.dni || '');
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        WhatsApp del Paciente
                      </label>
                      <input
                        type="text"
                        value={rxPatientPhone}
                        onChange={(e) => setRxPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Especialista Firmante
                      </label>
                      <select
                        value={rxSpecialistName}
                        onChange={(e) => setRxSpecialistName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        {specialists.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Diagnóstico Clínico (CIE-10 / Odontológico / Funcional) *
                    </label>
                    <input
                      type="text"
                      required
                      value={rxDiagnosis}
                      onChange={(e) => setRxDiagnosis(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
                    />
                  </div>

                  {/* Ítems de medicamentos, estudios o cláusulas */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-800">
                      Detalle de Medicamentos / Estudios Solicitados ({rxItems.length})
                    </div>

                    <div className="space-y-2">
                      {rxItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="font-extrabold text-slate-900">
                              {idx + 1}. {item.title}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {item.dosageOrSpec}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setRxItems((prev) =>
                                prev.filter((r) => r.id !== item.id)
                              )
                            }
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Agregar nuevo medicamento o estudio */}
                    <div className="grid sm:grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        placeholder="Medicamento / Estudio (ej. Ibuprofeno 600mg o Rx Periapical)"
                        value={rxNewTitle}
                        onChange={(e) => setRxNewTitle(e.target.value)}
                        className="sm:col-span-5 px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Posología o especificación (ej. 1 comp c/8h por 5 días)"
                        value={rxNewDosage}
                        onChange={(e) => setRxNewDosage(e.target.value)}
                        className="sm:col-span-5 px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddRxItem}
                        className="sm:col-span-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Indicaciones Generales y Recomendaciones al Paciente
                    </label>
                    <textarea
                      rows={2}
                      value={rxIndications}
                      onChange={(e) => setRxIndications(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-md shadow-sky-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Emitir y Abrir Documento Clínico Imprimible
                  </button>
                </form>

                {/* Historial de Recetas, Órdenes y Consentimientos emitidos */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 h-fit">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Documentos Clínicos Emitidos ({prescriptions.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Haz clic en cualquier folio para imprimir o enviar por WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 transition flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px]">
                              {rx.folio}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px] uppercase">
                              {rx.doc_type.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {rx.created_at}
                            </span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            {rx.patient_name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Dr(a): {rx.specialist_name} • {rx.items.length} ítem(s)
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setViewingPrescription(rx)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 font-bold cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Ver Folio
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5.4: PLANES DE TRATAMIENTO POR SESIONES Y CUOTAS
          ================================================================== */}
          {activeSection === 'planes' && (
            <div className="space-y-6">
              {/* KPIs de Planes y Saldos por Cobrar */}
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Planes Activos en Curso
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {treatmentPlans.filter((p) => p.status === 'activo').length}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ortodoncia, rehabilitación y paquetes
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Presupuesto Total Contratado
                  </span>
                  <div className="text-2xl font-extrabold text-sky-600 mt-1">
                    $
                    {treatmentPlans.reduce((acc, p) => acc + p.total_budget, 0)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Suma de paquetes multisesión
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Abonado por Pacientes
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                    ${treatmentPlans.reduce((acc, p) => acc + p.amount_paid, 0)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cuotas cobradas en Caja POS
                  </p>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Saldo Pendiente por Cobrar
                  </span>
                  <div className="text-2xl font-extrabold text-amber-400 mt-1">
                    $
                    {treatmentPlans.reduce(
                      (acc, p) => acc + Math.max(0, p.total_budget - p.amount_paid),
                      0
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Cartera recurrente asegurada
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                {/* Lista de Planes por Sesiones con barra de progreso y botón POS */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Control de Paquetes de Sesiones, Ortodoncia y Cuotas
                      </h2>
                      <p className="text-xs text-slate-500">
                        Avanza cada sesión realizada y envía el cobro de la cuota directamente a la Caja POS con 1 clic.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {treatmentPlans.map((plan) => {
                        const pct = Math.min(
                          100,
                          Math.round(
                            (plan.completed_sessions /
                              Math.max(1, plan.total_sessions)) *
                              100
                          )
                        );
                        const balance = Math.max(
                          0,
                          plan.total_budget - plan.amount_paid
                        );
                        return (
                          <div
                            key={plan.id}
                            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold text-[10px] uppercase">
                                    {plan.category.replace('_', ' ')}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      plan.status === 'completado'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {plan.status}
                                  </span>
                                </div>
                                <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                                  {plan.plan_title}
                                </h3>
                                <div className="text-slate-600 font-semibold">
                                  Paciente: {plan.patient_name} • Tratante:{' '}
                                  {plan.specialist_name}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] uppercase font-bold text-slate-400">
                                  Cuota / Sesión
                                </div>
                                <div className="text-base font-extrabold text-slate-900">
                                  ${plan.installment_price}
                                </div>
                                <div className="text-[11px] font-semibold text-amber-700">
                                  Saldo: ${balance} (de ${plan.total_budget})
                                </div>
                              </div>
                            </div>

                            {/* Barra de avance de sesiones */}
                            <div>
                              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                                <span>
                                  Progreso de Sesiones: {plan.completed_sessions} de{' '}
                                  {plan.total_sessions} realizadas
                                </span>
                                <span className="text-sky-700">{pct}%</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                              <strong className="text-slate-700">Evolución:</strong>{' '}
                              {plan.clinical_evolution}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <span className="text-[11px] text-slate-400">
                                Próxima cita sugerida: {plan.next_session_date}
                              </span>
                              {plan.completed_sessions < plan.total_sessions ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdvancePlanAndSendToPos(plan)
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer flex items-center gap-1.5 shadow-sm"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  Registrar Sesión #{plan.completed_sessions + 1} y Cobrar Cuota (${plan.installment_price}) en POS →
                                </button>
                              ) : (
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                                  ✓ Tratamiento Concluido al 100%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Formulario Nuevo Plan por Sesiones / Cuotas */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Aperturar Nuevo Plan de Sesiones o Cuotas
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Ideal para Ortodoncia mensual, Packs de 5 o 10 sesiones de Fisioterapia o Implantes en etapas.
                  </p>

                  <form
                    onSubmit={handleCreateTreatmentPlan}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Seleccionar Paciente *
                      </label>
                      <select
                        value={tpPatientName}
                        onChange={(e) => {
                          const found = patients.find(
                            (p) => p.name === e.target.value
                          );
                          setTpPatientName(e.target.value);
                          if (found) setTpPatientPhone(found.phone);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({p.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nombre del Plan o Paquete Clínico *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ortodoncia Zafiro 12 Controles / Pack 10 Sesiones Fisio"
                        value={tpTitle}
                        onChange={(e) => setTpTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Categoría
                        </label>
                        <select
                          value={tpCategory}
                          onChange={(e) =>
                            setTpCategory(
                              e.target.value as TreatmentPlanPackage['category']
                            )
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="ortodoncia">Ortodoncia</option>
                          <option value="rehabilitacion_fisio">
                            Rehabilitación / Fisio
                          </option>
                          <option value="implantes_protesis">
                            Implantes / Prótesis
                          </option>
                          <option value="estetica_integral">
                            Estética Integral
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          N° de Sesiones
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={36}
                          value={tpTotalSessions}
                          onChange={(e) =>
                            setTpTotalSessions(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Presupuesto Total ($)
                        </label>
                        <input
                          type="number"
                          min={10}
                          value={tpTotalBudget}
                          onChange={(e) =>
                            setTpTotalBudget(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                      <span className="font-semibold text-sky-900">
                        Cuota sugerida por sesión:
                      </span>
                      <span className="text-sm font-extrabold text-sky-700">
                        $
                        {Math.round(
                          Number(tpTotalBudget) /
                            Math.max(1, Number(tpTotalSessions))
                        )}{' '}
                        / sesión
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Objetivos Clínicos y Notas de Evolución
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Detalle de etapas, aparatología o protocolo de sesiones..."
                        value={tpEvolution}
                        onChange={(e) => setTpEvolution(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      Crear Plan de Tratamiento por Sesiones
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5.5: GALERÍA CLÍNICA ANTES/DESPUÉS Y VISOR RX / 3D
          ================================================================== */}
          {activeSection === 'imagenes' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Visor Interactivo de Radiografías / Comparador Antes y Después */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  {(() => {
                    const currentStudy =
                      imagingStudies.find((s) => s.id === activeStudyId) ||
                      imagingStudies[0];
                    if (!currentStudy) return null;
                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase mb-1">
                              {currentStudy.study_type.replace('_', ' ')} •{' '}
                              {currentStudy.zone_or_tooth}
                            </div>
                            <h2 className="text-base font-extrabold text-slate-900">
                              {currentStudy.title}
                            </h2>
                            <p className="text-xs text-slate-500">
                              Paciente: <strong>{currentStudy.patient_name}</strong> •
                              Especialista: {currentStudy.specialist_name}
                            </p>
                          </div>

                          {/* Herramientas de Imagen: Modo Negativo Rx + Zoom */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                setRxInvertContrast(!rxInvertContrast)
                              }
                              className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                                rxInvertContrast
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {rxInvertContrast
                                ? 'Contraste Invertido (Activo)'
                                : 'Invertir Contraste Rx'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRxZoomLevel((z) => (z >= 130 ? 100 : z + 15))
                              }
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                            >
                              Zoom: {rxZoomLevel}%
                            </button>
                          </div>
                        </div>

                        {/* Lienzo Clínico de Radiografía / Comparador Deslizante Antes vs Después */}
                        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-white p-6 min-h-[300px] flex flex-col justify-between select-none">
                          <div
                            className="transition-all duration-200"
                            style={{
                              filter: rxInvertContrast ? 'invert(1)' : 'none',
                              transform: `scale(${rxZoomLevel / 100})`
                            }}
                          >
                            <div className="grid grid-cols-2 gap-4 items-center">
                              {/* Lado ANTES / Vista Base */}
                              <div
                                className="p-5 rounded-2xl border border-slate-700 bg-slate-900/90 space-y-3"
                                style={{
                                  opacity: Math.max(
                                    0.35,
                                    (100 - beforeAfterSlider + 30) / 100
                                  )
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase">
                                    VISTA A • ANTES / BASE
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    DICOM / HD
                                  </span>
                                </div>

                                {/* Representación Anatómica Dental / Rx Vectorial */}
                                <div className="h-36 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border border-slate-700 flex flex-col items-center justify-center p-4 text-center">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    {[16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26].map(
                                      (tooth) => (
                                        <div
                                          key={tooth}
                                          className="w-4 h-7 rounded-t-md rounded-b-sm border border-amber-400/50 bg-amber-200/20 flex items-center justify-center text-[8px] font-mono text-amber-200"
                                        >
                                          {tooth}
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <p className="text-xs font-bold text-slate-200">
                                    {currentStudy.before_label}
                                  </p>
                                </div>
                              </div>

                              {/* Lado DESPUÉS / Vista Tratada */}
                              <div
                                className="p-5 rounded-2xl border border-sky-500/40 bg-sky-950/30 space-y-3"
                                style={{
                                  opacity: Math.max(
                                    0.35,
                                    (beforeAfterSlider + 30) / 100
                                  )
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase">
                                    VISTA B • DESPUÉS / CONTROL
                                  </span>
                                  <span className="text-[11px] text-sky-300 font-mono">
                                    CALIBRADO
                                  </span>
                                </div>

                                <div className="h-36 rounded-xl bg-gradient-to-br from-sky-950 via-slate-900 to-emerald-950 border border-emerald-500/40 flex flex-col items-center justify-center p-4 text-center">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    {[16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26].map(
                                      (tooth) => (
                                        <div
                                          key={tooth}
                                          className="w-4 h-7 rounded-t-md rounded-b-sm border border-emerald-400 bg-emerald-400/25 flex items-center justify-center text-[8px] font-mono text-white font-bold"
                                        >
                                          {tooth}
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <p className="text-xs font-bold text-emerald-200">
                                    {currentStudy.after_label}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Control deslizante interactivo Antes/Después */}
                          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                            <span className="text-slate-300 font-semibold">
                              Balance Comparativo Antes / Después ({beforeAfterSlider}%):
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={beforeAfterSlider}
                              onChange={(e) =>
                                setBeforeAfterSlider(Number(e.target.value))
                              }
                              className="w-full sm:w-64 accent-emerald-400 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Informe Radiológico / Hallazgos */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                            Informe de Hallazgos Radiográficos / Clínicos
                          </span>
                          <p className="font-semibold text-slate-800">
                            {currentStudy.findings_notes}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Lista de Estudios + Formulario para Subir Nuevo Estudio */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Estudios del Consultorio ({imagingStudies.length})
                    </h3>
                    <div className="space-y-2">
                      {imagingStudies.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setActiveStudyId(st.id)}
                          className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                            activeStudyId === st.id
                              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">
                              {st.patient_name}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {st.study_type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-slate-600 font-semibold mt-0.5">
                            {st.title}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form
                    onSubmit={handleCreateImagingStudy}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs"
                  >
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Registrar Nueva Imagen / Estudio Rx
                    </h3>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Tipo de Estudio
                      </label>
                      <select
                        value={imgType}
                        onChange={(e) =>
                          setImgType(
                            e.target.value as ClinicalImagingStudy['study_type']
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        <option value="rx_panoramica">
                          Radiografía Panorámica Digital
                        </option>
                        <option value="tomografia_3d">
                          Tomografía Cone Beam 3D (CBCT)
                        </option>
                        <option value="rx_periapical">
                          Radiografía Periapical
                        </option>
                        <option value="antes_despues">
                          Fotografía Clínica Antes / Después
                        </option>
                        <option value="ecografia_muscular">
                          Ecografía Musculoesquelética
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Título del Estudio *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Control Implante Pieza 36 / Diseño Sonrisa"
                        value={imgTitle}
                        onChange={(e) => setImgTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Pieza Dental / Zona Anatómica
                      </label>
                      <input
                        type="text"
                        value={imgZone}
                        onChange={(e) => setImgZone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hallazgos e Interpretación del Especialista
                      </label>
                      <textarea
                        rows={2}
                        value={imgFindings}
                        onChange={(e) => setImgFindings(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      Guardar Estudio en Ficha Digital
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5.6: CONTROL DE TRABAJOS DE LABORATORIO DENTAL / ORTOPÉDICO
          ================================================================== */}
          {activeSection === 'laboratorio' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Órdenes a Laboratorio Protésico / CAD-CAM / Ortopédico ({labOrders.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Controla coronas de zirconio, carillas, prótesis, alineadores y plantillas con colorímetro VITA y fecha de entrega.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {labOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px]">
                                {ord.order_code}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                                {ord.laboratory_name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                                Color: {ord.shade_color}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                              {ord.work_type} — {ord.tooth_or_zone}
                            </h3>
                            <div className="text-slate-600">
                              Paciente: <strong>{ord.patient_name}</strong> • Dr(a):{' '}
                              {ord.specialist_name}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] font-bold uppercase text-slate-400">
                              Entrega Prometida
                            </div>
                            <div className="font-extrabold text-slate-900">
                              {ord.due_date}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-bold">
                              Costo Lab: ${ord.lab_cost} → Arancel: ${ord.patient_price}
                            </div>
                          </div>
                        </div>

                        {/* Pipeline de Estado del Trabajo de Laboratorio */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {(
                            [
                              { id: 'enviado_lab', label: '1. Enviado Lab' },
                              { id: 'diseno_cad_cam', label: '2. Diseño CAD/CAM' },
                              { id: 'prueba_clinica', label: '3. En Prueba' },
                              { id: 'listo_instalar', label: '4. Listo Instalar' },
                              { id: 'entregado_paciente', label: '5. Entregado ✓' }
                            ] as const
                          ).map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => {
                                db.updateLabOrderStatus(ord.id, st.id);
                                refreshData();
                                notify(
                                  `Orden ${ord.order_code} actualizada a: ${st.label}`
                                );
                              }}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] border cursor-pointer transition ${
                                ord.status === st.id
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulario Nueva Orden de Laboratorio */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Enviar Nuevo Trabajo a Laboratorio Externo
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    El costo del laboratorio se registrará automáticamente como Egreso en el módulo de Finanzas.
                  </p>

                  <form
                    onSubmit={handleCreateLabOrder}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Laboratorio Dental / Ortopédico *
                      </label>
                      <input
                        type="text"
                        required
                        value={labName}
                        onChange={(e) => setLabName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Trabajo Solicitado *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Corona Zirconio / Carilla E-max / Plantilla 3D"
                        value={labWorkType}
                        onChange={(e) => setLabWorkType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Pieza Dental / Zona
                        </label>
                        <input
                          type="text"
                          value={labZone}
                          onChange={(e) => setLabZone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Colorímetro VITA / Material
                        </label>
                        <select
                          value={labShade}
                          onChange={(e) => setLabShade(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                        >
                          <option value="VITA A1">VITA A1 (Claro Natural)</option>
                          <option value="VITA A2">VITA A2 (Estándar)</option>
                          <option value="VITA A3">VITA A3 (Cálido)</option>
                          <option value="VITA B1">VITA B1 (Estético)</option>
                          <option value="VITA BL2">VITA BL2 (Bleach / Diseño)</option>
                          <option value="Acrílico Termocurado">
                            Acrílico Termocurado
                          </option>
                          <option value="EVA Ortopédico">EVA Ortopédico</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Costo Lab ($)
                        </label>
                        <input
                          type="number"
                          value={labCost}
                          onChange={(e) => setLabCost(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Precio Paciente ($)
                        </label>
                        <input
                          type="number"
                          value={labPatientPrice}
                          onChange={(e) =>
                            setLabPatientPrice(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Fecha Entrega
                        </label>
                        <input
                          type="date"
                          value={labDueDate}
                          onChange={(e) => setLabDueDate(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Especificaciones Técnicas para el protésico
                      </label>
                      <textarea
                        rows={2}
                        value={labNotes}
                        onChange={(e) => setLabNotes(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      Emitir Orden a Laboratorio + Registrar Egreso
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5.7: SALA DE ESPERA DIGITAL (TV / TURNERO EN TIEMPO REAL)
          ================================================================== */}
          {activeSection === 'turnero' && (
            <div className="space-y-6">
              {/* Pantalla Principal Modo TV Sala de Espera */}
              <div
                className={`rounded-3xl bg-slate-950 text-white border-2 border-slate-800 p-6 shadow-2xl transition-all ${
                  tvFullMode ? 'fixed inset-4 z-50 overflow-y-auto' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-white"
                      style={{ backgroundColor: tenant.theme_color }}
                    >
                      <Tv className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                        PEPEMEDIC TV • SALA DE ESPERA EN VIVO
                      </div>
                      <h2 className="text-xl font-extrabold">{tenant.name}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                      Hora Actual: {new Date().toTimeString().slice(0, 5)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setTvFullMode(!tvFullMode)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs cursor-pointer"
                    >
                      {tvFullMode
                        ? 'Salir de Pantalla Completa TV'
                        : 'Expandir Modo TV Recepción'}
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Turno Llamando Ahora en Grande */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      LLAMANDO EN PANTALLA AHORA
                    </div>

                    {waitingTickets
                      .filter((w) => w.status === 'llamando_pantalla')
                      .map((calling) => (
                        <div
                          key={calling.id}
                          className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl border border-emerald-400/40 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-xl bg-black/30 font-mono text-2xl font-extrabold tracking-wider">
                              {calling.ticket_code}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white text-emerald-900 font-extrabold text-xs uppercase">
                              Pasar a: {calling.box_room}
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl font-extrabold">
                            {calling.patient_name}
                          </div>
                          <div className="text-xs text-emerald-100 font-semibold">
                            Especialista: {calling.specialist_name} •{' '}
                            {calling.service_name}
                          </div>
                        </div>
                      ))}

                    {waitingTickets.filter(
                      (w) => w.status === 'llamando_pantalla'
                    ).length === 0 && (
                      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                        Ningún paciente en llamado activo en este instante. Haz clic en «Llamar en TV» en la cola derecha.
                      </div>
                    )}
                  </div>

                  {/* Próximos Turnos en Sala de Espera */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      PRÓXIMOS PACIENTES EN SALA DE ESPERA
                    </div>

                    {waitingTickets
                      .filter((w) => w.status !== 'atendido')
                      .map((wt) => (
                        <div
                          key={wt.id}
                          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-2 rounded-xl bg-slate-800 text-sky-400 font-mono font-extrabold text-sm">
                              {wt.ticket_code}
                            </span>
                            <div>
                              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                                {wt.patient_name}
                                {wt.priority === 'preferencial_urgencia' && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px]">
                                    URGENCIA
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400">
                                {wt.box_room} • {wt.specialist_name} (Llegada:{' '}
                                {wt.arrival_time})
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                db.updateWaitingTicketStatus(
                                  wt.id,
                                  'llamando_pantalla'
                                );
                                refreshData();
                                notify(
                                  `🔔 Llamando en TV a ${wt.patient_name} (${wt.box_room})`
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                            >
                              🔔 Llamar en TV
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                db.updateWaitingTicketStatus(wt.id, 'atendido');
                                refreshData();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                            >
                              Finalizar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Registro rápido de Check-in en Recepción */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Check-In Rápido de Paciente a Sala de Espera
                </h3>
                <form
                  onSubmit={handleCreateWaitingTicket}
                  className="grid sm:grid-cols-5 gap-3 text-xs"
                >
                  <input
                    type="text"
                    required
                    placeholder="Nombre del Paciente que llegó *"
                    value={wtPatientName}
                    onChange={(e) => setWtPatientName(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Consultorio / Box (ej. Sillón Dental 1)"
                    value={wtBoxRoom}
                    onChange={(e) => setWtBoxRoom(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Motivo / Tratamiento"
                    value={wtServiceName}
                    onChange={(e) => setWtServiceName(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                  <select
                    value={wtPriority}
                    onChange={(e) =>
                      setWtPriority(
                        e.target.value as WaitingRoomTicket['priority']
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="normal">Prioridad Normal</option>
                    <option value="preferencial_urgencia">
                      Urgencia / Preferencial
                    </option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    + Generar Turno TV
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 5.8: CAMPAÑAS DE REACTIVACIÓN WHATSAPP / RECALL CLÍNICO
          ================================================================== */}
          {activeSection === 'campanas' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-1">
                      <Megaphone className="w-3.5 h-3.5" />
                      Motor de Fidelización & Recall Clínico Automatizado (Railway Bot)
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Campañas de Reactivación de Pacientes por WhatsApp ({recallCampaigns.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Recupera pacientes para su limpieza dental cada 6 meses, controles post-operatorios y planes de fisioterapia incompletos.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {recallCampaigns.map((rc) => (
                      <div
                        key={rc.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {rc.patient_name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] uppercase">
                                {rc.campaign_type.replace('_', ' ')}
                              </span>
                              {rc.promo_discount_pct > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                                  {rc.promo_discount_pct}% OFF
                                </span>
                              )}
                            </div>
                            <div className="text-slate-600 font-semibold mt-0.5">
                              Motivo: {rc.reason_label} • Última visita:{' '}
                              {rc.last_visit_date}
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              rc.status === 'enviado_wa'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rc.status === 'enviado_wa'
                              ? '✓ Enviado por Bot'
                              : 'Pendiente de Envío'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 italic">
                          "{rc.message_template}"
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={sendingRecallId === rc.id}
                            onClick={() => handleSendRecallWhatsApp(rc)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {sendingRecallId === rc.id
                              ? 'Enviando por Railway...'
                              : 'Disparar WhatsApp vía Railway'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Programar Nuevo Recordatorio de Reactivación (Recall)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Crea un recordatorio personalizado con descuento para que el paciente vuelva a agendar en el portal online.
                  </p>

                  <form
                    onSubmit={handleCreateRecallCampaign}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Seleccionar Paciente
                      </label>
                      <select
                        value={tpPatientName}
                        onChange={(e) => {
                          const found = patients.find(
                            (p) => p.name === e.target.value
                          );
                          setTpPatientName(e.target.value);
                          if (found) setTpPatientPhone(found.phone);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({p.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Motivo Clínico del Recall *
                      </label>
                      <input
                        type="text"
                        required
                        value={recReason}
                        onChange={(e) => setRecReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Servicio Recomendado
                        </label>
                        <input
                          type="text"
                          value={recService}
                          onChange={(e) => setRecService(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Descuento Promocional (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={recDiscount}
                          onChange={(e) =>
                            setRecDiscount(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      + Añadir a Campaña de Reactivación
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 6: PERSONAL MÉDICO Y HORARIOS
          ================================================================== */}
          {activeSection === 'personal' && (
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h2 className="text-base font-bold text-slate-900 mb-1">
                    Plantel de Especialistas ({specialists.length})
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Configura los doctores, odontólogos o fisioterapeutas habilitados en PEPEMEDIC.
                  </p>

                  <div className="space-y-3">
                    {specialists.map((spec) => (
                      <div
                        key={spec.id}
                        className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
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
                          <div>
                            <div className="font-bold text-sm text-slate-900">
                              {spec.name}
                            </div>
                            <div className="text-xs font-semibold text-sky-700">
                              {spec.role_title}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {spec.bio}
                            </p>
                            <div className="text-[11px] text-slate-400 mt-1">
                              Turno: {spec.start_time} a {spec.end_time} • Lun a Sáb
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            db.toggleSpecialist(spec.id);
                            refreshData();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                            spec.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {spec.active ? 'En Agenda' : 'Inactivo'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Registrar Nuevo Personal Clínico
                </h3>
                <form onSubmit={handleCreateSpecialist} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nombre Completo y Grado *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Dra. Sofía Miranda / Lic. Marco Paz"
                      value={specName}
                      onChange={(e) => setSpecName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Especialidad / Cargo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Rehabilitación Oral / Kinesiólogo"
                      value={specRole}
                      onChange={(e) => setSpecRole(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Reseña Profesional
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Especialista en endodoncia mecanizada"
                      value={specBio}
                      onChange={(e) => setSpecBio(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hora Inicio
                      </label>
                      <input
                        type="time"
                        value={specStart}
                        onChange={(e) => setSpecStart(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hora Fin
                      </label>
                      <input
                        type="time"
                        value={specEnd}
                        onChange={(e) => setSpecEnd(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Color Agenda
                      </label>
                      <input
                        type="color"
                        value={specColor}
                        onChange={(e) => setSpecColor(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-300 cursor-pointer"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                  >
                    Incorporar al Equipo PEPEMEDIC
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 7: SERVICIOS Y ARANCELES
          ================================================================== */}
          {activeSection === 'servicios' && (
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h2 className="text-base font-bold text-slate-900">
                  Catálogo de Tratamientos y Aranceles ({services.length})
                </h2>
                <div className="divide-y divide-slate-200">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {srv.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {srv.duration_min} min
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Precio Total: <strong>${srv.price}</strong> • Seña Reserva:{' '}
                          <strong className="text-emerald-700">
                            ${srv.deposit_amount}
                          </strong>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          db.toggleService(srv.id);
                          refreshData();
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          srv.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {srv.active ? 'Activo' : 'Pausado'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Agregar Nuevo Tratamiento / Consulta
                </h3>
                <form onSubmit={handleCreateService} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nombre del Tratamiento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Endodoncia Molar / Punción Seca"
                      value={srvName}
                      onChange={(e) => setSrvName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Categoría Clínica
                    </label>
                    <input
                      type="text"
                      value={srvCategory}
                      onChange={(e) => setSrvCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Duración (min)
                      </label>
                      <input
                        type="number"
                        value={srvDuration}
                        onChange={(e) => setSrvDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Precio ($)
                      </label>
                      <input
                        type="number"
                        value={srvPrice}
                        onChange={(e) => setSrvPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Seña ($)
                      </label>
                      <input
                        type="number"
                        value={srvDeposit}
                        onChange={(e) => setSrvDeposit(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                  >
                    Guardar Tratamiento
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA: INVENTARIO DE INSUMOS Y MATERIALES CLÍNICOS
          ================================================================== */}
          {activeSection === 'insumos' && (
            <div className="space-y-6">
              {/* KPIs de Inventario */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Ítems en Almacén Clínico
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-1">
                      {supplies.length}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Control por lotes y unidad
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Valorizado Total en Stock
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                      ${totalInventoryValue}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Costo de reposición calculado
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      Alertas de Stock Crítico
                    </span>
                    <div
                      className={`text-2xl font-extrabold mt-1 ${
                        lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {lowStockCount}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {lowStockCount > 0
                        ? 'Requieren reposición inmediata'
                        : 'Todo el stock sobre el mínimo'}
                    </div>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      lowStockCount > 0
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                {/* Tabla de Insumos con Consumo y Reposición 1-Click */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-5 border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-900">
                      Control de Stock de Insumos y Materiales ({supplies.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Descuenta materiales usados en consulta o repón inventario asentando automáticamente el gasto en Finanzas.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                          <th className="py-3 px-4">Insumo / SKU</th>
                          <th className="py-3 px-4">Categoría & Proveedor</th>
                          <th className="py-3 px-4">Stock Actual</th>
                          <th className="py-3 px-4">Costo Unit.</th>
                          <th className="py-3 px-4 text-right">
                            Movimientos de Almacén
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {supplies.map((sup) => {
                          const isLow = sup.current_stock <= sup.min_stock;
                          return (
                            <tr key={sup.id} className="hover:bg-slate-50/80">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900">
                                  {sup.name}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  SKU: {sup.sku}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-700">
                                  {sup.category}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {sup.supplier}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-extrabold ${
                                      isLow ? 'text-rose-600' : 'text-emerald-700'
                                    }`}
                                  >
                                    {sup.current_stock} {sup.unit}
                                  </span>
                                  {isLow && (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-bold uppercase">
                                      Bajo (Mín {sup.min_stock})
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                ${sup.unit_cost}
                              </td>

                              <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(sup.id, -1, false)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                                  title="Descontar 1 unidad por uso en consultorio"
                                >
                                  -1 Uso
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(sup.id, 5, true)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                                  title="Sumar 5 unidades y registrar compra en Finanzas"
                                >
                                  +5 Comprar (${sup.unit_cost * 5})
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Formulario Nuevo Insumo */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                  <h3 className="text-base font-bold text-slate-900 mb-3">
                    Registrar Nuevo Insumo Clínico
                  </h3>
                  <form onSubmit={handleCreateSupply} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nombre del Material / Insumo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ionómero de Vidrio / Bandas TheraBand"
                        value={supName}
                        onChange={(e) => setSupName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Código SKU
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. OD-ION-01"
                          value={supSku}
                          onChange={(e) => setSupSku(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Categoría
                        </label>
                        <input
                          type="text"
                          value={supCategory}
                          onChange={(e) => setSupCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Stock Inicial
                        </label>
                        <input
                          type="number"
                          value={supStock}
                          onChange={(e) => setSupStock(Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Stock Mín.
                        </label>
                        <input
                          type="number"
                          value={supMinStock}
                          onChange={(e) => setSupMinStock(Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Costo ($)
                        </label>
                        <input
                          type="number"
                          value={supCost}
                          onChange={(e) => setSupCost(Number(e.target.value))}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Unidad de Medida
                        </label>
                        <input
                          type="text"
                          placeholder="Cajas, Jeringas, Kits"
                          value={supUnit}
                          onChange={(e) => setSupUnit(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Proveedor
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre distribuidora"
                          value={supSupplier}
                          onChange={(e) => setSupSupplier(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                    >
                      Guardar en Inventario
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA: CONFIGURACIÓN DE ROLES, PERMISOS RBAC Y USUARIOS
          ================================================================== */}
          {activeSection === 'roles' && (
            <div className="space-y-6">
              {/* Matriz Interactiva de Permisos por Rol (RBAC) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      Seguridad Multi-Tenant (Supabase RLS + RBAC)
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Matriz de Permisos y Accesos por Rol en PEPEMEDIC
                    </h2>
                    <p className="text-xs text-slate-500">
                      Marca o desmarca qué módulos puede visualizar cada rol en el menú lateral. Puedes probar cada rol en vivo con el selector superior.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs bg-sky-50 px-3 py-2 rounded-xl border border-sky-200">
                    <Shield className="w-4 h-4 text-sky-600" />
                    <span>
                      Probando como:{' '}
                      <strong className="uppercase text-sky-900">
                        {simulatedRole}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                        <th className="py-3 px-4">Rol en la Clínica</th>
                        {[
                          { id: 'dashboard', label: 'Dashboard' },
                          { id: 'pos', label: 'Caja POS' },
                          { id: 'finanzas', label: 'Finanzas' },
                          { id: 'calendario', label: 'Calendario' },
                          { id: 'reservas', label: 'Reservas' },
                          { id: 'clientes', label: 'Clientes' },
                          { id: 'personal', label: 'Personal' },
                          { id: 'servicios', label: 'Servicios' },
                          { id: 'insumos', label: 'Insumos' },
                          { id: 'railway', label: 'Railway' }
                        ].map((mod) => (
                          <th key={mod.id} className="py-3 px-2.5 text-center">
                            {mod.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rolePermissions.map((rp) => (
                        <tr key={rp.role} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {rp.label}
                            </div>
                            <div className="text-[11px] text-slate-500 max-w-xs">
                              {rp.description}
                            </div>
                          </td>
                          {[
                            'dashboard',
                            'pos',
                            'finanzas',
                            'calendario',
                            'reservas',
                            'clientes',
                            'personal',
                            'servicios',
                            'insumos',
                            'railway'
                          ].map((modId) => {
                            const allowed = rp.allowed_modules.includes(modId);
                            return (
                              <td key={modId} className="py-3.5 px-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={allowed}
                                  disabled={rp.role === 'owner'}
                                  onChange={() => {
                                    db.toggleRoleModulePermission(rp.role, modId);
                                    refreshData();
                                    notify(
                                      `Permiso ${modId.toUpperCase()} actualizado para ${rp.label}`
                                    );
                                  }}
                                  className="w-4 h-4 accent-sky-600 rounded cursor-pointer disabled:opacity-50"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lista de Usuarios del Consultorio + Crear Nuevo Usuario */}
              <div className="grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Usuarios con Acceso al Consultorio ({members.length})
                  </h3>

                  <div className="divide-y divide-slate-200 text-xs">
                    {members.map((mem) => (
                      <div
                        key={mem.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {mem.name}
                          </div>
                          <div className="text-slate-500">
                            {mem.email} • Último acceso: {mem.last_login}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={mem.role}
                            onChange={(e) => {
                              db.updateMemberRole(
                                mem.id,
                                e.target.value as StaffRoleType
                              );
                              refreshData();
                              notify(`Rol actualizado para ${mem.name}`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                          >
                            <option value="owner">Dueño (Owner)</option>
                            <option value="admin">Administrador</option>
                            <option value="specialist">Especialista / Doctor</option>
                            <option value="receptionist">Recepcionista POS</option>
                            <option value="assistant">Asistente / Enfermería</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              db.toggleMemberStatus(mem.id);
                              refreshData();
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                              mem.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {mem.active ? 'Activo' : 'Suspendido'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 h-fit">
                  <h3 className="text-base font-bold text-slate-900 mb-3">
                    Invitar / Asignar Rol a Nuevo Usuario
                  </h3>
                  <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nombre del Colaborador *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Lic. Paola Méndez (Recepción)"
                        value={memName}
                        onChange={(e) => setMemName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Correo Electrónico (Supabase Auth) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="paola@clinica.com"
                        value={memEmail}
                        onChange={(e) => setMemEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Rol de Acceso en PEPEMEDIC *
                      </label>
                      <select
                        value={memRole}
                        onChange={(e) =>
                          setMemRole(e.target.value as StaffRoleType)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        <option value="receptionist">
                          Recepcionista / Cajero POS
                        </option>
                        <option value="specialist">
                          Especialista / Odontólogo / Fisio
                        </option>
                        <option value="assistant">
                          Asistente Clínico / Enfermería
                        </option>
                        <option value="admin">Administrador General</option>
                        <option value="owner">Dueño / Director Clínico</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                    >
                      Crear Cuenta y Asignar Rol
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VENTANA 8: RAILWAY WORKER, WHATSAPP LOGS & PAGOS SAAS
          ================================================================== */}
          {activeSection === 'railway' && (
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      Microservicio Node.js en Railway
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      Cola de Recordatorios Automáticos (WhatsApp 24h / 2h)
                    </h2>
                  </div>

                  <button
                    onClick={handleRunCronNow}
                    disabled={runningCron}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${runningCron ? 'animate-spin' : ''}`}
                    />
                    Ejecutar Barrido Cron Ahora
                  </button>
                </div>

                <div className="space-y-2.5">
                  {waLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.to}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold uppercase">
                            {log.type}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-600">{log.messagePreview}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">
                      Suscripción PEPEMEDIC SaaS
                    </h3>
                    <CreditCard className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                    <div>
                      <div className="text-slate-500">Licencia de Clínica:</div>
                      <div className="text-base font-extrabold text-sky-900 uppercase">
                        PLAN {tenant.plan}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                      Activo
                    </span>
                  </div>

                  <div className="pt-2 space-y-2">
                    <label className="block font-semibold text-slate-700">
                      Instrucciones de Cobro QR / Transferencia para Pacientes
                    </label>
                    <textarea
                      rows={3}
                      value={tenant.payment_instructions}
                      onChange={(e) => {
                        db.updateTenant(tenant.id, {
                          payment_instructions: e.target.value
                        });
                        refreshData();
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          MODAL COMPROBANTE: NOTA DE RESERVA / NOTA DE CONCLUSIÓN DE SERVICIO
      ====================================================================== */}
      {viewingPosReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-xs">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight">
                    PEPE<span className="text-sky-400">MEDIC</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      viewingPosReceipt.note_type === 'nota_conclusion'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}
                  >
                    {viewingPosReceipt.note_type === 'nota_conclusion'
                      ? 'Nota de Conclusión de Servicio'
                      : 'Nota de Reserva (Seña)'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  {tenant.name} • {tenant.address}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-sky-400">
                  {viewingPosReceipt.folio_number}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(viewingPosReceipt.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Datos del Paciente y Doctor */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold">
                    Paciente / Cliente
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {viewingPosReceipt.patient_name}
                  </div>
                  <div className="text-slate-500">
                    Tel: {viewingPosReceipt.patient_phone}{' '}
                    {viewingPosReceipt.patient_dni &&
                      `• CI: ${viewingPosReceipt.patient_dni}`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold">
                    Especialista Responsable
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {viewingPosReceipt.specialist_name}
                  </div>
                  <div className="text-slate-500 uppercase text-[10px] font-semibold">
                    Pago: {viewingPosReceipt.payment_method} (
                    {viewingPosReceipt.payment_reference})
                  </div>
                </div>
              </div>

              {/* Tabla de Servicios y Costos */}
              <div>
                <div className="font-bold uppercase text-[10px] text-slate-500 mb-2">
                  Detalle de Servicios y Costos
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-left">
                      <th className="py-1.5">Cant.</th>
                      <th className="py-1.5">Servicio / Procedimiento</th>
                      <th className="py-1.5 text-right">P. Unit</th>
                      <th className="py-1.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingPosReceipt.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 font-bold">{item.qty}x</td>
                        <td className="py-2 font-semibold text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-2 text-right">${item.unit_price}</td>
                        <td className="py-2 text-right font-bold">
                          ${item.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notas de Reserva y de Conclusión */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="font-bold text-sky-900 text-[10px] uppercase">
                    📋 Nota de Reserva (Antecedente / Cita):
                  </div>
                  <p className="text-slate-700 mt-0.5">
                    {viewingPosReceipt.reservation_notes}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="font-bold text-emerald-900 text-[10px] uppercase">
                    ✅ Nota de Conclusión de Servicio (Detalle Clínico):
                  </div>
                  <p className="text-slate-700 mt-0.5">
                    {viewingPosReceipt.conclusion_notes}
                  </p>
                </div>
              </div>

              {/* Totales */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal de Servicios:</span>
                  <span>${viewingPosReceipt.subtotal}</span>
                </div>
                {viewingPosReceipt.deposit_deducted > 0 && (
                  <div className="flex justify-between text-sky-300">
                    <span>(-) Seña de Reserva Previa:</span>
                    <span>-${viewingPosReceipt.deposit_deducted}</span>
                  </div>
                )}
                {viewingPosReceipt.discount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>(-) Descuento Aplicado:</span>
                    <span>-${viewingPosReceipt.discount}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-700 flex justify-between font-extrabold text-sm">
                  <span>MONTO TOTAL ABONADO:</span>
                  <span className="text-emerald-400">
                    ${viewingPosReceipt.total_paid}
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <a
                  href={`https://wa.me/${viewingPosReceipt.patient_phone.replace(
                    /[^0-9]/g,
                    ''
                  )}?text=${encodeURIComponent(
                    `*PEPEMEDIC - ${
                      viewingPosReceipt.note_type === 'nota_conclusion'
                        ? 'NOTA DE CONCLUSIÓN DE SERVICIO'
                        : 'NOTA DE RESERVA'
                    } (${viewingPosReceipt.folio_number})*\nClínica: ${
                      tenant.name
                    }\nPaciente: ${
                      viewingPosReceipt.patient_name
                    }\nDetalle: ${viewingPosReceipt.items
                      .map((i) => `${i.qty}x ${i.name} ($${i.subtotal})`)
                      .join(', ')}\nTotal Abonado: $${
                      viewingPosReceipt.total_paid
                    }\nConclusión: ${viewingPosReceipt.conclusion_notes}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Enviar Nota por WhatsApp
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingPosReceipt(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: NUEVA RESERVA RÁPIDA DE RECEPCIÓN
      ====================================================================== */}
      {showNewApptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  Recepción PEPEMEDIC
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Agendar Cita Manualmente
                </h3>
              </div>
              <button
                onClick={() => setShowNewApptModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickAppt} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Paciente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Carlos Bolaños"
                  value={newApptPatient}
                  onChange={(e) => setNewApptPatient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={newApptPhone}
                  onChange={(e) => setNewApptPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tratamiento *
                  </label>
                  <select
                    value={newApptServiceId}
                    onChange={(e) => setNewApptServiceId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Especialista *
                  </label>
                  <select
                    value={newApptSpecId}
                    onChange={(e) => setNewApptSpecId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={newApptDate}
                    onChange={(e) => setNewApptDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hora *
                  </label>
                  <select
                    value={newApptTime}
                    onChange={(e) => setNewApptTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {HOURS_GRID.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nota de Reserva / Motivo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Paciente refiere dolor agudo"
                  value={newApptNotes}
                  onChange={(e) => setNewApptNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewApptModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                >
                  Guardar en Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: NUEVO CLIENTE / PACIENTE
      ====================================================================== */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  CRM Clínico PEPEMEDIC
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Nuevo Paciente / Cliente
                </h3>
              </div>
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Claudia Patricia Soliz"
                  value={patName}
                  onChange={(e) => setPatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={patPhone}
                    onChange={(e) => setPatPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CI / DNI
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 4829102"
                    value={patDni}
                    onChange={(e) => setPatDni(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    value={patEmail}
                    onChange={(e) => setPatEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Etiqueta Clínica
                  </label>
                  <input
                    type="text"
                    value={patTag}
                    onChange={(e) => setPatTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Antecedentes / Notas Clínicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Alergias, diagnóstico inicial, plan dental o fisioterapéutico..."
                  value={patNotes}
                  onChange={(e) => setPatNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
                >
                  Guardar Ficha Clínica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDITAR HISTORIAL DE PACIENTE
      ====================================================================== */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  Ficha Clínica Digital
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPatient.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingPatient(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Evolución y Notas Clínicas
              </label>
              <textarea
                rows={4}
                value={editingPatient.clinical_notes || ''}
                onChange={(e) =>
                  setEditingPatient({
                    ...editingPatient,
                    clinical_notes: e.target.value
                  })
                }
                className="w-full p-3 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPatient(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  db.updatePatient(editingPatient.id, {
                    clinical_notes: editingPatient.clinical_notes
                  });
                  setEditingPatient(null);
                  refreshData();
                  notify('Historial clínico actualizado');
                }}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: RECETA MÉDICA / ORDEN DE ESTUDIO / CONSENTIMIENTO IMPRIMIBLE
      ====================================================================== */}
      {viewingPrescription && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-xs my-8">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                  PEPEMEDIC • {viewingPrescription.doc_type.replace('_', ' ')}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {tenant.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {tenant.address} • Tel: {tenant.phone}
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono font-extrabold text-sm text-slate-900">
                  {viewingPrescription.folio}
                </div>
                <div className="text-[11px] text-slate-400">
                  Fecha: {viewingPrescription.created_at}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Paciente
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {viewingPrescription.patient_name}
                </span>
                <div className="text-[11px] text-slate-500">
                  Tel: {viewingPrescription.patient_phone}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Especialista Tratante
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {viewingPrescription.specialist_name}
                </span>
                <div className="text-[11px] text-sky-700 font-semibold">
                  {viewingPrescription.specialist_role}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                Diagnóstico Clínico
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                {viewingPrescription.diagnosis}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Rp. / Detalle de Prescripción u Orden ({viewingPrescription.items.length})
              </div>
              {viewingPrescription.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white"
                >
                  <div className="font-extrabold text-slate-900">
                    {idx + 1}. {item.title}
                  </div>
                  <div className="text-slate-600 mt-0.5">{item.dosageOrSpec}</div>
                </div>
              ))}
            </div>

            {viewingPrescription.indications && (
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Indicaciones y Cuidados Especiales
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
                  {viewingPrescription.indications}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>Firma y Sello Digital del Especialista</span>
              <span>Certificado por PEPEMEDIC Cloud</span>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewingPrescription(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/${viewingPrescription.patient_phone.replace(
                  /[^0-9]/g,
                  ''
                )}?text=${encodeURIComponent(
                  `Hola ${viewingPrescription.patient_name}, te enviamos tu documento clínico *${viewingPrescription.folio}* (${viewingPrescription.doc_type.toUpperCase()}) emitido por ${viewingPrescription.specialist_name} en *${tenant.name}*:\n\n*Diagnóstico:* ${viewingPrescription.diagnosis}\n\n*Indicaciones:*\n${viewingPrescription.items
                    .map((i, idx) => `${idx + 1}. *${i.title}*: ${i.dosageOrSpec}`)
                    .join('\n')}\n\n_${viewingPrescription.indications}_`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Enviar Receta por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
