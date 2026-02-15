import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

import { apiVersion, dataset, projectId } from '../sanity/env'

const baseConfig = {
  projectId,
  dataset,
  apiVersion,
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
