<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { useAuthStore } from '../stores/auth';
import type { Template, Trip } from '../types';
import { fmtMoney } from '../utils/steps';

const router = useRouter();
const auth = useAuthStore();

const templates = ref<Template[]>([]);
const publicTrips = ref<Trip[]>([]);

onMounted(async () => {
  try {
    const [t, p] = await Promise.all([api.listTemplates(), api.listPublicTrips()]);
    templates.value = t;
    publicTrips.value = p;
  } catch {
    /* 游客可正常浏览 */
  }
});

async function applyTemplate(id: string) {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: '/templates' } });
    return;
  }
  const t = await api.applyTemplate(id);
  router.push({ name: 'planner-edit', params: { id: t.id } });
}

function stepsSummary(t: Template): string {
  const arr = (t.steps as any[]) || [];
  const types = arr.map((s) => s.type);
  const counts: Record<string, number> = {};
  types.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
  const total = types.length;
  const parts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${v}${k.replace('transport_', '')}`);
  return `${total} 个安排 · ${parts.join(' / ')}`;
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 py-14 text-white">
      <div class="mx-auto max-w-6xl px-4">
        <h1 class="text-3xl font-bold sm:text-4xl">墨迹真实，出行无忧</h1>
        <p class="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
          像搭积木一样规划你的行程，每一分钱都花得明白。支持 AI 一键生成、时间轴编辑、费用实时汇总。
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink to="/ai" class="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow hover:bg-brand-50">🤖 AI 智能规划</RouterLink>
          <RouterLink to="/planner" class="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25">🧱 手动规划</RouterLink>
        </div>
        <div class="mt-8 grid max-w-2xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div class="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p class="text-xl font-bold">7</p>
            <p class="text-xs text-white/75">步骤类型</p>
          </div>
          <div class="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p class="text-xl font-bold">3</p>
            <p class="text-xs text-white/75">AI 对比方案</p>
          </div>
          <div class="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p class="text-xl font-bold">✓</p>
            <p class="text-xs text-white/75">费用实时汇总</p>
          </div>
          <div class="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p class="text-xl font-bold">🔗</p>
            <p class="text-xs text-white/75">一键分享</p>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-4 py-8">
      <!-- 模板 -->
      <div class="mb-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-bold">官方模板 <span class="text-xs font-normal text-gray-400">一键套用，修改即用</span></h2>
          <RouterLink to="/templates" class="text-sm text-brand-600 hover:underline">全部 →</RouterLink>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="t in templates.slice(0, 4)" :key="t.id" class="card cursor-pointer overflow-hidden transition-shadow hover:shadow-md" @click="applyTemplate(t.id)">
            <div class="h-1.5" :style="{ background: t.coverColor }"></div>
            <div class="p-4">
              <div class="flex items-start justify-between">
                <h3 class="font-semibold">{{ t.title }}</h3>
                <span class="badge bg-gray-100 text-gray-500">{{ t.days }}天</span>
              </div>
              <p class="mt-1 line-clamp-2 text-xs text-gray-400">{{ t.description }}</p>
              <p class="mt-2 text-xs text-gray-500">{{ stepsSummary(t) }}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span v-for="tag in (t.tags as string[] || [])" :key="tag" class="badge bg-brand-50 text-brand-600">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 公开行程 -->
      <div>
        <h2 class="mb-3 text-lg font-bold">大家分享的行程</h2>
        <div v-if="!publicTrips.length" class="card py-10 text-center text-sm text-gray-400">
          还没有公开行程，<RouterLink to="/planner" class="text-brand-600 hover:underline">创建第一个</RouterLink>并开启公开分享吧
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink v-for="t in publicTrips.slice(0, 6)" :key="t.id" :to="`/trip/${t.id}`" class="card overflow-hidden transition-shadow hover:shadow-md">
            <div class="p-4">
              <h3 class="truncate font-semibold" :title="t.title">{{ t.title }}</h3>
              <p class="mt-1 text-xs text-gray-400">{{ t.destination }} · {{ t.days }}天 · by {{ t.user?.nickname || '旅友' }}</p>
              <div class="mt-3 flex items-center justify-between">
                <span class="font-bold text-brand-700">{{ fmtMoney(t.summary?.totalCost) }}</span>
                <span class="text-xs text-gray-400">{{ t.steps.length }} 个安排</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
