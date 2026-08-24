<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
const route = useRoute();

onMounted(() => {
  if (auth.isLoggedIn) auth.fetchMe();
});

const navs = [
  { name: '首页', to: '/' },
  { name: 'AI 规划', to: '/ai' },
  { name: '我的行程', to: '/trips' },
  { name: '行程日历', to: '/calendar' },
  { name: '模板广场', to: '/templates' },
];

function isActive(to: string) {
  if (to === '/') return route.path === '/';
  return route.path.startsWith(to);
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-lg text-white">墨</span>
          <span class="text-lg font-bold tracking-tight">墨实出行</span>
          <span class="hidden text-xs text-gray-400 sm:block">墨迹真实，出行无忧</span>
        </RouterLink>
        <nav class="hidden items-center gap-1 md:flex">
          <RouterLink
            v-for="n in navs"
            :key="n.to"
            :to="n.to"
            class="rounded-lg px-3 py-1.5 text-sm transition-colors"
            :class="isActive(n.to) ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600 hover:bg-gray-100'"
          >
            {{ n.name }}
          </RouterLink>
        </nav>
        <div class="flex items-center gap-2">
          <template v-if="auth.isLoggedIn">
            <RouterLink to="/planner" class="btn-primary hidden sm:inline-flex">＋ 新建行程</RouterLink>
            <RouterLink to="/profile" class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100">
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {{ (auth.user?.nickname || '游')[0] }}
              </span>
              <span class="hidden text-sm text-gray-700 lg:block">{{ auth.user?.nickname }}</span>
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-ghost">登录</RouterLink>
            <RouterLink to="/register" class="btn-primary">注册</RouterLink>
          </template>
        </div>
      </div>
    </header>

    <!-- 移动端导航 -->
    <nav class="flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-3 py-2 md:hidden">
      <RouterLink
        v-for="n in navs"
        :key="n.to"
        :to="n.to"
        class="shrink-0 rounded-lg px-3 py-1 text-sm"
        :class="isActive(n.to) ? 'bg-brand-50 font-medium text-brand-700' : 'text-gray-600'"
      >
        {{ n.name }}
      </RouterLink>
      <RouterLink to="/planner" class="shrink-0 rounded-lg bg-brand-600 px-3 py-1 text-sm text-white">＋ 新建</RouterLink>
    </nav>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
      <p>墨实出行 · 墨迹真实，出行无忧</p>
      <p class="mt-1">AI 生成内容仅供参考，请以实际票价与开放信息为准</p>
    </footer>
  </div>
</template>
