2026-11-19 | change | 推送 origin/main@6f8fc0f：首页锚点翻页/精选扇形牌/笔尖目录；Pages → https://skill.wuch-ai.net
2026-11-19 | change | 首页主模块纵向 scroll-snap（y mandatory + center），导航点击居中吸附并高亮当前段
2026-11-19 | change | 精选牌详情：去滚动条、固定底部复制按钮、关闭钮不裁切；权限/路径展示纠正
2026-11-19 | change | 首页/auth 替换为拆分 CSS+JS 新版站点包（assets/css、assets/js）；推送 origin/main 更新 GitHub Pages skill.wuch-ai.net
2026-11-18 | change | auth.html Windows 安装命令改为 powershell -NoProfile -ExecutionPolicy Bypass -Command "irm '.../install.ps1?code=...' | iex"（CMD/PowerShell 均可）
2026-11-18 | change | 公开免费能力新增 team-know、wb-skill-publish；GitHub Pages skill.wuch-ai.net 已含首页条目
2026-11-17 | change | aoci-admin 复制说明 AUTH_PAGE: https://ccharlie-xiu.github.io/aoci-wuch/auth.html → https://skill.wuch-ai.net/auth.html
2026-11-17 | config | aoci-auth ALLOWED_ORIGIN: https://ccharlie-xiu.github.io → https://skill.wuch-ai.net,https://ccharlie-xiu.github.io（CORS 按请求 Origin 回显白名单）
2026-11-17 | prod-url | 授权页主域 skill.wuch-ai.net；Worker https://aoci-auth.aoci-wuch.workers.dev/activate
