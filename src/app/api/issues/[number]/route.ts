import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity'
import { issueWithSectionsQuery, issuesListQuery } from '@/lib/queries'

interface RouteContext {
  params: Promise<{ number: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { number } = await context.params
    const issueNumber = Number.parseInt(number, 10)

    if (Number.isNaN(issueNumber)) {
      return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })
    }

    const [issue, issues] = await Promise.all([
      serverClient.fetch(issueWithSectionsQuery, { number: issueNumber }),
      serverClient.fetch(issuesListQuery),
    ])

    return NextResponse.json({ issue, issues })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch issue data' }, { status: 500 })
  }
}
