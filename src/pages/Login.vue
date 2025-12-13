<template>
  <div class="login-wrapper">
    <div class="login-box">

      <!-- 左侧系统介绍 -->
      <div class="login-left">
        <div class="left-content">
          <h1 class="system-title">MedImg 医学图像管理系统</h1>
          <p class="system-desc">
            面向科研小组的医学图像管理、标注、审批与审计平台
          </p>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-right">
        <el-card class="login-card">
          <h2 class="panel-title">用户登录</h2>

          <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">

            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                placeholder="请输入密码"
                type="password"
                show-password
              />
            </el-form-item>

            <el-button
              class="login-btn"
              type="primary"
              @click="onSubmit"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form>

          <p class="switch-tip">
            还没有账号？
            <a @click="goRegister">去注册</a>
          </p>

        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { login } from "../api/auth";
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

const goRegister = () => router.push("/register");

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return;

    loading.value = true;

    try {
      const res = await login(form.value);
      localStorage.setItem("token", res.access_token);
      ElMessage.success("登录成功");
      router.push("/home");
    } catch (err) {
      ElMessage.error("用户名或密码错误");
    }

    loading.value = false;
  });
};
</script>

<style scoped>
.login-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/assets/bg-medical-01.png');
  background-size: cover;
  background-position: center;
}

.login-box {
  width: 900px;
  height: 500px;
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.25);
}

.login-left {
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

/* 右侧表单区域 */
.login-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 毛玻璃登录框 */
.login-card {
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

.login-btn {
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
