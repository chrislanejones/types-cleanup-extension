import * as vscode from "vscode";
import micromatch from "micromatch";

type Rule = { match: string; to: string };

function cfgOutput(): { default?: string; rules?: Rule[] } {
  return vscode.workspace.getConfiguration("typesCleanup").get<any>("output", {
    default: "src/types/types.d.ts",
    rules: []
  });
}

export function pickTargetTypesFile(forSourceFsPath: string): vscode.Uri {
  const out = cfgOutput();
  const rel = vscode.workspace.asRelativePath(forSourceFsPath);
  for (const r of (out.rules ?? [])) {
    if (micromatch.isMatch(rel, r.match)) {
      return vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, r.to);
    }
  }
  const def = out.default ?? "types.d.ts";
  return vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, def);
}

export async function resolveTypeFileTargets(): Promise<vscode.Uri[]> {
  const out = cfgOutput();
  const files = new Set<string>([out.default ?? "types.d.ts", ...(out.rules?.map(r => r.to) ?? [])]);
  return [...files].map(f => vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, f));
}
