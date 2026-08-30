export type PublicationBlockId = string

export type PublicationHeadingLevel = 1 | 2 | 3

export type PublicationPageBreakIntent = 'preferred' | 'forced'

export type PublicationBlockLayoutIntent = {
  pageBreakBefore?: PublicationPageBreakIntent
  keepWithNext?: boolean
}

export type PublicationBlockBase = {
  id: PublicationBlockId
  layout?: PublicationBlockLayoutIntent
}

export type PublicationHeadingBlock = PublicationBlockBase & {
  type: 'heading'
  level: PublicationHeadingLevel
  text: string
}

export type PublicationParagraphFormat = 'body' | 'table' | 'rating-scale'

export type PublicationParagraphBlock = PublicationBlockBase & {
  type: 'paragraph'
  text: string
  format?: PublicationParagraphFormat
}

export type PublicationResponseSizeIntent = 'short' | 'medium' | 'long'

export type PublicationMultilineTextFieldBlock = PublicationBlockBase & {
  type: 'multiline-text-field'
  text: string
  responseSize?: PublicationResponseSizeIntent
}

export type PublicationCheckboxFieldBlock = PublicationBlockBase & {
  type: 'checkbox-field'
  text: string
}

export type PublicationInteractiveBlock =
  | PublicationMultilineTextFieldBlock
  | PublicationCheckboxFieldBlock

export type PublicationBlock =
  | PublicationHeadingBlock
  | PublicationParagraphBlock
  | PublicationInteractiveBlock

export type PublicationContent = {
  blocks: PublicationBlock[]
}
