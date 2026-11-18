# team-know

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`team-know[KW8SH]`

F: 初始化并定制个人/协作知识库（三维+sketch+索引），跨宿主入库与体验引导
R:
A: 入口 `SKILL.md`；脚手架 `scripts/init-know-repo.sh`；多宿主安装 `scripts/install-skill.sh`；体检 `scripts/doctor-skill.sh`；规则模板 `templates/`；场景定制见 `references/customize.md`；体验引导见 `references/guided-tour.md`
S: 知识正文只写知识库路径，禁止写入当前业务工程；规则唯一源是知识库 `RULES.md`，不绑 Cursor；已有海外库继续用 oversea-know，本能力只建通用新库；密钥不入库；晋升前成熟度为 E

---

## 这是什么

跨宿主 **Skill**：帮用户从零搭一套「个人 / 团队协作知识库」，结构对齐海外知识库已验证模式（三维 + sketch + 五标签 + FRAS），但去掉海外硬编码，可按业务场景改名与改规则。

不托管用户的知识正文；只提供初始化、定制、入库流程与体验引导。

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 建知识库 / 个人知识库 / 团队知识库 / team-know | 命中 → 询问场景后 init |
| 初始化知识库结构 / 三维文档仓 | 命中 → init |
| 把笔记整理进知识库 / sketch 归档 | 命中 → 按已建库的 RULES 入库 |
| 海外知识库 / oversea-know | **非本能力** → 走 oversea-know |
| 只要对话备忘、不要目录结构 | 非本能力主线 |

## 怎么用

强制顺序：

```text
1. 询问场景（见 references/customize.md）
2. 跑 scripts/init-know-repo.sh
3. 按答案改写 RULES.md / SKILL.md / AGENTS.md / 维名
4. 走 references/guided-tour.md 完成一轮体验
5. 可选：bash <知识库>/scripts/install-skill.sh
```

### 1. 询问（未齐则先问）

- 个人 or 团队
- 领域 / 应用场景
- 三维目录名（默认 `businesses,features,tech` 或用户自定义）
- 知识库落盘**绝对路径**
- 主要 AI 宿主（可多选；默认按通用结构初始化，Cursor 可选）

### 2. 初始化

```bash
bash "<本能力目录>/scripts/init-know-repo.sh" \
  --path "/absolute/path/to/know-repo" \
  --title "我的知识库" \
  --skill-name team-know \
  --dims businesses,features,tech
```

必生成（宿主无关）：`RULES.md`、`SKILL.md`、`AGENTS.md`、`INSTALL.md`、`harness/AGENTS.snippet.md`、`index.md`、`_meta/taxonomy.md`、三维 + `_template/`、`sketch/`、`scripts/install-skill.sh`、`scripts/doctor-skill.sh`。

`.cursor/rules/` 仅当用户明确要用 Cursor 时再生成（`--with-cursor-rules`）。

### 3. 场景定制

读 `references/customize.md`，改写规则与索引导语；产品↔运营对照可按场景开关。

### 4. 体验引导

读 `references/guided-tour.md`：sketch → 问维 → 模板入库 → 索引 → 检索演示 → 按宿主说明唤起。

## 通用 AI 运行结构

```text
知识库根/
  SKILL.md RULES.md AGENTS.md INSTALL.md
  harness/AGENTS.snippet.md
  index.md  businesses/ features/ tech/  sketch/
  scripts/  _meta/
  .cursor/rules/   # 可选，非唯一入口
```

- 规则唯一源 = `RULES.md`
- 安装默认多宿主：`claude,codex,agents,workbuddy,workbuddy-ai,cursor`（有则装、无则跳过）
- 脚本只依赖 bash；不假设 Cursor / MCP

## 最不能违反什么

- 知识正文只进知识库仓，不进当前业务工程
- 未确认维类型前禁止写入三维、禁止移入 `sketch/_archived/`
- 不写密钥明文
- 不把 Cursor 写成唯一接入方式
- 已有海外知识库场景继续用 `oversea-know`，不要用本能力覆盖其路径
