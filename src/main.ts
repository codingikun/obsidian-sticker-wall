import { Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { StickerWallView, STICKER_WALL_VIEW_TYPE } from "./StickerWallView";
import { StickerSettingTab, StickerSettings, DEFAULT_SETTINGS } from "./settings";

export default class StickerPlugin extends Plugin {
  settings: StickerSettings = DEFAULT_SETTINGS;

  async onload() {
    console.log("Sticker Wall plugin loading...");

    // 加载设置
    await this.loadSettings();

    // 添加设置页面
    this.addSettingTab(new StickerSettingTab(this.app, this));

    // 注册侧边栏视图
    this.registerView(
      STICKER_WALL_VIEW_TYPE,
      (leaf) => new StickerWallView(this.app, leaf, this)
    );

    // 添加打开侧边栏的命令
    this.addCommand({
      id: "open-sticker-wall",
      name: "打开贴纸墙",
      callback: () => {
        this.activateView();
      },
    });

    // 添加 Ribbon 图标
    this.addRibbonIcon("sticky-note", "打开贴纸墙", () => {
      this.activateView();
    });

    console.log("Sticker Wall plugin loaded");
  }

  onunload() {
    console.log("Sticker Wall plugin unloaded");
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...data };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    const { workspace } = this.app;

    // 查找是否已打开
    const leaves = workspace.getLeavesOfType(STICKER_WALL_VIEW_TYPE);

    if (leaves.length > 0) {
      workspace.revealLeaf(leaves[0]);
      return;
    }

    // 在中间区域创建新视图
    const leaf = workspace.getLeaf("tab");
    if (leaf) {
      await leaf.setViewState({
        type: STICKER_WALL_VIEW_TYPE,
      });
      workspace.revealLeaf(leaf);
    } else {
      new Notice("无法打开贴纸墙！");
    }
  }
}
