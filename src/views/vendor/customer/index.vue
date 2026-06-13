<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>客户档案</h1>
        <p>查看厂商侧客户基础档案、联系人和客户状态。</p>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>客户编码</label>
          <el-input v-model="queryParams.customerCode" placeholder="请输入客户编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>客户名称</label>
          <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>联系人</label>
          <el-input v-model="queryParams.contactName" placeholder="请输入联系人" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>客户状态</label>
          <el-select v-model="queryParams.customerStatus" placeholder="请选择客户状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
        <el-button icon="Refresh" @click="refreshList">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="customerList" border>
        <el-table-column label="客户编码" align="center" prop="customerCode" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="客户名称" align="center" prop="customerName" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="联系人" align="center" prop="contactName" width="140" :show-overflow-tooltip="true" />
        <el-table-column label="联系邮箱" align="center" prop="contactEmail" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="联系电话" align="center" prop="contactPhone" width="150" :show-overflow-tooltip="true" />
        <el-table-column label="客户状态" align="center" prop="customerStatus" width="110">
          <template #default="{ row }">
            <el-tag :type="customerStatusTagType(row.customerStatus)">{{ formatCustomerStatus(row.customerStatus) }}</el-tag>
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

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="refreshList"
      />
    </div>

    <el-drawer v-model="detailDrawer.visible" title="客户档案详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="客户编码">{{ formatText(detailRecord.customerCode) }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ formatText(detailRecord.customerName) }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ formatText(detailRecord.contactName) }}</el-descriptions-item>
        <el-descriptions-item label="联系邮箱">{{ formatText(detailRecord.contactEmail) }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ formatText(detailRecord.contactPhone) }}</el-descriptions-item>
        <el-descriptions-item label="客户状态">{{ formatCustomerStatus(detailRecord.customerStatus) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detailRecord.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatText(detailRecord.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorCustomer" lang="ts">
import { listCustomer } from '@/api/vendor/customer';
import type { CustomerQuery, CustomerVO } from '@/api/vendor/customer/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const customerList = ref<CustomerVO[]>([]);
const detailRecord = ref<CustomerVO>();
const detailDrawer = reactive({
  visible: false
});

const queryParams = reactive<CustomerQuery>({
  pageNum: 1,
  pageSize: 10,
  customerCode: undefined,
  customerName: undefined,
  contactName: undefined,
  customerStatus: undefined,
  params: {}
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listCustomer(queryParams);
    customerList.value = readRows<CustomerVO>(res);
    total.value = readTotal(res, customerList.value);
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
  queryParams.customerCode = undefined;
  queryParams.customerName = undefined;
  queryParams.contactName = undefined;
  queryParams.customerStatus = undefined;
  await refreshList();
};

const openDetail = (row: CustomerVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const formatCustomerStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    active: '启用',
    enabled: '启用',
    normal: '启用',
    disabled: '停用',
    inactive: '停用',
    stopped: '停用',
    suspended: '停用',
    '0': '启用',
    '1': '停用'
  };
  return status ? statusMap[status] || status : '-';
};

const customerStatusTagType = (status?: string): 'success' | 'warning' | 'info' | 'danger' => {
  const normalized = status?.toLowerCase();
  if (!normalized) {
    return 'info';
  }
  return ['disabled', 'inactive', 'stopped', 'suspended', '1'].includes(normalized) ? 'warning' : 'success';
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
  gap: 8px;
  margin-bottom: 12px;
}
</style>
