# 伴随体验引导（初始化后必做）

话术**不假设 Cursor**。用用户声明的宿主说明唤起方式。

## 步骤

### 1. 写一条 sketch

在知识库 `sketch/` 新建例如 `demo-first-note.md`，内容由用户口述或粘贴 3～10 句真实笔记。

确认语：`已写入 sketch/<文件名>`

### 2. 摘要并问维

AI 读该文件，给 1～3 句摘要，询问归入哪一维（列出用户的三维中文名）。  
**未确认不得写入三维、不得移入 `_archived/`。**

### 3. 按模板入库

用户确认后：复制对应维 `_template/index.md` → `<id>/index.md`，填五位标签、FRAS、`created`/`updated`、`aliases`；登记维索引 + 根 `index.md`。  
条目内写归档记录：来源 sketch 路径、日期、用户选定类型。  
原件移入 `sketch/_archived/`。

### 4. 检索演示

用刚写入的 `aliases` 或 tag 在根索引检索，只打开命中条目，向用户展示「先索引后正文」路径。

### 5. 宿主唤起

| 情况 | 动作 |
| --- | --- |
| 本机可写 skills 目录 | `bash scripts/install-skill.sh`（默认多宿主，缺则跳过） |
| 仅 WorkBuddy | `--targets workbuddy,workbuddy-ai` |
| 无 Skill 宿主 | 把 `harness/AGENTS.snippet.md` 贴进其 AGENTS/规则，写死知识库绝对路径 |
| 纯对话无法写盘 | 本轮声明已加载 RULES，提醒用户稍后手动安装 |

### 6. 收尾确认句

```text
知识库已就绪：<绝对路径>
规则源：RULES.md
下一句可说：把下面内容整理进知识库：……
```
