export type ParsedPublicationTable = {
  headers: string[]
  rows: string[][]
}

function splitMarkdownRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'))
}

function isSeparatorRow(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

export function parsePublicationTable(text: string): ParsedPublicationTable {
  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(splitMarkdownRow)

  if (rows.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = rows[0] ?? []
  const bodyStart = rows[1] && isSeparatorRow(rows[1]) ? 2 : 1
  const columnCount = Math.max(headers.length, ...rows.map((row) => row.length), 1)

  function normalize(row: readonly string[]): string[] {
    return [
      ...row,
      ...Array.from({ length: Math.max(0, columnCount - row.length) }, () => ''),
    ].slice(0, columnCount)
  }

  return {
    headers: normalize(headers),
    rows: rows.slice(bodyStart).map(normalize),
  }
}
