import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // 호
      S.listItem()
        .title('호')
        .id('issues')
        .child(
          S.documentTypeList('issue')
            .title('호 목록')
        ),
      
      S.divider(),
      
      // 섹션 - 호별 (아티클 포함!)
      S.listItem()
        .title('섹션 (호별)')
        .id('sections-by-issue')
        .child(
          S.list()
            .title('호 선택')
            .id('sections-by-issue-list')
            .items([
              S.listItem()
                .title('26호')
                .id('sections-issue-26')
                .child(
                  S.documentList()
                    .title('26호 섹션')
                    .id('sections-issue-26-list')
                    .filter('_type == "section" && issue->number == 26')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                    .child((sectionId) =>
                      // ✨ 섹션을 클릭하면 나오는 화면
                      S.list()
                        .title('섹션')
                        .id(`section-${sectionId}`)
                        .items([
                          // 섹션 편집
                          S.listItem()
                            .title('섹션 편집')
                            .id(`section-edit-${sectionId}`)
                            .child(
                              S.document()
                                .schemaType('section')
                                .documentId(sectionId)
                            ),
                          S.divider(),
                          // 이 섹션의 아티클들
                          S.listItem()
                            .title('아티클')
                            .id(`section-articles-${sectionId}`)
                            .child(
                              S.documentList()
                                .title('아티클 목록')
                                .id(`section-articles-list-${sectionId}`)
                                .filter('_type == "article" && section._ref == $sectionId')
                                .params({sectionId})
                                .defaultOrdering([{field: 'order', direction: 'asc'}])
                            ),
                        ])
                    )
                ),
              S.listItem()
                .title('27호')
                .id('sections-issue-27')
                .child(
                  S.documentList()
                    .title('27호 섹션')
                    .id('sections-issue-27-list')
                    .filter('_type == "section" && issue->number == 27')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                    .child((sectionId) =>
                      S.list()
                        .title('섹션')
                        .id(`section-${sectionId}`)
                        .items([
                          S.listItem()
                            .title('섹션 편집')
                            .id(`section-edit-${sectionId}`)
                            .child(
                              S.document()
                                .schemaType('section')
                                .documentId(sectionId)
                            ),
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
                                .defaultOrdering([{field: 'order', direction: 'asc'}])
                            ),
                        ])
                    )
                ),
              S.listItem()
                .title('28호')
                .id('sections-issue-28')
                .child(
                  S.documentList()
                    .title('28호 섹션')
                    .id('sections-issue-28-list')
                    .filter('_type == "section" && issue->number == 28')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                    .child((sectionId) =>
                      S.list()
                        .title('섹션')
                        .id(`section-${sectionId}`)
                        .items([
                          S.listItem()
                            .title('섹션 편집')
                            .id(`section-edit-${sectionId}`)
                            .child(
                              S.document()
                                .schemaType('section')
                                .documentId(sectionId)
                            ),
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
                                .defaultOrdering([{field: 'order', direction: 'asc'}])
                            ),
                        ])
                    )
                ),
              S.listItem()
                .title('29호')
                .id('sections-issue-29')
                .child(
                  S.documentList()
                    .title('29호 섹션')
                    .id('sections-issue-29-list')
                    .filter('_type == "section" && issue->number == 29')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                    .child((sectionId) =>
                      S.list()
                        .title('섹션')
                        .id(`section-${sectionId}`)
                        .items([
                          S.listItem()
                            .title('✏️ 섹션 편집')
                            .id(`section-edit-${sectionId}`)
                            .child(
                              S.document()
                                .schemaType('section')
                                .documentId(sectionId)
                            ),
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
                                .defaultOrdering([{field: 'order', direction: 'asc'}])
                            ),
                        ])
                    )
                ),
            ])
        ),

      S.divider(),  
      
      // 모든 섹션 (평면)
      S.listItem()
        .title('모든 섹션')
        .id('all-sections')
        .child(
          S.documentTypeList('section')
            .title('모든 섹션')
        ),
      
      // 모든 아티클
      S.listItem()
        .title('모든 아티클')
        .id('articles')
        .child(
          S.documentTypeList('article')
            .title('모든 아티클')
        ),
    ])