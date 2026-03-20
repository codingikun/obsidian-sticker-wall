# Obsidian Sticker Wall - 发布指南

## 发布前检查清单

### 1. 仓库根目录文件检查

- [x] `manifest.json` - 插件元数据
- [x] `main.js` - 编译后的插件代码
- [x] `README.md` - 英文使用说明
- [x] `README_zh-CN.md` - 中文使用说明（可选）
- [x] `LICENSE` - MIT 许可证
- [x] `versions.json` - 版本兼容性列表

### 2. manifest.json 检查

```json
{
  "id": "sticker-wall",                    // ✅ 唯一，不含 "obsidian"
  "name": "Sticker Wall",                  // ✅ 显示名称
  "version": "1.0.1",                      // ✅ 语义版本 (x.y.z)
  "minAppVersion": "0.15.0",               // ✅ 最低 Obsidian 版本
  "description": "Drag-and-drop sticky note wall with Markdown support", // ✅ 简短描述
  "author": "codingkun",                   // ✅ 作者
  "isDesktopOnly": true                    // ✅ 桌面端专用
}
```

### 3. 发布要求

| 要求 | 状态 |
|------|------|
| description 简短简洁 | ✅ |
| 不包含 Node.js/Electron API | ✅ (纯前端) |
| plugin ID 不包含在 command ID 中 | ✅ |
| 不包含示例代码 | ✅ |

---

## 发布步骤

### Step 1: 创建 GitHub Release

1. 在 GitHub 上访问仓库: `https://github.com/codingkun/obsidian-sticker-wall/releases`

2. 点击 **Draft a new release**

3. 填写 Release 信息:
   - **Tag version**: `1.0.1` （必须与 manifest.json 中的 version 完全一致，**不要加 `v` 前缀**）
   - **Release title**: `Sticker Wall v1.0.1`
   - **Description**: 
     ```
     Initial release of Sticker Wall plugin.
     
     Features:
     - Create draggable sticky notes on a virtual wall
     - Markdown content support
     - Random color generation for notes and tape
     - Auto-save to Markdown file
     ```
     **注意**: 描述必须以 `.` `!` 或 `?` 结尾！

4. 上传 Release 资产 (点击 "Attach binaries by dropping them here or selecting them"):
   - ✅ `manifest.json`
   - ✅ `main.js`
   - `styles.css` (本插件不需要)

5. 点击 **Publish release**

---

### Step 2: 提交到 Obsidian 社区插件列表

1. **Fork** obsidian-releases 仓库:
   - 访问: `https://github.com/obsidianmd/obsidian-releases`
   - 点击右上角 **Fork**

2. 在你的 Fork 中编辑 `community-plugins.json`:
   - 打开文件
   - 在 JSON 数组的**末尾**添加新条目
   - **注意**: 确保放在 `]` 前面，且前一个条目有逗号

3. 添加以下内容:

```json
{
  "id": "sticker-wall",
  "name": "Sticker Wall",
  "author": "codingkun",
  "description": "Drag-and-drop sticky note wall with Markdown support",
  "repo": "codingkun/obsidian-sticker-wall"
}
```

**重要提示**:
- `id` 必须在 `community-plugins.json` 中唯一
- `id`, `name`, `author`, `description` 必须与你的 `manifest.json` 匹配
- 确认前一个条目末尾有逗号 `,`

4. **Commit changes**: 点击右上角 **Commit changes...** → **Commit changes**

5. **Create pull request**:
   - 点击 **Propose changes**
   - 点击 **Create pull request**

6. 填写 PR 信息:
   - **PR 标题**: `Add plugin: Sticker Wall`
   - **描述**: 使用 PR 模板，勾选所有复选框 `[x]`
   - **Reviewers**: 选择 **Community Plugin** 预览
   - 点击 **Create pull request**

---

### Step 3: 等待审核

- 机器人会自动验证 PR（可能需要几分钟）
- 如果显示 "Validation failed"，修复列出的问题后重新提交
- 等待 Obsidian 团队审核

---

## 版本更新流程

当发布新版本时:

1. 更新 `manifest.json` 中的 `version` (如 `1.0.2`)
2. 更新 `versions.json`:
   ```json
   {
     "1.0.2": "0.15.0",
     "1.0.1": "0.15.0",
     "1.0.0": "0.15.0"
   }
   ```
3. 创建新的 GitHub Release (tag: `1.0.2`)
4. PR 会自动更新

---

## 常见问题

### Q: PR 被标记为 "Validation failed"？
检查以下内容:
- [ ] Tag version 与 manifest.json 中的 version 完全一致
- [ ] Release 包含 `manifest.json` 和 `main.js`
- [ ] Description 以 `.` `!` 或 `?` 结尾
- [ ] 仓库根目录有 `README.md` 和 `LICENSE`

### Q: 如何本地测试插件？
1. 复制 `manifest.json` 和 `main.js` 到:
   ```
   .obsidian/plugins/sticker-wall/
   ```
2. 在 Obsidian 设置中启用插件

### Q: 版本号格式？
必须使用语义化版本: `x.y.z`
- 例如: `1.0.0`, `1.0.1`, `2.0.0`
- **不要使用**: `v1.0.0`, `1.0`, `1.0.0-beta`

---

## 资源链接

- [Obsidian 开发者文档](https://docs.obsidian.md)
- [提交插件指南](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)
- [插件发布要求](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins)
- [示例插件仓库](https://github.com/obsidianmd/obsidian-sample-plugin)
