import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface ParsedInterface {
  name: string;
  content: string;
  properties: Set<string>;
  startLine: number;
  endLine: number;
}

class TypesCleanupManager {
  private statusBarItem: vscode.StatusBarItem;
  private isEnabled: boolean = true;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private workspaceRoot: string;
  private typesFilePath: string;

  constructor(context: vscode.ExtensionContext) {
    this.workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
    this.typesFilePath = path.join(this.workspaceRoot, this.getTypesFileName());

    // Handle workspace changes (useful for Cursor's workspace management)
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.workspaceRoot =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
      this.typesFilePath = path.join(
        this.workspaceRoot,
        this.getTypesFileName()
      );
      this.updateStatusBar();
    });

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = "types-cleanup.toggle";
    this.updateStatusBar();
    this.statusBarItem.show();

    context.subscriptions.push(this.statusBarItem);
  }

  private getTypesFileName(): string {
    const config = vscode.workspace.getConfiguration("typesCleanup");
    return config.get("typesFileName", "Types.d.ts");
  }

  private getCleanupDelay(): number {
    const config = vscode.workspace.getConfiguration("typesCleanup");
    return config.get("cleanupDelay", 2000);
  }

  private isAutoCleanupEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("typesCleanup");
    return config.get("enableAutoCleanup", true);
  }

  private updateStatusBar(): void {
    if (this.isEnabled && this.typesFileExists()) {
      this.statusBarItem.text = "$(symbol-interface) Types Cleanup 🧹";
      this.statusBarItem.tooltip = "Types Cleanup is active - Click to toggle";
      this.statusBarItem.backgroundColor = undefined;
    } else if (this.isEnabled) {
      this.statusBarItem.text =
        "$(symbol-interface) Types Cleanup (No Types.d.ts)";
      this.statusBarItem.tooltip = "Types Cleanup is waiting for Types.d.ts";
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.warningBackground"
      );
    } else {
      this.statusBarItem.text = "$(symbol-interface) Types Cleanup (Disabled)";
      this.statusBarItem.tooltip =
        "Types Cleanup is disabled - Click to enable";
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.errorBackground"
      );
    }
  }

  private typesFileExists(): boolean {
    return fs.existsSync(this.typesFilePath);
  }

  public toggle(): void {
    this.isEnabled = !this.isEnabled;
    this.updateStatusBar();

    const message = this.isEnabled
      ? "Types Cleanup enabled"
      : "Types Cleanup disabled";
    vscode.window.showInformationMessage(message);
  }

  public async onFileSave(document: vscode.TextDocument): Promise<void> {
    if (!this.isEnabled || !this.typesFileExists()) {
      return;
    }

    // Only process TypeScript files
    if (
      !document.fileName.endsWith(".ts") &&
      !document.fileName.endsWith(".tsx")
    ) {
      return;
    }

    // Don't process the Types.d.ts file itself
    if (document.fileName.endsWith(this.getTypesFileName())) {
      return;
    }

    try {
      const interfaces = this.extractInterfaces(document.getText());
      if (interfaces.length > 0) {
        await this.addInterfacesToTypesFile(interfaces);
      }

      // Schedule cleanup with delay (only if auto-cleanup is enabled)
      if (this.isAutoCleanupEnabled()) {
        this.scheduleCleanup();
      }
    } catch (error) {
      console.error("Types Cleanup error:", error);
    }
  }

  private extractInterfaces(content: string): ParsedInterface[] {
    const interfaces: ParsedInterface[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match interface declarations
      const interfaceMatch = line.match(
        /^export\s+interface\s+(\w+)|^interface\s+(\w+)/
      );
      if (interfaceMatch) {
        const interfaceName = interfaceMatch[1] || interfaceMatch[2];
        const startLine = i;
        let endLine = i;
        let braceCount = 0;
        let interfaceContent = "";
        let started = false;

        // Find the complete interface
        for (let j = i; j < lines.length; j++) {
          const currentLine = lines[j];
          interfaceContent += currentLine + "\n";

          for (const char of currentLine) {
            if (char === "{") {
              braceCount++;
              started = true;
            } else if (char === "}") {
              braceCount--;
            }
          }

          if (started && braceCount === 0) {
            endLine = j;
            break;
          }
        }

        const properties = this.extractProperties(interfaceContent);

        interfaces.push({
          name: interfaceName,
          content: interfaceContent.trim(),
          properties,
          startLine,
          endLine,
        });

        i = endLine; // Skip to end of interface
      }
    }

    return interfaces;
  }

  private extractProperties(interfaceContent: string): Set<string> {
    const properties = new Set<string>();
    const lines = interfaceContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Match property declarations
      const propertyMatch = trimmed.match(/^(\w+)(\??)\s*:/);
      if (propertyMatch) {
        properties.add(propertyMatch[1]);
      }
    }

    return properties;
  }

  private async addInterfacesToTypesFile(
    newInterfaces: ParsedInterface[]
  ): Promise<void> {
    let typesContent = "";

    if (this.typesFileExists()) {
      typesContent = fs.readFileSync(this.typesFilePath, "utf8");
    }

    const existingInterfaces = this.extractInterfaces(typesContent);
    const mergedInterfaces = this.mergeInterfaces(
      existingInterfaces,
      newInterfaces
    );

    const newContent = this.generateTypesFileContent(mergedInterfaces);

    if (newContent !== typesContent) {
      fs.writeFileSync(this.typesFilePath, newContent);
      vscode.window.showInformationMessage(
        `Updated ${this.getTypesFileName()}`
      );
    }
  }

  private mergeInterfaces(
    existing: ParsedInterface[],
    newInterfaces: ParsedInterface[]
  ): ParsedInterface[] {
    const interfaceMap = new Map<string, ParsedInterface>();

    // Add existing interfaces
    for (const iface of existing) {
      interfaceMap.set(iface.name, iface);
    }

    // Merge new interfaces
    for (const newIface of newInterfaces) {
      const existingIface = interfaceMap.get(newIface.name);

      if (existingIface) {
        // Merge properties
        const mergedProperties = new Set([
          ...existingIface.properties,
          ...newIface.properties,
        ]);
        const mergedContent = this.generateMergedInterfaceContent(
          newIface.name,
          mergedProperties,
          existingIface.content,
          newIface.content
        );

        interfaceMap.set(newIface.name, {
          name: newIface.name,
          content: mergedContent,
          properties: mergedProperties,
          startLine: existingIface.startLine,
          endLine: existingIface.endLine,
        });
      } else {
        interfaceMap.set(newIface.name, newIface);
      }
    }

    return Array.from(interfaceMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  private generateMergedInterfaceContent(
    name: string,
    properties: Set<string>,
    existingContent: string,
    newContent: string
  ): string {
    // Extract all unique property lines from both interfaces
    const allPropertyLines = new Set<string>();

    [existingContent, newContent].forEach((content) => {
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\w+(\??)\s*:/) && !trimmed.includes("interface")) {
          allPropertyLines.add(trimmed);
        }
      }
    });

    const sortedProperties = Array.from(allPropertyLines).sort();

    return `export interface ${name} {
  ${sortedProperties.join("\n  ")}
}`;
  }

  private generateTypesFileContent(interfaces: ParsedInterface[]): string {
    const header = `// Auto-generated types file managed by Types Cleanup 🧹
// This file is automatically updated when you save TypeScript files

`;

    const interfaceContents = interfaces
      .map((iface) => iface.content)
      .join("\n\n");

    return header + interfaceContents + "\n";
  }

  private scheduleCleanup(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    this.cleanupTimer = setTimeout(() => {
      this.cleanupUnusedInterfaces();
    }, this.getCleanupDelay());
  }

  private async cleanupUnusedInterfaces(): Promise<void> {
    if (!this.typesFileExists() || !this.isAutoCleanupEnabled()) {
      return;
    }

    try {
      const typesContent = fs.readFileSync(this.typesFilePath, "utf8");
      const interfaces = this.extractInterfaces(typesContent);
      const usedInterfaces = await this.findUsedInterfaces(interfaces);

      if (usedInterfaces.length !== interfaces.length) {
        const newContent = this.generateTypesFileContent(usedInterfaces);
        fs.writeFileSync(this.typesFilePath, newContent);

        const removedCount = interfaces.length - usedInterfaces.length;
        vscode.window.showInformationMessage(
          `Cleaned up ${removedCount} unused interface(s)`
        );
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }

  private async findUsedInterfaces(
    interfaces: ParsedInterface[]
  ): Promise<ParsedInterface[]> {
    const usedInterfaces: ParsedInterface[] = [];

    try {
      // Get all TypeScript files in the workspace
      const files = await vscode.workspace.findFiles(
        "**/*.{ts,tsx}",
        "**/node_modules/**"
      );

      for (const iface of interfaces) {
        let isUsed = false;

        for (const file of files) {
          // Skip the Types.d.ts file itself
          if (file.fsPath.endsWith(this.getTypesFileName())) {
            continue;
          }

          try {
            const content = fs.readFileSync(file.fsPath, "utf8");

            // Check if interface is used (simple regex check)
            const usageRegex = new RegExp(`\\b${iface.name}\\b`, "g");
            if (usageRegex.test(content)) {
              isUsed = true;
              break;
            }
          } catch (error) {
            // Skip files that can't be read
            continue;
          }
        }

        if (isUsed) {
          usedInterfaces.push(iface);
        }
      }

      return usedInterfaces;
    } catch (error) {
      console.error("Error finding used interfaces:", error);
      // Fallback: return all interfaces if search fails
      vscode.window.showWarningMessage(
        "Could not scan for unused interfaces. All interfaces will be preserved."
      );
      return interfaces;
    }
  }

  public async manualCleanup(): Promise<void> {
    if (!this.typesFileExists()) {
      vscode.window.showWarningMessage(
        "No Types.d.ts file found in workspace root"
      );
      return;
    }

    // Manual cleanup ignores the enableAutoCleanup setting
    try {
      const typesContent = fs.readFileSync(this.typesFilePath, "utf8");
      const interfaces = this.extractInterfaces(typesContent);
      const usedInterfaces = await this.findUsedInterfaces(interfaces);

      if (usedInterfaces.length !== interfaces.length) {
        const newContent = this.generateTypesFileContent(usedInterfaces);
        fs.writeFileSync(this.typesFilePath, newContent);

        const removedCount = interfaces.length - usedInterfaces.length;
        vscode.window.showInformationMessage(
          `Manual cleanup completed - removed ${removedCount} unused interface(s)`
        );
      } else {
        vscode.window.showInformationMessage(
          "Manual cleanup completed - no unused interfaces found"
        );
      }
    } catch (error) {
      console.error("Manual cleanup error:", error);
      vscode.window.showErrorMessage(
        "Manual cleanup failed. Check the output panel for details."
      );
    }
  }

  public dispose(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }
    this.statusBarItem.dispose();
  }
}

export function activate(context: vscode.ExtensionContext) {
  const manager = new TypesCleanupManager(context);

  // Register file save handler
  const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(
    (document) => {
      manager.onFileSave(document);
    }
  );

  // Register commands
  const toggleCommand = vscode.commands.registerCommand(
    "types-cleanup.toggle",
    () => {
      manager.toggle();
    }
  );

  const cleanupCommand = vscode.commands.registerCommand(
    "types-cleanup.cleanup-now",
    () => {
      manager.manualCleanup();
    }
  );

  context.subscriptions.push(
    onSaveDisposable,
    toggleCommand,
    cleanupCommand,
    manager
  );
}

export function deactivate() {}
