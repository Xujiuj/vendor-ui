<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>续费订单</h1>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>订单号</label>
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>客户</label>
          <el-select v-model="queryParams.customerId" placeholder="请选择客户" clearable filterable>
            <el-option v-for="item in customerOptions" :key="item.id" :label="customerLabel(item)" :value="item.id" />
          </el-select>
        </div>
        <div class="search-item">
          <label>License</label>
          <el-input v-model="queryParams.licenseId" placeholder="请输入原 License" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>订单状态</label>
          <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已授权" value="authorized" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>
        <div class="search-item">
          <label>签发状态</label>
          <el-select v-model="queryParams.issueStatus" placeholder="请选择签发状态" clearable>
            <el-option label="待签发" value="pending_issue" />
            <el-option label="签发中" value="issuing" />
            <el-option label="已签发" value="issued" />
            <el-option label="签发失败" value="issue_failed" />
          </el-select>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button v-hasPermi="['vendor:renewalOrder:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['vendor:renewalOrder:callback']" type="primary" plain icon="Finished" @click="openCallbackDrawer()">
            登记回调
          </el-button>
          <el-button v-hasPermi="['vendor:renewalOrder:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
          <el-button icon="Refresh" @click="refreshList">刷新</el-button>
        </div>
        <span v-if="ids.length > 0" class="select-count">已选 {{ ids.length }} 项</span>
      </div>

      <el-table v-loading="loading" :data="orderList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="订单号" align="center" prop="orderNo" min-width="160" :show-overflow-tooltip="true" />
        <el-table-column label="客户" align="center" prop="customerId" min-width="180" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatCustomer(row.customerId) }}
          </template>
        </el-table-column>
        <el-table-column label="原 License" align="center" prop="licenseId" min-width="170" :show-overflow-tooltip="true" />
        <el-table-column label="订单状态" align="center" prop="orderStatus" width="110">
          <template #default="{ row }">
            <el-tag :type="orderStatusTagType(row.orderStatus)">{{ formatOrderStatus(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回调状态" align="center" prop="orderStatus" width="110">
          <template #default="{ row }">
            <el-tag :type="callbackStatusTagType(row.orderStatus)">{{ formatCallbackStatus(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签发状态" align="center" prop="issueStatus" width="120">
          <template #default="{ row }">
            <el-tag :type="issueStatusTagType(row.issueStatus)">{{ formatIssueStatus(row.issueStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付渠道" align="center" prop="payChannel" width="120" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatPayChannel(row.payChannel) }}
          </template>
        </el-table-column>
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
        <el-table-column label="操作" align="center" width="360" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button
              v-if="canRetryIssue(row)"
              v-hasPermi="['vendor:renewalOrder:retryIssue']"
              link
              type="primary"
              icon="RefreshRight"
              @click="handleRetryIssue(row)"
            >
              重试签发
            </el-button>
            <el-button v-hasPermi="['vendor:renewalOrder:callback']" link type="primary" icon="Finished" @click="openCallbackDrawer(row)">
              回调
            </el-button>
            <el-button
              v-if="canBindManualIssue(row)"
              v-hasPermi="['vendor:renewalOrder:callback']"
              link
              type="primary"
              icon="Connection"
              @click="openManualBindDrawer(row)"
            >
              人工绑定
            </el-button>
            <el-button v-hasPermi="['vendor:renewalOrder:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
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

    <el-drawer v-model="formDrawer.visible" :title="formDrawer.title" size="640px" append-to-body :close-on-click-modal="true">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" maxlength="128" />
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" class="w-full" filterable>
            <el-option v-for="item in customerOptions" :key="item.id" :label="customerLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="原 License" prop="licenseId">
          <el-input v-model="form.licenseId" placeholder="请输入原 License" maxlength="128" />
        </el-form-item>
        <el-form-item label="安装标识" prop="installId">
          <el-input v-model="form.installId" placeholder="请输入安装标识" maxlength="128" />
        </el-form-item>
        <el-form-item label="续费版本" prop="requestedEdition">
          <el-select v-model="form.requestedEdition" placeholder="请选择续费版本" class="w-full" clearable filterable>
            <el-option v-for="option in editionOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="续费周期" prop="renewalPeriod">
          <el-select v-model="form.renewalPeriod" placeholder="请选择续费周期" class="w-full" clearable>
            <el-option v-for="option in renewalPeriodOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人" maxlength="64" />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" maxlength="128" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" maxlength="64" />
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-select v-model="form.orderStatus" placeholder="请选择订单状态" class="w-full">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已授权" value="authorized" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付渠道" prop="payChannel">
          <el-select v-model="form.payChannel" placeholder="请选择支付渠道" class="w-full" clearable>
            <el-option v-for="option in payChannelOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="amountValue" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="支付时间" prop="paidTime">
          <el-date-picker v-model="form.paidTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择支付时间" class="w-full" />
        </el-form-item>
        <el-form-item label="续签 License" prop="issuedLicenseId">
          <el-input v-model="form.issuedLicenseId" placeholder="请输入续签 License" maxlength="128" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="callbackDrawer.visible" title="登记支付回调" size="560px" append-to-body :close-on-click-modal="true">
      <el-form ref="callbackFormRef" :model="callbackForm" :rules="callbackRules" label-width="120px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="callbackForm.orderNo" placeholder="请输入订单号" maxlength="128" />
        </el-form-item>
        <el-form-item label="回调状态" prop="orderStatus">
          <el-select v-model="callbackForm.orderStatus" placeholder="请选择回调状态" class="w-full">
            <el-option label="已支付" value="paid" />
            <el-option label="已授权" value="authorized" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付渠道" prop="payChannel">
          <el-select v-model="callbackForm.payChannel" placeholder="请选择支付渠道" class="w-full" clearable>
            <el-option v-for="option in payChannelOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付时间" prop="paidTime">
          <el-date-picker
            v-model="callbackForm.paidTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择支付时间"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="签发 License" prop="issuedLicenseId">
          <el-input v-model="callbackForm.issuedLicenseId" placeholder="请输入签发 License" maxlength="128" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="callbackDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="callbackLoading" @click="submitCallback">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="manualBindDrawer.visible" title="人工绑定 License" size="480px" append-to-body :close-on-click-modal="true">
      <el-form ref="manualBindFormRef" :model="manualBindForm" :rules="manualBindRules" label-width="120px">
        <el-form-item label="订单号">
          <el-input :model-value="manualBindForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="签发 License" prop="issuedLicenseId">
          <el-input v-model="manualBindForm.issuedLicenseId" placeholder="请输入已签发 License" maxlength="128" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="manualBindDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="manualBindLoading" @click="submitManualBind">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="detailDrawer.visible" title="续费订单详情" size="560px" append-to-body :close-on-click-modal="true">
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="订单号">{{ formatText(detailRecord.orderNo) }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ formatCustomer(detailRecord.customerId) }}</el-descriptions-item>
        <el-descriptions-item label="原 License">{{ formatText(detailRecord.licenseId) }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ formatOrderStatus(detailRecord.orderStatus) }}</el-descriptions-item>
        <el-descriptions-item label="回调状态">{{ formatCallbackStatus(detailRecord.orderStatus) }}</el-descriptions-item>
        <el-descriptions-item label="签发状态">{{ formatIssueStatus(detailRecord.issueStatus) }}</el-descriptions-item>
        <el-descriptions-item label="支付渠道">{{ formatPayChannel(detailRecord.payChannel) }}</el-descriptions-item>
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
import type { FormInstance, FormRules } from 'element-plus';
import {
  addRenewalOrder,
  applyRenewalCallback,
  bindManualRenewalIssue,
  deleteRenewalOrder,
  getRenewalOrder,
  listRenewalOrder,
  retryRenewalIssue,
  updateRenewalOrder
} from '@/api/vendor/renewalOrder';
import type { ManualRenewalBindForm, RenewalCallbackForm, RenewalOrderForm, RenewalOrderQuery, RenewalOrderVO } from '@/api/vendor/renewalOrder/types';
import { listCustomer } from '@/api/vendor/customer';
import type { CustomerVO } from '@/api/vendor/customer/types';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';
import { useAutoQuery } from '@/hooks/useAutoQuery';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const submitLoading = ref(false);
const callbackLoading = ref(false);
const manualBindLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const orderList = ref<RenewalOrderVO[]>([]);
const customerOptions = ref<CustomerVO[]>([]);
const detailRecord = ref<RenewalOrderVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const formRef = ref<FormInstance>();
const callbackFormRef = ref<FormInstance>();
const manualBindFormRef = ref<FormInstance>();
const formDrawer = reactive({ visible: false, title: '' });
const callbackDrawer = reactive({ visible: false });
const manualBindDrawer = reactive({ visible: false });
const detailDrawer = reactive({ visible: false });
const amountValue = ref<number>(0);

const editionOptions = [
  { label: '基础版', value: 'BASIC' },
  { label: '专业版', value: 'PRO' },
  { label: '集团版', value: 'GROUP' },
  { label: '旗舰版', value: 'ENTERPRISE' }
];

const renewalPeriodOptions = [
  { label: '1 个月', value: '1m' },
  { label: '3 个月', value: '3m' },
  { label: '6 个月', value: '6m' },
  { label: '1 年', value: '1y' },
  { label: '2 年', value: '2y' },
  { label: '3 年', value: '3y' }
];

const payChannelOptions = [
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wechat' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '线下收款', value: 'offline' }
];

const queryParams = reactive<RenewalOrderQuery>({
  pageNum: 1,
  pageSize: 10,
  orderNo: undefined,
  customerId: undefined,
  licenseId: undefined,
  orderStatus: undefined,
  issueStatus: undefined,
  params: {}
});

const form = reactive<RenewalOrderForm>({
  id: undefined,
  orderNo: undefined,
  customerId: undefined,
  licenseId: undefined,
  installId: undefined,
  requestedEdition: undefined,
  renewalPeriod: undefined,
  contactName: undefined,
  contactEmail: undefined,
  contactPhone: undefined,
  orderStatus: 'pending',
  payChannel: undefined,
  amount: 0,
  paidTime: undefined,
  issuedLicenseId: undefined
});

const callbackForm = reactive<RenewalCallbackForm>({
  id: undefined,
  orderNo: undefined,
  orderStatus: 'paid',
  payChannel: undefined,
  paidTime: undefined,
  issuedLicenseId: undefined
});

const manualBindForm = reactive<ManualRenewalBindForm>({
  id: '',
  orderNo: undefined,
  orderStatus: '',
  issuedLicenseId: ''
});

const rules: FormRules<RenewalOrderForm> = {
  orderNo: [{ required: true, message: '订单号不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
  amount: [{ required: true, message: '金额不能为空', trigger: 'change' }]
};

const callbackRules: FormRules<RenewalCallbackForm> = {
  orderNo: [{ required: true, message: '订单号不能为空', trigger: 'blur' }],
  orderStatus: [{ required: true, message: '回调状态不能为空', trigger: 'change' }]
};

const manualBindRules: FormRules<ManualRenewalBindForm> = {
  issuedLicenseId: [{ required: true, message: '签发 License 不能为空', trigger: 'blur' }]
};

const customerLabel = (item: CustomerVO) => `${item.customerName || item.customerCode || item.id}`;

const customerMap = computed(() =>
  customerOptions.value.reduce<Record<string, string>>((map, item) => {
    map[String(item.id)] = customerLabel(item);
    return map;
  }, {})
);

const formatCustomer = (customerId?: string | number) => {
  if (customerId === undefined || customerId === null || customerId === '') {
    return '-';
  }
  return customerMap.value[String(customerId)] || String(customerId);
};

const formatPayChannel = (payChannel?: string) => {
  if (!payChannel) {
    return '-';
  }
  return payChannelOptions.find((option) => option.value === payChannel)?.label || payChannel;
};

const loadOptions = async () => {
  const customerRes = await listCustomer({ pageNum: 1, pageSize: 100, params: {} });
  customerOptions.value = readRows<CustomerVO>(customerRes);
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listRenewalOrder(queryParams);
    orderList.value = readRows<RenewalOrderVO>(res);
    total.value = readTotal(res, orderList.value);
    syncDetailRecord();
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
  queryParams.issueStatus = undefined;
  await refreshList();
};

const resetForm = () => {
  form.id = undefined;
  form.orderNo = undefined;
  form.customerId = undefined;
  form.licenseId = undefined;
  form.installId = undefined;
  form.requestedEdition = undefined;
  form.renewalPeriod = undefined;
  form.contactName = undefined;
  form.contactEmail = undefined;
  form.contactPhone = undefined;
  form.orderStatus = 'pending';
  form.payChannel = undefined;
  form.amount = 0;
  amountValue.value = 0;
  form.paidTime = undefined;
  form.issuedLicenseId = undefined;
  formRef.value?.clearValidate();
};

const resetCallbackForm = () => {
  callbackForm.id = undefined;
  callbackForm.orderNo = undefined;
  callbackForm.orderStatus = 'paid';
  callbackForm.payChannel = undefined;
  callbackForm.paidTime = undefined;
  callbackForm.issuedLicenseId = undefined;
  callbackFormRef.value?.clearValidate();
};

const resetManualBindForm = () => {
  manualBindForm.id = '';
  manualBindForm.orderNo = undefined;
  manualBindForm.orderStatus = '';
  manualBindForm.issuedLicenseId = '';
  manualBindFormRef.value?.clearValidate();
};

const handleSelectionChange = (selection: RenewalOrderVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增续费订单';
  formDrawer.visible = true;
};

const handleUpdate = async (row: RenewalOrderVO) => {
  resetForm();
  const res = await getRenewalOrder(row.id);
  const data = res.data ?? row;
  Object.assign(form, {
    ...data,
    orderStatus: normalizeOrderStatus(data.orderStatus)
  });
  amountValue.value = Number(data.amount ?? 0);
  formDrawer.title = '编辑续费订单';
  formDrawer.visible = true;
};

const submitForm = async () => {
  form.amount = amountValue.value;
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    const payload: RenewalOrderForm = {
      ...form,
      amount: amountValue.value,
      licenseId: form.licenseId?.trim() || undefined,
      installId: form.installId?.trim() || undefined,
      requestedEdition: form.requestedEdition?.trim() || undefined,
      renewalPeriod: form.renewalPeriod?.trim() || undefined,
      contactName: form.contactName?.trim() || undefined,
      contactEmail: form.contactEmail?.trim() || undefined,
      contactPhone: form.contactPhone?.trim() || undefined,
      payChannel: form.payChannel?.trim() || undefined,
      issuedLicenseId: form.issuedLicenseId?.trim() || undefined
    };
    if (payload.id) {
      await updateRenewalOrder(payload);
      proxy?.$modal.msgSuccess('续费订单已更新');
    } else {
      await addRenewalOrder(payload);
      proxy?.$modal.msgSuccess('续费订单已新增');
    }
    formDrawer.visible = false;
    await getList();
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: RenewalOrderVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const syncDetailRecord = () => {
  if (!detailRecord.value) {
    return;
  }
  const latest = orderList.value.find((item) => item.id === detailRecord.value?.id);
  if (latest) {
    detailRecord.value = latest;
  } else {
    detailDrawer.visible = false;
    detailRecord.value = undefined;
  }
};

const isManualIssuePath = (row: RenewalOrderVO) => {
  return row.payChannel === 'manual' || row.requestSource === 'open-api';
};

const canBindManualIssue = (row: RenewalOrderVO) => {
  return row.issueStatus === 'pending_issue' && isManualIssuePath(row);
};

const canRetryIssue = (row: RenewalOrderVO) => {
  return row.issueStatus === 'issue_failed' && normalizeOrderStatus(row.orderStatus) === 'authorized' && !isManualIssuePath(row);
};

const openCallbackDrawer = (row?: RenewalOrderVO) => {
  resetCallbackForm();
  if (row) {
    callbackForm.id = row.id;
    callbackForm.orderNo = row.orderNo;
    callbackForm.orderStatus = normalizeCallbackOrderStatus(row.orderStatus);
    callbackForm.payChannel = row.payChannel;
    callbackForm.paidTime = row.paidTime;
    callbackForm.issuedLicenseId = row.issuedLicenseId;
  }
  callbackDrawer.visible = true;
};

const openManualBindDrawer = (row: RenewalOrderVO) => {
  resetManualBindForm();
  const orderStatus = normalizeManualBindOrderStatus(row.orderStatus);
  if (!orderStatus) {
    proxy?.$modal.msgWarning('请先登记真实支付或授权回调状态后再绑定 License');
    return;
  }
  manualBindForm.id = row.id;
  manualBindForm.orderNo = row.orderNo;
  manualBindForm.orderStatus = orderStatus;
  manualBindForm.issuedLicenseId = row.issuedLicenseId || '';
  manualBindDrawer.visible = true;
};

const submitCallback = async () => {
  const valid = await callbackFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  callbackLoading.value = true;
  try {
    await applyRenewalCallback({
      id: callbackForm.id,
      orderNo: callbackForm.orderNo?.trim(),
      orderStatus: callbackForm.orderStatus,
      payChannel: callbackForm.payChannel?.trim() || undefined,
      paidTime: callbackForm.paidTime,
      issuedLicenseId: callbackForm.issuedLicenseId?.trim() || undefined
    });
    proxy?.$modal.msgSuccess('支付回调已登记');
    callbackDrawer.visible = false;
    await getList();
  } finally {
    callbackLoading.value = false;
  }
};

const submitManualBind = async () => {
  const valid = await manualBindFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  if (!manualBindForm.orderStatus) {
    proxy?.$modal.msgWarning('请先登记真实支付或授权回调状态后再绑定 License');
    return;
  }
  manualBindLoading.value = true;
  try {
    await bindManualRenewalIssue({
      id: manualBindForm.id,
      orderNo: manualBindForm.orderNo?.trim(),
      orderStatus: manualBindForm.orderStatus,
      issuedLicenseId: manualBindForm.issuedLicenseId.trim()
    });
    proxy?.$modal.msgSuccess('人工绑定已提交');
    manualBindDrawer.visible = false;
    await getList();
  } finally {
    manualBindLoading.value = false;
  }
};

const handleRetryIssue = async (row: RenewalOrderVO) => {
  try {
    await proxy?.$modal.confirm(`确认重试签发订单“${row.orderNo}”？`);
    await retryRenewalIssue(row.id);
    proxy?.$modal.msgSuccess('已提交重试签发');
    await getList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
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

const normalizeCallbackOrderStatus = (status?: string) => {
  const value = status?.toLowerCase();
  if (value === 'paid' || value === 'authorized') {
    return value;
  }
  return 'paid';
};

const normalizeManualBindOrderStatus = (status?: string) => {
  const value = normalizeOrderStatus(status);
  if (value === 'paid' || value === 'authorized') {
    return value;
  }
  return undefined;
};

const normalizeOrderStatus = (status?: string) => {
  const value = status?.toLowerCase();
  if (value === 'pending' || value === 'paid' || value === 'authorized' || value === 'cancelled' || value === 'closed') {
    return value;
  }
  if (value === 'issued') {
    return 'authorized';
  }
  return 'pending';
};

const formatOrderStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    authorized: '已授权',
    cancelled: '已取消',
    closed: '已关闭',
    PENDING: '待支付',
    PAID: '已支付',
    ISSUED: '已授权',
    CANCELLED: '已取消',
    CLOSED: '已关闭'
  };
  return status ? statusMap[status] || status : '-';
};

const orderStatusTagType = (status?: string): 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    paid: 'success',
    authorized: 'success',
    cancelled: 'info',
    closed: 'info',
    PENDING: 'warning',
    PAID: 'success',
    ISSUED: 'success',
    CANCELLED: 'info',
    CLOSED: 'info'
  };
  return status ? statusMap[status] || 'info' : 'info';
};

const formatCallbackStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    pending: '待回调',
    paid: '回调成功',
    authorized: '已授权',
    cancelled: '无需回调',
    closed: '无需回调',
    PENDING: '待回调',
    PAID: '回调成功',
    ISSUED: '回调成功',
    CANCELLED: '无需回调',
    CLOSED: '无需回调'
  };
  return status ? statusMap[status] || status : '-';
};

const callbackStatusTagType = (status?: string): 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    paid: 'success',
    authorized: 'success',
    cancelled: 'info',
    closed: 'info',
    PENDING: 'warning',
    PAID: 'success',
    ISSUED: 'success',
    CANCELLED: 'info',
    CLOSED: 'info'
  };
  return status ? statusMap[status] || 'info' : 'info';
};

const formatIssueStatus = (status?: string) => {
  const statusMap: Record<string, string> = {
    pending_issue: '待签发',
    issuing: '签发中',
    issued: '已签发',
    issue_failed: '签发失败',
    PENDING_ISSUE: '待签发',
    ISSUING: '签发中',
    ISSUED: '已签发',
    ISSUE_FAILED: '签发失败'
  };
  return status ? statusMap[status] || status : '-';
};

const issueStatusTagType = (status?: string): 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    pending_issue: 'info',
    issuing: 'warning',
    issued: 'success',
    issue_failed: 'danger',
    PENDING_ISSUE: 'info',
    ISSUING: 'warning',
    ISSUED: 'success',
    ISSUE_FAILED: 'danger'
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

onMounted(async () => {
  await loadOptions();
  await refreshList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.w-full {
  width: 100%;
}
</style>
