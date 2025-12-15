import request from "./request";

// 获取系统中的所有样本
export function getAllSamples() {
  return request.get("/samples/");
}

// 获取某个数据集下的所有样本
export function getSamplesByDataset(datasetId) {
  return request.get(`/samples/by-dataset/${datasetId}`);
}

// 上传样本文件
export function uploadSampleFile(datasetId, file) {
  const form = new FormData();
  form.append("file", file);

  return request.post(`/samples/upload/${datasetId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// 获取单个样本详情
export function getSampleDetail(sampleId) {
  return request.get(`/samples/${sampleId}`);
}

// 删除样本
export function deleteSample(sampleId) {
  return request.delete(`/samples/${sampleId}`);
}

// 查询当前用户对该样本的下载审批状态
export function getMySampleApproval(sampleId) {
  return request.get("/approvals/my", {
    params: {
      resource_type: "sample",
      resource_id: sampleId,
    },
  });
}

// 申请下载样本
export function requestSampleDownload(sampleId) {
  return request.post("/approvals/request", null, {
    params: {
      resource_type: "sample",
      resource_id: sampleId,
      purpose: "download sample",
    },
  });
}

// 下载样本文件（需审批通过）
export function downloadSample(sampleId) {
  return request.get(`/samples/${sampleId}/download`, {
    responseType: "blob",
  });
}
