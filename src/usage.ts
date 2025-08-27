import * as vscode from "vscode";

type UsageCache = {
  seenAt: number;
  hits: Map<string, Set<string>>;
};

const CACHE_TTL_MS = 20_000;
const usageCache: UsageCache = { seenAt: 0, hits: new Map() };

export function invalidateUsageCache() {
  usageCache.seenAt = 0;
  usageCache.hits.clear();
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findUsagesBatched(names: string[]): Promise<Map<string, Set<string>>> {
  const now = Date.now();
  if (now - usageCache.seenAt < CACHE_TTL_MS && names.every(n => usageCache.hits.has(n))) {
    return usageCache.hits;
    }

  const pattern = `\\b(${names.map(escapeRe).join("|")})\\b`;
  const re = new RegExp(pattern, "g");
  const hits = new Map<string, Set<string>>();
  names.forEach(n => hits.set(n, new Set()));

  await vscode.workspace.findTextInFiles(
    { pattern, isRegExp: true },
    { maxResults: 5000 },
    result => {
      const file = result.uri.fsPath;
      for (const m of result.matches) {
        const text = m.preview.text;
        let match: RegExpExecArray | null;
        re.lastIndex = 0;
        while ((match = re.exec(text))) {
          const name = match[1];
          hits.get(name)?.add(file);
        }
      }
    }
  );

  usageCache.seenAt = Date.now();
  hits.forEach((set, k) => usageCache.hits.set(k, set));
  return hits;
}

// Convenience: wire invalidation on common fs events (call from activate)
export function registerUsageInvalidation(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => invalidateUsageCache()),
    vscode.workspace.onDidCreateFiles(() => invalidateUsageCache()),
    vscode.workspace.onDidDeleteFiles(() => invalidateUsageCache())
  );
}
