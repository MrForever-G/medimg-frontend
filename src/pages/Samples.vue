<template>
  <div class="page-wrapper">

    <!-- 页面标题与操作区 -->
    <div class="header">
      <h2 class="page-title">样本管理</h2>

      <el-button type="primary" @click="openUploadDialog">
        上传样本
      </el-button>
    </div>

    <!-- 加载状态 -->
    <el-skeleton
      v-if="loading"
      :rows="6"
      animated
      style="margin-top: 20px;"
    />

    <!-- 样本表格 -->
    <el-table
      v-else
      :data="samples"
      border
      stripe
      highlight-current-row
      style="margin-top: 20px; cursor: pointer;"
      @row-click="goDetail"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="filename" label="文件名" min-width="180" />
      <el-table-column prop="dataset_id" label="数据集ID" width="120" />
      <el-table-column prop="sha256" label="SHA256" width="260" />
      <el-table-column prop="created_at" label="上传时间" width="180" />

      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            type="danger"
            size="small"
            @click.stop="remove(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && samples.length === 0"
      description="暂无样本"
      style="margin-top: 40px;"
    />

    <!-- 上传样本弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传样本"
      width="420px"
      destroy-on-close
    >
      <el-form label-width="90px">

        <el-form-item label="目标数据集" required>
          <el-select
            v-model="selectedDatasetId"
            placeholder="请选择数据集"
            style="width: 100%;"
          >
            <el-option
              v-for="ds in datasetOptions"
              :key="ds.id"
              :label="ds.name"
              :value="ds.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择文件" required>
          <el-upload
            :http-request="handleUpload"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png,.tif,.tiff"
          >
            <el-button type="primary">
              选择文件
            </el-button>
          </el-upload>
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">
          取消
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import { getAllSamples, deleteSample, uploadSampleFile } from "../api/samples";
import { getDatasets } from "../api/datasets";

/**
 * 路由实例
 */
const router = useRouter();

/**
 * 样本列表数据
 */
const samples = ref([]);

/**
 * 页面加载状态
 */
const loading = ref(false);

/**
 * 上传弹窗状态
 */
const uploadDialogVisible = ref(false);

/**
 * 数据集下拉选项
 */
const datasetOptions = ref([]);

/**
 * 当前选中的数据集 ID
 */
const selectedDatasetId = ref(null);

/**
 * 加载系统中的全部样本
 */
async function loadSamples() {
  loading.value = true;
  try {
    samples.value = await getAllSamples();
  } catch {
    ElMessage.error("加载样本失败");
    samples.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 打开上传弹窗并加载数据集列表
 */
async function openUploadDialog() {
  try {
    datasetOptions.value = await getDatasets();
    uploadDialogVisible.value = true;
  } catch {
    ElMessage.error("加载数据集列表失败");
  }
}

/**
 * 执行样本上传
 */
async function handleUpload({ file }) {
  if (!selectedDatasetId.value) {
    ElMessage.warning("请先选择数据集");
    return;
  }

  try {
    await uploadSampleFile(selectedDatasetId.value, file);
    ElMessage.success("上传成功");

    uploadDialogVisible.value = false;
    selectedDatasetId.value = null;

    loadSamples();
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "上传失败");
  }
}

/**
 * 进入样本详情页
 */
function goDetail(row) {
  router.push(`/samples/${row.id}`);
}

/**
 * 删除样本
 */
async function remove(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除样本「${row.filename}」？该操作不可恢复。`,
      "删除确认",
      { type: "warning" }
    );

    await deleteSample(row.id);
    ElMessage.success("删除成功");
    loadSamples();
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
}

/**
 * 页面初始化
 */
onMounted(loadSamples);
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
</style>
