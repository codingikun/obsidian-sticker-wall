# Obsidian Sticker Wall

A virtual sticky note wall plugin for Obsidian that lets you create and manage notes visually.

[中文](./README_zh-CN.md) | English

![Obsidian](https://img.shields.io/badge/Obsidian-0.15.0+-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=flat-square)

## Features

- 🎨 **Sticker Wall View** - Create a visual sticky note wall interface in Obsidian
- ✏️ **Markdown Support** - Rich text content with Markdown rendering
- 🎲 **Random Colors** - Auto-generated random sticker and tape colors
- 📍 **Free Dragging** - Move stickers anywhere on the wall
- 💾 **Auto Save** - Data automatically saved to Markdown files
- ⚡ **Lightweight** - Pure native implementation, no extra dependencies

## Preview

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ┌─────────┐              ┌─────────┐                │
│    │  tape   │              │  tape   │                │
│    ├─────────┤              ├─────────┤                │
│    │ Title   │              │ Title   │                │
│    │ --------│              │ --------│                │
│    │ Content │              │ Content │                │
│    │ with    │              │ **bold**│                │
│    │ *italic*│              │         │                │
│    └─────────┘              └─────────┘                │
│                                                         │
│           ┌─────────┐                                   │
│           │  tape   │                                   │
│           ├─────────┤                                   │
│           │ Title   │                                   │
│           │ --------│                                   │
│           │ Notes   │                                   │
│           │ - [x] Task1│                                 │
│           │ - [ ] Task2│                                 │
│           └─────────┘                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Installation

### Option 1: Community Plugins (Pending Review)

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "Sticker Wall"
4. Install and enable

### Option 2: Manual Install

1. Download the latest release from [Releases](https://github.com/codingkun/obsidian-sticker-wall/releases)
2. Extract and put `manifest.json` and `main.js` into `.obsidian/plugins/sticker-wall/` folder in your vault
3. Enable the plugin in Obsidian settings

### Option 3: Development Version

```bash
# Clone the repository
git clone https://github.com/codingkun/obsidian-sticker-wall.git

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build
```

## Usage

### Open Sticker Wall

You can open the sticker wall in several ways:

1. **Command Palette** - Press `Ctrl/Cmd + P`, type "open-sticker-wall"
2. **Sidebar Icon** - Click the sticky note icon in the left sidebar
3. **Ribbon Icon** - Click the sticky note icon in the Ribbon area

### Create a Sticker

1. **Right-click** on empty area of the sticker wall
2. Enter sticker title (optional)
3. Enter sticker content
4. Press **Enter** to confirm
5. Press **Escape** to cancel

### Edit a Sticker

- **Title** - Click on the title area to edit
- **Content** - Click on the content area to edit, supports Markdown syntax

### Move a Sticker

- Drag the sticker anywhere on the wall
- Position is saved automatically

### Delete a Sticker

- Hover over the sticker to show the delete button
- Click the `×` button to delete

### Markdown Support

Sticker content supports the following Markdown syntax:

| Syntax | Example |
|--------|---------|
| Bold | `**bold**` |
| Italic | `*italic*` |
| Strikethrough | `~~strikethrough~~` |
| Headings | `# Heading` / `## Subheading` |
| Inline Code | `` `code` `` |
| Code Block | <code>\`\`\`code block\`\`\`</code> |
| Links | `[text](URL)` |
| Blockquote | `> quote` |
| Lists | `- item` / `1. ordered item` |
| Horizontal Rule | `---` |

## Settings

### Data Folder

You can customize where sticker data is saved:

1. Open Settings → Sticker Wall Settings
2. Set "Data Folder"
   - Leave empty: saved to vault root
   - Enter path: e.g., `Stickers/` saves to Stickers folder

## Data Storage

Sticker data is stored in JSON format in the `stickers-data` code block of `sticker-wall.md`:

```markdown
```stickers-data
[
  {
    "id": "uuid",
    "userName": "Title",
    "content": "Sticker content (Markdown)",
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

> ⚠️ **Warning**: Do not manually edit this code block, otherwise data loss may occur.

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Sticker Wall | `Ctrl/Cmd + P` → "open-sticker-wall" |
| Create Sticker | Right-click on empty area |
| Confirm Add | `Enter` |
| Cancel Create | `Escape` |
| Edit Title | `Enter` (in title area) |
| Exit Edit | `Escape` (in content area) |

## FAQ

### Q: Sticker wall won't open?
A: Make sure the plugin is enabled and Obsidian version >= 0.15.0

### Q: Where is the data saved?
A: By default, saved to `sticker-wall.md` in vault root

### Q: How to backup sticker data?
A: Just backup the `sticker-wall.md` file, it contains all sticker data

### Q: Can I use images as sticker background?
A: Not currently supported, may be added in future versions

## Changelog

### v1.0.0
- ✨ Initial release
- Sticker create, edit, delete, move
- Markdown content rendering
- Random sticker and tape colors
- Auto save

## Contributing

Issues and Pull Requests are welcome!

## License

[MIT License](./LICENSE)

---

If you find this plugin useful, please give it a ⭐️!
