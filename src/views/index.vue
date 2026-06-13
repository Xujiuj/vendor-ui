<template>
  <div class="app-container vendor-home page-panel">
    <div class="page-head">
      <div>
        <h1>运营总览</h1>
        <p>客户、授权与模板运营概况（不含客户行为监控）。</p>
      </div>
      <div class="btns">
        <button type="button" class="btn primary" @click="goTarget('/vendor/license')">新增授权</button>
      </div>
    </div>

    <el-alert v-if="loadError" class="overview-alert" type="error" :closable="false" :title="loadError" />

    <section v-loading="loading" class="dash-stats" aria-label="运营指标">
      <article v-for="item in stats" :key="item.label" class="dash-stat">
        <div class="label">{{ item.label }}</div>
        <div class="value">{{ item.value || '--' }}</div>
        <div class="sub">{{ item.note || '--' }}</div>
      </article>
      <el-empty v-if="!loading && !stats.length" class="overview-empty" description="暂无运营指标数据" />
    </section>

    <section class="workbench-grid">
      <div v-loading="loading" class="panel chart-panel workbench-main">
        <div class="toolbar">
          <b>每月各版本授权发放量</b>
          <span class="hint">按产品版本统计 .lic 签发</span>
        </div>
        <div class="chart-body" aria-label="每月各版本授权发放量柱状图">
          <div class="chart-legend">
            <span v-for="item in productVersions" :key="item.name">
              <i :style="{ background: item.color }"></i>
              {{ item.name }}
            </span>
          </div>
          <div class="bar-chart">
            <div v-for="month in monthlyAuthorizations" :key="month.month" class="month-group">
              <div class="bars">
                <span
                  v-for="item in month.values"
                  :key="item.name"
                  :title="`${month.month} ${item.name}: ${item.value}`"
                  :style="{ height: `${item.value * 8}px`, background: item.color }"
                ></span>
              </div>
              <small>{{ month.month }}</small>
            </div>
            <el-empty v-if="!monthlyAuthorizations.length" class="chart-empty" description="暂无授权发放数据" />
          </div>
        </div>
      </div>

      <aside v-loading="loading" class="panel reminder-panel notice-panel">
        <div class="toolbar">
          <b>运营提醒</b>
        </div>
        <div class="reminder-list">
          <article v-for="item in reminders" :key="item.title" class="reminder-item">
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </article>
          <el-empty v-if="!reminders.length" description="暂无运营提醒" />
        </div>
      </aside>
    </section>

    <section v-loading="loading" class="panel todo-panel">
      <div class="toolbar">
        <b>待办</b>
      </div>
      <div v-if="todos.length" class="todo-table-wrap">
        <table class="todo-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>客户</th>
              <th>说明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in todos" :key="`${item.type}-${item.customer}`">
              <td>
                <span class="todo-type">{{ item.type }}</span>
              </td>
              <td>{{ item.customer }}</td>
              <td>{{ item.description }}</td>
              <td>
                <button type="button" class="btn text" @click="goTarget(item.path)">{{ item.action }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <el-empty v-else description="暂无待办事项" />
    </section>
  </div>
</template>

<script setup name="Index" lang="ts">
import { getVendorOverview } from '@/api/vendor/overview';
import type {
  VendorOverviewMetric,
  VendorOverviewReminder,
  VendorOverviewSeries,
  VendorOverviewTodo,
  VendorOverviewVO
} from '@/api/vendor/overview/types';

const router = useRouter();

interface ChartValue extends VendorOverviewSeries {
  color: string;
  value: number;
}

interface MonthlyAuthorization {
  month: string;
  values: ChartValue[];
}

const loading = ref(false);
const loadError = ref('');
const stats = ref<VendorOverviewMetric[]>([]);
const productVersions = ref<Array<{ name: string; color: string }>>([]);
const monthlyAuthorizations = ref<MonthlyAuthorization[]>([]);
const reminders = ref<VendorOverviewReminder[]>([]);
const todos = ref<VendorOverviewTodo[]>([]);

const seriesColors = ['#1f8f6a', '#1677ff', '#f59e0b', '#7c3aed', '#ef4444'];

const loadOverview = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const { data } = await getVendorOverview();
    applyOverview(data);
  } catch (error) {
    loadError.value = '运营总览数据加载失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const applyOverview = (overview?: VendorOverviewVO) => {
  stats.value = overview?.metrics ?? [];
  reminders.value = overview?.reminders ?? [];
  todos.value = overview?.todos ?? [];

  const series = overview?.authorizationChart?.series ?? [];
  productVersions.value = series.map((item, index) => ({
    name: item.name,
    color: seriesColors[index % seriesColors.length]
  }));
  monthlyAuthorizations.value = (overview?.authorizationChart?.months ?? []).map((month, monthIndex) => ({
    month,
    values: series.map((item, seriesIndex) => ({
      ...item,
      value: item.values?.[monthIndex] ?? 0,
      color: seriesColors[seriesIndex % seriesColors.length]
    }))
  }));
};

const goTarget = (path: string) => {
  router.push(path);
};

onMounted(() => {
  loadOverview();
});
</script>

<style lang="scss" scoped>
.vendor-home {
  min-height: calc(100vh - 84px);
}

.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.overview-alert {
  margin-bottom: 16px;
}

.overview-empty,
.chart-empty {
  grid-column: 1 / -1;
}

.dash-stat {
  position: relative;
  display: grid;
  gap: 12px;
  min-height: 126px;
  padding: 22px 24px;
  border: 1px solid var(--carbon-soft-line);
  border-left: 4px solid var(--carbon-brand);
  border-radius: 8px;
  background: var(--carbon-panel);
  box-shadow: var(--carbon-shadow);
}

.dash-stat .label {
  color: var(--carbon-muted);
  font-size: 14px;
  font-weight: 600;
}

.dash-stat .value {
  color: var(--carbon-ink);
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.dash-stat .sub {
  min-height: 22px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--carbon-muted);
  font-size: 13px;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(280px, 0.9fr);
  gap: 20px;
  margin: 20px 0;
}

.workbench-main,
.notice-panel {
  overflow: hidden;
}

.chart-body {
  padding: 18px;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  color: var(--carbon-muted);
  font-size: 12px;
  flex-wrap: wrap;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chart-legend i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.bar-chart {
  display: grid;
  grid-template-columns: repeat(6, minmax(54px, 1fr));
  align-items: end;
  gap: 16px;
  min-height: 180px;
  padding-top: 12px;
  border-bottom: 1px solid var(--carbon-soft-line);
}

.month-group {
  display: grid;
  justify-items: center;
  gap: 8px;
}

.bars {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
  height: 104px;
}

.bars span {
  width: 12px;
  min-height: 12px;
  border-radius: 5px 5px 2px 2px;
  box-shadow: 0 8px 16px rgba(31, 45, 61, 0.12);
  transition:
    filter 0.18s ease,
    transform 0.18s ease;
}

.bars span:hover {
  filter: brightness(1.06);
  transform: translateY(-2px);
}

.month-group small {
  color: var(--carbon-muted);
  font-size: 12px;
}

.reminder-list {
  display: grid;
  padding: 18px;
  gap: 16px;
}

.reminder-item {
  position: relative;
  padding-left: 18px;
}

.reminder-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--carbon-primary);
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.14);
}

.reminder-item strong {
  display: block;
  color: var(--carbon-ink);
  font-size: 13px;
}

.reminder-item p {
  margin: 8px 0 0;
  color: var(--carbon-muted);
  font-size: 12px;
  line-height: 1.5;
}

.todo-panel {
  margin-top: 20px;
}

.todo-table-wrap {
  overflow-x: auto;
}

.todo-table {
  min-width: 640px;
}

.todo-type {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgba(31, 143, 106, 0.24);
  border-radius: 6px;
  background: var(--carbon-green-soft);
  color: var(--carbon-brand);
  font-size: 12px;
  font-weight: 650;
}

:global(html.dark) {
  .vendor-home {
    color: var(--carbon-ink);
  }

  .dash-stat,
  .chart-panel,
  .reminder-panel,
  .todo-panel {
    background: var(--carbon-panel);
    border-color: var(--carbon-soft-line);
    box-shadow: var(--carbon-shadow-soft);
  }

  .bars span {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  }

  .reminder-item::before {
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
  }

  .todo-type {
    border-color: rgba(69, 212, 131, 0.34);
    background: rgba(69, 212, 131, 0.14);
    color: #86efac;
  }
}

@media (max-width: 1200px) {
  .dash-stats,
  .workbench-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dash-stats,
  .workbench-grid,
  .bar-chart {
    grid-template-columns: 1fr;
  }

  .bar-chart {
    align-items: stretch;
    gap: 12px;
    min-height: 0;
    border-bottom: 0;
  }

  .month-group {
    grid-template-columns: 42px minmax(0, 1fr);
    justify-items: stretch;
    align-items: center;
  }

  .bars {
    justify-content: flex-start;
    height: 70px;
  }
}
</style>
