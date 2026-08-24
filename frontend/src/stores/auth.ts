import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../api';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('moshi_token') || '');
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  function setAuth(t: string, u: User) {
    token.value = t;
    user.value = u;
    localStorage.setItem('moshi_token', t);
    localStorage.setItem('moshi_user', JSON.stringify(u));
  }

  function clear() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('moshi_token');
    localStorage.removeItem('moshi_user');
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      user.value = await api.getMe();
      localStorage.setItem('moshi_user', JSON.stringify(user.value));
    } catch {
      /* 401 已由拦截器处理 */
    }
  }

  async function login(account: string, password: string) {
    const res = await api.login(account, password);
    setAuth(res.token, res.user);
  }

  async function register(data: { email?: string; phone?: string; password: string; nickname?: string }) {
    const res = await api.register(data);
    setAuth(res.token, res.user);
  }

  async function guestLogin() {
    const res = await api.guest();
    setAuth(res.token, res.user);
  }

  async function logout() {
    clear();
  }

  return { token, user, isLoggedIn, login, register, guestLogin, logout, fetchMe, setAuth, clear };
});
