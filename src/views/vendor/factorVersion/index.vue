<template>
  <div class="page-panel">
    <div class="page-head factor-version-head">
      <div>
        <h1>因子版本</h1>
        <p>管理厂商云端排放因子版本元数据，查看发布、冻结和开放范围前置状态。</p>
      </div>
      <div class="head-notes">
        <div><strong>归属</strong><span>厂商云端维护，不承载企业本地填报、导入或报表入口。</span></div>
        <div><strong>数据来源</strong><span>仅调用 /vendor/factor-version。</span></div>
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
            <el-option label="已停用" value="DISABLED" />
          </el-select>
        </div>
        <div class="search-item">
          <label>冻结标记</label>
          <el-select v-model="queryParams.frozenFlag" placeholder="请选择冻结标记" clearable>
            <el-option label="未冻结" :value="false" />
            <el-option label="已冻结" :value="true" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
          <el-button icon="Refresh" @click="refreshList">刷新</el-button>
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
            {{ formatDateTime(row.publishedTime) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="refreshList" />
    </div>

    <el-drawer v-model="detailDrawer.visible" title="因子版本详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="版本编码">{{ formatText(detailRecord.versionCode) }}</el-descriptions-item>
        <el-descriptions-item label="版本名称">{{ formatText(detailRecord.versionName) }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ formatPublishStatus(detailRecord.publishStatus) }}</el-descriptions-item>
        <el-descriptions-item label="冻结标记">{{ isFrozen(detailRecord.frozenFlag) ? '已冻结' : '未冻结' }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ formatText(detailRecord.publishedBy) }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDateTime(detailRecord.publishedTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatText(detailRecord.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorFactorVersion" lang="ts">
import { listFactorVersion } from '@/api/vendor/factorVersion';
import type { FactorVersionQuery, FactorVersionVO } from '@/api/vendor/factorVersion/types';
import { formatDateTime, formatPublishStatus, formatText, publishStatusTagType, readRows, readTotal } from '../shared';

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
    const res = await listFactorVersion(queryParams);
    factorVersionList.value = readRows<FactorVersionVO>(res);
    total.value = readTotal(res, factorVersionList.value);
  } finally {
    loading.value = false;
  }
};

const refreshList = async () => {
  try {
    await getList();
  } catch {
    // Global request interceptor already shows the error.
  }
};

const handleQuery = async () => {
  queryParams.pageNum = 1;
  await refreshList();
};

const resetQuery = async () => {
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.versionCode = undefined;
  queryParams.versionName = undefined;
  queryParams.publishStatus = undefined;
  queryParams.frozenFlag = undefined;
  await refreshList();
};

const openDetail = (row: FactorVersionVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const isFrozen = (value?: number | boolean) => value === true || value === 1;

onMounted(() => {
  void refreshList();
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
    grid-template-columns: 72px 1fr;
    gap: 8px;
  }

  strong {
    color: #1f2937;
    font-weight: 600;
  }
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

@media (max-width: 960px) {
  .head-notes {
    min-width: 0;
    max-width: none;
  }
}
</style>
