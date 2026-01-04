本项目为 软件工程课程设计 医学图像管理系统 前端设计
后端设计可访问： https://github.com/MrForever-G/medimg-backend
````md
# MedImg Frontend

MedImg 医学图像管理系统前端（Vue 3 + Vite + Element Plus）。

---

## 环境要求

- Node.js 18+（建议 18/20）
- npm（或 pnpm / yarn 也可）

---

## 1. 获取代码

```bash
git clone https://github.com/MrForever-G/medimg-frontend.git
cd medimg-frontend
````

---

## 2. 安装依赖

```bash
npm install
```

---

## 3. 配置后端地址（必须）

前端通过 Axios 请求后端，默认后端地址写在 `src/api/request.js` 的 `baseURL`：

```js
baseURL: "http://127.0.0.1:8000",
```

如需改成你的后端地址（例如服务器 IP、不同端口），直接修改该行即可。

---

## 4. 启动开发环境

```bash
npm run dev
```

启动后访问（Vite 默认端口通常为 5173）：

* `http://127.0.0.1:5173/`

---

## 5. 生产构建与预览

```bash
npm run build
npm run preview
```

---

## 6. 登录鉴权说明（前端行为）

* 登录成功后，前端会把 token 存入 `localStorage`（key 为 `token`）
* 后续所有请求会自动在请求头注入：
  `Authorization: Bearer <token>`
* 相关接口封装位于 `src/api/*.js`，例如：

  * 登录/注册：`/auth/login`、`/auth/register`、`/auth/me`
  * 数据集：`/datasets/`、`/datasets/{id}`、`/datasets/{id}/download`
  * 样本：`/samples/`、`/samples/upload/{datasetId}`、`/samples/{id}/download`
  * 标注：`/annotations/by-sample/{sampleId}`、`/annotations/{sampleId}`
  * 审批：`/approvals`、`/approvals/{id}/review`
  * 审计：`/audit-logs/`

---

## 7. 与后端联调顺序建议

1. 启动 MySQL
2. 启动后端（默认 `http://127.0.0.1:8000`）
3. 确认前端 `baseURL` 指向正确后端
4. 启动前端 `npm run dev`

---

## 8. 常见问题

### 8.1 页面能打开但请求一直失败 / 404

* 检查 `src/api/request.js` 里的 `baseURL` 是否指向正确后端地址与端口

### 8.2 登录后仍提示未登录 / 无权限

* 检查浏览器 `localStorage` 是否存在 `token`
* 检查后端是否允许该角色访问对应接口（权限由后端裁决）

---

## 9. 启动入口说明

应用入口在 `src/main.js`：注册 Element Plus 与路由后挂载应用。

```
::contentReference[oaicite:10]{index=10}
```

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

版权归本人所有
## License and Usage

This project is developed as part of an academic course project.

- The source code is provided **for learning and research purposes only**
- **Direct copying, submission as coursework, or commercial use is prohibited**
- Any derivative work must clearly indicate the original source

© 2025 Forever. All rights reserved.
