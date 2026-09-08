import { describe, expect, it } from 'vitest'

import { createPublicationLayout } from '../layout'
import { createPublicationFixture } from '../testing'
import { createPublicationPdfPlan, PUBLICATION_CONTENT_HEIGHT_POINTS } from './publicationPdfPlan'

describe('createPublicationPdfPlan smart layout parity', () => {
  it('uses the same elastic allocation as the browser layout for response fields', () => {
    const publication = createPublicationFixture({
      content: {
        blocks: [
          {
            id: 'response-1',
            type: 'multiline-text-field',
            text: 'What would help you recover capacity today?',
            responseSize: 'medium',
          },
        ],
      },
    })

    const layoutPage = createPublicationLayout(publication).pages[1]
    const allocation = layoutPage?.allocations[0]
    const pdfPage = createPublicationPdfPlan(publication).pages[1]
    const placement = pdfPage?.blockPlacements[0]

    expect(allocation).toBeDefined()
    expect(placement).toBeDefined()
    expect(placement?.rect.height).toBeCloseTo(
      ((allocation?.allocatedUnits ?? 0) / 48) * PUBLICATION_CONTENT_HEIGHT_POINTS,
      5,
    )
  })
})
