<template>
  <div class="page-panel">
    <div class="page-head factor-version-head">
      <div>
        <h1>因子版本</h1>
        <p>管理供应商侧排放因子版本，查看发布、冻结与开放范围前的版本元数据。</p>
      </div>
      <div class="head-notes">
        <div><strong>用途</strong><span>维护因子目录版本状态，支撑后续发布、冻结和授权范围管理。</span></div>
        <div><strong>是否需填报</strong><span>无需企业填报，由供应商运营维护。</span></div>
        <div><strong>如何填</strong><span>当前页只查询供应商版本元数据，生命周期动作待后端接口开放后接入。</span></div>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>版本编码</label>
          <el-input v-model="queryParams.versionCode" placeholder="请输入版本编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>版本名称</label>
          <el-input v-model="queryParams.versionName" placeholder="请输入版本名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>发布状态</label>
          <el-select v-model="queryParams.publishStatus" placeholder="请选择发布状态" clearable>
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已冻结" value="FROZEN" />
          </el-select>
        </div>
        <div class="search-item">
          <label>冻结标记</label>
          <el-select v-model="queryParams.frozenFlag" placeholder="请选择冻结标记" clearable>
            <el-option label="未冻结" :value="0" />
            <el-option label="已冻结" :value="1" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button link type="primary" @click="showSearch = false">
            <el-icon><ArrowUp /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-show="!showSearch" class="toolbar">
        <div class="btns">
          <el-button type="primary" icon="Search" @click="showSearch = true">展开搜索</el-button>
          <el-button icon="Refresh" @click="getList">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="factorVersionList" border>
        <el-table-column label="版本编码" align="center" prop="versionCode" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="版本名称" align="center" prop="versionName" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="发布状态" align="center" prop="publishStatus" width="120">
          <template #default="{ row }">
            <el-tag :type="publishStatusTagType(row.publishStatus)">{{ formatPublishStatus(row.publishStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="冻结标记" align="center" prop="frozenFlag" width="110">
          <template #default="{ row }">
            <el-tag :type="isFrozen(row.frozenFlag) ? 'danger' : 'success'">{{ isFrozen(row.frozenFlag) ? '已冻结' : '未冻结' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布人" align="center" prop="publishedBy" width="140" :show-overflow-tooltip="true" />
        <el-table-column label="发布时间" align="center" prop="publishedTime" width="170">
          <template #default="{ row }">
            {{ formatDate(row.publishedTime) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <el-drawer v-model="detailDrawer.visible" title="因子版本详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="版本编码">{{ detailRecord.versionCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="版本名称">{{ detailRecord.versionName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ formatPublishStatus(detailRecord.publishStatus) }}</el-descriptions-item>
        <el-descriptions-item label="冻结标记">{{ isFrozen(detailRecord.frozenFlag) ? '已冻结' : '未冻结' }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ detailRecord.publishedBy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDate(detailRecord.publishedTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRecord.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorFactorVersion" lang="ts">
import { listFactorVersion } from '@/api/vendor/factorVersion';
import type { FactorVersionQuery, FactorVersionVO } from '@/api/vendor/factorVersion/types';
import { parseTime } from '@/utils/ruoyi';

type FactorVersionListResponse = {
  rows?: FactorVersionVO[];
  total?: number;
  data?: FactorVersionVO[] | FactorVersionVO;
};

const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const factorVersionList = ref<FactorVersionVO[]>([]);
const detailRecord = ref<FactorVersionVO>();
const detailDrawer = reactive({
  visible: false
});

const queryParams = reactive<FactorVersionQuery>({
  pageNum: 1,
  pageSize: 10,
  versionCode: undefined,
  versionName: undefined,
  publishStatus: undefined,
  frozenFlag: undefined,
  params: {}
});

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listFactorVersion(queryParams)) as unknown as FactorVersionListResponse;
    const dataRows = Array.isArray(res.data) ? res.data : [];
    factorVersionList.value = res.rows || dataRows;
    total.value = Number(res.total || factorVersionList.value.length || 0);
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.versionCode = undefined;
  queryParams.versionName = undefined;
  queryParams.publishStatus = undefined;
  queryParams.frozenFlag = undefined;
  getList();
};

const openDetail = (row: FactorVersionVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const isFrozen = (value?: number | boolean) => value === true || value === 1;

const formatPublishStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    RELEASED: '已发布',
    FROZEN: '已冻结',
    DISABLED: '已停用'
  };
  return status ? statusMap[status] || status : '-';
};

const publishStatusTagType = (status?: string) => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    RELEASED: 'success',
    FROZEN: 'danger',
    DISABLED: 'warning'
  };
  return status ? statusMap[status] || 'info' : 'info';
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }
  return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') || value;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.factor-version-head {
  align-items: flex-start;
  gap: 16px;
}

.head-notes {
  display: grid;
  min-width: 420px;
  max-width: 640px;
  gap: 8px;
  color: #4b5563;
  font-size: 13px;

  div {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 8px;
  }

  strong {
    color: #1f2937;
    font-weight: 600;
  }
}

@media (max-width: 960px) {
  .head-notes {
    min-width: 0;
    max-width: none;
  }
}
</style>
