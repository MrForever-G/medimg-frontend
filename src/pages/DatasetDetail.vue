<template>
  <div class="page-wrapper">
    <el-card class="card-box">

      <!-- 顶部操作区 -->
      <div class="header-row">
        <el-button type="text" @click="goBack">
          ← 返回数据集列表
        </el-button>

        <el-button type="primary" @click="goSamples">
          查看样本
        </el-button>
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
import { getDataset } from "../api/datasets";

/**
 * 路由实例
 */
const route = useRoute();
const router = useRouter();

/**
 * 当前数据集 ID（来自 /datasets/:id）
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
  } catch (e) {
    ElMessage.error("获取数据集详情失败");
    dataset.value = null;
  } finally {
    loading.value = false;
  }
}

/**
 * 返回数据集列表页
 */
function goBack() {
  router.push("/datasets");
}

/**
 * 进入样本列表页
 * 路由必须严格匹配 /samples/of/:datasetId
 */
function goSamples() {
  router.push(`/samples/of/${datasetId}`);
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

.dataset-title {
  margin-top: 20px;
  font-size: 22px;
  font-weight: 600;
}
</style>
