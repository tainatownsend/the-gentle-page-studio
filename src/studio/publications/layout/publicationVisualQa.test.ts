import { describe, expect, it } from 'vitest'

import type { PublicationVisualQaPage } from './publicationVisualQa'
import { auditPublicationVisualQuality } from './publicationVisualQa'

describe('auditPublicationVisualQuality', () => {
  it('flags stranded headings and severe unexplained under-utilization', () => {
    const pages: PublicationVisualQaPage[] = [
      {
        kind: 'content',
        pageNumber: 1,
        blocks: [{ id: 'heading', type: 'heading', level: 2, text: 'Remembering' }],
        remainingUnits: 36,
      },
      {
        kind: 'content',
        pageNumber: 2,
        blocks: [{ id: 'paragraph', type: 'paragraph', text: 'The section content.' }],
        remainingUnits: 10,
      },
    ]

    const result = auditPublicationVisualQuality(pages)

    expect(result.issues.map((issue) => issue.code)).toEqual([
      'heading-only-page',
      'severe-underutilization',
    ])
    expect(result.score).toBeLessThan(100)
  })

  it('does not penalize an intentional level-one section opener', () => {
    const pages: PublicationVisualQaPage[] = [
      {
        kind: 'content',
        pageNumber: 1,
        blocks: [
          { id: 'part', type: 'heading', level: 1, text: 'Part Four: Monthly Planning' },
          { id: 'intro', type: 'paragraph', text: 'A gentle reset for the month ahead.' },
        ],
        remainingUnits: 34,
      },
      {
        kind: 'content',
        pageNumber: 2,
        blocks: [{ id: 'body', type: 'paragraph', text: 'Next tool.' }],
        remainingUnits: 8,
      },
    ]

    expect(auditPublicationVisualQuality(pages)).toEqual({ score: 100, issues: [] })
  })

  it('treats any surviving compiler directive as a release-blocking visual defect', () => {
    const pages: PublicationVisualQaPage[] = [
      {
        kind: 'content',
        pageNumber: 1,
        blocks: [
          {
            id: 'table',
            type: 'table',
            text: 'Life dashboard',
            columns: ['Area', 'How is this going?'],
            rows: [['Work', '[[GP:RESPONSE size="short"]]']],
          },
        ],
        remainingUnits: 8,
      },
    ]

    const result = auditPublicationVisualQuality(pages)

    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'protocol-syntax-leak', severity: 'error' }),
    )
    expect(result.score).toBeLessThanOrEqual(60)
  })
})
