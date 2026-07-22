/* mock-data.js - 演示数据 */
var MOCK = {
  user: { name: "管理员", role: "admin", avatar: "👤", department: "产品部" },
  users: [
    { phone: "138****1234", name: "张三", customers: ["XX博物馆"], sessions: 23, lastVisit: "2026-07-13", regTime: "2026-03-15", status: "正常", color: "#faad14" },
    { phone: "139****5678", name: "李四", customers: ["科技馆"], sessions: 8, lastVisit: "2026-07-12", regTime: "2026-04-20", status: "正常", color: "#52c41a" },
    { phone: "136****9012", name: "王五", customers: ["XX博物馆","科技馆","自然博物馆"], sessions: 45, lastVisit: "2026-07-13", regTime: "2026-02-10", status: "正常", color: "#1890ff" },
    { phone: "137****3456", name: "赵六", customers: ["XX博物馆"], sessions: 3, lastVisit: "2026-07-10", regTime: "2026-06-01", status: "正常", color: "#722ed1" },
    { phone: "135****7890", name: "孙七", customers: ["自然博物馆"], sessions: 12, lastVisit: "2026-07-08", regTime: "2026-05-12", status: "已禁用", color: "#f5222d" },
    { phone: "133****2468", name: "周八", customers: ["科技馆"], sessions: 1, lastVisit: "2026-07-13", regTime: "2026-07-01", status: "正常", color: "#13c2c2" }
  ],
  chatRecords: [
    { id: "C001", user: "张三", customer: "XX博物馆", messages: 12, startTime: "2026-07-13 14:30" },
    { id: "C002", user: "李四", customer: "科技馆", messages: 5, startTime: "2026-07-13 13:20" },
    { id: "C003", user: "王五", customer: "XX博物馆", messages: 28, startTime: "2026-07-13 10:15" },
    { id: "C004", user: "赵六", customer: "XX博物馆", messages: 3, startTime: "2026-07-12 16:45" },
    { id: "C005", user: "孙七", customer: "自然博物馆", messages: 8, startTime: "2026-07-12 11:00" }
  ],
  chatList: [
    { id: 1, title: "示例对话一", time: "14:30", unread: 0 },
    { id: 2, title: "示例对话二", time: "昨天", unread: 2 },
    { id: 3, title: "示例对话三", time: "07-11", unread: 0 }
  ]
};
