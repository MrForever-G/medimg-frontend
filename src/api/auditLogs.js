import request from "./request";

// 获取审计日志列表（管理员 / 数据管理员）
export function getAuditLogs() {
  return request.get("/audit-logs/");
}
