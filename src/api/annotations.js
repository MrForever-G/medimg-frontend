import request from "./request";

/**
 * 获取某个样本的全部标注历史
 */
export function getAnnotationsBySample(sampleId) {
  return request.get(`/annotations/by-sample/${sampleId}`);
}

/**
 * 创建新的标注版本
 */
export function createAnnotation(sampleId, data) {
  return request.post(`/annotations/${sampleId}`, data);
}
