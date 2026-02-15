import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const typographyPath = path.resolve('src/lib/typography.ts')
const src = fs.readFileSync(typographyPath, 'utf8')
const articleStyleTokensPath = path.resolve('src/lib/articleStyleTokens.ts')
const tokenSrc = fs.readFileSync(articleStyleTokensPath, 'utf8')

test('typography presets include required css utility classes', () => {
  assert.ok(src.includes("bodySerif: '본문폰트'"))
  assert.ok(src.includes("bodySans: '본문폰트-민부리'"))
  assert.ok(src.includes("footnoteSans: '각주폰트-민부리'"))
  assert.ok(src.includes("captionSans: '캡션-민부리'"))
})

test('portable body class helper still applies spacing contract', () => {
  assert.ok(tokenSrc.includes("portableParagraph: 'my-[0.6em] md:mt-[0.4em] md:mb-6'"))
  assert.ok(src.includes('ARTICLE_TEXT_SPACING.portableParagraph'))
})
