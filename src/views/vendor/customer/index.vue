<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>客户档案</h1>
        <p>维护厂商端企业客户基础信息，用于授权签发、模板分发和开放范围配置。</p>
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
          </el-select>
        </div>
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="refreshList" />
        </div>
      </div>
      <div v-show="!showSearch" class="search-bar search-bar-collapsed">
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="refreshList" />
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button v-hasPermi="['vendor:customer:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['vendor:customer:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
        </div>
        <span v-if="ids.length > 0" class="select-count">已选 {{ ids.length }} 项</span>
      </div>

      <el-table v-loading="loading" :data="customerList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
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
        <el-table-column label="操作" align="center" width="190" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
              <el-button v-hasPermi="['vendor:customer:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
              <el-button v-hasPermi="['vendor:customer:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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

    <el-drawer v-model="formDrawer.visible" :title="formDrawer.title" size="560px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户编码" prop="customerCode">
          <el-input v-model="form.customerCode" placeholder="请输入客户编码" maxlength="64" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称" maxlength="255" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人" maxlength="128" />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" maxlength="255" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" maxlength="64" />
        </el-form-item>
        <el-form-item label="客户状态" prop="customerStatus">
          <el-select v-model="form.customerStatus" placeholder="请选择客户状态">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-drawer>

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
import { type FormInstance, type FormRules } from 'element-plus';
import { addCustomer, deleteCustomer, getCustomer, listCustomer, updateCustomer } from '@/api/vendor/customer';
import type { CustomerForm, CustomerQuery, CustomerVO } from '@/api/vendor/customer/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const customerList = ref<CustomerVO[]>([]);
const detailRecord = ref<CustomerVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const formRef = ref<FormInstance>();
const formDrawer = reactive({
  visible: false,
  title: ''
});
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

const form = reactive<CustomerForm>({
  id: undefined,
  customerCode: '',
  customerName: '',
  contactName: undefined,
  contactEmail: undefined,
  contactPhone: undefined,
  customerStatus: 'active',
  remark: undefined
});

const rules: FormRules<CustomerForm> = {
  customerCode: [{ required: true, message: '客户编码不能为空', trigger: 'blur' }],
  customerName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
  customerStatus: [{ required: true, message: '客户状态不能为空', trigger: 'change' }],
  contactEmail: [{ type: 'email', message: '联系邮箱格式不正确', trigger: 'blur' }]
};

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

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    customerCode: '',
    customerName: '',
    contactName: undefined,
    contactEmail: undefined,
    contactPhone: undefined,
    customerStatus: 'active',
    remark: undefined
  });
  formRef.value?.clearValidate();
};

const handleSelectionChange = (selection: CustomerVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增客户档案';
  formDrawer.visible = true;
};

const handleUpdate = async (row: CustomerVO) => {
  resetForm();
  try {
    const res = await getCustomer(row.id);
    const data = res.data ?? row;
    Object.assign(form, {
      id: data.id,
      customerCode: data.customerCode,
      customerName: data.customerName,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      customerStatus: data.customerStatus,
      remark: data.remark
    });
    formDrawer.title = '编辑客户档案';
    formDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  }
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    if (form.id) {
      await updateCustomer(form);
      proxy?.$modal.msgSuccess('客户档案已更新');
    } else {
      await addCustomer(form);
      proxy?.$modal.msgSuccess('客户档案已新增');
    }
    formDrawer.visible = false;
    await getList();
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = async (row?: CustomerVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    if (!row && multiple.value) {
      return;
    }
    const message = row ? `确认删除客户档案“${row.customerName}”？` : `确认删除选中的 ${ids.value.length} 个客户档案？`;
    await proxy?.$modal.confirm(message);
    await deleteCustomer(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.btns,
.table-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.select-count {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
