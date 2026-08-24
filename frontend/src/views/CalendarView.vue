<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from '../api';
import type { Trip } from '../types';
import { fmtMoney } from '../utils/steps';

const trips = ref<Trip[]>([]);
const currentMonth = ref(new Date());
const loading = ref(true);

onMounted(async () => {
  try {
    trips.value = await api.listMyTrips();
  } finally {
    loading.value = false;
  }
});

const year = computed(() => currentMonth.value.getFullYear());
const month = computed(() => currentMonth.value.getMonth());

function prev() {
  currentMonth.value = new Date(year.value, month.value - 1, 1);
}
function next() {
  currentMonth.value = new Date(year.value, month.value + 1, 1);
}

/** 某天有哪些行程 */
function tripsOn(date: string): Trip[] {
  return trips.value.filter((t) => {
    if (!t.startDate) return false;
    const start = new Date(t.startDate);
    for (let i = 0; i < (t.days || 1); i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d.getFullYear() === year.value && d.getMonth() === month.value) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (key === date) return true;
      }
    }
    return false;
  });
}

const calendar = computed(() => {
  const first = new Date(year.value, month.value, 1);
  const startWeekday = first.getDay(); // 0=周日
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate();
  const cells: { date: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: '', day: 0, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date: key, day: d, inMonth: true });
  }
  return cells;
});

const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const upcomingTrips = computed(() =>
  trips.value
    .filter((t) => t.startDate && new Date(t.startDate) >= today)
    .sort((a, b) => (a.startDate! > b.startDate! ? 1 : -1)),
);
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <h2 class="mb-4 text-lg font-bold">行程日历</h2>
    <div v-if="loading" class="py-20 text-center text-gray-400">加载中…</div>
    <div v-else class="grid gap-4 lg:grid-cols-3">
      <!-- 日历 -->
      <div class="card p-4 lg:col-span-2">
        <div class="mb-3 flex items-center justify-between">
          <button class="btn-ghost !px-3" @click="prev">‹</button>
          <h3 class="font-semibold">{{ year }} 年 {{ month + 1 }} 月</h3>
          <button class="btn-ghost !px-3" @click="next">›</button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
          <div v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w" class="py-1 text-xs font-medium text-gray-400">{{ w }}</div>
          <div
            v-for="(c, i) in calendar"
            :key="i"
            class="relative min-h-16 rounded-lg border p-1.5 text-xs"
            :class="c.inMonth ? (c.date === todayKey ? 'border-brand-500 bg-brand-50' : 'border-gray-100') : 'border-transparent opacity-30'"
          >
            <span class="font-medium" :class="c.date === todayKey ? 'text-brand-700' : 'text-gray-600'">{{ c.day || '' }}</span>
            <div v-for="t in tripsOn(c.date)" :key="t.id" class="mt-1">
              <RouterLink :to="`/trip/${t.id}`" class="block truncate rounded bg-brand-600 px-1 py-0.5 text-[10px] text-white hover:bg-brand-700" :title="t.title">
                {{ t.title }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 即将出发 -->
      <div class="card h-fit p-4">
        <h3 class="mb-3 text-sm font-semibold">即将出发</h3>
        <div v-if="!upcomingTrips.length" class="py-8 text-center text-sm text-gray-400">暂无安排，规划一个吧！</div>
        <div v-else class="space-y-2">
          <RouterLink v-for="t in upcomingTrips" :key="t.id" :to="`/trip/${t.id}`" class="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 hover:bg-gray-50">
            <div>
              <p class="text-sm font-medium">{{ t.title }}</p>
              <p class="text-xs text-gray-400">
                {{ new Date(t.startDate!).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) }} · {{ t.days }}天
              </p>
            </div>
            <span class="text-sm font-semibold text-brand-700">{{ fmtMoney(t.summary?.totalCost) }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
