import request from "./request";

// 获取系统中的所有样本
export function getAllSamples() {
  return request.get("/samples");
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
