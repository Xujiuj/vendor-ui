<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="90px">
          <el-form-item label="License ID" prop="licenseId">
            <el-input v-model="queryParams.licenseId" placeholder="请输入 License ID" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="客户" prop="customerId">
            <el-select
              v-model="queryParams.customerId"
              placeholder="请选择客户"
              clearable
              filterable
              remote
              :remote-method="searchCustomers"
              :loading="customerLoading"
              style="width: 220px"
            >
              <el-option v-for="customer in customerOptions" :key="customer.id" :label="formatCustomerLabel(customer)" :value="customer.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="版本" prop="edition">
            <el-select v-model="queryParams.edition" placeholder="请选择版本" clearable style="width: 160px">
              <el-option v-for="edition in editionOptions" :key="edition.value" :label="edition.label" :value="edition.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备指纹" prop="installId">
            <el-input v-model="queryParams.installId" placeholder="请输入设备指纹" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="签发状态" prop="issueStatus">
            <el-select v-model="queryParams.issueStatus" placeholder="请选择状态" clearable style="width: 150px">
              <el-option label="签发成功" value="SUCCESS" />
              <el-option label="签发失败" value="FAILED" />
              <el-option label="已撤销" value="REVOKED" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="openIssueDrawer">签发 License</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="licenseList" border>
        <el-table-column label="License ID" align="center" prop="licenseId" min-width="160" :show-overflow-tooltip="true" />
        <el-table-column label="客户" align="center" min-width="190" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ customerNameMap.get(row.customerId) || row.customerId || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="版本" align="center" prop="edition" width="120" />
        <el-table-column label="设备指纹" align="center" prop="installId" min-width="170" :show-overflow-tooltip="true" />
        <el-table-column label="签发类型" align="center" prop="issueType" width="110" />
        <el-table-column label="签发状态" align="center" prop="issueStatus" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.issueStatus)">{{ formatIssueStatus(row.issueStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期起" align="center" prop="validFrom" width="150">
          <template #default="{ row }">
            {{ formatDate(row.validFrom) }}
          </template>
        </el-table-column>
        <el-table-column label="有效期止" align="center" prop="validTo" width="150">
          <template #default="{ row }">
            {{ formatDate(row.validTo) }}
          </template>
        </el-table-column>
        <el-table-column label="签发人" align="center" prop="issuedBy" width="130" :show-overflow-tooltip="true" />
        <el-table-column label="签发时间" align="center" prop="issuedTime" width="160">
          <template #default="{ row }">
            {{ formatDate(row.issuedTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-if="canDownload(row)" link type="primary" icon="Download" @click="downloadIssuedLicense(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-drawer v-model="issueDrawer.visible" title="签发 License" size="640px" append-to-body :close-on-click-modal="false">
      <el-alert
        title="客户编码和客户名称来自供应商客户主数据，签发请求只发送客户 ID 和允许的授权字段。"
        type="info"
        show-icon
        :closable="false"
        class="mb12"
      />
      <el-form ref="issueFormRef" :model="issueForm" :rules="issueRules" label-width="120px">
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="issueForm.customerId"
            placeholder="请选择供应商客户"
            filterable
            remote
            :remote-method="searchCustomers"
            :loading="customerLoading"
            class="w-full"
            @change="handleIssueCustomerChange"
          >
            <el-option
              v-for="customer in customerOptions"
              :key="customer.id"
              :label="formatCustomerLabel(customer)"
              :value="customer.id"
              :disabled="isInactiveCustomer(customer)"
            >
              <span>{{ formatCustomerLabel(customer) }}</span>
              <el-tag v-if="isInactiveCustomer(customer)" type="danger" size="small" class="ml8">不可签发</el-tag>
            </el-option>
          </el-select>
          <div v-if="selectedCustomer" class="form-tip">{{ selectedCustomer.customerCode }} / {{ selectedCustomer.customerName }}</div>
        </el-form-item>
        <el-form-item label="签名密钥 ID" prop="keyId">
          <el-input v-model="issueForm.keyId" placeholder="请输入后端允许使用的签名密钥 ID" />
        </el-form-item>
        <el-form-item label="设备指纹" prop="installId">
          <el-input v-model="issueForm.installId" placeholder="请输入 installId" />
        </el-form-item>
        <el-form-item label="有效期" required>
          <el-row :gutter="10" class="w-full">
            <el-col :span="12">
              <el-form-item prop="validFrom">
                <el-date-picker v-model="issueForm.validFrom" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" class="w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="validTo">
                <el-date-picker v-model="issueForm.validTo" type="date" value-format="YYYY-MM-DD" placeholder="结束日期" class="w-full" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="版本" prop="edition">
          <el-select v-model="issueForm.edition" placeholder="请选择版本" clearable class="w-full">
            <el-option v-for="edition in editionOptions" :key="edition.value" :label="edition.label" :value="edition.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能" prop="features">
          <el-select
            v-model="issueForm.features"
            placeholder="请输入或选择功能代码"
            multiple
            filterable
            allow-create
            default-first-option
            class="w-full"
          >
            <el-option v-for="feature in featureOptions" :key="feature" :label="feature" :value="feature" />
          </el-select>
        </el-form-item>
        <el-form-item label="签发类型" prop="issueType">
          <el-select v-model="issueForm.issueType" placeholder="请选择签发类型" class="w-full">
            <el-option label="新签发" value="NEW" />
            <el-option label="续期" value="RENEWAL" />
            <el-option label="补发" value="REISSUE" />
          </el-select>
        </el-form-item>
        <el-form-item label="签发人" prop="issuedBy">
          <el-input v-model="issueForm.issuedBy" placeholder="请输入签发人" />
        </el-form-item>
        <el-form-item label="模板授权" prop="templateEntitlements">
          <el-select
            v-model="issueForm.templateEntitlements"
            placeholder="请输入模板授权代码"
            multiple
            filterable
            allow-create
            default-first-option
            class="w-full"
          />
        </el-form-item>
      </el-form>

      <el-alert v-if="issueError" :title="issueError" type="error" show-icon :closable="false" class="mb12" />
      <el-card v-if="issuedResult" shadow="never" class="issue-result">
        <template #header>签发结果</template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="License ID">{{ issuedResult.licenseId || issuedResult.id }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ customerNameMap.get(issuedResult.customerId) || issuedResult.customerId }}</el-descriptions-item>
          <el-descriptions-item label="有效期"
            >{{ formatDate(issuedResult.validFrom) }} 至 {{ formatDate(issuedResult.validTo) }}</el-descriptions-item
          >
          <el-descriptions-item label="下载文件">{{ issuedResult.download?.fileName || buildLicenseFileName(issuedResult) }}</el-descriptions-item>
        </el-descriptions>
        <el-button class="mt12" type="primary" icon="Download" @click="downloadIssuedLicense(issuedResult)">下载 .lic</el-button>
      </el-card>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="closeIssueDrawer">取消</el-button>
          <el-button :loading="issuing" type="primary" @click="submitIssue">签发并生成 .lic</el-button>
        </div>
      </template>
    </el-drawer>

    <el-drawer v-model="detailDrawer.visible" title="License 详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="License ID">{{ detailRecord.licenseId || detailRecord.id }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ customerNameMap.get(detailRecord.customerId) || detailRecord.customerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签名密钥 ID">{{ detailRecord.keyId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detailRecord.edition || '-' }}</el-descriptions-item>
        <el-descriptions-item label="功能">{{ formatFeatures(detailRecord.featureCodes) }}</el-descriptions-item>
        <el-descriptions-item label="设备指纹">{{ detailRecord.installId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ formatIssueStatus(detailRecord.issueStatus) }}</el-descriptions-item>
        <el-descriptions-item label="有效期">{{ formatDate(detailRecord.validFrom) }} 至 {{ formatDate(detailRecord.validTo) }}</el-descriptions-item>
        <el-descriptions-item label="签发人">{{ detailRecord.issuedBy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签发时间">{{ formatDate(detailRecord.issuedTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="License" lang="ts">
import { listCustomer } from '@/api/vendor/customer';
import type { CustomerVO } from '@/api/vendor/customer/types';
import { getLicenseIssue, issueLicense, listLicenseIssue } from '@/api/vendor/licenseIssue';
import type { LicenseIssueCommand, LicenseIssueQuery, LicenseIssueResult, LicenseIssueVO } from '@/api/vendor/licenseIssue/types';
import { parseTime } from '@/utils/ruoyi';
import type { AxiosError } from 'axios';

interface IssueForm {
  customerId?: string | number;
  keyId: string;
  installId: string;
  validFrom: string;
  validTo: string;
  edition?: string;
  features: string[];
  issueType: string;
  issuedBy: string;
  templateEntitlements: string[];
}

type ListResponse<T> = {
  rows?: T[];
  total?: number;
  data?: T[] | T;
};

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const showSearch = ref(true);
const loading = ref(false);
const issuing = ref(false);
const customerLoading = ref(false);
const total = ref(0);
const licenseList = ref<LicenseIssueVO[]>([]);
const customerOptions = ref<CustomerVO[]>([]);
const issuedResult = ref<LicenseIssueResult>();
const issueError = ref('');
const detailRecord = ref<LicenseIssueVO>();

const queryFormRef = ref<ElFormInstance>();
const issueFormRef = ref<ElFormInstance>();

const issueDrawer = reactive<DialogOption>({
  visible: false,
  title: '签发 License'
});

const detailDrawer = reactive<DialogOption>({
  visible: false,
  title: 'License 详情'
});

const queryParams = reactive<LicenseIssueQuery>({
  pageNum: 1,
  pageSize: 10,
  licenseId: undefined,
  customerId: undefined,
  edition: undefined,
  installId: undefined,
  issueStatus: undefined
});

const defaultIssueForm = (): IssueForm => ({
  customerId: undefined,
  keyId: '',
  installId: '',
  validFrom: '',
  validTo: '',
  edition: 'STANDARD',
  features: [],
  issueType: 'NEW',
  issuedBy: 'vendor-operator',
  templateEntitlements: []
});

const issueForm = reactive<IssueForm>(defaultIssueForm());

const editionOptions = [
  { label: '基础版', value: 'BASIC' },
  { label: '标准版', value: 'STANDARD' },
  { label: '专业版', value: 'PROFESSIONAL' },
  { label: '企业版', value: 'ENTERPRISE' }
];

const featureOptions = ['carbon-data', 'factor-library', 'report-template', 'power-bi'];

const issueRules: Record<string, any> = {
  customerId: [{ required: true, message: '请选择供应商客户', trigger: 'change' }],
  keyId: [{ required: true, message: '请输入签名密钥 ID', trigger: 'blur' }],
  installId: [{ required: true, message: '请输入设备指纹', trigger: 'blur' }],
  validFrom: [{ required: true, message: '请选择有效期开始日期', trigger: 'change' }],
  validTo: [{ required: true, message: '请选择有效期结束日期', trigger: 'change' }],
  features: [{ required: true, type: 'array', min: 1, message: '请至少选择一个功能', trigger: 'change' }],
  issueType: [{ required: true, message: '请选择签发类型', trigger: 'change' }],
  issuedBy: [{ required: true, message: '请输入签发人', trigger: 'blur' }]
};

const customerNameMap = computed(() => {
  const map = new Map<string | number, string>();
  customerOptions.value.forEach((customer) => {
    map.set(customer.id, formatCustomerLabel(customer));
  });
  return map;
});

const selectedCustomer = computed(() => customerOptions.value.find((customer) => customer.id === issueForm.customerId));

const normalizeRows = <T,>(res: ListResponse<T>): T[] => {
  if (Array.isArray(res.rows)) {
    return res.rows;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
};

const normalizeTotal = <T,>(res: ListResponse<T>, fallback: T[]) => {
  return typeof res.total === 'number' ? res.total : fallback.length;
};

const formatCustomerLabel = (customer: CustomerVO) => {
  return `${customer.customerCode} - ${customer.customerName}`;
};

const isInactiveCustomer = (customer?: CustomerVO) => {
  if (!customer) {
    return false;
  }
  const status = String(customer.customerStatus ?? '').toLowerCase();
  return ['1', 'inactive', 'disabled', 'disable', '停用', '禁用'].includes(status);
};

const formatDate = (value?: string) => {
  return value ? parseTime(value, '{y}-{m}-{d}') : '-';
};

const formatIssueStatus = (status?: string) => {
  const normalized = String(status || '').toUpperCase();
  const statusMap: Record<string, string> = {
    SUCCESS: '签发成功',
    ISSUED: '签发成功',
    FAILED: '签发失败',
    REVOKED: '已撤销',
    PENDING: '处理中'
  };
  return statusMap[normalized] || status || '-';
};

const statusTagType = (status?: string) => {
  const normalized = String(status || '').toUpperCase();
  if (['SUCCESS', 'ISSUED'].includes(normalized)) {
    return 'success';
  }
  if (normalized === 'FAILED') {
    return 'danger';
  }
  if (normalized === 'REVOKED') {
    return 'info';
  }
  return 'warning';
};

const formatFeatures = (features?: string[] | string) => {
  if (Array.isArray(features)) {
    return features.join(', ');
  }
  return features || '-';
};

const mapIssueError = (error: unknown) => {
  const axiosError = error as AxiosError<{ msg?: string; message?: string; code?: string | number }>;
  const raw = [axiosError.response?.data?.msg, axiosError.response?.data?.message, axiosError.message].filter(Boolean).join(' ').toLowerCase();

  if (/(inactive|disabled|disable|customer.*status|客户.*(停用|禁用|未启用|无效)|停用|禁用)/i.test(raw)) {
    return '客户已停用或未启用，不能签发 License。';
  }
  if (/(duplicate|already|exists|重复|已存在|重复签发)/i.test(raw)) {
    return '该客户和设备已存在有效 License，请检查后再补发或续期。';
  }
  return 'license issue failed';
};

const buildLicenseFileName = (result: LicenseIssueResult) => {
  const baseName = result.download?.fileName || result.licenseId || result.id || 'license';
  return String(baseName).endsWith('.lic') ? String(baseName) : `${baseName}.lic`;
};

const canDownload = (record: LicenseIssueResult) => {
  return Boolean(record.licensePayload || record.download?.downloadUrl);
};

const isSafeDownloadUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

const downloadText = (content: string, fileName: string, contentType?: string) => {
  const blob = new Blob([content], { type: contentType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const downloadIssuedLicense = (result: LicenseIssueResult) => {
  if (result.licensePayload) {
    downloadText(result.licensePayload, buildLicenseFileName(result), result.download?.contentType);
    return;
  }

  const downloadUrl = result.download?.downloadUrl;
  if (downloadUrl) {
    if (!isSafeDownloadUrl(downloadUrl)) {
      proxy?.$modal.msgError('License 下载地址不安全，已阻止跳转。');
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = buildLicenseFileName(result);
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return;
  }

  proxy?.$modal.msgWarning('当前签发结果没有可下载的 .lic 内容。');
};

const searchCustomers = async (keyword?: string) => {
  customerLoading.value = true;
  try {
    const res = (await listCustomer({
      pageNum: 1,
      pageSize: 200,
      customerName: keyword || undefined,
      params: {}
    })) as unknown as ListResponse<CustomerVO>;
    customerOptions.value = normalizeRows(res);
  } finally {
    customerLoading.value = false;
  }
};

const hydrateCustomersForRows = async (rows: LicenseIssueVO[]) => {
  const missingCustomer = rows.find((row) => row.customerId && !customerNameMap.value.has(row.customerId));
  if (missingCustomer) {
    await searchCustomers();
  }
};

const getList = async () => {
  loading.value = true;
  try {
    const res = (await listLicenseIssue(queryParams)) as unknown as ListResponse<LicenseIssueVO>;
    const rows = normalizeRows(res);
    licenseList.value = rows;
    total.value = normalizeTotal(res, rows);
    await hydrateCustomersForRows(rows);
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  getList();
};

const resetIssueForm = () => {
  Object.assign(issueForm, defaultIssueForm());
  issueError.value = '';
  issuedResult.value = undefined;
  issueFormRef.value?.resetFields();
};

const openIssueDrawer = async () => {
  resetIssueForm();
  issueDrawer.visible = true;
  if (!customerOptions.value.length) {
    await searchCustomers();
  }
};

const closeIssueDrawer = () => {
  issueDrawer.visible = false;
  resetIssueForm();
};

const handleIssueCustomerChange = () => {
  issueError.value = '';
  if (isInactiveCustomer(selectedCustomer.value)) {
    issueError.value = '客户已停用或未启用，不能签发 License。';
  }
};

const buildIssueCommand = (): LicenseIssueCommand => ({
  customerId: issueForm.customerId as string | number,
  keyId: issueForm.keyId,
  installId: issueForm.installId,
  validity: {
    validFrom: issueForm.validFrom,
    validTo: issueForm.validTo
  },
  edition: issueForm.edition,
  features: issueForm.features,
  issueType: issueForm.issueType,
  issuedBy: issueForm.issuedBy,
  templateEntitlements: issueForm.templateEntitlements
});

const submitIssue = () => {
  issueFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    if (isInactiveCustomer(selectedCustomer.value)) {
      issueError.value = '客户已停用或未启用，不能签发 License。';
      return;
    }

    issuing.value = true;
    issueError.value = '';
    try {
      const res = (await issueLicense(buildIssueCommand())) as unknown as { data?: LicenseIssueResult } & LicenseIssueResult;
      issuedResult.value = res.data || res;
      proxy?.$modal.msgSuccess('License 签发成功');
      await getList();
    } catch (error) {
      issueError.value = mapIssueError(error);
    } finally {
      issuing.value = false;
    }
  });
};

const openDetail = async (row: LicenseIssueVO) => {
  const id = row.id || row.licenseId;
  if (!id) {
    detailRecord.value = row;
  } else {
    const res = (await getLicenseIssue(id)) as unknown as { data?: LicenseIssueVO } & LicenseIssueVO;
    detailRecord.value = res.data || res;
  }
  detailDrawer.visible = true;
};

onMounted(async () => {
  await searchCustomers();
  await getList();
});
</script>

<style scoped>
.mb12 {
  margin-bottom: 12px;
}

.ml8 {
  margin-left: 8px;
}

.mt12 {
  margin-top: 12px;
}

.w-full {
  width: 100%;
}

.form-tip {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.issue-result {
  margin-top: 12px;
}
</style>
