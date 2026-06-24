<template>
  <div class="page-panel">
    <div class="page-head factor-record-head">
      <div>
        <h1>因子明细</h1>
        <p>管理厂商侧可同步给企业端的因子数据和字段定义。数据受因子版本与开放范围控制，字段定义控制录入展示。</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="factor-record-tabs" @tab-change="handleTabChange">
      <el-tab-pane v-for="table in factorTableOptions" :key="table.value" :label="table.label" :name="table.value">
        <div class="panel">
          <div class="toolbar">
            <div class="btns">
              <el-select
                v-model="recordQuery.versionId"
                placeholder="选择因子版本"
                class="version-select"
                clearable
                filterable
                @change="loadRecordList"
              >
                <el-option v-for="item in factorVersionOptions" :key="item.id" :label="factorVersionLabel(item)" :value="item.id" />
              </el-select>
              <el-button v-hasPermi="['vendor:factorRecord:add']" type="primary" plain icon="Plus" @click="handleRecordAdd">新增</el-button>
              <el-button
                v-hasPermi="['vendor:factorRecord:remove']"
                type="danger"
                plain
                icon="Delete"
                :disabled="recordMultiple"
                @click="handleRecordDelete()"
              >
                删除
              </el-button>
            </div>
            <span v-if="recordIds.length > 0" class="select-count">已选 {{ recordIds.length }} 项</span>
          </div>

          <el-table v-loading="recordLoading" :data="recordList" border @selection-change="handleRecordSelectionChange">
            <el-table-column type="selection" width="48" align="center" />
            <el-table-column label="因子编码" align="center" prop="factorCode" min-width="170" :show-overflow-tooltip="true" />
            <el-table-column label="因子名称" align="center" prop="factorName" min-width="220" :show-overflow-tooltip="true" />
            <el-table-column label="分类" align="center" prop="factorCategory" min-width="140" :show-overflow-tooltip="true" />
            <el-table-column label="数值" align="center" prop="factorValue" width="120">
              <template #default="{ row }">{{ formatText(row.factorValue) }}</template>
            </el-table-column>
            <el-table-column label="单位" align="center" prop="factorUnit" width="120" :show-overflow-tooltip="true" />
            <el-table-column
              v-for="field in currentRecordFields"
              :key="field.key"
              :label="field.label"
              align="center"
              :prop="field.key"
              :min-width="field.width ?? 140"
              :show-overflow-tooltip="true"
            >
              <template #default="{ row }">{{ formatText(recordFieldValue(row, field.key)) }}</template>
            </el-table-column>
            <el-table-column label="开放同步" align="center" prop="enabledFlag" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabledFlag === false ? 'info' : 'success'">{{ row.enabledFlag === false ? '停用' : '启用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="操作" align="center" width="170" fixed="right">
              <template #default="{ row }">
                <el-button v-hasPermi="['vendor:factorRecord:edit']" link type="primary" icon="Edit" @click="handleRecordEdit(row)">编辑</el-button>
                <el-button v-hasPermi="['vendor:factorRecord:remove']" link type="danger" icon="Delete" @click="handleRecordDelete(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="recordTotal > 0"
            v-model:page="recordQuery.pageNum"
            v-model:limit="recordQuery.pageSize"
            :total="recordTotal"
            @pagination="loadRecordList"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="字段定义" name="__fields__">
        <div class="panel">
          <div class="toolbar">
            <div class="btns">
              <el-select v-model="fieldQuery.tableCode" placeholder="选择因子表类型" class="field-type-select" @change="loadFieldList">
                <el-option v-for="item in factorTableOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-button v-hasPermi="['vendor:factorRecord:add']" type="primary" plain icon="Plus" @click="handleFieldAdd">新增字段</el-button>
              <el-button v-hasPermi="['vendor:factorRecord:add']" plain icon="DocumentAdd" @click="initializeDefaultFields">初始化样例字段</el-button>
              <el-button
                v-hasPermi="['vendor:factorRecord:remove']"
                type="danger"
                plain
                icon="Delete"
                :disabled="fieldMultiple"
                @click="handleFieldDelete()"
              >
                删除
              </el-button>
            </div>
            <span v-if="fieldIds.length > 0" class="select-count">已选 {{ fieldIds.length }} 项</span>
          </div>

          <el-table v-loading="fieldLoading" :data="fieldList" border @selection-change="handleFieldSelectionChange">
            <el-table-column type="selection" width="48" align="center" />
            <el-table-column label="因子表类型" align="center" prop="tableCode" min-width="190" :show-overflow-tooltip="true">
              <template #default="{ row }">{{ formatFactorTableLabel(row.tableCode) }}</template>
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
            <el-table-column label="备注" align="center" prop="remark" min-width="180" :show-overflow-tooltip="true" />
            <el-table-column label="操作" align="center" width="170" fixed="right">
              <template #default="{ row }">
                <el-button v-hasPermi="['vendor:factorRecord:edit']" link type="primary" icon="Edit" @click="handleFieldEdit(row)">编辑</el-button>
                <el-button v-hasPermi="['vendor:factorRecord:remove']" link type="danger" icon="Delete" @click="handleFieldDelete(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-drawer v-model="recordDrawer.visible" :title="recordDrawer.title" size="680px" append-to-body>
      <el-form ref="recordFormRef" :model="recordForm" :rules="recordRules" label-width="140px">
        <el-form-item label="因子版本" prop="versionId">
          <el-select v-model="recordForm.versionId" placeholder="请选择因子版本" class="w-full" filterable>
            <el-option v-for="item in factorVersionOptions" :key="item.id" :label="factorVersionLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="因子编码" prop="factorCode">
          <el-input v-model="recordForm.factorCode" placeholder="请输入因子编码" maxlength="128" />
        </el-form-item>
        <el-form-item label="因子名称" prop="factorName">
          <el-input v-model="recordForm.factorName" placeholder="请输入因子名称" maxlength="255" />
        </el-form-item>
        <el-form-item label="分类" prop="factorCategory">
          <el-input v-model="recordForm.factorCategory" placeholder="请输入分类" maxlength="128" />
        </el-form-item>
        <el-form-item label="数值" prop="factorValue">
          <el-input-number v-model="recordForm.factorValue" :precision="10" class="w-full" />
        </el-form-item>
        <el-form-item label="单位" prop="factorUnit">
          <el-input v-model="recordForm.factorUnit" placeholder="请输入单位" maxlength="64" />
        </el-form-item>
        <el-form-item v-for="field in currentRecordFields" :key="field.key" :label="field.label">
          <el-input-number v-if="field.type === 'number'" v-model="recordForm[field.key]" :precision="field.precision ?? 10" class="w-full" />
          <el-input-number v-else-if="field.type === 'integer'" v-model="recordForm[field.key]" :precision="0" class="w-full" />
          <el-input v-else v-model="recordForm[field.key]" :placeholder="`请输入${field.label}`" />
        </el-form-item>
        <el-form-item label="开放同步" prop="enabledFlag">
          <el-switch v-model="recordForm.enabledFlag" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="recordForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDrawer.visible = false">取消</el-button>
        <el-button type="primary" :loading="recordSubmitLoading" @click="submitRecordForm">确定</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="fieldDrawer.visible" :title="fieldDrawer.title" size="620px" append-to-body>
      <el-form ref="fieldFormRef" :model="fieldForm" :rules="fieldRules" label-width="120px">
        <el-form-item label="因子表类型" prop="tableCode">
          <el-select v-model="fieldForm.tableCode" placeholder="请选择因子表类型" class="w-full" filterable>
            <el-option v-for="item in factorTableOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段编码" prop="fieldKey">
          <el-input v-model="fieldForm.fieldKey" placeholder="请输入字段编码，如 factorKey" maxlength="128" />
        </el-form-item>
        <el-form-item label="字段名称" prop="fieldLabel">
          <el-input v-model="fieldForm.fieldLabel" placeholder="请输入字段名称" maxlength="255" />
        </el-form-item>
        <el-form-item label="字段类型" prop="fieldType">
          <el-select v-model="fieldForm.fieldType" placeholder="请选择字段类型" class="w-full">
            <el-option v-for="item in fieldTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="精度" prop="fieldPrecision">
          <el-input-number v-model="fieldForm.fieldPrecision" :min="0" :max="10" :precision="0" class="w-full" />
        </el-form-item>
        <el-form-item label="列宽" prop="fieldWidth">
          <el-input-number v-model="fieldForm.fieldWidth" :min="80" :max="500" :precision="0" class="w-full" />
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

<script setup name="VendorFactorRecord" lang="ts">
import { type FormInstance, type FormRules } from 'element-plus';
import { computed, getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { addFactorRecord, deleteFactorRecord, getFactorRecord, listFactorRecord, updateFactorRecord } from '@/api/vendor/factorRecord';
import type { FactorRecordForm, FactorRecordQuery, FactorRecordVO } from '@/api/vendor/factorRecord/types';
import { listFactorVersion } from '@/api/vendor/factorVersion';
import type { FactorVersionVO } from '@/api/vendor/factorVersion/types';
import {
  addVendorTableField,
  deleteVendorTableField,
  getVendorTableField,
  listVendorTableField,
  updateVendorTableField
} from '@/api/vendor/tableField';
import type { VendorTableFieldForm, VendorTableFieldVO } from '@/api/vendor/tableField/types';
import { formatText, readRows, readTotal } from '../shared';

type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';
type RecordFieldType = 'text' | 'number' | 'integer' | 'date' | 'boolean';

interface DefaultField {
  fieldKey: string;
  fieldLabel: string;
  fieldType?: FieldType;
  fieldPrecision?: number;
  fieldWidth?: number;
  requiredFlag?: boolean;
}

interface RecordExtraField {
  key: keyof FactorRecordVO | string;
  label: string;
  type?: RecordFieldType;
  precision?: number;
  width?: number;
  custom?: boolean;
}

interface FactorTableOption {
  label: string;
  value: string;
  category: string;
  unit: string;
  extraFields: RecordExtraField[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const factorTableOptions: FactorTableOption[] = [
  {
    label: '202 EF电力因子维度表',
    value: '202ef',
    category: '电力因子',
    unit: 'kgCO2/kWh',
    extraFields: [
      { key: 'versionProvinceCode', label: 'PK_因子版本省份代码', width: 190 },
      { key: 'factorVersion', label: '因子版本', width: 140 },
      { key: 'divisionCode', label: '行政区划代码', width: 150 },
      { key: 'divisionName', label: '行政区划', width: 150 },
      { key: 'regionName', label: '区域划分', width: 150 },
      { key: 'provinceFactor', label: '省级因子', type: 'number', width: 130 },
      { key: 'regionFactor', label: '区域因子', type: 'number', width: 130 },
      { key: 'nationalFactor', label: '全国因子', type: 'number', width: 130 },
      { key: 'nonFossilExcludedFactor', label: '不含市场化非化石因子', type: 'number', width: 210 },
      { key: 'nationalFossilPowerFactor', label: '全国化石能源电力因子', type: 'number', width: 210 }
    ]
  },
  {
    label: '203 EF电力因子版本对应',
    value: '203ef',
    category: '电力因子版本',
    unit: 'year',
    extraFields: [
      { key: 'factorKey', label: '年份', width: 120 },
      { key: 'factorVersion', label: '对应因子版本', width: 180 }
    ]
  },
  {
    label: '205 EF电力因子口径维度',
    value: '205ef',
    category: '电力因子口径',
    unit: 'kgCO2/kWh',
    extraFields: [
      { key: 'factorKey', label: '因子口径Key', width: 160 },
      { key: 'sourceRef', label: '来源引用', width: 160 }
    ]
  },
  {
    label: '206 温室气体维度',
    value: '206',
    category: '温室气体',
    unit: 'GWP',
    extraFields: [
      { key: 'factorKey', label: 'GasKey', width: 140 },
      { key: 'emissionSourceNameEn', label: '英文名称', width: 180 },
      { key: 'gwpValue', label: 'GWP值', type: 'number', width: 120 },
      { key: 'sourceRef', label: '来源引用', width: 160 }
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

const factorTableLabelMap = factorTableOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});
const fieldTypeLabelMap = fieldTypeOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const defaultFields: Record<string, DefaultField[]> = {
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
  '205ef': [
    { fieldKey: 'factorKey', fieldLabel: '因子口径Key', fieldWidth: 160, requiredFlag: true },
    { fieldKey: 'factorName', fieldLabel: '因子口径', fieldWidth: 180 }
  ],
  '206': [
    { fieldKey: 'factorKey', fieldLabel: 'GasKey', fieldWidth: 140, requiredFlag: true },
    { fieldKey: 'factorName', fieldLabel: '气体', fieldWidth: 140 }
  ]
};

const activeTab = ref('202ef');
const factorVersionOptions = ref<FactorVersionVO[]>([]);
const currentTable = computed(() => factorTableOptions.find((item) => item.value === activeTab.value) ?? factorTableOptions[0]);
const tableFieldDefinitions = ref<Record<string, VendorTableFieldVO[]>>({});
const currentRecordFields = computed<RecordExtraField[]>(() => {
  const definitions = tableFieldDefinitions.value[activeTab.value]?.filter((field) => field.status !== '1') ?? [];
  if (!definitions.length) {
    return currentTable.value.extraFields;
  }
  const definitionsByKey = definitions.reduce<Record<string, VendorTableFieldVO>>((map, field) => {
    map[field.fieldKey] = field;
    return map;
  }, {});
  const configuredDefaults = currentTable.value.extraFields.map((field) => {
    const definition = definitionsByKey[String(field.key)];
    if (!definition) {
      return field;
    }
    return {
      ...field,
      label: definition.fieldLabel,
      type: toRecordFieldType(definition.fieldType),
      precision: definition.fieldPrecision,
      width: definition.fieldWidth ?? field.width
    };
  });
  const customFields = definitions
    .filter((field) => !baseRecordFieldKeys.has(field.fieldKey))
    .filter((field) => !knownRecordFieldKeys.has(field.fieldKey))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((field) => ({
      key: field.fieldKey,
      label: field.fieldLabel,
      type: toRecordFieldType(field.fieldType),
      precision: field.fieldPrecision,
      width: field.fieldWidth,
      custom: !knownRecordFieldKeys.has(field.fieldKey)
    }));
  return [...configuredDefaults, ...customFields];
});

const recordLoading = ref(false);
const recordSubmitLoading = ref(false);
const recordList = ref<FactorRecordVO[]>([]);
const recordTotal = ref(0);
const recordIds = ref<Array<string | number>>([]);
const recordMultiple = ref(true);
const recordFormRef = ref<FormInstance>();
const recordDrawer = reactive({ visible: false, title: '' });
const recordQuery = reactive<FactorRecordQuery>({
  pageNum: 1,
  pageSize: 20,
  factorTableCode: '202ef',
  versionId: undefined,
  enabledFlag: undefined,
  params: {}
});
const recordForm = reactive<FactorRecordForm & Record<string, any>>({
  id: undefined,
  versionId: undefined,
  factorTableCode: '202ef',
  factorCode: '',
  factorName: '',
  factorCategory: '电力因子',
  factorValue: 0,
  factorUnit: 'kgCO2/kWh',
  enabledFlag: true,
  remark: undefined
});

const recordRules: FormRules<FactorRecordForm> = {
  versionId: [{ required: true, message: '因子版本不能为空', trigger: 'change' }],
  factorCode: [{ required: true, message: '因子编码不能为空', trigger: 'blur' }],
  factorName: [{ required: true, message: '因子名称不能为空', trigger: 'blur' }],
  factorCategory: [{ required: true, message: '分类不能为空', trigger: 'blur' }],
  factorValue: [{ required: true, message: '数值不能为空', trigger: 'blur' }],
  factorUnit: [{ required: true, message: '单位不能为空', trigger: 'blur' }]
};

const fieldLoading = ref(false);
const fieldSubmitLoading = ref(false);
const fieldList = ref<VendorTableFieldVO[]>([]);
const fieldIds = ref<Array<string | number>>([]);
const fieldMultiple = ref(true);
const fieldFormRef = ref<FormInstance>();
const fieldDrawer = reactive({ visible: false, title: '' });
const fieldQuery = reactive({ tableGroup: 'factor', tableCode: '202ef' });
const fieldForm = reactive<VendorTableFieldForm>({
  id: undefined,
  tableGroup: 'factor',
  tableCode: '202ef',
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

const fieldRules: FormRules<VendorTableFieldForm> = {
  tableCode: [{ required: true, message: '因子表类型不能为空', trigger: 'change' }],
  fieldKey: [{ required: true, message: '字段编码不能为空', trigger: 'blur' }],
  fieldLabel: [{ required: true, message: '字段名称不能为空', trigger: 'blur' }],
  fieldType: [{ required: true, message: '字段类型不能为空', trigger: 'change' }]
};

const activeDefaultFields = computed(() => defaultFields[fieldQuery.tableCode || '202ef'] ?? []);
const factorVersionLabel = (item: FactorVersionVO) => `${item.versionName || item.versionCode || item.id}`;
const formatFactorTableLabel = (code?: string) => (code ? factorTableLabelMap[code] || code : '-');
const formatFieldType = (type?: string) => (type ? fieldTypeLabelMap[type] || type : '-');
const baseRecordFieldKeys = new Set(['factorCode', 'factorName', 'factorCategory', 'factorValue', 'factorUnit']);
const knownRecordFieldKeys = new Set<string>([
  ...baseRecordFieldKeys,
  'id',
  'versionId',
  'factorTableCode',
  'factorKey',
  'emissionSourceName',
  'emissionSourceNameEn',
  'fuelMaterialCategory',
  'sourceUnit',
  'co2',
  'ch4',
  'n2o',
  'hfcs',
  'pfcs',
  'sf6',
  'nf3',
  'applicableScope',
  'factorSource',
  'gwpCh4',
  'gwpN2o',
  'gwpHfcs',
  'gwpPfcs',
  'gwpSf6',
  'gwpNf3',
  'factorGwp',
  'versionProvinceCode',
  'factorVersion',
  'divisionCode',
  'divisionName',
  'regionName',
  'provinceFactor',
  'regionFactor',
  'nationalFactor',
  'nonFossilExcludedFactor',
  'nationalFossilPowerFactor',
  'rowNo',
  'fuelLevel1',
  'fuelLevel2',
  'fuelLevel3',
  'fuelLevel4',
  'lowerHeatValue',
  'lowerHeatValueCv',
  'co2Factor',
  'co2FactorCv',
  'gwpValue',
  'convertedFactor',
  'sourceRef',
  'enabledFlag',
  'remark',
  'customFields'
]);

const toRecordFieldType = (fieldType?: string): RecordFieldType => {
  if (fieldType === 'number') return 'number';
  if (fieldType === 'boolean') return 'boolean';
  if (fieldType === 'date') return 'date';
  return 'text';
};

const parseCustomFields = (value?: string | Record<string, any>) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const recordFieldValue = (row: FactorRecordVO, fieldKey: string) => {
  if (Object.prototype.hasOwnProperty.call(row, fieldKey) && row[fieldKey] !== undefined && row[fieldKey] !== null) {
    return row[fieldKey];
  }
  return parseCustomFields(row.customFields)[fieldKey];
};

const loadOptions = async () => {
  const res = await listFactorVersion({ pageNum: 1, pageSize: 200, params: {} });
  factorVersionOptions.value = readRows<FactorVersionVO>(res);
  if (!recordQuery.versionId && factorVersionOptions.value.length > 0) {
    recordQuery.versionId = factorVersionOptions.value[0].id;
  }
};

const loadRecordFieldDefinitions = async (tableCode = activeTab.value) => {
  const res = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'factor', tableCode, status: '0', params: {} });
  tableFieldDefinitions.value = {
    ...tableFieldDefinitions.value,
    [tableCode]: readRows<VendorTableFieldVO>(res)
  };
};

const handleTabChange = (tab: string | number) => {
  if (tab === '__fields__') {
    fieldQuery.tableCode = recordQuery.factorTableCode || '202ef';
    void loadFieldList();
    return;
  }
  recordQuery.factorTableCode = tab as string;
  recordQuery.pageNum = 1;
  void loadRecordFieldDefinitions(tab as string);
  void loadRecordList();
};

const loadRecordList = async () => {
  recordLoading.value = true;
  try {
    const res = await listFactorRecord(recordQuery);
    recordList.value = readRows<FactorRecordVO>(res);
    recordTotal.value = readTotal(res, recordList.value);
  } finally {
    recordLoading.value = false;
  }
};

const handleRecordSelectionChange = (selection: FactorRecordVO[]) => {
  recordIds.value = selection.map((item) => item.id);
  recordMultiple.value = !selection.length;
};

const resetRecordForm = () => {
  const table = currentTable.value;
  Object.assign(recordForm, {
    id: undefined,
    versionId: recordQuery.versionId,
    factorTableCode: table.value,
    factorCode: '',
    factorName: '',
    factorCategory: table.category,
    factorValue: 0,
    factorUnit: table.unit,
    factorKey: '',
    enabledFlag: true,
    remark: undefined
  });
  for (const field of table.extraFields) {
    recordForm[field.key] = undefined;
  }
  for (const field of currentRecordFields.value) {
    recordForm[field.key] = undefined;
  }
  recordForm.customFields = undefined;
  recordFormRef.value?.clearValidate();
};

const handleRecordAdd = () => {
  resetRecordForm();
  recordDrawer.title = `新增${currentTable.value.label}`;
  recordDrawer.visible = true;
};

const handleRecordEdit = async (row: FactorRecordVO) => {
  resetRecordForm();
  try {
    const res = await getFactorRecord(row.id);
    Object.assign(recordForm, res.data ?? row);
    const customFields = parseCustomFields(recordForm.customFields);
    for (const field of currentRecordFields.value) {
      if (field.custom) {
        recordForm[field.key] = customFields[field.key];
      }
    }
    recordForm.factorTableCode = currentTable.value.value;
    recordForm.enabledFlag = recordForm.enabledFlag !== false;
    recordDrawer.title = `编辑${currentTable.value.label}`;
    recordDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  }
};

const submitRecordForm = async () => {
  const valid = await recordFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  recordSubmitLoading.value = true;
  try {
    const customFields: Record<string, any> = {};
    const payload = { ...recordForm, factorTableCode: currentTable.value.value };
    for (const field of currentRecordFields.value) {
      if (field.custom) {
        const value = payload[field.key];
        if (value !== undefined && value !== null && value !== '') {
          customFields[field.key] = value;
        }
        delete payload[field.key];
      }
    }
    payload.customFields = Object.keys(customFields).length ? JSON.stringify(customFields) : undefined;
    if (payload.id) {
      await updateFactorRecord(payload);
      proxy?.$modal.msgSuccess('因子数据已更新');
    } else {
      await addFactorRecord(payload);
      proxy?.$modal.msgSuccess('因子数据已新增');
    }
    recordDrawer.visible = false;
    await loadRecordList();
  } finally {
    recordSubmitLoading.value = false;
  }
};

const handleRecordDelete = async (row?: FactorRecordVO) => {
  try {
    const deleteIds = row?.id || recordIds.value;
    const message = row ? `确认删除因子“${row.factorName}”？` : `确认删除选中的 ${recordIds.value.length} 条因子数据？`;
    await proxy?.$modal.confirm(message);
    await deleteFactorRecord(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await loadRecordList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
};

const loadFieldList = async () => {
  fieldLoading.value = true;
  try {
    const res = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'factor', tableCode: fieldQuery.tableCode, params: {} });
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
    tableGroup: 'factor',
    tableCode: fieldQuery.tableCode,
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
  fieldFormRef.value?.clearValidate();
};

const handleFieldAdd = () => {
  resetFieldForm();
  fieldDrawer.title = '新增因子字段';
  fieldDrawer.visible = true;
};

const handleFieldEdit = async (row: VendorTableFieldVO) => {
  resetFieldForm();
  try {
    const res = await getVendorTableField(row.id);
    Object.assign(fieldForm, res.data ?? row);
    fieldForm.tableGroup = 'factor';
    fieldForm.status = fieldForm.status || '0';
    fieldForm.requiredFlag = fieldForm.requiredFlag === true;
    fieldDrawer.title = '编辑因子字段';
    fieldDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  }
};

const submitFieldForm = async () => {
  const valid = await fieldFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  fieldSubmitLoading.value = true;
  try {
    const payload = { ...fieldForm, tableGroup: 'factor' };
    if (payload.id) {
      await updateVendorTableField(payload);
      proxy?.$modal.msgSuccess('因子字段已更新');
    } else {
      await addVendorTableField(payload);
      proxy?.$modal.msgSuccess('因子字段已新增');
    }
    fieldDrawer.visible = false;
    await loadFieldList();
    if (payload.tableCode) {
      await loadRecordFieldDefinitions(payload.tableCode);
    }
  } finally {
    fieldSubmitLoading.value = false;
  }
};

const handleFieldDelete = async (row?: VendorTableFieldVO) => {
  try {
    const deleteIds = row?.id || fieldIds.value;
    const message = row ? `确认删除字段“${row.fieldLabel}”？` : `确认删除选中的 ${fieldIds.value.length} 个字段？`;
    await proxy?.$modal.confirm(message);
    await deleteVendorTableField(deleteIds);
    proxy?.$modal.msgSuccess('删除成功');
    await loadFieldList();
    if (fieldQuery.tableCode) {
      await loadRecordFieldDefinitions(fieldQuery.tableCode);
    }
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
};

const initializeDefaultFields = async () => {
  const tableCode = fieldQuery.tableCode || '202ef';
  const existingRes = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'factor', tableCode, params: {} });
  const existingKeys = new Set(readRows<VendorTableFieldVO>(existingRes).map((item) => item.fieldKey));
  const fieldsToCreate = activeDefaultFields.value.filter((field) => !existingKeys.has(field.fieldKey));
  if (!fieldsToCreate.length) {
    proxy?.$modal.msgWarning('当前因子表字段已初始化');
    return;
  }
  await proxy?.$modal.confirm(`确认按客户样例初始化 ${fieldsToCreate.length} 个字段？`);
  fieldSubmitLoading.value = true;
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
    await loadFieldList();
    await loadRecordFieldDefinitions(tableCode);
  } finally {
    fieldSubmitLoading.value = false;
  }
};

onMounted(async () => {
  await loadOptions();
  await loadRecordFieldDefinitions();
  await loadRecordList();
});
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

.version-select,
.field-type-select {
  width: 260px;
}

.w-full {
  width: 100%;
}
</style>
