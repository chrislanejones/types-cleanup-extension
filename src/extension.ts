import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface TypeDefinition {
  name: string;
  content: string;
  properties: Set<string>;
  startLine: number;
  endLine: number;
  type?: "interface" | "type";
}

class TypesCleanupManager implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;
  private isEnabled: boolean = true;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private workspaceRoot: string;
  private typesFilePath: string;
  private typesMoved: number = 0;
  private typesRemoved: number = 0;
  private interfacesExtracted: number = 0;
  private lastActivity: string = "None";

  constructor(context: vscode.ExtensionContext) {
    this.workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
    this.typesFilePath = path.join(this.workspaceRoot, this.getTypesFileName());

    // Handle workspace changes
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

  // Configuration methods
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

  private isSourceCleanupEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("typesCleanup");
    return config.get("cleanupSourceFiles", true);
  }

  // Status bar methods
  private updateStatusBar(): void {
    const typesFileName = path.basename(this.getTypesFileName());

    if (this.isEnabled && this.typesFileExists()) {
      this.statusBarItem.text = `$(symbol-interface) Types Cleanup 🧹 (+${this.typesMoved}/-${this.typesRemoved})`;
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
    tooltip.appendMarkdown(`**Types Added:** ${this.typesMoved}\n`);
    tooltip.appendMarkdown(`**Types Removed:** ${this.typesRemoved}\n`);
    tooltip.appendMarkdown(
      `**Interfaces Extracted:** ${this.interfacesExtracted}\n`
    );
    tooltip.appendMarkdown(`**Last Activity:** ${this.lastActivity}\n\n`);
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

  // Main command methods
  public toggle(): void {
    this.isEnabled = !this.isEnabled;
    this.updateStatusBar();

    const message = this.isEnabled
      ? "Types Cleanup enabled"
      : "Types Cleanup disabled";
    vscode.window.showInformationMessage(message);
  }

  public async showMenu(): Promise<void> {
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
        description: `+${this.typesMoved}/-${this.typesRemoved} types, ${this.interfacesExtracted} extracted`,
        action: "stats",
      },
      {
        label: `$(brush) Manual Cleanup Now`,
        description: "Remove unused interfaces",
        action: "cleanup",
      },
      {
        label: `$(refresh) Reset Statistics`,
        description: "Clear all counters",
        action: "reset-stats",
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
        case "reset-stats":
          this.resetStats();
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
      `• **Current Interfaces:** ${interfaceCount}`,
      `• **Types Added:** ${this.typesMoved}`,
      `• **Types Removed:** ${this.typesRemoved}`,
      `• **Interfaces Extracted:** ${this.interfacesExtracted}`,
      `• **Last Activity:** ${this.lastActivity}`,
      `• **Auto Cleanup:** ${
        this.isAutoCleanupEnabled() ? "Enabled" : "Disabled"
      }`,
      `• **Source Cleanup:** ${
        this.isSourceCleanupEnabled() ? "Enabled" : "Disabled"
      }`,
      `• **Cleanup Delay:** ${this.getCleanupDelay()}ms`,
    ].join("\n");

    vscode.window.showInformationMessage(
      stats.replace(/\*\*/g, "").replace(/•/g, "-")
    );
  }

  public testExtraction(): void {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("No active editor");
      return;
    }

    const content = activeEditor.document.getText();
    const interfaces = this.extractInterfaces(content);

    const results = interfaces
      .map(
        (i) =>
          `${i.type || "interface"}: ${i.name} (lines ${i.startLine}-${
            i.endLine
          })`
      )
      .join(", ");
    const message = `Found ${interfaces.length} definitions: ${results}`;

    console.log("Test extraction results:", interfaces);
    vscode.window.showInformationMessage(message);
  }

  public resetStats(): void {
    this.typesMoved = 0;
    this.typesRemoved = 0;
    this.interfacesExtracted = 0;
    this.lastActivity = "Stats reset";
    this.updateStatusBar();
    vscode.window.showInformationMessage("Statistics reset");
  }

  // File processing methods
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
    const typesFileName = path.basename(this.getTypesFileName());
    const documentFileName = path.basename(document.fileName);

    if (
      documentFileName === typesFileName ||
      document.fileName.includes(this.getTypesFileName()) ||
      document.fileName.endsWith("types.d.ts") ||
      document.fileName.endsWith("Types.d.ts")
    ) {
      console.log(
        "Types Cleanup: Skipping types file itself:",
        documentFileName
      );
      return;
    }

    try {
      const content = document.getText();
      console.log("Types Cleanup: File content length:", content.length);

      const interfaces = this.extractInterfaces(content);
      console.log(
        "Types Cleanup: Found definitions:",
        interfaces.map((i) => `${i.type || "interface"}: ${i.name}`)
      );

      if (interfaces.length > 0) {
        // Read existing types file content
        const existingContent = fs.readFileSync(this.typesFilePath, "utf8");
        console.log(
          "Types Cleanup: Existing types file length:",
          existingContent.length
        );

        const beforeCount = this.extractInterfaces(existingContent).length;
        console.log("Types Cleanup: Existing definitions count:", beforeCount);

        // Add to types file
        await this.addInterfacesToTypesFile(interfaces);
        console.log("Types Cleanup: Added interfaces to types file");

        // Clean up source file and add imports (if enabled)
        if (this.isSourceCleanupEnabled()) {
          await this.cleanupSourceFile(document, interfaces);
        }

        const afterContent = fs.readFileSync(this.typesFilePath, "utf8");
        const afterCount = this.extractInterfaces(afterContent).length;
        console.log("Types Cleanup: New definitions count:", afterCount);

        this.typesMoved += afterCount - beforeCount;
        this.interfacesExtracted += interfaces.length;
        this.lastActivity = `Extracted ${
          interfaces.length
        } interface(s) from ${path.basename(document.fileName)}`;
        this.updateStatusBar();

        vscode.window.showInformationMessage(
          `Moved ${interfaces.length} definition(s) to ${path.basename(
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

  // Interface extraction methods
  private extractInterfaces(content: string): TypeDefinition[] {
    const interfaces: TypeDefinition[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match interface declarations
      const interfaceMatch = line.match(
        /^export\s+interface\s+(\w+)|^interface\s+(\w+)|^\s*interface\s+(\w+)/
      );

      // Match type declarations
      const typeMatch = line.match(
        /^export\s+type\s+(\w+)|^type\s+(\w+)|^\s*type\s+(\w+)/
      );

      if (interfaceMatch) {
        const interfaceName =
          interfaceMatch[1] || interfaceMatch[2] || interfaceMatch[3];
        if (interfaceName) {
          const result = this.extractTypeDefinition(
            lines,
            i,
            "interface",
            interfaceName
          );
          if (result) {
            interfaces.push(result);
            i = result.endLine; // Skip to end
          }
        }
      } else if (typeMatch) {
        const typeName = typeMatch[1] || typeMatch[2] || typeMatch[3];
        if (typeName) {
          const result = this.extractTypeDefinition(lines, i, "type", typeName);
          if (result) {
            interfaces.push(result);
            i = result.endLine; // Skip to end
          }
        }
      }
    }

    return interfaces;
  }

  private extractTypeDefinition(
    lines: string[],
    startIndex: number,
    type: "interface" | "type",
    name: string
  ): TypeDefinition | null {
    const startLine = startIndex;
    let endLine = startIndex;
    let content = "";

    if (type === "interface") {
      // Handle interface with braces
      let braceCount = 0;
      let started = false;

      for (let j = startIndex; j < lines.length; j++) {
        const currentLine = lines[j];
        content += currentLine + "\n";

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
    } else {
      // Handle type declarations (single line or multi-line)
      content = lines[startIndex] + "\n";
      endLine = startIndex;

      // Continue reading lines for multi-line types
      while (endLine < lines.length - 1) {
        const currentLineContent = lines[endLine];
        const trimmed = currentLineContent.trim();
        const nextLine = lines[endLine + 1]?.trim() || "";

        // Stop if current line ends with semicolon and next line doesn't start with |
        if (trimmed.endsWith(";") && !nextLine.startsWith("|")) {
          break;
        }

        // Continue if line ends with |, &, or next line starts with |
        if (
          trimmed.endsWith("|") ||
          trimmed.endsWith("&") ||
          nextLine.startsWith("|") ||
          (trimmed.includes("=") && !trimmed.includes(";"))
        ) {
          endLine++;
          content += lines[endLine] + "\n";
        } else {
          break;
        }
      }
    }

    const properties = this.extractProperties(content);

    return {
      name,
      content: content.trim(),
      properties,
      startLine,
      endLine,
      type,
    };
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

  // File management methods
  private async cleanupSourceFile(
    document: vscode.TextDocument,
    extractedInterfaces: TypeDefinition[]
  ): Promise<void> {
    const content = document.getText();
    const lines = content.split("\n");

    // Remove the extracted interfaces from the content
    let cleanedLines = [...lines];
    let linesRemoved = 0;

    // Sort interfaces by line number (descending) to avoid index shifting issues
    const sortedInterfaces = [...extractedInterfaces].sort(
      (a, b) => b.startLine - a.startLine
    );

    for (const iface of sortedInterfaces) {
      const startLine = iface.startLine;
      const endLine = iface.endLine;
      const linesToRemove = endLine - startLine + 1;

      // Remove the interface lines
      cleanedLines.splice(startLine, linesToRemove);
      linesRemoved += linesToRemove;
      console.log(
        `Types Cleanup: Removed ${iface.name} from lines ${startLine} to ${endLine} (${linesToRemove} lines)`
      );
    }

    // Update stats
    this.lastActivity = `Removed ${linesRemoved} lines from ${path.basename(
      document.fileName
    )}`;

    // Add or update the import statement
    const typesImportPath = this.getTypesImportPath(document.fileName);
    const interfaceNames = extractedInterfaces.map((i) => i.name);
    const updatedContent = this.addOrUpdateImport(
      cleanedLines.join("\n"),
      typesImportPath,
      interfaceNames
    );

    // Create a WorkspaceEdit to modify the document
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(lines.length, 0)
    );

    edit.replace(document.uri, fullRange, updatedContent);

    // Apply the edit
    await vscode.workspace.applyEdit(edit);
    console.log(
      `Types Cleanup: Updated source file, removed ${linesRemoved} lines and added/updated imports`
    );
  }

  private getTypesImportPath(sourceFilePath: string): string {
    const sourceDir = path.dirname(sourceFilePath);
    const typesPath = this.typesFilePath;
    const relativePath = path.relative(sourceDir, typesPath);

    // Convert to import path format
    let importPath = relativePath.replace(/\\/g, "/"); // Convert Windows paths

    // Remove .d.ts extension
    importPath = importPath.replace(/\.d\.ts$/, "");

    // Add ./ if it doesn't start with ../ or /
    if (!importPath.startsWith("../") && !importPath.startsWith("/")) {
      importPath = "./" + importPath;
    }

    return importPath;
  }

  private addOrUpdateImport(
    content: string,
    importPath: string,
    newTypeNames: string[]
  ): string {
    const lines = content.split("\n");

    // Find existing import from the types file
    let existingImportIndex = -1;
    let existingImportLine = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.includes(`from "${importPath}"`) ||
        line.includes(`from '${importPath}'`)
      ) {
        existingImportIndex = i;
        existingImportLine = line;
        break;
      }
    }

    if (existingImportIndex !== -1) {
      // Update existing import
      const updatedImport = this.updateExistingImport(
        existingImportLine,
        newTypeNames
      );
      lines[existingImportIndex] = updatedImport;
      console.log(`Types Cleanup: Updated existing import: ${updatedImport}`);
    } else {
      // Add new import at the top (after other imports)
      const newImport = `import { ${newTypeNames.join(
        ", "
      )} } from "${importPath}";`;
      const insertIndex = this.findImportInsertIndex(lines);
      lines.splice(insertIndex, 0, newImport);
      console.log(`Types Cleanup: Added new import: ${newImport}`);
    }

    return lines.join("\n");
  }

  private updateExistingImport(
    importLine: string,
    newTypeNames: string[]
  ): string {
    // Extract existing imports
    const importMatch = importLine.match(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*["']([^"']+)["']/
    );
    if (!importMatch) {
      return importLine; // Return original if we can't parse it
    }

    const existingImports = importMatch[1]
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const importPath = importMatch[2];

    // Combine existing and new imports, remove duplicates
    const allImports = [...new Set([...existingImports, ...newTypeNames])];
    allImports.sort(); // Sort alphabetically

    return `import { ${allImports.join(", ")} } from "${importPath}";`;
  }

  private findImportInsertIndex(lines: string[]): number {
    let lastImportIndex = -1;

    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("import ") && line.includes(" from ")) {
        lastImportIndex = i;
      } else if (
        line &&
        !line.startsWith("//") &&
        !line.startsWith("/*") &&
        !line.startsWith("*")
      ) {
        // Stop at first non-import, non-comment line
        break;
      }
    }

    // Insert after the last import, or at the beginning if no imports found
    return lastImportIndex === -1 ? 0 : lastImportIndex + 1;
  }

  private async addInterfacesToTypesFile(
    newInterfaces: TypeDefinition[]
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
    existing: TypeDefinition[],
    newInterfaces: TypeDefinition[]
  ): TypeDefinition[] {
    const interfaceMap = new Map<string, TypeDefinition>();

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
          newIface.content,
          newIface.type || "interface"
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
    newContent: string,
    type: "interface" | "type" = "interface"
  ): string {
    if (type === "type") {
      // For types, prefer the newer definition
      return newContent;
    }

    // For interfaces, merge properties
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

  private generateTypesFileContent(interfaces: TypeDefinition[]): string {
    const header = `// Auto-generated types file managed by Types Cleanup 🧹
// This file is automatically updated when you save TypeScript files

`;

    // Separate types and interfaces, sort each group
    const types = interfaces
      .filter((i) => i.type === "type")
      .sort((a, b) => a.name.localeCompare(b.name));
    const interfacesList = interfaces
      .filter((i) => i.type !== "type")
      .sort((a, b) => a.name.localeCompare(b.name));

    // Put types first, then interfaces
    const sortedInterfaces = [...types, ...interfacesList];
    const interfaceContents = sortedInterfaces
      .map((iface) => iface.content)
      .join("\n\n");

    return header + interfaceContents + "\n";
  }

  // Cleanup methods
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
        this.typesRemoved += removedCount;
        this.lastActivity = `Auto-cleanup removed ${removedCount} unused interface(s)`;
        this.updateStatusBar();

        vscode.window.showInformationMessage(
          `Cleaned up ${removedCount} unused interface(s)`
        );
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }

  private async findUsedInterfaces(
    interfaces: TypeDefinition[]
  ): Promise<TypeDefinition[]> {
    const usedInterfaces: TypeDefinition[] = [];

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
        this.typesRemoved += removedCount;
        this.lastActivity = `Manual cleanup removed ${removedCount} unused interface(s)`;
        this.updateStatusBar();

        vscode.window.showInformationMessage(
          `Manual cleanup completed - removed ${removedCount} unused interface(s)`
        );
      } else {
        this.lastActivity = "Manual cleanup found no unused interfaces";
        this.updateStatusBar();
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

  const testCommand = vscode.commands.registerCommand(
    "types-cleanup.test-extraction",
    () => {
      manager.testExtraction();
    }
  );

  const resetStatsCommand = vscode.commands.registerCommand(
    "types-cleanup.reset-stats",
    () => {
      manager.resetStats();
    }
  );

  context.subscriptions.push(
    onSaveDisposable,
    toggleCommand,
    cleanupCommand,
    menuCommand,
    testCommand,
    resetStatsCommand,
    manager
  );
}

export function deactivate() {}
