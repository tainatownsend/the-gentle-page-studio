import { compileGentlePageManuscript } from './compileGentlePageManuscript'
import { importDocxManuscript } from './importDocxManuscript'

export type GoldenManuscriptBenchmark = {
  title: string
  blockCount: number
  diagnosticCount: number
  blocksByType: Record<string, number>
  semanticGroupsByKind: Record<string, number>
}

export async function benchmarkDocxManuscript(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<GoldenManuscriptBenchmark> {
  const imported = await importDocxManuscript(buffer, fileName)
  const compiled = compileGentlePageManuscript(imported.manuscript)
  const blocksByType: Record<string, number> = {}
  const semanticGroupIds = new Set<string>()
  const semanticGroupsByKind: Record<string, number> = {}

  for (const block of compiled.content.blocks) {
    blocksByType[block.type] = (blocksByType[block.type] ?? 0) + 1
    const group = block.semanticGroup
    if (group && !semanticGroupIds.has(group.id)) {
      semanticGroupIds.add(group.id)
      semanticGroupsByKind[group.kind] = (semanticGroupsByKind[group.kind] ?? 0) + 1
    }
  }

  return {
    title: compiled.title,
    blockCount: compiled.content.blocks.length,
    diagnosticCount: imported.diagnostics.length + compiled.diagnostics.length,
    blocksByType,
    semanticGroupsByKind,
  }
}
