import { client } from '@/lib/sanity'
import { issueWithSectionsQuery, issuesListQuery  } from '@/lib/queries'
import Link from 'next/link'

export default async function TestSanityPage() {
  // 26호 데이터 가져오기
  const issue = await client.fetch(issueWithSectionsQuery, { number: 26 })

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        글짜씨 {issue.number}호
      </h1>
      
      {issue.title && (
        <p style={{ fontSize: '24px', color: '#666', marginBottom: '40px' }}>
          {issue.title}
        </p>
      )}

      {/* 섹션별 아티클 */}
      {issue.sections.map((section: any) => (
        <section key={section._id} style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold',
            marginBottom: '20px',
            borderBottom: '2px solid #000',
            paddingBottom: '10px'
          }}>
            {section.title}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {section.articles.map((article: any) => (
              <article 
                key={article._id}
                style={{ 
                  borderLeft: '4px solid #ddd',
                  paddingLeft: '20px'
                }}
              >
                <Link 
                  href={`/articles/${article.slug.current}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#000'
                  }}>
                    {article.title}
                  </h3>
                  <p style={{ color: '#666', fontSize: '16px' }}>
                    {article.author}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* 디버깅: 전체 데이터 확인 */}
      <details style={{ marginTop: '60px', padding: '20px', background: '#f5f5f5' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          🔍 디버그: 전체 데이터 보기
        </summary>
        <pre style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: '#fff',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(issue, null, 2)}
        </pre>
      </details>
    </div>
  )
}