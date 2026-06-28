<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>因子开放范围</h1>
        <p>配置套餐可同步的因子版本范围。</p>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>因子版本</label>
          <el-select v-model="queryParams.versionId" placeholder="请选择因子版本" clearable filterable>
            <el-option v-for="item in factorVersionOptions" :key="item.id" :label="factorVersionLabel(item)" :value="item.id" />
          </el-select>
        </div>
        <div class="search-item">
          <label>套餐</label>
          <el-select v-model="queryParams.packageId" placeholder="请选择套餐" clearable filterable>
            <el-option v-for="item in packageOptions" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
          </el-select>
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-select v-model="queryParams.scopeStatus" placeholder="请选择状态" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
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
          <el-button v-hasPermi="['vendor:factorCustomerScope:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['vendor:factorCustomerScope:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
        <span v-if="ids.length > 0" class="select-count">已选 {{ ids.length }} 项</span>
      </div>

      <el-table v-loading="loading" :data="scopeList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="因子版本" align="center" prop="versionId" min-width="180" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatFactorVersion(row.versionId) }}
          </template>
        </el-table-column>
        <el-table-column label="开放套餐" align="center" min-width="140" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatScopePackage(row) }}
          </template>
        </el-table-column>
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
            <el-button v-hasPermi="['vendor:factorCustomerScope:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['vendor:factorCustomerScope:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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
        <el-form-item label="因子版本" prop="versionId">
          <el-select v-model="form.versionId" placeholder="请选择因子版本" class="w-full" filterable>
            <el-option v-for="item in factorVersionOptions" :key="item.id" :label="factorVersionLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开放套餐" prop="packageId">
          <el-select v-model="form.packageId" placeholder="请选择套餐" class="w-full" filterable>
            <el-option v-for="item in packageOptions" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
          </el-select>
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

    <el-drawer v-model="detailDrawer.visible" title="因子开放范围详情" size="520px" append-to-body>
        <el-descriptions v-if="detailRecord" :column="1" border>
          <el-descriptions-item label="因子版本">{{ formatFactorVersion(detailRecord.versionId) }}</el-descriptions-item>
        <el-descriptions-item label="开放套餐">{{ formatScopePackage(detailRecord) }}</el-descriptions-item>
        <el-descriptions-item label="开放状态">{{ formatScopeStatus(detailRecord.scopeStatus) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorFactorScope" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { addFactorScope, deleteFactorScope, getFactorScope, listFactorScope, updateFactorScope } from '@/api/vendor/factorScope';
import type { FactorScopeForm, FactorScopeQuery, FactorScopeVO } from '@/api/vendor/factorScope/types';
import { listFactorVersion } from '@/api/vendor/factorVersion';
import type { FactorVersionVO } from '@/api/vendor/factorVersion/types';
import { selectTenantPackage } from '@/api/system/tenantPackage';
import type { TenantPkgVO } from '@/api/system/tenantPackage/types';
import { formatDateTime, formatScopeStatus, readRows, readTotal, scopeStatusTagType } from '../shared';
import { useAutoQuery } from '@/hooks/useAutoQuery';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const scopeList = ref<FactorScopeVO[]>([]);
const factorVersionOptions = ref<FactorVersionVO[]>([]);
const packageOptions = ref<TenantPkgVO[]>([]);
const detailRecord = ref<FactorScopeVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const formRef = ref<FormInstance>();
const formDrawer = reactive({ visible: false, title: '' });
const detailDrawer = reactive({ visible: false });

const queryParams = reactive<FactorScopeQuery>({
  pageNum: 1,
  pageSize: 10,
  versionId: undefined,
  packageId: undefined,
  scopeStatus: undefined,
  params: {}
});

const form = reactive<FactorScopeForm>({
  id: undefined,
  versionId: undefined,
  packageId: undefined,
  scopeStatus: 'enabled'
});

const rules: FormRules<FactorScopeForm> = {
  versionId: [{ required: true, message: '因子版本不能为空', trigger: 'change' }],
  packageId: [{ required: true, message: '请选择套餐', trigger: 'change' }],
  scopeStatus: [{ required: true, message: '状态不能为空', trigger: 'change' }]
};

const factorVersionLabel = (item: FactorVersionVO) => `${item.versionName || item.versionCode || item.id}`;

const factorVersionMap = computed(() =>
  factorVersionOptions.value.reduce<Record<string, string>>((map, item) => {
    map[String(item.id)] = factorVersionLabel(item);
    return map;
  }, {})
);

const formatFactorVersion = (versionId?: string | number) => {
  if (versionId === undefined || versionId === null || versionId === '') {
    return '-';
  }
  return factorVersionMap.value[String(versionId)] || String(versionId);
};

const formatScopePackage = (row?: Pick<FactorScopeVO, 'packageId' | 'packageName'>) => {
  if (!row) return '-';
  if (row.packageName) return row.packageName;
  if (row.packageId !== undefined && row.packageId !== null && row.packageId !== '') {
    return packageOptions.value.find((item) => item.packageId === row.packageId)?.packageName || String(row.packageId);
  }
  return '-';
};

const loadOptions = async () => {
  const [versionRes, packageRes] = await Promise.all([
    listFactorVersion({ pageNum: 1, pageSize: 100, params: {} }),
    selectTenantPackage()
  ]);
  factorVersionOptions.value = readRows<FactorVersionVO>(versionRes);
  packageOptions.value = readRows<TenantPkgVO>(packageRes).filter((item) => item.status !== '1');
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listFactorScope(queryParams);
    scopeList.value = readRows<FactorScopeVO>(res);
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
  queryParams.versionId = undefined;
  queryParams.packageId = undefined;
  queryParams.scopeStatus = undefined;
  await refreshList();
};

const resetForm = () => {
  form.id = undefined;
  form.versionId = undefined;
  form.packageId = undefined;
  form.scopeStatus = 'enabled';
  formRef.value?.clearValidate();
};

const handleSelectionChange = (selection: FactorScopeVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增因子开放范围';
  formDrawer.visible = true;
};

const handleUpdate = async (row: FactorScopeVO) => {
  resetForm();
  const res = await getFactorScope(row.id);
  const data = res.data ?? row;
  Object.assign(form, {
    id: data.id,
    versionId: data.versionId,
    packageId: data.packageId,
    scopeStatus: data.scopeStatus || 'enabled'
  });
  formDrawer.title = '编辑因子开放范围';
  formDrawer.visible = true;
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    const payload: FactorScopeForm = {
      id: form.id,
      versionId: form.versionId,
      packageId: form.packageId,
      scopeStatus: form.scopeStatus
    };
    if (payload.id) {
      await updateFactorScope(payload);
      proxy?.$modal.msgSuccess('因子开放范围已更新');
    } else {
      await addFactorScope(payload);
      proxy?.$modal.msgSuccess('因子开放范围已新增');
    }
    formDrawer.visible = false;
    await getList();
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: FactorScopeVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: FactorScopeVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除因子开放范围“${formatFactorVersion(row.versionId)}”？` : `确认删除选中的 ${ids.value.length} 条开放范围？`;
    await proxy?.$modal.confirm(message);
    await deleteFactorScope(deleteIds);
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
