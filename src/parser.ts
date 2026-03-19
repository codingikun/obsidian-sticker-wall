import { StickerNote, STICKERS_FILE_NAME } from "./types";

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

// 根据目录设置获取文件完整路径
export function getStickersFilePath(dataFolder: string): string {
  if (!dataFolder || dataFolder.trim() === "") {
    return STICKERS_FILE_NAME;
  }
  // 确保目录路径以 / 结尾
  let folder = dataFolder.trim();
  if (!folder.endsWith('/')) {
    folder += '/';
  }
  return folder + STICKERS_FILE_NAME;
}
