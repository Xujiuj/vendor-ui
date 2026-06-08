<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>模板开放范围</h1>
        <p>查看报表模板对客户和 License 的开放关系，数据来自厂商模板范围 API。</p>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>模板 ID</label>
          <el-input v-model="queryParams.templateId" placeholder="请输入模板 ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>客户 ID</label>
          <el-input v-model="queryParams.customerId" placeholder="请输入客户 ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>License</label>
          <el-input v-model="queryParams.licenseId" placeholder="请输入 License ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-select v-model="queryParams.scopeStatus" placeholder="请选择状态" clearable>
            <el-option label="开放中" value="ACTIVE" />
            <el-option label="待生效" value="PENDING" />
            <el-option label="已停用" value="DISABLED" />
            <el-option label="已过期" value="EXPIRED" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
        <el-button icon="Refresh" @click="refreshList">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="scopeList" border>
        <el-table-column label="范围 ID" align="center" prop="id" width="110" />
        <el-table-column label="模板 ID" align="center" prop="templateId" width="120" />
        <el-table-column label="客户 ID" align="center" prop="customerId" width="120" />
        <el-table-column label="License" align="center" prop="licenseId" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="开放状态" align="center" prop="scopeStatus" width="120">
          <template #default="{ row }">
            <el-tag :type="scopeStatusTagType(row.scopeStatus)">{{ formatScopeStatus(row.scopeStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="refreshList" />
    </div>

    <el-drawer v-model="detailDrawer.visible" title="模板开放范围详情" size="520px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="范围 ID">{{ formatText(detailRecord.id) }}</el-descriptions-item>
        <el-descriptions-item label="模板 ID">{{ formatText(detailRecord.templateId) }}</el-descriptions-item>
        <el-descriptions-item label="客户 ID">{{ formatText(detailRecord.customerId) }}</el-descriptions-item>
        <el-descriptions-item label="License">{{ formatText(detailRecord.licenseId) }}</el-descriptions-item>
        <el-descriptions-item label="开放状态">{{ formatScopeStatus(detailRecord.scopeStatus) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorTemplateScope" lang="ts">
import { listTemplateScope } from '@/api/vendor/templateScope';
import type { TemplateScopeQuery, TemplateScopeVO } from '@/api/vendor/templateScope/types';
import { formatDateTime, formatScopeStatus, formatText, readRows, readTotal, scopeStatusTagType } from '../shared';

const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const scopeList = ref<TemplateScopeVO[]>([]);
const detailRecord = ref<TemplateScopeVO>();
const detailDrawer = reactive({
  visible: false
});

const queryParams = reactive<TemplateScopeQuery>({
  pageNum: 1,
  pageSize: 10,
  templateId: undefined,
  customerId: undefined,
  licenseId: undefined,
  scopeStatus: undefined,
  params: {}
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listTemplateScope(queryParams);
    scopeList.value = readRows<TemplateScopeVO>(res);
    total.value = readTotal(res, scopeList.value);
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
  queryParams.templateId = undefined;
  queryParams.customerId = undefined;
  queryParams.licenseId = undefined;
  queryParams.scopeStatus = undefined;
  await refreshList();
};

const openDetail = (row: TemplateScopeVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

onMounted(() => {
  void refreshList();
});
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
