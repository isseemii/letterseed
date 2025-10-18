import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false, // 실시간 데이터를 위해 false
})

// 이미지 URL 생성 함수
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}