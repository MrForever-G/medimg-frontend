<template>
  <div class="dashboard">
    <h2 class="title">欢迎使用 MedImg 医学图像管理系统</h2>

    <el-card class="card">
      <p class="desc">
        请选择左侧菜单开始使用：  
        管理数据集、上传样本、执行标注、审批下载等操作。
      </p>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.card {
  padding: 20px;
}

.desc {
  font-size: 16px;
  line-height: 1.6;
  color: #444;
}
</style>
