import { App, ItemView, WorkspaceLeaf, Notice, TFile } from "obsidian";
import { StickerNote, NOTE_COLORS, UI_TEXT } from "./types";
import { parseStickersData, serializeStickersData, generateId, formatTime, getStickersFilePath } from "./parser";
import StickerPlugin from "./main";

export const STICKER_WALL_VIEW_TYPE = "sticker-wall-view";

export class StickerWallView extends ItemView {
  private notes: StickerNote[] = [];
  private stickerContainerEl: HTMLElement | null = null;
  private notesContainerEl: HTMLElement | null = null;
  private plugin: StickerPlugin;
  private ghostNote: { el: HTMLElement; x: number; y: number; color: string; tapeColor: string } | null = null;

  constructor(app: App, leaf: WorkspaceLeaf, plugin: StickerPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return STICKER_WALL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Sticker Wall";
  }

  async onOpen() {
    this.render();
    await this.loadNotes();
  }

  async onClose() {
    // Cleanup
  }

  private async loadNotes() {
    try {
      const filePath = getStickersFilePath(this.plugin.settings.dataFolder);
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (file && file instanceof TFile) {
        const content = await this.app.vault.read(file);
        this.notes = parseStickersData(content);
      } else {
        this.notes = [];
        await this.saveNotes();
      }
      this.renderNotes();
    } catch (e) {
      console.error("Failed to load notes:", e);
      this.notes = [];
    }
  }

  private async saveNotes() {
    try {
      const filePath = getStickersFilePath(this.plugin.settings.dataFolder);
      let file = this.app.vault.getAbstractFileByPath(filePath);
      const content = serializeStickersData(this.notes);

      if (file && file instanceof TFile) {
        const currentContent = await this.app.vault.read(file);
        const newContent = this.replaceStickersBlock(currentContent, content);
        await this.app.vault.modify(file, newContent);
      } else {
        const fileContent = content + '\n\n# 贴纸墙\n\n*在这里添加你的贴纸*\n';
        await this.app.vault.create(filePath, fileContent);
      }
    } catch (e) {
      console.error("Failed to save notes:", e);
      new Notice("Save failed!");
    }
  }

  private replaceStickersBlock(content: string, newData: string): string {
    // 使用动态构建正则避免模板字符串解析问题
    const codeBlockStart = '```stickers-data';
    const regex = new RegExp(codeBlockStart + '\\n[\\s\\S]*?\\n```', 'm');
    if (regex.test(content)) {
      return content.replace(regex, newData);
    }
    return newData + '\n\n' + content;
  }

  private render() {
    const container = this.contentEl;
    container.innerHTML = '';

    // 添加样式
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    container.appendChild(style);

    // 主容器
    const wallEl = document.createElement('div');
    wallEl.className = 'sticker-wall';

    // 贴纸墙容器
    const notesContainer = document.createElement('div');
    notesContainer.className = 'sticker-container';
    this.notesContainerEl = notesContainer;

    // 右键创建幽灵贴纸
    notesContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = notesContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.createGhostSticker(x, y);
    });

    // 按 Escape 取消幽灵贴纸
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.ghostNote) {
        this.removeGhostSticker();
      }
    });

    wallEl.appendChild(notesContainer);

    container.appendChild(wallEl);
  }

  private createGhostSticker(x: number, y: number) {
    // 移除之前的幽灵贴纸
    this.removeGhostSticker();

    const container = this.notesContainerEl;
    if (!container) return;

    // 随机生成颜色
    const noteColor = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    const availableTapeColors = NOTE_COLORS.filter(c => c !== noteColor);
    const tapeColor = availableTapeColors.length > 0 
      ? availableTapeColors[Math.floor(Math.random() * availableTapeColors.length)]
      : noteColor;

    // 创建幽灵贴纸元素
    const ghostEl = document.createElement('div');
    ghostEl.className = 'sticker-note ghost';
    ghostEl.style.left = x + 'px';
    ghostEl.style.top = y + 'px';
    ghostEl.style.backgroundColor = noteColor;

    // 胶带
    const tape = document.createElement('div');
    tape.className = 'tape';
    tape.style.backgroundColor = tapeColor;

    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => this.removeGhostSticker());

    // 可编辑的标题
    const header = document.createElement('div');
    header.className = 'note-header';

    const username = document.createElement('span');
    username.className = 'username';
    username.contentEditable = 'true';
    username.textContent = UI_TEXT.title;

    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = formatTime(new Date());

    header.appendChild(username);
    header.appendChild(time);

    // 可编辑的内容
    const contentDiv = document.createElement('div');
    contentDiv.className = 'note-content editing';
    contentDiv.contentEditable = 'true';
    contentDiv.dataset.placeholder = UI_TEXT.content;
    contentDiv.textContent = '';

    // 回车添加贴纸（Shift+Enter 换行）
    contentDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const content = contentDiv.innerHTML;
        const userName = username.textContent || UI_TEXT.title;
        this.addNote(userName, content, x, y, noteColor, tapeColor);
        this.removeGhostSticker();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.removeGhostSticker();
      }
      // Shift+Enter 插入换行
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        document.execCommand('insertLineBreak', false);
      }
    });

    // 左键点击空白处取消
    contentDiv.addEventListener('blur', () => {
      // 延迟检查，因为可能是点击添加
      setTimeout(() => {
        if (this.ghostNote && !ghostEl.contains(document.activeElement)) {
          this.removeGhostSticker();
        }
      }, 100);
    });

    ghostEl.appendChild(deleteBtn);
    ghostEl.appendChild(tape);
    ghostEl.appendChild(header);
    ghostEl.appendChild(contentDiv);

    container.appendChild(ghostEl);
    this.ghostNote = { el: ghostEl, x, y, color: noteColor, tapeColor: tapeColor };

    // 聚焦到内容区域
    contentDiv.focus();
  }

  private removeGhostSticker() {
    if (this.ghostNote) {
      this.ghostNote.el.remove();
      this.ghostNote = null;
    }
  }

  private getStyles(): string {
    return `
      body {
        margin: 0;
        padding: 0;
        font-family: "微软雅黑", "Arial", sans-serif;
        background: #dfe6e9;
      }
      .sticker-wall {
        width: 100%;
        height: 100%;
        background: #dfe6e9;
        display: flex;
        flex-direction: column;
      }
      .sticker-input-area {
        position: absolute;
        z-index: 100;
        background: rgba(255, 255, 255, 0.95);
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: none;
        flex-direction: column;
        gap: 8px;
        width: 300px;
      }
      .sticker-input-area input.title-input {
        width: 100%;
        padding: 12px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
      }
      .sticker-input-area .content-editor {
        width: 100%;
        min-height: 120px;
        padding: 12px;
        font-size: 14px;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        border: 1px solid #ccc;
        border-radius: 5px;
        background: #fff;
        outline: none;
        box-sizing: border-box;
        resize: vertical;
      }
      .sticker-input-area .content-editor:focus {
        border-color: #4caf50;
      }
      .sticker-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: auto;
        box-sizing: border-box;
      }
      .sticker-note {
        position: absolute;
        width: 250px;
        min-height: 150px;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        padding: 20px 15px;
        padding-top: 20px;
        cursor: move;
        user-select: none;
      }
      /* 纵向胶带贴在贴纸顶部中间 - 使用贴纸自己的 tapeColor */
      .sticker-note .tape {
        content: "";
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 24px;
        border-radius: 2px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      }
      .sticker-note:hover {
        box-shadow: 0 6px 12px rgba(0,0,0,0.3);
      }
      .sticker-note .delete-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 18px;
        height: 18px;
        border: none;
        background: transparent;
        color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        padding: 2px;
        opacity: 0;
        transition: opacity 0.2s, color 0.2s;
      }
      .sticker-note:hover .delete-btn { opacity: 1; }
      .sticker-note .delete-btn:hover { color: rgba(255, 0, 0, 0.8); }
      .sticker-note .note-header {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 12px;
        color: #555;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
      }
      .sticker-note .note-content {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 14px;
        color: #333;
        word-break: break-all;
        min-height: 20px;
        cursor: text;
        white-space: pre-wrap;
      }
      .sticker-note .note-content.editing {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px;
        margin: -4px;
        outline: none;
        white-space: pre-wrap;
      }
      .sticker-note .note-content .md-block {
        white-space: pre-wrap;
      }
      .sticker-note .note-content p { margin: 0 0 4px 0; line-height: 1.4; }
      .sticker-note .note-content p:last-child { margin-bottom: 0; }
      .sticker-note .note-content br { display: block; content: ""; margin: 2px 0; }
      .sticker-note .note-content strong { font-weight: bold; }
      .sticker-note .note-content em { font-style: italic; }
      .sticker-note .note-content code {
        background: rgba(0,0,0,0.1);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: monospace;
      }
      .sticker-note .note-content pre {
        background: rgba(0,0,0,0.1);
        padding: 8px;
        border-radius: 4px;
        overflow-x: auto;
      }
      .sticker-note .note-content ul, .sticker-note .note-content ol {
        margin: 8px 0;
        padding-left: 20px;
      }
      .sticker-note .note-content a {
        color: #1976d2;
        text-decoration: underline;
      }
      .sticker-note .note-content h1,
      .sticker-note .note-content h2,
      .sticker-note .note-content h3 {
        margin: 8px 0;
        font-weight: bold;
      }
      .sticker-note .note-content h1 { font-size: 18px; }
      .sticker-note .note-content h2 { font-size: 16px; }
      .sticker-note .note-content h3 { font-size: 14px; }
      .sticker-note .note-content blockquote {
        border-left: 3px solid #ccc;
        padding-left: 10px;
        margin: 8px 0;
        color: #666;
      }
      .sticker-note .note-content del { text-decoration: line-through; }
      .sticker-note .note-content hr {
        border: none;
        border-top: 1px solid #ccc;
        margin: 8px 0;
      }
      .edit-hint {
        font-size: 10px;
        color: #999;
        text-align: center;
        margin-top: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .sticker-note:hover .edit-hint { opacity: 1; }
      .sticker-note.ghost {
        opacity: 0.9;
        animation: ghost-pulse 1s infinite;
      }
      .sticker-note.ghost .delete-btn { opacity: 1; }
      @keyframes ghost-pulse {
        0%, 100% { box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        50% { box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
      }
      .note-header .username {
        outline: none;
        cursor: text;
        padding: 2px 4px;
        border-radius: 3px;
        margin: -2px -4px;
      }
      .note-header .username:focus {
        background: rgba(255, 255, 255, 0.3);
      }
    `;
  }

  private addNote(userName: string, content: string, x?: number, y?: number, color?: string, tapeColor?: string) {
    // 处理 HTML 内容中的换行和空格
    // contentEditable 中 Enter 会创建 <div>，我们统一转换为单换行
    let processedContent = content
      .replace(/<br\s*\/?>/gi, '\n')  // <br> 转为换行
      .replace(/<div[^>]*>/gi, '\n')   // <div> 转为换行
      .replace(/<\/div>/gi, '\n')      // </div> 转为换行
      .replace(/<p[^>]*>/gi, '\n')     // <p> 转为换行
      .replace(/<\/p>/gi, '\n')        // </p> 转为换行
      .replace(/&nbsp;/gi, ' ')        // &nbsp; 转为空格
      .replace(/\n{3,}/g, '\n\n')      // 最多保留两个连续换行
      .trim();

    const textContent = processedContent.replace(/<[^>]*>/g, '').trim();
    if (!textContent && !userName.trim()) return;

    const now = new Date();
    const containerWidth = this.notesContainerEl?.clientWidth || 800;
    const containerHeight = this.notesContainerEl?.clientHeight || 600;

    // 选择贴纸颜色：如果未指定则随机选择
    const noteColor = color || NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    
    // 选择胶带颜色：如果未指定则选择与贴纸颜色不同的
    const finalTapeColor = tapeColor || (() => {
      const availableTapeColors = NOTE_COLORS.filter(c => c !== noteColor);
      return availableTapeColors.length > 0 
        ? availableTapeColors[Math.floor(Math.random() * availableTapeColors.length)]
        : noteColor;
    })();

    const newNote: StickerNote = {
      id: generateId(),
      userName: userName.trim() || UI_TEXT.title,
      content: processedContent,
      time: formatTime(now),
      x: x ?? Math.random() * (containerWidth - 270),
      y: y ?? Math.random() * (containerHeight - 220),
      rotate: Math.random() * 20 - 10,
      color: noteColor,
      tapeColor: finalTapeColor
    };

    this.notes = [...this.notes, newNote];
    this.saveNotes();
    this.renderNotes();

    new Notice("Sticker added!");
  }

  private async renderNotes() {
    if (!this.notesContainerEl) return;
    this.notesContainerEl.innerHTML = '';

    for (const note of this.notes) {
      const noteEl = document.createElement('div');
      noteEl.className = 'sticker-note';
      noteEl.style.left = note.x + 'px';
      noteEl.style.top = note.y + 'px';
      noteEl.style.backgroundColor = note.color;
      noteEl.style.transform = 'rotate(' + note.rotate + 'deg)';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNote(note.id);
      });

      // 胶带
      const tape = document.createElement('div');
      tape.className = 'tape';
      tape.style.backgroundColor = note.tapeColor;

      const header = document.createElement('div');
      header.className = 'note-header';

      // 可编辑的用户名
      const username = document.createElement('span');
      username.className = 'username';
      username.contentEditable = 'true';
      username.textContent = note.userName;
      username.addEventListener('blur', () => {
        const newUserName = username.textContent?.trim() || UI_TEXT.title;
        if (newUserName !== note.userName) {
          note.userName = newUserName;
          this.updateNoteContent(note);
        }
      });
      username.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          username.blur();
        }
      });

      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = note.time;

      header.appendChild(username);
      header.appendChild(time);

      // 可编辑的内容区域
      const contentDiv = document.createElement('div');
      contentDiv.className = 'note-content';
      contentDiv.contentEditable = 'true';
      contentDiv.dataset.noteId = note.id;

      // 渲染 Markdown 内容
      contentDiv.innerHTML = this.renderMarkdown(note.content);

      // 点击内容区域时进入编辑模式
      contentDiv.addEventListener('focus', () => {
        contentDiv.classList.add('editing');
      });

      // 失去焦点时保存 HTML 内容
      contentDiv.addEventListener('blur', () => {
        contentDiv.classList.remove('editing');
        const newContent = contentDiv.innerHTML;
        if (newContent !== this.renderMarkdown(note.content)) {
          // 转换 HTML 回 Markdown 文本
          note.content = this.htmlToMarkdown(newContent);
          this.updateNoteContent(note);
        }
        // 重新渲染 Markdown 显示
        contentDiv.innerHTML = this.renderMarkdown(note.content);
      });

      // 回车键保存并退出编辑，Shift+Enter 换行
      contentDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          contentDiv.blur();
        }
        if (e.key === 'Escape') {
          contentDiv.blur();
        }
        // Shift+Enter 插入换行
        if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault();
          document.execCommand('insertLineBreak', false);
        }
      });

      noteEl.appendChild(deleteBtn);
      noteEl.appendChild(tape);
      noteEl.appendChild(header);
      noteEl.appendChild(contentDiv);

      this.setupDrag(noteEl, note);
      this.notesContainerEl.appendChild(noteEl);
    }
  }

  private renderMarkdown(content: string): string {
    let html = content;

    // 转义 HTML 特殊字符
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // 代码块 - 需要先处理避免转义问题
    const codeBlockRegex = new RegExp('```(\\w*)\\n([\\s\\S]*?)```', 'g');
    html = html.replace(codeBlockRegex, (_, lang, code) => {
      return '<pre><code>' + code.trim() + '</code></pre>';
    });

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 粗体和斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // 删除线
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 无序列表
    html = html.replace(/^[\s]*[-*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // 有序列表
    html = html.replace(/^[\s]*\d+\. (.+)$/gm, '<li>$1</li>');

    // 引用
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // 分割线
    html = html.replace(/^---$/gm, '<hr>');

    // 换行处理 - 统一使用 <br> 标签
    // \n\n 或空行转为段落分隔，\n 转为 <br>
    html = html.replace(/\n\n/g, '</p><br><p>');
    html = html.replace(/\n/g, '<br>');
    
    // 包装在段落标签中（如果没有被其他标签包裹）
    if (!html.startsWith('<p>') && !html.startsWith('<h') && !html.startsWith('<ul') && 
        !html.startsWith('<blockquote') && !html.startsWith('<pre') && !html.startsWith('<hr')) {
      html = '<p>' + html + '</p>';
    }

    return html;
  }

  // 将 HTML 转回 Markdown 文本
  private htmlToMarkdown(html: string): string {
    let text = html;
    
    // 处理代码块（先处理避免被其他规则影响）
    text = text.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```');
    
    // 处理行内代码
    text = text.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    
    // 处理标题
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
    
    // 处理粗体和斜体
    text = text.replace(/<strong><em>(.*?)<\/em><\/strong>/gi, '***$1***');
    text = text.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    text = text.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    text = text.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    text = text.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    
    // 处理删除线
    text = text.replace(/<del>(.*?)<\/del>/gi, '~~$1~~');
    text = text.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');
    
    // 处理链接
    text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // 处理列表
    text = text.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
    text = text.replace(/<\/?ul[^>]*>/gi, '');
    text = text.replace(/<\/?ol[^>]*>/gi, '');
    
    // 处理引用
    text = text.replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n');
    
    // 处理分割线
    text = text.replace(/<hr\s*\/?>/gi, '---\n');
    
    // 处理段落和换行 - 关键：对称转换
    // </p> 后跟 <br> 表示段落结束+换行，转为 \n\n
    // 先处理 </p><br> 的情况
    text = text.replace(/<\/p>\s*<br>\s*/gi, '\n\n');
    // 再处理单独的 </p>
    text = text.replace(/<\/p>/gi, '\n\n');
    // 处理 <p> 标签
    text = text.replace(/<p[^>]*>/gi, '');
    // 处理单独的 <br>（不是 </p><br>）
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // 移除剩余的 HTML 标签
    text = text.replace(/<[^>]+>/g, '');
    
    // 解码 HTML 实体
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&nbsp;/g, ' ');
    
    // 清理多余空白，但保留双换行（段落分隔）
    text = text.replace(/[ \t]+\n/g, '\n');  // 行尾空格
    text = text.replace(/\n{4,}/g, '\n\n');  // 最多三个连续换行
    text = text.trim();
    
    return text;
  }

  private setupDrag(noteEl: HTMLElement, note: StickerNote) {
    let startX = 0;
    let startY = 0;
    let originalX = 0;
    let originalY = 0;
    let hasMoved = false;

    noteEl.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      // 不对删除按钮和内容区域触发拖拽
      if (target.classList.contains('delete-btn') || 
          target.classList.contains('note-content')) return;

      startX = e.clientX;
      startY = e.clientY;
      originalX = note.x;
      originalY = note.y;
      hasMoved = false;

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasMoved = true;
        }
        if (hasMoved) {
          note.x = originalX + dx;
          note.y = originalY + dy;
          noteEl.style.left = note.x + 'px';
          noteEl.style.top = note.y + 'px';
        }
      };

      const handleMouseUp = () => {
        if (hasMoved) {
          this.updateNotePosition(note);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  }

  private updateNoteContent(note: StickerNote) {
    this.notes = this.notes.map(n => n.id === note.id ? note : n);
    this.saveNotes();
    new Notice("Sticker saved!");
  }

  private updateNotePosition(note: StickerNote) {
    this.notes = this.notes.map(n => n.id === note.id ? note : n);
    this.saveNotes();
  }

  private deleteNote(id: string) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveNotes();
    this.renderNotes();
    new Notice("Sticker deleted!");
  }
}
