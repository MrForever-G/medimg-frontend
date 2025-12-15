<template>
  <div class="page-wrapper">
    <el-card class="card-box">

      <div class="header-row">
        <el-button type="text" @click="goBack">
          ← 返回样本列表
        </el-button>

        <div class="actions">
          <el-button type="default" @click="goAnnotate">
            进入标注
          </el-button>

          <!-- 从未申请 -->
          <el-button
            v-if="!approval"
            type="warning"
            @click="requestDownload"
          >
            申请下载样本
          </el-button>

          <!-- 审批中 -->
          <el-tag
            v-else-if="approval.decision === 'pending'"
            type="info"
            effect="plain"
          >
            下载审批中
          </el-tag>

          <!-- 已通过 -->
          <el-button
            v-else-if="approval.decision === 'approved'"
            type="success"
            :loading="downloading"
            @click="downloadSampleFile"
          >
            下载样本
          </el-button>

          <!-- 已拒绝 -->
          <div v-else>
            <el-tag type="danger" effect="plain">
              当前无下载权限
            </el-tag>
            <el-button size="small" type="warning" @click="requestDownload">
              重新申请
            </el-button>
          </div>
        </div>
      </div>

      <el-skeleton v-if="loading" :rows="5" animated />

      <el-descriptions v-else-if="sample" border :column="1" style="margin-top:20px">
        <el-descriptions-item label="样本 ID">
          {{ sample.id }}
        </el-descriptions-item>

        <el-descriptions-item label="所属数据集 ID">
          {{ sample.dataset_id }}
        </el-descriptions-item>

        <el-descriptions-item label="文件名">
          {{ sample.filename }}
        </el-descriptions-item>

        <el-descriptions-item label="SHA256">
          {{ sample.sha256 }}
        </el-descriptions-item>

        <el-descriptions-item label="上传时间">
          {{ formatBeijingTime(sample.created_at) }}
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        v-if="approval"
        style="margin-top: 20px"
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>
          下载审批状态：{{ approval.decision }}
          <span v-if="approval.expires_at">
            （有效期至 {{ formatBeijingTime(approval.expires_at) }}）
          </span>
        </template>
      </el-alert>

    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import {
  getSampleDetail,
  requestSampleDownload,
  getMySampleApproval,
  downloadSample
} from "../api/samples";

/* 路由 */

const route = useRoute();
const router = useRouter();
const sampleId = Number(route.params.id);

/* 状态 */

const sample = ref(null);
const approval = ref(null);
const loading = ref(false);
const downloading = ref(false);

/* 时间 */

function formatBeijingTime(value) {
  if (!value) return "";
  const d = new Date(value + "Z");
  return d.toLocaleString("zh-CN", { hour12: false });
}

/* 数据 */

async function loadSample() {
  loading.value = true;
  try {
    sample.value = await getSampleDetail(sampleId);
  } catch {
    ElMessage.error("加载样本详情失败");
    sample.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadApproval() {
  try {
    approval.value = await getMySampleApproval(sampleId);
  } catch {
    approval.value = null;
  }
}

/* 行为 */

function goAnnotate() {
  router.push(`/annotations/${sampleId}`);
}

function goBack() {
  router.push("/samples");
}

async function requestDownload() {
  try {
    await requestSampleDownload(sampleId);
    ElMessage.success("已提交下载申请");
    loadApproval();
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "申请失败");
  }
}

async function downloadSampleFile() {
  try {
    downloading.value = true;
    const res = await downloadSample(sampleId);
    const blob = new Blob([res]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = sample.value.filename;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "下载失败");
  } finally {
    downloading.value = false;
  }
}

/* 初始化 */

onMounted(() => {
  if (!Number.isFinite(sampleId)) {
    ElMessage.error("非法的样本 ID");
    router.push("/samples");
    return;
  }
  loadSample();
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
</style>
