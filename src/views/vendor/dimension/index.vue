<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>维表管理</h1>
        <p>管理厂商侧基础维度数据和字段定义。数据通过 License 同步到企业端，字段定义控制企业端录入行为。</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="dimension-tabs" @tab-change="handleTabChange">
      <!-- 数据管理 Tab -->
      <el-tab-pane v-for="dim in dimensionTabs" :key="dim.code" :label="dim.label" :name="dim.code">
        <div class="panel">
          <div class="toolbar">
            <div class="btns">
              <el-button v-hasPermi="['vendor:dimension:add']" type="primary" plain icon="Plus" @click="handleDataAdd">新增</el-button>
              <el-button v-hasPermi="['vendor:dimension:remove']" type="danger" plain icon="Delete" :disabled="dataMultiple" @click="handleDataDelete()">
                删除
              </el-button>
            </div>
            <span v-if="dataIds.length > 0" class="select-count">已选 {{ dataIds.length }} 项</span>
          </div>

          <el-table v-loading="dataLoading" :data="dataList" border @selection-change="handleDataSelectionChange">
            <el-table-column type="selection" width="48" align="center" />
            <el-table-column :label="dim.codeLabel" align="center" prop="recordCode" min-width="150" :show-overflow-tooltip="true" />
            <el-table-column :label="dim.nameLabel" align="center" prop="recordName" min-width="200" :show-overflow-tooltip="true" />
            <el-table-column v-if="dim.showParent" label="上级编码" align="center" prop="parentCode" min-width="120" :show-overflow-tooltip="true" />
            <el-table-column
              v-for="field in dim.extraFields"
              :key="field.key"
              :label="field.label"
              align="center"
              :prop="field.key"
              :min-width="field.width ?? 140"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
            <el-table-column label="状态" align="center" prop="status" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '0' ? 'success' : 'info'">{{ row.status === '0' ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="操作" align="center" width="150" fixed="right">
              <template #default="{ row }">
                <el-button v-hasPermi="['vendor:dimension:edit']" link type="primary" icon="Edit" @click="handleDataEdit(row)">编辑</el-button>
                <el-button v-hasPermi="['vendor:dimension:remove']" link type="danger" icon="Delete" @click="handleDataDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="dataTotal > 0"
            v-model:page="dataQuery.pageNum"
            v-model:limit="dataQuery.pageSize"
            :total="dataTotal"
            @pagination="loadDataList"
          />
        </div>
      </el-tab-pane>

      <!-- 字段定义 Tab -->
      <el-tab-pane label="字段定义" name="__fields__">
        <div class="panel">
          <div class="toolbar">
            <div class="btns">
              <el-select v-model="fieldTableCode" placeholder="选择维表类型" class="field-type-select" @change="loadFieldList">
                <el-option v-for="item in dimensionTabs" :key="item.code" :label="item.label" :value="item.code" />
              </el-select>
              <el-button v-hasPermi="['vendor:dimension:add']" type="primary" plain icon="Plus" @click="handleFieldAdd">新增字段</el-button>
              <el-button v-hasPermi="['vendor:dimension:add']" plain icon="DocumentAdd" @click="initializeDefaultFields">初始化样例字段</el-button>
              <el-button v-hasPermi="['vendor:dimension:remove']" type="danger" plain icon="Delete" :disabled="fieldMultiple" @click="handleFieldDelete()">
                删除
              </el-button>
            </div>
            <span v-if="fieldIds.length > 0" class="select-count">已选 {{ fieldIds.length }} 项</span>
          </div>

          <el-table v-loading="fieldLoading" :data="fieldList" border @selection-change="handleFieldSelectionChange">
            <el-table-column type="selection" width="48" align="center" />
            <el-table-column label="字段编码" align="center" prop="fieldKey" min-width="150" :show-overflow-tooltip="true" />
            <el-table-column label="字段名称" align="center" prop="fieldLabel" min-width="220" :show-overflow-tooltip="true" />
            <el-table-column label="字段类型" align="center" prop="fieldType" width="110">
              <template #default="{ row }">{{ formatFieldType(row.fieldType) }}</template>
            </el-table-column>
            <el-table-column label="必填" align="center" prop="requiredFlag" width="80">
              <template #default="{ row }">
                <el-tag :type="row.requiredFlag ? 'danger' : 'info'" size="small">{{ row.requiredFlag ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="排序" align="center" prop="sortOrder" width="80" />
            <el-table-column label="状态" align="center" prop="status" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '0' ? 'success' : 'info'" size="small">{{ row.status === '0' ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150" fixed="right">
              <template #default="{ row }">
                <el-button v-hasPermi="['vendor:dimension:edit']" link type="primary" icon="Edit" @click="handleFieldEdit(row)">编辑</el-button>
                <el-button v-hasPermi="['vendor:dimension:remove']" link type="danger" icon="Delete" @click="handleFieldDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 数据编辑抽屉 -->
    <el-drawer v-model="dataDrawer.visible" :title="dataDrawer.title" size="620px" append-to-body>
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="120px">
        <el-form-item :label="currentDim.codeLabel" prop="recordCode">
          <el-input v-model="dataForm.recordCode" :placeholder="`请输入${currentDim.codeLabel}`" maxlength="128" />
        </el-form-item>
        <el-form-item :label="currentDim.nameLabel" prop="recordName">
          <el-input v-model="dataForm.recordName" :placeholder="`请输入${currentDim.nameLabel}`" maxlength="255" />
        </el-form-item>
        <el-form-item v-if="currentDim.showParent" label="上级编码" prop="parentCode">
          <el-input v-model="dataForm.parentCode" placeholder="请输入上级编码" maxlength="128" />
        </el-form-item>
        <el-form-item v-for="field in currentDim.extraFields" :key="field.key" :label="field.label">
          <el-input-number v-if="field.type === 'number'" v-model="dataForm[field.key]" :precision="field.precision ?? 0" class="w-full" />
          <el-date-picker v-else-if="field.type === 'date'" v-model="dataForm[field.key]" type="date" value-format="YYYY-MM-DD" class="w-full" />
          <el-input v-else v-model="dataForm[field.key]" :placeholder="`请输入${field.label}`" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="dataForm.sortOrder" :min="0" :max="9999" :precision="0" class="w-full" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dataForm.status">
            <el-radio value="0">启用</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="dataSubmitLoading" @click="submitDataForm">确定</el-button>
      </template>
    </el-drawer>

    <!-- 字段编辑抽屉 -->
    <el-drawer v-model="fieldDrawer.visible" :title="fieldDrawer.title" size="620px" append-to-body>
      <el-form ref="fieldFormRef" :model="fieldForm" :rules="fieldRules" label-width="120px">
        <el-form-item label="字段编码" prop="fieldKey">
          <el-input v-model="fieldForm.fieldKey" placeholder="请输入字段编码，如 division_code" maxlength="128" />
        </el-form-item>
        <el-form-item label="字段名称" prop="fieldLabel">
          <el-input v-model="fieldForm.fieldLabel" placeholder="请输入字段名称" maxlength="255" />
        </el-form-item>
        <el-form-item label="字段类型" prop="fieldType">
          <el-select v-model="fieldForm.fieldType" placeholder="请选择字段类型" class="w-full">
            <el-option v-for="item in fieldTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否必填" prop="requiredFlag">
          <el-switch v-model="fieldForm.requiredFlag" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="fieldForm.sortOrder" :min="0" :max="9999" :precision="0" class="w-full" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="fieldForm.status">
            <el-radio value="0">启用</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="fieldForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fieldDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="fieldSubmitLoading" @click="submitFieldForm">确定</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="VendorDimension" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { addVendorTableField, deleteVendorTableField, getVendorTableField, listVendorTableField, updateVendorTableField } from '@/api/vendor/tableField';
import type { VendorTableFieldForm, VendorTableFieldQuery, VendorTableFieldVO } from '@/api/vendor/tableField/types';
import { addDimensionData, deleteDimensionData, getDimensionData, listDimensionData, updateDimensionData } from '@/api/vendor/dimensionData';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatText, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// ==================== Dimension Tab Definitions ====================

interface ExtraField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date';
  precision?: number;
  width?: number;
}

interface DimensionTab {
  code: string;
  label: string;
  codeLabel: string;
  nameLabel: string;
  showParent?: boolean;
  extraFields: ExtraField[];
}

const dimensionTabs: DimensionTab[] = [
  {
    code: 'admin-division',
    label: '101 行政区划',
    codeLabel: '行政区划代码',
    nameLabel: '行政区划名称',
    showParent: true,
    extraFields: [
      { key: 'levelType', label: '层级类型', width: 100 }
    ]
  },
  {
    code: 'emission-source-category',
    label: '103 排放源分类',
    codeLabel: '分类编码',
    nameLabel: '分类名称',
    showParent: true,
    extraFields: [
      { key: 'categoryNameEn', label: '英文名称', width: 160 },
      { key: 'ghgScope', label: 'GHG范围', width: 120 },
      { key: 'ghgScopeCategory', label: 'GHG范围分类', width: 180 },
      { key: 'isoCategory', label: 'ISO分类', width: 120 },
      { key: 'gbScopeCategory', label: '国标范围分类', width: 160 }
    ]
  },
  {
    code: 'base-year',
    label: '106 基准年',
    codeLabel: '工厂代码',
    nameLabel: '工厂名称',
    extraFields: [
      { key: 'baseYear', label: '基准年', type: 'number', precision: 0, width: 100 },
      { key: 'isCurrent', label: '是否当前', width: 90 }
    ]
  },
  {
    code: 'ef-electricity-factor',
    label: '202 电力因子',
    codeLabel: '行政区划代码',
    nameLabel: '行政区划名称',
    extraFields: [
      { key: 'factorVersion', label: '因子版本', width: 120 },
      { key: 'regionName', label: '区域名称', width: 120 },
      { key: 'provinceFactor', label: '省级因子', type: 'number', precision: 10, width: 120 },
      { key: 'regionFactor', label: '区域因子', type: 'number', precision: 10, width: 120 },
      { key: 'nationalFactor', label: '全国因子', type: 'number', precision: 10, width: 120 }
    ]
  },
  {
    code: 'ef-electricity-version',
    label: '203 电力因子版本',
    codeLabel: '因子版本',
    nameLabel: '因子版本',
    extraFields: [
      { key: 'effectiveYear', label: '生效年份', type: 'number', precision: 0, width: 100 }
    ]
  },
  {
    code: 'ef-electricity-scope',
    label: '205 电力因子口径',
    codeLabel: '口径编码',
    nameLabel: '口径名称',
    extraFields: []
  },
  {
    code: 'greenhouse-gas',
    label: '206 温室气体',
    codeLabel: '气体编码',
    nameLabel: '气体名称',
    extraFields: [
      { key: 'gasNameEn', label: '英文名称', width: 140 },
      { key: 'gwpValue', label: 'GWP值', type: 'number', precision: 6, width: 120 },
      { key: 'gwpVersion', label: 'GWP版本', width: 100 },
      { key: 'chemicalFormula', label: '化学式', width: 120 }
    ]
  }
];

const fieldTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '数值', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '选项', value: 'select' },
  { label: '是/否', value: 'boolean' }
];

const fieldTypeLabelMap = fieldTypeOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// ==================== State ====================

const activeTab = ref('admin-division');
const currentDim = computed(() => dimensionTabs.find((d) => d.code === activeTab.value) ?? dimensionTabs[0]);

// Data tab state
const dataLoading = ref(false);
const dataSubmitLoading = ref(false);
const dataList = ref<any[]>([]);
const dataTotal = ref(0);
const dataIds = ref<Array<string | number>>([]);
const dataMultiple = ref(true);
const dataFormRef = ref<FormInstance>();
const dataDrawer = reactive({ visible: false, title: '' });
const dataQuery = reactive({ dimensionCode: 'admin-division', pageNum: 1, pageSize: 20 });
const dataForm = reactive<Record<string, any>>({
  id: undefined,
  recordCode: '',
  recordName: '',
  parentCode: '',
  sortOrder: 0,
  status: '0',
  remark: ''
});

const dataRules: FormRules = {
  recordCode: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
  recordName: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
};

// Field tab state
const fieldTableCode = ref('admin-division');
const fieldLoading = ref(false);
const fieldSubmitLoading = ref(false);
const fieldList = ref<VendorTableFieldVO[]>([]);
const fieldIds = ref<Array<string | number>>([]);
const fieldMultiple = ref(true);
const fieldFormRef = ref<FormInstance>();
const fieldDrawer = reactive({ visible: false, title: '' });
const fieldForm = reactive<VendorTableFieldForm>({
  id: undefined,
  tableGroup: 'dimension',
  tableCode: 'admin-division',
  fieldKey: '',
  fieldLabel: '',
  fieldType: 'text',
  requiredFlag: false,
  sortOrder: 0,
  status: '0',
  remark: undefined
});

const fieldRules: FormRules<VendorTableFieldForm> = {
  fieldKey: [{ required: true, message: '字段编码不能为空', trigger: 'blur' }],
  fieldLabel: [{ required: true, message: '字段名称不能为空', trigger: 'blur' }],
  fieldType: [{ required: true, message: '字段类型不能为空', trigger: 'change' }]
};

// ==================== Data Tab Logic ====================

const handleTabChange = (tab: string | number) => {
  if (tab === '__fields__') {
    fieldTableCode.value = activeTab.value === '__fields__' ? 'admin-division' : activeTab.value;
    loadFieldList();
  } else {
    dataQuery.dimensionCode = tab as string;
    dataQuery.pageNum = 1;
    loadDataList();
  }
};

const loadDataList = async () => {
  dataLoading.value = true;
  try {
    const res = await listDimensionData(dataQuery);
    dataList.value = (res as any).rows ?? (res as any).data ?? [];
    dataTotal.value = (res as any).total ?? dataList.value.length;
  } finally {
    dataLoading.value = false;
  }
};

const handleDataSelectionChange = (selection: any[]) => {
  dataIds.value = selection.map((item) => item.id);
  dataMultiple.value = !selection.length;
};

const resetDataForm = () => {
  Object.assign(dataForm, {
    id: undefined,
    recordCode: '',
    recordName: '',
    parentCode: '',
    sortOrder: dataList.value.length + 1,
    status: '0',
    remark: ''
  });
  // Clear extra fields
  for (const field of currentDim.value.extraFields) {
    dataForm[field.key] = undefined;
  }
  dataFormRef.value?.clearValidate();
};

const handleDataAdd = () => {
  resetDataForm();
  dataDrawer.title = `新增${currentDim.value.label}`;
  dataDrawer.visible = true;
};

const handleDataEdit = async (row: any) => {
  resetDataForm();
  try {
    const res = await getDimensionData(activeTab.value, row.id);
    Object.assign(dataForm, res.data ?? row);
    dataForm.status = dataForm.status || '0';
    dataDrawer.title = `编辑${currentDim.value.label}`;
    dataDrawer.visible = true;
  } catch {
    // handled by interceptor
  }
};

const submitDataForm = async () => {
  const valid = await dataFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  dataSubmitLoading.value = true;
  try {
    const payload = { ...dataForm };
    if (payload.id) {
      await updateDimensionData(activeTab.value, payload);
      proxy?.$modal.msgSuccess('更新成功');
    } else {
      await addDimensionData(activeTab.value, payload);
      proxy?.$modal.msgSuccess('新增成功');
    }
    dataDrawer.visible = false;
    await loadDataList();
  } finally {
    dataSubmitLoading.value = false;
  }
};

const handleDataDelete = async (row?: any) => {
  try {
    const deleteIds = row?.id || dataIds.value;
    const message = row ? `确认删除"${row.recordName || row.recordCode}"？` : `确认删除选中的 ${dataIds.value.length} 条记录？`;
    await proxy?.$modal.confirm(message);
    await deleteDimensionData(activeTab.value, String(deleteIds));
    proxy?.$modal.msgSuccess('删除成功');
    await loadDataList();
  } catch {
    // cancelled or error
  }
};

// ==================== Field Tab Logic ====================

const loadFieldList = async () => {
  fieldLoading.value = true;
  try {
    const res = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'dimension', tableCode: fieldTableCode.value, params: {} });
    fieldList.value = readRows<VendorTableFieldVO>(res);
  } finally {
    fieldLoading.value = false;
  }
};

const handleFieldSelectionChange = (selection: VendorTableFieldVO[]) => {
  fieldIds.value = selection.map((item) => item.id);
  fieldMultiple.value = !selection.length;
};

const resetFieldForm = () => {
  Object.assign(fieldForm, {
    id: undefined,
    tableGroup: 'dimension',
    tableCode: fieldTableCode.value,
    fieldKey: '',
    fieldLabel: '',
    fieldType: 'text',
    requiredFlag: false,
    sortOrder: fieldList.value.length + 1,
    status: '0',
    remark: undefined
  });
  fieldFormRef.value?.clearValidate();
};

const handleFieldAdd = () => {
  resetFieldForm();
  fieldDrawer.title = '新增字段定义';
  fieldDrawer.visible = true;
};

const handleFieldEdit = async (row: VendorTableFieldVO) => {
  resetFieldForm();
  try {
    const res = await getVendorTableField(row.id);
    Object.assign(fieldForm, res.data ?? row);
    fieldForm.tableGroup = 'dimension';
    fieldForm.status = fieldForm.status || '0';
    fieldDrawer.title = '编辑字段定义';
    fieldDrawer.visible = true;
  } catch {
    // handled by interceptor
  }
};

const submitFieldForm = async () => {
  const valid = await fieldFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  fieldSubmitLoading.value = true;
  try {
    const payload = { ...fieldForm, tableGroup: 'dimension', tableCode: fieldTableCode.value };
    if (payload.id) {
      await updateVendorTableField(payload);
      proxy?.$modal.msgSuccess('字段已更新');
    } else {
      await addVendorTableField(payload);
      proxy?.$modal.msgSuccess('字段已新增');
    }
    fieldDrawer.visible = false;
    await loadFieldList();
  } finally {
    fieldSubmitLoading.value = false;
  }
};

const handleFieldDelete = async (row?: VendorTableFieldVO) => {
  try {
    const deleteIds = row?.id || fieldIds.value;
    const message = row ? `确认删除字段"${row.fieldLabel}"？` : `确认删除选中的 ${fieldIds.value.length} 个字段？`;
    await proxy?.$modal.confirm(message);
    await deleteVendorTableField(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await loadFieldList();
  } catch {
    // cancelled or error
  }
};

const initializeDefaultFields = async () => {
  const tableCode = fieldTableCode.value;
  const dim = dimensionTabs.find((d) => d.code === tableCode);
  if (!dim) return;

  const existingRes = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'dimension', tableCode, params: {} });
  const existingKeys = new Set(readRows<VendorTableFieldVO>(existingRes).map((item) => item.fieldKey));

  // Build default fields from dimension definition
  const defaults = [
    { fieldKey: 'record_code', fieldLabel: dim.codeLabel, requiredFlag: true },
    { fieldKey: 'record_name', fieldLabel: dim.nameLabel, requiredFlag: true },
    ...dim.extraFields.map((f) => ({
      fieldKey: f.key,
      fieldLabel: f.label,
      fieldType: f.type || 'text',
      fieldPrecision: f.type === 'number' ? (f.precision ?? 10) : undefined,
      fieldWidth: f.width,
      requiredFlag: false
    }))
  ];

  const fieldsToCreate = defaults.filter((f) => !existingKeys.has(f.fieldKey));
  if (!fieldsToCreate.length) {
    proxy?.$modal.msgWarning('当前维表字段已初始化');
    return;
  }
  await proxy?.$modal.confirm(`确认按维度定义初始化 ${fieldsToCreate.length} 个字段？`);
  fieldSubmitLoading.value = true;
  try {
    for (const [index, field] of fieldsToCreate.entries()) {
      await addVendorTableField({
        tableGroup: 'dimension',
        tableCode,
        fieldKey: field.fieldKey,
        fieldLabel: field.fieldLabel,
        fieldType: (field as any).fieldType || 'text',
        fieldPrecision: (field as any).fieldPrecision,
        fieldWidth: (field as any).fieldWidth,
        requiredFlag: field.requiredFlag === true,
        sortOrder: fieldList.value.length + index + 1,
        status: '0',
        remark: '按维度定义初始化'
      });
    }
    proxy?.$modal.msgSuccess('字段初始化完成');
    await loadFieldList();
  } finally {
    fieldSubmitLoading.value = false;
  }
};

const formatFieldType = (type?: string) => (type ? fieldTypeLabelMap[type] || type : '-');

// ==================== Init ====================

onMounted(() => {
  void loadDataList();
});

useAutoQuery(dataQuery, () => {
  dataQuery.pageNum = 1;
  loadDataList();
});
</script>

<style scoped lang="scss">
.dimension-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.field-type-select {
  width: 200px;
}

.w-full {
  width: 100%;
}
</style>
