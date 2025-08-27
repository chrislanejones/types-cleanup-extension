import * as vscode from "vscode";
import { parseTypeDecls } from "./ast";
import { resolveTypeFileTargets } from "./routing";

export function registerJump(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.commands.registerCommand("typesCleanup.jumpToType", async () => {
      const targets = await resolveTypeFileTargets();
      const items: { label: string; detail: string; uri: vscode.Uri; start: number; end: number }[] = [];

      for (const uri of targets) {
        try {
          const doc = await vscode.workspace.openTextDocument(uri);
          const decls = parseTypeDecls(doc.getText(), uri.fsPath);
          decls.forEach(d => items.push({
            label: d.name,
            detail: vscode.workspace.asRelativePath(uri),
            uri, start: d.range.start, end: d.range.end
          }));
        } catch {
          // ignore missing files
        }
      }

      if (items.length === 0) {
        vscode.window.showInformationMessage("No types found in configured types files.");
        return;
      }

      const pick = await vscode.window.showQuickPick(items.map(i => ({ label: i.label, description: i.detail })));
      if (!pick) return;
      const chosen = items.find(i => i.label === pick.label && i.detail === pick.description)!;
      const doc = await vscode.workspace.openTextDocument(chosen.uri);
      const ed = await vscode.window.showTextDocument(doc);
      const range = new vscode.Range(doc.positionAt(chosen.start), doc.positionAt(chosen.end));
      ed.revealRange(range, vscode.TextEditorRevealType.InCenter);
      ed.selection = new vscode.Selection(range.start, range.start);
    })
  );
}
