import api from '@/config/api';
import type { ApiResponse, Campaign, DashboardStats } from '@/types';

interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  scheduledAt?: string;
}

export const campaignsService = {
  async getAll() {
    const { data } = await api.get<ApiResponse<Campaign[]>>('/campaigns');
    return data.data;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return data.data;
  },

  async create(input: CreateCampaignInput) {
    const { data } = await api.post<ApiResponse<Campaign>>('/campaigns', input);
    return data.data;
  },

  async update(id: string, input: Partial<CreateCampaignInput>) {
    const { data } = await api.put<ApiResponse<Campaign>>(`/campaigns/${id}`, input);
    return data.data;
  },

  async delete(id: string) {
    await api.delete(`/campaigns/${id}`);
  },

  async start(id: string) {
    const { data } = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/start`);
    return data.data;
  },

  async pause(id: string) {
    const { data } = await api.post<ApiResponse<Campaign>>(`/campaigns/${id}/pause`);
    return data.data;
  },

  async getStats() {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/campaigns/stats');
    return data.data;
  },
};
