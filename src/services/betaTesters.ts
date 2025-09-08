import { apiClient } from './api';
import type { BetaTester, BetaTesterStats, PaginatedResponse } from '../types';

interface BetaTesterQueryParams {
  page?: number;
  size?: number;
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
}

class BetaTesterService {
  async getBetaTesters(params?: BetaTesterQueryParams): Promise<PaginatedResponse<BetaTester>> {
    return await apiClient.get<PaginatedResponse<BetaTester>>('/admin/beta-testers', params);
  }

  async getBetaTester(id: string): Promise<BetaTester> {
    return await apiClient.get<BetaTester>(`/admin/beta-testers/${id}`);
  }

  async getBetaTesterStats(): Promise<BetaTesterStats> {
    return await apiClient.get<BetaTesterStats>('/admin/beta-testers/stats');
  }

  async approveBetaTester(id: string): Promise<BetaTester> {
    return await apiClient.post<BetaTester>(`/admin/beta-testers/${id}/approve`);
  }

  async rejectBetaTester(id: string): Promise<BetaTester> {
    return await apiClient.post<BetaTester>(`/admin/beta-testers/${id}/reject`);
  }

  async bulkApproveBetaTesters(ids: string[]): Promise<void> {
    return await apiClient.post<void>('/admin/beta-testers/bulk-approve', { ids });
  }

  async bulkRejectBetaTesters(ids: string[]): Promise<void> {
    return await apiClient.post<void>('/admin/beta-testers/bulk-reject', { ids });
  }

  async updateBetaTester(id: string, data: Partial<BetaTester>): Promise<BetaTester> {
    return await apiClient.put<BetaTester>(`/admin/beta-testers/${id}`, data);
  }

  async deleteBetaTester(id: string): Promise<void> {
    return await apiClient.delete<void>(`/admin/beta-testers/${id}`);
  }
}

export const betaTesterService = new BetaTesterService();