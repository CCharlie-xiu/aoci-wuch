---
name: ga4-analytics
description: >-
  按关卡落地 GA4：先问平台与角色，再拷贝 Web（泰国短剧文件夹模式）/ Android / iOS（彩铃双端启动模式）去业务化模版，
  直到 DebugView 见到约定首事件。含事件设计、联调、排障、看数与开发者↔使用者模版问答。
  触发词：GA4、谷歌埋点、analytics、DebugView、落地页漏斗、短剧 H5 埋点、Firebase Analytics。
  不写 Measurement ID/密钥进能力库；不把客户事件表当全局预设。
description_zh: 关卡制 GA4：Web/Android/iOS 模版拷贝到首事件可见
description_en: Gate-based GA4 with web/Android/iOS templates until first event shows in DebugView.
---

# ga4-analytics

跟用总表：`playbook.md`。详细路由与页面分工：`index.md`。

## 强制关卡

1. **G0** `templates/interview.md` — 平台 / 角色 / 终态  
2. **G1** 用户侧拿到 G- 或 Firebase（Agent 不代登录）— `setup.md`  
3. **G2** 拷贝模版（空壳直打 gtag = 失败）  
   - Web：`templates/web/`（泰国短剧 `utils/ga` 沉淀）  
   - Android：`templates/android/`（彩铃 Firebase 启动沉淀）  
   - iOS：`templates/ios/`  
4. **G3** 首事件在 DebugView 可见 — `verify.md`（代码写了不算过关）  
5. **G4** 项目内事件字典 — 可用 `gaEvents.example-funnel.js` 裁剪；字典留业务仓  
6. **G5** 协作/看数 — `roles-qa.md` / `analysis.md`  

每关对用户：【进度】Gx · 下一关 Gy：…

## 模版铁律

- 业务禁止直接 `gtag` / 散落 `logEvent`  
- User-ID 只走官方 set；禁止进事件 params  
- 能力库不写客户业务事件表与 Measurement ID 明文  

## 参考

`index.md`（完整 FRAS/路由）· `setup.md` · `event-design.md` · `verify.md` · `templates/*`
