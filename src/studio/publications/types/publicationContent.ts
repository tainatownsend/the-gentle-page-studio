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

export type PublicationMultilineTextFieldBlock = {
  id: PublicationBlockId
  type: 'multiline-text-field'
  text: string
}

export type PublicationCheckboxFieldBlock = {
  id: PublicationBlockId
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
