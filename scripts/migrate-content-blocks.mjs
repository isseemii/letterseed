#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@sanity/client'

const LEGACY_TO_BLOCK_MAP = [
  { type: 'standard', legacyField: 'content', blockField: 'standardContent' },
  { type: 'responses', legacyField: 'responses', blockField: 'responsesContent' },
  { type: 'interviewQA', legacyField: 'interviewQA', blockField: 'interviewQAContent' },
  { type: 'conversation', legacyField: 'conversation', blockField: 'conversationContent' },
  { type: 'qaList', legacyField: 'qaList', blockField: 'qaListContent' },
]

const LEGACY_FIELDS = LEGACY_TO_BLOCK_MAP.map((item) => item.legacyField)

const asArray = (value) => (Array.isArray(value) ? value : [])

const parseArgs = () => {
  const args = process.argv.slice(2)
  const parsed = {
    write: false,
    unsetLegacy: false,
    limit: null,
  }

  args.forEach((arg) => {
    if (arg === '--write') parsed.write = true
    if (arg === '--unset-legacy') parsed.unsetLegacy = true
    if (arg.startsWith('--limit=')) {
      const n = Number(arg.split('=')[1])
      if (Number.isFinite(n) && n > 0) parsed.limit = Math.floor(n)
    }
  })

  return parsed
}

const loadDotEnvLocal = () => {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split('\n')

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) return

    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if (!key || process.env[key] !== undefined) return
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  })
}

const makeKey = (prefix, idx) => `${prefix}-${idx}-${Math.random().toString(36).slice(2, 10)}`

const makeContentBlocks = (doc) => {
  const blocks = []
  LEGACY_TO_BLOCK_MAP.forEach((mapping, idx) => {
    const value = asArray(doc[mapping.legacyField])
    if (value.length === 0) return

    blocks.push({
      _type: 'contentBlock',
      _key: makeKey(mapping.type, idx),
      blockType: mapping.type,
      [mapping.blockField]: value,
    })
  })
  return blocks
}

const QUERY = `
*[
  _type == "article" &&
  (
    count(content) > 0 ||
    count(responses) > 0 ||
    count(interviewQA) > 0 ||
    count(conversation) > 0 ||
    count(qaList) > 0
  )
]{
  _id,
  _rev,
  title,
  contentBlocks,
  content,
  responses,
  interviewQA,
  conversation,
  qaList
}
`

const main = async () => {
  loadDotEnvLocal()
  const options = parseArgs()

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-17'
  const readToken = process.env.SANITY_API_READ_TOKEN
  const writeToken = process.env.SANITY_API_WRITE_TOKEN
  const writeAuthToken = writeToken || readToken

  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  }

  if (options.write && !writeAuthToken) {
    throw new Error('Missing write-capable token (SANITY_API_WRITE_TOKEN or SANITY_API_READ_TOKEN)')
  }

  if (options.write && !writeToken && readToken) {
    console.log('SANITY_API_WRITE_TOKEN not set. Attempting write with SANITY_API_READ_TOKEN.')
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: options.write ? writeAuthToken : readToken || writeToken,
    perspective: 'published',
  })

  const docs = await client.fetch(QUERY)
  const candidates = docs
    .map((doc) => ({
      doc,
      hasContentBlocks: asArray(doc.contentBlocks).length > 0,
      generatedBlocks: makeContentBlocks(doc),
    }))
    .filter(({ hasContentBlocks, generatedBlocks }) => !hasContentBlocks && generatedBlocks.length > 0)

  const targets = options.limit ? candidates.slice(0, options.limit) : candidates

  const summary = {
    scanned: docs.length,
    eligible: candidates.length,
    targetCount: targets.length,
    blockTypeCounts: Object.fromEntries(LEGACY_TO_BLOCK_MAP.map((m) => [m.type, 0])),
  }

  targets.forEach(({ generatedBlocks }) => {
    generatedBlocks.forEach((block) => {
      summary.blockTypeCounts[block.blockType] += 1
    })
  })

  console.log(`Scanned: ${summary.scanned}`)
  console.log(`Eligible (needs migration): ${summary.eligible}`)
  console.log(`Target count: ${summary.targetCount}`)
  console.log('Block type counts:', summary.blockTypeCounts)

  if (!options.write) {
    const preview = targets.slice(0, 10).map(({ doc, generatedBlocks }) => ({
      _id: doc._id,
      title: doc.title,
      blockTypes: generatedBlocks.map((b) => b.blockType),
    }))
    console.log('\nDry run preview (first 10):')
    console.table(preview)
    console.log('\nDry run complete. Re-run with --write to apply changes.')
    return
  }

  if (targets.length === 0) {
    console.log('No targets to migrate.')
    return
  }

  const batchSize = 20
  let migrated = 0

  for (let i = 0; i < targets.length; i += batchSize) {
    const batch = targets.slice(i, i + batchSize)
    let tx = client.transaction()

    batch.forEach(({ doc, generatedBlocks }) => {
      const patch = {
        set: {
          contentBlocks: generatedBlocks,
        },
      }

      if (options.unsetLegacy) {
        patch.unset = LEGACY_FIELDS
      }

      tx = tx.patch(doc._id, patch)
    })

    await tx.commit({ visibility: 'sync' })
    migrated += batch.length
    console.log(`Committed batch: ${migrated}/${targets.length}`)
  }

  console.log(`Migration complete. Updated ${migrated} documents.`)
  if (options.unsetLegacy) {
    console.log(`Legacy fields unset: ${LEGACY_FIELDS.join(', ')}`)
  } else {
    console.log('Legacy fields were kept. Use --unset-legacy to remove them.')
  }
}

main().catch((error) => {
  console.error('Migration failed:', error.message)
  process.exit(1)
})
