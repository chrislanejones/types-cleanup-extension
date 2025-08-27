import ts from "typescript";

export type TypeDecl = {
  name: string;
  kind: "interface" | "type";
  range: { start: number; end: number };
  text: string;
  sourceFilePath: string;
};

export function parseTypeDecls(sourceText: string, sourceFilePath: string): TypeDecl[] {
  const sf = ts.createSourceFile(sourceFilePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const decls: TypeDecl[] = [];

  function pushDecl(node: ts.Node, kind: "interface" | "type") {
    // @ts-ignore - .name may not exist on all nodes
    const name: string | undefined = node.name?.getText?.(sf);
    if (!name) return;
    decls.push({
      name,
      kind,
      range: { start: node.getFullStart(), end: node.getEnd() },
      text: sourceText.slice(node.getFullStart(), node.getEnd()),
      sourceFilePath,
    });
  }

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) pushDecl(node, "interface");
    else if (ts.isTypeAliasDeclaration(node)) pushDecl(node, "type");
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return decls;
}
