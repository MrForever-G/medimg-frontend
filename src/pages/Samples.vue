<template>
  <div class="page-wrapper">

    <div class="header">
      <h2 class="page-title">样本管理</h2>

      <el-button type="primary" @click="hintUpload">
        上传样本
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

    <el-empty
      v-if="!loading && samples.length === 0"
      description="暂无样本"
      style="margin-top: 40px;"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import { getAllSamples, deleteSample } from "../api/samples";

const router = useRouter();

const samples = ref([]);
const loading = ref(false);

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

function goDetail(row) {
  router.push(`/samples/${row.id}`);
}

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

function hintUpload() {
  ElMessage.warning("请从具体数据集页面上传样本");
}

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
