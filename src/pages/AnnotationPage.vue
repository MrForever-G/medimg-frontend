<template>
  <div class="page-wrapper">

    <div class="header">
      <h2 class="page-title">标注页面</h2>

      <el-button type="default" @click="goBack">
        返回样本详情
      </el-button>
    </div>

    <!-- 历史标注 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>历史标注</span>
      </template>

      <el-table
        :data="annotations"
        border
        row-key="id"
      >
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="anno_type" label="类型" width="100" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="author_id" label="标注人" width="120" />
        <el-table-column prop="created_at" label="时间" />

        <!-- 标注内容语义摘要（用于快速理解标注含义） -->
        <el-table-column
          label="标注内容"
          min-width="240"
        >
          <template #default="{ row }">
            {{ summarizePayload(row) }}
          </template>
        </el-table-column>

        <!-- 审批操作（仅管理员可见，仅 submitted 状态可操作） -->
        <el-table-column
          v-if="canReview"
          label="审批"
          width="160"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'submitted'"
              type="success"
              size="small"
              @click="approve(row)"
            >
              通过
            </el-button>

            <el-button
              v-if="row.status === 'submitted'"
              type="danger"
              size="small"
              @click="reject(row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>

        <!-- 展开查看完整标注内容（格式化展示） -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <pre class="payload-box">{{ formatPayload(row) }}</pre>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="annotations.length === 0"
        description="暂无标注"
        style="margin-top: 20px;"
      />
    </el-card>

    <!-- 新建标注 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>新建标注</span>
      </template>

      <el-form label-width="100px">
        <el-form-item label="标注类型">
          <el-select v-model="annoType">
            <el-option label="标签" value="tag" />
            <el-option label="框" value="bbox" disabled />
            <el-option label="多边形" value="polygon" disabled />
            <el-option label="涂抹" value="brush" disabled />
          </el-select>
        </el-form-item>

        <el-form-item label="标注内容">
          <el-input
            v-model="payload"
            type="textarea"
            rows="4"
            placeholder="JSON / 文本标注内容"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit">
            提交标注
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import {
  getAnnotationsBySample,
  createAnnotation,
  approveAnnotation,
  rejectAnnotation,
} from "../api/annotations";

import { me } from "../api/auth";

/**
 * 路由实例
 */
const route = useRoute();
const router = useRouter();

/**
 * 当前样本 ID
 */
const sampleId = Number(route.params.sampleId);

/**
 * 当前用户（用于审批权限判断）
 */
const currentUser = ref(null);

/**
 * 是否具备标注审批权限
 */
const canReview = computed(() => {
  return (
    currentUser.value &&
    ["admin", "data_admin"].includes(currentUser.value.role)
  );
});

/**
 * 标注列表（按版本倒序展示）
 */
const annotations = ref([]);

/**
 * 新建标注表单状态
 */
const annoType = ref("tag");
const payload = ref("");

/**
 * 加载样本的历史标注
 */
async function loadAnnotations() {
  try {
    const data = await getAnnotationsBySample(sampleId);
    annotations.value = data.sort((a, b) => b.version - a.version);
  } catch {
    ElMessage.error("加载标注失败");
  }
}

/**
 * 生成标注内容摘要
 */
function summarizePayload(row) {
  if (!row || !row.payload_json) return "";

  if (row.anno_type === "tag") {
    return row.payload_json;
  }

  try {
    const obj = JSON.parse(row.payload_json);
    if (row.anno_type === "bbox" && Array.isArray(obj)) {
      return `bbox × ${obj.length}`;
    }
    if (row.anno_type === "polygon") {
      return "polygon 标注";
    }
    return "结构化标注";
  } catch {
    return "非结构化标注";
  }
}

/**
 * 格式化标注内容展示
 */
function formatPayload(row) {
  if (!row || !row.payload_json) return "";

  if (row.anno_type === "tag") {
    return row.payload_json;
  }

  try {
    return JSON.stringify(JSON.parse(row.payload_json), null, 2);
  } catch {
    return row.payload_json;
  }
}

/**
 * 提交新标注
 */
async function submit() {
  if (!payload.value) {
    ElMessage.warning("请输入标注内容");
    return;
  }

  try {
    await createAnnotation(sampleId, {
      anno_type: annoType.value,
      payload_json: payload.value,
    });

    ElMessage.success("标注提交成功");
    payload.value = "";
    loadAnnotations();
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "提交失败");
  }
}

/**
 * 审批通过标注
 */
async function approve(row) {
  try {
    await approveAnnotation(row.id);
    ElMessage.success("标注已通过");
    loadAnnotations();
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "审批失败");
  }
}

/**
 * 驳回标注
 */
async function reject(row) {
  try {
    await rejectAnnotation(row.id);
    ElMessage.success("标注已驳回");
    loadAnnotations();
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || "驳回失败");
  }
}

/**
 * 返回样本详情页
 */
function goBack() {
  router.push(`/samples/${sampleId}`);
}

/**
 * 页面初始化
 */
onMounted(async () => {
  if (!Number.isFinite(sampleId)) {
    ElMessage.error("非法样本 ID");
    router.push("/samples");
    return;
  }

  currentUser.value = await me();
  loadAnnotations();
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

.payload-box {
  white-space: pre-wrap;
  word-break: break-all;
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
}
</style>
