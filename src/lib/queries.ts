// ✅ 최적화된 호 목록 쿼리
export const issuesListQuery = `
  *[_type == "issue"] | order(number desc) {
    _id,
    number,
    title,
    publishDate,
    credits,
    "sections": *[_type == "section" && issue._ref == ^._id] | order(order asc) {
      _id,
      title,
      slug,
      order,
      "articles": *[_type == "article" && section._ref == ^._id] | order(order asc) {
        _id,
        title,
        slug,
        author,
        order
      }
    }[count(articles) > 0]
  }
`

// ✅ 최적화된 단일 호 쿼리
export const issueWithSectionsQuery = `
  *[_type == "issue" && number == $number][0]{
    _id,
    number,
    title,
    publishDate,
    coverImage,
    "sections": *[_type == "section" && issue._ref == ^._id] | order(order asc) {
      _id,
      title,
      slug,
      order,
      "articles": *[_type == "article" && section._ref == ^._id] | order(order asc) {
        _id,
        title,
        slug,
        author,
        order
      }
    }
  }
`

// 아티클 쿼리는 그대로
export const articleQuery = `
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    author,
    authorBio,
    content,
    references,
    imageSources,
    "issue": issue->{
      number,
      title
    },
    "section": section->{
      title,
      slug
    }
  }
`

// ✅ 최적화된 네비게이션 쿼리 - credits 추가
export const articleWithNavigationQuery = `
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
      title,
      credits
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
      slug
    },
    "nextArticle": *[
      _type == "article" && 
      section._ref == ^.section._ref && 
      order > ^.order
    ] | order(order asc)[0]{
      title,
      slug
    }
  }
`