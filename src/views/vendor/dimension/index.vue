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
          <el-select v-model="queryParams.tableCode" placeholder="请选择维表类型" clearable filterable>
            <el-option v-for="item in dimensionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="search-item">
          <label>字段编码</label>
          <el-input v-model="queryParams.fieldKey" placeholder="请输入字段编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>字段名称</label>
          <el-input v-model="queryParams.fieldLabel" placeholder="请输入字段名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>字段类型</label>
          <el-select v-model="queryParams.fieldType" placeholder="请选择字段类型" clearable>
            <el-option v-for="item in fieldTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-button v-hasPermi="['vendor:dimension:add']" type="primary" plain icon="Plus" @click="handleAdd">新增字段</el-button>
          <el-button v-hasPermi="['vendor:dimension:add']" plain icon="DocumentAdd" @click="initializeDefaultFields">初始化样例字段</el-button>
          <el-button v-hasPermi="['vendor:dimension:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
        </div>
        <span v-if="ids.length > 0" class="select-count">已选 {{ ids.length }} 项</span>
      </div>

      <el-table v-loading="loading" :data="fieldList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="维表类型" align="center" prop="tableCode" min-width="190" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatDimensionLabel(row.tableCode) }}
          </template>
        </el-table-column>
        <el-table-column label="字段编码" align="center" prop="fieldKey" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="字段名称" align="center" prop="fieldLabel" min-width="220" :show-overflow-tooltip="true" />
        <el-table-column label="字段类型" align="center" prop="fieldType" width="110">
          <template #default="{ row }">{{ formatFieldType(row.fieldType) }}</template>
        </el-table-column>
        <el-table-column label="精度" align="center" prop="fieldPrecision" width="90">
          <template #default="{ row }">{{ formatText(row.fieldPrecision) }}</template>
        </el-table-column>
        <el-table-column label="列宽" align="center" prop="fieldWidth" width="90">
          <template #default="{ row }">{{ formatText(row.fieldWidth) }}</template>
        </el-table-column>
        <el-table-column label="必填" align="center" prop="requiredFlag" width="90">
          <template #default="{ row }">
            <el-tag :type="row.requiredFlag ? 'danger' : 'info'">{{ row.requiredFlag ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sortOrder" width="90" />
        <el-table-column label="状态" align="center" prop="status" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'info' : 'success'">{{ row.status === '1' ? '停用' : '启用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="170">
          <template #default="{ row }">{{ formatDateTime(row.updateTime || row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="230" fixed="right"> 
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="维表类型" prop="tableCode">
          <el-select v-model="form.tableCode" placeholder="请选择维表类型" class="w-full" filterable>
            <el-option v-for="item in dimensionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段编码" prop="fieldKey">
          <el-input v-model="form.fieldKey" placeholder="请输入字段编码，如 field01" maxlength="128" />
        </el-form-item>
        <el-form-item label="字段名称" prop="fieldLabel">
          <el-input v-model="form.fieldLabel" placeholder="请输入字段名称" maxlength="255" />
        </el-form-item>
        <el-form-item label="字段类型" prop="fieldType">
          <el-select v-model="form.fieldType" placeholder="请选择字段类型" class="w-full">
            <el-option v-for="item in fieldTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="精度" prop="fieldPrecision">
          <el-input-number v-model="form.fieldPrecision" :min="0" :max="10" :precision="0" class="w-full" />
        </el-form-item>
        <el-form-item label="列宽" prop="fieldWidth">
          <el-input-number v-model="form.fieldWidth" :min="80" :max="500" :precision="0" class="w-full" />
        </el-form-item>
        <el-form-item label="是否必填" prop="requiredFlag">
          <el-switch v-model="form.requiredFlag" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" :precision="0" class="w-full" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">启用</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
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

    <el-drawer v-model="detailDrawer.visible" title="维表字段详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="维表类型">{{ formatDimensionLabel(detailRecord.tableCode) }}</el-descriptions-item>
        <el-descriptions-item label="字段编码">{{ formatText(detailRecord.fieldKey) }}</el-descriptions-item>
        <el-descriptions-item label="字段名称">{{ formatText(detailRecord.fieldLabel) }}</el-descriptions-item>
        <el-descriptions-item label="字段类型">{{ formatFieldType(detailRecord.fieldType) }}</el-descriptions-item>
        <el-descriptions-item label="精度">{{ formatText(detailRecord.fieldPrecision) }}</el-descriptions-item>
        <el-descriptions-item label="列宽">{{ formatText(detailRecord.fieldWidth) }}</el-descriptions-item>
        <el-descriptions-item label="是否必填">{{ detailRecord.requiredFlag ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ formatText(detailRecord.sortOrder) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailRecord.status === '1' ? '停用' : '启用' }}</el-descriptions-item>
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
import { addVendorTableField, deleteVendorTableField, getVendorTableField, listVendorTableField, updateVendorTableField } from '@/api/vendor/tableField';
import type { VendorTableFieldForm, VendorTableFieldQuery, VendorTableFieldVO } from '@/api/vendor/tableField/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

interface DefaultField {
  fieldKey: string;
  fieldLabel: string;
  fieldType?: FieldType;
  fieldPrecision?: number;
  fieldWidth?: number;
  requiredFlag?: boolean;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dimensionOptions = [
  { label: '101 行政区划', value: 'admin-division' },
  { label: '102 公司表', value: 'company' },
  { label: '103 排放源分类', value: 'emission-source-category' },
  { label: '106 基准年维度表', value: 'base-year' },
  { label: '501 碳排放强度分母维度表', value: 'intensity-denominator' },
  { label: '502 强度目标表', value: 'intensity-target' },
  { label: '504 碳排放强度容忍率参数表', value: 'intensity-tolerance' },
  { label: '报表模板下载', value: 'report-template-download' }
];

const fieldTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '数值', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '选项', value: 'select' },
  { label: '是/否', value: 'boolean' }
];

const dimensionLabelMap = dimensionOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});
const fieldTypeLabelMap = fieldTypeOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const defaultFields: Record<string, DefaultField[]> = {
  'admin-division': [
    { fieldKey: 'field01', fieldLabel: '行政区划代码', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: '行政区划', requiredFlag: true }
  ],
  company: [
    { fieldKey: 'field01', fieldLabel: 'SK_公司', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: '公司编号' },
    { fieldKey: 'field03', fieldLabel: 'BK_工厂编号' },
    { fieldKey: 'field04', fieldLabel: '公司' },
    { fieldKey: 'field05', fieldLabel: '工厂' },
    { fieldKey: 'field06', fieldLabel: '省份编码' },
    { fieldKey: 'field07', fieldLabel: '所在省份' },
    { fieldKey: 'field08', fieldLabel: '工厂类型' },
    { fieldKey: 'field09', fieldLabel: '行业门类代码' },
    { fieldKey: 'field10', fieldLabel: '行业门类名称' },
    { fieldKey: 'field11', fieldLabel: '行业大类代码' },
    { fieldKey: 'field12', fieldLabel: '行业大类名称' },
    { fieldKey: 'field13', fieldLabel: '行业中类代码' },
    { fieldKey: 'field14', fieldLabel: '行业中类名称' },
    { fieldKey: 'field15', fieldLabel: '行业小类代码' },
    { fieldKey: 'field16', fieldLabel: '行业小类名称' },
    { fieldKey: 'field17', fieldLabel: '生效日期', fieldType: 'date' },
    { fieldKey: 'field18', fieldLabel: '失效日期', fieldType: 'date' },
    { fieldKey: 'field19', fieldLabel: '是否有效', fieldType: 'boolean' },
    { fieldKey: 'field20', fieldLabel: '备注' }
  ],
  'emission-source-category': [
    { fieldKey: 'field01', fieldLabel: 'SK_排放源分类', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: 'BK_业务键' },
    { fieldKey: 'field03', fieldLabel: 'GHG Protocol范围' },
    { fieldKey: 'field04', fieldLabel: 'GHG Protocol范围子类别排序', fieldType: 'number', fieldPrecision: 0 },
    { fieldKey: 'field05', fieldLabel: 'GHG Protocol范围子类别' },
    { fieldKey: 'field06', fieldLabel: 'Scope (GHG Protocol)' },
    { fieldKey: 'field07', fieldLabel: 'Scope Category (GHG Protocol)' },
    { fieldKey: 'field08', fieldLabel: 'ISO 14064-1类别' },
    { fieldKey: 'field09', fieldLabel: 'ISO 14064-1 Category' },
    { fieldKey: 'field10', fieldLabel: 'ISO 14064-1类别描述' },
    { fieldKey: 'field11', fieldLabel: 'ISO 14064-1 Category Description (EN)' },
    { fieldKey: 'field12', fieldLabel: 'ISO 14064-1子类别（自定义）' },
    { fieldKey: 'field13', fieldLabel: 'GB/T 32150-2025范围分类' },
    { fieldKey: 'field14', fieldLabel: 'GB/T 32150-2025子类别' },
    { fieldKey: 'field15', fieldLabel: '生效日期', fieldType: 'date' },
    { fieldKey: 'field16', fieldLabel: '失效日期', fieldType: 'date' },
    { fieldKey: 'field17', fieldLabel: '是否当前', fieldType: 'boolean' },
    { fieldKey: 'field18', fieldLabel: '版本号' },
    { fieldKey: 'field19', fieldLabel: '统一标准分类' }
  ],
  'base-year': [
    { fieldKey: 'field01', fieldLabel: '基准年Key', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: '基准年', fieldType: 'number', fieldPrecision: 0 },
    { fieldKey: 'field03', fieldLabel: '是否当前基准', fieldType: 'boolean' },
    { fieldKey: 'field04', fieldLabel: '说明' }
  ],
  'ef-electricity-version': [
    { fieldKey: 'field01', fieldLabel: '年份', fieldType: 'number', fieldPrecision: 0 },
    { fieldKey: 'field02', fieldLabel: '对应因子版本' }
  ],
  'ef-electricity-scope': [
    { fieldKey: 'field01', fieldLabel: '因子口径Key', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: '因子口径' }
  ],
  'greenhouse-gas': [
    { fieldKey: 'field01', fieldLabel: 'GasKey', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: '气体' }
  ],
  'intensity-denominator': [
    { fieldKey: 'field01', fieldLabel: '分母规则Key', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: '工厂类型' },
    { fieldKey: 'field03', fieldLabel: '分母类型' },
    { fieldKey: 'field04', fieldLabel: '分母度量名称' },
    { fieldKey: 'field05', fieldLabel: '强度单位展示' },
    { fieldKey: 'field06', fieldLabel: '是否启用', fieldType: 'boolean' },
    { fieldKey: 'field07', fieldLabel: '备注' }
  ],
  'intensity-target': [
    { fieldKey: 'field01', fieldLabel: '工厂类型' },
    { fieldKey: 'field02', fieldLabel: '年份', fieldType: 'number', fieldPrecision: 0 },
    { fieldKey: 'field03', fieldLabel: '强度目标值', fieldType: 'number' },
    { fieldKey: 'field04', fieldLabel: '单位' }
  ],
  'intensity-tolerance': [
    { fieldKey: 'field01', fieldLabel: '容忍率Key', requiredFlag: true },
    { fieldKey: 'field02', fieldLabel: '行业门类' },
    { fieldKey: 'field03', fieldLabel: '容忍率', fieldType: 'number' },
    { fieldKey: 'field04', fieldLabel: '是否启用', fieldType: 'boolean' },
    { fieldKey: 'field05', fieldLabel: '备注' }
  ],
  'report-template-download': [
    { fieldKey: 'field01', fieldLabel: '模板类型' },
    { fieldKey: 'field02', fieldLabel: '版本号' },
    { fieldKey: 'field03', fieldLabel: '文件路径' },
    { fieldKey: 'field04', fieldLabel: '发布时间', fieldType: 'date' }
  ]
};

const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0); 
const fieldList = ref<VendorTableFieldVO[]>([]); 
const detailRecord = ref<VendorTableFieldVO>(); 
const ids = ref<Array<string | number>>([]); 
const multiple = ref(true); 
const formRef = ref<FormInstance>(); 
const formDrawer = reactive({ visible: false, title: '' }); 
const detailDrawer = reactive({ visible: false }); 

const queryParams = reactive<VendorTableFieldQuery>({
  pageNum: 1,
  pageSize: 10,
  tableGroup: 'dimension',
  tableCode: 'admin-division',
  fieldKey: undefined,
  fieldLabel: undefined,
  fieldType: undefined,
  status: undefined,
  params: {}
});

const form = reactive<VendorTableFieldForm>({
  id: undefined,
  tableGroup: 'dimension',
  tableCode: 'admin-division',
  fieldKey: '',
  fieldLabel: '',
  fieldType: 'text',
  fieldPrecision: undefined,
  fieldWidth: 140,
  requiredFlag: false,
  sortOrder: 0,
  status: '0',
  remark: undefined
});

const rules: FormRules<VendorTableFieldForm> = {
  tableCode: [{ required: true, message: '维表类型不能为空', trigger: 'change' }],
  fieldKey: [{ required: true, message: '字段编码不能为空', trigger: 'blur' }],
  fieldLabel: [{ required: true, message: '字段名称不能为空', trigger: 'blur' }],
  fieldType: [{ required: true, message: '字段类型不能为空', trigger: 'change' }]
};

const activeDefaultFields = computed(() => defaultFields[queryParams.tableCode || 'admin-division'] ?? []);
const formatDimensionLabel = (code?: string) => (code ? dimensionLabelMap[code] || code : '-');
const formatFieldType = (type?: string) => (type ? fieldTypeLabelMap[type] || type : '-');

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    tableGroup: 'dimension',
    tableCode: queryParams.tableCode || 'admin-division',
    fieldKey: '',
    fieldLabel: '',
    fieldType: 'text',
    fieldPrecision: undefined,
    fieldWidth: 140,
    requiredFlag: false,
    sortOrder: fieldList.value.length + 1,
    status: '0',
    remark: undefined
  });
  formRef.value?.clearValidate();
};

const getList = async () => {
  loading.value = true;
  try {
    queryParams.tableGroup = 'dimension';
    const res = await listVendorTableField(queryParams);
    fieldList.value = readRows<VendorTableFieldVO>(res);
    total.value = readTotal(res, fieldList.value);
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

const handleSelectionChange = (selection: VendorTableFieldVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增维表字段';
  formDrawer.visible = true;
};

const handleUpdate = async (row: VendorTableFieldVO) => { 
  resetForm(); 
  try { 
    const res = await getVendorTableField(row.id);
    Object.assign(form, res.data ?? row);
    form.tableGroup = 'dimension';
    form.status = form.status || '0';
    form.requiredFlag = form.requiredFlag === true;
    formDrawer.title = '编辑维表字段';
    formDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  } 
}; 

const openDetail = async (row: VendorTableFieldVO) => {
  try {
    const res = await getVendorTableField(row.id);
    detailRecord.value = res.data ?? row;
    detailDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  }
};
 
const submitForm = async () => { 
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    const payload = { ...form, tableGroup: 'dimension' };
    if (payload.id) {
      await updateVendorTableField(payload);
      proxy?.$modal.msgSuccess('维表字段已更新');
    } else {
      await addVendorTableField(payload);
      proxy?.$modal.msgSuccess('维表字段已新增');
    }
    formDrawer.visible = false;
    await getList();
  } finally {
    submitLoading.value = false;
  }
};

const handleDelete = async (row?: VendorTableFieldVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除字段“${row.fieldLabel}”？` : `确认删除选中的 ${ids.value.length} 个字段？`;
    await proxy?.$modal.confirm(message);
    await deleteVendorTableField(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
};

const initializeDefaultFields = async () => {
  const tableCode = queryParams.tableCode || 'admin-division';
  const existingRes = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'dimension', tableCode, params: {} });
  const existingKeys = new Set(readRows<VendorTableFieldVO>(existingRes).map((item) => item.fieldKey));
  const fieldsToCreate = activeDefaultFields.value.filter((field) => !existingKeys.has(field.fieldKey));
  if (!fieldsToCreate.length) {
    proxy?.$modal.msgWarning('当前维表字段已初始化');
    return;
  }
  await proxy?.$modal.confirm(`确认按客户样例初始化 ${fieldsToCreate.length} 个字段？`);
  submitLoading.value = true;
  try {
    for (const [index, field] of fieldsToCreate.entries()) {
      await addVendorTableField({
        tableGroup: 'dimension',
        tableCode,
        fieldKey: field.fieldKey,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType || 'text',
        fieldPrecision: field.fieldType === 'number' ? (field.fieldPrecision ?? 10) : undefined,
        fieldWidth: field.fieldWidth,
        requiredFlag: field.requiredFlag === true,
        sortOrder: fieldList.value.length + index + 1,
        status: '0',
        remark: '按客户样例字段初始化'
      });
    }
    proxy?.$modal.msgSuccess('样例字段初始化完成');
    await getList();
  } finally {
    submitLoading.value = false;
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.w-full {
  width: 100%;
}
</style>
