# Types Cleanup 🧹

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/types-cleanup)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/VS%20Code-Compatible-green.svg)](https://code.visualstudio.com/)
[![Cursor](https://img.shields.io/badge/Cursor-Compatible-blue.svg)](https://cursor.sh/)

**The ultimate TypeScript type organization tool for modern development workflows!**

Automatically extract, organize, and manage TypeScript interfaces and type definitions from your codebase. Perfect for AI-assisted development in VS Code and Cursor IDE. **Now with smart external package detection!**

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
- 🔒 **External Package Detection** - Skips types from npm packages automatically
- 📍 **Smart Import Placement** - Respects directives like "use client"

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
"use client";

import ReactCrop, {
  type Crop as CropType,
  type PixelCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";

export type EditorState = "crop" | "blur" | "paint";

interface UserProfile {
  id: string;
  name: string;
  cropSettings: CropType; // External type - left alone
}
```

Save the file and watch the magic happen:

- ✅ `EditorState` and `UserProfile` get **extracted** and **removed**
- ✅ **Import added** after `"use client"`: `import { EditorState, UserProfile } from "@/types/types";`
- ✅ **External types** from `react-image-crop` are **left untouched**
- ✅ Status bar updates: `🧹 (+2/-0)`

## 🔒 Smart External Package Detection

### What Gets Skipped (External Packages):

```typescript
// ✅ These are automatically detected and left alone:
import React from "react";
import { useState, useEffect } from "react";
import ReactCrop, {
  type Crop as CropType,
  type PixelCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button"; // UI library
import * as THREE from "three";
import { NextRequest } from "next/server";
```

### What Gets Processed (Local Types):

```typescript
// ✅ These get extracted to your types file:
export type EditorState = "crop" | "blur" | "paint";
type LocalStatus = "loading" | "ready";

interface UserProfile {
  id: string;
  name: string;
}

interface ComponentProps {
  title: string;
  onEdit: () => void;
}
```

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

## 🎯 Before & After Examples

### Example 1: React Component with External Types

**📁 Before (components/ImageEditor.tsx):**

```typescript
"use client";

import React from "react";
import ReactCrop, {
  type Crop as CropType,
  type PixelCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";

interface ImageEditorProps {
  imageUrl: string;
  onCropChange: (crop: CropType) => void;
  onSave: () => void;
}

export function ImageEditor({
  imageUrl,
  onCropChange,
  onSave,
}: ImageEditorProps) {
  return (
    <div>
      <ReactCrop>
        <img src={imageUrl} />
      </ReactCrop>
      <Button onClick={onSave}>Save</Button>
    </div>
  );
}
```

**📁 After Saving (Automatic Transformation):**

**components/ImageEditor.tsx:**

```typescript
"use client";

import React from "react";
import ReactCrop, {
  type Crop as CropType, // ← External type, left alone
  type PixelCrop, // ← External type, left alone
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import { ImageEditorProps } from "@/types/types"; // ← Added automatically

export function ImageEditor({
  imageUrl,
  onCropChange,
  onSave,
}: ImageEditorProps) {
  return (
    <div>
      <ReactCrop>
        <img src={imageUrl} />
      </ReactCrop>
      <Button onClick={onSave}>Save</Button>
    </div>
  );
}
```

**types/Types.d.ts:**

```typescript
// Auto-generated types file managed by Types Cleanup 🧹
// This file is automatically updated when you save TypeScript files

export interface ImageEditorProps {
  imageUrl: string;
  onCropChange: (crop: CropType) => void; // ← References external type
  onSave: () => void;
}
```

### Example 2: Smart Import Merging

**📁 Before:**

```typescript
import { NavigationDirection } from "@/types/types";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onNavigate: (direction: NavigationDirection) => void;
}
```

**📁 After:**

```typescript
import { NavigationDirection, SimplePaginationProps } from "@/types/types"; // ← Merged automatically
```

### Example 3: Respecting Directives

**📁 Before:**

```typescript
"use client";
"use strict";

import React from "react";

interface MyProps {
  title: string;
}
```

**📁 After:**

```typescript
"use client"; // ← Directives preserved
"use strict";

import React from "react";
import { MyProps } from "@/types/types"; // ← Import placed correctly
```

## ⚙️ Complete Configuration Guide

| Setting                            | Default        | Description                                         |
| ---------------------------------- | -------------- | --------------------------------------------------- |
| `typesCleanup.enabled`             | `true`         | Master enable/disable switch                        |
| `typesCleanup.typesFileName`       | `"Types.d.ts"` | Path to types file (supports subdirectories)        |
| `typesCleanup.cleanupDelay`        | `2000`         | Delay before cleaning unused types (ms)             |
| `typesCleanup.enableAutoCleanup`   | `true`         | Automatically remove unused definitions             |
| `typesCleanup.cleanupSourceFiles`  | `true`         | Remove interfaces from source files and add imports |
| `typesCleanup.ignoreExternalTypes` | `true`         | Skip types from external packages (recommended)     |
| `typesCleanup.preserveExisting`    | `true`         | Preserve existing types when adding new ones        |

### Configuration Examples

**For `/types` folder structure:**

```json
{
  "typesCleanup.typesFileName": "types/Types.d.ts"
}
```

**Conservative mode (no source cleanup):**

```json
{
  "typesCleanup.cleanupSourceFiles": false,
  "typesCleanup.enableAutoCleanup": false,
  "typesCleanup.ignoreExternalTypes": true
}
```

**Aggressive AI development mode:**

```json
{
  "typesCleanup.enabled": true,
  "typesCleanup.cleanupDelay": 1000,
  "typesCleanup.enableAutoCleanup": true,
  "typesCleanup.cleanupSourceFiles": true,
  "typesCleanup.ignoreExternalTypes": true
}
```

**Include external types (advanced):**

```json
{
  "typesCleanup.ignoreExternalTypes": false
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

### 1. **External Type Detection**

- Scans all imports from non-relative paths (npm packages)
- Detects `type` imports, aliases, and default imports
- Builds exclusion list of external types
- Logs what's being skipped for debugging

### 2. **Smart Extraction**

- Only processes locally-defined interfaces and types
- Skips anything imported from external packages
- Handles complex interface definitions and multi-line types
- Tracks line numbers for precise source manipulation

### 3. **Intelligent Import Management**

- Places imports after directives (`"use client"`, `"use strict"`)
- Merges with existing imports from the same types file
- Only imports types that are actually used in the code
- Removes unused imports automatically

### 4. **Source File Cleanup**

- Removes extracted interface definitions from source files
- Calculates optimal import paths automatically
- Preserves all existing external package imports
- Updates or creates import statements intelligently

### 5. **Advanced Statistics**

- **Types Added**: Definitions added to types file
- **Types Removed**: Definitions removed during cleanup
- **Interfaces Extracted**: Interfaces removed from source files
- **External Types Skipped**: Types from packages that were ignored

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
External Types Skipped: 5
Last Activity: Extracted 1 interface(s) from ImageEditor.tsx

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
• Last Activity: Extracted 1 interface(s) from ImageEditor.tsx
• Auto Cleanup: Enabled
• Source Cleanup: Enabled
• Ignore External Types: Enabled
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

## 🤖 Perfect for Modern Development

### React/Next.js Projects

- **Respects "use client"** and other directives
- **Handles external UI libraries** (shadcn/ui, Chakra, etc.)
- **Manages state types** while preserving React imports
- **Works with CSS-in-JS** libraries and their types

### AI-Assisted Development

- **Cursor IDE Integration** - Organizes AI-generated interfaces
- **GitHub Copilot Friendly** - Cleans up suggested interfaces
- **Rapid Prototyping** - Handles duplicate types from iterations
- **External API Types** - Preserves package types, organizes local ones

### Large Codebases

- **Scalable type management** across multiple files
- **Team collaboration** with shared configuration
- **Performance optimized** for large projects
- **Cleanup automation** to prevent type bloat

## 🔧 External Package Examples

### Commonly Handled External Packages:

```typescript
// UI Libraries
import { Button } from "@/components/ui/button";
import { Input } from "@chakra-ui/react";
import { TextField } from "@mui/material";

// React Ecosystem
import { NextRequest } from "next/server";
import { GetServerSideProps } from "next";
import { ComponentProps } from "react";

// Development Tools
import { type Crop } from "react-image-crop";
import { EditorState } from "draft-js";
import { Connection } from "mongoose";

// 3D/Graphics
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";

// Data Libraries
import { z } from "zod";
import { GraphQLSchema } from "graphql";
```

All of these imports and their associated types are automatically detected and left untouched, while your local project types get organized!

## 🔍 Troubleshooting & FAQ

### ❓ **External types being moved incorrectly?**

- ✅ Check that `typesCleanup.ignoreExternalTypes` is `true` (default)
- ✅ Verify the import is from a package, not a relative path
- ✅ Use "Test Type Extraction" command to see what's detected
- ✅ Check console logs for "Skipping external type" messages

### ❓ **Imports placed in wrong location?**

- ✅ The extension respects directives like `"use client"`
- ✅ Imports are placed after existing imports and directives
- ✅ Check if file has proper syntax (quotes, semicolons)

### ❓ **Local types not being processed?**

- ✅ Ensure types are defined in the same file, not imported
- ✅ Check for proper `interface` or `type` syntax
- ✅ Verify extension is enabled (green status bar)
- ✅ Use "Test Type Extraction" to debug

### ❓ **Import merging not working?**

- ✅ Ensure existing import is from the same types file
- ✅ Check that import syntax is standard
- ✅ Verify types are actually used in the code

### ❓ **Want to include external types?**

```json
{
  "typesCleanup.ignoreExternalTypes": false
}
```

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

1. **Test external package detection** with various import formats
2. **Test directive respect** with "use client", "use strict"
3. **Test import merging** with existing types imports
4. **Test usage detection** - only used types get imported
5. **Test cleanup functionality** with unused types
6. **Test configuration changes** and settings
7. **Test in both VS Code and Cursor**

## 📊 Real-World Usage Examples

### Example 1: React Component Library

```typescript
// Before: components/UserCard.tsx
"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "@prisma/client"; // External DB type

interface UserCardProps {
  user: User; // Uses external type
  onEdit: (userId: string) => void;
  showActions?: boolean;
}

// After: External User type preserved, UserCardProps extracted
```

### Example 2: Next.js API Route

```typescript
// Before: api/users.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

type CreateUserRequest = z.infer<typeof UserSchema>;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// After: Next.js and Zod types preserved, local types extracted
```

### Example 3: Complex Import Scenarios

```typescript
// Before: Multiple external packages
import React, { ComponentProps } from "react";
import { type Crop as CropType, type PixelCrop } from "react-image-crop";
import * as THREE from "three";
import { GraphQLSchema, type GraphQLFieldConfig } from "graphql";

interface LocalEditorProps {
  crop: CropType; // External type reference
  schema: GraphQLSchema; // External type reference
  scene: THREE.Scene; // External type reference
}

// After: All external types preserved, LocalEditorProps extracted
```

## 📝 Changelog

### [1.0.0] - 2025-06-10

#### 🎉 Major Release with Smart External Detection

- ✨ **Smart External Package Detection** - Automatically skips types from npm packages
- 🔧 **Intelligent Import Placement** - Respects directives like "use client"
- 📍 **Advanced Import Merging** - Only includes used types in imports
- 🔒 **External Type Preservation** - Leaves package imports completely untouched
- ⚙️ **Enhanced Configuration** - New `ignoreExternalTypes` setting
- 📊 **Improved Statistics** - Tracks external types skipped
- 🧪 **Better Debug Tools** - Enhanced logging and test extraction
- 🎯 **Usage Detection** - Only imports types that are actually referenced
- 📈 **Performance Improvements** - Optimized parsing and analysis

[See complete changelog](CHANGELOG.md)

## 🎯 Roadmap

### Planned for v1.1.0

- **Batch Processing** - Process existing projects in bulk
- **Custom Templates** - User-defined type file templates
- **Advanced Analytics** - Detailed type usage reporting
- **Workspace Type Maps** - Visual type dependency graphs

### Planned for v1.2.0

- **Multiple Types Files** - Organize types across multiple files
- **Type Categories** - Automatic categorization by purpose
- **Git Integration** - Commit hooks and change tracking
- **Team Features** - Shared configuration and standards

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with VS Code Extension API for universal compatibility
- Inspired by the need for automated TypeScript organization in modern development
- Thanks to the TypeScript, React, and AI development communities
- Special appreciation for Cursor IDE's innovative AI-first approach
- Gratitude to all contributors and early adopters who provided feedback

---

## 🎉 Ready to Transform Your TypeScript Workflow?

**Install Types Cleanup 🧹 and experience effortless type management!**

Whether you're working with React components, Next.js applications, external UI libraries, or AI-generated code, this extension will revolutionize how you handle TypeScript interfaces and types while respecting your external dependencies.

⭐ **Star this project if it saves you time!** ⭐

---

_Happy coding with clean, organized types and preserved external dependencies!_ 🚀
