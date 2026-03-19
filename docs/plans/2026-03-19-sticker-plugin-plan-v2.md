# Obsidian 贴纸插件实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个全局便利贴留言墙插件，界面风格与参考 HTML 一致，数据保存到 md 文件

**Architecture:** 通过 Obsidian 的 Workspace 侧边栏视图实现贴纸墙，使用 CSS 完全还原参考样式

**Tech Stack:** TypeScript, Svelte, esbuild, Obsidian API

---

## 阶段 1: 项目脚手架

### Task 1: 更新项目配置（保留现有结构）

**Files:**
- Modify: `manifest.json` - 更新描述
- Modify: `package.json` - 添加 svelte 依赖

**Step 1: 更新 manifest.json**

```json
{
  "id": "obsidian-sticker",
  "name": "Sticker Wall",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "description": "便利贴留言墙 - 在侧边栏展示可拖拽的贴纸墙",
  "author": "Developer",
  "isDesktopOnly": true
}
```

**Step 2: 更新 package.json**

```json
{
  "name": "obsidian-sticker",
  "version": "1.0.0",
  "description": "Obsidian Sticker Wall Plugin",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc -noEmit -skipLibCheck && node esbuild.config.mjs production"
  },
  "keywords": ["obsidian", "plugin", "sticker"],
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^16.11.6",
    "esbuild": "^0.19.9",
    "esbuild-svelte": "^0.8.0",
    "obsidian": "latest",
    "svelte": "^4.2.0",
    "typescript": "^5.3.3"
  }
}
```

**Step 3: 安装依赖**

Run: `npm install`
Expected: node_modules updated with svelte dependencies

---

## 阶段 2: 类型定义和解析器

### Task 2: 创建类型定义

**Files:**
- Create: `src/types.ts`

**Step 1: 创建 types.ts**

```typescript
export interface StickerNote {
  id: string;
  userName: string;
  content: string;
  time: string;
  x: number;
  y: number;
  rotate: number;
  color: string;
}

export const STICKERS_FILE_NAME = "stickers-wall.md";

export const NOTE_COLORS = [
  'rgba(253, 216, 53, 0.7)',  // #fdd835 黄色
  'rgba(255, 112, 67, 0.7)',  // #ff7043 橙色
  'rgba(100, 181, 246, 0.7)', // #64b5f6 蓝色
  'rgba(129, 199, 132, 0.7)', // #81c784 绿色
  'rgba(255, 235, 59, 0.7)'  // #ffeb3b 亮黄色
];
```

---

### Task 3: 创建解析器

**Files:**
- Create: `src/parser.ts`

**Step 1: 创建 parser.ts**

```typescript
import { StickerNote } from "./types";

const DATA_BLOCK_REGEX = /^```stickers-data\n([\s\S]*?)\n```$/m;

export function parseStickersData(content: string): StickerNote[] {
  const match = DATA_BLOCK_REGEX.exec(content);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse stickers data:", e);
      return [];
    }
  }
  return [];
}

export function serializeStickersData(notes: StickerNote[]): string {
  return '```stickers-data\n' + JSON.stringify(notes, null, 2) + '\n```';
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
```

---

## 阶段 3: 贴纸墙视图

### Task 4: 创建贴纸墙视图

**Files:**
- Create: `src/StickerWallView.ts`

**Step 1: 创建 StickerWallView.ts**

```typescript
import { App, ItemView, WorkspaceLeaf } from "obsidian";
import { StickerWallComponent } from "./StickerWall.svelte";

export const STICKER_WALL_VIEW_TYPE = "sticker-wall-view";

export class StickerWallView extends ItemView {
  private component: StickerWallComponent | null = null;

  constructor(app: App, leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return STICKER_WALL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Sticker Wall";
  }

  async onOpen() {
    this.component = new StickerWallComponent({
      target: this.contentEl,
      props: {
        app: this.app,
      },
    });
  }

  async onClose() {
    if (this.component) {
      this.component.$destroy();
      this.component = null;
    }
  }
}
```

---

## 阶段 4: Svelte 组件

### Task 5: 创建贴纸墙组件

**Files:**
- Create: `src/StickerWall.svelte`

**Step 1: 创建 StickerWall.svelte**

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { App, Notice } from "obsidian";
  import { StickerNote, NOTE_COLORS, STICKERS_FILE_NAME } from "./types";
  import { parseStickersData, serializeStickersData, generateId, formatTime } from "./parser";
  import StickerNoteComponent from "./StickerNote.svelte";

  export let app: App;

  let notes: StickerNote[] = [];
  let userName = "";
  let messageInput = "";
  let containerWidth = 0;
  let containerHeight = 0;

  onMount(async () => {
    await loadNotes();
  });

  async function loadNotes() {
    try {
      const file = app.vault.getAbstractFileByPath(STICKERS_FILE_NAME);
      if (file && file instanceof app.metadataCache.objToLinktype) {
        const content = await app.vault.read(file as TFile);
        notes = parseStickersData(content);
      } else {
        // 文件不存在，创建空文件
        notes = [];
        await saveNotes();
      }
    } catch (e) {
      console.error("Failed to load notes:", e);
      notes = [];
    }
  }

  async function saveNotes() {
    try {
      let file = app.vault.getAbstractFileByPath(STICKERS_FILE_NAME);
      const content = serializeStickersData(notes);
      if (file) {
        await app.vault.modify(file as TFile, content);
      } else {
        await app.vault.create(STICKERS_FILE_NAME, content);
      }
    } catch (e) {
      console.error("Failed to save notes:", e);
      new Notice("保存失败！");
    }
  }

  function addNote() {
    const content = messageInput.trim();
    if (!content) return;

    const now = new Date();
    const newNote: StickerNote = {
      id: generateId(),
      userName: userName.trim() || "匿名",
      content: content,
      time: formatTime(now),
      x: Math.random() * (containerWidth - 270),
      y: Math.random() * (containerHeight - 220),
      rotate: Math.random() * 20 - 10,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
    };

    notes = [...notes, newNote];
    saveNotes();
    
    messageInput = "";
    new Notice("留言已添加！");
  }

  function handleNoteMove(event: CustomEvent<{ id: string; x: number; y: number }>) {
    const { id, x, y } = event.detail;
    notes = notes.map(n => n.id === id ? { ...n, x, y } : n);
    saveNotes();
  }

  function handleNoteDelete(event: CustomEvent<string>) {
    notes = notes.filter(n => n.id !== event.detail);
    saveNotes();
    new Notice("留言已删除！");
  }
</script>

<div class="sticker-wall">
  <!-- 顶部输入区域 -->
  <div class="input-area">
    <input
      type="text"
      bind:value={userName}
      placeholder="留言人"
    />
    <input
      type="text"
      bind:value={messageInput}
      placeholder="请输入留言..."
      on:keydown={(e) => e.key === 'Enter' && addNote()}
    />
    <button on:click={addNote}>添加留言</button>
  </div>

  <!-- 留言墙容器 -->
  <div class="container" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    {#each notes as note (note.id)}
      <StickerNoteComponent
        {note}
        on:move={handleNoteMove}
        on:delete={handleNoteDelete}
      />
    {/each}
  </div>
</div>

<style>
  .sticker-wall {
    height: 100vh;
    background: #dfe6e9;
    display: flex;
    flex-direction: column;
  }

  .input-area {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    padding: 10px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .input-area input {
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .input-area input:first-child {
    width: 120px;
  }

  .input-area input:nth-child(2) {
    width: 300px;
  }

  .input-area button {
    padding: 8px 15px;
    font-size: 16px;
    cursor: pointer;
    background-color: #4caf50;
    color: #fff;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  .input-area button:hover {
    background-color: #45a049;
  }

  .container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    padding-top: 70px;
  }
</style>
```

---

### Task 6: 创建单个便签组件

**Files:**
- Create: `src/StickerNote.svelte`

**Step 1: 创建 StickerNote.svelte**

```svelte
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { StickerNote } from "./types";

  export let note: StickerNote;

  const dispatch = createEventDispatcher();

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('delete-btn')) return;
    
    isDragging = true;
    offsetX = e.clientX - note.x;
    offsetY = e.clientY - note.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      note = { ...note, x: newX, y: newY };
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        dispatch('move', { id: note.id, x: note.x, y: note.y });
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleDelete() {
    dispatch('delete', note.id);
  }
</script>

<div
  class="note"
  style="left: {note.x}px; top: {note.y}px; background-color: {note.color}; transform: rotate({note.rotate}deg);"
  on:mousedown={handleMouseDown}
  role="button"
  tabindex="0"
>
  <button class="delete-btn" on:click={handleDelete}>×</button>
  <div class="note-header">
    <span class="username">{note.userName}</span>
    <span class="time">{note.time}</span>
  </div>
  <div class="note-content">{note.content}</div>
</div>

<style>
  .note {
    position: absolute;
    width: 250px;
    min-height: 150px;
    border: 1px solid #f0e68c;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    padding: 20px 15px;
    cursor: move;
    user-select: none;
    transform-origin: top left;
  }

  .note::before {
    content: "";
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 24px;
    background: #ff5722;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .note:hover {
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
  }

  .delete-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 20px;
    height: 20px;
    border: none;
    background: rgba(255, 0, 0, 0.7);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .note:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: rgba(255, 0, 0, 1);
  }

  .note-header {
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 12px;
    color: #555;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }

  .note-content {
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 14px;
    color: #333;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
```

---

## 阶段 5: 主插件类

### Task 7: 更新主入口

**Files:**
- Modify: `src/main.ts`

**Step 1: 创建 main.ts**

```typescript
import { Plugin, WorkspaceLeaf } from "obsidian";
import { StickerWallView, STICKER_WALL_VIEW_TYPE } from "./StickerWallView";

export default class StickerPlugin extends Plugin {
  async onload() {
    console.log("Sticker Wall plugin loading...");

    // 注册侧边栏视图
    this.registerView(
      STICKER_WALL_VIEW_TYPE,
      (leaf) => new StickerWallView(this.app, leaf)
    );

    // 添加打开侧边栏的命令
    this.addCommand({
      id: "open-sticker-wall",
      name: "Open Sticker Wall",
      callback: () => {
        this.activateView();
      },
    });

    // 添加 Ribbon 图标
    this.addRibbonIcon("sticky-note", "Open Sticker Wall", () => {
      this.activateView();
    });

    console.log("Sticker Wall plugin loaded");
  }

  onunload() {
    console.log("Sticker Wall plugin unloaded");
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(STICKER_WALL_VIEW_TYPE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      // 在右侧边栏创建新视图
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: STICKER_WALL_VIEW_TYPE,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
}
```

---

## 阶段 6: 构建配置

### Task 8: 更新构建配置

**Files:**
- Modify: `esbuild.config.mjs`

**Step 1: 更新 esbuild.config.mjs**

```javascript
import * as esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";

const isProduction = process.argv.includes("production");

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: ["obsidian"],
    format: "cjs",
    platform: "node",
    target: "node16",
    sourcemap: !isProduction,
    minify: isProduction,
    outfile: "main.js",
    plugins: [
      sveltePlugin({
        compilerOptions: {
          css: "injected",
        },
      }),
    ],
    loader: {
      ".svg": "text",
    },
  })
  .catch(() => process.exit(1));
```

---

## 阶段 7: 构建和测试

### Task 9: 构建插件

**Step 1: 构建开发版本**

Run: `npm run dev`
Expected: main.js generated with source maps

**Step 2: 构建生产版本**

Run: `npm run build`
Expected: main.js generated minified

---

## 总结

- [ ] Task 1: 更新项目配置
- [ ] Task 2: 创建类型定义
- [ ] Task 3: 创建解析器
- [ ] Task 4: 创建贴纸墙视图
- [ ] Task 5: 创建贴纸墙组件
- [ ] Task 6: 创建单个便签组件
- [ ] Task 7: 更新主入口
- [ ] Task 8: 更新构建配置
- [ ] Task 9: 构建测试
