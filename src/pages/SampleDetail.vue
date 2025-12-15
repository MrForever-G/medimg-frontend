<template>
  <div class="page-wrapper">

    <div class="header">
      <h2 class="page-title">样本详情</h2>

      <div class="actions">
        <el-button type="default" @click="goBack">
          返回样本列表
        </el-button>

        <el-button
          type="primary"
          :disabled="!sample"
          @click="goAnnotate"
        >
          进入标注
        </el-button>

        <el-button
          type="default"
          :disabled="!sample"
          @click="downloadSample"
        >
          下载样本
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <el-skeleton
      v-if="loading"
      :rows="5"
      animated
      style="margin-top: 20px;"
    />

    <!-- 样本详情 -->
    <el-descriptions
      v-else-if="sample"
      border
      :column="1"
      style="margin-top: 20px;"
    >
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
        {{ sample.created_at }}
      </el-descriptions-item>
    </el-descriptions>

    <el-empty
      v-else
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
 *
 * 样本 ID 是数据库主键，仅作为唯一标识，
 * 与前端展示序号（index）在语义上严格区分。
 */
const sampleId = Number(route.params.id);

/**
 * 样本详情实体
 */
const sample = ref(null);

/**
 * 页面加载状态
 */
const loading = ref(false);

/**
 * 加载样本详情
 *
 * 所有访问控制与可见性校验均由后端完成，
 * 前端仅负责触发请求与展示结果。
 */
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

/**
 * 进入标注页面
 *
 * 标注入口与下载权限解耦，
 * 是否允许标注由 AnnotationPage 后端接口决定。
 */
function goAnnotate() {
  router.push(`/annotations/${sampleId}`);
}

/**
 * 返回样本管理页
 */
function goBack() {
  router.push("/samples");
}

onMounted(() => {
  if (!Number.isFinite(sampleId)) {
    ElMessage.error("非法的样本 ID");
    router.push("/samples");
    return;
  }
  loadSample();
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

.actions {
  display: flex;
  gap: 10px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
}
</style>
