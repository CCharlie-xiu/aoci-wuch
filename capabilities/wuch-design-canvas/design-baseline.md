# 设计基线（摘自 DESIGN-ANCHOR v1.2）

> 本文件是能力内唯一允许的视觉取值源。写 Canvas / 描述风格时只引用这里的值。

## 一句话

冷白的画布，纯白的卡面，一点深松绿。界面是画框，生成的内容才是画。

## 主题

| 项 | 值 |
| --- | --- |
| 主题数 | **仅浅色** |
| 系统配色 | 不跟随 `prefers-color-scheme` |
| 减少动效 | 必须尊重 `prefers-reduced-motion` |

## 双表面

| 表面 | Token | Hex | 用途 |
| --- | --- | --- | --- |
| Canvas | `--surface-canvas` | `#fafbfc` | 画布底、页面底 |
| Chrome | `--surface-card` | `#ffffff` | 顶栏、聊天卡、输入、菜单 |

区分只靠明度 + 1px 线 + 留白；默认高度 **e0**。

## 冷中性 Ink

| Token | Hex | 用途 |
| --- | --- | --- |
| ink-0 | `#ffffff` | 卡面 |
| ink-25 | `#fafbfc` | 画布底 |
| ink-50 | `#f4f5f6` | 沉底 / hover |
| ink-100 | `#eef0f2` | active / composer 填充 |
| ink-200 | `#e6e8eb` | 默认边框 |
| ink-300 | `#d8dce1` | 强边框 |
| ink-400 | `#a6adb8` | 禁用 |
| ink-600 | `#646b75` | 三级文字 |
| ink-700 | `#4c525b` | 二级文字 |
| ink-900 | `#17191d` | 一级文字 |

## 深松绿（主操作）

| Token | Hex | 用途 |
| --- | --- | --- |
| pine-900 | `#223d36` | 主按钮底 |
| pine-800 | `#16281f` | hover |
| pine-700 | `#2b5548` | 链接 |
| pine-50 | `#edf2f0` | 选中底 |
| pine-200 | `#ccd8d2` | 选中边 |

主按钮：松绿底 + 白字。蓝 ≠ 操作色。

## 品牌蓝（仅 logo）

`#3b93f0` — **只属于 blob logo**。蓝=身份，绿=操作。

## 状态色

| 名 | fg | bg | line |
| --- | --- | --- | --- |
| success | `#1f6b3f` | `#eef5f1` | `#cfe0d6` |
| warning | `#8a5a12` | `#faf3e6` | `#e8d8b8` |
| danger | `#b3261e` | `#fbf0ef` | `#f0cfcc` |
| info | `#2f4c7a` | `#eef2f8` | `#ccd8e8` |

## 图表（低饱和）

`#17191d` · `#2e4a6b` · `#1f6b3f` · `#8a5a12` · `#5b6470` · `#a6adb8`

## 字体三声部

| 声部 | 用途 | 规则 |
| --- | --- | --- |
| UI | 壳层、表单、数据 | 系统无衬线；字重 400/500/600 |
| 编辑 | 品牌、首屏、助手正文 | 霞鹜文楷 / 宋体类；**只有 400** |
| 代码 | ID、hex、调试 | 系统等宽 |

中文正文 ≥ 11px，默认约 13px。壳层禁止伪粗体。

## 控件默认

高度 30 · 圆角 8 · 字号 12.5 · 行内小操作 24 / r6  
圆角档：4 / 6 / 8 / 12 / 16 / 999（内容卡 20）

## 动效

| Token | 值 | 用途 |
| --- | --- | --- |
| motion-1 | 140ms | hover、颜色、badge |
| motion-2 | 180ms | 菜单、控件 |
| motion-3 | 280ms | 面板、收起 |
| motion-4 | 320ms | 折叠、内容出现 |
| motion-shift-y | 6px | 进入上移 |
| press-dur | 60ms | 按下 |
| ease-out | `cubic-bezier(.22,1,.36,1)` | 位移 |
| ease-fade | `ease` | 颜色/透明 |

不新增第 5 个时长档。

## 工作台相位

| phase | badge | tone | 说明 |
| --- | --- | --- | --- |
| idle | 待命 | idle | 初始 / 文字直答 |
| generating | 生成中 | busy | **含流式编译**（非独立 badge） |
| restoring | 还原中 | busy | 版本回退 |
| success | 运行正常 | ok | 有界面 |
| warn | N 条诊断 | warn | 成功但有诊断 |
| failure | 失败 | bad | 保留 summary；禁止抖动 |
| cancelled | 已取消 | idle | 原文保留 |

驱动约定名：`syncWorkbenchPhase(phase)`。

## 禁止（与产品设计规则对齐）

- 紫白 / 紫靛渐变主题  
- 暖奶油底 + 高对比衬线 + 陶土强调  
- 报纸细线密栏  
- 深色默认皮、大面积 glow、emoji 装饰  
- 为填规范虚构与真实事件无关的 phase  
