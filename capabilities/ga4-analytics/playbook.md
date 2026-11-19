# 跟用总表 · ga4-analytics

终态：约定首事件在 **DebugView（或平台等价）可见**，且业务只通过模版封装上报（无散落 gtag/logEvent）。

| 关 | 用户 | Agent | 过关标准 | 禁止 |
| --- | --- | --- | --- | --- |
| G0 问卷 | 答平台/角色/Measurement 是否已有 | `templates/interview.md` | 答案明确：web / android / ios；开发者或使用者 | 擅自默认平台 |
| G1 控制台前置 | 复制 G- ID 或确认 Firebase 已接 | 指引 `setup.md` + index 页面分工 | Web 有 G-；原生有 Firebase 工程 | Agent 代登录拿 ID |
| G2 落模版 | 确认工程路径 | 拷贝 `templates/web` 或 `android` / `ios` | 目标仓出现封装目录/文件 | 只改业务文件直接 gtag |
| G3 首事件真可用 | 打开 DebugView / 按 adb/FIR 说明操作 | 接 env、启动 capture+ensure+landing/app_open | DebugView 见到约定事件名 | 「代码写了」冒充验收 |
| G4 事件字典 | 确认漏斗步骤 | 按需用 example-funnel 裁剪 `gaEvents` / Tracker | 字典在项目仓；能力库不写客户事件表 | 把客户字典写进本能力 |
| G5 协作/看数 | 按角色填模版 | `roles-qa.md` / `analysis.md` | 双方事件名一致；路径可照做 | 发明第三种角色 |

进度：`templates/progress.md` 拷到项目 `docs/ga-progress.md`（可选）。
