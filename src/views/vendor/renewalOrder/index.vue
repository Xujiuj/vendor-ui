<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>续费订单</h1>
        <p>查看厂商云端 License 续费订单、支付渠道和续签 License 结果。</p>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>订单号</label>
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>License</label>
          <el-input v-model="queryParams.licenseId" placeholder="请输入原 License" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>订单状态</label>
          <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
            <el-option label="待支付" value="PENDING" />
            <el-option label="已支付" value="PAID" />
            <el-option label="已签发" value="ISSUED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <el-button v-hasPermi="['vendor:renewalOrder:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
          删除
        </el-button>
        <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
        <el-button icon="Refresh" @click="refreshList">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="orderList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="订单号" align="center" prop="orderNo" min-width="160" :show-overflow-tooltip="true" />
        <el-table-column label="原 License" align="center" prop="licenseId" min-width="170" :show-overflow-tooltip="true" />
        <el-table-column label="订单状态" align="center" prop="orderStatus" width="120">
          <template #default="{ row }">
            <el-tag :type="orderStatusTagType(row.orderStatus)">{{ formatOrderStatus(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付渠道" align="center" prop="payChannel" width="120" :show-overflow-tooltip="true" />
        <el-table-column label="金额" align="center" prop="amount" width="120">
          <template #default="{ row }">
            {{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column label="支付时间" align="center" prop="paidTime" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.paidTime) }}
          </template>
        </el-table-column>
        <el-table-column label="续签 License" align="center" prop="issuedLicenseId" min-width="170" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-hasPermi="['vendor:renewalOrder:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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

    <el-drawer v-model="detailDrawer.visible" title="续费订单详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="订单号">{{ formatText(detailRecord.orderNo) }}</el-descriptions-item>
        <el-descriptions-item label="原 License">{{ formatText(detailRecord.licenseId) }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ formatOrderStatus(detailRecord.orderStatus) }}</el-descriptions-item>
        <el-descriptions-item label="支付渠道">{{ formatText(detailRecord.payChannel) }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ formatAmount(detailRecord.amount) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ formatDateTime(detailRecord.paidTime) }}</el-descriptions-item>
        <el-descriptions-item label="续签 License">{{ formatText(detailRecord.issuedLicenseId) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detailRecord.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorRenewalOrder" lang="ts">
import { deleteRenewalOrder, listRenewalOrder } from '@/api/vendor/renewalOrder';
import type { RenewalOrderQuery, RenewalOrderVO } from '@/api/vendor/renewalOrder/types';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

import { useAutoQuery } from '@/hooks/useAutoQuery';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const orderList = ref<RenewalOrderVO[]>([]);
const detailRecord = ref<RenewalOrderVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const detailDrawer = reactive({
  visible: false
});

const queryParams = reactive<RenewalOrderQuery>({
  pageNum: 1,
  pageSize: 10,
  orderNo: undefined,
  customerId: undefined,
  licenseId: undefined,
  orderStatus: undefined,
  params: {}
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listRenewalOrder(queryParams);
    orderList.value = readRows<RenewalOrderVO>(res);
    total.value = readTotal(res, orderList.value);
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
  queryParams.orderNo = undefined;
  queryParams.customerId = undefined;
  queryParams.licenseId = undefined;
  queryParams.orderStatus = undefined;
  await refreshList();
};

const handleSelectionChange = (selection: RenewalOrderVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const openDetail = (row: RenewalOrderVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: RenewalOrderVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除订单“${row.orderNo}”？` : `确认删除选中的 ${ids.value.length} 个订单？`;
    await proxy?.$modal.confirm(message);
    await deleteRenewalOrder(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
};

const formatOrderStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    ISSUED: '已签发',
    CANCELLED: '已取消',
    CLOSED: '已关闭'
  };
  return status ? statusMap[status] || status : '-';
};

const orderStatusTagType = (status?: string): 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    PENDING: 'warning',
    PAID: 'success',
    ISSUED: 'success',
    CANCELLED: 'info',
    CLOSED: 'info'
  };
  return status ? statusMap[status] || 'info' : 'info';
};

const formatAmount = (amount?: number | string) => {
  if (amount === undefined || amount === null || amount === '') {
    return '-';
  }
  const value = Number(amount);
  return Number.isFinite(value) ? value.toFixed(2) : String(amount);
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
