
export enum ViewType {
  DASHBOARD = 'dashboard',
  SALES = 'sales',
  PROPOSALS = 'proposals',
  CONTRACTS = 'contracts',
  SERVICES = 'services',
  EXPENSES = 'expenses',
  FINANCIAL = 'financial',
  SETTINGS = 'settings'
}

export type PeriodType = 'month' | 'quarter' | 'semester' | 'year' | 'all';

export interface CloudConfig {
  supabaseUrl: string;
  supabaseKey: string;
  projectId: string;
}

export interface CompanyProfile {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  ownerName: string;
  cloudConfig?: CloudConfig;
  pixKey?: string;
  pixTitular?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  cost: number;
  type: 'Serviço' | 'Produto';
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  value: number;
  date: string;
  status: 'Pago' | 'Pendente';
}

export interface FinancialDocument {
  id: string;
  name: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  content: string; // Base64 content
}

export interface SaleItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  clientName: string;
  date: string;
  items: SaleItem[];
  total: number;
  taxPercent?: number;
  paymentMethod: string;
  status: 'Concluído' | 'Em Andamento';
  deadline?: string;
}

export interface Contract {
  id: string;
  clientName: string;
  clientCpf: string;
  clientAddress: string;
  serviceObject: string;
  eventDate: string;
  eventTime: string;
  eventDuration: string;
  eventLocation: string;
  value: number;
  paymentDate: string;
  paymentMethod: string;
  pixKey: string;
  bankDetails: string;
  includedItems: string[];
  status: 'Draft' | 'Sent' | 'Signed';
}

export interface ProposalItem {
  id: string;
  title: string;
  description: string;
  includedItems: string;
  value: number;
}

export interface Proposal {
  id: string;
  budgetNumber: string;
  clientName: string;
  clientPhone: string;
  date: string;
  location: string;
  services: ProposalItem[];
  companyName: string;
  companyPhone: string;
  companyCnpj: string;
  companyAddress: string;
  companyEmail: string;
}



export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
  };
  htmlLink: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: 'Prospecção' | 'Qualificação' | 'Proposta' | 'Negociação' | 'Fechado';
  temperature: 'Frio' | 'Morno' | 'Quente';
  lastContact: string;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'Entrada' | 'Saída';
  category: string;
  date: string;
  status: 'Pago' | 'Pendente';
  source?: 'Vendas' | 'Despesas' | 'Manual' | 'Importado';
}


