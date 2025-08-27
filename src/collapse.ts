import * as vscode from "vscode";
import micromatch from "micromatch";
import { parseTypeDecls } from "./ast";

const HIDDEN_DECOR = vscode.window.createTextEditorDecorationType({
  opacity: "0",
  after: { contentText: "  …types hidden", margin: "0 0 0 0.5rem" }
});

function shouldEnable(): boolean {
  return vscode.workspace.getConfiguration("typesCleanup.autoCollapse").get<boolean>("enabled", true);
}

function getPatterns(): string[] {
  return vscode.workspace.getConfiguration("typesCleanup.autoCollapse").get<string[]>("onlyPatterns", ["*Props","*State"]);
}

function isTsDoc(doc: vscode.TextDocument): boolean {
  return doc.languageId === "typescript" || doc.languageId === "typescriptreact";
}

export async function applyCollapse(editor: vscode.TextEditor) {
  if (!shouldEnable()) return;
  if (!isTsDoc(editor.document)) return;

  const text = editor.document.getText();
  const decls = parseTypeDecls(text, editor.document.fileName);
  const patterns = getPatterns();

  const ranges = decls
    .filter(d => patterns.length === 0 || micromatch.isMatch(d.name, patterns))
    .map(d => new vscode.Range(editor.document.positionAt(d.range.start), editor.document.positionAt(d.range.end)));

  editor.setDecorations(HIDDEN_DECOR, ranges);
}

export function clearCollapse(editor: vscode.TextEditor) {
  editor.setDecorations(HIDDEN_DECOR, []);
}

export function registerCollapseAutoload(ctx: vscode.ExtensionContext) {
  const run = (ed?: vscode.TextEditor) => ed && applyCollapse(ed);
  ctx.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(run),
    vscode.workspace.onDidChangeTextDocument(e => {
      const ed = vscode.window.visibleTextEditors.find(x => x.document === e.document);
      if (ed) applyCollapse(ed);
    }),
    vscode.commands.registerCommand("typesCleanup.toggleCollapse", async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed) return;
      // naive toggle: clear then re-apply (forces recompute)
      clearCollapse(ed);
      await applyCollapse(ed);
    })
  );
  if (vscode.window.activeTextEditor) applyCollapse(vscode.window.activeTextEditor);
}
