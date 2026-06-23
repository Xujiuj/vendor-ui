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
          <label>因子表类型</label>
          <el-select v-model="queryParams.tableCode" placeholder="请选择因子表类型" clearable filterable>
            <el-option v-for="item in factorTableOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-button v-hasPermi="['vendor:factorRecord:add']" type="primary" plain icon="Plus" @click="handleAdd">新增字段</el-button>
          <el-button v-hasPermi="['vendor:factorRecord:add']" plain icon="DocumentAdd" @click="initializeDefaultFields">初始化样例字段</el-button>
          <el-button v-hasPermi="['vendor:factorRecord:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
        </div>
        <span v-if="ids.length > 0" class="select-count">已选 {{ ids.length }} 项</span>
      </div>

      <el-table v-loading="loading" :data="fieldList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="因子表类型" align="center" prop="tableCode" min-width="190" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatFactorTableLabel(row.tableCode) }}
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="因子表类型" prop="tableCode">
          <el-select v-model="form.tableCode" placeholder="请选择因子表类型" class="w-full" filterable>
            <el-option v-for="item in factorTableOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段编码" prop="fieldKey">
          <el-input v-model="form.fieldKey" placeholder="请输入字段编码，如 factorKey" maxlength="128" />
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

    <el-drawer v-model="detailDrawer.visible" title="因子字段详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="因子表类型">{{ formatFactorTableLabel(detailRecord.tableCode) }}</el-descriptions-item>
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

<script setup name="VendorFactorRecord" lang="ts">
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

const factorTableOptions = [
  { label: '201 EF排放因子维度表', value: '201ef' },
  { label: '202 EF电力因子维度表', value: '202ef' },
  { label: '203 EF电力因子版本对应', value: '203ef' },
  { label: '204 EF燃料因子计算', value: '204ef' },
  { label: '205 EF电力因子口径维度', value: '205ef' },
  { label: '206 温室气体维度', value: '206' }
];

const fieldTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '数值', value: 'number' },
  { label: '日期', value: 'date' },
  { label: '选项', value: 'select' },
  { label: '是/否', value: 'boolean' }
];

const factorTableLabelMap = factorTableOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});
const fieldTypeLabelMap = fieldTypeOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const defaultFields: Record<string, DefaultField[]> = {
  '201ef': [
    { fieldKey: 'factorKey', fieldLabel: 'SK_排放因子', fieldWidth: 160, requiredFlag: true },
    { fieldKey: 'emissionSourceName', fieldLabel: '排放源', fieldWidth: 170 },
    { fieldKey: 'emissionSourceNameEn', fieldLabel: '排放源_EN', fieldWidth: 170 },
    { fieldKey: 'fuelMaterialCategory', fieldLabel: '燃料/物质类别', fieldWidth: 170 },
    { fieldKey: 'sourceUnit', fieldLabel: '排放源单位', fieldWidth: 140 },
    { fieldKey: 'co2', fieldLabel: 'CO2', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'ch4', fieldLabel: 'CH4', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'n2o', fieldLabel: 'N2O', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'hfcs', fieldLabel: 'HFCs', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'pfcs', fieldLabel: 'PFCs', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'sf6', fieldLabel: 'SF6', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'nf3', fieldLabel: 'NF3', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'applicableScope', fieldLabel: '适用范围', fieldWidth: 160 },
    { fieldKey: 'factorSource', fieldLabel: '因子来源', fieldWidth: 180 },
    { fieldKey: 'gwpCh4', fieldLabel: 'GWP_CH4', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'gwpN2o', fieldLabel: 'GWP_N2O', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'gwpHfcs', fieldLabel: 'GWP_HFCs', fieldType: 'number', fieldWidth: 130 },
    { fieldKey: 'gwpPfcs', fieldLabel: 'GWP_PFCs', fieldType: 'number', fieldWidth: 130 },
    { fieldKey: 'gwpSf6', fieldLabel: 'GWP_SF6', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'gwpNf3', fieldLabel: 'GWP_NF3', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'factorGwp', fieldLabel: '因子GWP', fieldType: 'number', fieldWidth: 120 },
    { fieldKey: 'factorUnit', fieldLabel: '因子单位', fieldWidth: 130 }
  ],
  '202ef': [
    { fieldKey: 'versionProvinceCode', fieldLabel: 'PK_因子版本省份代码', fieldWidth: 190, requiredFlag: true },
    { fieldKey: 'factorVersion', fieldLabel: '因子版本', fieldWidth: 140 },
    { fieldKey: 'divisionCode', fieldLabel: '行政区划代码', fieldWidth: 150 },
    { fieldKey: 'divisionName', fieldLabel: '行政区划', fieldWidth: 150 },
    { fieldKey: 'regionName', fieldLabel: '区域划分', fieldWidth: 150 },
    { fieldKey: 'provinceFactor', fieldLabel: '省级因子（kgCO2/kWh)', fieldType: 'number', fieldWidth: 190 },
    { fieldKey: 'regionFactor', fieldLabel: '区域因子（kgCO2/kWh)', fieldType: 'number', fieldWidth: 190 },
    { fieldKey: 'nationalFactor', fieldLabel: '全国因子（kgCO2/kWh）', fieldType: 'number', fieldWidth: 190 },
    { fieldKey: 'nonFossilExcludedFactor', fieldLabel: '不包括市场化交易的非化石能源电量因子（kgCO2/kWh）', fieldType: 'number', fieldWidth: 360 },
    { fieldKey: 'nationalFossilPowerFactor', fieldLabel: '全国化石能源电力二氧化碳排放因子（kgCO2/kWh）', fieldType: 'number', fieldWidth: 360 }
  ],
  '203ef': [
    { fieldKey: 'factorKey', fieldLabel: '年份', fieldWidth: 120, requiredFlag: true },
    { fieldKey: 'factorVersion', fieldLabel: '对应因子版本', fieldWidth: 180 }
  ],
  '204ef': [
    { fieldKey: 'fuelLevel1', fieldLabel: '一类', fieldWidth: 140 },
    { fieldKey: 'fuelLevel2', fieldLabel: '二类', fieldWidth: 140 },
    { fieldKey: 'fuelLevel3', fieldLabel: '三类', fieldWidth: 140 },
    { fieldKey: 'fuelLevel4', fieldLabel: '四类', fieldWidth: 140 },
    { fieldKey: 'lowerHeatValue', fieldLabel: '低位发热量 (TJ/10^8 Nm3)', fieldType: 'number', fieldWidth: 220 },
    { fieldKey: 'lowerHeatValueCv', fieldLabel: '低位发热量变异系数（%）', fieldType: 'number', fieldWidth: 210 },
    { fieldKey: 'co2Factor', fieldLabel: '因子 (tCO2/TJ)', fieldType: 'number', fieldWidth: 170 },
    { fieldKey: 'co2FactorCv', fieldLabel: '因子变异系数（%）', fieldType: 'number', fieldWidth: 180 },
    { fieldKey: 'gwpValue', fieldLabel: 'GWP', fieldType: 'number', fieldWidth: 110 },
    { fieldKey: 'convertedFactor', fieldLabel: '因子（转换）', fieldType: 'number', fieldWidth: 150 },
    { fieldKey: 'factorUnit', fieldLabel: '因子单位', fieldWidth: 150 },
    { fieldKey: 'factorSource', fieldLabel: '因子来源', fieldWidth: 180 },
    { fieldKey: 'remark', fieldLabel: '备注', fieldWidth: 180 }
  ],
  '205ef': [
    { fieldKey: 'factorKey', fieldLabel: '因子口径Key', fieldWidth: 160, requiredFlag: true },
    { fieldKey: 'factorName', fieldLabel: '因子口径', fieldWidth: 180 }
  ],
  '206': [
    { fieldKey: 'factorKey', fieldLabel: 'GasKey', fieldWidth: 140, requiredFlag: true },
    { fieldKey: 'factorName', fieldLabel: '气体', fieldWidth: 140 }
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
  tableGroup: 'factor',
  tableCode: '201ef',
  fieldKey: undefined,
  fieldLabel: undefined,
  fieldType: undefined,
  status: undefined,
  params: {}
});

const form = reactive<VendorTableFieldForm>({
  id: undefined,
  tableGroup: 'factor',
  tableCode: '201ef',
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
  tableCode: [{ required: true, message: '因子表类型不能为空', trigger: 'change' }],
  fieldKey: [{ required: true, message: '字段编码不能为空', trigger: 'blur' }],
  fieldLabel: [{ required: true, message: '字段名称不能为空', trigger: 'blur' }],
  fieldType: [{ required: true, message: '字段类型不能为空', trigger: 'change' }]
};

const activeDefaultFields = computed(() => defaultFields[queryParams.tableCode || '201ef'] ?? []);
const formatFactorTableLabel = (code?: string) => (code ? factorTableLabelMap[code] || code : '-');
const formatFieldType = (type?: string) => (type ? fieldTypeLabelMap[type] || type : '-');

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    tableGroup: 'factor',
    tableCode: queryParams.tableCode || '201ef',
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
    queryParams.tableGroup = 'factor';
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
  formDrawer.title = '新增因子字段';
  formDrawer.visible = true;
};

const handleUpdate = async (row: VendorTableFieldVO) => { 
  resetForm(); 
  try { 
    const res = await getVendorTableField(row.id);
    Object.assign(form, res.data ?? row);
    form.tableGroup = 'factor';
    form.status = form.status || '0';
    form.requiredFlag = form.requiredFlag === true;
    formDrawer.title = '编辑因子字段';
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
    const payload = { ...form, tableGroup: 'factor' };
    if (payload.id) {
      await updateVendorTableField(payload);
      proxy?.$modal.msgSuccess('因子字段已更新');
    } else {
      await addVendorTableField(payload);
      proxy?.$modal.msgSuccess('因子字段已新增');
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
  const tableCode = queryParams.tableCode || '201ef';
  const existingRes = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'factor', tableCode, params: {} });
  const existingKeys = new Set(readRows<VendorTableFieldVO>(existingRes).map((item) => item.fieldKey));
  const fieldsToCreate = activeDefaultFields.value.filter((field) => !existingKeys.has(field.fieldKey));
  if (!fieldsToCreate.length) {
    proxy?.$modal.msgWarning('当前因子表字段已初始化');
    return;
  }
  await proxy?.$modal.confirm(`确认按客户样例初始化 ${fieldsToCreate.length} 个字段？`);
  submitLoading.value = true;
  try {
    for (const [index, field] of fieldsToCreate.entries()) {
      await addVendorTableField({
        tableGroup: 'factor',
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
.factor-record-head {
  align-items: flex-start;
  gap: 16px;
}

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
