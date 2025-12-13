import { createRouter, createWebHistory } from "vue-router";

import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Home from "../pages/Home.vue";   // Home = 布局容器

const router = createRouter({
  history: createWebHistory(),

  routes: [
    { path: "/login", component: Login },
    { path: "/register", component: Register },

    {
      path: "/",
      component: Home,
      meta: { requiresAuth: true },

      children: [
        { path: "", redirect: "/home" },

        // 首页右侧区域
        { path: "home", component: () => import("../pages/Dashboard.vue") },

        // 数据集管理
        { path: "datasets", component: () => import("../pages/Datasets.vue") },
        { path: "datasets/:id", component: () => import("../pages/DatasetDetail.vue") },

        // 样本管理（Step 7）
        { path: "samples", component: () => import("../pages/Samples.vue") },
        { path: "samples/of/:datasetId", component: () => import("../pages/SamplesOfDataset.vue") },
        { path: "samples/:id", component: () => import("../pages/SampleDetail.vue") },

        // 标注平台
        { path: "annotations/:sampleId", component: () => import("../pages/AnnotationPage.vue") },
      ],
    },
  ],
});

/*
  全局路由守卫
*/
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    return next("/home");
  }

  next();
});

export default router;
