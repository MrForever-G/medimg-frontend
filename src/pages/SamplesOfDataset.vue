<template>
  <div class="page-wrapper">

    <div class="header">
      <h2 class="page-title">
        数据集 {{ datasetId }} 下的样本
      </h2>

      <el-button type="text" @click="goBack">
        ← 返回数据集
      </el-button>
    </div>

    <el-skeleton
      v-if="loading"
      :rows="6"
      animated
      style="margin-top: 20px;"
    />

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

      <el-table-column label="上传时间" width="180">
        <template #default="{ row }">
          {{ formatBeijingTime(row.created_at) }}
        </template>
      </el-table-column>

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

import { getSamplesByDataset, deleteSample } from "../api/samples";

/* 路由 */

const route = useRoute();
const router = useRouter();
const datasetId = Number(route.params.datasetId);

/* 状态 */

const samples = ref([]);
const loading = ref(false);

/* UTC → 北京时间 */

function formatBeijingTime(value) {
  if (!value) return "";
  const d = new Date(value + "Z");
  return d.toLocaleString("zh-CN", { hour12: false });
}

/* 数据 */

async function loadSamples() {
  loading.value = true;
  try {
    samples.value = await getSamplesByDataset(datasetId);
  } catch {
    ElMessage.error("加载样本列表失败");
    samples.value = [];
  } finally {
    loading.value = false;
  }
}

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

function goDetail(row) {
  router.push(`/samples/${row.id}`);
}

function goBack() {
  router.push(`/datasets/${datasetId}`);
}

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
