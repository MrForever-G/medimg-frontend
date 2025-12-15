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

/**
 * 审批通过标注
 *
 * 仅 admin / data_admin 可调用，
 * 权限与状态校验由后端统一裁决。
 */
export function approveAnnotation(annotationId) {
  return request.post(`/annotations/${annotationId}/approve`);
}

/**
 * 驳回标注
 *
 * 驳回仅适用于 submitted 状态标注，
 * 不可逆，由后端保证一致性。
 */
export function rejectAnnotation(annotationId) {
  return request.post(`/annotations/${annotationId}/reject`);
}
