import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const matrixPath = path.resolve('src/components/article/articleContentMatrix.ts')
const src = fs.readFileSync(matrixPath, 'utf8')

test('content block type list and matrix keys stay aligned', () => {
  const typeListSection = src.split('export type ArticleContentBlockType')[0]
  const typeNames = [...typeListSection.matchAll(/'([a-zA-Z][a-zA-Z0-9]*)'/g)].map((m) => m[1])

  const matrixSection = src.split('export const ARTICLE_CONTENT_MATRIX')[1]
  assert.ok(matrixSection, 'Missing ARTICLE_CONTENT_MATRIX')
  const matrixKeys = [...matrixSection.matchAll(/\n\s*([a-zA-Z][a-zA-Z0-9]*):\s*{/g)].map((m) => m[1])

  assert.deepEqual(matrixKeys, typeNames)
})

test('every matrix item defines a typography preset key', () => {
  const presetKeys = [...src.matchAll(/contentPresetKey:\s*'([a-zA-Z][a-zA-Z0-9]*)'/g)].map((m) => m[1])
  const uniquePresetKeys = new Set(presetKeys)
  assert.ok(uniquePresetKeys.size > 0)
  for (const key of uniquePresetKeys) {
    assert.ok(['bodySerif', 'bodySans', 'bodyBold', 'footnoteSans', 'captionSans'].includes(key))
  }
})
