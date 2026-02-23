import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity'
import { articleWithHierarchyNavigationQuery } from '@/lib/queries'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const resolveArticleExactLookupQuery = `
  *[
    _type == "article" &&
    (
      slug.current == $slug ||
      lower(slug.current) == lower($slug) ||
      _id == $slug ||
      _id == "drafts." + $slug
    )
  ][0]{
    "lookupKey": coalesce(slug.current, _id),
    "slug": slug.current
  }
`

const resolveArticlePrefixLookupQuery = `
  *[
    _type == "article" &&
    defined(slug.current) &&
    lower(slug.current) match $prefix
  ] | order(_updatedAt desc)[0]{
    "lookupKey": coalesce(slug.current, _id),
    "slug": slug.current
  }
`

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params
    const normalizedSlug = decodeURIComponent(slug).trim()

    if (!normalizedSlug) {
      return NextResponse.json({ error: 'Invalid article slug' }, { status: 400 })
    }

    const fetchOptions = {
      cache: 'no-store' as const,
      next: { revalidate: 0 },
    }
    const draftsClient = serverClient.withConfig({ perspective: 'drafts' })
    const lookupParams = {
      slug: normalizedSlug,
      prefix: `${normalizedSlug.toLowerCase()}*`,
    }

    let publishedMatch = await serverClient.fetch(resolveArticleExactLookupQuery, lookupParams, fetchOptions)
    let draftsMatch = publishedMatch
      ? null
      : await draftsClient.fetch(resolveArticleExactLookupQuery, lookupParams, fetchOptions)

    if (!publishedMatch && !draftsMatch) {
      publishedMatch = await serverClient.fetch(resolveArticlePrefixLookupQuery, lookupParams, fetchOptions)
      draftsMatch = publishedMatch
        ? null
        : await draftsClient.fetch(resolveArticlePrefixLookupQuery, lookupParams, fetchOptions)
    }

    const match = publishedMatch ?? draftsMatch
    const lookupKey = match?.lookupKey
    const matchClient = publishedMatch ? serverClient : draftsClient

    const article = lookupKey
      ? await matchClient.fetch(
        articleWithHierarchyNavigationQuery,
        { slug: lookupKey },
        fetchOptions
      )
      : null

    if (!article) {
      const similarSlugs = await serverClient.fetch(
        `*[
          _type == "article" &&
          defined(slug.current) &&
          lower(slug.current) match $contains
        ] | order(_updatedAt desc)[0...10]{
          _id,
          title,
          "slug": slug.current
        }`,
        { contains: `*${normalizedSlug.toLowerCase()}*` },
        fetchOptions
      )

      return NextResponse.json(
        {
          error: 'Article not found',
          requestedSlug: normalizedSlug,
          resolvedMatch: match || null,
          similarSlugs: Array.isArray(similarSlugs) ? similarSlugs : [],
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ article })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch article data', details: message }, { status: 500 })
  }
}
