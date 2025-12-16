<template>
  <div class="page-wrapper">

    <h2 class="page-title">审计日志</h2>

    <!-- 日志分类 -->
    <el-tabs v-model="activeTab" style="margin-bottom: 16px;">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :name="tab.key"
      >
        <template #label>
          {{ tab.label }}
          <el-badge
            v-if="hasUnread(tab.key)"
            is-dot
            style="margin-left: 6px;"
          />
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 日志表格 -->
    <el-table
      :data="pagedLogs"
      border
      stripe
      style="width: 100%;"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="actor_id" label="用户ID" width="100" />
      <el-table-column prop="action" label="操作行为" min-width="160" />
      <el-table-column prop="resource_type" label="资源类型" width="120" />
      <el-table-column prop="resource_id" label="资源ID" width="100" />
      <el-table-column prop="ip" label="IP地址" width="140" />

      <el-table-column label="结果" width="100">
        <template #default="{ row }">
          <el-tag
            :type="row.result === 'ok' ? 'success' : 'danger'"
            effect="plain"
          >
            {{ row.result }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="时间" width="180">
        <template #default="{ row }">
          {{ formatBeijingTime(row.created_at) }}
        </template>
      </el-table-column>

      <!-- 新日志标识 -->
      <el-table-column label="" width="60">
        <template #default="{ row }">
          <el-badge
            v-if="isUnread(row)"
            is-dot
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="margin-top: 20px; text-align: right;">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredLogs.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";

import { getAuditLogs } from "../api/auditLogs";

/**
 * 日志分类定义
 */
const tabs = [
  { key: "all", label: "全部" },
  { key: "login", label: "登录" },
  { key: "approval", label: "审批" },
  { key: "dataset", label: "数据集" },
  { key: "sample", label: "样本" },
  { key: "annotation", label: "标注" },
  { key: "error", label: "异常" },
];

/**
 * 日志数据
 */
const logs = ref([]);

/**
 * 当前分类
 */
const activeTab = ref("all");

/**
 * 分页状态
 */
const currentPage = ref(1);
const pageSize = 10;

/**
 * 每个分类最近已查看的日志 ID
 */
const lastSeenMap = ref(
  JSON.parse(localStorage.getItem("auditLogLastSeen") || "{}")
);

/**
 * 分类过滤规则
 */
function matchCategory(log, category) {
  switch (category) {
    case "login":
      return log.action === "login";
    case "approval":
      return log.action.includes("approval");
    case "dataset":
      return log.resource_type === "dataset";
    case "sample":
      return log.resource_type === "sample";
    case "annotation":
      return log.resource_type === "annotation";
    case "error":
      return log.result !== "ok";
    default:
      return true;
  }
}

/**
 * 分类后的日志（按时间倒序）
 */
const filteredLogs = computed(() => {
  return logs.value.filter(l => matchCategory(l, activeTab.value));
});

/**
 * 当前页日志
 */
const pagedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredLogs.value.slice(start, start + pageSize);
});

/**
 * 是否为未读日志
 */
function isUnread(log) {
  const lastSeen = lastSeenMap.value[activeTab.value] || 0;
  return log.id > lastSeen;
}

/**
 * 某分类是否存在未读日志
 */
function hasUnread(category) {
  const lastSeen = lastSeenMap.value[category] || 0;
  return logs.value.some(
    l => matchCategory(l, category) && l.id > lastSeen
  );
}

/**
 * UTC → 北京时间
 */
function formatBeijingTime(value) {
  if (!value) return "";
  const d = new Date(value + "Z");
  return d.toLocaleString("zh-CN", { hour12: false });
}

/**
 * 加载日志
 */
async function loadLogs() {
  try {
    logs.value = await getAuditLogs();
  } catch {
    ElMessage.error("加载审计日志失败");
    logs.value = [];
  }
}

/**
 * 切换分类时，更新该分类的“已读位置”
 */
watch(activeTab, () => {
  if (filteredLogs.value.length) {
    lastSeenMap.value[activeTab.value] = filteredLogs.value[0].id;
    localStorage.setItem(
      "auditLogLastSeen",
      JSON.stringify(lastSeenMap.value)
    );
  }
  currentPage.value = 1;
});

onMounted(loadLogs);
</script>

<style scoped>
.page-wrapper {
  padding: 30px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>
