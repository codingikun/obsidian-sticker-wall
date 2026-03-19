# Obsidian 贴纸插件设计文档 (v2)

**日期**: 2026-03-19
**状态**: 已完成

## 概述

一个全局便利贴留言墙插件，界面风格与参考 HTML 完全一致，数据保存到 `stickers-wall.md` 文件中。

## 功能规格

### 1. 界面风格

- 浅灰色背景 `#dfe6e9`
- 顶部固定输入区域（留言人、内容、添加按钮）
- 留言卡片样式：
  - 半透明彩色背景（70% 透明度）
  - 图钉效果（红色圆形伪元素）
  - 随机旋转角度 (-10° ~ 10°)
  - 阴影效果 `box-shadow: 0 4px 8px rgba(0,0,0,0.2)`
  - 鼠标悬停阴影提升 `box-shadow: 0 6px 12px rgba(0,0,0,0.3)`

### 2. 数据存储

- 文件名：`stickers-wall.md`
- 存储位置：vault 根目录
- 格式：
```markdown
```stickers-data
[
  {"id":"uuid","userName":"留言人","content":"内容","time":"时间","x":150,"y":200,"rotate":5,"color":"rgba(...)"}
]
```
```

### 3. 数据结构

```typescript
interface StickerNote {
  id: string;
  userName: string;
  content: string;
  time: string;
  x: number;
  y: number;
  rotate: number;
  color: string;
}
```

### 4. 颜色方案

```typescript
const NOTE_COLORS = [
  'rgba(253, 216, 53, 0.7)',  // 黄色
  'rgba(255, 112, 67, 0.7)',  // 橙色
  'rgba(100, 181, 246, 0.7)', // 蓝色
  'rgba(129, 199, 132, 0.7)', // 绿色
  'rgba(255, 235, 59, 0.7)'  // 亮黄色
];
```

## 实现方式

- **视图**: Obsidian ItemView (侧边栏)
- **UI**: 原生 TypeScript + DOM API
- **样式**: 内联 CSS 样式
- **数据**: JSON 数组保存在 md 代码块中

## 插件架构

```
obsidian-sticker-plugin/
├── manifest.json           # 插件元数据
├── package.json            # npm 配置
├── tsconfig.json           # TypeScript 配置
├── esbuild.config.mjs     # 构建配置
├── main.js                # 编译后的插件
└── src/
    ├── main.ts            # 主入口类，命令注册
    ├── types.ts           # 类型定义和常量
    ├── parser.ts          # 数据解析/序列化
    └── StickerWallView.ts # 贴纸墙视图，渲染和交互
```

## 已完成

✅ 侧边栏视图打开贴纸墙
✅ Ribbon 图标快速打开
✅ 命令面板命令
✅ 顶部输入区域（留言人、内容、添加按钮）
✅ 随机位置生成便签
✅ 随机颜色分配
✅ 随机旋转角度
✅ 图钉装饰效果
✅ 拖拽移动便签
✅ 点击删除便签
✅ 数据保存到 stickers-wall.md
✅ 鼠标悬停阴影效果
