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
          <el-select v-model="queryParams.factorTableCode" placeholder="请选择因子表类型" clearable filterable>
            <el-option v-for="item in factorTableOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
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
          <label>样例主键</label>
          <el-input v-model="queryParams.factorKey" placeholder="请输入样例主键" clearable @keyup.enter="handleQuery" />
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
        <el-table-column label="因子表类型" align="center" prop="factorTableCode" min-width="170" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatFactorTableLabel(row.factorTableCode) }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="column in activeColumns"
          :key="column.prop"
          :label="column.label"
          align="center"
          :prop="column.prop"
          :min-width="column.width || 140"
          :show-overflow-tooltip="true"
        />
        <el-table-column label="状态" align="center" prop="enabledFlag" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabledFlag === false ? 'info' : 'success'">{{ row.enabledFlag === false ? '停用' : '启用' }}</el-tag>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="版本ID" prop="versionId">
          <el-input v-model="form.versionId" placeholder="请输入版本ID" />
        </el-form-item>
        <el-form-item label="因子表类型" prop="factorTableCode">
          <el-select v-model="form.factorTableCode" placeholder="请选择因子表类型" class="w-full" filterable>
            <el-option v-for="item in factorTableOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-for="column in formColumns" :key="column.prop" :label="column.label" :prop="column.prop">
          <el-input-number
            v-if="column.type === 'number'"
            v-model="form[column.prop]"
            :precision="column.precision ?? 10"
            :controls="false"
            class="w-full"
            :placeholder="`请输入${column.label}`"
          />
          <el-input v-else v-model="form[column.prop]" :placeholder="`请输入${column.label}`" maxlength="255" />
        </el-form-item>
        <el-form-item label="状态" prop="enabledFlag">
          <el-switch v-model="form.enabledFlag" active-text="启用" inactive-text="停用" />
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

    <el-drawer v-model="detailDrawer.visible" title="因子明细详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="版本ID">{{ formatText(detailRecord.versionId) }}</el-descriptions-item>
        <el-descriptions-item label="因子表类型">{{ formatFactorTableLabel(detailRecord.factorTableCode) }}</el-descriptions-item>
        <el-descriptions-item v-for="column in detailColumns" :key="column.prop" :label="column.label">
          {{ formatText(detailRecord[column.prop]) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailRecord.enabledFlag === false ? '停用' : '启用' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatText(detailRecord.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorFactorRecord" lang="ts">
import { type FormInstance, type FormRules } from 'element-plus';
import { addFactorRecord, deleteFactorRecord, getFactorRecord, listFactorRecord, updateFactorRecord } from '@/api/vendor/factorRecord';
import type { FactorRecordForm, FactorRecordQuery, FactorRecordVO } from '@/api/vendor/factorRecord/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

type FactorColumnType = 'text' | 'number';

interface FactorColumn {
  prop: keyof FactorRecordForm & string;
  label: string;
  type?: FactorColumnType;
  width?: number;
  precision?: number;
}

const factorTableOptions = [
  { label: '201 EF排放因子维度表', value: '201ef' },
  { label: '202 EF电力因子维度表', value: '202ef' },
  { label: '203 EF电力因子版本对应', value: '203ef' },
  { label: '204 EF燃料因子计算', value: '204ef' },
  { label: '205 EF电力因子口径维度', value: '205ef' },
  { label: '206 温室气体维度', value: '206' }
];

const factorTableLabelMap = factorTableOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const factorColumns: Record<string, FactorColumn[]> = {
  '201ef': [
    { prop: 'factorKey', label: 'SK_排放因子', width: 160 },
    { prop: 'emissionSourceName', label: '排放源', width: 170 },
    { prop: 'emissionSourceNameEn', label: '排放源_EN', width: 170 },
    { prop: 'fuelMaterialCategory', label: '燃料/物质类别', width: 170 },
    { prop: 'sourceUnit', label: '排放源单位', width: 140 },
    { prop: 'co2', label: 'CO2', type: 'number', width: 120 },
    { prop: 'ch4', label: 'CH4', type: 'number', width: 120 },
    { prop: 'n2o', label: 'N2O', type: 'number', width: 120 },
    { prop: 'hfcs', label: 'HFCs', type: 'number', width: 120 },
    { prop: 'pfcs', label: 'PFCs', type: 'number', width: 120 },
    { prop: 'sf6', label: 'SF6', type: 'number', width: 120 },
    { prop: 'nf3', label: 'NF3', type: 'number', width: 120 },
    { prop: 'applicableScope', label: '适用范围', width: 160 },
    { prop: 'factorSource', label: '因子来源', width: 180 },
    { prop: 'gwpCh4', label: 'GWP_CH4', type: 'number', width: 120 },
    { prop: 'gwpN2o', label: 'GWP_N2O', type: 'number', width: 120 },
    { prop: 'gwpHfcs', label: 'GWP_HFCs', type: 'number', width: 130 },
    { prop: 'gwpPfcs', label: 'GWP_PFCs', type: 'number', width: 130 },
    { prop: 'gwpSf6', label: 'GWP_SF6', type: 'number', width: 120 },
    { prop: 'gwpNf3', label: 'GWP_NF3', type: 'number', width: 120 },
    { prop: 'factorGwp', label: '因子GWP', type: 'number', width: 120 },
    { prop: 'factorUnit', label: '因子单位', width: 130 }
  ],
  '202ef': [
    { prop: 'versionProvinceCode', label: 'PK_因子版本省份代码', width: 190 },
    { prop: 'factorVersion', label: '因子版本', width: 140 },
    { prop: 'divisionCode', label: '行政区划代码', width: 150 },
    { prop: 'divisionName', label: '行政区划', width: 150 },
    { prop: 'regionName', label: '区域划分', width: 150 },
    { prop: 'provinceFactor', label: '省级因子（kgCO2/kWh)', type: 'number', width: 190 },
    { prop: 'regionFactor', label: '区域因子（kgCO2/kWh)', type: 'number', width: 190 },
    { prop: 'nationalFactor', label: '全国因子（kgCO2/kWh）', type: 'number', width: 190 },
    { prop: 'nonFossilExcludedFactor', label: '不包括市场化交易的非化石能源电量因子（kgCO2/kWh）', type: 'number', width: 360 },
    { prop: 'nationalFossilPowerFactor', label: '全国化石能源电力二氧化碳排放因子（kgCO2/kWh）', type: 'number', width: 360 }
  ],
  '203ef': [
    { prop: 'factorKey', label: '年份', width: 120 },
    { prop: 'factorVersion', label: '对应因子版本', width: 180 }
  ],
  '204ef': [
    { prop: 'rowNo', label: '序号', type: 'number', width: 90, precision: 0 },
    { prop: 'fuelLevel1', label: '一类', width: 140 },
    { prop: 'fuelLevel2', label: '二类', width: 140 },
    { prop: 'fuelLevel3', label: '三类', width: 140 },
    { prop: 'fuelLevel4', label: '四类', width: 140 },
    { prop: 'lowerHeatValue', label: '低位发热量 (TJ/10^8 Nm3)', type: 'number', width: 220 },
    { prop: 'lowerHeatValueCv', label: '低位发热量变异系数（%）', type: 'number', width: 210 },
    { prop: 'co2Factor', label: '因子 (tCO2/TJ)', type: 'number', width: 170 },
    { prop: 'co2FactorCv', label: '因子变异系数（%）', type: 'number', width: 180 },
    { prop: 'gwpValue', label: 'GWP', type: 'number', width: 110 },
    { prop: 'convertedFactor', label: '因子（转换）', type: 'number', width: 150 },
    { prop: 'factorUnit', label: '因子单位', width: 150 },
    { prop: 'factorSource', label: '因子来源', width: 180 },
    { prop: 'remark', label: '备注', width: 180 }
  ],
  '205ef': [
    { prop: 'factorKey', label: '因子口径Key', width: 160 },
    { prop: 'factorName', label: '因子口径', width: 180 }
  ],
  '206': [
    { prop: 'factorKey', label: 'GasKey', width: 140 },
    { prop: 'factorName', label: '气体', width: 140 },
    { prop: 'rowNo', label: '排序', type: 'number', width: 100, precision: 0 }
  ]
};

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
  factorTableCode: '201ef',
  versionId: undefined,
  factorCode: undefined,
  factorName: undefined,
  factorKey: undefined,
  emissionSourceName: undefined,
  factorVersion: undefined,
  enabledFlag: undefined,
  params: {}
});

const form = reactive<FactorRecordForm>({
  id: undefined,
  versionId: undefined,
  factorTableCode: '201ef',
  factorCode: '',
  factorName: '',
  factorCategory: '',
  factorValue: undefined,
  factorUnit: '',
  factorKey: undefined,
  emissionSourceName: undefined,
  emissionSourceNameEn: undefined,
  fuelMaterialCategory: undefined,
  sourceUnit: undefined,
  co2: undefined,
  ch4: undefined,
  n2o: undefined,
  hfcs: undefined,
  pfcs: undefined,
  sf6: undefined,
  nf3: undefined,
  applicableScope: undefined,
  factorSource: undefined,
  gwpCh4: undefined,
  gwpN2o: undefined,
  gwpHfcs: undefined,
  gwpPfcs: undefined,
  gwpSf6: undefined,
  gwpNf3: undefined,
  factorGwp: undefined,
  versionProvinceCode: undefined,
  factorVersion: undefined,
  divisionCode: undefined,
  divisionName: undefined,
  regionName: undefined,
  provinceFactor: undefined,
  regionFactor: undefined,
  nationalFactor: undefined,
  nonFossilExcludedFactor: undefined,
  nationalFossilPowerFactor: undefined,
  rowNo: undefined,
  fuelLevel1: undefined,
  fuelLevel2: undefined,
  fuelLevel3: undefined,
  fuelLevel4: undefined,
  lowerHeatValue: undefined,
  lowerHeatValueCv: undefined,
  co2Factor: undefined,
  co2FactorCv: undefined,
  gwpValue: undefined,
  convertedFactor: undefined,
  sourceRef: '',
  enabledFlag: true,
  remark: undefined
});

const rules: FormRules<FactorRecordForm> = {
  versionId: [{ required: true, message: '版本ID不能为空', trigger: 'blur' }],
  factorTableCode: [{ required: true, message: '因子表类型不能为空', trigger: 'change' }]
};

const activeColumns = computed(() => factorColumns[queryParams.factorTableCode || '201ef'] ?? factorColumns['201ef']);
const formColumns = computed(() => factorColumns[form.factorTableCode || '201ef'] ?? factorColumns['201ef']);
const detailColumns = computed(() => factorColumns[detailRecord.value?.factorTableCode || '201ef'] ?? factorColumns['201ef']);
const formatFactorTableLabel = (code?: string) => (code ? factorTableLabelMap[code] || code : '-');

const resetForm = () => {
  form.id = undefined;
  form.versionId = undefined;
  form.factorTableCode = queryParams.factorTableCode || '201ef';
  form.factorCode = '';
  form.factorName = '';
  form.factorCategory = '';
  form.factorValue = undefined;
  form.factorUnit = '';
  form.factorKey = undefined;
  form.emissionSourceName = undefined;
  form.emissionSourceNameEn = undefined;
  form.fuelMaterialCategory = undefined;
  form.sourceUnit = undefined;
  form.co2 = undefined;
  form.ch4 = undefined;
  form.n2o = undefined;
  form.hfcs = undefined;
  form.pfcs = undefined;
  form.sf6 = undefined;
  form.nf3 = undefined;
  form.applicableScope = undefined;
  form.factorSource = undefined;
  form.gwpCh4 = undefined;
  form.gwpN2o = undefined;
  form.gwpHfcs = undefined;
  form.gwpPfcs = undefined;
  form.gwpSf6 = undefined;
  form.gwpNf3 = undefined;
  form.factorGwp = undefined;
  form.versionProvinceCode = undefined;
  form.factorVersion = undefined;
  form.divisionCode = undefined;
  form.divisionName = undefined;
  form.regionName = undefined;
  form.provinceFactor = undefined;
  form.regionFactor = undefined;
  form.nationalFactor = undefined;
  form.nonFossilExcludedFactor = undefined;
  form.nationalFossilPowerFactor = undefined;
  form.rowNo = undefined;
  form.fuelLevel1 = undefined;
  form.fuelLevel2 = undefined;
  form.fuelLevel3 = undefined;
  form.fuelLevel4 = undefined;
  form.lowerHeatValue = undefined;
  form.lowerHeatValueCv = undefined;
  form.co2Factor = undefined;
  form.co2FactorCv = undefined;
  form.gwpValue = undefined;
  form.convertedFactor = undefined;
  form.sourceRef = '';
  form.enabledFlag = true;
  form.remark = undefined;
  formRef.value?.clearValidate();
};

const normalizeFactorPayload = (payload: FactorRecordForm) => {
  const code =
    payload.factorCode ||
    payload.factorKey ||
    payload.versionProvinceCode ||
    payload.factorVersion ||
    payload.fuelLevel4 ||
    payload.fuelLevel3 ||
    payload.fuelLevel2 ||
    payload.fuelLevel1 ||
    'UNKNOWN';
  const name =
    payload.factorName ||
    payload.emissionSourceName ||
    payload.divisionName ||
    payload.fuelLevel4 ||
    payload.fuelLevel3 ||
    payload.fuelLevel2 ||
    payload.fuelLevel1 ||
    code;
  return {
    ...payload,
    factorCode: code,
    factorName: name,
    factorCategory: payload.factorCategory || payload.factorTableCode || '201ef',
    factorValue:
      payload.factorValue ??
      payload.factorGwp ??
      payload.provinceFactor ??
      payload.regionFactor ??
      payload.nationalFactor ??
      payload.convertedFactor ??
      payload.co2Factor ??
      payload.co2 ??
      0,
    factorUnit: payload.factorUnit || payload.sourceUnit || 'kgCO2e',
    sourceRef: payload.sourceRef || payload.factorSource,
    enabledFlag: payload.enabledFlag !== false
  };
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
  queryParams.factorTableCode = '201ef';
  queryParams.versionId = undefined;
  queryParams.factorCode = undefined;
  queryParams.factorName = undefined;
  queryParams.factorKey = undefined;
  queryParams.emissionSourceName = undefined;
  queryParams.factorVersion = undefined;
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
    Object.assign(form, data);
    form.factorTableCode = data.factorTableCode || '201ef';
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
    const payload = normalizeFactorPayload({ ...form });
    if (form.id) {
      await updateFactorRecord(payload);
      proxy?.$modal.msgSuccess('因子明细已更新');
    } else {
      await addFactorRecord(payload);
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
