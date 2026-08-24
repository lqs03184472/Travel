<script setup lang="ts">
import { computed } from 'vue';
import type { TripStep } from '../types';
import { fmtMoney } from '../utils/steps';
import { getStepTypeConfig, fmtDuration } from '../utils/steps';

const props = defineProps<{ step: TripStep; canEdit?: boolean; dragging?: boolean }>();
const emit = defineEmits<{
  edit: [];
  remove: [];
  copy: [e: MouseEvent];
  dragstart: [e: DragEvent];
  dragover: [e: DragEvent];
  drop: [];
  dragend: [];
}>();

const cfg = computed(() => getStepTypeConfig(props.step.type));

function detailText(): string {
  const d = props.step.details || {};
  switch (props.step.type) {
    case 'transport_main':
      return [d.from, d.to].filter(Boolean).join(' → ') + (d.vehicle ? `（${d.vehicle}）` : '');
    case 'transport_transfer':
      return [d.from, d.to].filter(Boolean).join(' → ') + (d.vehicle ? `（${d.vehicle}）` : '');
    case 'hotel':
      return [d.name, d.roomType].filter(Boolean).join(' · ');
    case 'ticket':
      return [d.scenic, d.ticketType].filter(Boolean).join(' · ');
    case 'food':
      return d.name || '';
    case 'sight':
    case 'other':
      return d.remark || '';
    default:
      return '';
  }
}
</script>

<template>
  <div
    class="group flex gap-3 rounded-xl border bg-white p-3 shadow-sm transition-shadow"
    :class="[cfg.border, dragging ? 'opacity-50 ring-2 ring-brand-400' : 'hover:shadow-md']"
    draggable="true"
    @dragstart="emit('dragstart', $event)"
    @dragover.prevent="emit('dragover', $event)"
    @drop.prevent.stop="emit('drop')"
    @dragend="emit('dragend')"
  >
    <div class="flex flex-col items-center pt-0.5">
      <span class="flex h-9 w-9 items-center justify-center rounded-lg text-lg" :class="cfg.bg">{{ cfg.icon }}</span>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span v-if="step.startTime" class="badge bg-gray-100 text-gray-600">{{ step.startTime }}</span>
        <span class="badge" :class="cfg.bg + ' ' + cfg.color">{{ cfg.label }}</span>
        <span v-if="step.durationMin" class="text-xs text-gray-400">{{ fmtDuration(step.durationMin) }}</span>
      </div>
      <p class="mt-1 truncate text-sm font-medium text-gray-800" :title="step.title">{{ step.title }}</p>
      <p v-if="detailText()" class="mt-0.5 truncate text-xs text-gray-500" :title="detailText()">{{ detailText() }}</p>
    </div>
    <div class="flex shrink-0 items-center gap-1">
      <span v-if="step.cost" class="text-sm font-semibold text-brand-700">{{ fmtMoney(step.cost) }}</span>
      <template v-if="canEdit">
        <button class="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100" title="复制到其他天" @click="emit('copy', $event)">⧉</button>
        <button class="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100" title="编辑" @click="emit('edit')">✏️</button>
        <button class="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100" title="删除" @click="emit('remove')">🗑️</button>
        <span class="cursor-grab p-1 text-gray-300 opacity-0 group-hover:opacity-100" title="拖拽到其他天或调整顺序">⠿</span>
      </template>
    </div>
  </div>
</template>
