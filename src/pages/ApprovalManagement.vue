<template>
  <div class="page-wrapper">

    <div class="header">
      <h2 class="page-title">审批管理</h2>
    </div>

    <!-- 审批视图切换 -->
    <el-tabs v-model="activeTab" style="margin-top: 20px;">
      <!-- 待处理审批 -->
      <el-tab-pane label="待处理" name="pending">
        <el-table
          :data="pendingApprovals"
          border
          row-key="id"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="resource_type" label="资源类型" width="100" />
          <el-table-column prop="resource_id" label="资源 ID" width="100" />
          <el-table-column prop="applicant_id" label="申请人" width="100" />
          <el-table-column prop="created_at" label="申请时间" />

          <el-table-column label="用途说明" min-width="240">
            <template #default="{ row }">
              {{ row.purpose || "-" }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-button
                type="success"
                size="small"
                @click="approve(row)"
              >
                通过
              </el-button>

              <el-button
                type="danger"
                size="small"
                @click="reject(row)"
              >
                驳回
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty
          v-if="pendingApprovals.length === 0"
          description="暂无待处理审批"
          style="margin-top: 40px;"
        />
      </el-tab-pane>

      <!-- 已处理审批 -->
      <el-tab-pane label="已处理" name="processed">
        <el-table
          :data="processedApprovals"
          border
          row-key="id"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="resource_type" label="资源类型" width="100" />
          <el-table-column prop="resource_id" label="资源 ID" width="100" />
          <el-table-column prop="applicant_id" label="申请人" width="100" />
          <el-table-column prop="decision" label="状态" width="120" />
          <el-table-column prop="created_at" label="申请时间" />

          <el-table-column label="用途说明" min-width="240">
            <template #default="{ row }">
              {{ row.purpose || "-" }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120">
            <template #default>
              已处理
            </template>
          </el-table-column>
        </el-table>

        <el-empty
          v-if="processedApprovals.length === 0"
          description="暂无已处理审批"
          style="margin-top: 40px;"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 审批通过：有效期设置 -->
    <el-dialog
      v-model="ttlDialogVisible"
      title="设置下载有效期"
      width="360px"
    >
      <el-form label-width="100px">
        <el-form-item label="有效期（分钟）">
          <el-input-number
            v-model="ttlMinutes"
            :min="1"
            :max="1440"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ttlDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmApprove">
          确认通过
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";

import {
  getAllApprovals,
  reviewApproval
} from "../api/approvals";

/**
 * 当前审批视图
 *
 * 默认聚焦待处理审批，符合管理员工作流
 */
const activeTab = ref("pending");

/**
 * 全部审批记录
 */
const approvals = ref([]);

/**
 * 待处理审批
 */
const pendingApprovals = computed(() =>
  approvals.value.filter(a => a.decision === "pending")
);

/**
 * 已处理审批（通过 / 驳回）
 */
const processedApprovals = computed(() =>
  approvals.value.filter(a => a.decision !== "pending")
);

/**
 * 审批通过弹窗状态
 */
const ttlDialogVisible = ref(false);
const ttlMinutes = ref(60);
const currentApproval = ref(null);

/**
 * 加载审批列表
 */
async function loadApprovals() {
  try {
    approvals.value = await getAllApprovals();
  } catch {
    ElMessage.error("加载审批列表失败");
  }
}

/**
 * 点击通过
 */
function approve(row) {
  currentApproval.value = row;
  ttlMinutes.value = 60;
  ttlDialogVisible.value = true;
}

/**
 * 确认通过审批
 */
async function confirmApprove() {
  try {
    await reviewApproval(
      currentApproval.value.id,
      "approved",
      ttlMinutes.value
    );
    ElMessage.success("审批通过");
    ttlDialogVisible.value = false;
    loadApprovals();
  } catch {
    ElMessage.error("审批失败");
  }
}

/**
 * 驳回审批
 */
async function reject(row) {
  try {
    await reviewApproval(row.id, "rejected");
    ElMessage.success("已驳回");
    loadApprovals();
  } catch {
    ElMessage.error("操作失败");
  }
}

/**
 * 页面初始化
 */
onMounted(loadApprovals);
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
