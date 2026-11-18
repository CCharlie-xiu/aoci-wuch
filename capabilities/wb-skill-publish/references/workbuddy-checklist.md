# WorkBuddy 上架清单

官方结构：https://open.workbuddy.cn/docs/skill  
市场：https://open.workbuddy.cn/skill/all

## 包结构

```text
{skill-name}/
  SKILL.md           # 必须
  references/        # 可选
  scripts/           # 可选
  templates/         # 可选
```

ZIP 根目录必须是技能文件夹（内含 SKILL.md），不要多包一层无意义目录。

## Frontmatter 必填

- name  
- display_name / display_name_en  
- description / description_zh / description_en  
- version  
- author  

建议：examples_zh / examples_en（各≤3）

## 常见拒收

- YAML 冒号后缺空格  
- 全角引号 / 中文标点破坏 YAML  
- 缺 version 或 display_name*  
- zip 含 `.git/`、`.DS_Store`、多余 LICENSE（按平台规则避免）  
- description 未写触发词，导致难被唤起  

## 上传步骤（用户自行操作）

1. 开放平台实名认证（个人即可发 Skill）  
2. 技能 → 添加 / 上传 zip  
3. 核对预览字段、选分类、上头像  
4. 提交审核；通过前可本地把目录拷到 `~/.workbuddy/skills/` 或 `~/.agents/skills/` 试用  

## AI 禁止代劳

- 不登录用户账号  
- 不替用户点提交  
- 只交付：技能目录 + zip + 本清单  
