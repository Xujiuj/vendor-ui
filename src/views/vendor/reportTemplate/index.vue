<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>模板管理</h1>
        <p>维护厂商云端报表模板元数据和模板文件，发布后按授权范围提供给企业端同步下载。</p>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>模板编码</label>
          <el-input v-model="queryParams.templateCode" placeholder="请输入模板编码" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>模板名称</label>
          <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>模板版本</label>
          <el-input v-model="queryParams.templateVersion" placeholder="请输入模板版本" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>发布状态</label>
          <el-select v-model="queryParams.publishStatus" placeholder="请选择发布状态" clearable>
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已停用" value="DISABLED" />
          </el-select>
        </div>
        <div class="search-actions">
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button v-hasPermi="['vendor:reportTemplate:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['vendor:reportTemplate:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
          <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
          <el-button icon="Refresh" @click="refreshList">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="templateList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模板编码" align="center" prop="templateCode" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="模板名称" align="center" prop="templateName" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="版本" align="center" prop="templateVersion" width="110" />
        <el-table-column label="文件名" align="center" prop="fileName" min-width="170" :show-overflow-tooltip="true" />
        <el-table-column label="发布状态" align="center" prop="publishStatus" width="120">
          <template #default="{ row }">
            <el-tag :type="publishStatusTagType(row.publishStatus)">{{ formatPublishStatus(row.publishStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" align="center" prop="publishedTime" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.publishedTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="260" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
              <el-button v-hasPermi="['vendor:reportTemplate:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
              <el-button
                v-if="canPublish(row)"
                v-hasPermi="['vendor:reportTemplate:edit']"
                link
                type="primary"
                icon="Promotion"
                :disabled="actioningId === row.id"
                @click="handlePublish(row)"
              >
                发布
              </el-button>
              <el-button
                v-if="canDisable(row)"
                v-hasPermi="['vendor:reportTemplate:edit']"
                link
                type="warning"
                icon="CircleClose"
                :disabled="actioningId === row.id"
                @click="handleDisable(row)"
              >
                停用
              </el-button>
              <el-button v-hasPermi="['vendor:reportTemplate:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
            </div>
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

    <el-drawer v-model="formDrawer.visible" :title="formDrawer.title" size="640px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板编码" prop="templateCode">
          <el-input v-model="form.templateCode" placeholder="请输入模板编码" maxlength="64" />
        </el-form-item>
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称" maxlength="128" />
        </el-form-item>
        <el-form-item label="模板版本" prop="templateVersion">
          <el-input v-model="form.templateVersion" placeholder="请输入模板版本" maxlength="32" />
        </el-form-item>
        <el-form-item label="模板文件" prop="fileUri">
          <div class="template-upload-field">
            <el-upload action="#" :http-request="handleUploadRequest" :before-upload="beforeUpload" :show-file-list="false" :disabled="fileUploading">
              <el-button type="primary" icon="Upload" :loading="fileUploading">上传文件</el-button>
            </el-upload>
            <span class="upload-tip">支持 pbix、pbit、xlsx、xlsm、xls、pdf</span>
          </div>
        </el-form-item>
        <el-form-item label="文件名" prop="fileName">
          <el-input v-model="form.fileName" placeholder="请先上传模板文件" readonly />
        </el-form-item>
        <el-form-item label="文件地址" prop="fileUri">
          <el-input v-model="form.fileUri" type="textarea" :rows="2" placeholder="上传后自动生成 vendor:// 文件地址" readonly />
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

    <el-drawer v-model="detailDrawer.visible" title="模板详情" size="600px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="模板编码">{{ formatText(detailRecord.templateCode) }}</el-descriptions-item>
        <el-descriptions-item label="模板名称">{{ formatText(detailRecord.templateName) }}</el-descriptions-item>
        <el-descriptions-item label="模板版本">{{ formatText(detailRecord.templateVersion) }}</el-descriptions-item>
        <el-descriptions-item label="文件名">{{ formatText(detailRecord.fileName) }}</el-descriptions-item>
        <el-descriptions-item label="文件地址">{{ formatText(detailRecord.fileUri) }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">{{ formatPublishStatus(detailRecord.publishStatus) }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ formatText(detailRecord.publishedBy) }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDateTime(detailRecord.publishedTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatText(detailRecord.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorReportTemplate" lang="ts">
import type { FormInstance, FormRules, UploadProps, UploadRequestOptions, UploadRawFile } from 'element-plus';
import {
  addReportTemplate,
  deleteReportTemplate,
  disableReportTemplate,
  getReportTemplate,
  listReportTemplate,
  publishReportTemplate,
  updateReportTemplate,
  uploadReportTemplateFile
} from '@/api/vendor/reportTemplate';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import type { ReportTemplateForm, ReportTemplateQuery, ReportTemplateUploadVO, ReportTemplateVO } from '@/api/vendor/reportTemplate/types';
import { formatDateTime, formatPublishStatus, formatText, publishStatusTagType, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const submitLoading = ref(false);
const fileUploading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const templateList = ref<ReportTemplateVO[]>([]);
const detailRecord = ref<ReportTemplateVO>();
const actioningId = ref<string | number>();
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

const queryParams = reactive<ReportTemplateQuery>({
  pageNum: 1,
  pageSize: 10,
  templateCode: undefined,
  templateName: undefined,
  templateVersion: undefined,
  publishStatus: undefined,
  params: {}
});

const form = reactive<ReportTemplateForm>({
  id: undefined,
  templateCode: '',
  templateName: '',
  templateVersion: '',
  fileName: '',
  fileUri: '',
  remark: ''
});

const rules: FormRules<ReportTemplateForm> = {
  templateCode: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }],
  templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  templateVersion: [{ required: true, message: '模板版本不能为空', trigger: 'blur' }],
  fileName: [{ required: true, message: '请先上传模板文件', trigger: 'change' }],
  fileUri: [{ required: true, message: '请先上传模板文件', trigger: 'change' }]
};

const resetForm = () => {
  form.id = undefined;
  form.templateCode = '';
  form.templateName = '';
  form.templateVersion = '';
  form.fileName = '';
  form.fileUri = '';
  form.remark = '';
  form.publishStatus = undefined;
  formRef.value?.clearValidate();
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listReportTemplate(queryParams);
    templateList.value = readRows<ReportTemplateVO>(res);
    total.value = readTotal(res, templateList.value);
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
  queryParams.templateCode = undefined;
  queryParams.templateName = undefined;
  queryParams.templateVersion = undefined;
  queryParams.publishStatus = undefined;
  await refreshList();
};

const handleSelectionChange = (selection: ReportTemplateVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增模板';
  formDrawer.visible = true;
};

const handleUpdate = async (row: ReportTemplateVO) => {
  resetForm();
  try {
    const res = await getReportTemplate(row.id);
    const data = res.data ?? row;
    form.id = data.id;
    form.templateCode = data.templateCode;
    form.templateName = data.templateName;
    form.templateVersion = data.templateVersion;
    form.fileName = data.fileName;
    form.fileUri = data.fileUri;
    form.remark = data.remark ?? '';
    form.publishStatus = data.publishStatus;
    formDrawer.title = '编辑模板';
    formDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  }
};

const beforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  const extension = rawFile.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pbix', 'pbit', 'xlsx', 'xlsm', 'xls', 'pdf'];
  if (!extension || !allowedExtensions.includes(extension)) {
    proxy?.$modal.msgError('仅支持 pbix、pbit、xlsx、xlsm、xls、pdf 文件');
    return false;
  }
  const maxSize = 200 * 1024 * 1024;
  if (rawFile.size > maxSize) {
    proxy?.$modal.msgError('模板文件不能超过 200MB');
    return false;
  }
  return true;
};

const applyUploadResult = (data: ReportTemplateUploadVO) => {
  form.fileName = data.fileName;
  form.fileUri = data.fileUri;
  formRef.value?.validateField(['fileName', 'fileUri']);
};

const handleUploadRequest = async (options: UploadRequestOptions) => {
  fileUploading.value = true;
  try {
    const payload = new FormData();
    payload.append('file', options.file);
    const res = await uploadReportTemplateFile(payload);
    if (!res.data) {
      throw new Error('empty upload response');
    }
    applyUploadResult(res.data);
    options.onSuccess(res);
    proxy?.$modal.msgSuccess('模板文件已上传');
  } catch (error) {
    options.onError(error as Error);
  } finally {
    fileUploading.value = false;
  }
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }
  submitLoading.value = true;
  try {
    if (form.id) {
      await updateReportTemplate(form);
      proxy?.$modal.msgSuccess('模板已更新');
    } else {
      await addReportTemplate(form);
      proxy?.$modal.msgSuccess('模板已新增');
    }
    formDrawer.visible = false;
    await getList();
  } catch {
    // Global request interceptor already shows the error.
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: ReportTemplateVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: ReportTemplateVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除模板“${row.templateName}”？` : `确认删除选中的 ${ids.value.length} 个模板？`;
    await proxy?.$modal.confirm(message);
    await deleteReportTemplate(deleteIds);
    proxy?.$modal.msgSuccess('模板已删除');
    await getList();
  } catch {
    // User cancelled or global request interceptor already shows the error.
  }
};

const canPublish = (row: ReportTemplateVO) => row.publishStatus === 'DRAFT';
const canDisable = (row: ReportTemplateVO) => row.publishStatus === 'PUBLISHED';

const syncLocalPublishStatus = (row: ReportTemplateVO, publishStatus: string) => {
  row.publishStatus = publishStatus;

  const currentRow = templateList.value.find((item) => item.id === row.id);
  if (currentRow) {
    currentRow.publishStatus = publishStatus;
  }

  if (detailRecord.value?.id === row.id) {
    detailRecord.value.publishStatus = publishStatus;
  }
};

const runPublishStatusAction = async (
  row: ReportTemplateVO,
  publishStatus: string,
  action: (id: string | number) => Promise<unknown>,
  successMessage: string
) => {
  actioningId.value = row.id;
  try {
    await action(row.id);
    syncLocalPublishStatus(row, publishStatus);
    try {
      await getList();
      proxy?.$modal.msgSuccess(successMessage);
    } catch {
      proxy?.$modal.msgWarning('动作成功但列表刷新失败，请手动刷新列表');
    }
  } catch {
    // Global request interceptor already shows the error.
  } finally {
    actioningId.value = undefined;
  }
};

const handlePublish = async (row: ReportTemplateVO) => {
  if (!canPublish(row)) {
    return;
  }
  await runPublishStatusAction(row, 'PUBLISHED', publishReportTemplate, '模板已发布');
};

const handleDisable = async (row: ReportTemplateVO) => {
  if (!canDisable(row)) {
    return;
  }
  await runPublishStatusAction(row, 'DISABLED', disableReportTemplate, '模板已停用');
};

onMounted(() => {
  void refreshList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.table-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.template-upload-field {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
