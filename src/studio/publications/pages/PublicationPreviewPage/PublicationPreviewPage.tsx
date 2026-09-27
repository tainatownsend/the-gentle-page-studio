import { useState, type CSSProperties, type ReactElement } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  History,
  Pencil,
  Printer,
} from 'lucide-react'

import { PageHeader } from '@/design-system/layouts/PageHeader'
import { Button } from '@/design-system/primitives/Button'
import { Cluster } from '@/design-system/primitives/Cluster'
import { Container } from '@/design-system/primitives/Container'
import { Stack } from '@/design-system/primitives/Stack'

import { downloadFillablePublicationPdf } from '../../export'
import {
  createPublicationLayout,
  getPublicationPageLayoutRecipe,
  getPublicationPageTemplateLabel,
  type PublicationLayoutBlockAllocation,
} from '../../layout'
import documentTheme from '../../styles/PublicationDocumentTheme.module.css'
import type {
  Publication,
  PublicationBlock,
  PublicationPageTemplate,
  PublicationTableCellControl,
} from '../../types'

import styles from './PublicationPreviewPage.module.css'

export type PublicationPreviewPageProps = {
  publication: Publication
  onBack: () => void
  onEdit: (blockId?: string) => void
  onHistory?: () => void
}

type PublicationBlockPreviewProps = {
  block: PublicationBlock
  allocatedUnits?: number
}

function renderTableCellControl(
  control: PublicationTableCellControl,
  blockId: string,
  rowIndex: number,
  columnIndex: number,
  controlIndex: number,
): ReactElement {
  const key = `${blockId}-row-${rowIndex}-column-${columnIndex}-control-${controlIndex}`

  if (control.kind === 'checkbox') {
    return (
      <span
        key={key}
        className={styles.checkboxMark}
        role="img"
        aria-label={`Checkbox in row ${rowIndex + 1}, column ${columnIndex + 1}`}
        data-table-cell-control="checkbox"
      />
    )
  }

  const responseAreaClassName = `${styles.responseArea} ${
    control.size === 'short'
      ? styles.responseAreaShort
      : control.size === 'medium'
        ? styles.responseAreaMedium
        : styles.responseAreaLong
  }`

  return (
    <div
      key={key}
      className={responseAreaClassName}
      role="img"
      aria-label={`Response field in row ${rowIndex + 1}, column ${columnIndex + 1}`}
      data-table-cell-control="response"
      data-response-size={control.size}
    />
  )
}

function countInteractiveFields(publication: Publication): number {
  let count = 0

  for (const block of publication.content.blocks) {
    if (
      block.type === 'multiline-text-field' ||
      block.type === 'checkbox-field' ||
      block.type === 'rating-field'
    ) {
      count += 1
      continue
    }

    if (block.type === 'table' && block.cellControls) {
      for (const row of block.cellControls) {
        for (const cell of row) {
          count += cell.length
        }
      }
    }
  }

  return count
}

function PublicationBlockPreview({
  block,
  allocatedUnits,
}: PublicationBlockPreviewProps): ReactElement {
  if (block.type === 'heading') {
    const HeadingTag = `h${block.level + 1}` as 'h2' | 'h3' | 'h4'
    const headingClassName =
      block.level === 1
        ? styles.heading1
        : block.level === 2
          ? styles.heading2
          : styles.heading3

    return (
      <HeadingTag className={headingClassName}>
        {block.text || 'Untitled heading'}
      </HeadingTag>
    )
  }

  if (block.type === 'multiline-text-field') {
    const responseSize = block.responseSize ?? 'long'
    const responseAreaClassName = `${styles.responseArea} ${
      responseSize === 'short'
        ? styles.responseAreaShort
        : responseSize === 'medium'
          ? styles.responseAreaMedium
          : styles.responseAreaLong
    }`
    const responseAreaStyle = {
      '--response-area-units': allocatedUnits ?? 14,
    } as CSSProperties

    return (
      <section
        className={styles.multilineField}
        aria-label={block.text || 'Response field'}
        data-response-size={responseSize}
        data-allocated-units={allocatedUnits}
      >
        <p className={styles.fieldLabel}>{block.text || 'Response'}</p>
        <div className={responseAreaClassName} style={responseAreaStyle} aria-hidden="true" />
      </section>
    )
  }

  if (block.type === 'checkbox-field') {
    return (
      <div className={styles.checkboxField} data-publication-block="checkbox">
        <span className={styles.checkboxMark} aria-hidden="true" />
        <p className={styles.fieldLabel}>{block.text || 'Checkbox'}</p>
      </div>
    )
  }

  if (block.type === 'rating-field') {
    const values = Array.from(
      { length: Math.max(1, Math.floor(block.max - block.min) + 1) },
      (_, index) => block.min + index,
    )

    return (
      <section
        className={styles.ratingField}
        aria-label={block.text || 'Rating field'}
        data-publication-block="rating"
      >
        <p className={styles.fieldLabel}>{block.text || 'Rating'}</p>
        <div className={styles.ratingScale} aria-hidden="true">
          {values.map((value) => (
            <span key={value} className={styles.ratingOption}>
              <span className={styles.ratingMark} />
              <span className={styles.ratingValue}>{value}</span>
            </span>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === 'table') {
    return (
      <section className={styles.tableBlock} aria-label={block.text || 'Worksheet table'}>
        {block.text ? <p className={styles.fieldLabel}>{block.text}</p> : null}
        <div className={styles.tableScroll}>
          <table className={styles.publicationTable}>
            <thead>
              <tr>
                {block.columns.map((column, index) => (
                  <th key={`${block.id}-column-${index}`} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${block.id}-row-${rowIndex}`}>
                  {block.columns.map((_, columnIndex) => {
                    const cellText = row[columnIndex] ?? ''
                    const controls = block.cellControls?.[rowIndex]?.[columnIndex] ?? []

                    return (
                      <td key={`${block.id}-row-${rowIndex}-column-${columnIndex}`}>
                        {cellText ? <div>{cellText}</div> : null}
                        {controls.map((control, controlIndex) =>
                          renderTableCellControl(
                            control,
                            block.id,
                            rowIndex,
                            columnIndex,
                            controlIndex,
                          ),
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return <p className={styles.paragraph}>{block.text || 'Empty paragraph'}</p>
}


type PublicationTemplateContentProps = {
  blocks: readonly PublicationBlock[]
  allocations: readonly PublicationLayoutBlockAllocation[]
  pageTemplate?: PublicationPageTemplate
}

function BotanicalCorner({
  position,
}: {
  position: 'top-right' | 'bottom-left'
}): ReactElement {
  return (
    <svg
      className={`${styles.botanicalCorner} ${
        position === 'top-right' ? styles.botanicalTopRight : styles.botanicalBottomLeft
      }`}
      viewBox="0 0 180 180"
      aria-hidden="true"
      focusable="false"
    >
      <path className={styles.botanicalStem} d="M18 162 C52 122 82 88 157 24" />
      <path className={styles.botanicalLeaf} d="M50 128 C26 120 20 97 25 78 C48 83 61 99 50 128 Z" />
      <path className={styles.botanicalLeafSoft} d="M78 101 C59 82 64 58 78 44 C96 58 102 78 78 101 Z" />
      <path className={styles.botanicalLeaf} d="M105 76 C105 51 124 38 143 37 C141 59 129 74 105 76 Z" />
      <path className={styles.botanicalLeafSoft} d="M128 52 C128 29 145 17 164 18 C161 39 151 50 128 52 Z" />
      <path className={styles.botanicalLeaf} d="M68 112 C83 91 105 91 121 101 C104 117 87 123 68 112 Z" />
    </svg>
  )
}

function renderPublicationBlock(
  block: PublicationBlock,
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const allocation = allocations.find((candidate) => candidate.blockId === block.id)

  return (
    <PublicationBlockPreview
      key={block.id}
      block={block}
      allocatedUnits={allocation?.allocatedUnits}
    />
  )
}

function renderGuidedFrameworkContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const firstCheckbox = blocks.findIndex((block) => block.type === 'checkbox-field')
  const lastCheckbox = blocks.map((block) => block.type).lastIndexOf('checkbox-field')

  if (firstCheckbox < 0 || lastCheckbox < firstCheckbox) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  const leading = blocks.slice(0, firstCheckbox)
  const stateBlocks = blocks.slice(firstCheckbox, lastCheckbox + 1)
  const trailing = blocks.slice(lastCheckbox + 1)

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.stateGrid} data-template-region="state-grid">
        {stateBlocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}

function renderEmergencyToolContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const firstStep = blocks.findIndex(
    (block) => block.type === 'heading' && block.level === 3,
  )

  if (firstStep < 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  const intro = blocks.slice(0, firstStep)
  const steps: PublicationBlock[][] = []
  let currentStep: PublicationBlock[] = []

  for (const block of blocks.slice(firstStep)) {
    if (block.type === 'heading' && block.level === 3 && currentStep.length > 0) {
      steps.push(currentStep)
      currentStep = []
    }
    currentStep.push(block)
  }

  if (currentStep.length > 0) steps.push(currentStep)

  return (
    <div className={styles.content}>
      {intro.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.emergencySteps} data-template-region="emergency-steps">
        {steps.map((step, index) => (
          <section
            key={step[0]?.id ?? `emergency-step-${index}`}
            className={styles.emergencyStep}
            data-template-step={index + 1}
          >
            {step.map((block) => renderPublicationBlock(block, allocations))}
          </section>
        ))}
      </div>
    </div>
  )
}

function renderDailyCheckInContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const ratingBlocks = blocks.filter((block) => block.type === 'rating-field')
  const firstCheckbox = blocks.findIndex((block) => block.type === 'checkbox-field')
  const lastCheckbox = blocks.map((block) => block.type).lastIndexOf('checkbox-field')
  const ratingIds = new Set(ratingBlocks.map((block) => block.id))
  const possibleInventoryHeading = firstCheckbox > 0 ? blocks[firstCheckbox - 1] : undefined
  const inventoryHeadingIndex =
    possibleInventoryHeading?.type === 'heading' && possibleInventoryHeading.level === 3
      ? firstCheckbox - 1
      : firstCheckbox
  const inventoryIds = new Set(
    firstCheckbox >= 0
      ? blocks
          .slice(Math.max(0, inventoryHeadingIndex), lastCheckbox + 1)
          .map((block) => block.id)
      : [],
  )

  const regularBlocks = blocks.filter(
    (block) => !ratingIds.has(block.id) && !inventoryIds.has(block.id),
  )
  const firstResponseIndex = regularBlocks.findIndex(
    (block) => block.type === 'multiline-text-field',
  )
  const headingAndDate =
    firstResponseIndex >= 0
      ? regularBlocks.slice(0, firstResponseIndex + 1)
      : regularBlocks
  const trailing =
    firstResponseIndex >= 0 ? regularBlocks.slice(firstResponseIndex + 1) : []

  return (
    <div className={styles.content}>
      {headingAndDate.map((block) => renderPublicationBlock(block, allocations))}

      {ratingBlocks.length > 0 ? (
        <div className={styles.dailyMetrics} data-template-region="daily-metrics">
          {ratingBlocks.map((block) => renderPublicationBlock(block, allocations))}
        </div>
      ) : null}

      {inventoryIds.size > 0 ? (
        <section className={styles.dailyInventory} data-template-region="daily-inventory">
          {blocks
            .filter((block) => inventoryIds.has(block.id))
            .map((block) => renderPublicationBlock(block, allocations))}
        </section>
      ) : null}

      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}


function splitHeadingSections(
  blocks: readonly PublicationBlock[],
): {
  leading: PublicationBlock[]
  sections: PublicationBlock[][]
  trailing: PublicationBlock[]
} {
  const firstSectionIndex = blocks.findIndex(
    (block) => block.type === 'heading' && block.level === 3,
  )

  if (firstSectionIndex < 0) {
    return { leading: [...blocks], sections: [], trailing: [] }
  }

  const leading = [...blocks.slice(0, firstSectionIndex)]
  const sections: PublicationBlock[][] = []
  let current: PublicationBlock[] = []
  let trailing: PublicationBlock[] = []

  for (const block of blocks.slice(firstSectionIndex)) {
    if (block.type === 'multiline-text-field' && current.length > 0) {
      if (current.length > 0) sections.push(current)
      current = []
      trailing = [...blocks.slice(blocks.indexOf(block))]
      break
    }

    if (block.type === 'heading' && block.level === 3 && current.length > 0) {
      sections.push(current)
      current = []
    }

    current.push(block)
  }

  if (current.length > 0) sections.push(current)

  return { leading, sections, trailing }
}

function renderToolOverviewContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const { leading, sections, trailing } = splitHeadingSections(blocks)

  if (sections.length < 2) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.toolOverviewGrid} data-template-region="tool-overview-grid">
        {sections.map((section, index) => (
          <section
            key={section[0]?.id ?? `tool-overview-${index}`}
            className={styles.toolOverviewCard}
            data-tool-overview-card={index + 1}
          >
            <span className={styles.toolOverviewAccent} aria-hidden="true">
              {index + 1}
            </span>
            <div className={styles.toolOverviewCardBody}>
              {section.map((block) => renderPublicationBlock(block, allocations))}
            </div>
          </section>
        ))}
      </div>
      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}

function renderSensoryResetContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const { leading, sections, trailing } = splitHeadingSections(blocks)

  if (sections.length === 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.sensoryResetList} data-template-region="sensory-reset-list">
        {sections.map((section, index) => (
          <section
            key={section[0]?.id ?? `sensory-reset-${index}`}
            className={styles.sensoryResetItem}
            data-sensory-reset-item={index + 1}
          >
            <span className={styles.sensoryResetMarker} aria-hidden="true">
              {index + 1}
            </span>
            <div className={styles.sensoryResetItemBody}>
              {section.map((block) => renderPublicationBlock(block, allocations))}
            </div>
          </section>
        ))}
      </div>
      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}


function renderNavigationContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const { leading, sections, trailing } = splitHeadingSections(blocks)

  if (sections.length === 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.navigationRows} data-template-region="navigation-rows">
        {sections.map((section, index) => (
          <section
            key={section[0]?.id ?? `navigation-row-${index}`}
            className={styles.navigationRow}
            data-navigation-row={index + 1}
          >
            <span className={styles.navigationIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className={styles.navigationRowBody}>
              {section.map((block) => renderPublicationBlock(block, allocations))}
            </div>
          </section>
        ))}
      </div>
      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}


function renderTriggerScanContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const { leading, sections, trailing } = splitHeadingSections(blocks)

  if (sections.length === 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.triggerColumns} data-template-region="trigger-columns">
        {sections.slice(0, 2).map((section, index) => (
          <section
            key={section[0]?.id ?? `trigger-column-${index}`}
            className={styles.triggerPanel}
            data-trigger-column={index + 1}
          >
            {section.map((block) => renderPublicationBlock(block, allocations))}
          </section>
        ))}
      </div>
      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}

function renderRegulationMenuContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const firstFieldIndex = blocks.findIndex(
    (block) => block.type === 'multiline-text-field',
  )

  if (firstFieldIndex < 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  let lastFieldIndex = firstFieldIndex
  for (let index = firstFieldIndex; index < blocks.length; index += 1) {
    if (blocks[index]?.type === 'multiline-text-field') {
      lastFieldIndex = index
    }
  }

  const leading = blocks.slice(0, firstFieldIndex)
  const fields = blocks
    .slice(firstFieldIndex, lastFieldIndex + 1)
    .filter((block) => block.type === 'multiline-text-field')
  const trailing = blocks.slice(lastFieldIndex + 1)

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.regulationMenuRows} data-template-region="regulation-menu-rows">
        {fields.map((block, index) => (
          <section
            key={block.id}
            className={styles.regulationMenuRow}
            data-regulation-menu-row={index + 1}
          >
            <span className={styles.regulationMenuMarker} aria-hidden="true">
              {index + 1}
            </span>
            <div className={styles.regulationMenuField}>
              {renderPublicationBlock(block, allocations)}
            </div>
          </section>
        ))}
      </div>
      {trailing.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}


function renderWeeklyResetContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const firstInteractive = blocks.findIndex(
    (block) =>
      block.type === 'multiline-text-field' ||
      block.type === 'checkbox-field' ||
      block.type === 'rating-field',
  )
  const firstCheckbox = blocks.findIndex((block) => block.type === 'checkbox-field')
  const lastCheckbox = blocks.map((block) => block.type).lastIndexOf('checkbox-field')

  if (firstInteractive < 0 || firstCheckbox < 0 || lastCheckbox < firstCheckbox) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  const leading = blocks.slice(0, firstInteractive)
  const left = blocks.slice(firstInteractive, firstCheckbox)
  const right = blocks.slice(firstCheckbox)

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.weeklyResetGrid} data-template-region="weekly-reset-grid">
        <section className={styles.weeklyResetPanel} data-weekly-reset-panel="reflection">
          {left.map((block) => renderPublicationBlock(block, allocations))}
        </section>
        <section className={styles.weeklyResetPanel} data-weekly-reset-panel="focus">
          {right.map((block) => renderPublicationBlock(block, allocations))}
        </section>
      </div>
    </div>
  )
}

function renderPlannerTrackerContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const tableIndex = blocks.findIndex((block) => block.type === 'table')

  if (tableIndex < 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  const leading = blocks.slice(0, tableIndex)
  const table = blocks[tableIndex]
  const trailing = blocks.slice(tableIndex + 1)
  const supportCheckboxes = trailing.filter((block) => block.type === 'checkbox-field')
  const supportFields = trailing.filter(
    (block) => block.type === 'multiline-text-field' || block.type === 'paragraph',
  )

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      {table ? renderPublicationBlock(table, allocations) : null}
      {trailing.length > 0 ? (
        <div className={styles.plannerSupportGrid} data-template-region="planner-support-grid">
          <section className={styles.plannerSupportPanel} data-planner-support="habits">
            {supportCheckboxes.map((block) => renderPublicationBlock(block, allocations))}
          </section>
          <section className={styles.plannerSupportPanel} data-planner-support="notes">
            {supportFields.map((block) => renderPublicationBlock(block, allocations))}
          </section>
        </div>
      ) : null}
    </div>
  )
}


function groupLevelThreeSections(
  blocks: readonly PublicationBlock[],
): { leading: PublicationBlock[]; sections: PublicationBlock[][] } {
  const firstSectionIndex = blocks.findIndex(
    (block) => block.type === 'heading' && block.level === 3,
  )

  if (firstSectionIndex < 0) {
    return { leading: [...blocks], sections: [] }
  }

  const leading = [...blocks.slice(0, firstSectionIndex)]
  const sections: PublicationBlock[][] = []
  let current: PublicationBlock[] = []

  for (const block of blocks.slice(firstSectionIndex)) {
    if (block.type === 'heading' && block.level === 3 && current.length > 0) {
      sections.push(current)
      current = []
    }

    current.push(block)
  }

  if (current.length > 0) sections.push(current)

  return { leading, sections }
}

function NervousSystemSchematic(): ReactElement {
  return (
    <div className={styles.nervousSystemSchematic} aria-hidden="true">
      <svg viewBox="0 0 240 190" className={styles.brainSchematic} focusable="false">
        <path
          className={styles.brainOutline}
          d="M69 151 C39 141 27 115 34 89 C18 64 31 35 57 29 C73 7 106 8 122 25 C144 12 175 24 180 48 C205 59 211 88 196 108 C198 136 174 156 149 157 C128 177 91 174 69 151 Z"
        />
        <path
          className={styles.brainRegionFront}
          d="M48 89 C38 64 51 40 74 34 C88 24 105 27 116 38 C107 60 105 82 111 102 C88 111 66 107 48 89 Z"
        />
        <path
          className={styles.brainRegionMiddle}
          d="M116 38 C137 24 166 35 176 55 C190 68 190 90 178 105 C159 111 138 111 111 102 C105 82 107 60 116 38 Z"
        />
        <path
          className={styles.brainRegionStem}
          d="M111 102 C139 111 159 111 178 105 C174 127 155 141 137 142 L126 169 L105 169 L111 132 C101 124 103 112 111 102 Z"
        />
      </svg>
    </div>
  )
}

function renderNervousSystemBasicsContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const { leading, sections } = groupLevelThreeSections(blocks)

  if (sections.length < 3) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.nervousSystemBasics} data-template-region="nervous-system-basics">
        <NervousSystemSchematic />
        <div className={styles.nervousSystemLabels}>
          {sections.slice(0, 3).map((section, index) => (
            <section
              key={section[0]?.id ?? 'nervous-system-region-' + index}
              className={styles.nervousSystemLabel}
              data-nervous-system-region={index + 1}
            >
              {section.map((block) => renderPublicationBlock(block, allocations))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

function renderDeepDiveContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const { leading, sections } = groupLevelThreeSections(blocks)

  if (sections.length < 3) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.deepDiveGrid} data-template-region="deep-dive-grid">
        <section className={styles.deepDivePanel} data-deep-dive-panel="current">
          {sections[0]?.map((block) => renderPublicationBlock(block, allocations))}
        </section>
        <section className={styles.deepDivePanel} data-deep-dive-panel="helps">
          {sections[1]?.map((block) => renderPublicationBlock(block, allocations))}
        </section>
        <section
          className={[styles.deepDivePanel, styles.deepDivePanelWide].join(' ')}
          data-deep-dive-panel="friction"
        >
          {sections
            .slice(2)
            .flat()
            .map((block) => renderPublicationBlock(block, allocations))}
        </section>
      </div>
    </div>
  )
}

function renderGoalPlannerContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const leading: PublicationBlock[] = []
  const primaryFields: PublicationBlock[] = []
  const actionBlocks: PublicationBlock[] = []
  const footerBlocks: PublicationBlock[] = []
  let phase: 'leading' | 'primary' | 'actions' | 'footer' = 'leading'

  for (const block of blocks) {
    if (
      block.type === 'heading' &&
      block.level === 3 &&
      /action steps?/i.test(block.text)
    ) {
      phase = 'actions'
      actionBlocks.push(block)
      continue
    }

    if (
      block.type === 'heading' &&
      block.level === 3 &&
      /target date/i.test(block.text)
    ) {
      phase = 'footer'
      footerBlocks.push(block)
      continue
    }

    if (phase === 'leading') {
      if (block.type === 'multiline-text-field') {
        phase = 'primary'
        primaryFields.push(block)
      } else {
        leading.push(block)
      }
      continue
    }

    if (phase === 'primary') {
      if (block.type === 'checkbox-field') {
        phase = 'actions'
        actionBlocks.push(block)
      } else {
        primaryFields.push(block)
      }
      continue
    }

    if (phase === 'actions') {
      if (
        block.type === 'multiline-text-field' &&
        /target date/i.test(block.text)
      ) {
        phase = 'footer'
        footerBlocks.push(block)
      } else {
        actionBlocks.push(block)
      }
      continue
    }

    footerBlocks.push(block)
  }

  if (primaryFields.length === 0 || actionBlocks.length === 0) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.goalPlannerFields} data-template-region="goal-primary-fields">
        {primaryFields.map((block) => renderPublicationBlock(block, allocations))}
      </div>
      <section className={styles.goalActionSteps} data-template-region="goal-action-steps">
        {actionBlocks.map((block) => renderPublicationBlock(block, allocations))}
      </section>
      {footerBlocks.length > 0 ? (
        <footer className={styles.goalPlannerFooter} data-template-region="goal-footer">
          {footerBlocks.map((block) => renderPublicationBlock(block, allocations))}
        </footer>
      ) : null}
    </div>
  )
}

function renderClosingContent(
  blocks: readonly PublicationBlock[],
  allocations: readonly PublicationLayoutBlockAllocation[],
): ReactElement {
  const { leading, sections } = groupLevelThreeSections(blocks)

  if (sections.length < 4) {
    return (
      <div className={styles.content}>
        {blocks.map((block) => renderPublicationBlock(block, allocations))}
      </div>
    )
  }

  const reminderSymbols = ['♡', '⌁', '☼', '⌒', '❧', '☆']

  return (
    <div className={styles.content}>
      {leading.map((block) => renderPublicationBlock(block, allocations))}
      <div className={styles.closingReminderGrid} data-template-region="closing-reminders">
        {sections.slice(0, 6).map((section, index) => (
          <section
            key={section[0]?.id ?? 'closing-reminder-' + index}
            className={styles.closingReminder}
            data-closing-reminder={index + 1}
          >
            <span className={styles.closingReminderIcon} aria-hidden="true">
              {reminderSymbols[index] ?? '♡'}
            </span>
            {section.map((block) => renderPublicationBlock(block, allocations))}
          </section>
        ))}
      </div>
      <div className={styles.closingLandscapeSlot} data-template-region="closing-landscape">
        <span>A calmer you creates a kinder everything.</span>
      </div>
    </div>
  )
}

function PublicationTemplateContent({
  blocks,
  allocations,
  pageTemplate,
}: PublicationTemplateContentProps): ReactElement {
  if (pageTemplate === 'navigation') {
    return renderNavigationContent(blocks, allocations)
  }

  if (pageTemplate === 'guided-framework') {
    return renderGuidedFrameworkContent(blocks, allocations)
  }

  if (pageTemplate === 'tool-overview') {
    return renderToolOverviewContent(blocks, allocations)
  }

  if (pageTemplate === 'sensory-reset') {
    return renderSensoryResetContent(blocks, allocations)
  }

  if (pageTemplate === 'trigger-scan') {
    return renderTriggerScanContent(blocks, allocations)
  }

  if (pageTemplate === 'regulation-menu') {
    return renderRegulationMenuContent(blocks, allocations)
  }

  if (pageTemplate === 'nervous-system-basics') {
    return renderNervousSystemBasicsContent(blocks, allocations)
  }

  if (pageTemplate === 'deep-dive') {
    return renderDeepDiveContent(blocks, allocations)
  }

  if (pageTemplate === 'goal-planner') {
    return renderGoalPlannerContent(blocks, allocations)
  }

  if (pageTemplate === 'emergency-tool') {
    return renderEmergencyToolContent(blocks, allocations)
  }

  if (pageTemplate === 'daily-check-in') {
    return renderDailyCheckInContent(blocks, allocations)
  }

  if (pageTemplate === 'weekly-reset') {
    return renderWeeklyResetContent(blocks, allocations)
  }

  if (pageTemplate === 'planner-tracker') {
    return renderPlannerTrackerContent(blocks, allocations)
  }

  if (pageTemplate === 'closing') {
    return renderClosingContent(blocks, allocations)
  }

  return (
    <div className={styles.content}>
      {blocks.map((block) => renderPublicationBlock(block, allocations))}
    </div>
  )
}

export function PublicationPreviewPage({
  publication,
  onBack,
  onEdit,
  onHistory,
}: PublicationPreviewPageProps): ReactElement {
  const [isDownloadingFillablePdf, setIsDownloadingFillablePdf] = useState(false)
  const [fillablePdfError, setFillablePdfError] = useState<string>()
  const layout = createPublicationLayout(publication)
  const contentPageCount = layout.pages.filter((page) => page.kind === 'content').length
  const interactiveFieldCount = countInteractiveFields(publication)
  const hasInteractiveFields = interactiveFieldCount > 0
  const isReadyToExport = layout.health === 'healthy'

  function handlePrint() {
    globalThis.print()
  }

  async function handleDownloadFillablePdf() {
    if (isDownloadingFillablePdf) {
      return
    }

    setFillablePdfError(undefined)
    setIsDownloadingFillablePdf(true)

    try {
      await downloadFillablePublicationPdf(publication)
    } catch {
      setFillablePdfError(
        'The fillable PDF could not be prepared. Your publication is unchanged. Please try again.',
      )
    } finally {
      setIsDownloadingFillablePdf(false)
    }
  }

  return (
    <main className={styles.page}>
      <Container size="lg" className={styles.previewContainer}>
        <Stack gap="xl" className={styles.previewStack}>
          <div className={styles.previewControls}>
            <Stack gap="md">
              <PageHeader
                eyebrow="Publication preview"
                title={publication.title}
                description={
                  publication.status === 'published' ? 'Published preview' : 'Draft preview'
                }
                actions={
                  <Cluster gap="sm">
                    <Button variant="ghost" startIcon={<ArrowLeft size={18} />} onClick={onBack}>
                      Back to publications
                    </Button>

                    <Button
                      variant="secondary"
                      startIcon={<Pencil size={18} />}
                      onClick={() => onEdit()}
                    >
                      Adjust publication
                    </Button>

                    {onHistory ? (
                      <Button
                        variant="secondary"
                        startIcon={<History size={18} />}
                        onClick={onHistory}
                      >
                        Version history
                      </Button>
                    ) : null}

                    {hasInteractiveFields ? (
                      <Button
                        variant="secondary"
                        startIcon={<Download size={18} />}
                        disabled={isDownloadingFillablePdf}
                        onClick={() => void handleDownloadFillablePdf()}
                      >
                        {isDownloadingFillablePdf
                          ? 'Preparing fillable PDF…'
                          : 'Download fillable PDF'}
                      </Button>
                    ) : null}

                    <Button startIcon={<Printer size={18} />} onClick={handlePrint}>
                      Print / Save as PDF
                    </Button>
                  </Cluster>
                }
              />

              <section
                className={isReadyToExport ? styles.readinessReady : styles.readinessReview}
                aria-labelledby="publication-readiness-title"
                data-layout-health={layout.health}
              >
                <div className={styles.readinessHeader}>
                  {isReadyToExport ? (
                    <CheckCircle2 size={20} aria-hidden="true" />
                  ) : (
                    <AlertCircle size={20} aria-hidden="true" />
                  )}

                  <div>
                    <p id="publication-readiness-title" className={styles.readinessTitle}>
                      {isReadyToExport ? 'Ready to export' : 'Review suggested'}
                    </p>
                    <p className={styles.readinessSummary}>
                      {contentPageCount} {contentPageCount === 1 ? 'content page' : 'content pages'}
                      {interactiveFieldCount > 0
                        ? ` · ${interactiveFieldCount} interactive ${
                            interactiveFieldCount === 1 ? 'field' : 'fields'
                          }`
                        : ''}
                    </p>
                  </div>
                </div>

                {isReadyToExport ? (
                  <p className={styles.readinessDescription}>
                    Automatic layout checks found no composition issues that need attention. You can
                    export now or adjust the publication only if you prefer a different editorial choice.
                  </p>
                ) : (
                  <div className={styles.reviewDetails}>
                    <p className={styles.readinessDescription}>
                      The publication remains exportable. These are focused layout suggestions, not a
                      required page-by-page review.
                    </p>

                    <ol className={styles.diagnosticList} aria-label="Layout review suggestions">
                      {layout.diagnostics.map((diagnostic, index) => {
                        const page = layout.pages.find(
                          (candidate) => candidate.pageNumber === diagnostic.pageNumber,
                        )
                        const groupedBlockId = diagnostic.semanticGroupId
                          ? publication.content.blocks.find(
                              (block) => block.semanticGroup?.id === diagnostic.semanticGroupId,
                            )?.id
                          : undefined
                        const reviewBlockId =
                          diagnostic.blockId ?? groupedBlockId ?? page?.blocks[0]?.id

                        return (
                          <li
                            key={`${diagnostic.code}-${diagnostic.pageNumber ?? 'document'}-${diagnostic.blockId ?? diagnostic.semanticGroupId ?? index}`}
                            className={styles.diagnosticItem}
                          >
                            <div>
                              <p className={styles.diagnosticLabel}>
                                {diagnostic.pageNumber !== undefined
                                  ? `Page ${diagnostic.pageNumber}`
                                  : 'Publication'}
                              </p>
                              <p>{diagnostic.message}</p>
                            </div>

                            <div className={styles.diagnosticActions}>
                              {diagnostic.pageNumber !== undefined ? (
                                <a
                                  className={styles.pageLink}
                                  href={`#publication-page-${diagnostic.pageNumber}`}
                                >
                                  View page {diagnostic.pageNumber}
                                </a>
                              ) : null}

                              {reviewBlockId ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => onEdit(reviewBlockId)}
                                >
                                  Adjust this item
                                </Button>
                              ) : null}
                            </div>
                          </li>
                        )
                      })}
                    </ol>

                    <Button type="button" variant="secondary" onClick={() => onEdit()}>
                      Review all adjustments
                    </Button>
                  </div>
                )}
              </section>

              {fillablePdfError ? (
                <div className={styles.exportError} role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <p>{fillablePdfError}</p>
                </div>
              ) : null}
            </Stack>
          </div>

          <section className={styles.previewViewport} aria-label="Print-oriented publication preview">
            {layout.pages.map((layoutPage) => {
              const isCover = layoutPage.kind === 'cover'
              const hasContent = layoutPage.blocks.length > 0
              const pageRecipe = isCover
                ? undefined
                : getPublicationPageLayoutRecipe(layoutPage.blocks)

              return (
                <article
                  key={layoutPage.id}
                  id={
                    layoutPage.pageNumber !== undefined
                      ? `publication-page-${layoutPage.pageNumber}`
                      : undefined
                  }
                  className={`${styles.documentPage} ${documentTheme.theme}`}
                  aria-label={
                    isCover
                      ? 'Publication cover'
                      : `Publication content page ${layoutPage.pageNumber ?? layoutPage.sequence}`
                  }
                  data-page-kind={layoutPage.kind}
                  data-page-size={layout.settings.pageSize}
                  data-orientation={layout.settings.orientation}
                  data-layout-remaining-units={layoutPage.remainingUnits}
                  data-page-archetype={pageRecipe?.archetype}
                  data-page-density={pageRecipe?.density}
                  data-page-template={layoutPage.pageTemplate}
                >
                  {!isCover ? (
                    <header className={styles.runningHeader} data-publication-running-header>
                      <span className={styles.runningBrand}>The Gentle Page</span>
                      <span className={styles.runningSection}>
                        {getPublicationPageTemplateLabel(layoutPage.pageTemplate)}
                      </span>
                    </header>
                  ) : null}

                  {isCover ? (
                    <div className={styles.coverBody}>
                      <BotanicalCorner position="top-right" />
                      <BotanicalCorner position="bottom-left" />
                      <p className={styles.coverBrand}>The Gentle Page</p>

                      <div className={styles.coverTitleGroup}>
                        <h1 id="publication-preview-title" className={styles.coverTitle}>
                          {publication.title}
                        </h1>

                        {publication.description ? (
                          <p className={styles.coverDescription}>{publication.description}</p>
                        ) : null}
                      </div>

                      <p className={styles.coverTagline}>
                        Thoughtfully designed tools for everyday clarity.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.documentBody}>
                      {hasContent ? (
                        <PublicationTemplateContent
                          blocks={layoutPage.blocks}
                          allocations={layoutPage.allocations}
                          pageTemplate={layoutPage.pageTemplate}
                        />
                      ) : (
                        <div className={styles.emptyState}>
                          <p className={styles.emptyTitle}>Nothing to preview yet</p>
                          <p className={styles.emptyDescription}>
                            Add content blocks in the editor to build this publication.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {layoutPage.pageNumber !== undefined ? (
                    <footer
                      className={styles.pageNumber}
                      aria-label={`Page ${layoutPage.pageNumber}`}
                    >
                      {layoutPage.pageNumber}
                    </footer>
                  ) : null}
                </article>
              )
            })}
          </section>
        </Stack>
      </Container>
    </main>
  )
}
