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
          <el-button v-hasPermi="['vendor:dimension:edit']" icon="Grid" @click="openSheetDrawer">在线填报</el-button>
          <el-button v-hasPermi="['vendor:dimension:edit']" icon="Download" @click="downloadDimensionTemplate">下载模板</el-button>
          <el-button v-hasPermi="['vendor:dimension:edit']" icon="Upload" @click="openUploadDialog">Excel 上传</el-button>
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

    <el-drawer v-model="sheetDrawer.visible" title="维表在线填报" size="92%" append-to-body destroy-on-close>
      <SpreadsheetEditor
        title="维表管理"
        :columns="sheetColumns"
        :rows="sheetRows"
        :empty-row="sheetEmptyRow"
        :saving="sheetSaving"
        hint="支持从 Excel 复制多行粘贴。维表类型、记录编码、记录名称和状态必填，保存时按行调用真实后端接口。"
        @save="saveSheetRows"
      />
    </el-drawer>

    <el-dialog v-model="uploadDialog.visible" title="维表 Excel 上传" width="720px" append-to-body destroy-on-close v-loading="uploadParsing">
      <el-upload drag action="#" accept=".xlsx" :auto-upload="false" :show-file-list="false" :before-upload="parseDimensionUploadFile">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽 Excel 文件到此处，或点击选择 `.xlsx` 文件</div>
      </el-upload>
      <el-alert class="mt-4" type="info" show-icon :closable="false">
        <template #title>请使用“下载模板”生成的表头上传；维表类型、记录编码、记录名称和状态必填。</template>
      </el-alert>
      <template #footer>
        <el-button @click="uploadDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VendorDimension" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules, type UploadRawFile } from 'element-plus';
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
import { downloadXlsxTemplate } from '@/utils/xlsxTemplate';
import SpreadsheetEditor from '@/components/SpreadsheetEditor/index.vue';
import type { SpreadsheetColumn } from '@/components/SpreadsheetEditor/types';

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

interface ZipEntry {
  path: string;
  method: number;
  compressed: Uint8Array;
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
const sheetDrawer = reactive({ visible: false });
const uploadDialog = reactive({ visible: false });
const sheetSaving = ref(false);
const uploadParsing = ref(false);

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
const sheetFields = computed(() => fieldConfig[queryParams.dimensionCode || ''] ?? fieldConfig['admin-division']);
const sheetColumns = computed<SpreadsheetColumn[]>(() => [
  {
    prop: 'dimensionCode',
    label: '维表类型',
    type: 'select',
    required: true,
    width: 190,
    options: dimensionOptions
  },
  { prop: 'recordCode', label: '记录编码', required: true, width: 170 },
  { prop: 'recordName', label: '记录名称', required: true, width: 190 },
  { prop: 'parentCode', label: '上级编码', width: 150 },
  ...sheetFields.value.map<SpreadsheetColumn>((field) => ({
    prop: field.prop,
    label: field.label,
    width: 150
  })),
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    required: true,
    width: 120,
    options: [
      { label: '启用', value: '0' },
      { label: '停用', value: '1' }
    ]
  },
  { prop: 'sortOrder', label: '排序', type: 'number', width: 110, min: 0, precision: 0 },
  { prop: 'remark', label: '备注', width: 220 }
]);
const sheetRows = computed(() =>
  recordList.value.map((row) => ({
    id: row.id,
    dimensionCode: row.dimensionCode || queryParams.dimensionCode,
    recordCode: row.recordCode,
    recordName: row.recordName,
    parentCode: row.parentCode,
    field01: row.field01,
    field02: row.field02,
    field03: row.field03,
    field04: row.field04,
    field05: row.field05,
    field06: row.field06,
    field07: row.field07,
    field08: row.field08,
    field09: row.field09,
    field10: row.field10,
    field11: row.field11,
    field12: row.field12,
    field13: row.field13,
    field14: row.field14,
    field15: row.field15,
    field16: row.field16,
    field17: row.field17,
    field18: row.field18,
    field19: row.field19,
    field20: row.field20,
    field21: row.field21,
    field22: row.field22,
    status: row.status || '0',
    sortOrder: row.sortOrder ?? 0,
    remark: row.remark
  }))
);
const sheetEmptyRow = computed(() => ({
  dimensionCode: queryParams.dimensionCode || 'admin-division',
  recordCode: undefined,
  recordName: undefined,
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
  status: '0',
  sortOrder: 0,
  remark: undefined
}));

const rules: FormRules<DimensionRecordForm> = {
  dimensionCode: [{ required: true, message: '维表类型不能为空', trigger: 'change' }],
  recordCode: [{ required: true, message: '记录编码不能为空', trigger: 'blur' }],
  recordName: [{ required: true, message: '记录名称不能为空', trigger: 'blur' }]
};

const formatDimensionLabel = (dimensionCode?: string) => (dimensionCode ? dimensionLabelMap[dimensionCode] || dimensionCode : '-');

const textDecoder = new TextDecoder('utf-8');
const readUint16 = (bytes: Uint8Array, offset: number) => bytes[offset] | (bytes[offset + 1] << 8);
const readUint32 = (bytes: Uint8Array, offset: number) =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);

const inflateRaw = async (bytes: Uint8Array) => {
  const streamCtor = (globalThis as typeof globalThis & { DecompressionStream?: new (format: string) => DecompressionStream }).DecompressionStream;
  if (!streamCtor) {
    throw new Error('当前浏览器不支持解析压缩 Excel，请使用系统模板直接上传');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new streamCtor('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readZipEntries = async (file: Blob) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries: ZipEntry[] = [];
  let offset = 0;
  while (offset + 30 < bytes.length) {
    if (readUint32(bytes, offset) !== 0x04034b50) break;
    const flags = readUint16(bytes, offset + 6);
    const method = readUint16(bytes, offset + 8);
    const compressedSize = readUint32(bytes, offset + 18);
    const nameLength = readUint16(bytes, offset + 26);
    const extraLength = readUint16(bytes, offset + 28);
    if (flags & 0x08) {
      throw new Error('暂不支持带数据描述符的 Excel 文件，请使用下载模板填写后上传');
    }
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const path = textDecoder.decode(bytes.slice(nameStart, nameStart + nameLength));
    entries.push({
      path,
      method,
      compressed: bytes.slice(dataStart, dataStart + compressedSize)
    });
    offset = dataStart + compressedSize;
  }
  return entries;
};

const unzipTextEntry = async (entries: ZipEntry[], path: string) => {
  const entry = entries.find((item) => item.path === path);
  if (!entry) return '';
  if (entry.method === 0) {
    return textDecoder.decode(entry.compressed);
  }
  if (entry.method === 8) {
    return textDecoder.decode(await inflateRaw(entry.compressed));
  }
  throw new Error('暂不支持该 Excel 压缩格式');
};

const parseXml = (xml: string) => new DOMParser().parseFromString(xml, 'application/xml');

const columnIndexFromRef = (ref: string) => {
  const letters = ref.replace(/[^A-Z]/gi, '').toUpperCase();
  return letters.split('').reduce((acc, letter) => acc * 26 + letter.charCodeAt(0) - 64, 0) - 1;
};

const normalizeUploadValue = (column: SpreadsheetColumn, value: string) => {
  const text = value.trim();
  if (!text) return undefined;
  if (column.prop === 'dimensionCode') {
    return dimensionOptions.find((option) => option.label === text || option.value === text)?.value ?? text;
  }
  if (column.prop === 'status') {
    if (text === '启用') return '0';
    if (text === '停用') return '1';
    return text;
  }
  if (column.type === 'number') {
    const numberValue = Number(text);
    return Number.isNaN(numberValue) ? text : numberValue;
  }
  return text;
};

const parseXlsxRows = async (file: Blob) => {
  const entries = await readZipEntries(file);
  const sharedStringsXml = await unzipTextEntry(entries, 'xl/sharedStrings.xml');
  const sharedStrings = sharedStringsXml
    ? Array.from(parseXml(sharedStringsXml).getElementsByTagName('si')).map((item) =>
        Array.from(item.getElementsByTagName('t'))
          .map((node) => node.textContent ?? '')
          .join('')
      )
    : [];
  const worksheetPath = entries.find((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.path))?.path;
  if (!worksheetPath) {
    throw new Error('未找到 Excel 工作表');
  }
  const worksheetXml = await unzipTextEntry(entries, worksheetPath);
  const rows = Array.from(parseXml(worksheetXml).getElementsByTagName('row')).map((row) => {
    const values: string[] = [];
    Array.from(row.getElementsByTagName('c')).forEach((cell) => {
      const ref = cell.getAttribute('r') ?? '';
      const type = cell.getAttribute('t');
      const index = columnIndexFromRef(ref);
      const rawValue =
        type === 'inlineStr'
          ? Array.from(cell.getElementsByTagName('t'))
              .map((node) => node.textContent ?? '')
              .join('')
          : cell.getElementsByTagName('v')[0]?.textContent ?? '';
      values[index] = type === 's' ? sharedStrings[Number(rawValue)] ?? '' : rawValue;
    });
    return values;
  });
  const headerRow = rows.find((row) => row.some(Boolean));
  if (!headerRow) return [];
  const columnByLabel = new Map(sheetColumns.value.map((column) => [column.label, column]));
  const uploadColumns = headerRow.map((label) => columnByLabel.get(label?.trim?.() ?? ''));
  return rows
    .slice(rows.indexOf(headerRow) + 1)
    .map((row, rowIndex) => {
      const item: Record<string, any> = {};
      uploadColumns.forEach((column, index) => {
        if (!column) return;
        item[column.prop] = normalizeUploadValue(column, row[index] ?? '');
      });
      if (!item.dimensionCode) item.dimensionCode = queryParams.dimensionCode || 'admin-division';
      if (!item.status) item.status = '0';
      const line = rowIndex + 2;
      if (!item.recordCode || !item.recordName) {
        const hasAnyValue = Object.values(item).some((value) => value !== undefined && value !== '');
        if (hasAnyValue) {
          throw new Error(`第 ${line} 行缺少记录编码或记录名称`);
        }
      }
      return item;
    })
    .filter((row) => row.recordCode && row.recordName);
};

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

const openSheetDrawer = () => {
  sheetDrawer.visible = true;
};

const openUploadDialog = () => {
  uploadDialog.visible = true;
};

const downloadDimensionTemplate = () => {
  downloadXlsxTemplate({
    fileName: `vendor_dimension_template_${queryParams.dimensionCode || 'all'}_${new Date().getTime()}.xlsx`,
    sheetName: '维表管理',
    headers: sheetColumns.value.map((column) => column.label)
  });
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

const persistDimensionRows = async (rows: Record<string, any>[], successMessage: string) => {
  sheetSaving.value = true;
  try {
    for (const row of rows) {
      const payload: DimensionRecordForm = {
        ...sheetEmptyRow.value,
        ...row,
        sortOrder: Number(row.sortOrder ?? 0)
      };
      if (payload.id) {
        await updateDimensionRecord(payload);
      } else {
        await addDimensionRecord(payload);
      }
    }
    proxy?.$modal.msgSuccess(successMessage);
    await getList();
  } finally {
    sheetSaving.value = false;
  }
};

const saveSheetRows = async (rows: Record<string, any>[]) => {
  await persistDimensionRows(rows, '在线填报已保存');
  sheetDrawer.visible = false;
};

const parseDimensionUploadFile = async (file: UploadRawFile) => {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    ElMessage.warning('请选择 .xlsx 文件');
    return false;
  }
  uploadParsing.value = true;
  try {
    const rows = await parseXlsxRows(file);
    if (!rows.length) {
      ElMessage.warning('文件解析完成，但没有可导入的数据行');
      return false;
    }
    await persistDimensionRows(rows, 'Excel 上传已导入');
    uploadDialog.visible = false;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Excel 文件解析失败');
  } finally {
    uploadParsing.value = false;
  }
  return false;
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
