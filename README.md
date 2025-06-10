# Types Cleanup 🧹

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/types-cleanup)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/VS%20Code-Compatible-green.svg)](https://code.visualstudio.com/)
[![Cursor](https://img.shields.io/badge/Cursor-Compatible-blue.svg)](https://cursor.sh/)

**The ultimate TypeScript type organization tool for modern development workflows!**

Automatically extract, organize, and manage TypeScript interfaces and type definitions from your codebase. Perfect for AI-assisted development in VS Code and Cursor IDE.

## ✨ Key Features

- 🎯 **Smart Extraction** - Automatically captures both `interface` and `type` definitions
- 🔄 **Intelligent Merging** - Combines duplicate interfaces while preserving all unique properties
- 🗂️ **Auto-Organization** - Sorts types first, then interfaces alphabetically
- 🧹 **Cleanup Engine** - Removes unused type definitions automatically
- 📊 **Live Status** - Interactive status bar with real-time statistics
- ⚙️ **Highly Configurable** - Customize paths, delays, and behavior
- 🎨 **Theme-Aware** - Status colors match your editor theme
- 🤖 **AI-Optimized** - Perfect for AI-generated code organization

## 🚀 Quick Start

### 1. Install & Setup

```bash
git clone https://github.com/yourusername/types-cleanup
cd types-cleanup
npm install
npm run compile
```

### 2. Configure Your Types File

```json
{
  "typesCleanup.typesFileName": "types/Types.d.ts"
}
```

### 3. Launch Extension

1. Open extension folder in VS Code: `code .`
2. Press `F5` to launch Extension Development Host
3. Open your TypeScript project
4. Look for the 🧹 icon in status bar

### 4. Test It Out

Create a TypeScript file with types and interfaces:

```typescript
export type EditorState = "crop" | "blur" | "paint";
export type NavigationDirection = "next" | "prev";

interface UserProfile {
  id: string;
  name: string;
  preferences: EditorState[];
}
```

Save the file and watch your types get organized automatically! 🎉

## 📊 Interactive Status Bar

Click the status bar icon to access the command menu:

| Status                  | Description               | Action           |
| ----------------------- | ------------------------- | ---------------- |
| 🧹 Types Cleanup 🧹 (5) | Active with 5 types moved | Click for menu   |
| 🧹 Types Cleanup ⚠️     | Waiting for types file    | Configure path   |
| 🧹 Types Cleanup ❌     | Extension disabled        | Enable extension |

### Status Bar Menu Options:

- **Toggle Extension** - Enable/disable on-the-fly
- **Configure Directory** - Set custom types file path
- **View Statistics** - See detailed stats and activity
- **Manual Cleanup** - Remove unused types immediately

## 🎯 What Gets Extracted

### Type Definitions

```typescript
// ✅ All of these get captured:
export type Status = "active" | "inactive";
type LocalType = string | number;
export type ComplexType = {
  id: string;
  data: Record<string, any>;
};
```

### Interface Definitions

```typescript
// ✅ All of these get captured:
export interface ApiResponse {
  status: number;
  data: any;
}

interface ComponentProps {
  title: string;
  onClick: () => void;
}
```

## ⚙️ Configuration Options

| Setting                          | Default        | Description                                  |
| -------------------------------- | -------------- | -------------------------------------------- |
| `typesCleanup.enabled`           | `true`         | Master enable/disable switch                 |
| `typesCleanup.typesFileName`     | `"Types.d.ts"` | Path to types file (supports subdirectories) |
| `typesCleanup.cleanupDelay`      | `2000`         | Delay before cleaning unused types (ms)      |
| `typesCleanup.enableAutoCleanup` | `true`         | Automatically remove unused definitions      |
| `typesCleanup.preserveExisting`  | `true`         | Preserve existing types when adding new ones |

### Configuration Examples

**For `/types` folder structure:**

```json
{
  "typesCleanup.typesFileName": "types/Types.d.ts"
}
```

**For large projects (conservative settings):**

```json
{
  "typesCleanup.enableAutoCleanup": false,
  "typesCleanup.cleanupDelay": 5000
}
```

**For AI development (aggressive organization):**

```json
{
  "typesCleanup.enabled": true,
  "typesCleanup.cleanupDelay": 1000,
  "typesCleanup.enableAutoCleanup": true
}
```

## 🔄 How It Works

### 1. **Extraction Process**

- Monitors `.ts` and `.tsx` file saves
- Parses for `interface` and `type` declarations
- Extracts complete definitions including multi-line types

### 2. **Smart Merging**

```typescript
// File A
interface User {
  id: string;
  name: string;
}

// File B
interface User {
  email: string;
  age: number;
}

// Result in Types.d.ts
export interface User {
  age: number;
  email: string;
  id: string;
  name: string;
}
```

### 3. **Type Handling**

```typescript
// Types get updated, not merged
type Status = "loading"; // Old
type Status = "loading" | "ready"; // New (replaces old)
```

### 4. **Auto-Organization**

Generated types file structure:

```typescript
// Auto-generated types file managed by Types Cleanup 🧹

// Types come first (alphabetical)
export type EditorState = "crop" | "blur";
export type NavigationDirection = "next" | "prev";

// Then interfaces (alphabetical)
export interface ComponentProps {
  title: string;
}

export interface UserProfile {
  id: string;
  name: string;
}
```

## 🎮 Commands & Shortcuts

### Command Palette Commands:

- `Types Cleanup: Toggle` - Enable/disable extension
- `Types Cleanup: Cleanup Types Now` - Manual cleanup
- `Types Cleanup: Show Types Cleanup Menu` - Open interactive menu

### Quick Actions:

- **Status bar click** - Open command menu
- **Save TypeScript file** - Auto-extract types
- **Hover status bar** - View detailed tooltip

## 🔧 Advanced Usage

### Custom Types File Locations

```json
{
  "typesCleanup.typesFileName": "src/shared/types.d.ts"
}
```

### Workspace-Specific Settings

Create `.vscode/settings.json` in your project:

```json
{
  "typesCleanup.typesFileName": "types/global.d.ts",
  "typesCleanup.enableAutoCleanup": true
}
```

### Disable for Specific Projects

```json
{
  "typesCleanup.enabled": false
}
```

## 🤖 Perfect for AI Development

### Cursor IDE Integration

- Organizes AI-generated interfaces automatically
- Handles rapid prototyping with duplicate type cleanup
- Maintains clean types as you iterate with AI assistance

### GitHub Copilot Friendly

- Cleans up Copilot-suggested interfaces
- Merges duplicate suggestions intelligently
- Keeps your types consistent across AI sessions

## 🔍 Troubleshooting

### Extension Not Working?

- ✅ Check status bar for 🧹 icon
- ✅ Verify types file exists at configured path
- ✅ Ensure you're saving `.ts` or `.tsx` files
- ✅ Check VS Code output panel for errors

### Types File Not Found?

```bash
# Create types file if missing
mkdir -p types
touch types/Types.d.ts

# Or configure different path
{
  "typesCleanup.typesFileName": "your-path/types.d.ts"
}
```

### Types Not Being Extracted?

- ✅ Verify proper TypeScript syntax
- ✅ Check that definitions start with `interface` or `type`
- ✅ Ensure files have `.ts` or `.tsx` extensions
- ✅ Confirm extension is enabled (green status bar)

### Cleanup Not Working?

- ✅ Wait for cleanup delay (default: 2 seconds)
- ✅ Check `typesCleanup.enableAutoCleanup` is `true`
- ✅ Try manual cleanup via command palette
- ✅ Verify types aren't used in comments or strings

## 🛠️ Development

### Build from Source

```bash
git clone https://github.com/yourusername/types-cleanup
cd types-cleanup
npm install
npm run compile
```

### Watch Mode (for development)

```bash
npm run watch
```

### Package Extension

```bash
npm install -g vsce
vsce package
```

### Testing

1. Press `F5` in VS Code to launch Extension Development Host
2. Open TypeScript project with types file
3. Save files with interfaces/types
4. Verify extraction and organization

## 📈 Statistics & Monitoring

The extension tracks:

- **Types moved** since last save
- **Total interfaces** in types file
- **Cleanup activity** and timing
- **File monitoring** status

Access stats via status bar menu → "View Statistics"

## 🎨 Customization

### Status Bar Appearance

The extension automatically matches your theme colors:

- **Active state** - Default theme color
- **Warning state** - Theme warning color
- **Disabled state** - Theme disabled color

### Tooltip Information

Hover over status bar for:

- Current status and file path
- Types moved counter
- Available actions
- Configuration summary

## 📝 Changelog

### [1.0.0] - 2025-06-10

- ✨ Initial release with full type extraction
- 🔄 Smart interface merging and deduplication
- 🧹 Automatic cleanup of unused definitions
- 📊 Interactive status bar with live statistics
- ⚙️ Comprehensive configuration options
- 🎯 Support for both `interface` and `type` definitions
- 🎨 Theme-aware status indicators
- 🤖 Optimized for AI-assisted development workflows
- 🔧 VS Code and Cursor IDE compatibility

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with VS Code Extension API
- Inspired by the need for automated TypeScript organization
- Thanks to the TypeScript and AI development communities
- Special appreciation for Cursor IDE's innovative approach

---

**Ready to keep your TypeScript types perfectly organized?**

Install Types Cleanup 🧹 and experience effortless type management in your development workflow!

⭐ **Star this project if it helps you!** ⭐
