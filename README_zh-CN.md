# Obsidian Sticker Wall

一款为 Obsidian 打造的便签墙插件，让你在笔记中创建和管理虚拟便签。

[English](./README.md) | 中文

![Obsidian](https://img.shields.io/badge/Obsidian-0.15.0+-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=flat-square)

## 特性

- 🎨 **便签墙视图** - 在 Obsidian 中创建类似实体便签墙的可视化界面
- ✏️ **Markdown 支持** - 便签内容支持 Markdown 格式渲染
- 🎲 **随机色彩** - 自动生成随机便签和胶带颜色
- 📍 **自由拖拽** - 便签可自由拖拽到任意位置
- 💾 **自动保存** - 数据自动保存到 Markdown 文件中
- ⚡ **轻量快速** - 纯原生实现，无额外依赖

## 预览

<img width="1556" height="872" alt="image" src="https://github.com/user-attachments/assets/8de7ff53-ff61-490e-b8b7-6dcbac24de7c" />

## 安装

### 方式一：社区插件市场（待审核）

1. 打开 Obsidian 设置
2. 进入 社区插件 选项
3. 搜索 "Sticker Wall"
4. 安装并启用

### 方式二：手动安装

1. 从 [Releases](https://github.com/codingkun/obsidian-sticker-wall/releases) 下载最新版本
2. 解压后将 `manifest.json` 和 `main.js` 放入 vault 的 `.obsidian/plugins/obsidian-sticker/` 目录
3. 在 Obsidian 设置中启用插件

### 方式三：开发版本

```bash
# 克隆仓库
git clone https://github.com/codingkun/obsidian-sticker-wall.git

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 使用方法

### 打开便签墙

有以下几种方式打开便签墙：

1. **命令面板** - 按 `Ctrl/Cmd + P`，输入 "打开贴纸墙"
2. **侧边栏图标** - 点击左侧边栏的便利贴图标
3. **Ribbon 图标** - 点击 Ribbon 区域的便利贴图标

### 创建便签

1. 在便签墙空白区域**右键点击**
2. 输入便签标题（可选）
3. 输入便签内容
4. 按 **Enter** 确认添加
5. 按 **Escape** 取消创建

### 编辑便签

- **标题** - 点击标题区域即可编辑
- **内容** - 点击内容区域即可编辑，支持 Markdown 语法

### 移动便签

- 直接拖拽便签到任意位置
- 便签位置自动保存

### 删除便签

- 悬停在便签上，显示删除按钮
- 点击 `×` 按钮删除

### Markdown 支持

便签内容支持以下 Markdown 语法：

| 语法 | 示例 |
|------|------|
| 粗体 | `**粗体**` |
| 斜体 | `*斜体*` |
| 删除线 | `~~删除线~~` |
| 标题 | `# 标题` / `## 二级标题` |
| 代码 | `` `行内代码` `` |
| 代码块 | <code>\`\`\`代码块\`\`\`</code> |
| 链接 | `[文本](URL)` |
| 引用 | `> 引用内容` |
| 列表 | `- 列表项` / `1. 有序列表` |
| 分割线 | `---` |

## 设置

### 数据保存目录

你可以在插件设置中自定义便签数据的保存位置：

1. 打开 设置 → 贴纸墙设置
2. 设置 "数据保存目录"
   - 留空：保存在仓库根目录
   - 输入路径：如 `Stickers/` 保存到 Stickers 文件夹

## 数据存储

便签数据以 JSON 格式保存在 `sticker-wall.md` 文件的 `stickers-data` 代码块中：

```markdown
```stickers-data
[
  {
    "id": "uuid",
    "userName": "标题",
    "content": "便签内容（Markdown）",
    "time": "2024-01-01 12:00:00",
    "x": 100,
    "y": 150,
    "rotate": 2.5,
    "color": "rgba(253, 216, 53, 0.7)",
    "tapeColor": "rgba(100, 181, 246, 0.7)"
  }
]
```
```

> ⚠️ **注意**：请勿手动编辑此代码块内容，否则可能导致数据丢失。

## 快捷键

| 操作 | 快捷键 |
|------|--------|
| 打开便签墙 | `Ctrl/Cmd + P` → "打开贴纸墙" |
| 创建便签 | 右键点击空白区域 |
| 确认添加 | `Enter` |
| 取消创建 | `Escape` |
| 编辑标题 | `Enter`（在标题区域） |
| 退出编辑 | `Escape`（在内容区域） |

## 常见问题

### Q: 便签墙无法打开？
A: 确保插件已正确启用，且 Obsidian 版本 >= 0.15.0

### Q: 数据保存在哪里？
A: 默认保存在仓库根目录的 `sticker-wall.md` 文件中

### Q: 如何备份便签数据？
A: 只需备份 `sticker-wall.md` 文件即可，包含所有便签数据

### Q: 可以使用图片作为便签背景吗？
A: 目前不支持，后续版本可能会添加

## 更新日志

### v1.0.0
- ✨ 初始版本发布
- 支持便签创建、编辑、删除、移动
- 支持 Markdown 内容渲染
- 随机便签和胶带颜色
- 数据自动保存

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT License](./LICENSE)

---

如果你觉得这个插件对你有帮助，请给我一个 ⭐️！
