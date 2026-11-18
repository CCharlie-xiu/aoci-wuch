# __TITLE__ — Agent 约定

记录仓库。组织方式：**先读索引，再只打开命中条目**。

**完整可移植规则**：[`RULES.md`](RULES.md)  
**跨项目技能名**：`__SKILL_NAME__`（[`SKILL.md`](SKILL.md)；多宿主见 [`INSTALL.md`](INSTALL.md)）

## 目录地图

```text
SKILL.md / INSTALL.md / RULES.md
scripts/install-skill.sh · doctor-skill.sh
harness/AGENTS.snippet.md
index.md
__DIM1__/ __DIM2__/ __DIM3__/
sketch/ (+ _archived/)
_meta/taxonomy.md
AGENTS.md
```

## 读取顺序

```text
任务 → 检查 sketch/ → 读根 index.md → 维 index.md → 命中条目 index.md
```

未命中不要扫全库正文。**sketch 检查每次必做。**

## sketch 归档（强制前置）

1. 列出 `sketch/` 下除 `README.md`、`_archived/` 外的文件
2. **有内容**：摘要 → **询问用户**归入 `__DIM1__` / `__DIM2__` / `__DIM3__` → 确认后写入、登记索引 → 原件进 `_archived/`
3. 用户未确认类型前：禁止写入三维、禁止移入 `_archived/`

## 新增条目

1. 在对应维建 `<id>/`，从 `_template/` 复制 `index.md`
2. **必填**：五位标签、FRAS、`created`/`updated`、`aliases`/`keywords`
3. 登记维索引与根索引

## 禁止

- 密钥明文
- 未经整理的 sketch 整文件进正式结构
- 同一内容在三维各写一份正文
- 有 sketch 待处理却跳过归档
