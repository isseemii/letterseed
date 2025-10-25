import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'section',
  title: '섹션',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '섹션명',
      type: 'string',
      description: '예: 여는 글, 특집, 기고, 인터뷰',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: () => true,
      },
      validation: (Rule) => [
        Rule.required(),
        Rule.custom(async (slug, context) => {
          const {document, getClient} = context
          const client = getClient({apiVersion: '2023-01-01'})
          
          if (!slug?.current || !document?.issue) return true
          
          // 타입 안전성을 위한 체크
          const issue = document.issue as {_ref?: string} | undefined
          const parentSection = document.parentSection as {_ref?: string} | undefined
          
          const issueRef = issue?._ref
          const parentSectionRef = parentSection?._ref || null
          
          if (!issueRef) return true
          
          const id = (document._id as string).replace(/^drafts\./, '')
          
          const query = `count(*[
            _type == "section" && 
            slug.current == $slug && 
            issue._ref == $issueRef &&
            (parentSection._ref == $parentSectionRef || (!defined(parentSection) && $parentSectionRef == null)) &&
            !(_id in [$id, $draftId])
          ])`
          
          const count = await client.fetch(query, {
            slug: slug.current,
            issueRef,
            parentSectionRef,
            id,
            draftId: `drafts.${id}`,
          })
          
          return count === 0 || '같은 호의 같은 레벨에 이미 동일한 slug가 존재합니다'
        }),
      ],
      description: '이 섹션의 영문 slug (예: intro, special, contribution, interview)',
    }),
    defineField({
      name: 'issue',
      title: '소속 호',
      type: 'reference',
      to: [{type: 'issue'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentSection',
      title: '상위 섹션',
      type: 'reference',
      to: [{type: 'section'}],
      description: '하위 섹션인 경우 상위 섹션 선택 (선택사항)',
      validation: (Rule) => 
        Rule.custom((parentSection, context) => {
          const ps = parentSection as {_ref?: string} | undefined
          if (ps && ps._ref === context.document?._id) {
            return '자기 자신을 상위 섹션으로 선택할 수 없습니다'
          }
          return true
        }),
    }),
    defineField({
      name: 'order',
      title: '순서',
      type: 'number',
      description: '섹션 표시 순서',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      issue: 'issue.number',
      parentSection: 'parentSection.title',
      parentSlug: 'parentSection.slug.current',
      order: 'order',
    },
    prepare(selection) {
      const {title, slug, issue, parentSection, parentSlug, order} = selection
      
      const urlPath = parentSection 
        ? `${issue}/${parentSlug}/${slug}`
        : `${issue}/${slug}`
      
      return {
        title: title,
        subtitle: `${urlPath} | 순서: ${order || '-'}`,
      }
    },
  },
})