import { Blob as NodeBlob } from 'node:buffer'

import { describe, expect, it } from 'vitest'

import { importDocxManuscript } from './importDocxManuscript'

function u16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff)
}

function u32(target: number[], value: number) {
  target.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  )
}

function bytesFromBase64(value: string): number[] {
  return Array.from(atob(value), (character) => character.charCodeAt(0))
}

function createDeflatedDocx(): ArrayBuffer {
  const name = Array.from(new TextEncoder().encode('word/document.xml'))
  const compressed = bytesFromBase64(
    'bY/BbsIwDIZfJcp9dbcDmqq2HCbtsBPSGPeQeBApsSMn0PH2pIWxyy7+ZfnzJ7tf/8SgzijZMw36uWm1QrLsPB0G/bV9f3rV67GfOsf2FJGKqjzlbhr0sZTUAWR7xGhywwmpzr5Zoim1lQNMLC4JW8y56mKAl7ZdQTSe9Kzcs7vMmZaykSU+yyWgmrqzCYPe+hJQw9jDA1hKGd84JqledOqDT0ImzExZSLnxD/V9Zeez31e3ZSr1keafBfg9Cv4eHq8=',
  )
  const uncompressedSize = 291
  const output: number[] = []

  u32(output, 0x04034b50)
  u16(output, 20)
  u16(output, 0)
  u16(output, 8)
  u16(output, 0)
  u16(output, 0)
  u32(output, 0)
  u32(output, compressed.length)
  u32(output, uncompressedSize)
  u16(output, name.length)
  u16(output, 0)
  output.push(...name, ...compressed)

  const centralOffset = output.length
  u32(output, 0x02014b50)
  u16(output, 20)
  u16(output, 20)
  u16(output, 0)
  u16(output, 8)
  u16(output, 0)
  u16(output, 0)
  u32(output, 0)
  u32(output, compressed.length)
  u32(output, uncompressedSize)
  u16(output, name.length)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u16(output, 0)
  u32(output, 0)
  u32(output, 0)
  output.push(...name)
  const centralSize = output.length - centralOffset

  u32(output, 0x06054b50)
  u16(output, 0)
  u16(output, 0)
  u16(output, 1)
  u16(output, 1)
  u32(output, centralSize)
  u32(output, centralOffset)
  u16(output, 0)

  return new Uint8Array(output).buffer
}

describe('importDocxManuscript compressed DOCX support', () => {
  it('reads a standard deflate-compressed Word document entry', async () => {
    const originalBlob = globalThis.Blob
    Object.defineProperty(globalThis, 'Blob', {
      configurable: true,
      value: NodeBlob,
    })

    try {
      const result = await importDocxManuscript(createDeflatedDocx(), 'compressed.docx')

      expect(result.manuscript).toContain('# Compressed Journal')
      expect(result.manuscript).toContain('Visible content.')
    } finally {
      Object.defineProperty(globalThis, 'Blob', {
        configurable: true,
        value: originalBlob,
      })
    }
  })
})
