import request from "./request";

// 获取全部数据集
export function getDatasets() {
  return request.get("/datasets/");
}

// 创建数据集
export function createDataset(data) {
  return request.post("/datasets", data);
}

// 获取某个数据集的详情
export function getDatasetDetail(id) {
  return request.get(`/datasets/${id}`);
}

// 获取某个数据集的详情（别名，兼容已有页面使用）
export function getDataset(id) {
  return getDatasetDetail(id);
}

// 删除数据集
// 对应后端 DELETE /datasets/{id}
export function deleteDataset(id) {
  return request.delete(`/datasets/${id}`);
}

// 获取某个数据集下的所有样本
export function getSamplesByDataset(datasetId) {
  return request.get(`/samples/by-dataset/${datasetId}`);
}

// 申请下载整个数据集（走审批系统）
export function requestDatasetDownload(datasetId, purpose = "下载数据集") {
  return request.post("/approvals/request", null, {
    params: {
      resource_type: "dataset",
      resource_id: datasetId,
      purpose,
    },
  });
}

// 查询当前用户对该数据集的最新审批状态
export function getMyDatasetApproval(datasetId) {
  return request.get("/approvals/my", {
    params: {
      resource_type: "dataset",
      resource_id: datasetId,
    },
  });
}

// 下载整个数据集（需审批通过）
export function downloadDataset(datasetId) {
  return request.get(`/datasets/${datasetId}/download`, {
    responseType: "blob",
  });
}
