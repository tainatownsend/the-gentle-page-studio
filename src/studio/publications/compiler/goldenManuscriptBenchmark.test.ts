/// <reference types="node" />

import { readFile } from 'node:fs/promises'
import { Blob as NodeBlob } from 'node:buffer'
import { basename } from 'node:path'

import { describe, expect, it } from 'vitest'

import { benchmarkDocxManuscript } from './goldenManuscriptBenchmark'

const goldenPaths = [
  process.env.GENTLE_PAGE_GOLDEN_BURNOUT_DOCX,
  process.env.GENTLE_PAGE_GOLDEN_ENERGY_DOCX,
].filter((path): path is string => Boolean(path))

describe('golden manuscript benchmark', () => {
  it.skipIf(goldenPaths.length !== 2)(
    'compiles both real manuscripts without losing structured content',
    async () => {
      Object.defineProperty(globalThis, 'Blob', { configurable: true, value: NodeBlob })
      const results = await Promise.all(
        goldenPaths.map(async (path) => {
          const bytes = await readFile(path)
          const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
          return benchmarkDocxManuscript(buffer, basename(path))
        }),
      )

      for (const result of results) {
        expect(result.blockCount).toBeGreaterThan(50)
        expect(result.blocksByType.table).toBeGreaterThan(0)
        expect(result.blocksByType['multiline-text-field']).toBeGreaterThan(0)
        expect(result.semanticGroupsByKind['prompt-response']).toBeGreaterThan(0)
      }
    },
    30_000,
  )
})
