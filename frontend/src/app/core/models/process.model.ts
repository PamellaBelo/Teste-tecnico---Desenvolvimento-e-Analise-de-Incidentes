export type ProcessStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'CLOSED';

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  ACTIVE:    'Ativo',
  SUSPENDED: 'Suspenso',
  ARCHIVED:  'Arquivado',
  CLOSED:    'Encerrado'
};

export const PROCESS_STATUS_OPTIONS: { value: ProcessStatus; label: string }[] = [
  { value: 'ACTIVE',    label: 'Ativo' },
  { value: 'SUSPENDED', label: 'Suspenso' },
  { value: 'ARCHIVED',  label: 'Arquivado' },
  { value: 'CLOSED',    label: 'Encerrado' }
];

export interface JudicialProcess {
  id: number;
  processNumber: string;
  subject: string;
  description?: string;
  status: ProcessStatus;
  responsibleName: string;
  responsibleEmail: string;
  openingDate: string;
  closingDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JudicialProcessRequest {
  processNumber: string;
  subject: string;
  description?: string;
  status: ProcessStatus;
  responsibleName: string;
  responsibleEmail: string;
  openingDate: string;
  closingDate?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProcessFilter {
  status?: ProcessStatus;
  search?: string;
  page: number;
  size: number;
}
