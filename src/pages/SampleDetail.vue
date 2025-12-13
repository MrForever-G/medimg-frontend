<template>
  <div class="page-wrapper">

    <!-- 页面标题与操作区 -->
    <div class="header">
      <h2 class="page-title">样本详情</h2>

      <div class="actions">
        <el-button
          type="primary"
          @click="goAnnotation"
          disabled
        >
          进入标注
        </el-button>

        <el-button
          type="default"
          @click="downloadSample"
          disabled
        >
          下载样本
        </el-button>
      </div>
    </div>

    <!-- 样本元信息 -->
    <el-descriptions
      v-if="info"
      :column="1"
      border
      style="margin-top: 20px;"
    >
      <el-descriptions-item label="样本 ID">
        {{ info.id }}
      </el-descriptions-item>

      <el-descriptions-item label="所属数据集">
        {{ info.dataset_id }}
      </el-descriptions-item>

      <el-descriptions-item label="文件名">
        {{ info.filename }}
      </el-descriptions-item>

      <el-descriptions-item label="SHA256">
        {{ info.sha256 }}
      </el-descriptions-item>

      <el-descriptions-item label="上传时间">
        {{ info.created_at }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 图像预览（若后端后续支持直链访问） -->
    <div class="image-preview" v-if="previewUrl">
      <img :src="previewUrl" alt="sample image" />
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && !info"
      description="样本不存在或无访问权限"
      style="margin-top: 40px;"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import { getSampleDetail } from "../api/samples";

/**
 * 路由实例
 */
const route = useRoute();
const router = useRouter();

/**
 * 当前样本 ID
 */
const sampleId = Number(route.params.id);

/**
 * 样本详情数据
 */
const info = ref(null);

/**
 * 页面加载状态
 */
const loading = ref(false);

/**
 * 图像预览地址
 * 当前阶段为占位，待后端支持文件直链或下载接口后启用
 */
const previewUrl = ref(null);

/**
 * 加载样本详情
 */
async function loadDetail() {
  loading.value = true;

  try {
    info.value = await getSampleDetail(sampleId);

    // 若后端未来返回可访问的文件 URL，可在此赋值
    // previewUrl.value = info.value.url || null

  } catch (e) {
    ElMessage.error("加载样本详情失败");
    info.value = null;
  } finally {
    loading.value = false;
  }
}

/**
 * 跳转至标注页面（预留）
 */
function goAnnotation() {
  router.push(`/annotations/${sampleId}`);
}

/**
 * 下载样本（预留）
 */
function downloadSample() {
  ElMessage.warning("下载功能尚未开放");
}

/**
 * 页面初始化
 */
onMounted(() => {
  if (!Number.isFinite(sampleId)) {
    ElMessage.error("非法的样本 ID");
    router.push("/samples");
    return;
  }

  loadDetail();
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

.actions {
  display: flex;
  gap: 10px;
}

.image-preview {
  margin-top: 30px;
}

.image-preview img {
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}
</style>
