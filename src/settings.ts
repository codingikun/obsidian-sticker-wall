import { App, PluginSettingTab, Setting } from "obsidian";
import StickerPlugin from "./main";

export interface StickerSettings {
  dataFolder: string;  // 贴纸数据保存目录
}

export const DEFAULT_SETTINGS: StickerSettings = {
  dataFolder: "",  // 空表示根目录
};

export class StickerSettingTab extends PluginSettingTab {
  plugin: StickerPlugin;

  constructor(app: App, plugin: StickerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "贴纸墙设置" });

    new Setting(containerEl)
      .setName("数据保存目录")
      .setDesc("设置贴纸墙数据文件的保存目录，留空表示根目录。例如：Stickers/")
      .addText((text) => {
        text.setValue(this.plugin.settings.dataFolder)
          .onChange(async (value) => {
            this.plugin.settings.dataFolder = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.style.width = "300px";
      });
  }
}
