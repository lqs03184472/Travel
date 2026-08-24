<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import type { Trip } from '../types';
import { fmtDate, fmtMoney, getStepTypeConfig } from '../utils/steps';

const router = useRouter();
const trips = ref<Trip[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    trips.value = await api.listMyTrips();
  } finally {
    loading.value = false;
  }
});

const sourceBadge: Record<string, { text: string; cls: string }> = {
  manual: { text: '手动创建', cls: 'bg-gray-100 text-gray-600' },
  ai: { text: 'AI 规划', cls: 'bg-brand-100 text-brand-700' },
  template: { text: '模板套用', cls: 'bg-blue-100 text-blue-700' },
};

function coverIcon(t: Trip): string {
  const types = t.steps.map((s) => s.type);
  const count: Record<string, number> = {};
  types.forEach((t2) => (count[t2] = (count[t2] || 0) + 1));
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
  return top ? getStepTypeConfig(top[0] as any).icon : '🧳';
}

async function remove(t: Trip) {
  if (!confirm(`确定删除「${t.title}」吗？`)) return;
  await api.deleteTrip(t.id);
  trips.value = trips.value.filter((x) => x.id !== t.id);
}

const totalBudget = computed(() => trips.value.reduce((s, t) => s + (t.summary?.totalCost || 0), 0));
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold">我的行程</h2>
        <p class="text-xs text-gray-400">共 {{ trips.length }} 个行程 · 累计花费 {{ fmtMoney(totalBudget) }}</p>
      </div>
      <RouterLink to="/planner" class="btn-primary">＋ 新建行程</RouterLink>
    </div>

    <div v-if="loading" class="py-20 text-center text-gray-400">加载中…</div>
    <div v-else-if="!trips.length" class="card py-16 text-center">
      <p class="text-4xl">🧳</p>
      <p class="mt-3 text-gray-500">还没有行程</p>
      <div class="mt-4 flex justify-center gap-2">
        <RouterLink to="/planner" class="btn-primary">手动规划</RouterLink>
        <RouterLink to="/ai" class="btn-outline">AI 智能规划</RouterLink>
        <RouterLink to="/templates" class="btn-outline">套用模板</RouterLink>
      </div>
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="t in trips" :key="t.id" class="card overflow-hidden transition-shadow hover:shadow-md">
        <div class="flex items-center justify-between border-b border-gray-100 bg-gradient-to-br from-brand-50 to-white px-4 py-3">
          <span class="text-2xl">{{ coverIcon(t) }}</span>
          <span class="badge" :class="sourceBadge[t.source]?.cls || 'bg-gray-100 text-gray-600'">{{ sourceBadge[t.source]?.text }}</span>
        </div>
        <div class="p-4">
          <h3 class="truncate font-semibold" :title="t.title">{{ t.title }}</h3>
          <p class="mt-1 text-xs text-gray-400">
            {{ t.destination }} · {{ t.days }}天 · {{ fmtDate(t.startDate) }}
          </p>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-lg font-bold text-brand-700">{{ fmtMoney(t.summary?.totalCost) }}</span>
            <div class="flex gap-1.5">
              <button class="btn-outline !px-3 !py-1 !text-xs" @click="router.push(`/trip/${t.id}`)">查看</button>
              <button class="btn-outline !px-3 !py-1 !text-xs" @click="router.push(`/planner/${t.id}`)">编辑</button>
              <button class="btn-outline !px-3 !py-1 !text-xs text-red-500 hover:bg-red-50" @click="remove(t)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
