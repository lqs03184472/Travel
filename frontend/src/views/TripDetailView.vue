<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import type { Trip } from '../types';
import { fmtDate, fmtMoney, fmtDuration } from '../utils/steps';
import StepCard from '../components/StepCard.vue';
import DonutChart from '../components/DonutChart.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const trip = ref<Trip | null>(null);
const loading = ref(true);
const error = ref('');
const favorited = ref(false);
const busy = ref(false);

onMounted(async () => {
  try {
    trip.value = await api.getTrip(route.params.id as string);
  } catch (e) {
    error.value = String(e);
  } finally {
    loading.value = false;
  }
});

const isOwner = computed(() => auth.user && trip.value && auth.user.id === trip.value.userId);

const budgetItems = computed(() => {
  const b = trip.value?.summary?.budget || {};
  const map: [string, string, string][] = [
    ['transport', '🚆 交通', '#3b82f6'],
    ['hotel', '🏨 住宿', '#8b5cf6'],
    ['ticket', '🎫 门票', '#f59e0b'],
    ['food', '🍜 餐饮', '#f97316'],
    ['other', '📦 其他', '#9ca3af'],
  ];
  return map
    .map(([k, label, color]) => ({ label, value: b[k] || 0, color }))
    .filter((d) => d.value > 0);
});

const daysArr = computed(() => Array.from({ length: trip.value?.days || 1 }, (_, i) => i + 1));

function stepsOfDay(day: number) {
  return (trip.value?.steps || []).filter((s) => s.day === day).sort((a, b) => a.order - b.order);
}

function totalDuration() {
  const mins = (trip.value?.steps || []).reduce((s, x) => s + (x.durationMin || 0), 0);
  return fmtDuration(mins) || '—';
}

async function copy() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  busy.value = true;
  try {
    const t = await api.copyTrip(trip.value!.id);
    router.push({ name: 'planner-edit', params: { id: t.id } });
  } finally {
    busy.value = false;
  }
}

async function toggleFav() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  const r = await api.toggleFavorite(trip.value!.id);
  favorited.value = r.favorited;
}

function share() {
  const url = location.origin + location.pathname;
  navigator.clipboard?.writeText(url);
  alert('链接已复制，分享给朋友吧！');
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-6">
    <div v-if="loading" class="py-20 text-center text-gray-400">加载中…</div>
    <p v-else-if="error" class="py-20 text-center text-red-500">{{ error }}</p>

    <template v-else-if="trip">
      <!-- 头部 -->
      <div class="card overflow-hidden">
        <div class="bg-gradient-to-r from-brand-600 to-emerald-500 p-6 text-white">
          <div class="flex flex-wrap items-center gap-2 text-xs opacity-80">
            <span class="badge bg-white/20 text-white">{{ trip.destination }}</span>
            <span>{{ trip.days }} 天</span>
            <span v-if="trip.startDate">· {{ fmtDate(trip.startDate) }}</span>
            <span v-if="trip.user">· 创建者：{{ trip.user.nickname }}</span>
          </div>
          <h1 class="mt-2 text-xl font-bold">{{ trip.title }}</h1>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <div class="rounded-lg bg-white/15 px-3 py-1.5">
              <p class="text-[10px] opacity-75">总花费</p>
              <p class="text-lg font-bold">{{ fmtMoney(trip.summary?.totalCost) }}</p>
            </div>
            <div class="rounded-lg bg-white/15 px-3 py-1.5">
              <p class="text-[10px] opacity-75">安排总数</p>
              <p class="text-lg font-bold">{{ trip.summary?.stepCount || trip.steps.length }}</p>
            </div>
            <div class="rounded-lg bg-white/15 px-3 py-1.5">
              <p class="text-[10px] opacity-75">行程时长</p>
              <p class="text-lg font-bold">{{ totalDuration() }}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 p-4">
          <button class="btn-primary" :disabled="busy" @click="copy">📋 复制到我的行程</button>
          <button class="btn-outline" @click="toggleFav">{{ favorited ? '❤️ 已收藏' : '🤍 收藏' }}</button>
          <button class="btn-outline" @click="share">🔗 分享链接</button>
          <button v-if="isOwner" class="btn-outline" @click="router.push(`/planner/${trip.id}`)">✏️ 编辑</button>
          <button v-if="isOwner" class="btn-outline text-red-500" @click="router.push('/trips')">返回我的行程</button>
        </div>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <!-- 时间轴 -->
        <div class="md:col-span-2">
          <div v-for="d in daysArr" :key="d" class="mb-4">
            <p class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{{ d }}</span>
              Day {{ d }} · {{ stepsOfDay(d).length }} 个安排
            </p>
            <div class="space-y-2">
              <StepCard v-for="(s, i) in stepsOfDay(d)" :key="s.id || i" :step="s" />
              <p v-if="!stepsOfDay(d).length" class="rounded-lg border border-dashed border-gray-200 py-3 text-center text-xs text-gray-400">当天无安排</p>
            </div>
          </div>
        </div>

        <!-- 费用分析 -->
        <div class="card h-fit p-4">
          <h3 class="mb-3 text-sm font-semibold">费用分析</h3>
          <DonutChart :data="budgetItems" />
        </div>
      </div>
    </template>
  </div>
</template>
