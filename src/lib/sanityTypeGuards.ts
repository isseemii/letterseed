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

export const toPortableValue = (value: unknown): TypedObject[] => {
  if (Array.isArray(value)) {
    return value.filter(isTypedObject)
  }
  if (isTypedObject(value)) {
    return [value]
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
