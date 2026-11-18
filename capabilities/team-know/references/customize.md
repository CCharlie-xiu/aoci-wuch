# 场景定制清单

初始化完成后，按用户回答改写下列文件（只改用户知识库路径下的副本）。

## 必问

| 问题 | 写入位置 |
| --- | --- |
| 个人 or 团队 | `RULES.md` §0；`SKILL.md` 开篇 |
| 领域 / 应用场景一句话 | `RULES.md` §0；根 `index.md` 导语 |
| 三维目录名（默认 businesses/features/tech） | 若已用 `--dims` 创建则只改文案；否则需重建目录名并更新全文引用 |
| 是否需要「产品 ↔ 运营」对照 | `RULES.md` 对应节：需要则保留，不需要则删节并注明 |
| 是否强调代码/非代码分流 | 默认保留；纯运营库可弱化 |
| 主要 AI 宿主 | `INSTALL.md` 置顶说明；决定是否跑 `--with-cursor-rules` |

## 改写原则

- 把模板里的「业务 / 功能 / 技术」换成用户确认的维中文名（目录名保持英文/连字符）
- 触发词：在知识库 `SKILL.md` 的 `description` 写入用户会说的自然语言
- 禁止把用户业务密钥、生产口令写进规则
- 定制后跑一次 `bash scripts/doctor-skill.sh`（在知识库根）

## 示例场景映射

| 场景 | 维名建议 | 产品运营对照 |
| --- | --- | --- |
| 产品研发 | businesses, features, tech | 开 |
| 客服质检 | cases, playbooks, tech | 关或改为「对客话术 ↔ 内部口径」 |
| 个人学习 | topics, notes, methods | 关 |
| 运营投放 | campaigns, creatives, tech | 开（投放口径 ↔ 产品规则） |
