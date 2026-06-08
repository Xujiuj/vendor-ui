<template>
  <div class="app-container vendor-home page-panel">
    <div class="page-head">
      <div>
        <h1>厂商运营工作台</h1>
        <p>客户档案、License 授权/签发、因子版本、开放范围、模板分发和续费订单统一从厂商业务域进入。</p>
      </div>
      <span class="portal-chip">后端菜单驱动</span>
    </div>

    <section class="metric-grid" aria-label="厂商业务入口">
      <button v-for="item in operations" :key="item.title" type="button" class="metric-card" @click="goTarget(item.path)">
        <span class="metric-icon">
          <svg-icon :icon-class="item.icon" />
        </span>
        <span>
          <b>{{ item.title }}</b>
          <small>{{ item.summary }}</small>
        </span>
      </button>
    </section>

    <section class="panel status-panel" aria-label="运营状态摘要">
      <div class="toolbar">
        <b>运营状态摘要</b>
        <span class="hint">只聚合厂商侧客户、授权、因子、模板和续费状态，不展示企业本地 01-05 业务。</span>
      </div>
      <div class="status-grid">
        <div v-for="item in statusSummary" :key="item.label" class="status-card">
          <span class="status-value">{{ item.value }}</span>
          <span class="status-label">{{ item.label }}</span>
          <small>{{ item.note }}</small>
        </div>
      </div>
    </section>

    <section class="panel action-panel">
      <div class="toolbar">
        <b>今日运营关注</b>
        <span class="hint">以下处理项复用已有厂商页面/API，由后端 getRouters 返回实际菜单。</span>
      </div>
      <div class="task-list">
        <div v-for="task in tasks" :key="task.title" class="task-row">
          <span class="task-state" :class="task.stateClass">{{ task.state }}</span>
          <div>
            <strong>{{ task.title }}</strong>
            <p>{{ task.description }}</p>
          </div>
          <el-button text type="primary" @click="goTarget(task.path)">查看</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup name="Index" lang="ts">
const router = useRouter();

const operations = [
  {
    title: '客户档案',
    summary: '客户主数据与授权对象',
    icon: 'peoples',
    path: '/vendor/customer'
  },
  {
    title: 'License 授权/签发',
    summary: '签发、下载和授权审计',
    icon: 'lock',
    path: '/vendor/license'
  },
  {
    title: '因子版本',
    summary: '发布、冻结和版本治理',
    icon: 'tree',
    path: '/vendor/factor-version'
  },
  {
    title: '因子开放范围',
    summary: '按客户和 License 控制因子可见性',
    icon: 'eye-open',
    path: '/vendor/factor-scope'
  },
  {
    title: '模板库',
    summary: '报表模板维护与发布',
    icon: 'documentation',
    path: '/vendor/report-template'
  },
  {
    title: '模板分发',
    summary: '模板面向客户的开放范围',
    icon: 'guide',
    path: '/vendor/template-scope'
  },
  {
    title: '续费订单',
    summary: '续费跟踪和运营处理',
    icon: 'money',
    path: '/vendor/renewal-order'
  },
  {
    title: '运营状态摘要',
    summary: '授权、模板和续费风险聚合',
    icon: 'dashboard',
    path: '/vendor/renewal-order'
  }
];

const statusSummary = [
  {
    value: '客户',
    label: '签发前置',
    note: '停用客户不可签发 License'
  },
  {
    value: 'License',
    label: '授权闭环',
    note: '签发结果支持 .lic 下载'
  },
  {
    value: '因子',
    label: '开放控制',
    note: '版本和客户范围分别治理'
  },
  {
    value: '模板',
    label: '分发范围',
    note: '模板库发布后再授权客户'
  }
];

const tasks = [
  {
    title: '核对客户档案状态',
    description: '停用客户不可签发 License，签发前以厂商客户主数据为准。',
    state: '客户',
    stateClass: 'state-info',
    path: '/vendor/customer'
  },
  {
    title: '处理 License 签发请求',
    description: '授权签发页面复用已有页面，并调用 vendor/licenseIssue 接口。',
    state: '授权',
    stateClass: 'state-ok',
    path: '/vendor/license'
  },
  {
    title: '确认因子开放范围',
    description: '因子版本发布后，按客户和 License 管理开放范围。',
    state: '因子',
    stateClass: 'state-info',
    path: '/vendor/factor-scope'
  },
  {
    title: '确认模板分发范围',
    description: '模板库和分发范围由厂商侧维护，企业端只消费下载能力。',
    state: '模板',
    stateClass: 'state-warn',
    path: '/vendor/template-scope'
  }
];

const goTarget = (path: string) => {
  router.push(path);
};
</script>

<style lang="scss" scoped>
.vendor-home {
  min-height: calc(100vh - 84px);
}

.portal-chip {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border: 1px solid #cdeadd;
  border-radius: 6px;
  background: #eaf8f1;
  color: #157656;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.metric-card {
  min-height: 112px;
  padding: 16px;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 45, 61, 0.025), 0 6px 18px -10px rgba(31, 45, 61, 0.06);
  color: var(--carbon-text);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.metric-card:hover {
  border-color: #cdeadd;
  box-shadow: 0 10px 26px rgba(31, 45, 61, 0.08);
  transform: translateY(-2px);
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #eaf8f1;
  color: var(--carbon-brand);
}

.metric-icon :deep(.svg-icon) {
  width: 18px;
  height: 18px;
}

.metric-card b,
.metric-card small {
  display: block;
}

.metric-card b {
  color: var(--carbon-ink);
  font-size: 15px;
  font-weight: 700;
}

.metric-card small {
  margin-top: 6px;
  color: var(--carbon-muted);
  font-size: 12px;
  line-height: 1.5;
}

.status-panel {
  margin-bottom: 14px;
  padding: 0;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid #f1f3f6;
}

.status-card {
  min-height: 96px;
  padding: 16px 18px;
  border-right: 1px solid #f1f3f6;
}

.status-card:last-child {
  border-right: 0;
}

.status-value,
.status-label,
.status-card small {
  display: block;
}

.status-value {
  color: var(--carbon-brand);
  font-size: 18px;
  font-weight: 800;
}

.status-label {
  margin-top: 6px;
  color: var(--carbon-ink);
  font-size: 13px;
  font-weight: 700;
}

.status-card small {
  margin-top: 6px;
  color: var(--carbon-muted);
  font-size: 12px;
  line-height: 1.5;
}

.action-panel {
  padding: 0;
}

.task-list {
  display: grid;
}

.task-row {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f3f6;
}

.task-row:last-child {
  border-bottom: 0;
}

.task-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.state-info {
  color: #2563eb;
  background: #eff6ff;
}

.state-ok {
  color: #0f8a55;
  background: #eaf8f1;
}

.state-warn {
  color: #b7791f;
  background: #fff7e6;
}

.task-row strong {
  display: block;
  color: var(--carbon-ink);
  font-size: 14px;
}

.task-row p {
  margin: 4px 0 0;
  color: var(--carbon-muted);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .metric-grid,
  .status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .metric-grid,
  .status-grid,
  .task-row {
    grid-template-columns: 1fr;
  }

  .status-card {
    border-right: 0;
    border-bottom: 1px solid #f1f3f6;
  }

  .status-card:last-child {
    border-bottom: 0;
  }

  .task-row {
    align-items: start;
  }
}
</style>
