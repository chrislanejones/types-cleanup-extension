import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface ParsedInterface {
  name: string;
  content: string;
  properties: Set<string>;
  startLine: number;
  endLine: number;
  type?: "interface" | "type";
}

class TypesCleanupManager {
  private statusBarItem: vscode.StatusBarItem;
  private isEnabled: boolean = true;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private workspaceRoot: string;
  private typesFilePath: string;
  private typesMoved: number = 0;

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

    // Update types file path when configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("typesCleanup.typesFileName")) {
        this.typesFilePath = path.join(
          this.workspaceRoot,
          this.getTypesFileName()
        );
        this.updateStatusBar();
      }
    });

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = "types-cleanup.show-menu";
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
    const typesFileName = path.basename(this.getTypesFileName());

    if (this.isEnabled && this.typesFileExists()) {
      this.statusBarItem.text = `$(symbol-interface) Types Cleanup 🧹 (${this.typesMoved})`;
      this.statusBarItem.tooltip = this.createTooltip(
        "Active",
        `Monitoring ${typesFileName}`
      );
      this.statusBarItem.backgroundColor = undefined;
      this.statusBarItem.color = undefined;
    } else if (this.isEnabled) {
      this.statusBarItem.text = `$(symbol-interface) Types Cleanup ⚠️`;
      this.statusBarItem.tooltip = this.createTooltip(
        "Waiting",
        `No ${typesFileName} found`
      );
      this.statusBarItem.backgroundColor = undefined;
      this.statusBarItem.color = new vscode.ThemeColor(
        "statusBarItem.warningForeground"
      );
    } else {
      this.statusBarItem.text = `$(symbol-interface) Types Cleanup ❌`;
      this.statusBarItem.tooltip = this.createTooltip(
        "Disabled",
        "Extension is disabled"
      );
      this.statusBarItem.backgroundColor = undefined;
      this.statusBarItem.color = new vscode.ThemeColor("disabledForeground");
    }
  }

  private createTooltip(
    status: string,
    description: string
  ): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.supportHtml = true;

    const typesFileName = this.getTypesFileName();
    const relativeTypesPath = path.relative(
      this.workspaceRoot,
      this.typesFilePath
    );

    tooltip.appendMarkdown(`**Types Cleanup 🧹**\n\n`);
    tooltip.appendMarkdown(`**Status:** ${status}\n`);
    tooltip.appendMarkdown(`**Description:** ${description}\n`);
    tooltip.appendMarkdown(`**Types File:** \`${relativeTypesPath}\`\n`);
    tooltip.appendMarkdown(
      `**Lines Moved:** ${this.typesMoved} since last save\n\n`
    );
    tooltip.appendMarkdown(`---\n\n`);
    tooltip.appendMarkdown(`**Options:**\n`);
    tooltip.appendMarkdown(`• Click to open menu\n`);
    tooltip.appendMarkdown(`• Toggle on/off\n`);
    tooltip.appendMarkdown(`• Configure settings\n`);
    tooltip.appendMarkdown(`• Manual cleanup\n`);

    return tooltip;
  }

  private typesFileExists(): boolean {
    const exists = fs.existsSync(this.typesFilePath);
    console.log("Types Cleanup Debug:");
    console.log("- Workspace root:", this.workspaceRoot);
    console.log("- Types filename setting:", this.getTypesFileName());
    console.log("- Full types path:", this.typesFilePath);
    console.log("- File exists:", exists);
    return exists;
  }

  public toggle(): void {
    this.isEnabled = !this.isEnabled;
    this.updateStatusBar();

    const message = this.isEnabled
      ? "Types Cleanup enabled"
      : "Types Cleanup disabled";
    vscode.window.showInformationMessage(message);
  }

  public async showMenu(): Promise<void> {
    const typesFileName = path.basename(this.getTypesFileName());
    const currentStatus = this.isEnabled ? "Enabled" : "Disabled";

    const options = [
      {
        label: `$(symbol-interface) Toggle Types Cleanup`,
        description: `Currently: ${currentStatus}`,
        action: "toggle",
      },
      {
        label: `$(gear) Configure Types Directory`,
        description: `Current: ${this.getTypesFileName()}`,
        action: "configure",
      },
      {
        label: `$(info) Stats`,
        description: `${this.typesMoved} lines moved since last save`,
        action: "stats",
      },
      {
        label: `$(brush) Manual Cleanup Now`,
        description: "Remove unused interfaces",
        action: "cleanup",
      },
    ];

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: "Types Cleanup Options",
      matchOnDescription: true,
    });

    if (selected) {
      switch (selected.action) {
        case "toggle":
          this.toggle();
          break;
        case "configure":
          await this.openSettings();
          break;
        case "stats":
          await this.showStats();
          break;
        case "cleanup":
          await this.manualCleanup();
          break;
      }
    }
  }

  private async openSettings(): Promise<void> {
    await vscode.commands.executeCommand(
      "workbench.action.openSettings",
      "typesCleanup"
    );
  }

  private async showStats(): Promise<void> {
    const typesExists = this.typesFileExists();
    let interfaceCount = 0;

    if (typesExists) {
      try {
        const content = fs.readFileSync(this.typesFilePath, "utf8");
        const interfaces = this.extractInterfaces(content);
        interfaceCount = interfaces.length;
      } catch (error) {
        // Ignore error
      }
    }

    const stats = [
      `**Types Cleanup Statistics**`,
      ``,
      `• **Status:** ${this.isEnabled ? "Enabled" : "Disabled"}`,
      `• **Types File:** ${this.getTypesFileName()}`,
      `• **File Exists:** ${typesExists ? "Yes" : "No"}`,
      `• **Interfaces:** ${interfaceCount}`,
      `• **Lines Moved:** ${this.typesMoved} since last save`,
      `• **Auto Cleanup:** ${
        this.isAutoCleanupEnabled() ? "Enabled" : "Disabled"
      }`,
      `• **Cleanup Delay:** ${this.getCleanupDelay()}ms`,
    ].join("\n");

    const markdown = new vscode.MarkdownString(stats);
    markdown.isTrusted = true;

    vscode.window.showInformationMessage(
      stats.replace(/\*\*/g, "").replace(/•/g, "-")
    );
  }

  public async onFileSave(document: vscode.TextDocument): Promise<void> {
    console.log("Types Cleanup: File saved:", document.fileName);

    if (!this.isEnabled) {
      console.log("Types Cleanup: Extension disabled");
      return;
    }

    if (!this.typesFileExists()) {
      console.log(
        "Types Cleanup: Types file does not exist at:",
        this.typesFilePath
      );
      return;
    }

    // Only process TypeScript files
    if (
      !document.fileName.endsWith(".ts") &&
      !document.fileName.endsWith(".tsx")
    ) {
      console.log("Types Cleanup: Not a TypeScript file, skipping");
      return;
    }

    // Don't process the Types.d.ts file itself
    if (document.fileName.endsWith(this.getTypesFileName())) {
      console.log("Types Cleanup: Skipping types file itself");
      return;
    }

    try {
      const content = document.getText();
      console.log("Types Cleanup: File content length:", content.length);

      const interfaces = this.extractInterfaces(content);
      console.log(
        "Types Cleanup: Found interfaces:",
        interfaces.map((i) => i.name)
      );

      if (interfaces.length > 0) {
        const beforeCount = this.typesFileExists()
          ? this.extractInterfaces(fs.readFileSync(this.typesFilePath, "utf8"))
              .length
          : 0;

        await this.addInterfacesToTypesFile(interfaces);
        console.log("Types Cleanup: Added interfaces to types file");

        const afterCount = this.typesFileExists()
          ? this.extractInterfaces(fs.readFileSync(this.typesFilePath, "utf8"))
              .length
          : 0;

        this.typesMoved += afterCount - beforeCount;
        this.updateStatusBar();

        vscode.window.showInformationMessage(
          `Added ${interfaces.length} interface(s) to ${path.basename(
            this.getTypesFileName()
          )}`
        );
      } else {
        console.log("Types Cleanup: No interfaces found in file");
      }

      // Schedule cleanup with delay (only if auto-cleanup is enabled)
      if (this.isAutoCleanupEnabled()) {
        this.scheduleCleanup();
      }
    } catch (error) {
      console.error("Types Cleanup error:", error);
      vscode.window.showErrorMessage("Types Cleanup error: " + error);
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
          type: newIface.type || existingIface.type || "interface",
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
        `No ${this.getTypesFileName()} file found in workspace`
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

  const menuCommand = vscode.commands.registerCommand(
    "types-cleanup.show-menu",
    () => {
      manager.showMenu();
    }
  );

  context.subscriptions.push(
    onSaveDisposable,
    toggleCommand,
    cleanupCommand,
    menuCommand,
    manager
  );
}

export function deactivate() {}
