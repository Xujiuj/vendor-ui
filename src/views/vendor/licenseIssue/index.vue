<template>
  <div class="p-2 page-panel vendor-license-issue">
    <section class="page-head">
      <div>
        <h1>授权管理</h1>
        <p>为客户签发、下载和追踪授权记录。</p>
      </div>
    </section>

    <div v-show="showSearch" class="search-bar wide">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="90px" class="license-search">
        <el-form-item label="授权编号" prop="licenseId">
          <el-input v-model="queryParams.licenseId" placeholder="请输入授权编号" clearable @keyup.enter="handleQuery" />
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
          >
            <el-option v-for="customer in customerOptions" :key="customer.id" :label="formatCustomerLabel(customer)" :value="customer.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权套餐" prop="packageId">
          <el-select v-model="queryParams.packageId" placeholder="请选择授权套餐" clearable>
            <el-option v-for="item in packageOptions" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
          </el-select>
        </el-form-item>
        <el-form-item label="签发状态" prop="issueStatus">
          <el-select v-model="queryParams.issueStatus" placeholder="请选择状态" clearable>
            <el-option label="签发成功" value="SUCCESS" />
            <el-option label="签发失败" value="FAILED" />
            <el-option label="已撤销" value="REVOKED" />
          </el-select>
        </el-form-item>
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="getList"></right-toolbar>
        </div>
      </el-form>
    </div>

    <div v-show="!showSearch" class="search-bar search-bar-collapsed">
      <div class="search-actions">
        <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="getList"></right-toolbar>
      </div>
    </div>

    <section class="panel">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="openIssueDrawer">签发授权</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="licenseList" border>
        <el-table-column label="授权编号" align="center" prop="licenseId" min-width="160" :show-overflow-tooltip="true" />
        <el-table-column label="客户" align="center" min-width="190" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ customerNameMap.get(row.customerId) || row.customerId || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="授权套餐" align="center" min-width="130" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ formatPackage(row) }}
          </template>
        </el-table-column>
        <el-table-column label="签发状态" align="center" prop="issueStatus" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.issueStatus)">{{ formatIssueStatus(row.issueStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期起" align="center" prop="validFrom" width="150">
          <template #default="{ row }">{{ formatDate(row.validFrom) }}</template>
        </el-table-column>
        <el-table-column label="有效期止" align="center" prop="validTo" width="150">
          <template #default="{ row }">{{ formatDate(row.validTo) }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-if="canDownload(row)" link type="primary" icon="Download" @click="downloadIssuedLicense(row)">下载</el-button>
            <el-button v-hasPermi="['vendor:licenseIssue:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </section>

    <el-drawer v-model="issueDrawer.visible" title="签发授权" size="640px" append-to-body>
      <el-alert
        title="签发时仅选择客户、有效期和授权套餐，设备指纹由企业激活回填，功能与模板授权由授权套餐推导。"
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

        <el-form-item label="授权套餐" prop="packageId">
          <el-select v-model="issueForm.packageId" placeholder="请选择授权套餐" class="w-full" filterable @change="handlePackageChange">
            <el-option
              v-for="item in packageOptions"
              :key="item.packageId"
              :label="item.packageName"
              :value="item.packageId"
              :disabled="item.status === '1'"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="功能" prop="features">
          <div class="feature-tags">
            <el-tag v-for="feature in issueForm.features" :key="feature" type="info">{{ feature }}</el-tag>
          </div>
          <div v-if="!issueForm.features.length" class="form-tip">请选择授权套餐后自动带出功能。</div>
        </el-form-item>

        <el-form-item label="模板授权">
          <div class="feature-tags">
            <el-tag v-for="templateCode in issueForm.templateEntitlements" :key="templateCode" type="info">{{ templateName(templateCode) }}</el-tag>
          </div>
          <div v-if="!issueForm.templateEntitlements.length" class="form-tip">请选择授权套餐后自动带出模板授权。</div>
        </el-form-item>
      </el-form>

      <el-alert v-if="issueError" :title="issueError" type="error" show-icon :closable="false" class="mb12" />

      <el-card v-if="issuedResult" shadow="never" class="issue-result">
        <template #header>签发结果</template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="授权编号">{{ issuedResult.licenseId || issuedResult.id }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ customerNameMap.get(issuedResult.customerId) || issuedResult.customerId }}</el-descriptions-item>
          <el-descriptions-item label="有效期"
            >{{ formatDate(issuedResult.validFrom) }} 至 {{ formatDate(issuedResult.validTo) }}</el-descriptions-item
          >
          <el-descriptions-item label="授权套餐">{{ formatPackage(issuedResult) }}</el-descriptions-item>
          <el-descriptions-item label="功能">{{ formatFeatures(issuedResult.featureCodes) }}</el-descriptions-item>
          <el-descriptions-item label="模板授权">{{ formatFeatures(issuedResult.templateEntitlements) }}</el-descriptions-item>
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

    <el-drawer v-model="detailDrawer.visible" title="授权详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="授权编号">{{ detailRecord.licenseId || detailRecord.id }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ customerNameMap.get(detailRecord.customerId) || detailRecord.customerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="授权套餐">{{ formatPackage(detailRecord) }}</el-descriptions-item>
        <el-descriptions-item label="功能">{{ formatFeatures(detailRecord.featureCodes) }}</el-descriptions-item>
        <el-descriptions-item label="模板授权">{{ formatFeatures(detailRecord.templateEntitlements) }}</el-descriptions-item>
        <el-descriptions-item label="设备指纹">{{ detailRecord.installId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ formatIssueStatus(detailRecord.issueStatus) }}</el-descriptions-item>
        <el-descriptions-item label="有效期">{{ formatDate(detailRecord.validFrom) }} 至 {{ formatDate(detailRecord.validTo) }}</el-descriptions-item>
        <el-descriptions-item label="签发时间">{{ formatDate(detailRecord.issuedTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="License" lang="ts">
import { listCustomer } from '@/api/vendor/customer';
import type { CustomerVO } from '@/api/vendor/customer/types';
import { deleteLicenseIssue, getLicenseIssue, issueLicense, listLicenseIssue } from '@/api/vendor/licenseIssue';
import type {
  LicenseIssueCommand,
  LicenseIssueQuery,
  LicenseIssueResult,
  LicenseIssueVO
} from '@/api/vendor/licenseIssue/types';
import { selectTenantPackage } from '@/api/system/tenantPackage';
import type { TenantPkgVO } from '@/api/system/tenantPackage/types';
import { listReportTemplate } from '@/api/vendor/reportTemplate';
import type { ReportTemplateVO } from '@/api/vendor/reportTemplate/types';
import { parseTime } from '@/utils/ruoyi';
import type { AxiosError } from 'axios';
import { useAutoQuery } from '@/hooks/useAutoQuery';

interface IssueForm {
  customerId?: string | number;
  packageId?: string | number;
  validFrom: string;
  validTo: string;
  edition?: string;
  features: string[];
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
const packageOptions = ref<TenantPkgVO[]>([]);
const templateOptions = ref<ReportTemplateVO[]>([]);
const issuedResult = ref<LicenseIssueResult>();
const issueError = ref('');
const detailRecord = ref<LicenseIssueVO>();

const queryFormRef = ref<ElFormInstance>();
const issueFormRef = ref<ElFormInstance>();

const issueDrawer = reactive<DialogOption>({ visible: false, title: '签发授权' });
const detailDrawer = reactive<DialogOption>({ visible: false, title: '授权详情' });

const queryParams = reactive<LicenseIssueQuery>({
  pageNum: 1,
  pageSize: 10,
  licenseId: undefined,
  customerId: undefined,
  packageId: undefined,
  edition: undefined,
  issueStatus: undefined
});

const defaultIssueForm = (): IssueForm => ({
  customerId: undefined,
  packageId: undefined,
  validFrom: '',
  validTo: '',
  edition: undefined,
  features: [],
  templateEntitlements: []
});

const issueForm = reactive<IssueForm>(defaultIssueForm());

const issueRules: Record<string, any> = {
  customerId: [{ required: true, message: '请选择供应商客户', trigger: 'change' }],
  packageId: [{ required: true, message: '请选择授权套餐', trigger: 'change' }],
  validFrom: [{ required: true, message: '请选择有效期开始日期', trigger: 'change' }],
  validTo: [{ required: true, message: '请选择有效期结束日期', trigger: 'change' }]
};

const customerNameMap = computed(() => {
  const map = new Map<string | number, string>();
  customerOptions.value.forEach((customer) => {
    map.set(customer.id, formatCustomerLabel(customer));
  });
  return map;
});

const selectedCustomer = computed(() => customerOptions.value.find((customer) => customer.id === issueForm.customerId));
const selectedPackage = computed(() => packageOptions.value.find((item) => item.packageId === issueForm.packageId));

function normalizeRows<T>(res: ListResponse<T>): T[] {
  if (Array.isArray(res.rows)) return res.rows;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

function normalizeTotal<T>(res: ListResponse<T>, fallback: T[]) {
  return typeof res.total === 'number' ? res.total : fallback.length;
}

function formatCustomerLabel(customer: CustomerVO) {
  return `${customer.customerCode} - ${customer.customerName}`;
}

function formatPackage(record?: { packageId?: string | number; packageName?: string }) {
  if (!record) return '-';
  if (record.packageId !== undefined && record.packageId !== null) {
    return packageOptions.value.find((item) => item.packageId === record.packageId)?.packageName || record.packageName || String(record.packageId);
  }
  return record.packageName || '-';
}

function templateLabel(template: ReportTemplateVO) {
  return `${template.templateName || template.templateCode || template.id}`;
}

function templateName(templateCode: string) {
  const template = templateOptions.value.find((item) => item.templateCode === templateCode || String(item.id) === templateCode);
  return template ? templateLabel(template) : templateCode;
}

function formatDate(value?: string) {
  return value ? parseTime(value, '{y}-{m}-{d}') : '-';
}

function formatIssueStatus(status?: string) {
  const normalized = String(status || '').toUpperCase();
  const statusMap: Record<string, string> = {
    SUCCESS: '签发成功',
    ISSUED: '签发成功',
    FAILED: '签发失败',
    REVOKED: '已撤销',
    PENDING: '处理中'
  };
  return statusMap[normalized] || status || '-';
}

function statusTagType(status?: string) {
  const normalized = String(status || '').toUpperCase();
  if (['SUCCESS', 'ISSUED'].includes(normalized)) return 'success';
  if (normalized === 'FAILED') return 'danger';
  if (normalized === 'REVOKED') return 'info';
  return 'warning';
}

function formatFeatures(features?: string[] | string) {
  if (Array.isArray(features)) return features.join(', ');
  return features || '-';
}

function mapIssueError(error: unknown) {
  const axiosError = error as AxiosError<{ msg?: string; message?: string; code?: string | number }>;
  const raw = [axiosError.response?.data?.msg, axiosError.response?.data?.message, axiosError.message].filter(Boolean).join(' ').toLowerCase();
  if (/(inactive|disabled|disable|customer.*status|客户.*(停用|禁用|未启用|无效)|停用|禁用)/i.test(raw)) {
    return '客户已停用或未启用，不能签发授权。';
  }
  if (/(duplicate|already|exists|重复|已存在|重复签发)/i.test(raw)) {
    return '该客户和授权套餐已存在有效授权，请检查后再补发或续期。';
  }
  return '授权签发失败';
}

function buildLicenseFileName(result: LicenseIssueResult) {
  const baseName = result.download?.fileName || result.licenseId || result.id || 'license';
  return String(baseName).endsWith('.lic') ? String(baseName) : `${baseName}.lic`;
}

function canDownload(record: LicenseIssueResult) {
  return Boolean(record.licensePayload || record.download?.downloadUrl);
}

function isSafeDownloadUrl(url: string) {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

function downloadText(content: string, fileName: string, contentType?: string) {
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
}

function downloadIssuedLicense(result: LicenseIssueResult) {
  if (result.licensePayload) {
    downloadText(result.licensePayload, buildLicenseFileName(result), result.download?.contentType);
    return;
  }

  const downloadUrl = result.download?.downloadUrl;
  if (downloadUrl) {
    if (!isSafeDownloadUrl(downloadUrl)) {
      proxy?.$modal.msgError('授权文件下载地址不安全，已阻止跳转。');
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
}

async function searchCustomers(keyword?: string) {
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
}

async function loadTemplates() {
  const res = (await listReportTemplate({ pageNum: 1, pageSize: 500, publishStatus: '1', params: {} })) as unknown as ListResponse<ReportTemplateVO>;
  templateOptions.value = normalizeRows(res).filter((item) => item.publishStatus === '1');
}

function getPackageFeatures(packageId?: string | number) {
  const item = packageOptions.value.find((entry) => entry.packageId === packageId);
  return parsePackageFeatures(item);
}

function parsePackageFeatures(item?: TenantPkgVO) {
  return String(item?.licenseFeatureCodes || '')
    .split(/[,;\s]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function getPackageTemplates(packageId?: string | number) {
  const item = packageOptions.value.find((entry) => entry.packageId === packageId);
  return parsePackageTemplates(item);
}

function parsePackageTemplates(item?: TenantPkgVO) {
  const raw = String(item?.licenseTemplateEntitlements || '');
  if (!raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => {
          if (typeof entry === 'string') return entry;
          if (entry && typeof entry === 'object') {
            return String(entry.templateCode || entry.id || entry.templateId || '');
          }
          return '';
        })
        .filter(Boolean);
    }
  } catch {
    // fall through to delimiter split
  }
  return raw
    .split(/[,;\s]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function isConfiguredLicensePackage(item: TenantPkgVO) {
  return item.status !== '1' && parsePackageFeatures(item).length > 0 && parsePackageTemplates(item).length > 0;
}

async function loadPackages() {
  const res = (await selectTenantPackage()) as unknown as { data?: TenantPkgVO[] } | TenantPkgVO[];
  const rows = Array.isArray(res) ? res : res.data || [];
  packageOptions.value = rows.filter((item) => isConfiguredLicensePackage(item));
  if (!issueForm.packageId && packageOptions.value.length > 0) {
    issueForm.packageId = packageOptions.value[0].packageId;
    handlePackageChange(issueForm.packageId);
  }
}

async function hydrateCustomersForRows(rows: LicenseIssueVO[]) {
  const missingCustomer = rows.find((row) => row.customerId && !customerNameMap.value.has(row.customerId));
  if (missingCustomer) {
    await searchCustomers();
  }
}

async function getList() {
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
}

function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.packageId = undefined;
  getList();
}

function resetIssueForm() {
  Object.assign(issueForm, defaultIssueForm());
  issueError.value = '';
  issuedResult.value = undefined;
  issueFormRef.value?.resetFields();
}

async function openIssueDrawer() {
  resetIssueForm();
  issueDrawer.visible = true;
  if (!customerOptions.value.length) {
    await searchCustomers();
  }
  if (!packageOptions.value.length) {
    await loadPackages();
  }
  if (!templateOptions.value.length) {
    await loadTemplates();
  }
}

function closeIssueDrawer() {
  issueDrawer.visible = false;
  resetIssueForm();
}

function handleIssueCustomerChange() {
  issueError.value = '';
  if (isInactiveCustomer(selectedCustomer.value)) {
    issueError.value = '客户已停用或未启用，不能签发授权。';
  }
}

function handlePackageChange(packageId?: string | number) {
  const selected = packageOptions.value.find((item) => item.packageId === packageId);
  issueForm.features = getPackageFeatures(selected?.packageId);
  issueForm.templateEntitlements = getPackageTemplates(selected?.packageId);
}

function buildIssueCommand(): LicenseIssueCommand {
  return {
    customerId: issueForm.customerId as string | number,
    packageId: issueForm.packageId as string | number,
    validity: {
      validFrom: issueForm.validFrom,
      validTo: issueForm.validTo
    }
  };
}

function submitIssue() {
  issueFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    if (isInactiveCustomer(selectedCustomer.value)) {
      issueError.value = '客户已停用或未启用，不能签发授权。';
      return;
    }

    issuing.value = true;
    issueError.value = '';
    try {
      const res = (await issueLicense(buildIssueCommand())) as unknown as { data?: LicenseIssueResult } & LicenseIssueResult;
      issuedResult.value = res.data || res;
      proxy?.$modal.msgSuccess('授权签发成功');
      await getList();
    } catch (error) {
      issueError.value = mapIssueError(error);
    } finally {
      issuing.value = false;
    }
  });
}

async function openDetail(row: LicenseIssueVO) {
  const id = row.id || row.licenseId;
  if (!id) {
    detailRecord.value = row;
  } else {
    const res = (await getLicenseIssue(id)) as unknown as { data?: LicenseIssueVO } & LicenseIssueVO;
    detailRecord.value = res.data || res;
  }
  detailDrawer.visible = true;
}

async function handleDelete(row: LicenseIssueVO) {
  const deleteId = row.id;
  if (!deleteId) return;
  try {
    await proxy?.$modal.confirm(`确认删除授权记录“${row.licenseId || deleteId}”？`);
    await deleteLicenseIssue(deleteId);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } catch {
    // User cancelled or the global request interceptor already displayed the error.
  }
}

function isInactiveCustomer(customer?: CustomerVO) {
  if (!customer) return false;
  const status = String(customer.customerStatus ?? '').toLowerCase();
  return ['1', 'inactive', 'disabled', 'disable', '停用', '禁用'].includes(status);
}

onMounted(async () => {
  await Promise.all([searchCustomers(), loadPackages(), loadTemplates()]);
  await getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped>
.vendor-license-issue .license-search {
  display: contents;
}

.vendor-license-issue .license-search :deep(.el-form-item) {
  flex: 1 1 260px;
  min-width: 240px;
  max-width: 380px;
  margin-right: 0;
  margin-bottom: 0;
}

.vendor-license-issue .license-search :deep(.el-form-item__content),
.vendor-license-issue .license-search :deep(.el-input),
.vendor-license-issue .license-search :deep(.el-select),
.vendor-license-issue .license-search :deep(.el-date-editor) {
  width: 100%;
  min-width: 220px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

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
