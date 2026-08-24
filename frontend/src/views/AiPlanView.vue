<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import type { AiPlan, AiPlanResponse } from '../types';
import { fmtMoney } from '../utils/steps';

const router = useRouter();

const form = reactive({
  departure: '成都',
  destinations: '九寨沟',
  people: '单人',
  days: 3,
  budget: 'economic',
  preferences: [] as string[],
});

const PEOPLE_OPTIONS = ['单人', '情侣', '家庭', '朋友'];
const BUDGET_OPTIONS = [
  { value: 'economic', label: '经济 <1000元', desc: '学生党友好' },
  { value: 'comfort', label: '舒适 1000-3000元', desc: '高性价比' },
  { value: 'luxury', label: '豪华 >3000元', desc: '品质体验' },
];
const PREF_OPTIONS = ['自然风光', '人文历史', '美食探店', '特种兵打卡', '懒人休闲'];

const loading = ref(false);
const result = ref<AiPlanResponse | null>(null);
const error = ref('');
const adopting = ref<string | null>(null);

function togglePref(p: string) {
  const i = form.preferences.indexOf(p);
  if (i >= 0) form.preferences.splice(i, 1);
  else form.preferences.push(p);
}

async function generate() {
  error.value = '';
  loading.value = true;
  result.value = null;
  try {
    result.value = await api.aiPlan({
      departure: form.departure.trim() || '出发地',
      destinations: form.destinations.split(/[,，、\s]+/).filter(Boolean),
      days: Number(form.days),
      people: form.people,
      budget: form.budget,
      preferences: form.preferences,
    });
  } catch (e) {
    error.value = String(e);
  } finally {
    loading.value = false;
  }
}

async function adopt(plan: AiPlan) {
  adopting.value = plan.id;
  try {
    const trip = await api.aiAdopt({
      title: `${result.value!.title}（${plan.name}）`,
      destination: result.value!.input.destinations.join('+'),
      days: plan.days,
      budget: plan.totalCost,
      planName: plan.name,
      plan: {
        daily: plan.daily.map((d) => ({
          day: d.day,
          title: d.title,
          items: d.items.map((it) => ({ time: it.time, type: it.type, title: it.title, cost: it.cost, detail: it.detail })),
        })),
        budget: plan.budget,
      },
    });
    router.push({ name: 'planner-edit', params: { id: trip.id } });
  } finally {
    adopting.value = null;
  }
}

const planStyles: Record<string, { border: string; badge: string; tag: string }> = {
  time: { border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', tag: '⏱️ 最快' },
  price: { border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', tag: '💰 最省' },
  balance: { border: 'border-brand-200', badge: 'bg-brand-100 text-brand-700', tag: '⚖️ 均衡' },
};
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <!-- 输入表单 -->
    <div class="card p-5">
      <h2 class="mb-1 text-lg font-bold">AI 智能规划</h2>
      <p class="mb-4 text-sm text-gray-400">输入需求，AI 自动生成三套对比方案（时间最优 / 价格最优 / 平衡推荐）</p>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs text-gray-500">出发城市</label>
          <input v-model="form.departure" class="input" placeholder="如：成都" />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs text-gray-500">目的地（支持多目的地串联）</label>
          <input v-model="form.destinations" class="input" placeholder="如：九寨沟+峨眉山" />
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">出行天数</label>
          <select v-model.number="form.days" class="input">
            <option v-for="d in 15" :key="d" :value="d">{{ d }} 天 {{ d - 1 }} 夜</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs text-gray-500">出行人数</label>
          <div class="flex gap-1">
            <button
              v-for="p in PEOPLE_OPTIONS"
              :key="p"
              class="flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors"
              :class="form.people === p ? 'border-brand-500 bg-brand-50 font-medium text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
              @click="form.people = p"
            >
              {{ p }}
            </button>
          </div>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs text-gray-500">预算档位</label>
          <div class="grid grid-cols-3 gap-1">
            <button
              v-for="b in BUDGET_OPTIONS"
              :key="b.value"
              class="rounded-lg border px-2 py-1.5 text-left transition-colors"
              :class="form.budget === b.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'"
              @click="form.budget = b.value"
            >
              <p class="text-xs font-medium text-gray-700">{{ b.label }}</p>
              <p class="text-[10px] text-gray-400">{{ b.desc }}</p>
            </button>
          </div>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs text-gray-500">偏好标签（可多选）</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="p in PREF_OPTIONS"
              :key="p"
              class="rounded-full border px-3 py-1 text-xs transition-colors"
              :class="form.preferences.includes(p) ? 'border-brand-500 bg-brand-600 text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
              @click="togglePref(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-3">
        <button class="btn-primary px-6" :disabled="loading" @click="generate">
          {{ loading ? 'AI 规划中…' : '🚀 生成方案' }}
        </button>
        <span class="text-xs text-gray-400">当前为演示数据模式；配置 DeepSeek API Key 后将返回实时 AI 规划</span>
      </div>
      <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="mt-8 py-16 text-center">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
      <p class="mt-4 text-sm text-gray-500">正在分析路线、票价与住宿…</p>
    </div>

    <!-- 方案对比 -->
    <template v-if="result">
      <div class="mt-6 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold">{{ result.title }}</h3>
          <p class="text-xs text-gray-400">
            生成于 {{ new Date(result.generatedAt).toLocaleTimeString('zh-CN') }} · {{ result.source === 'mock' ? '演示数据' : 'DeepSeek AI' }}
          </p>
        </div>
      </div>
      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <div v-for="plan in result.plans" :key="plan.id" class="card overflow-hidden" :class="planStyles[plan.id].border">
          <div class="border-b border-gray-100 bg-gradient-to-r p-4" :class="plan.id === 'balance' ? 'from-brand-50 to-white' : plan.id === 'time' ? 'from-blue-50 to-white' : 'from-orange-50 to-white'">
            <div class="flex items-center justify-between">
              <h4 class="font-bold">{{ plan.name }}</h4>
              <span class="badge" :class="planStyles[plan.id].badge">{{ planStyles[plan.id].tag }}</span>
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ plan.tagline }}</p>
            <div class="mt-3 grid grid-cols-3 gap-2 text-center">
              <div class="rounded-lg bg-white/80 p-2">
                <p class="text-[10px] text-gray-400">总花费</p>
                <p class="text-sm font-bold text-brand-700">{{ fmtMoney(plan.totalCost) }}</p>
              </div>
              <div class="rounded-lg bg-white/80 p-2">
                <p class="text-[10px] text-gray-400">总里程</p>
                <p class="text-sm font-bold">{{ plan.totalKm }}km</p>
              </div>
              <div class="rounded-lg bg-white/80 p-2">
                <p class="text-[10px] text-gray-400">总耗时</p>
                <p class="text-sm font-bold">{{ plan.tripHours }}h</p>
              </div>
            </div>
          </div>

          <div class="max-h-[420px] space-y-4 overflow-y-auto p-4">
            <div v-for="day in plan.daily" :key="day.day">
              <p class="mb-2 text-xs font-semibold text-gray-500">Day {{ day.day }} · {{ day.title }}</p>
              <div class="space-y-1.5">
                <div v-for="(it, i) in day.items" :key="i" class="flex gap-2 rounded-lg bg-gray-50 px-2.5 py-2">
                  <span class="w-10 shrink-0 text-xs font-medium text-gray-500">{{ it.time || '--:--' }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-xs font-medium text-gray-800" :title="it.title">{{ it.title }}</p>
                    <p v-if="it.detail" class="truncate text-[11px] text-gray-400" :title="it.detail">{{ it.detail }}</p>
                  </div>
                  <span v-if="it.cost" class="shrink-0 text-xs font-semibold text-brand-700">{{ it.cost }}元</span>
                </div>
              </div>
            </div>

            <div>
              <p class="mb-1.5 text-xs font-semibold text-gray-500">分项预算</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(v, k) in plan.budget" :key="k" class="badge bg-gray-100 text-gray-600">
                  {{ { transport: '🚆交通', hotel: '🏨住宿', ticket: '🎫门票', food: '🍜餐饮', other: '📦其他' }[k] }} {{ v }}元
                </span>
              </div>
            </div>

            <div>
              <p class="mb-1.5 text-xs font-semibold text-gray-500">实用贴士</p>
              <ul class="space-y-1">
                <li v-for="(t, i) in plan.tips" :key="i" class="flex gap-1.5 text-[11px] text-gray-500">
                  <span class="text-brand-500">•</span>{{ t }}
                </li>
              </ul>
            </div>

            <div>
              <p class="mb-1.5 text-xs font-semibold text-gray-500">备选建议</p>
              <ul class="space-y-1">
                <li v-for="(a, i) in plan.alternatives" :key="i" class="flex gap-1.5 text-[11px] text-gray-500">
                  <span class="text-amber-500">↺</span>{{ a }}
                </li>
              </ul>
            </div>
          </div>

          <div class="border-t border-gray-100 p-3">
            <button class="btn-primary w-full" :disabled="adopting !== null" @click="adopt(plan)">
              {{ adopting === plan.id ? '导入中…' : '✓ 一键采纳到我的行程' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
