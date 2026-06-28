import api from '@/config/api';
import type { ApiResponse, Contact, CsvImportResult, PaginationMeta } from '@/types';

interface GetContactsParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface ContactsResponse {
  contacts: Contact[];
  pagination: PaginationMeta;
}

export const contactsService = {
  async getAll(params: GetContactsParams = {}) {
    const { data } = await api.get<ApiResponse<Contact[]> & { meta: { pagination: PaginationMeta } }>(
      '/contacts',
      { params }
    );
    return {
      contacts: data.data,
      pagination: data.meta?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
    } as ContactsResponse;
  },

  async uploadCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ApiResponse<CsvImportResult>>('/contacts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async delete(id: string) {
    await api.delete(`/contacts/${id}`);
  },
};
