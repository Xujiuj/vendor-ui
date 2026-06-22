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
          <el-button v-hasPermi="['vendor:factorRecord:add']" icon="Download" @click="downloadFactorTemplate">下载模板</el-button>
          <el-button v-hasPermi="['vendor:factorRecord:add']" icon="Upload" @click="openUploadDialog">Excel 上传</el-button>
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

    <el-dialog v-model="uploadDialog.visible" title="因子明细 Excel 上传" width="720px" append-to-body destroy-on-close v-loading="uploadParsing">
      <el-upload drag action="#" accept=".xlsx" :auto-upload="false" :show-file-list="false" :before-upload="parseFactorUploadFile">
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽 Excel 文件到此处，或点击选择 `.xlsx` 文件</div>
      </el-upload>
      <el-alert class="mt-4" type="info" show-icon :closable="false">
        <template #title>请使用“下载模板”生成的表头上传；版本ID和因子表类型必填，保存时逐行调用真实后端接口。</template>
      </el-alert>
      <template #footer>
        <el-button @click="uploadDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VendorFactorRecord" lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules, type UploadRawFile } from 'element-plus';
import { addFactorRecord, deleteFactorRecord, getFactorRecord, listFactorRecord, updateFactorRecord } from '@/api/vendor/factorRecord';
import type { FactorRecordForm, FactorRecordQuery, FactorRecordVO } from '@/api/vendor/factorRecord/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { downloadXlsxTemplate } from '@/utils/xlsxTemplate';
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

interface ZipEntry {
  path: string;
  method: number;
  compressed: Uint8Array;
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
const uploadDialog = reactive({
  visible: false
});
const uploadParsing = ref(false);

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
const factorTemplateColumns = computed<FactorColumn[]>(() => [
  { prop: 'versionId', label: '版本ID' },
  { prop: 'factorTableCode', label: '因子表类型' },
  ...activeColumns.value,
  { prop: 'enabledFlag', label: '状态' }
]);
const formatFactorTableLabel = (code?: string) => (code ? factorTableLabelMap[code] || code : '-');

const createEmptyFactorForm = (factorTableCode = '201ef'): FactorRecordForm => ({
  versionId: undefined,
  factorTableCode,
  factorCode: '',
  factorName: '',
  factorCategory: '',
  factorValue: undefined,
  factorUnit: '',
  sourceRef: '',
  enabledFlag: true,
  remark: undefined
});

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

const normalizeUploadValue = (column: FactorColumn, value: string) => {
  const text = value.trim();
  if (!text) return undefined;
  if (column.prop === 'factorTableCode') {
    return factorTableOptions.find((option) => option.label === text || option.value === text)?.value ?? text;
  }
  if (column.prop === 'enabledFlag') {
    if (text === '启用') return true;
    if (text === '停用') return false;
    return !['false', '0', '否'].includes(text.toLowerCase());
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
  const columnByLabel = new Map(factorTemplateColumns.value.map((column) => [column.label, column]));
  const uploadColumns = headerRow.map((label) => columnByLabel.get(label?.trim?.() ?? ''));
  return rows
    .slice(rows.indexOf(headerRow) + 1)
    .map((row, rowIndex) => {
      const item: Record<string, any> = {};
      uploadColumns.forEach((column, index) => {
        if (!column) return;
        item[column.prop] = normalizeUploadValue(column, row[index] ?? '');
      });
      if (!item.factorTableCode) item.factorTableCode = queryParams.factorTableCode || '201ef';
      if (item.enabledFlag === undefined) item.enabledFlag = true;
      const line = rowIndex + 2;
      const hasAnyValue = Object.values(item).some((value) => value !== undefined && value !== '');
      if (hasAnyValue && !item.versionId) {
        throw new Error(`第 ${line} 行缺少版本ID`);
      }
      return item;
    })
    .filter((row) => row.versionId);
};

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

const downloadFactorTemplate = () => {
  const tableCode = queryParams.factorTableCode || '201ef';
  downloadXlsxTemplate({
    fileName: `vendor_factor_${tableCode}_template_${new Date().getTime()}.xlsx`,
    sheetName: formatFactorTableLabel(tableCode),
    headers: factorTemplateColumns.value.map((column) => column.label)
  });
};

const openUploadDialog = () => {
  uploadDialog.visible = true;
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

const persistFactorRows = async (rows: Record<string, any>[]) => {
  submitLoading.value = true;
  try {
    for (const row of rows) {
      const payload = normalizeFactorPayload({
        ...createEmptyFactorForm(row.factorTableCode || queryParams.factorTableCode || '201ef'),
        ...row,
        factorTableCode: row.factorTableCode || queryParams.factorTableCode || '201ef',
        enabledFlag: row.enabledFlag !== false
      });
      if (payload.id) {
        await updateFactorRecord(payload);
      } else {
        await addFactorRecord(payload);
      }
    }
    proxy?.$modal.msgSuccess('Excel 上传已导入');
    await getList();
  } finally {
    submitLoading.value = false;
  }
};

const parseFactorUploadFile = async (file: UploadRawFile) => {
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
    await persistFactorRows(rows);
    uploadDialog.visible = false;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Excel 文件解析失败');
  } finally {
    uploadParsing.value = false;
  }
  return false;
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
