import type { TypedObject } from '@portabletext/types'

type MaybeRecord = Record<string, unknown>

export type SanityImageSource = MaybeRecord

export const isRecord = (value: unknown): value is MaybeRecord =>
  typeof value === 'object' && value !== null

export const isSanityImageSource = (value: unknown): value is SanityImageSource => {
  if (!isRecord(value)) return false
  const asset = value.asset
  if (!isRecord(asset)) return false
  return typeof asset._ref === 'string' || typeof asset.url === 'string'
}

export const isTypedObject = (value: unknown): value is TypedObject =>
  isRecord(value) && typeof value._type === 'string'

type PortableSpan = {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

type PortableBlock = {
  _type: 'block'
  _key?: string
  style?: string
  children?: PortableSpan[]
  markDefs?: Array<Record<string, unknown>>
  [key: string]: unknown
}

const isPortableBlock = (value: unknown): value is PortableBlock =>
  isRecord(value) && value._type === 'block'

const isBlockquoteBlock = (value: unknown): value is PortableBlock =>
  isPortableBlock(value) && value.style === 'blockquote'

const getBlockText = (block: PortableBlock): string =>
  (block.children || [])
    .map((child) => child.text || '')
    .join('')

const isSoftBreakParagraph = (value: unknown): value is PortableBlock => {
  if (!isPortableBlock(value)) return false
  if ((value.style || 'normal') !== 'normal') return false
  return getBlockText(value).trim().length === 0
}

const isCreditLineBlock = (value: unknown): value is PortableBlock => {
  if (!isPortableBlock(value)) return false
  if ((value.style || 'normal') !== 'normal') return false

  const text = getBlockText(value).trim()
  if (text.length === 0) return false

  // "라벨: 값" 형태(초반 30자 이내 콜론)나 대시 시작 라인들을 크레딧 행으로 간주
  const creditLabelPattern = /^(?:[-—•]\s*)?[^:：\n]{1,30}[:：]\s*\S/u
  const dashHeadingPattern = /^[-—•]\s+\S/u
  return creditLabelPattern.test(text) || dashHeadingPattern.test(text)
}

const mergeMarkDefs = (
  left: Array<Record<string, unknown>> = [],
  right: Array<Record<string, unknown>> = []
): Array<Record<string, unknown>> => {
  const merged = [...left]
  const seen = new Set(
    left
      .map((def) => (isRecord(def) ? def._key : undefined))
      .filter((key): key is string => typeof key === 'string')
  )

  right.forEach((def) => {
    if (!isRecord(def)) return
    const key = typeof def._key === 'string' ? def._key : undefined
    if (key && seen.has(key)) return
    if (key) seen.add(key)
    merged.push(def)
  })

  return merged
}

const mergeConsecutiveBlockquotes = (nodes: TypedObject[]): TypedObject[] => {
  const merged: TypedObject[] = []
  let quoteGroupIndex = 0
  let pendingSoftBreakCount = 0

  nodes.forEach((node) => {
    const last = merged[merged.length - 1]

    if (isSoftBreakParagraph(node) && isBlockquoteBlock(last)) {
      pendingSoftBreakCount += 1
      return
    }

    if (!isBlockquoteBlock(node)) {
      pendingSoftBreakCount = 0
      merged.push(node)
      return
    }

    if (isBlockquoteBlock(last)) {
      const groupSize =
        typeof last.__lsMergedQuoteCount === 'number' ? last.__lsMergedQuoteCount : 1
      const separators: PortableSpan[] = Array.from(
        {length: Math.max(1, pendingSoftBreakCount + 1)},
        (_, breakIdx) => ({
          _type: 'span',
          _key: `ls-quote-break-${quoteGroupIndex}-${groupSize}-${breakIdx}`,
          text: '\n',
          marks: [],
        })
      )
      last.children = [...(last.children || []), ...separators, ...(node.children || [])]
      last.markDefs = mergeMarkDefs(last.markDefs, node.markDefs)
      last.__lsMergedQuoteCount = groupSize + 1
      pendingSoftBreakCount = 0
      return
    }

    const cloned: PortableBlock = {
      ...node,
      children: [...(node.children || [])],
      markDefs: [...(node.markDefs || [])],
      __lsMergedQuoteCount: 1,
    }
    merged.push(cloned)
    quoteGroupIndex += 1
    pendingSoftBreakCount = 0
  })

  return merged
}

const mergeCreditParagraphGroups = (nodes: TypedObject[]): TypedObject[] => {
  const merged: TypedObject[] = []
  let idx = 0
  let creditGroupIndex = 0

  while (idx < nodes.length) {
    const node = nodes[idx]
    if (!isCreditLineBlock(node)) {
      merged.push(node)
      idx += 1
      continue
    }

    let end = idx
    let creditLineCount = 0
    const groupNodes: PortableBlock[] = []

    while (end < nodes.length) {
      const current = nodes[end]
      if (isCreditLineBlock(current)) {
        creditLineCount += 1
        groupNodes.push(current)
        end += 1
        continue
      }
      if (isSoftBreakParagraph(current)) {
        groupNodes.push(current)
        end += 1
        continue
      }
      break
    }

    // 최소 2개 이상의 크레딧 라인이 연속될 때만 박스로 승격
    if (creditLineCount < 2) {
      merged.push(node)
      idx += 1
      continue
    }

    const combinedChildren: PortableSpan[] = []
    let combinedMarkDefs: Array<Record<string, unknown>> = []
    let hasText = false
    let separatorIndex = 0

    groupNodes.forEach((groupNode) => {
      const block = groupNode as PortableBlock

      if (isSoftBreakParagraph(groupNode)) {
        combinedChildren.push({
          _type: 'span',
          _key: `ls-credit-break-${creditGroupIndex}-${separatorIndex++}`,
          text: '\n',
          marks: [],
        })
        return
      }

      if (hasText) {
        combinedChildren.push({
          _type: 'span',
          _key: `ls-credit-break-${creditGroupIndex}-${separatorIndex++}`,
          text: '\n',
          marks: [],
        })
      }

      combinedChildren.push(...(block.children || []))
      combinedMarkDefs = mergeMarkDefs(combinedMarkDefs, block.markDefs)
      hasText = true
    })

    merged.push({
      _type: 'block',
      _key: `ls-credit-box-${creditGroupIndex}`,
      style: 'blockquote',
      children: combinedChildren,
      markDefs: combinedMarkDefs,
      __lsMergedQuoteCount: Math.max(2, creditLineCount),
      __lsCreditBox: true,
    } as TypedObject)

    creditGroupIndex += 1
    idx = end
  }

  return merged
}

export const toPortableValue = (value: unknown): TypedObject[] => {
  const normalize = (nodes: TypedObject[]): TypedObject[] =>
    mergeCreditParagraphGroups(mergeConsecutiveBlockquotes(nodes))

  if (Array.isArray(value)) {
    return normalize(value.filter(isTypedObject))
  }
  if (isTypedObject(value)) {
    return normalize([value])
  }
  return []
}

export const getElementTypeName = (type: unknown): string | undefined => {
  if (typeof type === 'string') return type
  if (isRecord(type)) {
    if (typeof type.displayName === 'string') return type.displayName
    if (typeof type.name === 'string') return type.name
  }
  return undefined
}
