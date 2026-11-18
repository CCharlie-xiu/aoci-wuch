# wb-skill-publish

> 认知前置：若尚未阅读本仓库外层的 `README.md` 与 `SKILL.md`，须优先阅读二者完成认知搭建，再读本文件。

`wb-skill-publish[KW8SH]`

F: 把长对话或沉淀流程打包为可上架 WorkBuddy 的通用 Skill 包与发布材料
R:
A: 入口 `SKILL.md`；访谈清单 `references/interview.md`；平台字段与踩坑 `references/workbuddy-checklist.md`；校验 `scripts/validate-wb-skill.py`；打包 `scripts/pack-wb-zip.sh`；模板 `templates/SKILL.md.tpl`
S: 不代用户登录开放平台提交；不写密钥进 Skill；正文不绑 Cursor；产出为通用 Agent Skill + WorkBuddy 必填 frontmatter；examples 各≤3 条

---

## 这是什么

跨宿主 **Skill**：用户经历长对话或已有可复用流程后，将其整理成符合 [WorkBuddy 技能基础结构](https://open.workbuddy.cn/docs/skill) 的 Skill 目录，并校验、打 zip、给出上架清单。

也可把同一包拷到 `~/.agents/skills/` 等通用目录本地试用。

## 什么时候用

| 用户说 | 判定 |
| --- | --- |
| 把这段经验做成 skill / 打包上架 WorkBuddy | 命中 |
| 生成技能市场材料 / wb-skill-publish | 命中 |
| 对话太长想沉淀成可复用技能 | 命中 |
| 只要写笔记进知识库 | 非本能力 → team-know / oversea-know |
| 代为登录开放平台上传 | 拒绝；只给包与清单 |

## 怎么用

```text
1. 收材料（粘贴对话要点 / 文档 / 步骤）
2. 访谈补齐（references/interview.md）
3. 生成 SKILL.md + 按需 references/scripts/templates
4. python3 scripts/validate-wb-skill.py <dir>
5. bash scripts/pack-wb-zip.sh <dir> [out.zip]
6. 按 references/workbuddy-checklist.md 指导用户自行上传
```

### 生成约束

- 必填 frontmatter：`name` `display_name` `display_name_en` `description` `description_zh` `description_en` `version` `author`
- 建议：`examples_zh` / `examples_en`（各最多 3 条）
- 正文步骤化、<5000 tokens；长文进 `references/`
- 可复现逻辑优先 `scripts/`（bash/python）
- 步骤只假设「能读文件 + 能跑 bash/python 的 AI Agent」

## 最不能违反什么

- 不写入内网地址、凭证、真实用户隐私
- 不生成 Cursor-only 作为唯一交付
- 不代提交审核
- YAML 冒号后必须空格；不用全角引号
