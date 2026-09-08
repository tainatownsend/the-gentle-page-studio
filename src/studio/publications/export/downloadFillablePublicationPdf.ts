import type { Publication } from '../types'

export function createPublicationPdfFilename(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug || 'publication'}-fillable.pdf`
}

export async function downloadFillablePublicationPdf(
  publication: Publication,
): Promise<void> {
  const { generateFillablePublicationPdf } = await import(
    './generateFillablePublicationPdf'
  )
  const bytes = await generateFillablePublicationPdf(publication)
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = createPublicationPdfFilename(publication.title)
  anchor.click()

  URL.revokeObjectURL(url)
}
