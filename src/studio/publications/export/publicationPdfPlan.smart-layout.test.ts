import { describe, expect, it } from 'vitest'

import { compilePublicationManuscript } from '../compiler'
import { createPublicationFixture } from '../testing'
import {
  createPublicationPdfPlan,
  createPublicationPdfTableGeometry,
  PUBLICATION_PDF_BLOCK_GAP_POINTS,
} from './publicationPdfPlan'

describe('createPublicationPdfPlan smart layout parity', () => {
  it('uses print-like natural block heights and a stable vertical gap', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'heading',
            type: 'heading',
            level: 2,
            text: 'Weekly Reset',
          },
          {
            id: 'intro',
            type: 'paragraph',
            text: 'Use this reset to make the week visible before deciding what deserves your energy.',
          },
          {
            id: 'response',
            type: 'multiline-text-field',
            text: 'What are you currently trying not to forget?',
            responseSize: 'medium',
          },
        ],
      },
    })

    const plan = createPublicationPdfPlan(publication)
    const page = plan.pages[1]
    const [heading, intro, response] = page?.blockPlacements ?? []
    const responseField = plan.interactiveFields.find(
      (field) => field.blockId === 'response' && field.kind === 'multiline-text',
    )

    expect(heading?.rect.height).toBeLessThan(50)
    expect(intro?.rect.height).toBeLessThan(45)
    expect(response?.rect.height).toBeGreaterThan(120)
    expect(response?.rect.height).toBeLessThan(230)

    expect(
      (heading?.rect.y ?? 0) - ((intro?.rect.y ?? 0) + (intro?.rect.height ?? 0)),
    ).toBeCloseTo(PUBLICATION_PDF_BLOCK_GAP_POINTS, 5)
    expect(
      (intro?.rect.y ?? 0) - ((response?.rect.y ?? 0) + (response?.rect.height ?? 0)),
    ).toBeCloseTo(PUBLICATION_PDF_BLOCK_GAP_POINTS, 5)

    expect(responseField?.kind).toBe('multiline-text')
    if (responseField?.kind !== 'multiline-text' || !response) return
    expect(responseField.rect.x).toBeGreaterThan(response.rect.x)
    expect(responseField.rect.width).toBeLessThan(response.rect.width)
    expect(responseField.rect.height).toBeLessThan(response.rect.height)
  })

  it('gives worksheet rows geometry based on their real interactive content', () => {
    const compiled = compilePublicationManuscript(`# Planner

## Life Dashboard

| Area | Status | Needs attention? |
| --- | --- | --- |
| Work | [[GP:RESPONSE size="short"]] | [[GP:RESPONSE size="short"]] |
| Home | - [ ] | - [ ] |`)

    const table = compiled.content.blocks.find((block) => block.type === 'table')
    expect(table?.type).toBe('table')
    if (table?.type !== 'table') return

    const publication = createPublicationFixture({
      id: 'planner',
      title: compiled.title,
      content: compiled.content,
    })
    const plan = createPublicationPdfPlan(publication)
    const page = plan.pages.find((candidate) =>
      candidate.blocks.some((block) => block.id === table.id),
    )
    const placement = page?.blockPlacements.find((candidate) => candidate.blockId === table.id)
    expect(placement).toBeDefined()
    if (!placement) return

    const geometry = createPublicationPdfTableGeometry(table, placement)
    expect(geometry.rowHeights).toHaveLength(2)
    expect(geometry.rowHeights[0]).toBeGreaterThan(geometry.rowHeights[1] ?? 0)

    const cellFields = plan.interactiveFields.filter((field) => field.blockId === table.id)
    expect(cellFields).toHaveLength(4)
    expect(
      cellFields.every((field) =>
        field.kind === 'rating' ? true : field.rect.height < geometry.rowHeights[0]!,
      ),
    ).toBe(true)
  })
})
