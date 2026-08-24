<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const account = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  if (!account.value || !password.value) {
    error.value = '请填写账号和密码';
    return;
  }
  loading.value = true;
  try {
    await auth.login(account.value, password.value);
    router.push((route.query.redirect as string) || '/');
  } catch (e) {
    error.value = String(e);
  } finally {
    loading.value = false;
  }
}

async function guest() {
  loading.value = true;
  try {
    await auth.guestLogin();
    router.push('/');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white">墨</div>
        <h1 class="text-xl font-bold">登录墨实出行</h1>
        <p class="mt-1 text-sm text-gray-400">墨迹真实，出行无忧</p>
      </div>
      <div class="card space-y-4 p-6">
        <div>
          <label class="mb-1 block text-xs text-gray-500">邮箱 / 手机号</label>
          <input v-model="account" class="input" placeholder="请输入邮箱或手机号" @keyup.enter="submit" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">密码</label>
          <input v-model="password" type="password" class="input" placeholder="请输入密码" @keyup.enter="submit" />
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <button class="btn-primary w-full" :disabled="loading" @click="submit">
          {{ loading ? '登录中…' : '登录' }}
        </button>
        <button class="btn-outline w-full" :disabled="loading" @click="guest">👤 游客模式进入（可先体验）</button>
        <p class="text-center text-sm text-gray-400">
          还没有账号？
          <RouterLink to="/register" class="text-brand-600 hover:underline">立即注册</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
