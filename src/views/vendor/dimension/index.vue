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
            <el-table-column :label="dim.codeLabel" align="center" min-width="150" :show-overflow-tooltip="true">
              <template #default="{ row }">{{ formatDimensionValue(row, dim.codeKey) }}</template>
            </el-table-column>
            <el-table-column :label="dim.nameLabel" align="center" min-width="200" :show-overflow-tooltip="true">
              <template #default="{ row }">{{ formatDimensionValue(row, dim.nameKey) }}</template>
            </el-table-column>
            <el-table-column v-if="dim.showParent" label="上级编码" align="center" prop="parentCode" min-width="120" :show-overflow-tooltip="true" />
            <el-table-column
              v-for="field in currentDataFields"
              :key="field.key"
              :label="field.label"
              align="center"
              :prop="field.key"
              :min-width="field.width ?? 140"
              :show-overflow-tooltip="true"
            >
              <template #default="{ row }">{{ formatDimensionField(row, field) }}</template>
            </el-table-column>
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
              <el-button v-hasPermi="['vendor:dimension:remove']" type="danger" plain icon="Delete" :disabled="fieldMultiple" @click="handleFieldDelete()">
                删除
              </el-button>
            </div>
            <span v-if="fieldIds.length > 0" class="select-count">已选 {{ fieldIds.length }} 项</span>
          </div>

          <el-table v-loading="fieldLoading" :data="fieldList" border @selection-change="handleFieldSelectionChange">
            <el-table-column type="selection" width="48" align="center" />
            <el-table-column label="数据库字段名" align="center" prop="fieldKey" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="字段名称 / Comment" align="center" prop="fieldLabel" min-width="220" :show-overflow-tooltip="true" />
            <el-table-column label="数据库类型" align="center" prop="columnType" min-width="150" :show-overflow-tooltip="true" />
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
        <el-form-item v-if="currentDim.nameKey !== currentDim.codeKey" :label="currentDim.nameLabel" prop="recordName">
          <el-input-number
            v-if="currentDim.nameType === 'number'"
            v-model="dataForm.recordName"
            :precision="currentDim.namePrecision ?? 0"
            :min="currentDim.nameMin"
            :max="currentDim.nameMax"
            class="w-full"
          />
          <el-input v-else v-model="dataForm.recordName" :placeholder="`请输入${currentDim.nameLabel}`" maxlength="255" />
        </el-form-item>
        <el-form-item v-if="currentDim.showParent" label="上级编码" prop="parentCode">
          <el-input v-model="dataForm.parentCode" placeholder="请输入上级编码" maxlength="128" />
        </el-form-item>
        <el-form-item v-for="field in currentDataFields" :key="field.key" :label="field.label">
          <el-input-number v-if="field.type === 'number'" v-model="dataForm[field.key]" :precision="field.precision ?? 0" class="w-full" />
          <el-date-picker v-else-if="field.type === 'date'" v-model="dataForm[field.key]" type="date" value-format="YYYY-MM-DD" class="w-full" />
          <el-switch
            v-else-if="field.type === 'boolean'"
            v-model="dataForm[field.key]"
            :active-value="field.trueValue ?? true"
            :inactive-value="field.falseValue ?? false"
            active-text="是"
            inactive-text="否"
          />
          <el-select v-else-if="field.type === 'select'" v-model="dataForm[field.key]" :placeholder="`请选择${field.label}`" class="w-full" clearable>
            <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
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
          <el-input v-model="fieldForm.fieldKey" placeholder="数据库真实字段名，如 custom_level" maxlength="63" :disabled="Boolean(fieldForm.id)" />
        </el-form-item>
        <el-form-item label="字段名称" prop="fieldLabel">
          <el-input v-model="fieldForm.fieldLabel" placeholder="请输入字段名称" maxlength="255" />
        </el-form-item>
        <el-form-item label="字段类型" prop="fieldType">
          <el-select v-model="fieldForm.fieldType" placeholder="请选择字段类型" class="w-full" :disabled="Boolean(fieldForm.id)">
            <el-option v-for="item in fieldTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="fieldForm.fieldType === 'select'" label="选项" prop="fieldOptions">
          <div class="option-editor">
            <div v-for="(option, index) in fieldOptionRows" :key="index" class="option-row">
              <el-input v-model="option.label" placeholder="显示名称" maxlength="64" />
              <el-input v-model="option.value" placeholder="存储值" maxlength="64" />
              <el-button link type="danger" icon="Delete" @click="removeFieldOption(index)">删除</el-button>
            </div>
            <el-button type="primary" plain icon="Plus" @click="addFieldOption">新增选项</el-button>
          </div>
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
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import { addVendorTableField, deleteVendorTableField, getVendorTableField, listVendorTableField, updateVendorTableField } from '@/api/vendor/tableField';
import type { VendorTableFieldForm, VendorTableFieldVO } from '@/api/vendor/tableField/types';
import { addDimensionData, deleteDimensionData, getDimensionData, listDimensionData, updateDimensionData } from '@/api/vendor/dimensionData';
import type { DimensionDataRecord } from '@/api/vendor/dimensionData';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatText, readRows } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// ==================== Dimension Tab Definitions ====================

interface ExtraField {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select';
  precision?: number;
  trueValue?: string | number | boolean;
  falseValue?: string | number | boolean;
  options?: Array<{ label: string; value: string | number | boolean }>;
  width?: number;
}

interface FieldOption {
  label: string;
  value: string | number | boolean;
}

interface DimensionTab {
  code: string;
  label: string;
  codeKey: string;
  codeLabel: string;
  nameKey: string;
  nameLabel: string;
  nameType?: 'text' | 'number';
  namePrecision?: number;
  nameMin?: number;
  nameMax?: number;
  showParent?: boolean;
  extraFields: ExtraField[];
}

const dimensionTabs: DimensionTab[] = [
  {
    code: 'admin-division',
    label: '101 行政区划',
    codeKey: 'divisionCode',
    codeLabel: '行政区划代码',
    nameKey: 'divisionName',
    nameLabel: '行政区划名称',
    showParent: true,
    extraFields: [
      { key: 'levelType', label: '层级类型', width: 100 }
    ]
  },
  {
    code: 'emission-source-category',
    label: '103 排放源分类',
    codeKey: 'categoryCode',
    codeLabel: '分类编码',
    nameKey: 'categoryName',
    nameLabel: '分类名称',
    showParent: true,
    extraFields: [
      { key: 'businessKey', label: '业务Key', width: 140 },
      { key: 'categoryNameEn', label: '英文名称', width: 160 },
      { key: 'ghgScope', label: 'GHG范围', width: 120 },
      { key: 'ghgScopeCategory', label: 'GHG范围分类', width: 180 },
      { key: 'isoCategory', label: 'ISO分类', width: 120 },
      { key: 'isoCategoryEn', label: 'ISO英文分类', width: 140 },
      { key: 'isoCategoryDescription', label: 'ISO分类说明', width: 220 },
      { key: 'gbScopeCategory', label: '国标范围分类', width: 160 },
      { key: 'gbSubcategory', label: '国标子分类', width: 160 },
      { key: 'effectiveDate', label: '生效日期', type: 'date', width: 120 },
      { key: 'expireDate', label: '失效日期', type: 'date', width: 120 },
      {
        key: 'currentFlag',
        label: '当前版本',
        type: 'select',
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' }
        ],
        width: 100
      },
      { key: 'versionNo', label: '版本号', width: 100 },
      { key: 'standardCategory', label: '标准分类', width: 160 }
    ]
  },
  {
    code: 'base-year',
    label: '106 基准年',
    codeKey: 'baseYearKey',
    codeLabel: '基准年Key',
    nameKey: 'baseYear',
    nameLabel: '基准年',
    nameType: 'number',
    namePrecision: 0,
    nameMin: 1900,
    nameMax: 9999,
    extraFields: [
      { key: 'isCurrent', label: '当前基准年', type: 'boolean', trueValue: 1, falseValue: 0, width: 110 },
      { key: 'description', label: '说明', width: 220 }
    ]
  },
  {
    code: 'ef-electricity-factor',
    label: '202 电力因子',
    codeKey: 'divisionCode',
    codeLabel: '行政区划代码',
    nameKey: 'divisionName',
    nameLabel: '行政区划名称',
    extraFields: [
      { key: 'factorVersion', label: '因子版本', width: 120 },
      { key: 'regionName', label: '区域名称', width: 120 },
      { key: 'provinceFactor', label: '省级因子', type: 'number', precision: 10, width: 120 },
      { key: 'regionFactor', label: '区域因子', type: 'number', precision: 10, width: 120 },
      { key: 'nationalFactor', label: '全国因子', type: 'number', precision: 10, width: 120 },
      { key: 'nonFossilExcludedFactor', label: '扣除非化石因子', type: 'number', precision: 10, width: 150 },
      { key: 'nationalFossilPowerFactor', label: '全国火电因子', type: 'number', precision: 10, width: 140 }
    ]
  },
  {
    code: 'ef-electricity-version',
    label: '203 电力因子版本',
    codeKey: 'factorVersion',
    codeLabel: '因子版本',
    nameKey: 'factorVersion',
    nameLabel: '因子版本',
    extraFields: [
      { key: 'effectiveYear', label: '生效年份', type: 'number', precision: 0, width: 100 }
    ]
  },
  {
    code: 'ef-electricity-scope',
    label: '205 电力因子口径',
    codeKey: 'scopeKey',
    codeLabel: '口径编码',
    nameKey: 'scopeName',
    nameLabel: '口径名称',
    extraFields: []
  },
  {
    code: 'greenhouse-gas',
    label: '206 温室气体',
    codeKey: 'gasCode',
    codeLabel: '气体编码',
    nameKey: 'gasName',
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
  { label: '日期时间', value: 'datetime' },
  { label: '选项', value: 'select' },
  { label: '是/否', value: 'boolean' }
];

const systemDataFields = new Set([
  'id',
  'sortOrder',
  'status',
  'createDept',
  'createBy',
  'createTime',
  'updateBy',
  'updateTime',
  'remark',
  'dimensionCode'
]);

const toCamelCase = (value: string) => value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const fieldTypeLabelMap = fieldTypeOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// ==================== State ====================

const activeTab = ref('admin-division');
const currentDim = computed(() => dimensionTabs.find((d) => d.code === activeTab.value) ?? dimensionTabs[0]);
const currentDataFields = computed<ExtraField[]>(() => {
  const fields = dataFieldMap.value[currentDim.value.code];
  return fields?.length ? fields : currentDim.value.extraFields;
});

// Data tab state
const dataLoading = ref(false);
const dataSubmitLoading = ref(false);
const dataList = ref<DimensionDataRecord[]>([]);
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
const dataFieldMap = ref<Record<string, ExtraField[]>>({});

const dataRules: FormRules = {
  recordCode: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
  recordName: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
};

const formatDimensionValue = (row: DimensionDataRecord, key: string) => formatText(row[key] ?? row.recordCode ?? row.recordName);

const normalizeBooleanValue = (value: unknown, field: ExtraField) => {
  if (value === true || value === 1 || value === '1' || value === 'Y') return field.trueValue ?? true;
  if (value === false || value === 0 || value === '0' || value === 'N') return field.falseValue ?? false;
  return field.falseValue ?? false;
};

const parseFieldOptions = (value?: string): FieldOption[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        label: String(item?.label ?? item?.value ?? ''),
        value: item?.value ?? item?.label ?? ''
      }))
      .filter((item) => item.label && item.value !== '');
  } catch {
    return [];
  }
};

const toExtraField = (field: VendorTableFieldVO): ExtraField | undefined => {
  const key = toCamelCase(field.fieldKey);
  if (!key || systemDataFields.has(key) || key === currentDim.value.codeKey || key === currentDim.value.nameKey || key === 'parentCode') {
    return undefined;
  }
  return {
    key,
    label: field.fieldLabel || field.columnComment || key,
    type: (field.fieldType as ExtraField['type']) || 'text',
    precision: field.fieldPrecision,
    options: parseFieldOptions(field.fieldOptions),
    width: field.fieldWidth ?? 140
  };
};

const formatDimensionField = (row: DimensionDataRecord, field: ExtraField) => {
  const value = row[field.key];
  if (field.type === 'boolean') {
    const trueValue = field.trueValue ?? true;
    const falseValue = field.falseValue ?? false;
    if (value === trueValue || value === true || value === 1 || value === '1' || value === 'Y') return '是';
    if (value === falseValue || value === false || value === 0 || value === '0' || value === 'N') return '否';
  }
  if (field.type === 'select' && field.options?.length) {
    return field.options.find((option) => option.value === value)?.label ?? formatText(value);
  }
  return formatText(value);
};

const syncRecordFields = (target: Record<string, any>, dim: DimensionTab) => {
  target.recordCode = target.recordCode ?? target[dim.codeKey] ?? '';
  target.recordName = target.recordName ?? target[dim.nameKey] ?? target[dim.codeKey] ?? '';
  target[dim.codeKey] = target.recordCode;
  target[dim.nameKey] = target.recordName;

  if (dim.code === 'base-year') {
    target.baseYearKey = target.recordCode;
    target.baseYear = Number(target.recordName);
    target.description = target.description ?? target.remark ?? '';
  }

  const dynamicFields = dataFieldMap.value[dim.code] ?? dim.extraFields;
  for (const field of dynamicFields) {
    if (field.type === 'boolean') {
      target[field.key] = normalizeBooleanValue(target[field.key], field);
    }
  }
};

const normalizeDataForm = (source?: Record<string, any>) => {
  const dim = currentDim.value;
  const merged = { ...(source ?? {}) };
  merged.recordCode = merged.recordCode ?? merged[dim.codeKey] ?? '';
  merged.recordName = merged.recordName ?? merged[dim.nameKey] ?? merged.recordCode ?? '';
  if (dim.code === 'base-year') {
    merged.recordCode = merged.baseYearKey ?? merged.recordCode ?? '';
    merged.recordName = merged.baseYear ?? merged.recordName ?? '';
    merged.isCurrent = merged.isCurrent ?? 1;
  }
  const dynamicFields = dataFieldMap.value[dim.code] ?? dim.extraFields;
  for (const field of dynamicFields) {
    if (field.type === 'boolean') {
      merged[field.key] = normalizeBooleanValue(merged[field.key], field);
    }
  }
  Object.assign(dataForm, merged);
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
const fieldOptionRows = ref<FieldOption[]>([]);

const fieldRules: FormRules<VendorTableFieldForm> = {
  fieldKey: [
    { required: true, message: '字段编码不能为空', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]{1,62}$/, message: '仅支持小写字母、数字、下划线，且以字母开头', trigger: 'blur' }
  ],
  fieldLabel: [{ required: true, message: '字段名称不能为空', trigger: 'blur' }],
  fieldType: [{ required: true, message: '字段类型不能为空', trigger: 'change' }],
  fieldOptions: [
    {
      validator: (_rule, _value, callback) => {
        if (fieldForm.fieldType !== 'select') {
          callback();
          return;
        }
        const validOptions = normalizedFieldOptions();
        if (!validOptions.length) {
          callback(new Error('选项字段必须填写选项'));
          return;
        }
        callback();
      },
      trigger: 'change'
    }
  ]
};

// ==================== Data Tab Logic ====================

const handleTabChange = (tab: string | number) => {
  if (tab === '__fields__') {
    fieldTableCode.value = activeTab.value === '__fields__' ? 'admin-division' : activeTab.value;
    loadFieldList();
  } else {
    dataQuery.dimensionCode = tab as string;
    dataQuery.pageNum = 1;
    loadDataFieldsAndList(tab as string);
  }
};

const loadDataFields = async (dimensionCode = currentDim.value.code) => {
  const res = await listVendorTableField({ pageNum: 1, pageSize: 500, tableGroup: 'dimension', tableCode: dimensionCode, params: {} });
  const fields = readRows<VendorTableFieldVO>(res).map(toExtraField).filter((field): field is ExtraField => Boolean(field));
  dataFieldMap.value = { ...dataFieldMap.value, [dimensionCode]: fields };
};

const loadDataFieldsAndList = async (dimensionCode = currentDim.value.code) => {
  await loadDataFields(dimensionCode);
  await loadDataList();
};

const loadDataList = async () => {
  dataLoading.value = true;
  try {
    const res = await listDimensionData(dataQuery);
    dataList.value = readRows<DimensionDataRecord>(res);
    dataTotal.value = (res as any).total ?? dataList.value.length;
  } finally {
    dataLoading.value = false;
  }
};

const handleDataSelectionChange = (selection: DimensionDataRecord[]) => {
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
  dataForm[currentDim.value.codeKey] = '';
  dataForm[currentDim.value.nameKey] = '';
  // Clear extra fields
  for (const field of currentDataFields.value) {
    dataForm[field.key] = field.type === 'boolean' ? (field.falseValue ?? false) : undefined;
  }
  if (currentDim.value.code === 'base-year') {
    dataForm.isCurrent = 1;
  }
  dataFormRef.value?.clearValidate();
};

const handleDataAdd = () => {
  resetDataForm();
  dataDrawer.title = `新增${currentDim.value.label}`;
  dataDrawer.visible = true;
};

const handleDataEdit = async (row: DimensionDataRecord) => {
  resetDataForm();
  try {
    const res = await getDimensionData(activeTab.value, row.id);
    normalizeDataForm(res.data ?? row);
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
    syncRecordFields(payload, currentDim.value);
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

const handleDataDelete = async (row?: DimensionDataRecord) => {
  try {
    const deleteIds = row?.id || dataIds.value;
    const recordLabel = row ? `${formatDimensionValue(row, currentDim.value.codeKey)} ${formatDimensionValue(row, currentDim.value.nameKey)}`.trim() : '';
    const message = row ? `确认删除"${recordLabel}"？` : `确认删除选中的 ${dataIds.value.length} 条记录？`;
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
    dataFieldMap.value = {
      ...dataFieldMap.value,
      [fieldTableCode.value]: fieldList.value.map(toExtraField).filter((field): field is ExtraField => Boolean(field))
    };
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
  fieldOptionRows.value = [];
  fieldFormRef.value?.clearValidate();
};

const handleFieldAdd = () => {
  resetFieldForm();
  fieldDrawer.title = '新增字段定义';
  fieldDrawer.visible = true;
};

const handleFieldEdit = async (row: VendorTableFieldVO) => {
  resetFieldForm();
  if (!row.id) {
    Object.assign(fieldForm, row);
    fieldForm.tableGroup = 'dimension';
    fieldForm.tableCode = fieldTableCode.value;
    fieldForm.status = fieldForm.status || '0';
    fieldOptionRows.value = parseFieldOptions(fieldForm.fieldOptions);
    fieldDrawer.title = '编辑字段定义';
    fieldDrawer.visible = true;
    return;
  }
  try {
    const res = await getVendorTableField(row.id);
    Object.assign(fieldForm, res.data ?? row);
    fieldForm.tableGroup = 'dimension';
    fieldForm.status = fieldForm.status || '0';
    fieldOptionRows.value = parseFieldOptions(fieldForm.fieldOptions);
    fieldDrawer.title = '编辑字段定义';
    fieldDrawer.visible = true;
  } catch {
    // handled by interceptor
  }
};

const normalizedFieldOptions = () =>
  fieldOptionRows.value
    .map((option) => ({
      label: String(option.label ?? '').trim(),
      value: String(option.value ?? '').trim()
    }))
    .filter((option) => option.label && option.value);

const addFieldOption = () => {
  fieldOptionRows.value.push({ label: '', value: '' });
};

const removeFieldOption = (index: number) => {
  fieldOptionRows.value.splice(index, 1);
};

const submitFieldForm = async () => {
  const valid = await fieldFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  fieldSubmitLoading.value = true;
  try {
    const payload = {
      ...fieldForm,
      tableGroup: 'dimension',
      tableCode: fieldTableCode.value,
      fieldOptions: fieldForm.fieldType === 'select' ? JSON.stringify(normalizedFieldOptions()) : undefined
    };
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

const formatFieldType = (type?: string) => (type ? fieldTypeLabelMap[type] || type : '-');

watch(
  () => fieldForm.fieldType,
  (fieldType) => {
    if (fieldType === 'select' && fieldOptionRows.value.length === 0) {
      addFieldOption();
    }
  }
);

// ==================== Init ====================

onMounted(() => {
  void loadDataFieldsAndList();
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

.option-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.option-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 56px;
  gap: 8px;
  align-items: center;
}
</style>
