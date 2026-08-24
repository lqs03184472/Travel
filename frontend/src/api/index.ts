import axios from 'axios';
import type {
  AiPlanInput,
  AiPlanResponse,
  Template,
  Trip,
  User,
  UserStats,
} from '../types';

const http = axios.create({ baseURL: '/api', timeout: 60000 });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('moshi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('moshi_token');
      localStorage.removeItem('moshi_user');
      if (!location.pathname.includes('/login')) {
        location.href = '/login';
      }
    }
    return Promise.reject(err.response?.data?.message || err.message);
  },
);

export const api = {
  // 认证
  register: (data: { email?: string; phone?: string; password: string; nickname?: string }) =>
    http.post('/auth/register', data).then((r) => r.data),
  login: (account: string, password: string) =>
    http.post('/auth/login', { account, password }).then((r) => r.data),
  guest: () => http.post('/auth/guest').then((r) => r.data),

  // 用户
  getMe: () => http.get<User>('/users/me').then((r) => r.data),
  updateMe: (data: { nickname?: string; avatar?: string }) =>
    http.patch('/users/me', data).then((r) => r.data),
  getStats: () => http.get<UserStats>('/users/me/stats').then((r) => r.data),
  listFavorites: () => http.get<Trip[]>('/users/me/favorites').then((r) => r.data),
  toggleFavorite: (tripId: string) =>
    http.post(`/users/me/favorites/${tripId}`).then((r) => r.data),

  // 行程
  createTrip: (data: Partial<Trip> & { steps?: any[] }) =>
    http.post<Trip>('/trips', data).then((r) => r.data),
  listMyTrips: () => http.get<Trip[]>('/trips/mine').then((r) => r.data),
  listPublicTrips: (keyword?: string) =>
    http.get<Trip[]>('/trips/public', { params: { keyword } }).then((r) => r.data),
  getTrip: (id: string) => http.get<Trip>(`/trips/${id}`).then((r) => r.data),
  updateTrip: (id: string, data: any) =>
    http.patch<Trip>(`/trips/${id}`, data).then((r) => r.data),
  deleteTrip: (id: string) => http.delete(`/trips/${id}`).then((r) => r.data),
  saveSteps: (id: string, steps: any[]) =>
    http.put<Trip>(`/trips/${id}/steps`, { steps }).then((r) => r.data),
  copyTrip: (id: string) => http.post<Trip>(`/trips/${id}/copy`).then((r) => r.data),

  // 模板
  listTemplates: () => http.get<Template[]>('/templates').then((r) => r.data),
  getTemplate: (id: string) => http.get<Template>(`/templates/${id}`).then((r) => r.data),
  applyTemplate: (id: string) =>
    http.post<Trip>(`/templates/${id}/apply`).then((r) => r.data),

  // AI
  aiPlan: (data: AiPlanInput) =>
    http.post<AiPlanResponse>('/ai/plan', data).then((r) => r.data),
  aiAdopt: (data: any) => http.post<Trip>('/ai/adopt', data).then((r) => r.data),
};

export default http;
