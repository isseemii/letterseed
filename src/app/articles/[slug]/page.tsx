import { client } from '@/lib/sanity'
import ArticleClient from './ArticleClient'

// Sanity Query
const articleWithNavigationQuery = `
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    author,
    authorBio,
    content,
    references,
    imageSources,
    order,
    "issue": issue->{
      _id,
      number,
      title
    },
    "section": section->{
      _id,
      title,
      slug
    },
    "prevArticle": *[
      _type == "article" && 
      section._ref == ^.section._ref && 
      order < ^.order
    ] | order(order desc)[0]{
      title,
      "slug": slug.current,
      order
    },
    "nextArticle": *[
      _type == "article" && 
      section._ref == ^.section._ref && 
      order > ^.order
    ] | order(order asc)[0]{
      title,
      "slug": slug.current,
      order
    }
  }
`

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  
  try {
    const article = await client.fetch(articleWithNavigationQuery, {
      slug: slug,
    })

    if (!article) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">아티클을 찾을 수 없습니다.</p>
        </div>
      )
    }

    return <ArticleClient article={article} />
  } catch (error) {
    console.error('Error fetching article:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">아티클을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }
}