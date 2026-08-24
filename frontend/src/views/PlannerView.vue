<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import StepCard from '../components/StepCard.vue';
import StepEditor from '../components/StepEditor.vue';
import type { Trip, TripStep } from '../types';
import { fmtMoney } from '../utils/steps';

const route = useRoute();
const router = useRouter();

const tripId = ref(route.params.id as string | undefined);
const loading = ref(false);
const saving = ref(false);
const saved = ref(false);

const meta = reactive({
  title: '',
  destination: '',
  days: 3,
  startDate: '',
  endDate: '',
  budget: undefined as number | undefined,
  isPublic: false,
});
const steps = ref<TripStep[]>([]);

const editorOpen = ref(false);
const editingStep = ref<TripStep | null>(null);
const addDay = ref(1); // 新建步骤时默认落在的天
const dragSource = ref<{ day: number; index: number } | null>(null); // 当前被拖拽的卡片（天 + 天内索引）
const hoverDay = ref<number | null>(null); // 鼠标悬停到的天（用于高亮放置区）
const copyMenu = ref<{ step: TripStep; x: number; y: number } | null>(null); // “复制到其他天”菜单

// ---- 防误触：未保存修改保护 ----
const savedSnapshot = ref(''); // 最近一次保存/加载时的状态快照

function makeSnapshot(): string {
  return JSON.stringify({
    title: meta.title,
    destination: meta.destination,
    days: meta.days,
    startDate: meta.startDate,
    endDate: meta.endDate,
    budget: meta.budget,
    isPublic: meta.isPublic,
    steps: steps.value,
  });
}

const dirty = computed(() => savedSnapshot.value !== '' && makeSnapshot() !== savedSnapshot.value);

onMounted(async () => {
  if (!tripId.value) {
    // 新行程：以当前空表单为基准
    savedSnapshot.value = makeSnapshot();
    return;
  }
  loading.value = true;
  try {
    const t: Trip = await api.getTrip(tripId.value);
    meta.title = t.title;
    meta.destination = t.destination;
    meta.days = t.days;
    meta.startDate = t.startDate ? t.startDate.slice(0, 10) : '';
    meta.endDate = t.endDate ? t.endDate.slice(0, 10) : '';
    meta.budget = t.budget ?? undefined;
    meta.isPublic = t.isPublic;
    steps.value = t.steps.map((s) => ({ ...s }));
    savedSnapshot.value = makeSnapshot();
  } finally {
    loading.value = false;
  }
});

// 离开页面（点击导航等）前确认，防止误触丢失未保存的编辑
onBeforeRouteLeave(() => {
  if (!dirty.value) return true;
  return window.confirm('行程有未保存的修改，确定要离开吗？');
});

// 刷新/关闭标签页前由浏览器弹出确认
function onBeforeUnload(e: BeforeUnloadEvent) {
  if (!dirty.value) return;
  e.preventDefault();
  e.returnValue = '';
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload));
onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload));

const daysArr = computed(() => Array.from({ length: meta.days }, (_, i) => i + 1));

const summary = computed(() => {
  let totalCost = 0;
  const budget = { transport: 0, hotel: 0, ticket: 0, food: 0, other: 0 };
  const countByDay: Record<number, number> = {};
  for (const s of steps.value) {
    const c = s.cost || 0;
    totalCost += c;
    const cat = s.type.startsWith('transport') ? 'transport' : s.type === 'hotel' ? 'hotel' : s.type === 'ticket' ? 'ticket' : s.type === 'food' ? 'food' : 'other';
    budget[cat] += c;
    countByDay[s.day] = (countByDay[s.day] || 0) + 1;
  }
  return { totalCost, budget, countByDay };
});

function stepsOfDay(day: number) {
  return steps.value
    .filter((s) => s.day === day)
    .sort((a, b) => a.order - b.order);
}

function openAdd(day: number) {
  addDay.value = day;
  editingStep.value = null;
  editorOpen.value = true;
}

function openEdit(step: TripStep) {
  editingStep.value = step;
  editorOpen.value = true;
}

function saveStep(step: TripStep) {
  if (editingStep.value?.id) {
    const idx = steps.value.findIndex((s) => s.id === step.id);
    if (idx >= 0) steps.value[idx] = { ...step, order: steps.value[idx].order };
  } else {
    const daySteps = stepsOfDay(step.day);
    steps.value.push({
      ...step,
      id: step.id || `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      order: daySteps.length,
    });
  }
}

function removeStep(day: number, index: number) {
  const list = stepsOfDay(day);
  const [removed] = list.splice(index, 1);
  if (!removed) return;
  steps.value = steps.value.filter((s) => s !== removed);
  list.forEach((s, i) => (s.order = i));
}

// ---- 拖拽：支持跨天移动 & 同天重排 ----
function onDragStart(e: DragEvent, day: number, index: number) {
  e.dataTransfer?.setData('text/plain', `${day}:${index}`);
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  dragSource.value = { day, index };
}
function onDragEnd() {
  dragSource.value = null;
  hoverDay.value = null;
}
function onDrop(day: number, index: number) {
  const src = dragSource.value;
  if (!src) return;
  moveStep(src.day, src.index, day, index);
}
function onDropZone(day: number) {
  const src = dragSource.value;
  if (!src) return;
  moveStep(src.day, src.index, day, stepsOfDay(day).length);
}
/** 核心移动逻辑：把 fromDay 的第 fromIndex 项移动到 toDay 的第 toIndex 位（toIndex 超出则追加到末尾） */
function moveStep(fromDay: number, fromIndex: number, toDay: number, toIndex: number) {
  const targetDay = Math.max(1, Math.min(toDay, meta.days));
  const fromList = stepsOfDay(fromDay);
  const [moved] = fromList.splice(fromIndex, 1);
  if (!moved) return;
  if (fromDay === targetDay) {
    // 同天重排：移除后目标索引要回退一位
    const to = Math.max(0, Math.min(toIndex, fromList.length));
    fromList.splice(to, 0, moved);
    fromList.forEach((s, i) => (s.order = i));
  } else {
    // 跨天：先取目标天列表（此时 moved 还在原天），再改 day 后插入
    const toList = stepsOfDay(targetDay);
    const to = Math.max(0, Math.min(toIndex, toList.length));
    moved.day = targetDay;
    toList.splice(to, 0, moved);
    fromList.forEach((s, i) => (s.order = i));
    toList.forEach((s, i) => (s.order = i));
  }
  steps.value = steps.value.slice().sort((a, b) => a.day - b.day || a.order - b.order);
  dragSource.value = null;
  hoverDay.value = null;
}

// ---- 复制：把某天的一个步骤复制到其他天（追加到末尾） ----
function duplicateStep(step: TripStep, targetDay: number) {
  const day = Math.max(1, Math.min(targetDay, meta.days));
  const copy: TripStep = {
    ...step,
    id: `copy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    day,
    order: stepsOfDay(day).length,
    createdAt: undefined,
  };
  steps.value.push(copy);
  steps.value = steps.value.slice().sort((a, b) => a.day - b.day || a.order - b.order);
}
function openCopyMenu(step: TripStep, e: MouseEvent) {
  copyMenu.value = {
    step,
    x: Math.min(e.clientX, window.innerWidth - 150),
    y: Math.min(e.clientY, window.innerHeight - 230),
  };
}
function doCopyTo(day: number) {
  if (!copyMenu.value) return;
  duplicateStep(copyMenu.value.step, day);
  copyMenu.value = null;
}

const budgetRows = [
  { key: 'transport' as const, label: '🚆 交通', color: 'bg-blue-500' },
  { key: 'hotel' as const, label: '🏨 住宿', color: 'bg-violet-500' },
  { key: 'ticket' as const, label: '🎫 门票', color: 'bg-amber-500' },
  { key: 'food' as const, label: '🍜 餐饮', color: 'bg-orange-500' },
  { key: 'other' as const, label: '📦 其他', color: 'bg-gray-400' },
];

async function saveAll() {
  if (!meta.title.trim()) {
    meta.title = `${meta.destination || '我的'}之旅`;
  }
  saving.value = true;
  saved.value = false;
  try {
    let id = tripId.value;
    if (!id) {
      const t = await api.createTrip({
        title: meta.title,
        destination: meta.destination || '未知目的地',
        days: meta.days,
        startDate: meta.startDate || undefined,
        endDate: meta.endDate || undefined,
        budget: meta.budget,
        isPublic: meta.isPublic,
        source: 'manual',
      });
      id = t.id;
      tripId.value = id;
    } else {
      await api.updateTrip(id, {
        title: meta.title,
        destination: meta.destination,
        days: meta.days,
        startDate: meta.startDate || undefined,
        endDate: meta.endDate || undefined,
        budget: meta.budget,
        isPublic: meta.isPublic,
      });
    }
    if (steps.value.length) {
      await api.saveSteps(id, steps.value.map(({ id: _id, createdAt: _c, tripId: _t, ...rest }) => rest));
    }
    router.replace({ name: 'planner-edit', params: { id } });
    saved.value = true;
    savedSnapshot.value = makeSnapshot(); // 保存成功即视为无未保存修改
    setTimeout(() => (saved.value = false), 2000);
  } finally {
    saving.value = false;
  }
}

async function copyFromTemplate() {
  // 在模板广场中应用
  router.push('/templates');
}

function print() {
  window.print();
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-6">
    <div v-if="loading" class="py-20 text-center text-gray-400">加载中…</div>
    <template v-else>
      <!-- 行程信息 -->
      <div class="card p-4">
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs text-gray-500">行程名称</label>
            <input v-model="meta.title" class="input text-base font-medium" placeholder="如：九寨沟+峨眉山 大学生特种兵之旅" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">目的地</label>
            <input v-model="meta.destination" class="input" placeholder="如：九寨沟、峨眉山" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">总预算(元)</label>
            <input v-model.number="meta.budget" type="number" min="0" class="input" placeholder="选填" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">出发日期</label>
            <input v-model="meta.startDate" type="date" class="input" />
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">天数</label>
            <select v-model.number="meta.days" class="input">
              <option v-for="d in 15" :key="d" :value="d">{{ d }} 天</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs text-gray-500">公开分享</label>
            <button class="input flex items-center justify-between" @click="meta.isPublic = !meta.isPublic">
              <span>{{ meta.isPublic ? '已公开，可分享' : '仅自己可见' }}</span>
              <span class="text-sm" :class="meta.isPublic ? 'text-brand-600' : 'text-gray-400'">{{ meta.isPublic ? '✓' : '○' }}</span>
            </button>
          </div>
          <div class="flex items-end gap-2">
            <button class="btn-primary flex-1" :disabled="saving" @click="saveAll">
              {{ saving ? '保存中…' : tripId ? '保存行程' : '创建并保存' }}
            </button>
            <button class="btn-outline" title="从模板开始" @click="copyFromTemplate">📋</button>
          </div>
        </div>
        <p v-if="dirty" class="mt-2 flex items-center gap-1.5 text-sm text-amber-600">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"></span>
          有未保存的修改，离开或刷新前请先保存
        </p>
        <p v-else-if="saved" class="mt-2 text-sm text-brand-600">✓ 已保存</p>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <!-- 时间轴编辑器：所有天纵向排列，支持跨天拖拽 -->
        <div class="lg:col-span-2">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-700">行程安排</h2>
            <p class="text-xs text-gray-400">💡 拖动卡片可调整顺序或移到其他天，点 ⧉ 可复制到其他天</p>
          </div>
          <div class="space-y-4">
            <div
              v-for="d in daysArr"
              :key="d"
              class="rounded-2xl border-2 p-3 transition-colors"
              :class="hoverDay === d ? 'border-brand-400 bg-brand-50/60' : 'border-gray-100 bg-white'"
              @dragenter.prevent="hoverDay = d"
              @dragover.prevent
              @drop.prevent="onDropZone(d)"
            >
              <div class="mb-2 flex items-center gap-2">
                <span class="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">Day {{ d }}</span>
                <span class="text-sm font-semibold text-gray-700">第 {{ d }} 天</span>
                <span class="ml-auto text-xs text-gray-400">{{ stepsOfDay(d).length }} 个安排</span>
              </div>
              <div class="space-y-2">
                <StepCard
                  v-for="(s, i) in stepsOfDay(d)"
                  :key="s.id || i"
                  :step="s"
                  can-edit
                  :dragging="dragSource?.day === d && dragSource.index === i"
                  @edit="openEdit(s)"
                  @remove="removeStep(d, i)"
                  @copy="openCopyMenu(s, $event)"
                  @dragstart="onDragStart($event, d, i)"
                  @dragover="hoverDay = d"
                  @drop="onDrop(d, i)"
                  @dragend="onDragEnd"
                />
                <div
                  v-if="!stepsOfDay(d).length"
                  class="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400"
                >
                  这一天还没有安排，可直接把其他天的卡片拖到这里，或点击下方按钮添加
                </div>
              </div>
              <button class="btn-outline mt-2 w-full" @click="openAdd(d)">＋ 添加步骤（交通/住宿/门票/餐饮…）</button>
            </div>
          </div>
        </div>

        <!-- 汇总面板 -->
        <div class="space-y-4">
          <div class="card p-4">
            <h3 class="mb-3 text-sm font-semibold text-gray-700">规划汇总</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-brand-50 p-3">
                <p class="text-xs text-brand-600">总花费</p>
                <p class="mt-1 text-lg font-bold text-brand-700">{{ fmtMoney(summary.totalCost) }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-3">
                <p class="text-xs text-gray-500">步骤总数</p>
                <p class="mt-1 text-lg font-bold text-gray-700">{{ steps.length }}</p>
              </div>
            </div>
            <div class="mt-3 space-y-2">
              <div v-for="item in budgetRows" :key="item.key" class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full" :class="item.color"></span>
                <span class="flex-1 text-xs text-gray-500">{{ item.label }}</span>
                <span class="text-sm font-medium">{{ fmtMoney(summary.budget[item.key]) }}</span>
              </div>
            </div>
          </div>

          <div class="card p-4">
            <h3 class="mb-3 text-sm font-semibold text-gray-700">每日概览</h3>
            <div class="space-y-2">
              <div v-for="d in daysArr" :key="d" class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span class="text-sm text-gray-600">Day {{ d }}</span>
                <span class="text-xs text-gray-400">{{ summary.countByDay[d] || 0 }} 个安排</span>
              </div>
            </div>
            <button class="btn-ghost mt-3 w-full text-xs" @click="print">🖨️ 打印 / 导出 PDF</button>
          </div>
        </div>
      </div>
    </template>

    <StepEditor
      :open="editorOpen"
      :step="editingStep"
      :default-day="addDay"
      :max-day="meta.days"
      @close="editorOpen = false"
      @save="saveStep"
    />

    <!-- 复制到其他天 弹出菜单 -->
    <div v-if="copyMenu" class="fixed inset-0 z-50" @click="copyMenu = null">
      <div
        class="absolute w-40 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl"
        :style="{ left: copyMenu.x + 'px', top: copyMenu.y + 'px' }"
        @click.stop
      >
        <p class="px-3 py-1.5 text-xs font-medium text-gray-400">复制步骤到…</p>
        <button
          v-for="d in daysArr"
          :key="d"
          class="flex w-full items-center justify-between px-3 py-1.5 text-sm text-gray-700 hover:bg-brand-50"
          @click="doCopyTo(d)"
        >
          Day {{ d }}
          <span v-if="d === copyMenu.step.day" class="text-xs text-gray-400">（原日期）</span>
        </button>
      </div>
    </div>
  </div>
</template>
