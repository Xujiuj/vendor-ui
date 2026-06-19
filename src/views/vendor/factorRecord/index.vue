<template>
  <div class="page-panel">
    <div class="page-head factor-record-head">
      <div>
        <h1>因子明细</h1>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>版本ID</label>
          <el-input v-model="queryParams.versionId" placeholder="请输入版本ID" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>因子编码</label>
          <el-input v-model="queryParams.factorCode" placeholder="请输入因子编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>因子名称</label>
          <el-input v-model="queryParams.factorName" placeholder="请输入因子名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>因子分类</label>
          <el-input v-model="queryParams.factorCategory" placeholder="请输入因子分类" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-select v-model="queryParams.enabledFlag" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
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
          <el-button v-hasPermi="['vendor:factorRecord:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['vendor:factorRecord:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="recordList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="版本ID" align="center" prop="versionId" width="100" />
        <el-table-column label="因子编码" align="center" prop="factorCode" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="因子名称" align="center" prop="factorName" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="因子分类" align="center" prop="factorCategory" min-width="140" :show-overflow-tooltip="true" />
        <el-table-column label="因子值" align="center" prop="factorValue" width="120" />
        <el-table-column label="单位" align="center" prop="factorUnit" width="120" />
        <el-table-column label="状态" align="center" prop="enabledFlag" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabledFlag === false ? 'info' : 'success'">{{ row.enabledFlag === false ? '停用' : '启用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源引用" align="center" prop="sourceRef" min-width="170" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="210" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-hasPermi="['vendor:factorRecord:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['vendor:factorRecord:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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

    <el-drawer v-model="formDrawer.visible" :title="formDrawer.title" size="620px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="版本ID" prop="versionId">
          <el-input v-model="form.versionId" placeholder="请输入版本ID" />
        </el-form-item>
        <el-form-item label="因子编码" prop="factorCode">
          <el-input v-model="form.factorCode" placeholder="请输入因子编码" maxlength="64" />
        </el-form-item>
        <el-form-item label="因子名称" prop="factorName">
          <el-input v-model="form.factorName" placeholder="请输入因子名称" maxlength="128" />
        </el-form-item>
        <el-form-item label="因子分类" prop="factorCategory">
          <el-input v-model="form.factorCategory" placeholder="请输入因子分类" maxlength="64" />
        </el-form-item>
        <el-form-item label="因子值" prop="factorValue">
          <el-input-number v-model="form.factorValue" :precision="6" :controls="false" class="w-full" placeholder="请输入因子值" />
        </el-form-item>
        <el-form-item label="单位" prop="factorUnit">
          <el-input v-model="form.factorUnit" placeholder="请输入单位" maxlength="32" />
        </el-form-item>
        <el-form-item label="来源引用" prop="sourceRef">
          <el-input v-model="form.sourceRef" placeholder="请输入来源引用" maxlength="255" />
        </el-form-item>
        <el-form-item label="状态" prop="enabledFlag">
          <el-switch v-model="form.enabledFlag" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="detailDrawer.visible" title="因子明细详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="版本ID">{{ formatText(detailRecord.versionId) }}</el-descriptions-item>
        <el-descriptions-item label="因子编码">{{ formatText(detailRecord.factorCode) }}</el-descriptions-item>
        <el-descriptions-item label="因子名称">{{ formatText(detailRecord.factorName) }}</el-descriptions-item>
        <el-descriptions-item label="因子分类">{{ formatText(detailRecord.factorCategory) }}</el-descriptions-item>
        <el-descriptions-item label="因子值">{{ formatText(detailRecord.factorValue) }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ formatText(detailRecord.factorUnit) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailRecord.enabledFlag === false ? '停用' : '启用' }}</el-descriptions-item>
        <el-descriptions-item label="来源引用">{{ formatText(detailRecord.sourceRef) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorFactorRecord" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { addFactorRecord, deleteFactorRecord, getFactorRecord, listFactorRecord, updateFactorRecord } from '@/api/vendor/factorRecord';
import type { FactorRecordForm, FactorRecordQuery, FactorRecordVO } from '@/api/vendor/factorRecord/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const recordList = ref<FactorRecordVO[]>([]);
const detailRecord = ref<FactorRecordVO>();
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

const queryParams = reactive<FactorRecordQuery>({
  pageNum: 1,
  pageSize: 10,
  versionId: undefined,
  factorCode: undefined,
  factorName: undefined,
  factorCategory: undefined,
  enabledFlag: undefined,
  params: {}
});

const form = reactive<FactorRecordForm>({
  id: undefined,
  versionId: undefined,
  factorCode: '',
  factorName: '',
  factorCategory: '',
  factorValue: undefined,
  factorUnit: '',
  sourceRef: '',
  enabledFlag: true
});

const rules: FormRules<FactorRecordForm> = {
  versionId: [{ required: true, message: '版本ID不能为空', trigger: 'blur' }],
  factorCode: [{ required: true, message: '因子编码不能为空', trigger: 'blur' }],
  factorName: [{ required: true, message: '因子名称不能为空', trigger: 'blur' }],
  factorCategory: [{ required: true, message: '因子分类不能为空', trigger: 'blur' }],
  factorValue: [{ required: true, message: '因子值不能为空', trigger: 'blur' }],
  factorUnit: [{ required: true, message: '单位不能为空', trigger: 'blur' }]
};

const resetForm = () => {
  form.id = undefined;
  form.versionId = undefined;
  form.factorCode = '';
  form.factorName = '';
  form.factorCategory = '';
  form.factorValue = undefined;
  form.factorUnit = '';
  form.sourceRef = '';
  form.enabledFlag = true;
  formRef.value?.clearValidate();
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listFactorRecord(queryParams);
    recordList.value = readRows<FactorRecordVO>(res);
    total.value = readTotal(res, recordList.value);
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
  queryParams.factorCode = undefined;
  queryParams.factorName = undefined;
  queryParams.factorCategory = undefined;
  queryParams.enabledFlag = undefined;
  await refreshList();
};

const handleSelectionChange = (selection: FactorRecordVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增因子明细';
  formDrawer.visible = true;
};

const handleUpdate = async (row: FactorRecordVO) => {
  resetForm();
  try {
    const res = await getFactorRecord(row.id);
    const data = res.data ?? row;
    form.id = data.id;
    form.versionId = data.versionId;
    form.factorCode = data.factorCode;
    form.factorName = data.factorName;
    form.factorCategory = data.factorCategory;
    form.factorValue = data.factorValue;
    form.factorUnit = data.factorUnit;
    form.sourceRef = data.sourceRef ?? '';
    form.enabledFlag = data.enabledFlag !== false;
    formDrawer.title = '编辑因子明细';
    formDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  }
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  submitLoading.value = true;
  try {
    if (form.id) {
      await updateFactorRecord(form);
      proxy?.$modal.msgSuccess('因子明细已更新');
    } else {
      await addFactorRecord(form);
      proxy?.$modal.msgSuccess('因子明细已新增');
    }
    formDrawer.visible = false;
    await getList();
  } catch {
    // Global request interceptor already shows the error.
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: FactorRecordVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: FactorRecordVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除因子“${row.factorName}”？` : `确认删除选中的 ${ids.value.length} 条因子明细？`;
    await proxy?.$modal.confirm(message);
    await deleteFactorRecord(deleteIds);
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
.factor-record-head {
  align-items: flex-start;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.w-full {
  width: 100%;
}
</style>
