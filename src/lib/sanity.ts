import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

const baseConfig = {
  projectId,
  dataset,
  apiVersion: '2025-10-17',
  perspective: 'published',
  requestTagPrefix: 'app',
} as const

// Browser-safe client (never includes token)
export const client = createClient({
  ...baseConfig,
  useCdn: true,
})

// Server-only client (token can read private dataset)
export const serverClient = createClient({
  ...baseConfig,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
})

// 이미지 URL 생성 함수
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}
