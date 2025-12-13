<template>
  <div class="page-wrapper">

    <!-- 页面标题与返回操作 -->
    <div class="header">
      <h2 class="page-title">
        数据集 {{ datasetId }} 下的样本
      </h2>

      <el-button type="text" @click="goBack">
        ← 返回数据集
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
      <el-table-column prop="sha256" label="SHA256" width="260" />
      <el-table-column prop="created_at" label="上传时间" width="180" />

      <!-- 操作列 -->
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

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && samples.length === 0"
      description="该数据集下暂无样本"
      style="margin-top: 40px;"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import {
  getSamplesByDataset,
  deleteSample
} from "../api/samples";

/**
 * 路由实例
 */
const route = useRoute();
const router = useRouter();

/**
 * 当前数据集 ID
 */
const datasetId = Number(route.params.datasetId);

/**
 * 样本列表数据
 */
const samples = ref([]);

/**
 * 页面加载状态
 */
const loading = ref(false);

/**
 * 加载指定数据集下的样本列表
 */
async function loadSamples() {
  loading.value = true;

  try {
    samples.value = await getSamplesByDataset(datasetId);
  } catch (e) {
    ElMessage.error("加载样本列表失败");
    samples.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 删除样本，需二次确认
 */
async function handleDelete(row) {
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
 * 进入样本详情页
 */
function goDetail(row) {
  router.push(`/samples/${row.id}`);
}

/**
 * 返回数据集详情页
 */
function goBack() {
  router.push(`/datasets/${datasetId}`);
}

/**
 * 页面初始化
 */
onMounted(() => {
  if (!Number.isFinite(datasetId)) {
    ElMessage.error("非法的数据集 ID");
    router.push("/datasets");
    return;
  }

  loadSamples();
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
  font-size: 22px;
  font-weight: 600;
}
</style>
