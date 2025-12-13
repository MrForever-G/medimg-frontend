<template>
  <div class="page-wrapper">

    <!-- 页面标题与操作区 -->
    <div class="header">
      <h2 class="page-title">数据集管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        新建数据集
      </el-button>
    </div>

    <!-- 数据集列表卡片 -->
    <el-card class="card-box">

      <!-- 加载骨架屏 -->
      <el-skeleton
        v-if="loading"
        :rows="6"
        animated
        style="margin-top: 10px;"
      />

      <!-- 空状态 -->
      <el-empty
        v-else-if="datasetList.length === 0"
        description="暂无数据集"
      />

      <!-- 数据表格 -->
      <el-table
        v-else
        :data="datasetList"
        border
        stripe
        highlight-current-row
        @row-click="goDetail"
        style="width: 100%; cursor: pointer;"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="visibility" label="可见性" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="created_by" label="创建者ID" width="120" />

        <!-- 操作列：必须阻断行点击事件冒泡 -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <!-- 新建数据集弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建数据集"
      width="420px"
      destroy-on-close
    >
      <el-form :model="createForm" label-width="80px">

        <el-form-item label="名称" required>
          <el-input
            v-model="createForm.name"
            placeholder="请输入数据集名称"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            placeholder="可选"
          />
        </el-form-item>

        <el-form-item label="可见性">
          <el-select v-model="createForm.visibility" placeholder="请选择">
            <el-option label="group" value="group" />
            <el-option label="private" value="private" />
          </el-select>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submitCreate"
        >
          创建
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getDatasets,
  createDataset,
  deleteDataset
} from "../api/datasets";

/**
 * 路由实例
 */
const router = useRouter();

/**
 * 数据集列表数据源
 */
const datasetList = ref([]);

/**
 * 页面加载状态
 */
const loading = ref(false);

/**
 * 新建数据集弹窗状态
 */
const createDialogVisible = ref(false);
const submitLoading = ref(false);

/**
 * 新建数据集表单模型
 */
const createForm = ref({
  name: "",
  description: "",
  visibility: "group",
});

/**
 * 打开新建数据集弹窗
 */
function openCreateDialog() {
  createDialogVisible.value = true;
}

/**
 * 提交新建数据集请求
 */
async function submitCreate() {
  if (!createForm.value.name.trim()) {
    return ElMessage.warning("请输入名称");
  }

  submitLoading.value = true;

  try {
    await createDataset(createForm.value);
    ElMessage.success("创建成功");

    createDialogVisible.value = false;
    loadDatasets();
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "创建失败");
  } finally {
    submitLoading.value = false;
  }
}

/**
 * 加载当前用户可见的数据集列表
 */
async function loadDatasets() {
  loading.value = true;

  try {
    datasetList.value = await getDatasets();
  } catch (e) {
    ElMessage.error("加载数据集失败");
  } finally {
    loading.value = false;
  }
}

/**
 * 行点击进入数据集详情页
 * 行点击是页面唯一跳转入口
 */
function goDetail(row) {
  router.push(`/datasets/${row.id}`);
}

/**
 * 删除数据集，需二次确认
 * 删除按钮必须阻断行点击事件冒泡
 */
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除数据集「${row.name}」？该操作将同时删除其下所有样本，且不可恢复。`,
      "删除确认",
      { type: "warning" }
    );

    await deleteDataset(row.id);
    ElMessage.success("删除成功");

    loadDatasets();
  } catch (e) {
    // 用户取消删除时不做任何提示
    if (e !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
}

/**
 * 页面初始化加载
 */
onMounted(() => {
  loadDatasets();
});
</script>

<style scoped>
.page-wrapper {
  padding: 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
}

.card-box {
  margin-top: 20px;
  padding: 10px;
}
</style>
