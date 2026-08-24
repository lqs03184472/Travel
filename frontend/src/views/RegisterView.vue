<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const phone = ref('');
const password = ref('');
const confirm = ref('');
const nickname = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  if (!email.value && !phone.value) {
    error.value = '邮箱或手机号至少填写一个';
    return;
  }
  if (password.value.length < 6) {
    error.value = '密码至少 6 位';
    return;
  }
  if (password.value !== confirm.value) {
    error.value = '两次输入的密码不一致';
    return;
  }
  loading.value = true;
  try {
    await auth.register({ email: email.value || undefined, phone: phone.value || undefined, password: password.value, nickname: nickname.value || undefined });
    router.push('/');
  } catch (e) {
    error.value = String(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <h1 class="text-xl font-bold">注册账号</h1>
        <p class="mt-1 text-sm text-gray-400">开始你的清晰可控之旅</p>
      </div>
      <div class="card space-y-4 p-6">
        <div>
          <label class="mb-1 block text-xs text-gray-500">邮箱</label>
          <input v-model="email" type="email" class="input" placeholder="选填，用于邮箱登录" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">手机号</label>
          <input v-model="phone" class="input" placeholder="选填，用于手机号登录" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">昵称</label>
          <input v-model="nickname" class="input" placeholder="选填" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">密码（至少 6 位）</label>
          <input v-model="password" type="password" class="input" placeholder="请输入密码" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">确认密码</label>
          <input v-model="confirm" type="password" class="input" placeholder="再次输入密码" />
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <button class="btn-primary w-full" :disabled="loading" @click="submit">
          {{ loading ? '注册中…' : '注册并登录' }}
        </button>
        <p class="text-center text-sm text-gray-400">
          已有账号？
          <RouterLink to="/login" class="text-brand-600 hover:underline">去登录</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
