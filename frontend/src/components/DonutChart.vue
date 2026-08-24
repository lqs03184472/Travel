<script setup lang="ts">
import { computed } from 'vue';
import { fmtMoney } from '../utils/steps';

const props = defineProps<{
  data: { label: string; value: number; color: string }[];
}>();

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0));
const size = 160;
const radius = 60;
const stroke = 26;
const circumference = 2 * Math.PI * radius;

const segments = computed(() => {
  let offset = 0;
  return props.data
    .filter((d) => d.value > 0)
    .map((d) => {
      const frac = total.value ? d.value / total.value : 0;
      const seg = { ...d, frac, offset, dash: frac * circumference };
      offset += frac * circumference;
      return seg;
    });
});
</script>

<template>
  <div class="flex flex-col items-center gap-4 sm:flex-row">
    <svg :width="size" :height="size" viewBox="0 0 160 160" class="-rotate-90">
      <circle cx="80" cy="80" :r="radius" fill="none" stroke="#f3f4f6" :stroke-width="stroke" />
      <template v-for="s in segments" :key="s.label">
        <circle
          cx="80"
          cy="80"
          :r="radius"
          fill="none"
          :stroke="s.color"
          :stroke-width="stroke"
          :stroke-dasharray="`${s.dash} ${circumference - s.dash}`"
          :stroke-dashoffset="-s.offset * circumference"
          stroke-linecap="butt"
        />
      </template>
      <text x="80" y="74" text-anchor="middle" class="rotate-90" transform="rotate(90 80 80)" fill="#111827" font-size="16" font-weight="bold">
        {{ total ? `¥${Math.round(total)}` : '—' }}
      </text>
      <text x="80" y="92" text-anchor="middle" transform="rotate(90 80 80)" fill="#9ca3af" font-size="10">
        总花费
      </text>
    </svg>
    <div class="w-full flex-1 space-y-1.5">
      <div v-for="s in segments" :key="s.label" class="flex items-center gap-2 text-sm">
        <span class="h-2.5 w-2.5 rounded-full" :style="{ background: s.color }"></span>
        <span class="flex-1 text-gray-600">{{ s.label }}</span>
        <span class="font-medium text-gray-800">{{ fmtMoney(s.value) }}</span>
        <span class="w-12 text-right text-xs text-gray-400">{{ Math.round(s.frac * 100) }}%</span>
      </div>
      <p v-if="!segments.length" class="py-2 text-center text-xs text-gray-400">暂无费用数据</p>
    </div>
  </div>
</template>
