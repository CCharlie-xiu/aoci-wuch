# Web / H5 GA4 模版（文件夹模式）

**来源**：泰国短剧 `oversea-tailand/epg/src/utils/ga`；漏斗示例对照彩铃落地页（已去业务名）。

## 拷贝

```text
目标项目/src/utils/ga/   ← 拷贝本目录全部 .js（可不要 README / example）
```

## 步骤

1. env：`VITE_APP_GA_MEASUREMENT_ID=G-…`；测服可 `VITE_APP_GA_ENABLED=false`
2. 可选：`VITE_APP_GA_DEBUG_LOG=true`、`VITE_APP_GA_APP_ENV=staging`
3. 重写 `gaEvents.js`（可参考 `gaEvents.example-funnel.js`）
4. App 启动：`captureGaChannelContext()` → `ensureGaScript()` → `trackLandingView()`
5. 业务只 `import from '@/utils/ga'`，禁止直接 `gtag`
6. DebugView 验收（见能力 `verify.md`）

## 公共参数

每条事件自动带：`channel`、`batch_id`、`page_path`、`app_env`。

## 铁律

- User-ID 只走 `syncGaUserId` / 官方 set，禁止进事件 params
- 不把 Measurement ID 写进仓库明文（用 env）
