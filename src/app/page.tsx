import '@/css/globals.css'
import { serverClient } from '@/lib/sanity'
import { issuesListQuery } from '@/lib/queries'
import HomeClient from './HomeClient'

export const revalidate = 600

export default async function HomePage() {
  const startTime = Date.now() // ✨ 시작
  
  const issues = await serverClient.fetch(issuesListQuery, {}, {
    next: { revalidate: 600 }
  })
  
  const endTime = Date.now() // ✨ 종료
  console.log(`🔥 Sanity Fetch Time: ${endTime - startTime}ms`) // ✨ 출력
  
  const sortedIssues = issues.sort((a: any, b: any) => a.number - b.number)

  return <HomeClient initialIssues={sortedIssues} />
}

//   // 캐싱 추가 - 10분마다 갱신
// export const revalidate = 600

// export default async function HomePage() {
//   const issues = await client.fetch(issuesListQuery, {}, {
//     next: { revalidate: 600 } // 10분 캐시
//   })
//   const sortedIssues = issues.sort((a: any, b: any) => a.number - b.number)

//   return <HomeClient initialIssues={sortedIssues} />
// }
