export interface StickerNote {
  id: string;
  userName: string;
  content: string;  // 支持 Markdown 格式
  time: string;
  x: number;
  y: number;
  rotate: number;
  color: string;
  tapeColor: string;  // 胶带颜色，从 NOTE_COLORS 中选择（可能和贴纸颜色不同）
}

export const STICKERS_FILE_NAME = "sticker-wall.md";

export const NOTE_COLORS = [
  'rgba(253, 216, 53, 0.7)',  // 黄色
  'rgba(255, 112, 67, 0.7)',  // 橙色
  'rgba(100, 181, 246, 0.7)', // 蓝色
  'rgba(129, 199, 132, 0.7)', // 绿色
  'rgba(255, 235, 59, 0.7)'  // 亮黄色
];

// 标题和占位符文本
export const UI_TEXT = {
  title: "sticker",
  content: "sticker content",
  addButton: "add"
};
