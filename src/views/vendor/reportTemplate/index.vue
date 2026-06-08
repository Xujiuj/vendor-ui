<template>
  <div class="page-panel">
    <div class="page-head">
      <div>
        <h1>模板管理</h1>
        <p>维护厂商云端报表模板元数据，并通过后端已有发布和停用动作控制生命周期。</p>
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
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button type="primary" icon="Search" @click="showSearch = !showSearch">{{ showSearch ? '收起搜索' : '展开搜索' }}</el-button>
          <el-button icon="Refresh" @click="refreshList">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="templateList" border>
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
        <el-table-column label="操作" align="center" width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button
              v-if="canPublish(row)"
              v-hasPermi="['vendor:reportTemplate:edit']"
              link
              type="success"
              icon="CircleCheck"
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
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="refreshList" />
    </div>

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
import { disableReportTemplate, listReportTemplate, publishReportTemplate } from '@/api/vendor/reportTemplate';
import type { ReportTemplateQuery, ReportTemplateVO } from '@/api/vendor/reportTemplate/types';
import { formatDateTime, formatPublishStatus, formatText, publishStatusTagType, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const templateList = ref<ReportTemplateVO[]>([]);
const detailRecord = ref<ReportTemplateVO>();
const actioningId = ref<string | number>();
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

const openDetail = (row: ReportTemplateVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
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
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
