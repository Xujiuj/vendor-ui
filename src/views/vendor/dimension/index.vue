<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>维表管理</h1>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>维表类型</label>
          <el-select v-model="queryParams.dimensionCode" placeholder="请选择维表类型" clearable filterable>
            <el-option v-for="item in dimensionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="search-item">
          <label>记录编码</label>
          <el-input v-model="queryParams.recordCode" placeholder="请输入记录编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>记录名称</label>
          <el-input v-model="queryParams.recordName" placeholder="请输入记录名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>上级编码</label>
          <el-input v-model="queryParams.parentCode" placeholder="请输入上级编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
          <el-button v-hasPermi="['vendor:dimension:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['vendor:dimension:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
        </div>
        <span v-if="ids.length > 0" class="select-count">已选 {{ ids.length }} 项</span>
      </div>

      <el-table v-loading="loading" :data="recordList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="维表类型" align="center" prop="dimensionCode" min-width="170" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatDimensionLabel(row.dimensionCode) }}
          </template>
        </el-table-column>
        <el-table-column label="记录编码" align="center" prop="recordCode" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="记录名称" align="center" prop="recordName" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="上级编码" align="center" prop="parentCode" min-width="130" :show-overflow-tooltip="true" />
        <el-table-column
          v-for="field in activeFields"
          :key="field.prop"
          :label="field.label"
          align="center"
          :prop="field.prop"
          min-width="140"
          :show-overflow-tooltip="true"
        />
        <el-table-column label="状态" align="center" prop="status" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'info' : 'success'">{{ row.status === '1' ? '停用' : '启用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" width="90" />
        <el-table-column label="备注" align="center" prop="remark" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-hasPermi="['vendor:dimension:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['vendor:dimension:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="维表类型" prop="dimensionCode">
          <el-select v-model="form.dimensionCode" placeholder="请选择维表类型" class="w-full" filterable>
            <el-option v-for="item in dimensionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录编码" prop="recordCode">
          <el-input v-model="form.recordCode" placeholder="请输入记录编码" maxlength="128" />
        </el-form-item>
        <el-form-item label="记录名称" prop="recordName">
          <el-input v-model="form.recordName" placeholder="请输入记录名称" maxlength="255" />
        </el-form-item>
        <el-form-item label="上级编码" prop="parentCode">
          <el-input v-model="form.parentCode" placeholder="请输入上级编码" maxlength="128" />
        </el-form-item>
        <el-form-item v-for="field in formFields" :key="field.prop" :label="field.label" :prop="field.prop">
          <el-input v-model="form[field.prop]" :placeholder="`请输入${field.label}`" maxlength="255" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">启用</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999999" :precision="0" class="w-full" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="detailDrawer.visible" title="维表详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="维表类型">{{ formatDimensionLabel(detailRecord.dimensionCode) }}</el-descriptions-item>
        <el-descriptions-item label="记录编码">{{ formatText(detailRecord.recordCode) }}</el-descriptions-item>
        <el-descriptions-item label="记录名称">{{ formatText(detailRecord.recordName) }}</el-descriptions-item>
        <el-descriptions-item label="上级编码">{{ formatText(detailRecord.parentCode) }}</el-descriptions-item>
        <el-descriptions-item v-for="field in detailFields" :key="field.prop" :label="field.label">
          {{ formatText(detailRecord[field.prop]) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailRecord.status === '1' ? '停用' : '启用' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ formatText(detailRecord.sortOrder) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detailRecord.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatText(detailRecord.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorDimension" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import {
  addDimensionRecord,
  deleteDimensionRecord,
  getDimensionRecord,
  listDimensionRecord,
  updateDimensionRecord
} from '@/api/vendor/dimensionRecord';
import type { DimensionRecordForm, DimensionRecordQuery, DimensionRecordVO } from '@/api/vendor/dimensionRecord/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

type FieldProp = 'field01' | 'field02' | 'field03' | 'field04' | 'field05' | 'field06';

interface FieldConfig {
  prop: FieldProp;
  label: string;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dimensionOptions = [
  { label: '行政区划', value: 'admin-division' },
  { label: '排放源分类', value: 'emission-source-category' },
  { label: '基准年维度表', value: 'base-year' },
  { label: 'EF电力因子维度表', value: 'ef-electricity-factor' },
  { label: 'EF电力因子版本对应', value: 'ef-electricity-version' },
  { label: 'EF电力因子口径维度', value: 'ef-electricity-scope' },
  { label: '温室气体维度', value: 'greenhouse-gas' },
  { label: '报表模板下载', value: 'report-template-download' }
];

const fieldConfig: Record<string, FieldConfig[]> = {
  'admin-division': [
    { prop: 'field01', label: '区划层级' },
    { prop: 'field02', label: '适用电网区域' },
    { prop: 'field03', label: '国家/地区' }
  ],
  'emission-source-category': [
    { prop: 'field01', label: '核算范围' },
    { prop: 'field02', label: '默认活动单位' },
    { prop: 'field03', label: '默认因子口径' }
  ],
  'base-year': [
    { prop: 'field01', label: '年度' },
    { prop: 'field02', label: '适用组织' },
    { prop: 'field03', label: '适用指标' }
  ],
  'ef-electricity-factor': [
    { prop: 'field01', label: '行政区划代码' },
    { prop: 'field02', label: '因子值' },
    { prop: 'field03', label: '单位' },
    { prop: 'field04', label: '版本号' }
  ],
  'ef-electricity-version': [
    { prop: 'field01', label: '核算期间' },
    { prop: 'field02', label: '因子版本' },
    { prop: 'field03', label: '适用区域' }
  ],
  'ef-electricity-scope': [
    { prop: 'field01', label: '口径类型' },
    { prop: 'field02', label: '适用说明' }
  ],
  'greenhouse-gas': [
    { prop: 'field01', label: 'GWP值' },
    { prop: 'field02', label: 'GWP版本' },
    { prop: 'field03', label: '化学式' }
  ],
  'report-template-download': [
    { prop: 'field01', label: '模板类型' },
    { prop: 'field02', label: '版本号' },
    { prop: 'field03', label: '文件路径' },
    { prop: 'field04', label: '发布时间' }
  ]
};

const dimensionLabelMap = dimensionOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const recordList = ref<DimensionRecordVO[]>([]);
const detailRecord = ref<DimensionRecordVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const formRef = ref<FormInstance>();
const formDrawer = reactive({ visible: false, title: '' });
const detailDrawer = reactive({ visible: false });

const queryParams = reactive<DimensionRecordQuery>({
  pageNum: 1,
  pageSize: 10,
  dimensionCode: 'admin-division',
  recordCode: undefined,
  recordName: undefined,
  parentCode: undefined,
  status: undefined,
  params: {}
});

const form = reactive<DimensionRecordForm>({
  id: undefined,
  dimensionCode: 'admin-division',
  recordCode: '',
  recordName: '',
  parentCode: undefined,
  field01: undefined,
  field02: undefined,
  field03: undefined,
  field04: undefined,
  field05: undefined,
  field06: undefined,
  sortOrder: 0,
  status: '0',
  remark: undefined
});

const activeFields = computed(() => fieldConfig[queryParams.dimensionCode || ''] ?? fieldConfig['admin-division']);
const formFields = computed(() => fieldConfig[form.dimensionCode || ''] ?? fieldConfig['admin-division']);
const detailFields = computed(() => fieldConfig[detailRecord.value?.dimensionCode || ''] ?? []);

const rules: FormRules<DimensionRecordForm> = {
  dimensionCode: [{ required: true, message: '维表类型不能为空', trigger: 'change' }],
  recordCode: [{ required: true, message: '记录编码不能为空', trigger: 'blur' }],
  recordName: [{ required: true, message: '记录名称不能为空', trigger: 'blur' }]
};

const formatDimensionLabel = (dimensionCode?: string) => (dimensionCode ? dimensionLabelMap[dimensionCode] || dimensionCode : '-');

const resetForm = () => {
  form.id = undefined;
  form.dimensionCode = queryParams.dimensionCode || 'admin-division';
  form.recordCode = '';
  form.recordName = '';
  form.parentCode = undefined;
  form.field01 = undefined;
  form.field02 = undefined;
  form.field03 = undefined;
  form.field04 = undefined;
  form.field05 = undefined;
  form.field06 = undefined;
  form.sortOrder = 0;
  form.status = '0';
  form.remark = undefined;
  formRef.value?.clearValidate();
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listDimensionRecord(queryParams);
    recordList.value = readRows<DimensionRecordVO>(res);
    total.value = readTotal(res, recordList.value);
  } finally {
    loading.value = false;
  }
};

const refreshList = async () => {
  await getList();
};

const handleQuery = async () => {
  queryParams.pageNum = 1;
  await refreshList();
};

const resetQuery = async () => {
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.dimensionCode = 'admin-division';
  queryParams.recordCode = undefined;
  queryParams.recordName = undefined;
  queryParams.parentCode = undefined;
  queryParams.status = undefined;
  await refreshList();
};

const handleSelectionChange = (selection: DimensionRecordVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增维表记录';
  formDrawer.visible = true;
};

const handleUpdate = async (row: DimensionRecordVO) => {
  resetForm();
  const res = await getDimensionRecord(row.id);
  const data = res.data ?? row;
  Object.assign(form, {
    ...data,
    status: data.status || '0',
    sortOrder: data.sortOrder ?? 0
  });
  formDrawer.title = '编辑维表记录';
  formDrawer.visible = true;
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    if (form.id) {
      await updateDimensionRecord(form);
      proxy?.$modal.msgSuccess('维表记录已更新');
    } else {
      await addDimensionRecord(form);
      proxy?.$modal.msgSuccess('维表记录已新增');
    }
    formDrawer.visible = false;
    await getList();
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: DimensionRecordVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: DimensionRecordVO) => {
  const deleteIds = row?.id || ids.value;
  const message = row ? `确认删除维表记录“${row.recordName}”？` : `确认删除选中的 ${ids.value.length} 条维表记录？`;
  await proxy?.$modal.confirm(message);
  await deleteDimensionRecord(deleteIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
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
  gap: 12px;
  margin-bottom: 12px;
}

.w-full {
  width: 100%;
}
</style>
