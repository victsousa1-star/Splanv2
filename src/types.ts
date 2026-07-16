// --- Types ---

export type Status = "Em Execução" | "Pausada" | "Finalizada";

export interface Service {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  startDate?: string;
  endDate?: string;
  baselineStartDate?: string;
  baselineEndDate?: string;
  progress?: number;
  isMacro?: boolean;
  parentId?: string;
  dependencyIds?: string[];
  reprogrammingHistory?: {
    id: string;
    date: string;
    previousStartDate?: string;
    previousEndDate?: string;
    newStartDate?: string;
    newEndDate?: string;
  }[];
}

export interface MeasurementPeriod {
  id: string;
  number: number;
  date: string;
  providerId?: string;
  retentionPercentage?: number;
}

export interface Provider {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

export interface Measurement {
  id: string;
  serviceId: string;
  periodId: string;
  date: string;
  quantity: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  value: number;
  fileName: string;
  fileData?: string;
  natureza?: string;
  provider?: string;
  ocNumber?: string;
}

export type OCStatus = "Para aprovação" | "Aprovado" | "Negado";

export interface OC {
  id: string;
  number: string;
  paymentForecast: string;
  status: OCStatus;
  totalValue: number;
  description?: string;
  createdAt?: number;
}

export type DisbursementType = "Obra Civil" | "Instalações" | "Equipamento" | "Móveis";

export interface DisbursementCategoryConfig {
  contractValue: number | string;
  financingValue: number | string;
}
export type DisbursementConfig = Partial<
  Record<DisbursementType, DisbursementCategoryConfig>
>;

export interface Disbursement {
  id: string;
  date: string;
  value: number;
  type: DisbursementType;
  description: string;
  installment?: string;
  status?: "Pago" | "Aguardando Pagamento";
}

export interface RDOPhoto {
  id: string;
  url: string;
  description: string;
  timestamp: number;
}

export interface RDOLabor {
  id: string;
  role: string;
  quantity: number;
}

export interface RDOEquipment {
  id: string;
  name: string;
  quantity: number;
}

export interface ReportConfig {
  companyName?: string;
  cnpj?: string;
  phone?: string;
  city?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface RDO {
  id: string;
  date: string;
  weatherMorning: "bom" | "nublado" | "chuvoso" | "impraticavel";
  weatherAfternoon: "bom" | "nublado" | "chuvoso" | "impraticavel";
  weatherNight: "bom" | "nublado" | "chuvoso" | "impraticavel";
  labor: RDOLabor[];
  equipments: RDOEquipment[];
  activities: string;
  occurrences: string;
  weather?: string; // legacy support
  notes?: string; // legacy support
  photos: RDOPhoto[];
}

export interface EnvioMacro {
  id: string;
  name: string;
  date: string;
  metas: {
    obraCivil: number;
    instalacoes: number;
    equipamentos: number;
    moveis: number;
  };
  enviados: {
    obraCivil: number;
    instalacoes: number;
    equipamentos: number;
    moveis: number;
  };
}

export interface Location {
  id: string;
  name: string;
  ownerId: string;
  type?: 'shopping' | 'obra' | 'allowance';
  allowanceFields?: {
    storeName?: string;
    value?: number;
  };
  iconUrl?: string;
  reportConfig?: ReportConfig;
  sharedWith?: Record<string, any>;
  sharedEmails?: string[];
  customSlides?: CustomSlide[];
  slideOrder?: string[];
  disbursements?: Disbursement[];
  disbursementConfig?: DisbursementConfig;
  accountability?: AccountabilityEntry[];
  releaseReferences?: Record<string, number>;
  accountabilityInstallments?: string[];
  enviosMacros?: EnvioMacro[];
}

export interface AccountabilityEntry {
  id: string;
  date: string;
  description: string;
  value: number;
  category: "Alimentação" | "Hospedagem" | "Combustível" | "Material / Suprimentos" | "Ferramentas" | "Outro";
  status: "Pendente" | "Aprovado" | "Rejeitado";
  receiptUrl?: string;
  notes?: string;
  installment: string; // Links to Disbursement's installment (e.g. "1ª Liberação")
  invoiceNumber?: string; // Number of the invoice (Nota Fiscal)
  providerName?: string; // Name of the provider/supplier
  type?: DisbursementType;
}

export interface SlideElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  url?: string;
  fontSize?: number;
  color?: string;
}

export interface CustomSlide {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  elements?: SlideElement[];
  type: "text" | "image" | "chart" | "canvas";
  imageUrl?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  locationId: string;
  startDate: string;
  status: Status;
  services: Service[];
  measurements: Measurement[];
  measurementPeriods?: MeasurementPeriod[];
  providers?: Provider[];
  invoices: Invoice[];
  ocs?: OC[];
  disbursements?: Disbursement[];
  disbursementConfig?: DisbursementConfig;
  rdos?: RDO[];
  enabledTabs?: string[];
  sharedId?: string;
  ownerId: string;
  reportConfig?: any;
  sharedWith?: Record<string, any>;
  sharedEmails?: string[];
}

export type Role = "owner" | "editor" | "viewer" | "none";

export interface AppConfig {
  name: string;
  logoUrl: string | null;
}

export interface Allowance {
  id: string;
  storeName: string;
  value: number;
  ownerId: string;
  createdAt: number;
}

export interface AllowanceSupplier {
  id: string;
  allowanceId: string;
  name: string;
  cnpj?: string;
  contact?: string;
  ownerId: string;
  createdAt: number;
}

export interface AllowanceOC {
  id: string;
  allowanceId: string;
  supplierId: string;
  number: string;
  value: number;
  description?: string;
  ownerId: string;
  createdAt: number;
  status?: "Aguardando" | "Aprovada" | "Reprovada";
}

export type AllowanceContractType = "Subsídio de Obra" | "Carência de Aluguel" | "Verba de Instalação" | "Outro";
export type AllowancePeriodicity = "Mensal" | "Bimestral" | "Trimestral" | "Semestral" | "Anual";

export interface AllowanceContract {
  id: string;
  allowanceId: string;
  supplierId: string;
  type: AllowanceContractType;
  totalValue: number;
  installmentsCount: number;
  periodicity: AllowancePeriodicity;
  startDate: string;
  status: "Ativo" | "Finalizado" | "Pausado";
  ownerId: string;
  createdAt: number;
  ocNumber?: string;
}

export interface AllowanceInstallment {
  id: string;
  contractId: string;
  allowanceId: string;
  number: number;
  dueDate: string;
  value: number;
  paidValue: number;
  status: "Pendente" | "Pago" | "Atrasado";
  ocId?: string;
  ownerId: string;
  createdAt: number;
}

export interface AllowancePayment {
  id: string;
  installmentId: string;
  contractId: string;
  allowanceId: string;
  ocId?: string;
  date: string;
  value: number;
  method: "PIX" | "TED" | "Boleto" | "Outro";
  documentNumber: string;
  invoiceUrl?: string;
  invoiceName?: string;
  ownerId: string;
  createdAt: number;
}
