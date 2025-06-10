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
- 📊 **Live Statistics** - Interactive status bar with real-time statistics
- ⚙️ **Highly Configurable** - Customize paths, delays, and behavior
- 🎨 **Theme-Aware** - Status colors match your editor theme
- 🤖 **AI-Optimized** - Perfect for AI-generated code organization
- 🔧 **Source Cleanup** - Removes interfaces from files and adds smart imports
- 📈 **Enhanced Stats** - Track additions, removals, and extractions

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

Save the file and watch the magic happen:

- ✅ Interface gets **extracted** from your file
- ✅ Interface gets **removed** from the source
- ✅ **Import is added**: `import { UserProfile } from "@/types/types";`
- ✅ Interface appears in your `types/Types.d.ts` file
- ✅ Status bar updates: `🧹 (+1/-0)`

## 📊 Interactive Status Bar

The status bar shows live statistics and provides quick access to all features:

| Status Display | Meaning                  | Click Action       |
| -------------- | ------------------------ | ------------------ |
| `🧹 (+5/-2)`   | 5 types added, 2 removed | Open command menu  |
| `🧹 ⚠️`        | Waiting for types file   | Configure settings |
| `🧹 ❌`        | Extension disabled       | Enable extension   |

### Enhanced Status Bar Menu:

Click the status bar icon to access:

- **🔄 Toggle Extension** - Enable/disable on-the-fly
- **⚙️ Configure Directory** - Set custom types file path
- **📊 View Statistics** - See detailed stats and activity
- **🧹 Manual Cleanup** - Remove unused types immediately
- **🔄 Reset Statistics** - Clear all counters

## 🎯 What Gets Extracted & How

### Before (Your Source File):

```typescript
// components/pagination.tsx
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
}: PaginationProps) {
  return (
    <div>
      <Button onClick={onPrevious}>Previous</Button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <Button onClick={onNext}>Next</Button>
    </div>
  );
}
```

### After Saving (Automatic Transformation):

**📁 Your Source File (components/pagination.tsx):**

```typescript
import { Button } from "@/components/ui/button";
import { PaginationProps } from "@/types/types"; // ← Added automatically

export function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrevious,
}: PaginationProps) {
  return (
    <div>
      <Button onClick={onPrevious}>Previous</Button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <Button onClick={onNext}>Next</Button>
    </div>
  );
}
```

**📁 Your Types File (types/Types.d.ts):**

```typescript
// Auto-generated types file managed by Types Cleanup 🧹
// This file is automatically updated when you save TypeScript files

export interface PaginationProps {
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
  totalPages: number;
}
```

### Type Definitions Also Supported:

```typescript
// ✅ All of these get captured and organized:
export type Status = "active" | "inactive";
type LocalType = string | number;
export type ComplexType = {
  id: string;
  data: Record<string, any>;
};
```

### Smart Import Management:

If you already have imports from your types file:

```typescript
// Before
import { EditorState } from "@/types/types";

// After saving file with new interface
import { EditorState, PaginationProps } from "@/types/types"; // ← Merged automatically
```

## ⚙️ Complete Configuration Guide

| Setting                           | Default        | Description                                         |
| --------------------------------- | -------------- | --------------------------------------------------- |
| `typesCleanup.enabled`            | `true`         | Master enable/disable switch                        |
| `typesCleanup.typesFileName`      | `"Types.d.ts"` | Path to types file (supports subdirectories)        |
| `typesCleanup.cleanupDelay`       | `2000`         | Delay before cleaning unused types (ms)             |
| `typesCleanup.enableAutoCleanup`  | `true`         | Automatically remove unused definitions             |
| `typesCleanup.cleanupSourceFiles` | `true`         | Remove interfaces from source files and add imports |

### Configuration Examples

**For `/types` folder structure:**

```json
{
  "typesCleanup.typesFileName": "types/Types.d.ts"
}
```

**For `/src/types` folder:**

```json
{
  "typesCleanup.typesFileName": "src/types/global.d.ts"
}
```

**Conservative mode (no source cleanup):**

```json
{
  "typesCleanup.cleanupSourceFiles": false,
  "typesCleanup.enableAutoCleanup": false
}
```

**Aggressive AI development mode:**

```json
{
  "typesCleanup.enabled": true,
  "typesCleanup.cleanupDelay": 1000,
  "typesCleanup.enableAutoCleanup": true,
  "typesCleanup.cleanupSourceFiles": true
}
```

**Large project settings:**

```json
{
  "typesCleanup.cleanupDelay": 5000,
  "typesCleanup.enableAutoCleanup": false
}
```

## 🔄 How the Smart Workflow Works

### 1. **Detection Phase**

- Monitors saves of `.ts` and `.tsx` files
- Scans for `interface` and `type` declarations
- Extracts complete definitions including multi-line types

### 2. **Extraction Phase**

```typescript
// Finds and extracts this entire block:
interface ComplexInterface {
  id: string;
  metadata: {
    created: Date;
    updated?: Date;
  };
  permissions: Array<{
    role: string;
    actions: string[];
  }>;
}
```

### 3. **Organization Phase**

- Merges with existing types file
- Sorts types alphabetically (types first, then interfaces)
- Handles duplicate interface merging intelligently

### 4. **Source Cleanup Phase** (if enabled)

- Removes interface definition from original file
- Calculates optimal import path automatically
- Updates or creates import statement
- Preserves existing imports and adds new ones

### 5. **Statistics Tracking**

- **Types Added**: Count of definitions added to types file
- **Types Removed**: Count removed during cleanup
- **Interfaces Extracted**: Count extracted from source files
- **Lines Removed**: Actual lines removed from source files

## 📈 Enhanced Statistics & Monitoring

### Status Bar Tooltip Information:

```
Types Cleanup 🧹

Status: Active
Description: Monitoring Types.d.ts
Types File: types/Types.d.ts
Types Added: 12
Types Removed: 3
Interfaces Extracted: 8
Last Activity: Extracted 1 interface(s) from pagination.tsx

Options:
• Click to open menu
• Toggle on/off
• Configure settings
• Manual cleanup
```

### Detailed Statistics View:

Access via status bar menu → "View Statistics":

```
• Status: Enabled
• Types File: types/Types.d.ts
• File Exists: Yes
• Current Interfaces: 23
• Types Added: 12
• Types Removed: 3
• Interfaces Extracted: 8
• Last Activity: Extracted 1 interface(s) from pagination.tsx
• Auto Cleanup: Enabled
• Source Cleanup: Enabled
• Cleanup Delay: 2000ms
```

## 🎮 Commands & Shortcuts

### Command Palette Commands:

- `Types Cleanup: Toggle` - Enable/disable extension
- `Types Cleanup: Cleanup Types Now` - Manual cleanup
- `Types Cleanup: Show Types Cleanup Menu` - Open interactive menu
- `Types Cleanup: Test Type Extraction` - Debug what gets extracted
- `Types Cleanup: Reset Statistics` - Clear all counters

### Quick Actions:

- **Status bar click** - Open command menu
- **Save TypeScript file** - Auto-extract types
- **Hover status bar** - View detailed tooltip with stats

## 🤖 Perfect for AI Development

### Cursor IDE Integration

- **Organizes AI-generated interfaces** automatically
- **Handles rapid prototyping** with duplicate type cleanup
- **Maintains clean types** as you experiment with AI assistance
- **Seamless integration** with Cursor's workspace management

### GitHub Copilot & AI Assistants

- **Cleans up AI-suggested interfaces** automatically
- **Merges duplicate suggestions** intelligently
- **Maintains consistency** across AI-generated code
- **Reduces manual type management** overhead

### Real-World AI Workflow:

1. **Ask AI to generate components** with interfaces
2. **Save the generated files** - interfaces automatically extracted
3. **AI suggests variations** - duplicates merged intelligently
4. **Continue iterating** - types stay organized automatically
5. **Clean codebase** maintained without manual intervention

## 🔧 Advanced Usage & Tips

### Working with Complex Projects

**Multiple Types Files:**

```json
{
  "typesCleanup.typesFileName": "src/shared/types.d.ts"
}
```

**Team Workspace Settings:**
Create `.vscode/settings.json` in your project:

```json
{
  "typesCleanup.typesFileName": "types/global.d.ts",
  "typesCleanup.enableAutoCleanup": true,
  "typesCleanup.cleanupSourceFiles": true
}
```

**Disable for Specific Projects:**

```json
{
  "typesCleanup.enabled": false
}
```

### Performance Optimization

**For Large Codebases:**

```json
{
  "typesCleanup.cleanupDelay": 10000,
  "typesCleanup.enableAutoCleanup": false
}
```

**For Development Speed:**

```json
{
  "typesCleanup.cleanupDelay": 500,
  "typesCleanup.enableAutoCleanup": true
}
```

## 🔍 Troubleshooting & FAQ

### ❓ **Extension Not Working?**

- ✅ Check status bar for 🧹 icon (should be visible)
- ✅ Verify types file exists at configured path
- ✅ Ensure you're saving `.ts` or `.tsx` files
- ✅ Check VS Code/Cursor output panel for errors
- ✅ Verify extension is enabled (not showing ❌)

### ❓ **Types File Not Found?**

```bash
# Create types file if missing
mkdir -p types
touch types/Types.d.ts

# Or configure different path in settings
{
  "typesCleanup.typesFileName": "your-custom-path/types.d.ts"
}
```

### ❓ **Interfaces Not Being Extracted?**

- ✅ Verify proper TypeScript syntax
- ✅ Check that definitions start with `interface` or `type`
- ✅ Ensure files have `.ts` or `.tsx` extensions
- ✅ Confirm extension is enabled (green status bar)
- ✅ Test extraction: Command Palette → "Types Cleanup: Test Type Extraction"

### ❓ **Source Cleanup Not Working?**

- ✅ Check `typesCleanup.cleanupSourceFiles` is `true`
- ✅ Verify the interface was actually extracted
- ✅ Look for any TypeScript syntax errors in the file
- ✅ Check console logs for detailed debug information

### ❓ **Import Paths Wrong?**

The extension automatically calculates relative paths. If imports are incorrect:

- ✅ Verify your types file is in the expected location
- ✅ Check workspace root is correctly detected
- ✅ Manually adjust the generated import if needed

### ❓ **Cleanup Removing Used Types?**

- ✅ Wait for cleanup delay (default: 2 seconds)
- ✅ Check if types are used in comments or strings (not detected)
- ✅ Disable auto-cleanup: `"typesCleanup.enableAutoCleanup": false`
- ✅ Use manual cleanup for more control

## 🛠️ Development & Contributing

### Build from Source

```bash
git clone https://github.com/yourusername/types-cleanup
cd types-cleanup
npm install
npm run compile
```

### Development Workflow

```bash
# Watch mode for active development
npm run watch

# Test in Extension Development Host
# Press F5 in VS Code

# Package for distribution
npm install -g vsce
vsce package
```

### Testing Checklist

1. **Test type extraction** with various interface formats
2. **Test source cleanup** and import generation
3. **Test merge behavior** with duplicate interfaces
4. **Test cleanup functionality** with unused types
5. **Test configuration changes** and settings
6. **Test in both VS Code and Cursor**

### Contributing Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Write tests for new functionality
4. Ensure TypeScript compilation succeeds
5. Test with real TypeScript projects
6. Submit pull request with clear description

## 📊 Real-World Usage Examples

### Example 1: React Component Development

```typescript
// Before: components/UserCard.tsx
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  isLoading: boolean;
}

// After saving → Interface moved to types file, import added
import { UserCardProps } from "@/types/types";
```

### Example 2: API Response Types

```typescript
// Before: api/users.ts
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

type UserData = {
  id: string;
  name: string;
  email: string;
};

// After saving → Both definitions organized in types file
```

### Example 3: Utility Types

```typescript
// Multiple files with similar types get merged:

// File A:
interface Config {
  apiUrl: string;
  timeout: number;
}

// File B:
interface Config {
  retries: number;
  debug: boolean;
}

// Result in types file:
export interface Config {
  apiUrl: string;
  debug: boolean;
  retries: number;
  timeout: number;
}
```

## 📝 Changelog

### [1.0.0] - 2025-06-10

- ✨ **Initial release** with full type extraction
- 🔄 **Smart interface merging** and deduplication
- 🧹 **Automatic cleanup** of unused definitions
- 📊 **Interactive status bar** with live statistics
- ⚙️ **Comprehensive configuration** options
- 🎯 **Support for both `interface` and `type`** definitions
- 🎨 **Theme-aware status** indicators
- 🤖 **Optimized for AI-assisted** development workflows
- 🔧 **VS Code and Cursor IDE** compatibility
- 🔧 **Source file cleanup** with smart import management
- 📈 **Enhanced statistics** tracking additions, removals, and extractions
- 🎮 **Interactive command menu** with quick actions
- 🧪 **Debug tools** for testing and troubleshooting

## 🎯 Roadmap

### Planned Features

- **🔄 Batch processing** for existing projects
- **📁 Multiple types files** support
- **🎨 Custom templates** for generated files
- **🔍 Advanced usage analysis** and reporting
- **⚡ Performance optimizations** for large codebases
- **🔗 Integration with popular** TypeScript tools

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with VS Code Extension API for universal compatibility
- Inspired by the need for automated TypeScript organization in modern development
- Thanks to the TypeScript and AI development communities for feedback and best practices
- Special appreciation for Cursor IDE's innovative AI-first approach to development
- Gratitude to all contributors and early adopters

---

## 🎉 Ready to Transform Your TypeScript Workflow?

**Install Types Cleanup 🧹 and experience effortless type management!**

Whether you're working with AI-generated code, managing large TypeScript projects, or just want cleaner type organization, this extension will revolutionize how you handle TypeScript interfaces and types.

⭐ **Star this project if it saves you time!** ⭐

---

_Happy coding with clean, organized types!_ 🚀ttps://img.shields.io/badge/VS%20Code-Compatible-green.svg)](https://code.visualstudio.com/)
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
