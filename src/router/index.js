import { createRouter, createWebHistory } from "vue-router";

import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Home from "../pages/Home.vue";

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

        // 首页
        { path: "home", component: () => import("../pages/Dashboard.vue") },

        // 数据集
        { path: "datasets", component: () => import("../pages/Datasets.vue") },
        { path: "datasets/:id", component: () => import("../pages/DatasetDetail.vue") },

        // 数据集下的样本（强语义，不和 sample id 冲突）
        {
          path: "datasets/:datasetId/samples",
          component: () => import("../pages/SamplesOfDataset.vue"),
        },
        
        // 样本详情
        {
          path: "samples/:id",
          component: () => import("../pages/SampleDetail.vue"),
        },

        // 样本管理（全局）
        {
          path: "samples",
          component: () => import("../pages/Samples.vue"),
        },

        // 标注
        {
          path: "annotations/:sampleId",
          component: () => import("../pages/AnnotationPage.vue"),
        },
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
