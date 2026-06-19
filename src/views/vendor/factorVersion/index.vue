<template>
  <div class="page-panel">
    <div class="page-head factor-version-head">
      <div>
        <h1>因子版本</h1>
        <p>管理厂商云端排放因子版本元数据，查看发布、冻结和开放范围前置状态。</p>
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
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已冻结" value="frozen" />
            <el-option label="已退役" value="retired" />
            <el-option label="已停用" value="disabled" />
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
            <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="refreshList" />
          </div>
      </div>
      <div class="search-bar search-bar-collapsed" v-show="!showSearch">
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="refreshList" />
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
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
        <el-table-column label="操作" align="center" width="260" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
              <el-button
                v-if="canPublish(row)"
                v-hasPermi="['vendor:factorVersion:edit']"
                link
                type="primary"
                icon="Promotion"
                :disabled="actioningId === row.id"
                @click="handlePublish(row)"
              >
                发布
              </el-button>
              <el-button
                v-if="canFreeze(row)"
                v-hasPermi="['vendor:factorVersion:edit']"
                link
                type="warning"
                icon="CircleClose"
                :disabled="actioningId === row.id"
                @click="handleFreeze(row)"
              >
                冻结
              </el-button>
              <el-button
                v-if="canRetire(row)"
                v-hasPermi="['vendor:factorVersion:edit']"
                link
                type="danger"
                icon="Delete"
                :disabled="actioningId === row.id"
                @click="handleRetire(row)"
              >
                退役
              </el-button>
              <el-button
                v-if="canRestore(row)"
                v-hasPermi="['vendor:factorVersion:edit']"
                link
                type="success"
                icon="RefreshLeft"
                :disabled="actioningId === row.id"
                @click="handleRestore(row)"
              >
                恢复
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="refreshList"
      />
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
import {
  freezeFactorVersion,
  listFactorVersion,
  publishFactorVersion,
  restoreFactorVersion,
  retireFactorVersion
} from '@/api/vendor/factorVersion';
import type { FactorVersionQuery, FactorVersionVO } from '@/api/vendor/factorVersion/types';
import { formatDateTime, formatPublishStatus, formatText, publishStatusTagType, readRows, readTotal } from '../shared';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const factorVersionList = ref<FactorVersionVO[]>([]);
const detailRecord = ref<FactorVersionVO>();
const actioningId = ref<string | number>();
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

const normalizePublishStatus = (status?: string) => status?.trim().toUpperCase() ?? '';
const isFrozen = (value?: number | boolean) => value === true || value === 1;

const canPublish = (row: FactorVersionVO) => normalizePublishStatus(row.publishStatus) === 'DRAFT';
const canFreeze = (row: FactorVersionVO) => {
  const status = normalizePublishStatus(row.publishStatus);
  return status === 'PUBLISHED' && !isFrozen(row.frozenFlag);
};
const canRetire = (row: FactorVersionVO) => {
  const status = normalizePublishStatus(row.publishStatus);
  return status === 'PUBLISHED' || status === 'FROZEN' || isFrozen(row.frozenFlag);
};
const canRestore = (row: FactorVersionVO) => normalizePublishStatus(row.publishStatus) === 'RETIRED' && !isFrozen(row.frozenFlag);

const syncLocalLifecycleState = (row: FactorVersionVO, publishStatus: string, frozenFlag: boolean) => {
  row.publishStatus = publishStatus;
  row.frozenFlag = frozenFlag;

  const currentRow = factorVersionList.value.find((item) => item.id === row.id);
  if (currentRow) {
    currentRow.publishStatus = publishStatus;
    currentRow.frozenFlag = frozenFlag;
  }

  if (detailRecord.value?.id === row.id) {
    detailRecord.value.publishStatus = publishStatus;
    detailRecord.value.frozenFlag = frozenFlag;
  }
};

const syncDetailFromList = (id: string | number) => {
  if (detailRecord.value?.id !== id) {
    return;
  }

  const refreshedRow = factorVersionList.value.find((item) => item.id === id);
  if (refreshedRow) {
    detailRecord.value = refreshedRow;
  }
};

const runPublishStatusAction = async (
  row: FactorVersionVO,
  publishStatus: string,
  frozenFlag: boolean,
  action: (id: string | number) => Promise<unknown>,
  successMessage: string
) => {
  actioningId.value = row.id;
  try {
    await action(row.id);
    syncLocalLifecycleState(row, publishStatus, frozenFlag);
    try {
      await getList();
      syncDetailFromList(row.id);
      proxy?.$modal.msgSuccess(successMessage);
    } catch {
      proxy?.$modal.msgWarning('动作成功但列表刷新失败，请手动刷新列表');
    }
  } catch {
    // Global request interceptor already shows the error.
  } finally {
    actioningId.value = undefined;
  }
};

const handlePublish = async (row: FactorVersionVO) => {
  if (!canPublish(row)) {
    return;
  }
  await runPublishStatusAction(row, 'published', false, publishFactorVersion, '因子版本已发布');
};

const handleFreeze = async (row: FactorVersionVO) => {
  if (!canFreeze(row)) {
    return;
  }
  await runPublishStatusAction(row, 'frozen', true, freezeFactorVersion, '因子版本已冻结');
};

const handleRetire = async (row: FactorVersionVO) => {
  if (!canRetire(row)) {
    return;
  }
  await runPublishStatusAction(row, 'retired', false, retireFactorVersion, '因子版本已退役');
};

const handleRestore = async (row: FactorVersionVO) => {
  if (!canRestore(row)) {
    return;
  }
  await runPublishStatusAction(row, 'draft', false, restoreFactorVersion, '因子版本已恢复为草稿');
};

onMounted(() => {
  void refreshList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped lang="scss">
.table-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

</style>
