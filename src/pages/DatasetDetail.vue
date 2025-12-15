<template>
  <div class="page-wrapper">
    <el-card class="card-box">

      <!-- 顶部操作区 -->
      <div class="header-row">
        <el-button type="text" @click="goBack">
          ← 返回数据集列表
        </el-button>

        <div class="actions">
          <!-- 上传样本 -->
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

          <!-- 下载相关：仅由审批状态驱动 -->

          <!-- 从未申请 -->
          <el-button
            v-if="!approvalData"
            type="warning"
            :disabled="!dataset"
            @click="requestDownload"
          >
            申请下载数据集
          </el-button>

          <!-- 审批中 -->
          <el-tag
            v-else-if="approvalData.decision === 'pending'"
            type="info"
            effect="plain"
          >
            下载审批中
          </el-tag>

          <!-- 已通过（是否过期由后端决定） -->
          <el-button
            v-else-if="approvalData.decision === 'approved'"
            type="success"
            :loading="downloading"
            @click="downloadDatasetFile"
          >
            下载数据集
          </el-button>

          <!-- 已拒绝 -->
          <div
            v-else
            style="display: flex; align-items: center; gap: 8px;"
          >
            <el-tag type="danger" effect="plain">
              当前无下载权限
            </el-tag>

            <el-button
              type="warning"
              size="small"
              @click="requestDownload"
            >
              重新申请
            </el-button>
          </div>
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
            {{ formatBeijingTime(dataset.created_at) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 当前审批状态展示 -->
        <el-alert
          v-if="approvalData"
          style="margin-top: 20px;"
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            下载审批状态：{{ approvalData.decision }}
            <span v-if="approvalData.expires_at">
              （有效期至 {{ formatBeijingTime(approvalData.expires_at) }}）
            </span>
          </template>
        </el-alert>
      </div>

      <el-empty
        v-else
        description="数据集不存在或无访问权限"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import {
  getDataset,
  requestDatasetDownload,
  getMyDatasetApproval,
  downloadDataset
} from "../api/datasets";

import { uploadSampleFile } from "../api/samples";

/* 路由 */

const route = useRoute();
const router = useRouter();
const datasetId = Number(route.params.id);

/* 页面状态 */

const dataset = ref(null);
const approval = ref(null);
const loading = ref(false);
const downloading = ref(false);

/* 派生状态 */

const approvalData = computed(() => approval.value);

/* 时间展示（UTC → 北京时间） */

function formatBeijingTime(value) {
  if (!value) return "";
  const d = new Date(value + "Z");
  return d.toLocaleString("zh-CN", { hour12: false });
}

/* 数据加载 */

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

async function loadApproval() {
  try {
    approval.value = await getMyDatasetApproval(datasetId);
  } catch {
    approval.value = null;
  }
}

/* 行为函数 */

async function uploadSample({ file }) {
  try {
    await uploadSampleFile(datasetId, file);
    ElMessage.success("上传成功");
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "上传失败");
  }
}

async function requestDownload() {
  try {
    await requestDatasetDownload(datasetId);
    ElMessage.success("已提交下载申请，请等待审批");
    loadApproval();
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "申请失败");
  }
}

async function downloadDatasetFile() {
  try {
    downloading.value = true;

    const res = await downloadDataset(datasetId);
    const blob = new Blob([res], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset_${datasetId}.zip`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "下载失败");
  } finally {
    downloading.value = false;
  }
}

/* 导航 */

function goBack() {
  router.push("/datasets");
}

function goSamples() {
  router.push(`/datasets/${datasetId}/samples`);
}

/* 初始化 */

onMounted(() => {
  if (!Number.isFinite(datasetId)) {
    ElMessage.error("非法的数据集 ID");
    router.push("/datasets");
    return;
  }
  loadDataset();
  loadApproval();
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
  align-items: center;
}

.dataset-title {
  margin-top: 20px;
  font-size: 22px;
  font-weight: 600;
}
</style>
