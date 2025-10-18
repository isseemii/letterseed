// 호 목록 가져오기 (각 호별 섹션과 아티클 포함) - 수정됨
export const issuesListQuery = `
  *[_type == "issue"] | order(number desc) {
    _id,
    number,
    title,
    publishDate,
    coverImage,
    "sections": *[_type == "section"] | order(order asc) {
      _id,
      title,
      slug,
      order,
      "articles": *[_type == "article" && references(^._id) && issue->number == ^.^.number] | order(order asc) {
        _id,
        title,
        slug,
        author,
        order
      }
    }[count(articles) > 0]
  }
`

// 특정 호(단일) + 섹션/아티클 포함
export const issueWithSectionsQuery = `
  *[_type == "issue" && number == $number][0]{
    _id,
    number,
    title,
    publishDate,
    coverImage,
    "sections": *[_type == "section"] | order(order asc) {
      _id,
      title,
      slug,
      order,
      "articles": *[_type == "article" && references(^._id) && issue->number == $number] | order(order asc) {
        _id,
        title,
        slug,
        author,
        order
      }
    }
  }
`

// 아티클 상세 가져오기
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