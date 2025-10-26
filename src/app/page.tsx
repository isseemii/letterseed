import '@/css/globals.css'
import { client } from '@/lib/sanity'
import { issuesListQuery } from '@/lib/queries'
import HomeClient from './HomeClient'

export default async function HomePage() {
  // 서버에서 미리 데이터 가져오기
  const issues = await client.fetch(issuesListQuery)
  const sortedIssues = issues.sort((a: any, b: any) => a.number - b.number)

  return <HomeClient initialIssues={sortedIssues} />
}