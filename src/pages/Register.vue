<template>
  <div class="register-wrapper">
    <div class="register-box">

      <!-- 左侧介绍 -->
      <div class="register-left">
        <div class="left-content">
          <h1 class="system-title">用户注册</h1>
          <p class="system-desc">注册一个新的 MedImg 平台账号</p>
        </div>
      </div>

      <!-- 右侧注册表单 -->
      <div class="register-right">
        <el-card class="register-card">

          <h2 class="panel-title">创建账户</h2>

          <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">

            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>

            <el-button
              class="register-btn"
              type="primary"
              @click="onSubmit"
              :loading="loading"
            >
              注册
            </el-button>

            <p class="switch-tip">
              已有账号？
              <a @click="goLogin">去登录</a>
            </p>

          </el-form>
        </el-card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { register } from "../api/auth";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
  username: "",
  password: "",
});

const loading = ref(false);

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const formRef = ref(null);

const goLogin = () => router.push("/login");

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return;

    loading.value = true;

    try {
      await register(form.value);
      ElMessage.success("注册成功，请登录！");
      router.push("/login");
    } catch (err) {
      ElMessage.error(err?.response?.data?.detail || "注册失败");
    }

    loading.value = false;
  });
};
</script>

<style scoped>
/* 背景布局完全复用 Login 的风格 */
.register-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background-image: url('/assets/bg-medical-01.png');
  background-size: cover;
  background-position: center;
}

.register-box {
  width: 900px;
  height: 500px;
  display: flex;

  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.25);
}

.register-left {
  flex: 1.2;
  background: rgba(0,0,0,0.35);
  color: #fff;
  backdrop-filter: blur(2px);

  display: flex;
  justify-content: center;
  align-items: center;
}

.left-content {
  width: 70%;
}

.system-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
}

.system-desc {
  font-size: 18px;
  opacity: 0.9;
}

.register-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-card {
  width: 380px;
  padding: 35px 40px;

  background: rgba(255,255,255,0.28);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  box-shadow: 0 6px 25px rgba(0,0,0,0.22);
}

.panel-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.register-btn {
  width: 100%;
  height: 40px;
  margin-top: 10px;
}

.switch-tip {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  color: #555;
}

.switch-tip a {
  color: #1e80ff;
  cursor: pointer;
}
</style>
