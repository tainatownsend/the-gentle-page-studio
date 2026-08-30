import { describe, expect, it } from 'vitest'

import { DocxZipError, readDocxTextEntries } from './docxZip'

function pushUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff)
}

function pushUint32(target: number[], value: number) {
  target.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  )
}

function pushBytes(target: number[], bytes: Uint8Array) {
  target.push(...bytes)
}

function createStoredZip(entries: Record<string, string>): ArrayBuffer {
  const encoder = new TextEncoder()
  const output: number[] = []
  const central: number[] = []
  const records: Array<{
    name: Uint8Array
    content: Uint8Array
    localOffset: number
  }> = []

  for (const [name, content] of Object.entries(entries)) {
    const nameBytes = encoder.encode(name)
    const contentBytes = encoder.encode(content)
    const localOffset = output.length

    pushUint32(output, 0x04034b50)
    pushUint16(output, 20)
    pushUint16(output, 0x0800)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint32(output, 0)
    pushUint32(output, contentBytes.length)
    pushUint32(output, contentBytes.length)
    pushUint16(output, nameBytes.length)
    pushUint16(output, 0)
    pushBytes(output, nameBytes)
    pushBytes(output, contentBytes)

    records.push({ name: nameBytes, content: contentBytes, localOffset })
  }

  const centralOffset = output.length

  for (const record of records) {
    pushUint32(central, 0x02014b50)
    pushUint16(central, 20)
    pushUint16(central, 20)
    pushUint16(central, 0x0800)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint32(central, 0)
    pushUint32(central, record.content.length)
    pushUint32(central, record.content.length)
    pushUint16(central, record.name.length)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint32(central, 0)
    pushUint32(central, record.localOffset)
    pushBytes(central, record.name)
  }

  pushBytes(output, new Uint8Array(central))

  pushUint32(output, 0x06054b50)
  pushUint16(output, 0)
  pushUint16(output, 0)
  pushUint16(output, records.length)
  pushUint16(output, records.length)
  pushUint32(output, central.length)
  pushUint32(output, centralOffset)
  pushUint16(output, 0)

  return Uint8Array.from(output).buffer
}

describe('readDocxTextEntries', () => {
  it('reads requested OOXML entries from a ZIP package without external dependencies', async () => {
    const zip = createStoredZip({
      'word/document.xml': '<document>hello</document>',
      'word/styles.xml': '<styles />',
      'ignored.txt': 'ignore me',
    })

    const result = await readDocxTextEntries(zip, [
      'word/document.xml',
      'word/styles.xml',
      'word/numbering.xml',
    ])

    expect(result.get('word/document.xml')).toBe('<document>hello</document>')
    expect(result.get('word/styles.xml')).toBe('<styles />')
    expect(result.has('word/numbering.xml')).toBe(false)
    expect(result.has('ignored.txt')).toBe(false)
  })

  it('rejects files that are not readable ZIP packages', async () => {
    const invalid = new TextEncoder().encode('not a docx').buffer

    await expect(readDocxTextEntries(invalid, ['word/document.xml'])).rejects.toBeInstanceOf(
      DocxZipError,
    )
  })
})
