<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { StepType, TripStep } from '../types';
import { STEP_TYPES, getStepTypeConfig } from '../utils/steps';

const props = defineProps<{ open: boolean; step: TripStep | null; defaultDay?: number; maxDay?: number }>();
const emit = defineEmits<{ close: []; save: [step: TripStep] }>();

const stepType = ref<StepType>('transport_main');
const day = ref(1);
const startTime = ref('');
const durationMin = ref<number | undefined>();
const cost = ref<number | undefined>();
const title = ref('');
const details = ref<Record<string, any>>({});
const picking = ref(true);

// ---- 防误触：未保存内容保护 ----
const initialRef = ref(''); // 本次打开时的表单快照（'' 表示尚未初始化）
const dirty = ref(false); // 表单是否被修改过
const confirmingClose = ref(false); // 是否弹出"放弃修改"确认

function snapshot(): string {
  return JSON.stringify({
    type: stepType.value,
    day: day.value,
    startTime: startTime.value,
    durationMin: durationMin.value,
    cost: cost.value,
    title: title.value,
    details: details.value,
  });
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      confirmingClose.value = false;
      return;
    }
    initialRef.value = ''; // 标记本次会话未初始化
    if (props.step) {
      stepType.value = props.step.type;
      day.value = props.step.day;
      startTime.value = props.step.startTime || '';
      durationMin.value = props.step.durationMin || undefined;
      cost.value = props.step.cost ?? undefined;
      title.value = props.step.title;
      details.value = { ...(props.step.details || {}) };
      picking.value = false;
    } else {
      stepType.value = 'transport_main';
      day.value = props.defaultDay || 1;
      startTime.value = '';
      durationMin.value = undefined;
      cost.value = undefined;
      title.value = '';
      details.value = {};
      picking.value = true;
    }
    dirty.value = false;
    initialRef.value = snapshot(); // 快照本次初始值，之后任何修改都会让 dirty 变 true
  },
);

watch(
  [stepType, day, startTime, durationMin, cost, title, details],
  () => {
    if (props.open && initialRef.value !== '') {
      dirty.value = snapshot() !== initialRef.value;
    }
  },
  { deep: true },
);

/** 统一关闭入口：有未保存内容时先弹确认，避免误触丢数据 */
function tryClose() {
  if (dirty.value) {
    confirmingClose.value = true;
    return;
  }
  emit('close');
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) tryClose();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

const cfg = () => getStepTypeConfig(stepType.value);

function pickType(t: StepType) {
  stepType.value = t;
  picking.value = false;
}

function buildTitle(): string {
  if (title.value.trim()) return title.value.trim();
  const d = details.value;
  switch (stepType.value) {
    case 'transport_main':
    case 'transport_transfer':
      return [d.from, d.to].filter(Boolean).join('→') || cfg().label;
    case 'hotel':
      return d.name || '住宿安排';
    case 'ticket':
      return d.scenic ? `${d.scenic}门票` : '门票';
    case 'food':
      return d.name || '用餐';
    default:
      return cfg().label;
  }
}

function calcCost(): number | undefined {
  if (cost.value !== undefined && cost.value !== null) return Number(cost.value);
  if (stepType.value === 'hotel' && details.value.pricePerNight) {
    const nights = Number(details.value.nights) || 1;
    return Math.round(Number(details.value.pricePerNight) * nights);
  }
  if (stepType.value === 'ticket' && details.value.cost) return Number(details.value.cost);
  return undefined;
}

function save() {
  emit('save', {
    ...(props.step ? { id: props.step.id } : { id: '' }),
    type: stepType.value,
    title: buildTitle(),
    day: day.value,
    order: props.step?.order || 0,
    startTime: startTime.value || undefined,
    durationMin: durationMin.value,
    cost: calcCost(),
    details: details.value,
  } as TripStep);
  emit('close');
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" @click.self="tryClose">
    <div class="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-base font-semibold">{{ props.step ? '编辑步骤' : '添加步骤' }}</h3>
        <button class="rounded p-1 text-gray-400 hover:bg-gray-100" @click="tryClose">✕</button>
      </div>

      <!-- 类型选择 -->
      <div v-if="picking">
        <p class="mb-2 text-sm text-gray-500">选择步骤类型</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="t in STEP_TYPES"
            :key="t.type"
            class="flex items-center gap-2 rounded-xl border p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
            :class="t.border"
            @click="pickType(t.type)"
          >
            <span class="text-xl">{{ t.icon }}</span>
            <div>
              <p class="text-sm font-medium text-gray-800">{{ t.label }}</p>
              <p class="text-xs text-gray-400">{{ t.fields.slice(0, 3).map((f) => f.label).join('、') }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- 表单 -->
      <template v-else>
        <div class="mb-3 flex items-center gap-2">
          <button class="text-xs text-brand-600 hover:underline" @click="picking = true">← 更换类型</button>
          <span class="badge" :class="cfg().bg + ' ' + cfg().color">{{ cfg().icon }} {{ cfg().label }}</span>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="mb-1 block text-xs text-gray-500">所属天</label>
              <select v-model.number="day" class="input">
                <option v-for="d in Math.max(props.maxDay || 1, day)" :key="d" :value="d">Day {{ d }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs text-gray-500">开始时间</label>
              <input v-model="startTime" type="time" class="input" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-gray-500">耗时(分钟)</label>
              <input v-model.number="durationMin" type="number" min="0" class="input" placeholder="选填" />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs text-gray-500">标题</label>
            <input v-model="title" class="input" :placeholder="`留空自动生成，如：${buildTitle()}`" />
          </div>

          <div v-for="f in cfg().fields" :key="f.key">
            <label class="mb-1 block text-xs text-gray-500">{{ f.label }}</label>
            <input
              v-if="f.type === 'number'"
              v-model.number="details[f.key]"
              type="number"
              class="input"
              :placeholder="f.placeholder"
            />
            <input v-else v-model="details[f.key]" :type="f.type || 'text'" class="input" :placeholder="f.placeholder" />
          </div>

          <div v-if="stepType === 'hotel'">
            <label class="mb-1 block text-xs text-gray-500">总金额（按 价格/晚 × 晚数 自动计算，可改）</label>
            <input v-model.number="cost" type="number" min="0" class="input" placeholder="自动计算" />
          </div>
          <div v-else-if="['ticket', 'transport_main', 'transport_transfer', 'food', 'other'].includes(stepType)">
            <label class="mb-1 block text-xs text-gray-500">金额（元）</label>
            <input v-model.number="cost" type="number" min="0" class="input" placeholder="0" />
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="btn-outline" @click="tryClose">取消</button>
          <button class="btn-primary" @click="save">保存</button>
        </div>
      </template>

      <!-- 防误触：放弃修改确认 -->
      <div v-if="confirmingClose" class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm">
        <div class="mx-4 w-full max-w-xs rounded-xl border border-gray-200 bg-white p-5 text-center shadow-lg">
          <p class="text-base">✋</p>
          <p class="mt-1 text-sm font-medium text-gray-800">当前步骤有未保存的内容</p>
          <p class="mt-1 text-xs text-gray-400">确定放弃本次编辑吗？</p>
          <div class="mt-4 flex gap-2">
            <button class="btn-primary flex-1 !bg-red-500 hover:!bg-red-600" @click="confirmingClose = false; emit('close')">
              放弃修改
            </button>
            <button class="btn-outline flex-1" @click="confirmingClose = false">继续编辑</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
