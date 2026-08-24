<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import type { Template } from '../types';

const router = useRouter();
const auth = useAuthStore();
const templates = ref<Template[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    templates.value = await api.listTemplates();
  } finally {
    loading.value = false;
  }
});

function tagList(t: Template): string[] {
  try {
    const v = JSON.parse(JSON.stringify(t.tags));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function stepCount(t: Template): number {
  return (t.steps as any[])?.length || 0;
}

async function applyTemplate(id: string) {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: '/templates' } });
    return;
  }
  const t = await api.applyTemplate(id);
  router.push({ name: 'planner-edit', params: { id: t.id } });
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <h2 class="text-lg font-bold">模板广场</h2>
    <p class="mt-1 text-sm text-gray-400">精选官方模板，一键套用到你的账号，自由修改</p>

    <div v-if="loading" class="py-20 text-center text-gray-400">加载中…</div>
    <div v-else class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="t in templates" :key="t.id" class="card overflow-hidden transition-shadow hover:shadow-md">
        <div class="flex items-center justify-between p-4" :style="{ background: t.coverColor + '22' }">
          <div>
            <h3 class="font-bold">{{ t.title }}</h3>
            <p class="mt-0.5 text-xs opacity-60">{{ t.destination }} · {{ t.days }}天 · {{ stepCount(t) }}个安排</p>
          </div>
          <span class="text-3xl" :style="{ color: t.coverColor }">🧭</span>
        </div>
        <div class="p-4">
          <p class="line-clamp-2 min-h-9 text-xs text-gray-500">{{ t.description }}</p>
          <div class="mt-3 flex flex-wrap gap-1">
            <span v-for="tag in tagList(t)" :key="tag" class="badge bg-brand-50 text-brand-600">{{ tag }}</span>
          </div>
          <button class="btn-primary mt-4 w-full" @click="applyTemplate(t.id)">📋 一键套用并编辑</button>
        </div>
      </div>
    </div>
  </div>
</template>
