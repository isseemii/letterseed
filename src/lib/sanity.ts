import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-10-17',
  useCdn: false,
  perspective: 'published',
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  requestTagPrefix: 'app',
})

// 이미지 URL 생성 함수
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}