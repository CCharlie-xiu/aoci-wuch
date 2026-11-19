/* 中英对照文案 */
(function (global) {
  global.AOCI = global.AOCI || {};
  const installPrompts = {
      zh: "请将这个 GitHub 仓库安装为当前 AI 助手可复用的 Agent Skill：https://github.com/CCharlie-xiu/aoci-wuch.git",
      en: "Install this GitHub repository as a reusable Agent Skill for this AI assistant: https://github.com/CCharlie-xiu/aoci-wuch.git"
    };

  const translations = {
      zh: {
        siteLabel: "个人 AI 能力库", navFeatured: "精选", navSkills: "能力清单", openGithub: "GitHub", navInstall: "安装", subscribe: "订阅授权",
        capabilitiesTitle: "能力库包含技能",
        eyebrow: "A LIBRARY OF USEFUL WAYS", headline: "把好方法", headlineAccent: "带进你的 AI。",
        headlineHtml: "把<mark data-mark=\"highlight\" data-mark-color=\"#c5d46a\">好方法</mark>",
        headlineAccentHtml: "<span data-mark=\"underline\" data-mark-color=\"#545f2a\">带进你的</span> <span data-mark=\"circle\" data-mark-color=\"#545f2a\">AI</span>。",
        intro: "一套持续生长的个人能力库，让 AI 在每个新项目里，都能复用经过整理的方法与经验。",
        installLabel: "给 AI 助手的安装指令", copyPrompt: "复制安装指令", viewCatalog: "浏览能力目录", openGithub: "GitHub",
        worksWith: "适用于", moreAgents: "+5",
        searchPlaceholder: "搜索技能…",
        searchResult: "找到 {n} 个相关技能", searchEmpty: "没有匹配的技能，换个词试试",
        foryouTitle: "为你推荐", viewAll: "查看全部",
        featuredKicker: "HAND-PICKED", featuredTitle: "精选能力", featuredLead: "把舍不得的方法叠成一副牌。抽一张，今晚只做这一件。",
        deckHint: "左右滑",
        freeKicker: "FREE · OPEN REPOSITORY", freeTitle: "免费能力", freeLead: "公开仓库可直接复用。AI 先读能力索引，命中后再打开对应目录，不加载无关内容。",
        proKicker: "PRO · SUBSCRIPTION", proTitle: "PRO 能力", proLead: "订阅能力正文不在公开仓库，授权后由本机读取。点选卡片可预览名称，点「去授权」完成订阅。", goAuth: "去授权",
        howKicker: "HOW IT WORKS", howTitle: "怎么用", howLead: "进视口后自动回放一次首次协助：宿主 AI 分出安装、点选、命中三条泳道。",
        step1Title: "安装能力库", step1Desc: "复制上方安装指令发给 AI，按 /aoci-wuch 读取能力索引。",
        step2Title: "点选能力", step2Desc: "在目录里点一张卡片，安装指令复制后会自动带上首次使用提示词。",
        step3Title: "命中再深入", step3Desc: "AI 先读 capabilities/index.md，命中后只打开对应目录，按需执行。",
        step4Title: "持续生长", step4Desc: "新能力先孵化，确认后免费或 PRO 发布，首页与索引同步更新。",
        ctaTitle: "准备好扩展你的 AI 助手了吗？", ctaLead: "同一条安装指令就在页顶。点这里回到那一行。",
        ctaJump: "去安装",
        pagesLabel: "GitHub Pages", authorLabel: "作者 CCharlie-xiu",
        tagFree: "FREE", tagPro: "PRO", tagNew: "NEW", tagLimit: "LIMIT",
        viewCard: "查看 →", selected: "已选中", copied: "已复制", copyAgain: "复制安装指令",
        copiedToast: "安装指令已成功复制到剪贴板！", copiedWithSkillToast: "安装指令已复制",
        firstUseLabel: "首次使用提示词", firstUseHint: "安装指令已复制。把下面这段发给你的 AI，即可按选中技能开始第一次协助。",
        copyFirstUse: "复制提示词", closeDialog: "关闭", firstUseCopiedToast: "首次使用提示词已复制到剪贴板！",
        sheetDetails: "技能详情", sheetHide: "收起详情"
      },
      en: {
        siteLabel: "Personal AI Capability Library", navFeatured: "Featured", navSkills: "Skills", openGithub: "GitHub", navInstall: "Install", subscribe: "Subscribe",
        capabilitiesTitle: "INCLUDED SKILLS",
        eyebrow: "A LIBRARY OF USEFUL WAYS", headline: "Bring good methods", headlineAccent: "into your AI.",
        headlineHtml: "Bring <mark data-mark=\"highlight\" data-mark-color=\"#c5d46a\">good methods</mark>",
        headlineAccentHtml: "<span data-mark=\"underline\" data-mark-color=\"#545f2a\">into your</span> <span data-mark=\"circle\" data-mark-color=\"#545f2a\">AI</span>.",
        intro: "A growing personal capability library that lets AI reuse carefully shaped methods and experience in every new project.",
        installLabel: "Install for your AI assistant", copyPrompt: "Copy install command", viewCatalog: "Browse capabilities", openGithub: "GitHub",
        worksWith: "Works with", moreAgents: "+5",
        searchPlaceholder: "Search skills…",
        searchResult: "{n} skills matched", searchEmpty: "No matches — try another keyword",
        foryouTitle: "For you", viewAll: "View all",
        featuredKicker: "HAND-PICKED", featuredTitle: "Featured capabilities", featuredLead: "The methods I could not throw away, stacked here. Draw one — let tonight be that.",
        deckHint: "Swipe",
        freeKicker: "FREE · OPEN REPOSITORY", freeTitle: "Free capabilities", freeLead: "Public repository, ready to reuse. The AI reads the index first, then opens only the matched directory.",
        proKicker: "PRO · SUBSCRIPTION", proTitle: "PRO capabilities", proLead: "PRO sources are not in the public repo; they are read locally after activation. Select a card to preview its name, or hit Get access.", goAuth: "Get access",
        howKicker: "HOW IT WORKS", howTitle: "How it works", howLead: "Scroll in to replay the first assist: the host agent forks install, pick, and match lanes.",
        step1Title: "Install the library", step1Desc: "Copy the install command above to your AI and let it read the index via /aoci-wuch.",
        step2Title: "Pick a capability", step2Desc: "Select a card in the catalog; copying the install command also prepares a first-use prompt.",
        step3Title: "Match, then go deep", step3Desc: "The AI reads capabilities/index.md, opens only the matched directory, then follows its workflow.",
        step4Title: "Keep it growing", step4Desc: "New capabilities are incubated first, then published as free or PRO with the index in sync.",
        ctaTitle: "Ready to extend your agent?", ctaLead: "The install command is at the top. Jump back to that row.",
        ctaJump: "Go to install",
        pagesLabel: "GitHub Pages", authorLabel: "By CCharlie-xiu",
        tagFree: "FREE", tagPro: "PRO", tagNew: "NEW", tagLimit: "LIMIT",
        viewCard: "View →", selected: "Selected", copied: "Copied", copyAgain: "Copy install command",
        copiedToast: "Install command copied to clipboard!", copiedWithSkillToast: "Install command copied",
        firstUseLabel: "First-use prompt", firstUseHint: "Install command copied. Paste the prompt below to your AI to start with the selected skill.",
        copyFirstUse: "Copy prompt", closeDialog: "Close", firstUseCopiedToast: "First-use prompt copied to clipboard!",
        sheetDetails: "Skill details", sheetHide: "Hide details"
      }
    };

  global.AOCI.installPrompts = installPrompts;
  global.AOCI.translations = translations;
  global.AOCI.howLaneCopy = {
    zh: {
      tools: { think: "思考", search: "搜索", read: "读取", write: "写入" },
      ready: "就绪",
      leadTime: "宿主 AI · {t}",
      oneWorking: "1 条泳道工作中 · {t}",
      manyWorking: "{n} 条泳道并行 · {t}",
      doneIn: "完成于 {t}",
      play: "播放", pause: "暂停", replay: "重放",
      scrub: "回放时间", waiting: "结果还在路上…", notStarted: "尚未开始"
    },
    en: {
      tools: { think: "Thinking", search: "Search", read: "Read", write: "Write" },
      ready: "Ready",
      leadTime: "Lead agent · {t}",
      oneWorking: "1 agent working · {t}",
      manyWorking: "{n} agents working · {t}",
      doneIn: "Done in {t}",
      play: "Play", pause: "Pause", replay: "Replay run",
      scrub: "Run time", waiting: "Waiting for results…", notStarted: "Not started yet"
    }
  };
  global.AOCI.howRun = {
    zh: {
      task: "第一次协助：把能力库装进 AI，再命中一张技能。",
      answer: "新能力先孵化，确认后免费或 PRO 发布。首页与索引同步更新，下次协助直接命中对应目录。",
      lanes: [
        {
          id: "lead", name: "宿主 AI",
          steps: [
            { tool: "think", label: "拆开任务", start: 0, end: 1.4, result: "安装、点选、命中、生长" },
            { tool: "write", label: "写回第一次协助", start: 10.4, end: 13.6 }
          ]
        },
        {
          id: "install", name: "安装",
          summary: "按 /aoci-wuch 读取能力索引",
          steps: [
            { tool: "search", label: "复制安装指令", start: 1.6, end: 3.2, result: "仓库交给助手" },
            { tool: "read", label: "读取 /aoci-wuch", start: 3.2, end: 5.4, result: "capabilities/index.md" },
            { tool: "think", label: "挂载能力库", start: 5.4, end: 6.8 }
          ]
        },
        {
          id: "pick", name: "点选",
          summary: "选中卡片后，复制指令会带上提示词",
          steps: [
            { tool: "search", label: "浏览能力卡片", start: 1.7, end: 3.1, result: "精选与目录" },
            { tool: "read", label: "带上首次提示词", start: 3.1, end: 5.2, result: "安装指令 + 提示词" },
            { tool: "think", label: "确认选中", start: 5.2, end: 6.6 }
          ]
        },
        {
          id: "match", name: "命中",
          summary: "只打开对应目录，按需执行",
          steps: [
            { tool: "read", label: "先读能力索引", start: 1.8, end: 4.0, result: "命中技能目录" },
            { tool: "think", label: "按需执行", start: 4.0, end: 6.4 },
            { tool: "search", label: "持续生长", start: 6.4, end: 9.6, result: "免费或 PRO 发布" }
          ]
        }
      ]
    },
    en: {
      task: "First assist: install the library, then hit one skill.",
      answer: "New capabilities incubate first, then ship as free or PRO. The homepage and index stay in sync so the next assist opens only the matched directory.",
      lanes: [
        {
          id: "lead", name: "Host AI",
          steps: [
            { tool: "think", label: "Split the job", start: 0, end: 1.4, result: "Install, pick, match, grow" },
            { tool: "write", label: "Write the first assist", start: 10.4, end: 13.6 }
          ]
        },
        {
          id: "install", name: "Install",
          summary: "Read the index via /aoci-wuch",
          steps: [
            { tool: "search", label: "Copy the install command", start: 1.6, end: 3.2, result: "Repo handed to the agent" },
            { tool: "read", label: "Read /aoci-wuch", start: 3.2, end: 5.4, result: "capabilities/index.md" },
            { tool: "think", label: "Mount the library", start: 5.4, end: 6.8 }
          ]
        },
        {
          id: "pick", name: "Pick",
          summary: "Selecting a card attaches a first-use prompt",
          steps: [
            { tool: "search", label: "Browse capability cards", start: 1.7, end: 3.1, result: "Featured and catalog" },
            { tool: "read", label: "Attach first-use prompt", start: 3.1, end: 5.2, result: "Install command + prompt" },
            { tool: "think", label: "Confirm selection", start: 5.2, end: 6.6 }
          ]
        },
        {
          id: "match", name: "Match",
          summary: "Open only the matched directory",
          steps: [
            { tool: "read", label: "Read the capability index", start: 1.8, end: 4.0, result: "Matched skill folder" },
            { tool: "think", label: "Execute as needed", start: 4.0, end: 6.4 },
            { tool: "search", label: "Keep it growing", start: 6.4, end: 9.6, result: "Publish free or PRO" }
          ]
        }
      ]
    }
  };
})(window);
