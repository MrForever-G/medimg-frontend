import request from "./request";

/**
 * 获取所有审批请求（管理员视角）
 */
export function getAllApprovals() {
  return request.get("/approvals");
}

/**
 * 审核审批请求
 *
 * decision: "approved" | "rejected"
 * ttl_minutes: 可选，仅在 approved 时生效
 */
export function reviewApproval(approvalId, decision, ttlMinutes = null) {
  return request.post(`/approvals/${approvalId}/review`, null, {
    params: {
      decision,
      ttl_minutes: ttlMinutes,
    },
  });
}
