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
- **未加引号的值里出现英文冒号**（如 `by wuch-ai: lead`）→ `mapping values are not allowed`；含 `:` / `：` 的字段一律双引号  
- 缺 version 或 display_name*  
- zip 含 `.git/`、`.DS_Store`、多余 LICENSE（按平台规则避免）  
- description 未写触发词，导致难被唤起  
- 尽量不用 `>-` 多行块；市场解析器较严时改单行双引号  

## 上传步骤（用户自行操作）

1. 开放平台实名认证（个人即可发 Skill）  
2. 技能 → 添加 / 上传 zip  
3. 核对预览字段、选分类、上头像  
4. 提交审核；通过前可本地把目录拷到 `~/.workbuddy/skills/` 或 `~/.agents/skills/` 试用  

## wuch-ai 上架标准（强制）

确认信息页若漏做，视为未按标准交付：

| 项 | 标准 |
| --- | --- |
| `author` | 固定 `wuch-ai` |
| 头像 | **wuch-ai blob logo**（黑底、蓝 blob、白眼），512×512 PNG；**禁止**平台默认汉字方块头像 |
| 品牌色 | 蓝 `#3b93f0` 只属于 logo；能力介绍文案可提 wuch-ai，不写客户/公司业务名 |
| 联系 | 正文含邮箱 `chouxiucheng@gmail.com`、GitHub `https://github.com/CCharlie-xiu/aoci-wuch`、Pages `https://skill.wuch-ai.net/`、订阅 `https://skill.wuch-ai.net/auth.html` |
| 市场展示分类 | 选软件/移动/编程开发最接近项 |
| 服务类目 | 优先 IT 科技 → 软件开发 / 移动应用 / 技术服务（1～5 个） |
| `description_zh` | 须带「wuch-ai」出品语义 + 能力一句话，与预览「能力介绍」一致 |

交付物除 zip 外，须另给可上传的 `avatar-512.png`（或等价品牌头像路径）。

## AI 禁止代劳

- 不登录用户账号  
- 不替用户点提交  
- 只交付：技能目录 + zip + 品牌头像 + 本清单  
