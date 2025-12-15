<template>
  <div class="page-wrapper">
    <el-card class="card-box">

      <!-- 顶部操作区 -->
      <div class="header-row">
        <el-button type="text" @click="goBack">
          ← 返回数据集列表
        </el-button>

        <div class="actions">
          <!-- 上传样本（隐式绑定当前数据集） -->
          <el-upload
            :http-request="uploadSample"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png,.tif,.tiff"
          >
            <el-button type="primary">
              上传样本
            </el-button>
          </el-upload>

          <el-button type="default" @click="goSamples">
            查看样本
          </el-button>

          <el-button
            type="warning"
            :disabled="!dataset"
            @click="requestDownload"
          >
            申请下载数据集
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <el-skeleton
        v-if="loading"
        :rows="4"
        animated
        style="margin-top: 20px;"
      />

      <!-- 数据集信息 -->
      <div v-else-if="dataset">
        <h2 class="dataset-title">{{ dataset.name }}</h2>

        <el-descriptions border :column="2" style="margin-top: 20px;">
          <el-descriptions-item label="描述">
            {{ dataset.description || "无" }}
          </el-descriptions-item>
          <el-descriptions-item label="版本">
            {{ dataset.version || "未指定" }}
          </el-descriptions-item>
          <el-descriptions-item label="可见性">
            {{ dataset.visibility }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者 ID">
            {{ dataset.created_by }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ dataset.created_at }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-empty
        v-else
        description="数据集不存在或无访问权限"
      />

    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import { getDataset, requestDatasetDownload } from "../api/datasets";
import { uploadSampleFile } from "../api/samples";

/**
 * 路由实例
 */
const route = useRoute();
const router = useRouter();

/**
 * 当前数据集 ID
 *
 * 数据集下载采用“申请-审批”模式，
 * 前端仅提供申请入口，不直接暴露下载行为。
 */
const datasetId = Number(route.params.id);

/**
 * 数据集实体
 */
const dataset = ref(null);

/**
 * 页面加载状态
 */
const loading = ref(false);

/**
 * 加载数据集详情
 */
async function loadDataset() {
  loading.value = true;
  try {
    dataset.value = await getDataset(datasetId);
  } catch {
    ElMessage.error("获取数据集详情失败");
    dataset.value = null;
  } finally {
    loading.value = false;
  }
}

/**
 * 上传样本（绑定当前数据集）
 */
async function uploadSample({ file }) {
  try {
    await uploadSampleFile(datasetId, file);
    ElMessage.success("上传成功");
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "上传失败");
  }
}

/**
 * 申请下载数据集
 *
 * 是否允许下载、是否生成压缩包、
 * 是否需要审批，均由后端决定。
 */
async function requestDownload() {
  try {
    await requestDatasetDownload(datasetId);
    ElMessage.success("已提交下载申请，请等待审批");
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "申请失败");
  }
}

/**
 * 返回数据集列表
 */
function goBack() {
  router.push("/datasets");
}

/**
 * 查看当前数据集下的样本
 */
function goSamples() {
  router.push(`/datasets/${datasetId}/samples`);
}

onMounted(() => {
  if (!Number.isFinite(datasetId)) {
    ElMessage.error("非法的数据集 ID");
    router.push("/datasets");
    return;
  }
  loadDataset();
});
</script>

<style scoped>
.page-wrapper {
  padding: 30px;
}

.card-box {
  padding: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
}

.dataset-title {
  margin-top: 20px;
  font-size: 22px;
  font-weight: 600;
}
</style>
