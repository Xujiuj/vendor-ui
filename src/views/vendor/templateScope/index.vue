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
          <label>License</label>
          <el-input v-model="queryParams.licenseId" placeholder="请输入 License" clearable @keyup.enter="handleQuery" />
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
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button
            v-hasPermi="['vendor:reportTemplateScope:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
          <el-button icon="Refresh" @click="refreshList">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="scopeList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
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
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-hasPermi="['vendor:reportTemplateScope:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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

    <el-drawer v-model="detailDrawer.visible" title="模板开放范围详情" size="520px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="License">{{ formatText(detailRecord.licenseId) }}</el-descriptions-item>
        <el-descriptions-item label="开放状态">{{ formatScopeStatus(detailRecord.scopeStatus) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorTemplateScope" lang="ts">
import { deleteTemplateScope, listTemplateScope } from '@/api/vendor/templateScope';
import type { TemplateScopeQuery, TemplateScopeVO } from '@/api/vendor/templateScope/types';
import { formatDateTime, formatScopeStatus, formatText, readRows, readTotal, scopeStatusTagType } from '../shared';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const scopeList = ref<TemplateScopeVO[]>([]);
const detailRecord = ref<TemplateScopeVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
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

const handleSelectionChange = (selection: TemplateScopeVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const openDetail = (row: TemplateScopeVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: TemplateScopeVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除 License“${formatText(row.licenseId)}”的模板分发范围？` : `确认删除选中的 ${ids.value.length} 条模板分发范围？`;
    await proxy?.$modal.confirm(message);
    await deleteTemplateScope(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
};

onMounted(() => {
  void refreshList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
