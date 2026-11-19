/* 能力目录、检索词、精选列表 — 发布时与 capabilities/index.md 同步 */
(function (global) {
  global.AOCI = global.AOCI || {};
    // 能力数组：与现网 index.html 保持一致（含 team-know / wb-skill-publish / pro / limit / short）
    const capabilities = [
      { id: "github-authorize", icon: "shield-check", name: "GitHub 应用授权", nameEn: "GitHub App Authorization", short: "github" },
      { id: "mobile-template-app", icon: "smartphone", name: "原生移动应用搭建与维护", nameEn: "Native App Setup & Practices", pro: true, short: "mobile" },
      { id: "logic-space-enumeration", icon: "workflow", name: "复杂设计逻辑枚举", nameEn: "Complex Logic Enumeration", short: "logic" },
      { id: "dbx-mcp-setup", icon: "database", name: "DBX 数据库接入", nameEn: "DBX Database MCP Setup", short: "dbx" },
      { id: "excel-capability", icon: "table-2", name: "Excel 后端选择配置", nameEn: "Excel Backend Configuration", short: "excel" },
      { id: "libtv-mcp-setup", icon: "clapperboard", name: "LibTV 影像服务接入", nameEn: "LibTV MCP Connection", short: "libtv" },
      { id: "ui-design-prompt", icon: "panels-top-left", name: "UI 风格提示设计", nameEn: "UI Style Design", pro: true, short: "ui" },
      { id: "video-frame-extract", icon: "video", name: "视频画面抽帧", nameEn: "Video Frame Extraction", short: "video" },
      { id: "cf-workers-site-auth", icon: "cloud", name: "Workers 站点登录防刷", nameEn: "CF Workers Site Auth", short: "cf-auth" },
      { id: "ios-app-store-release", icon: "rocket", name: "iOS 上架与 TestFlight", nameEn: "iOS App Store & TestFlight", pro: true, short: "ios" },
      { id: "wuch-design-canvas", icon: "palette", name: "设计风格 Canvas", nameEn: "Design Style Canvas", short: "canvas" },
      { id: "sso-login-center", icon: "key-round", name: "轻量 SSO 登录中心", nameEn: "Lightweight SSO Login Center", pro: true, short: "sso" },
      { id: "ga4-analytics", icon: "chart-column", name: "GA4 埋点与分析", nameEn: "GA4 Analytics", limit: true, short: "ga4" },
      { id: "github-oauth-login", icon: "github", name: "GitHub 登录接入", nameEn: "GitHub OAuth Login" },
      { id: "email-magic-link", icon: "mail", name: "邮件魔法链接登录", nameEn: "Email Magic Link Login" },
      { id: "design-pattern-os", icon: "layout-template", name: "设计模式操作系统", nameEn: "Design Pattern OS", pro: true },
      { id: "ai-conversation-kit", icon: "message-square", name: "AI 对话面整套方案", nameEn: "AI Conversation Kit", pro: true },
      { id: "team-know", icon: "library", name: "个人协作知识库", nameEn: "Team Know Kit" },
      { id: "wb-skill-publish", icon: "package", name: "对话经验上架 WorkBuddy", nameEn: "WorkBuddy Skill Publish" }
    ];

    // 展示用一句话，摘自 capabilities/index.md（仅用于卡片文案，不改动能力数据）
    const descriptions = {
      "github-authorize": { zh: "为指定 GitHub 应用走完用户授权流程", en: "Run the user authorization flow for a GitHub App." },
      "mobile-template-app": { zh: "用 mobile-template 家族创建并维护原生双端 App", en: "Create and maintain native apps with the mobile-template family." },
      "logic-space-enumeration": { zh: "显式化复杂逻辑空间，推演组合并暴露未定义情况", en: "Map complex logic, enumerate combinations, surface gaps." },
      "dbx-mcp-setup": { zh: "发现并打通 DBX MCP，完成安装配置与验证", en: "Discover and wire up DBX MCP, then verify it works." },
      "excel-capability": { zh: "在文件级与桌面级后端间选择并打通", en: "Choose and bridge file-level or desktop-level Excel backends." },
      "libtv-mcp-setup": { zh: "接入并验证 LibTV 影像服务 MCP", en: "Connect and verify the LibTV media-service MCP." },
      "ui-design-prompt": { zh: "先确认风格，再直出可运行的界面设计", en: "Confirm the style, then produce runnable UI design." },
      "video-frame-extract": { zh: "按自然语言要求从视频提取有序画面", en: "Extract ordered frames from video using natural language." },
      "cf-workers-site-auth": { zh: "在 Workers 站点落地登录与限流防刷", en: "Add login, rate limiting and bot protection to Workers sites." },
      "ios-app-store-release": { zh: "把 iOS App 发布到 TestFlight 与 App Store", en: "Ship an iOS app to TestFlight and the App Store." },
      "wuch-design-canvas": { zh: "按设计锚点询问效果，确认后产出风格画布", en: "Ask about the desired feel, then produce a design canvas." },
      "sso-login-center": { zh: "授权码 + PKCE，一次登录多应用可用", en: "Auth code + PKCE: one login across your apps." },
      "ga4-analytics": { zh: "GA4 接入、事件设计、联调验收与看数", en: "GA4 setup, event design, QA and reporting." },
      "github-oauth-login": { zh: "把 GitHub OAuth 接到自有登录与建号链路", en: "Wire GitHub OAuth into your sign-in and account flow." },
      "email-magic-link": { zh: "用一次性邮件链接完成无密码登录与建号", en: "Passwordless sign-in and sign-up with magic links." },
      "design-pattern-os": { zh: "把 compact / extended / tokens 固化为设计操作系统", en: "Turn compact / extended / tokens into a design OS." },
      "ai-conversation-kit": { zh: "Vue/React 对话与 Agent 界面的整套方案", en: "A full kit for Vue/React chat and agent interfaces." },
      "team-know": { zh: "初始化三维 + sketch + 索引的知识库，跨宿主入库", en: "Set up a 3D + sketch + index knowledge base across hosts." },
      "wb-skill-publish": { zh: "把长对话与沉淀流程打包成可上架的 Skill 包", en: "Package conversations into a publishable WorkBuddy Skill." }
    };

    /* 约 50 词检索字段：同义词 / 场景词 / 英文别名，供搜索命中（不展示在卡片上） */
    const searchKeywords = {
      "github-authorize": "GitHub App 应用授权 OAuth 安装权限 用户同意 第三方集成 仓库权限 开发者后台 授权回调 authorize install permission",
      "mobile-template-app": "原生 App iOS Android 双端 移动端脚手架 mobile-template Xcode 工程 创建维护 跨平台 手机应用 原生开发 React Native 替代",
      "logic-space-enumeration": "复杂逻辑 枚举 状态机 组合推演 边界情况 未定义 穷举 产品规则 设计逻辑 场景矩阵 条件分支 完整性检查",
      "dbx-mcp-setup": "数据库 DBX MCP SQL 连接 查询 schema 表结构 MySQL Postgres 数据源 安装配置 联调验证 看库",
      "excel-capability": "Excel 表格 xlsx 电子表格 文件级 桌面级 后端选择 读写表格 导入导出 Office 数据处理 报表",
      "libtv-mcp-setup": "LibTV 影像 视频生成 剪辑 MCP 媒体服务 画布 成片 素材 短剧 影像管线 接入验证",
      "ui-design-prompt": "UI 界面设计 提示词 风格确认 可运行页面 前端视觉 组件布局 落地页 产品界面 设计稿 直出代码",
      "video-frame-extract": "视频抽帧 截图 关键帧 画面提取 ffmpeg 分镜 封面 预览图 自然语言取帧 有序图片",
      "cf-workers-site-auth": "Cloudflare Workers 登录 防刷 限流 站点鉴权 Turnstile 机器人防护 边缘计算 访问控制",
      "ios-app-store-release": "iOS 上架 App Store TestFlight 发布 审核 证书 描述文件 Xcode 归档 苹果商店 内测分发",
      "wuch-design-canvas": "设计风格 Canvas 画布 视觉锚点 wuch-ai 氛围 排版 色彩 确认效果 风格指南 设计方向",
      "sso-login-center": "SSO 单点登录 授权码 PKCE 多应用 统一登录 令牌 身份中心 OAuth2 会话共享 轻量认证",
      "ga4-analytics": "GA4 埋点 Google Analytics 事件 分析 看数 数据报表 H5 Web 统计 转化 联调验收 排障",
      "github-oauth-login": "GitHub 登录 OAuth 建号 第三方登录 Sign in with GitHub 用户体系 账号接入 社交登录",
      "email-magic-link": "邮件 魔法链接 Magic Link 无密码 登录 注册 一次性链接 邮箱验证 密码less 建号",
      "design-pattern-os": "设计模式 操作系统 compact extended tokens Refero 设计系统 可修复 产品设计 组件规范 设计语言",
      "ai-conversation-kit": "AI 对话 Chat Agent 界面 Vue React 流式 OpenAI 工具调用 Thinking 沙盒 聊天组件 会话落库",
      "team-know": "知识库 协作 三维 sketch 索引 入库 笔记 经验沉淀 跨宿主 Cursor 团队知识 个人库",
      "wb-skill-publish": "WorkBuddy Skill 上架 发布 打包 对话经验 能力包 市场 validate 发布清单 技能商品"
    };

    const featuredIds = ["team-know", "wb-skill-publish", "ui-design-prompt", "wuch-design-canvas", "ga4-analytics", "mobile-template-app", "ai-conversation-kit"];
    const foryouIds = ["team-know", "ga4-analytics", "wuch-design-canvas", "github-authorize", "video-frame-extract", "design-pattern-os", "logic-space-enumeration", "dbx-mcp-setup", "email-magic-link"];
    const newIds = ["team-know", "wb-skill-publish"];
    const palette = [
      ["#e6ecd9", "#f5f3e9"], ["#dbe7e1", "#f1f4ee"], ["#eee3d4", "#f8f3e9"],
      ["#e4e0d1", "#f4f2e8"], ["#e7e9dc", "#f6f4ea"], ["#dfe8d6", "#f3f5e9"]
    ];
    // 卡片底纹：优先用本库自产媒资 assets/skills/<id>/16x9.png；缺图时回退旧装饰图
    const cardArtFallback = ["06", "09", "11", "13", "16", "19", "25", "27"];
    const skillArtIds = new Set([
      "ai-conversation-kit", "dbx-mcp-setup", "design-pattern-os", "email-magic-link",
      "excel-capability", "ga4-analytics", "github-authorize", "github-oauth-login",
      "ios-app-store-release", "logic-space-enumeration", "mobile-template-app",
      "sso-login-center", "team-know", "ui-design-prompt", "video-frame-extract",
      "wb-skill-publish", "wuch-design-canvas"
    ]);
    const artFor = (capability, index) => skillArtIds.has(capability.id)
      ? `assets/skills/${capability.id}/16x9.png`
      : `assets/cards/${cardArtFallback[index % cardArtFallback.length]}.webp`;

    // Short URL aliases → capability id（例如 /ga4 → ga4-analytics）
    const skillAliases = {};
    capabilities.forEach((capability) => {
      skillAliases[capability.id] = capability.id;
      if (capability.short) skillAliases[capability.short] = capability.id;
    });

    const firstUsePrompts = {
      "ga4-analytics": {
        zh: "我已安装「至关重要」能力库。请按 /aoci-wuch 读取能力索引，命中 ga4-analytics 后，在当前项目协助我：\n1）先确认我是开发者还是使用者；\n2）按该能力约定检查 / 完善 GA4 接入与事件上报；\n3）信息不够时，用技能里的提问模版问我。",
        en: "I installed the AOCI capability library. Please follow /aoci-wuch, open the capability index, hit ga4-analytics, then help in this project:\n1) Confirm whether I am a developer or an end user;\n2) Check / improve GA4 setup and event tracking per the skill;\n3) If info is missing, ask me with the skill's question templates."
      }
    };

    function buildDefaultFirstUsePrompt(capability, language) {
      const name = language === "zh" ? capability.name : capability.nameEn;
      if (language === "zh") {
        return `我已安装「至关重要」能力库。请按 /aoci-wuch 读取能力索引，命中「${capability.id}」（${name}）后，按该能力说明协助我完成当前任务。`;
      }
      return `I installed the AOCI capability library. Please follow /aoci-wuch, open the capability index, hit "${capability.id}" (${name}), then help me with the current task per that skill.`;
    }


  Object.assign(global.AOCI, {
    capabilities, descriptions, searchKeywords, featuredIds, foryouIds, newIds,
    palette, cardArtFallback, skillArtIds, artFor, skillAliases, firstUsePrompts,
    getCapabilityById: function (id) { return capabilities.find((item) => item.id === id) || null; },
    skillPathFor: function (id) {
      const c = capabilities.find((item) => item.id === id);
      return c && c.short ? c.short : id;
    },
    buildDefaultFirstUsePrompt
  });
})(window);
