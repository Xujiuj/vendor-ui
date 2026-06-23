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
import { type FormInstance, type FormRules } from 'element-plus';
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

type FieldProp =
  | 'field01'
  | 'field02'
  | 'field03'
  | 'field04'
  | 'field05'
  | 'field06'
  | 'field07'
  | 'field08'
  | 'field09'
  | 'field10'
  | 'field11'
  | 'field12'
  | 'field13'
  | 'field14'
  | 'field15'
  | 'field16'
  | 'field17'
  | 'field18'
  | 'field19'
  | 'field20'
  | 'field21'
  | 'field22';

interface FieldConfig {
  prop: FieldProp;
  label: string;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dimensionOptions = [
  { label: '101 行政区划', value: 'admin-division' },
  { label: '102 公司表', value: 'company' },
  { label: '103 排放源分类', value: 'emission-source-category' },
  { label: '106 基准年维度表', value: 'base-year' },
  { label: '203 EF电力因子版本对应', value: 'ef-electricity-version' },
  { label: '205 EF电力因子口径维度', value: 'ef-electricity-scope' },
  { label: '206 温室气体维度', value: 'greenhouse-gas' },
  { label: '501 碳排放强度分母维度表', value: 'intensity-denominator' },
  { label: '502 强度目标表', value: 'intensity-target' },
  { label: '504 碳排放强度容忍率参数表', value: 'intensity-tolerance' },
  { label: '报表模板下载', value: 'report-template-download' }
];

const fieldConfig: Record<string, FieldConfig[]> = {
  'admin-division': [
    { prop: 'field01', label: '行政区划代码' },
    { prop: 'field02', label: '行政区划' }
  ],
  company: [
    { prop: 'field01', label: 'SK_公司' },
    { prop: 'field02', label: '公司编号' },
    { prop: 'field03', label: 'BK_工厂编号' },
    { prop: 'field04', label: '公司' },
    { prop: 'field05', label: '工厂' },
    { prop: 'field06', label: '省份编码' },
    { prop: 'field07', label: '所在省份' },
    { prop: 'field08', label: '工厂类型' },
    { prop: 'field09', label: '行业门类代码' },
    { prop: 'field10', label: '行业门类名称' },
    { prop: 'field11', label: '行业大类代码' },
    { prop: 'field12', label: '行业大类名称' },
    { prop: 'field13', label: '行业中类代码' },
    { prop: 'field14', label: '行业中类名称' },
    { prop: 'field15', label: '行业小类代码' },
    { prop: 'field16', label: '行业小类名称' },
    { prop: 'field17', label: '生效日期' },
    { prop: 'field18', label: '失效日期' },
    { prop: 'field19', label: '是否有效' },
    { prop: 'field20', label: '备注' }
  ],
  'emission-source-category': [
    { prop: 'field01', label: 'SK_排放源分类' },
    { prop: 'field02', label: 'BK_业务键' },
    { prop: 'field03', label: 'GHG Protocol范围' },
    { prop: 'field04', label: 'GHG Protocol范围子类别排序' },
    { prop: 'field05', label: 'GHG Protocol范围子类别' },
    { prop: 'field06', label: 'Scope (GHG Protocol)' },
    { prop: 'field07', label: 'Scope Category (GHG Protocol)' },
    { prop: 'field08', label: 'ISO 14064-1类别' },
    { prop: 'field09', label: 'ISO 14064-1 Category' },
    { prop: 'field10', label: 'ISO 14064-1类别描述' },
    { prop: 'field11', label: 'ISO 14064-1 Category Description (EN)' },
    { prop: 'field12', label: 'ISO 14064-1子类别（自定义）' },
    { prop: 'field13', label: 'GB/T 32150-2025范围分类' },
    { prop: 'field14', label: 'GB/T 32150-2025子类别' },
    { prop: 'field15', label: '生效日期' },
    { prop: 'field16', label: '失效日期' },
    { prop: 'field17', label: '是否当前' },
    { prop: 'field18', label: '版本号' },
    { prop: 'field19', label: '统一标准分类' }
  ],
  'base-year': [
    { prop: 'field01', label: '基准年Key' },
    { prop: 'field02', label: '基准年' },
    { prop: 'field03', label: '是否当前基准' },
    { prop: 'field04', label: '说明' }
  ],
  'ef-electricity-version': [
    { prop: 'field01', label: '年份' },
    { prop: 'field02', label: '对应因子版本' }
  ],
  'ef-electricity-scope': [
    { prop: 'field01', label: '因子口径Key' },
    { prop: 'field02', label: '因子口径' }
  ],
  'greenhouse-gas': [
    { prop: 'field01', label: 'GasKey' },
    { prop: 'field02', label: '气体' },
    { prop: 'field03', label: '排序' }
  ],
  'intensity-denominator': [
    { prop: 'field01', label: '分母规则Key' },
    { prop: 'field02', label: '工厂类型' },
    { prop: 'field03', label: '分母类型' },
    { prop: 'field04', label: '分母度量名称' },
    { prop: 'field05', label: '强度单位展示' },
    { prop: 'field06', label: '是否启用' },
    { prop: 'field07', label: '备注' }
  ],
  'intensity-target': [
    { prop: 'field01', label: '工厂类型' },
    { prop: 'field02', label: '年份' },
    { prop: 'field03', label: '强度目标值' },
    { prop: 'field04', label: '单位' }
  ],
  'intensity-tolerance': [
    { prop: 'field01', label: '容忍率Key' },
    { prop: 'field02', label: '行业门类' },
    { prop: 'field03', label: '容忍率' },
    { prop: 'field04', label: '是否启用' },
    { prop: 'field05', label: '备注' }
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
  field07: undefined,
  field08: undefined,
  field09: undefined,
  field10: undefined,
  field11: undefined,
  field12: undefined,
  field13: undefined,
  field14: undefined,
  field15: undefined,
  field16: undefined,
  field17: undefined,
  field18: undefined,
  field19: undefined,
  field20: undefined,
  field21: undefined,
  field22: undefined,
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
  form.field07 = undefined;
  form.field08 = undefined;
  form.field09 = undefined;
  form.field10 = undefined;
  form.field11 = undefined;
  form.field12 = undefined;
  form.field13 = undefined;
  form.field14 = undefined;
  form.field15 = undefined;
  form.field16 = undefined;
  form.field17 = undefined;
  form.field18 = undefined;
  form.field19 = undefined;
  form.field20 = undefined;
  form.field21 = undefined;
  form.field22 = undefined;
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
