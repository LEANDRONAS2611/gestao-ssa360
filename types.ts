
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
