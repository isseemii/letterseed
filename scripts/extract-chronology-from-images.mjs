#!/usr/bin/env node
/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_INPUT_DIR = 'data/chronology-images'
const DEFAULT_OUTPUT_PATH = 'data/chronology-rows.json'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff'])

function parseArgs(argv) {
  const args = {
    inputDir: DEFAULT_INPUT_DIR,
    output: DEFAULT_OUTPUT_PATH,
    files: [],
  }

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--input-dir') {
      args.inputDir = argv[i + 1]
      i += 1
      continue
    }
    if (token === '--output') {
      args.output = argv[i + 1]
      i += 1
      continue
    }
    if (token === '--files') {
      args.files = (argv[i + 1] || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
      i += 1
      continue
    }
  }

  return args
}

function listImageFiles(inputDir) {
  if (!fs.existsSync(inputDir)) return []

  return fs
    .readdirSync(inputDir)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((name) => path.join(inputDir, name))
}

function runTesseractTsv(filePath) {
  const output = execFileSync(
    'tesseract',
    [filePath, 'stdout', '-l', 'kor+eng', '--oem', '1', '--psm', '6', 'tsv'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  )
  return output
}

function parseTsv(tsv) {
  const lines = tsv.split(/\r?\n/).filter(Boolean)
  if (lines.length <= 1) return []

  const header = lines[0].split('\t')
  const idx = Object.fromEntries(header.map((col, i) => [col, i]))
  const words = []

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split('\t')
    if (cols.length < header.length) continue
    const level = Number(cols[idx.level])
    if (level !== 5) continue

    const text = (cols[idx.text] || '').trim()
    if (!text) continue

    const word = {
      pageNum: Number(cols[idx.page_num]),
      blockNum: Number(cols[idx.block_num]),
      parNum: Number(cols[idx.par_num]),
      lineNum: Number(cols[idx.line_num]),
      wordNum: Number(cols[idx.word_num]),
      left: Number(cols[idx.left]),
      top: Number(cols[idx.top]),
      width: Number(cols[idx.width]),
      height: Number(cols[idx.height]),
      conf: Number(cols[idx.conf]),
      text,
    }

    words.push(word)
  }

  return words
}

function getImageBounds(words) {
  if (words.length === 0) return { width: 0, height: 0 }
  let maxX = 0
  let maxY = 0
  for (const w of words) {
    maxX = Math.max(maxX, w.left + w.width)
    maxY = Math.max(maxY, w.top + w.height)
  }
  return { width: maxX, height: maxY }
}

function normalizeText(raw) {
  return raw
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[‧•▪■◆◇]/g, '•')
    .replace(/\s+/g, ' ')
    .trim()
}

function isYearText(text) {
  return /^(18|19|20)\d{2}$/.test(text)
}

function dedupeYearAnchors(yearWords) {
  const sorted = [...yearWords].sort((a, b) => {
    if (a.top !== b.top) return a.top - b.top
    return a.left - b.left
  })

  const merged = []
  for (const word of sorted) {
    const last = merged[merged.length - 1]
    if (!last) {
      merged.push({
        year: word.text,
        y: word.top,
        x: word.left,
        conf: word.conf,
      })
      continue
    }

    if (Math.abs(word.top - last.y) <= 8 && word.text === last.year) {
      if (word.conf > last.conf) {
        last.y = word.top
        last.x = word.left
        last.conf = word.conf
      }
      continue
    }

    merged.push({
      year: word.text,
      y: word.top,
      x: word.left,
      conf: word.conf,
    })
  }

  return merged
}

function buildLineMap(words) {
  const map = new Map()
  for (const w of words) {
    const key = `${w.pageNum}|${w.blockNum}|${w.parNum}|${w.lineNum}`
    if (!map.has(key)) {
      map.set(key, {
        words: [],
        left: Infinity,
        right: 0,
        top: Infinity,
        bottom: 0,
      })
    }

    const line = map.get(key)
    line.words.push(w)
    line.left = Math.min(line.left, w.left)
    line.right = Math.max(line.right, w.left + w.width)
    line.top = Math.min(line.top, w.top)
    line.bottom = Math.max(line.bottom, w.top + w.height)
  }

  const lines = []
  for (const line of map.values()) {
    line.words.sort((a, b) => a.left - b.left)
    const text = normalizeText(line.words.map((w) => w.text).join(' '))
    lines.push({
      words: line.words,
      text,
      left: line.left,
      right: line.right,
      top: line.top,
      bottom: line.bottom,
      centerX: (line.left + line.right) / 2,
      centerY: (line.top + line.bottom) / 2,
    })
  }

  lines.sort((a, b) => {
    if (a.top !== b.top) return a.top - b.top
    return a.left - b.left
  })

  return lines
}

function cleanLineForList(text) {
  const normalized = normalizeText(text)
    .replace(/^[•\-\s]+/, '')
    .replace(/^[:：]\s*/, '')
    .trim()

  if (!normalized) return ''
  if (/^(18|19|20)\d{2}$/.test(normalized)) return ''
  if (normalized.length <= 1) return ''
  return normalized
}

function isLikelyGarbage(text) {
  const value = text.trim()
  if (!value) return true
  if (value.length <= 1) return true
  const hangul = (value.match(/[가-힣]/g) || []).length
  const latin = (value.match(/[A-Za-z]/g) || []).length
  const digits = (value.match(/[0-9]/g) || []).length
  const useful = hangul + latin + digits
  if (useful < 2) return true
  const punct = (value.match(/[^\p{L}\p{N}\s]/gu) || []).length
  if (punct > useful * 2) return true
  return false
}

function pushUnique(arr, item) {
  if (!item) return
  if (!arr.includes(item)) arr.push(item)
}

function toPeriodLabel(year, prevYear) {
  const y = Number(year)
  if (!Number.isFinite(y)) return ''
  const decade = Math.floor(y / 10) * 10
  if (prevYear == null) return String(decade)
  const prevDecade = Math.floor(Number(prevYear) / 10) * 10
  return decade !== prevDecade ? String(decade) : ''
}

function extractRows(words) {
  const { width } = getImageBounds(words)
  if (width === 0) return []

  const yearCandidates = words.filter((w) => {
    if (!isYearText(w.text)) return false
    if (w.left > width * 0.35) return false
    if (w.conf < 25) return false
    return true
  })

  const yearAnchors = dedupeYearAnchors(yearCandidates)
  if (yearAnchors.length === 0) return []

  const lines = buildLineMap(words)

  const splitX = width * 0.57
  const domesticStartX = width * 0.11
  const yearMaxX = width * 0.33
  const gaps = []
  for (let i = 1; i < yearAnchors.length; i += 1) gaps.push(yearAnchors[i].y - yearAnchors[i - 1].y)
  const sortedGaps = gaps.filter((g) => g > 0).sort((a, b) => a - b)
  const medianGap =
    sortedGaps.length > 0 ? sortedGaps[Math.floor(sortedGaps.length / 2)] : Math.max(26, Math.round(width * 0.02))

  const rows = []
  for (let i = 0; i < yearAnchors.length; i += 1) {
    const current = yearAnchors[i]
    const next = yearAnchors[i + 1]
    const rowTop = current.y - 6
    const rowBottom = next ? next.y - 6 : current.y + Math.max(18, Math.round(medianGap * 1.25))

    const domestic = []
    const global = []

    const rowLines = lines.filter((line) => line.centerY >= rowTop && line.centerY < rowBottom)
    for (const line of rowLines) {
      const domesticWords = line.words.filter((w) => w.left >= domesticStartX && w.left < splitX)
      const globalWords = line.words.filter((w) => w.left >= splitX)

      let domesticText = normalizeText(domesticWords.map((w) => w.text).join(' '))
      let globalText = normalizeText(globalWords.map((w) => w.text).join(' '))

      // 연도 칼럼의 중복 숫자 제거
      domesticText = domesticText.replace(new RegExp(`^${current.year}\\s*`), '').trim()
      if (domesticWords.length > 0) {
        domesticText = normalizeText(
          domesticWords
            .filter((w) => !(w.left < yearMaxX && isYearText(w.text)))
            .map((w) => w.text)
            .join(' ')
        )
      }

      domesticText = cleanLineForList(domesticText)
      globalText = cleanLineForList(globalText)

      if (domesticText && !isLikelyGarbage(domesticText)) pushUnique(domestic, domesticText)
      if (globalText && !isLikelyGarbage(globalText)) pushUnique(global, globalText)
    }

    rows.push({
      periodLabel: '',
      year: current.year,
      domestic,
      global,
      _debug: { y: current.y },
    })
  }

  let prevYear = null
  for (const row of rows) {
    row.periodLabel = toPeriodLabel(row.year, prevYear)
    prevYear = row.year
  }

  return rows
}

function mergeRowsByYear(filesOutput) {
  const map = new Map()
  for (const file of filesOutput) {
    for (const row of file.rows) {
      const year = row.year
      if (!map.has(year)) {
        map.set(year, {
          periodLabel: row.periodLabel || '',
          year,
          domestic: [],
          global: [],
        })
      }
      const target = map.get(year)
      for (const item of row.domestic || []) pushUnique(target.domestic, item)
      for (const item of row.global || []) pushUnique(target.global, item)
      if (!target.periodLabel && row.periodLabel) target.periodLabel = row.periodLabel
    }
  }

  const merged = [...map.values()].sort((a, b) => Number(a.year) - Number(b.year))
  let prevYear = null
  for (const row of merged) {
    if (!row.periodLabel) row.periodLabel = toPeriodLabel(row.year, prevYear)
    prevYear = row.year
  }
  return merged
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
}

function main() {
  const args = parseArgs(process.argv)
  const files =
    args.files.length > 0 ? args.files : listImageFiles(args.inputDir)

  if (files.length === 0) {
    console.error(
      `[extract-chronology] No image files found. Put images in "${args.inputDir}" or pass --files.`
    )
    process.exit(1)
  }

  const filesOutput = []
  for (const filePath of files) {
    console.log(`[extract-chronology] OCR: ${filePath}`)
    let tsv
    try {
      tsv = runTesseractTsv(filePath)
    } catch (error) {
      console.error(`[extract-chronology] Failed OCR on ${filePath}`)
      console.error(error?.message || error)
      continue
    }

    const words = parseTsv(tsv)
    const bounds = getImageBounds(words)
    const rows = extractRows(words)
    filesOutput.push({
      file: filePath,
      width: bounds.width,
      height: bounds.height,
      rowCount: rows.length,
      rows,
    })
  }

  const mergedRows = mergeRowsByYear(filesOutput)
  const output = {
    generatedAt: new Date().toISOString(),
    inputDir: args.inputDir,
    files: filesOutput,
    mergedRows,
    sanityChronologyTableRows: mergedRows.map(({ periodLabel, year, domestic, global }) => ({
      periodLabel,
      year,
      domestic,
      global,
    })),
  }

  ensureDirForFile(args.output)
  fs.writeFileSync(args.output, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  console.log(`[extract-chronology] Wrote ${args.output}`)
  console.log(`[extract-chronology] mergedRows: ${mergedRows.length}`)
}

main()
