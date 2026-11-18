---
name: wb-skill-publish
description: >-
  对话经验打包上架 WorkBuddy：把长对话或已沉淀流程整理成可上传的通用 Skill 包
  （SKILL.md + references/scripts/templates），校验 YAML 并打 zip，给出开放平台发布清单。
  用户提到 wb-skill-publish、做成 skill、打包上架 WorkBuddy、生成技能市场材料时使用。
  不绑 Cursor；不代登录提交。
description_zh: 长对话/流程 → 可上架 WorkBuddy 的 Skill 包与发布材料
description_en: >-
  Pack long-chat experience into a WorkBuddy-ready Skill zip with validation
  and a publish checklist. Host-agnostic; does not submit for you.
---

# wb-skill-publish · 对话经验上架 WorkBuddy

跨宿主技能。输入可以是粘贴文本，不要求特定 IDE。

## 强制流程

1. 收材料 → 读 `references/interview.md` 补齐字段  
2. 用 `templates/SKILL.md.tpl` 生成技能目录  
3. `python3 scripts/validate-wb-skill.py <skill-dir>`  
4. `bash scripts/pack-wb-zip.sh <skill-dir>`  
5. 按 `references/workbuddy-checklist.md` 指导用户上传  

## 边界

- 不写密钥；不代提交  
- 产出通用 Agent Skill，兼容 WorkBuddy 市场必填字段  
- 知识库存笔记请用 `team-know`，本技能只做「可发布 Skill」  
