<template>
  <div class="layout-container">
    <!-- 顶部栏 -->
    <header class="layout-header">
      <div class="logo">MedImg 医学影像系统</div>

      <div class="user-info">
        <span>{{ user?.username }}（{{ user?.role }}）</span>
        <el-button size="small" type="danger" @click="logout">退出登录</el-button>
      </div>
    </header>

    <!-- 主体部分：左边导航 + 右边内容 -->
    <div class="layout-body">
      <!-- 左侧导航栏 -->
      <aside class="sidebar">
        <ul>
          <li @click="go('/home')" :class="{ active: isActive('/home') }">首页</li>
          <li @click="go('/datasets')" :class="{ active: isActive('/datasets') }">数据集管理</li>
          <li @click="go('/samples')" :class="{ active: isActive('/samples') }">样本管理</li>
          <li @click="go('/annotations')" :class="{ active: isActive('/annotations') }">标注平台</li>

          <li v-if="user?.role === 'admin'" 
              @click="go('/review')" 
              :class="{ active: isActive('/review') }">
            审批管理
          </li>

          <li v-if="user?.role === 'admin'"
              @click="go('/audit')" 
              :class="{ active: isActive('/audit') }">
            审计日志
          </li>
        </ul>
      </aside>

      <!-- 右侧主内容区域 -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { me } from "../api/auth";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const user = ref(null);

onMounted(async () => {
  try {
    user.value = await me();
  } catch {
    localStorage.removeItem("token");
    router.push("/login");
  }
});

function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}

function go(path) {
  router.push(path);
}

function isActive(path) {
  return route.path.startsWith(path);
}
</script>

<style scoped>
/* 整体布局 */
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.layout-header {
  height: 60px;
  padding: 0 20px;
  background: #2b3a55;
  color: #fff;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 主体区域布局 */
.layout-body {
  flex: 1;
  display: flex;
  height: calc(100vh - 60px);
}

/* 左侧导航栏 */
.sidebar {
  width: 200px;
  background: #f4f6fa;
  border-right: 1px solid #ddd;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 14px 20px;
  cursor: pointer;
  font-size: 15px;
  color: #333;
}

.sidebar li:hover {
  background: #e8edf5;
}

.sidebar li.active {
  background: #4285f4;
  color: white;
  font-weight: bold;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
