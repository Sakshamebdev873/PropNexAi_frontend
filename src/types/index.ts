export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  total: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  tags: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  contactCount: number;
}

export interface CsvImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

export interface CampaignProgressEvent {
  campaignId: string;
  sent: number;
  opened: number;
  clicked: number;
  total: number;
  percentage: number;
}

export interface CampaignCompletedEvent {
  campaignId: string;
  sent: number;
  opened: number;
  clicked: number;
  total: number;
}
