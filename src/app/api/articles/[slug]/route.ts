import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity'
import { articleWithHierarchyNavigationQuery } from '@/lib/queries'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params

    if (!slug) {
      return NextResponse.json({ error: 'Invalid article slug' }, { status: 400 })
    }

    const article = await serverClient.fetch(articleWithHierarchyNavigationQuery, { slug })
    return NextResponse.json({ article })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch article data' }, { status: 500 })
  }
}
