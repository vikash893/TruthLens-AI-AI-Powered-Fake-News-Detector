import axios from 'axios';
import { IAnalysis, IClaim, IDashboardStats, IUser } from '../types';

const API_BASE = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(msg));
  }
);

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<{ success: boolean; data: { user: IUser; token: string } }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<{ success: boolean; data: { user: IUser; token: string } }>('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get<{ success: boolean; data: { user: IUser } }>('/auth/me'),

  // Analyses
  analyzeText: (text: string) =>
    apiClient.post<{ success: boolean; data: { analysis: IAnalysis; claims: IClaim[] } }>('/analyses/text', { text }),
  analyzeUrl: (url: string) =>
    apiClient.post<{ success: boolean; data: { analysis: IAnalysis; claims: IClaim[] } }>('/analyses/url', { url }),
  analyzeImage: (formData: FormData) =>
    apiClient.post<{ success: boolean; data: { analysis: IAnalysis; claims: IClaim[] } }>('/analyses/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  analyzeDocument: (formData: FormData) =>
    apiClient.post<{ success: boolean; data: { analysis: IAnalysis; claims: IClaim[] } }>('/analyses/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAnalysis: (id: string) =>
    apiClient.get<{ success: boolean; data: { analysis: IAnalysis; claims: IClaim[] } }>(`/analyses/${id}`),
  listAnalyses: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient.get<{ success: boolean; data: { analyses: IAnalysis[]; pagination: any } }>('/analyses', { params }),
  deleteAnalysis: (id: string) =>
    apiClient.delete(`/analyses/${id}`),

  // User & Dashboard
  getDashboard: () =>
    apiClient.get<{ success: boolean; data: IDashboardStats }>('/dashboard'),
  getProfile: () =>
    apiClient.get<{ success: boolean; data: { user: any } }>('/profile'),
  updateProfile: (data: any) =>
    apiClient.patch<{ success: boolean; data: { user: any } }>('/profile', data),
  toggleBookmark: (id: string, notes?: string) =>
    apiClient.post<{ success: boolean; data: { isBookmarked: boolean } }>(`/reports/${id}/bookmark`, { notes }),

  // Feedback
  submitFeedback: (data: { analysisId: string; claimId?: string; feedbackType: string; description: string }) =>
    apiClient.post('/feedback', data)
};
