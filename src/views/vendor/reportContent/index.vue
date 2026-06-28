<template>
  <div class="page-panel report-content-page">
    <div class="page-head">
      <div>
        <h1>报表内容</h1>
        <p>配置企业端 Power BI 报表内容目录，企业端按授权自动同步到本地。</p>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>目录名称</label>
          <el-input v-model="queryParams.directoryName" placeholder="请输入目录名称" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>子目录名称</label>
          <el-input v-model="queryParams.subdirectoryName" placeholder="请输入子目录名称" clearable @keyup.enter="handleQuery" />
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
      <div v-show="!showSearch" class="search-bar search-bar-collapsed">
        <div class="search-actions">
          <right-toolbar v-model:showSearch="showSearch" :gutter="0" @query-table="refreshList" />
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button v-hasPermi="['vendor:reportContent:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['vendor:reportContent:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="contentList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="目录" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ formatDirectory(row) }}</template>
        </el-table-column>
        <el-table-column label="子目录" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ formatSubdirectory(row) }}</template>
        </el-table-column>
        <el-table-column label="页面图表" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">{{ formatText(row.chartNames) }}</template>
        </el-table-column>
        <el-table-column label="排序" prop="displayOrder" width="90" align="center" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'info' : 'success'">{{ row.status === '1' ? '停用' : '启用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="210" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-hasPermi="['vendor:reportContent:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['vendor:reportContent:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="104px">
        <el-form-item label="目录序号" prop="directoryNo">
          <el-input-number v-model="form.directoryNo" class="w-full" :min="1" :precision="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="目录名称" prop="directoryName">
          <el-input v-model="form.directoryName" placeholder="请输入目录名称" maxlength="128" />
        </el-form-item>
        <el-form-item label="子目录序号" prop="subdirectoryNo">
          <el-input-number v-model="form.subdirectoryNo" class="w-full" :min="1" :precision="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="子目录名称" prop="subdirectoryName">
          <el-input v-model="form.subdirectoryName" placeholder="请输入子目录名称" maxlength="128" />
        </el-form-item>
        <el-form-item label="页面图表" prop="chartNames">
          <el-input v-model="form.chartNames" type="textarea" :rows="5" placeholder="每行一个图表名称" maxlength="2000" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" prop="displayOrder">
          <el-input-number v-model="form.displayOrder" class="w-full" :min="0" :precision="0" controls-position="right" />
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

    <el-drawer v-model="detailDrawer.visible" title="报表内容详情" size="560px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="目录">{{ formatDirectory(detailRecord) }}</el-descriptions-item>
        <el-descriptions-item label="子目录">{{ formatSubdirectory(detailRecord) }}</el-descriptions-item>
        <el-descriptions-item label="页面图表">
          <ul class="chart-list">
            <li v-for="chart in splitCharts(detailRecord.chartNames)" :key="chart">{{ chart }}</li>
          </ul>
        </el-descriptions-item>
        <el-descriptions-item label="排序">{{ detailRecord.displayOrder ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailRecord.status === '1' ? '停用' : '启用' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatText(detailRecord.remark) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="VendorReportContent" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { addReportContent, deleteReportContent, getReportContent, listReportContent, updateReportContent } from '@/api/vendor/reportContent';
import type { ReportContentForm, ReportContentQuery, ReportContentVO } from '@/api/vendor/reportContent/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatText, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const contentList = ref<ReportContentVO[]>([]);
const detailRecord = ref<ReportContentVO>();
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const formRef = ref<FormInstance>();
const formDrawer = reactive({ visible: false, title: '' });
const detailDrawer = reactive({ visible: false });

const queryParams = reactive<ReportContentQuery>({
  pageNum: 1,
  pageSize: 10,
  directoryName: undefined,
  subdirectoryName: undefined,
  status: undefined,
  params: {}
});

const form = reactive<ReportContentForm>({
  id: undefined,
  directoryNo: 1,
  directoryName: '',
  subdirectoryNo: 1,
  subdirectoryName: '',
  chartNames: '',
  displayOrder: 0,
  status: '0',
  remark: ''
});

const rules: FormRules<ReportContentForm> = {
  directoryNo: [{ required: true, message: '目录序号不能为空', trigger: 'change' }],
  directoryName: [{ required: true, message: '目录名称不能为空', trigger: 'blur' }],
  subdirectoryNo: [{ required: true, message: '子目录序号不能为空', trigger: 'change' }],
  subdirectoryName: [{ required: true, message: '子目录名称不能为空', trigger: 'blur' }],
  chartNames: [{ required: true, message: '页面图表不能为空', trigger: 'blur' }]
};

const formatDirectory = (row: ReportContentVO) => `${row.directoryNo ?? '-'} ${row.directoryName ?? '-'}`;
const formatSubdirectory = (row: ReportContentVO) => `${row.directoryNo ?? '-'}.${row.subdirectoryNo ?? '-'} ${row.subdirectoryName ?? '-'}`;
const splitCharts = (value?: string) => String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);

const resetForm = () => {
  form.id = undefined;
  form.directoryNo = 1;
  form.directoryName = '';
  form.subdirectoryNo = 1;
  form.subdirectoryName = '';
  form.chartNames = '';
  form.displayOrder = 0;
  form.status = '0';
  form.remark = '';
  formRef.value?.clearValidate();
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listReportContent(queryParams);
    contentList.value = readRows<ReportContentVO>(res);
    total.value = readTotal(res, contentList.value);
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

const handleSelectionChange = (selection: ReportContentVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增报表内容';
  formDrawer.visible = true;
};

const handleUpdate = async (row: ReportContentVO) => {
  resetForm();
  try {
    const res = await getReportContent(row.id);
    const data = res.data ?? row;
    Object.assign(form, data);
    formDrawer.title = '编辑报表内容';
    formDrawer.visible = true;
  } catch {
    // Global request interceptor already shows the error.
  }
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitLoading.value = true;
  try {
    if (form.id) {
      await updateReportContent(form);
      proxy?.$modal.msgSuccess('报表内容已更新');
    } else {
      await addReportContent(form);
      proxy?.$modal.msgSuccess('报表内容已新增');
    }
    formDrawer.visible = false;
    await getList();
  } catch {
    // Global request interceptor already shows the error.
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: ReportContentVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: ReportContentVO) => {
  try {
    const deleteIds = row?.id || ids.value;
    const message = row ? `确认删除报表内容“${formatSubdirectory(row)}”？` : `确认删除选中的 ${ids.value.length} 条报表内容？`;
    await proxy?.$modal.confirm(message);
    await deleteReportContent(deleteIds);
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
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.w-full {
  width: 100%;
}

.chart-list {
  margin: 0;
  padding-left: 18px;
}
</style>
