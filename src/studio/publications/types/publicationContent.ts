export type PublicationBlockId = string

export type PublicationHeadingLevel = 1 | 2 | 3

export type PublicationHeadingBlock = {
  id: PublicationBlockId
  type: 'heading'
  level: PublicationHeadingLevel
  text: string
}

export type PublicationParagraphBlock = {
  id: PublicationBlockId
  type: 'paragraph'
  text: string
}

export type PublicationBlock = PublicationHeadingBlock | PublicationParagraphBlock

export type PublicationContent = {
  blocks: PublicationBlock[]
}
