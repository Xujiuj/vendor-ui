<template>
  <div class="page-panel">
    <div class="page-head announcement-head">
      <div>
        <h1>公告管理</h1>
      </div>
    </div>

    <div class="panel">
      <div v-show="showSearch" class="search-bar wide">
        <div class="search-item">
          <label>公告标题</label>
          <el-input v-model="queryParams.noticeTitle" placeholder="请输入公告标题" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>操作人员</label>
          <el-input v-model="queryParams.createByName" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
        </div>
        <div class="search-item">
          <label>公告类型</label>
          <el-select v-model="queryParams.noticeType" placeholder="请选择公告类型" clearable>
            <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </div>
        <div class="search-item">
          <label>状态</label>
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option v-for="dict in sys_notice_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </div>
      </div>

      <div class="toolbar">
        <div class="btns">
          <el-button v-hasPermi="['vendor:announcement:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['vendor:announcement:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
            删除
          </el-button>
          <el-button icon="Refresh" @click="refreshList">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="announcementList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="公告标题" align="center" prop="noticeTitle" min-width="220" :show-overflow-tooltip="true" />
        <el-table-column label="公告类型" align="center" prop="noticeType" width="120">
          <template #default="{ row }">
            <dict-tag :options="sys_notice_type" :value="row.noticeType" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="110">
          <template #default="{ row }">
            <dict-tag :options="sys_notice_status" :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建者" align="center" prop="createByName" width="120" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="210" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="openDetail(row)">详情</el-button>
            <el-button v-hasPermi="['vendor:announcement:edit']" link type="primary" icon="Edit" @click="handleUpdate(row)">编辑</el-button>
            <el-button v-hasPermi="['vendor:announcement:remove']" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
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

    <el-drawer v-model="formDrawer.visible" :title="formDrawer.title" size="720px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="公告标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" maxlength="50" />
        </el-form-item>
        <el-form-item label="公告类型" prop="noticeType">
          <el-select v-model="form.noticeType" placeholder="请选择公告类型" class="w-full">
            <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_notice_status" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="公告内容" prop="noticeContent">
          <editor v-model="form.noticeContent" :min-height="220" />
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

    <el-drawer v-model="detailDrawer.visible" title="公告详情" size="640px" append-to-body>
      <el-descriptions v-if="detailRecord" :column="1" border>
        <el-descriptions-item label="公告标题">{{ formatText(detailRecord.noticeTitle) }}</el-descriptions-item>
        <el-descriptions-item label="公告类型">
          <dict-tag :options="sys_notice_type" :value="detailRecord.noticeType" />
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :options="sys_notice_status" :value="detailRecord.status" />
        </el-descriptions-item>
        <el-descriptions-item label="创建者">{{ formatText(detailRecord.createByName) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailRecord.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ formatText(detailRecord.remark) }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detailRecord" class="notice-content" v-html="detailRecord.noticeContent || '暂无公告内容'"></div>
    </el-drawer>
  </div>
</template>

<script setup name="VendorAnnouncement" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { addAnnouncement, deleteAnnouncement, getAnnouncement, listAnnouncement, updateAnnouncement } from '@/api/vendor/announcement';
import type { AnnouncementForm, AnnouncementQuery, AnnouncementVO } from '@/api/vendor/announcement/types';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { formatDateTime, formatText, readRows, readTotal } from '../shared';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_notice_status, sys_notice_type } = toRefs<any>(proxy?.useDict('sys_notice_status', 'sys_notice_type'));

const loading = ref(false);
const submitLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const announcementList = ref<AnnouncementVO[]>([]);
const detailRecord = ref<AnnouncementVO>();
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

const queryParams = reactive<AnnouncementQuery>({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: undefined,
  createByName: undefined,
  noticeType: undefined,
  status: undefined,
  params: {}
});

const form = reactive<AnnouncementForm>({
  noticeId: undefined,
  noticeTitle: '',
  noticeType: '',
  noticeContent: '',
  status: '0',
  remark: '',
  createByName: ''
});

const rules: FormRules<AnnouncementForm> = {
  noticeTitle: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
  noticeType: [{ required: true, message: '公告类型不能为空', trigger: 'change' }]
};

const resetForm = () => {
  form.noticeId = undefined;
  form.noticeTitle = '';
  form.noticeType = '';
  form.noticeContent = '';
  form.status = '0';
  form.remark = '';
  form.createByName = '';
  formRef.value?.clearValidate();
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listAnnouncement(queryParams);
    announcementList.value = readRows<AnnouncementVO>(res);
    total.value = readTotal(res, announcementList.value);
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
  queryParams.noticeTitle = undefined;
  queryParams.createByName = undefined;
  queryParams.noticeType = undefined;
  queryParams.status = undefined;
  await refreshList();
};

const handleSelectionChange = (selection: AnnouncementVO[]) => {
  ids.value = selection.map((item) => item.noticeId);
  multiple.value = !selection.length;
};

const handleAdd = () => {
  resetForm();
  formDrawer.title = '新增公告';
  formDrawer.visible = true;
};

const handleUpdate = async (row: AnnouncementVO) => {
  resetForm();
  try {
    const res = await getAnnouncement(row.noticeId);
    const data = res.data ?? row;
    form.noticeId = data.noticeId;
    form.noticeTitle = data.noticeTitle;
    form.noticeType = data.noticeType;
    form.noticeContent = data.noticeContent ?? '';
    form.status = data.status ?? '0';
    form.remark = data.remark ?? '';
    form.createByName = data.createByName ?? '';
    formDrawer.title = '编辑公告';
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
    if (form.noticeId) {
      await updateAnnouncement(form);
      proxy?.$modal.msgSuccess('公告已更新');
    } else {
      await addAnnouncement(form);
      proxy?.$modal.msgSuccess('公告已新增');
    }
    formDrawer.visible = false;
    await getList();
  } catch {
    // Global request interceptor already shows the error.
  } finally {
    submitLoading.value = false;
  }
};

const openDetail = (row: AnnouncementVO) => {
  detailRecord.value = row;
  detailDrawer.visible = true;
};

const handleDelete = async (row?: AnnouncementVO) => {
  try {
    const deleteIds = row?.noticeId || ids.value;
    const message = row ? `确认删除公告“${row.noticeTitle}”？` : `确认删除选中的 ${ids.value.length} 条公告？`;
    await proxy?.$modal.confirm(message);
    await deleteAnnouncement(deleteIds);
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
.announcement-head {
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

.notice-content {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--carbon-soft-line);
  border-radius: 8px;
  color: var(--carbon-ink);
  background: var(--carbon-panel);
  line-height: 1.7;
}
</style>
