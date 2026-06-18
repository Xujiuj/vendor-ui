<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>模板开放范围</h1>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>报表模板</label>
          <el-select v-model="queryParams.templateId" placeholder="请选择报表模板" clearable filterable>
            <el-option v-for="item in templateOptions" :key="item.id" :label="templateLabel(item)" :value="item.id" />
          </el-select>
        </div>
        <div class="search-item">
          <label>客户</label>
          <el-select v-model="queryParams.customerId" placeholder="请选择客户" clearable filterable>
            <el-option v-for="item in customerOptions" :key="item.id" :label="customerLabel(item)" :value="item.id" />
          </el-select>
        </div>
        <div class="search-item">
          <label>套餐</label>
          <el-select v-model="queryParams.packageId" placeholder="请选择套餐" clearable filterable>
            <el-option v-for="item in packageOptions" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
          </el-select>
        </div>
        <div class="search-item">
          <label>License</label>
          <el-input v-model="queryParams.licenseId" placeholder="请输入 License" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-select v-model="queryParams.scopeStatus" placeholder="请选择状态" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button v-hasPermi="['vendor:reportTemplateScope:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
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
          <el-button icon="Refresh" @click="refreshList">刷新</el-button>
        </div>
        <span v-if="ids.length > 0" class="select-count">已选 {{ ids.length }} 项</span>
      </div>

      <el-table v-loading="loading" :data="scopeList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="报表模板" align="center" prop="templateId" min-width="180" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatTemplate(row.templateId) }}
          </template>
        </el-table-column>
        <el-table-column label="客户" align="center" prop="customerId" min-width="180" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatCustomer(row.customerId) }}
          </template>
        </el-table-column>
        <el-table-column label="开放套餐" align="center" min-width="140" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatScopePackage(row) }}
          </template>
        </el-table-column>
        <el-table-column label="License" align="center" prop="licenseId" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="开放状态" align="center" prop="scopeStatus" width="110">
          <template #default="{ row }">
            <el-tag :type="scopeStatusTagType(row.scopeStatus)">{{ formatScopeStatus(row.scopeStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="210" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-hasPermi="['vendor:reportTemplateScope:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
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

    <el-drawer v-model="formDrawer.visible" :title="formDrawer.title" size="560px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="报表模板" prop="templateId">
          <el-select v-model="form.templateId" placeholder="请选择报表模板" class="w-full" filterable>
            <el-option v-for="item in templateOptions" :key="item.id" :label="templateLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="全部客户" class="w-full" clearable filterable>
            <el-option v-for="item in customerOptions" :key="item.id" :label="customerLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开放套餐" prop="packageId">
          <el-select v-model="form.packageId" placeholder="全部套餐" class="w-full" clearable filterable>
            <el-option v-for="item in packageOptions" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
          </el-select>
        </el-form-item>
        <el-form-item label="License" prop="licenseId">
          <el-input v-model="form.licenseId" placeholder="留空表示不限定单个 License" maxlength="128" />
        </el-form-item>
        <el-form-item label="状态" prop="scopeStatus">
          <el-radio-group v-model="form.scopeStatus">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="detailDrawer.visible" title="模板开放范围详情" size="520px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="报表模板">{{ formatTemplate(detailRecord.templateId) }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ formatCustomer(detailRecord.customerId) }}</el-descriptions-item>
        <el-descriptions-item label="开放套餐">{{ formatScopePackage(detailRecord) }}</el-descriptions-item>
        <el-descriptions-item label="License">{{ formatText(detailRecord.licenseId) }}</el-descriptions-item>
        <el-descriptions-item label="开放状态">{{ formatScopeStatus(detailRecord.scopeStatus) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorTemplateScope" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { addTemplateScope, deleteTemplateScope, getTemplateScope, listTemplateScope, updateTemplateScope } from '@/api/vendor/templateScope';
import type { TemplateScopeForm, TemplateScopeQuery, TemplateScopeVO } from '@/api/vendor/templateScope/types';
import { listReportTemplate } from '@/api/vendor/reportTemplate';
import type { ReportTemplateVO } from '@/api/vendor/reportTemplate/types';
import { listCustomer } from '@/api/vendor/customer';
import type { CustomerVO } from '@/api/vendor/customer/types';
import { selectTenantPackage } from '@/api/system/tenantPackage';
import type { TenantPkgVO } from '@/api/system/tenantPackage/types';
import { formatDateTime, formatScopeStatus, formatText, readRows, readTotal, scopeStatusTagType } from '../shared';
import { useAutoQuery } from '@/hooks/useAutoQuery';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const scopeList = ref<TemplateScopeVO[]>([]);
const templateOptions = ref<ReportTemplateVO[]>([]);
const customerOptions = ref<CustomerVO[]>([]);
const packageOptions = ref<TenantPkgVO[]>([]);
const detailRecord = ref<TemplateScopeVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const formRef = ref<FormInstance>();
const formDrawer = reactive({ visible: false, title: '' });
const detailDrawer = reactive({ visible: false });

const queryParams = reactive<TemplateScopeQuery>({
  pageNum: 1,
  pageSize: 10,
  templateId: undefined,
  customerId: undefined,
  packageId: undefined,
  edition: undefined,
  licenseId: undefined,
  scopeStatus: undefined,
  params: {}
});

const form = reactive<TemplateScopeForm>({
  id: undefined,
  templateId: undefined,
  customerId: undefined,
  packageId: undefined,
  edition: undefined,
  licenseId: undefined,
  scopeStatus: 'enabled'
});

const rules: FormRules<TemplateScopeForm> = {
  templateId: [{ required: true, message: '报表模板不能为空', trigger: 'change' }],
  scopeStatus: [{ required: true, message: '状态不能为空', trigger: 'change' }]
};

const templateLabel = (item: ReportTemplateVO) => `${item.templateName || item.templateCode || item.id}`;
const customerLabel = (item: CustomerVO) => `${item.customerName || item.customerCode || item.id}`;

const templateMap = computed(() =>
  templateOptions.value.reduce<Record<string, string>>((map, item) => {
    map[String(item.id)] = templateLabel(item);
    return map;
  }, {})
);

const customerMap = computed(() =>
  customerOptions.value.reduce<Record<string, string>>((map, item) => {
    map[String(item.id)] = customerLabel(item);
    return map;
  }, {})
);

const formatTemplate = (templateId?: string | number) => {
  if (templateId === undefined || templateId === null || templateId === '') {
    return '-';
  }
  return templateMap.value[String(templateId)] || String(templateId);
};

const formatCustomer = (customerId?: string | number) => {
  if (customerId === undefined || customerId === null || customerId === '') {
    return '全部客户';
  }
  return customerMap.value[String(customerId)] || String(customerId);
};

const formatScopePackage = (row?: Pick<TemplateScopeVO, 'packageId' | 'packageName' | 'edition'>) => {
  if (!row) return '-';
  if (row.packageName) return row.packageName;
  if (row.packageId !== undefined && row.packageId !== null && row.packageId !== '') {
    return packageOptions.value.find((item) => item.packageId === row.packageId)?.packageName || String(row.packageId);
  }
  return row.edition || '全部套餐';
};

const loadOptions = async () => {
  const [templateRes, customerRes, packageRes] = await Promise.all([
    listReportTemplate({ pageNum: 1, pageSize: 100, params: {} }),
    listCustomer({ pageNum: 1, pageSize: 100, params: {} }),
    selectTenantPackage()
  ]);
  templateOptions.value = readRows<ReportTemplateVO>(templateRes);
  customerOptions.value = readRows<CustomerVO>(customerRes);
  packageOptions.value = readRows<TenantPkgVO>(packageRes).filter((item) => item.status !== '1');
};

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
  queryParams.packageId = undefined;
  queryParams.edition = undefined;
  queryParams.licenseId = undefined;
  queryParams.scopeStatus = undefined;
  await refreshList();
};

const resetForm = () => {
  form.id = undefined;
  form.templateId = undefined;
  form.customerId = undefined;
  form.packageId = undefined;
  form.edition = undefined;
  form.licenseId = undefined;
  form.scopeStatus = 'enabled';
  formRef.value?.clearValidate();
};

const handleSelectionChange = (selection: TemplateScopeVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增模板开放范围';
  formDrawer.visible = true;
};

const handleUpdate = async (row: TemplateScopeVO) => {
  resetForm();
  const res = await getTemplateScope(row.id);
  const data = res.data ?? row;
  Object.assign(form, {
    id: data.id,
    templateId: data.templateId,
    customerId: data.customerId,
    packageId: data.packageId,
    edition: data.edition,
    licenseId: data.licenseId,
    scopeStatus: data.scopeStatus || 'enabled'
  });
  formDrawer.title = '编辑模板开放范围';
  formDrawer.visible = true;
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    const payload: TemplateScopeForm = {
      id: form.id,
      templateId: form.templateId,
      customerId: form.customerId,
      packageId: form.packageId,
      edition: undefined,
      licenseId: form.licenseId?.trim() || undefined,
      scopeStatus: form.scopeStatus
    };
    if (payload.id) {
      await updateTemplateScope(payload);
      proxy?.$modal.msgSuccess('模板开放范围已更新');
    } else {
      await addTemplateScope(payload);
      proxy?.$modal.msgSuccess('模板开放范围已新增');
    }
    formDrawer.visible = false;
    await getList();
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: TemplateScopeVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: TemplateScopeVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除模板开放范围“${formatTemplate(row.templateId)}”？` : `确认删除选中的 ${ids.value.length} 条模板开放范围？`;
    await proxy?.$modal.confirm(message);
    await deleteTemplateScope(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
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
