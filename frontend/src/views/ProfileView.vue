<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import type { Trip, UserStats } from '../types';
import { fmtMoney } from '../utils/steps';
import DonutChart from '../components/DonutChart.vue';

const router = useRouter();
const auth = useAuthStore();

const stats = ref<UserStats | null>(null);
const trips = ref<Trip[]>([]);
const favorites = ref<Trip[]>([]);
const editing = ref(false);
const nickname = ref('');
const saving = ref(false);

onMounted(async () => {
  if (!auth.isLoggedIn) return;
  const [s, t, f] = await Promise.all([api.getStats(), api.listMyTrips(), api.listFavorites()]);
  stats.value = s;
  trips.value = t;
  favorites.value = f;
  nickname.value = auth.user?.nickname || '';
});

const budgetItems = computed(() => {
  const b = { transport: 0, hotel: 0, ticket: 0, food: 0, other: 0 };
  for (const t of trips.value) {
    const sb = t.summary?.budget || {};
    for (const k of Object.keys(b)) b[k as keyof typeof b] += sb[k] || 0;
  }
  const map: [string, string, string][] = [
    ['transport', '🚆 交通', '#3b82f6'],
    ['hotel', '🏨 住宿', '#8b5cf6'],
    ['ticket', '🎫 门票', '#f59e0b'],
    ['food', '🍜 餐饮', '#f97316'],
    ['other', '📦 其他', '#9ca3af'],
  ];
  return map.map(([k, label, color]) => ({ label, value: b[k as keyof typeof b], color })).filter((d) => d.value > 0);
});

async function saveNickname() {
  saving.value = true;
  try {
    await api.updateMe({ nickname: nickname.value });
    await auth.fetchMe();
    editing.value = false;
  } finally {
    saving.value = false;
  }
}

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div class="grid gap-4 lg:grid-cols-3">
      <!-- 左栏：资料 + 统计 -->
      <div class="space-y-4">
        <div class="card p-5 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {{ (auth.user?.nickname || '游')[0] }}
          </div>
          <div class="mt-3">
            <template v-if="!editing">
              <h2 class="font-bold">{{ auth.user?.nickname }}</h2>
              <p class="text-xs text-gray-400">{{ auth.user?.email || auth.user?.phone || '游客账号' }}</p>
              <button class="btn-ghost mt-2 text-xs" @click="editing = true">修改昵称</button>
            </template>
            <template v-else>
              <input v-model="nickname" class="input text-center" placeholder="新昵称" />
              <div class="mt-2 flex justify-center gap-2">
                <button class="btn-primary !px-3 !py-1 !text-xs" :disabled="saving" @click="saveNickname">保存</button>
                <button class="btn-outline !px-3 !py-1 !text-xs" @click="editing = false">取消</button>
              </div>
            </template>
          </div>
          <button class="btn-outline mt-4 w-full text-xs text-red-500" @click="logout">退出登录</button>
        </div>

        <div class="card p-4">
          <h3 class="mb-3 text-sm font-semibold">出行统计</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-brand-50 p-3">
              <p class="text-xs text-brand-600">累计出行</p>
              <p class="text-xl font-bold text-brand-700">{{ stats?.tripCount || 0 }} 次</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-3">
              <p class="text-xs text-gray-500">总花费</p>
              <p class="text-xl font-bold">{{ fmtMoney(stats?.totalCost) }}</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-3">
              <p class="text-xs text-gray-500">总天数</p>
              <p class="text-xl font-bold">{{ stats?.totalDays || 0 }} 天</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-3">
              <p class="text-xs text-gray-500">总里程</p>
              <p class="text-xl font-bold">{{ stats?.totalKm || 0 }} km</p>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-400">AI 规划已使用 {{ stats?.aiCount || 0 }} 次</p>
        </div>
      </div>

      <!-- 中栏：费用分析 -->
      <div class="card h-fit p-4">
        <h3 class="mb-3 text-sm font-semibold">全部行程费用分析</h3>
        <DonutChart :data="budgetItems" />
        <div class="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          <p>💡 提示：若住宿占比过高，可考虑青旅或民宿；交通占比过高可错峰购票。</p>
        </div>
      </div>

      <!-- 右栏：收藏 -->
      <div class="card p-4">
        <h3 class="mb-3 text-sm font-semibold">我的收藏（{{ favorites.length }}）</h3>
        <div v-if="!favorites.length" class="py-8 text-center text-sm text-gray-400">还没有收藏任何行程</div>
        <div v-else class="space-y-2">
          <RouterLink v-for="t in favorites" :key="t.id" :to="`/trip/${t.id}`" class="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 hover:bg-gray-50">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium" :title="t.title">{{ t.title }}</p>
              <p class="text-xs text-gray-400">{{ t.destination }} · {{ t.days }}天</p>
            </div>
            <span class="shrink-0 text-sm font-semibold text-brand-700">{{ fmtMoney(t.summary?.totalCost) }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
