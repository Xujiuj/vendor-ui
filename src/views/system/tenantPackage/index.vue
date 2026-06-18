<template>
  <div class="p-2">
    <section class="page-head">
      <div>
        <h1>套餐管理</h1>
        <p>维护厂商端授权套餐、功能范围、租户容量与启停状态。</p>
      </div>
    </section>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="套餐名称" prop="packageName">
              <el-input v-model="queryParams.packageName" placeholder="请输入套餐名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:add']" type="primary" plain icon="Plus" @click="handleAdd"> 新增 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenantPackage:export']" type="warning" plain icon="Download" @click="handleExport">导出 </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="tenantPackageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="套餐名称" align="center" prop="packageName" />
        <el-table-column label="默认数据范围" align="center" prop="remark" width="150">
          <template #default="{ row }">
            {{ formatVisibilityScope(readDataVisibility(row.remark)?.defaultScope) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark">
          <template #default="{ row }">
            {{ formatPlainRemark(row.remark) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @click="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                v-hasPermi="['system:tenantPackage:edit']"
                link
                type="primary"
                icon="Edit"
                aria-label="修改"
                @click="handleUpdate(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['system:tenantPackage:remove']"
                link
                type="primary"
                icon="Delete"
                aria-label="删除"
                @click="handleDelete(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- 添加或修改客户套餐对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="tenantPackageFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="套餐名称" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="默认数据范围">
          <el-select v-model="dataVisibility.defaultScope" class="w-full" placeholder="请选择默认数据范围">
            <el-option v-for="option in visibilityScopeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="逐类数据范围">
          <div class="scope-list">
            <div v-for="item in dataVisibility.items" :key="item.code" class="scope-row">
              <span>{{ item.label }}</span>
              <el-select v-model="item.scope" placeholder="请选择可见范围">
                <el-option v-for="option in visibilityScopeOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TenantPackage" lang="ts">
import {
  listTenantPackage,
  getTenantPackage,
  delTenantPackage,
  addTenantPackage,
  updateTenantPackage,
  changePackageStatus
} from '@/api/system/tenantPackage';
import { useAutoQuery } from '@/hooks/useAutoQuery';
import { TenantPkgForm, TenantPkgQuery, TenantPkgVO } from '@/api/system/tenantPackage/types';
import to from 'await-to-js';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tenantPackageList = ref<TenantPkgVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tenantPackageFormRef = ref<ElFormInstance>();

const visibilityScopeOptions = [
  { label: '全部数据可见', value: 'all' },
  { label: '仅本企业数据', value: 'tenant' },
  { label: '仅已授权客户数据', value: 'authorized_customer' },
  { label: '不可见', value: 'none' }
];

const visibilityCategories = [
  { label: '排放源数据', code: 'emission_source' },
  { label: '排放因子数据', code: 'factor' },
  { label: '活动数据', code: 'activity_data' },
  { label: '绿电绿证数据', code: 'green_electricity' },
  { label: '强度管理数据', code: 'intensity' },
  { label: '报表模板数据', code: 'report_template' }
];

const dataVisibility = reactive({
  defaultScope: 'tenant',
  items: visibilityCategories.map((item) => ({ ...item, scope: 'tenant' }))
});

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TenantPkgForm = {
  packageId: undefined,
  packageName: '',
  menuIds: '',
  remark: '',
  menuCheckStrictly: false
};
const data = reactive<PageData<TenantPkgForm, TenantPkgQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    packageName: ''
  },
  rules: {
    packageName: [{ required: true, message: '套餐名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const visibilityPrefix = '[DATA_VISIBILITY]';
type DataVisibilityPayload = { defaultScope?: string; items?: Array<{ code: string; scope: string }> };

const resetDataVisibility = () => {
  dataVisibility.defaultScope = 'tenant';
  dataVisibility.items = visibilityCategories.map((item) => ({ ...item, scope: 'tenant' }));
};

const parseDataVisibilityFromRemark = (remark?: string) => {
  resetDataVisibility();
  const parsed = readDataVisibility(remark);
  if (parsed) {
    if (parsed.defaultScope) {
      dataVisibility.defaultScope = parsed.defaultScope;
    }
    dataVisibility.items = visibilityCategories.map((category) => ({
      ...category,
      scope: parsed.items?.find((item) => item.code === category.code)?.scope || parsed.defaultScope || 'tenant'
    }));
  }
  return formatPlainRemark(remark);
};

const buildRemarkWithDataVisibility = (remark?: string) => {
  const payload = {
    defaultScope: dataVisibility.defaultScope,
    items: dataVisibility.items.map((item) => ({ code: item.code, scope: item.scope }))
  };
  return `${formatPlainRemark(remark).trim() || ''}\n${visibilityPrefix}${JSON.stringify(payload)}`.trim();
};

const formatVisibilityScope = (scope?: string) => visibilityScopeOptions.find((option) => option.value === scope)?.label || '-';

const formatPlainRemark = (remark?: string) => {
  if (!remark?.includes(visibilityPrefix)) {
    return remark || '';
  }
  return remark.slice(0, remark.indexOf(visibilityPrefix)).trim();
};

const readDataVisibility = (remark?: string): DataVisibilityPayload | undefined => {
  if (!remark?.includes(visibilityPrefix)) {
    return undefined;
  }
  try {
    return JSON.parse(remark.slice(remark.indexOf(visibilityPrefix) + visibilityPrefix.length) || '{}') as DataVisibilityPayload;
  } catch {
    return undefined;
  }
};

/** 查询客户套餐列表 */
const getList = async () => {
  loading.value = true;
  const res = await listTenantPackage(queryParams.value);
  tenantPackageList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

// 客户套餐状态修改
const handleStatusChange = async (row: TenantPkgVO) => {
  const text = row.status === '0' ? '启用' : '停用';
  const [err] = await to(proxy?.$modal.confirm('确认要"' + text + '""' + row.packageName + '"套餐吗？') as Promise<any>);
  if (err) {
    row.status = row.status === '0' ? '1' : '0';
  } else {
    await changePackageStatus(row.packageId, row.status);
    proxy?.$modal.msgSuccess(text + '成功');
  }
};

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
};

// 表单重置
const reset = () => {
  form.value = { ...initFormData };
  resetDataVisibility();
  tenantPackageFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// 多选框选中数据
const handleSelectionChange = (selection: TenantPkgVO[]) => {
  ids.value = selection.map((item) => item.packageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加套餐';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: TenantPkgVO) => {
  reset();
  const _packageId = row?.packageId || ids.value[0];
  const response = await getTenantPackage(_packageId);
  form.value = response.data;
  form.value.remark = parseDataVisibilityFromRemark(form.value.remark);
  dialog.visible = true;
  dialog.title = '修改套餐';
};

/** 提交按钮 */
const submitForm = () => {
  tenantPackageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.menuIds = '';
      form.value.menuCheckStrictly = false;
      form.value.remark = buildRemarkWithDataVisibility(form.value.remark);
      if (form.value.packageId != null) {
        await updateTenantPackage(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTenantPackage(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: TenantPkgVO) => {
  const _packageIds = row?.packageId || ids.value;
  const message = row ? `是否确认删除套餐“${row.packageName}”？` : `是否确认删除选中的 ${ids.value.length} 个套餐？`;
  await proxy?.$modal.confirm(message);
  await delTenantPackage(_packageIds);
  loading.value = true;
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/tenant/package/export',
    {
      ...queryParams.value
    },
    `tenantPackage_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});

useAutoQuery(queryParams, () => handleQuery());
</script>

<style scoped lang="scss">
.scope-list {
  display: grid;
  width: 100%;
  gap: 10px;
}

.scope-row {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(180px, 1.4fr);
  align-items: center;
  gap: 12px;
}

.scope-row span {
  color: var(--el-text-color-regular);
}

.w-full {
  width: 100%;
}
</style>
