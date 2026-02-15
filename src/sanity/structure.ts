import type {StructureBuilder, StructureResolver} from 'sanity/structure'

const sectionChild = (S: StructureBuilder, sectionId: string) =>
  S.list()
    .title('섹션')
    .id(`section-${sectionId}`)
    .items([
      S.listItem()
        .title('섹션 편집')
        .id(`section-edit-${sectionId}`)
        .child(S.document().schemaType('section').documentId(sectionId)),
      S.divider(),
      S.listItem()
        .title('아티클')
        .id(`section-articles-${sectionId}`)
        .child(
          S.documentList()
            .title('아티클 목록')
            .id(`section-articles-list-${sectionId}`)
            .filter('_type == "article" && section._ref == $sectionId')
            .params({sectionId})
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
    ])

const sectionsByIssue = (S: StructureBuilder, issueId: string) =>
  S.documentList()
    .title('호별 섹션')
    .id(`sections-by-issue-${issueId}`)
    .filter('_type == "section" && issue._ref == $issueId')
    .params({issueId})
    .defaultOrdering([{field: 'order', direction: 'asc'}])
    .child((sectionId) => {
      if (!sectionId) {
        return S.component(() => null).title('섹션')
      }
      return sectionChild(S, sectionId)
    })

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('호').id('issues').child(S.documentTypeList('issue').title('호 목록')),
      S.divider(),
      S.listItem()
        .title('섹션 (호별)')
        .id('sections-by-issue')
        .child(
          S.documentTypeList('issue')
            .title('호 선택')
            .defaultOrdering([{field: 'number', direction: 'desc'}])
            .child((issueId) => {
              if (!issueId) {
                return S.component(() => null).title('호별 섹션')
              }
              return sectionsByIssue(S, issueId)
            }),
        ),
      S.divider(),
      S.listItem().title('모든 섹션').id('all-sections').child(S.documentTypeList('section').title('모든 섹션')),
      S.listItem().title('모든 아티클').id('articles').child(S.documentTypeList('article').title('모든 아티클')),
    ])
