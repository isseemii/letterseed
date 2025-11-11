// ✅ 최적화된 호 목록 쿼리 (계층적 섹션 지원 - 3단계 깊이)
export const issuesListQuery = `
  *[_type == "issue"] | order(number desc) {
    _id,
    number,
    title,
    publishDate,
    credits,
    "sections": *[_type == "section" && issue._ref == ^._id && !defined(parentSection)] | order(order asc) {
      _id,
      title,
      slug,
      order,
      "subsections": *[_type == "section" && parentSection._ref == ^._id] | order(order asc) {
        _id,
        title,
        slug,
        order,
        "subsections": *[_type == "section" && parentSection._ref == ^._id] | order(order asc) {
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
        },
        "articles": *[_type == "article" && section._ref == ^._id] | order(order asc) {
          _id,
          title,
          slug,
          author,
          order
        }
      },
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

// ✅ 최적화된 단일 호 쿼리 (계층적 섹션 지원 - 3단계 깊이)
export const issueWithSectionsQuery = `
  *[_type == "issue" && number == $number][0]{
    _id,
    number,
    title,
    publishDate,
    coverImage,
    "sections": *[_type == "section" && issue._ref == ^._id && !defined(parentSection)] | order(order asc) {
      _id,
      title,
      slug,
      order,
      "subsections": *[_type == "section" && parentSection._ref == ^._id] | order(order asc) {
        _id,
        title,
        slug,
        order,
        "subsections": *[_type == "section" && parentSection._ref == ^._id] | order(order asc) {
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
        },
        "articles": *[_type == "article" && section._ref == ^._id] | order(order asc) {
          _id,
          title,
          slug,
          author,
          order
        }
      },
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

// ✅ 아티클 쿼리 (모든 타입 지원)
export const articleQuery = `
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    author,
    authorBio,
    articleType,
    introduction,
    content,
    responses,
    interviewQA,
    conversation,
    qaList,
    additionalSections,
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

// ✅ 최적화된 네비게이션 쿼리 (모든 아티클 타입 + 추가 섹션 지원)
export const articleWithNavigationQuery = `
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    author,
    authorBio,
    articleType,
    introduction,
    content,
    responses,
    interviewQA,
    conversation,
    qaList,
    additionalSections,
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
      issue._ref == ^.issue._ref && 
      order < ^.order
    ] | order(order desc)[0]{
      title,
      slug
    },
    "nextArticle": *[
      _type == "article" && 
      issue._ref == ^.issue._ref && 
      order > ^.order
    ] | order(order asc)[0]{
      title,
      slug
    }
  }
`