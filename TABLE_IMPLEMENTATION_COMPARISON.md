# 표 구현 방법 비교 분석

## 요구사항
- 2열 테이블 (왼쪽: 라벨, 오른쪽: 내용)
- 오른쪽 열에 리치 텍스트 지원 (긴 문장, 포맷팅)
- Portable Text와 자연스럽게 통합
- 기존 프로젝트 구조와 일관성 유지

---

## 방법 비교

### 방법 1: Portable Text + Custom Block ⭐ **권장**

#### 구조
```typescript
{
  type: 'object',
  name: 'table',
  title: '표',
  fields: [
    {
      name: 'rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              type: 'string',
              title: '라벨'
            },
            {
              name: 'content',
              type: 'array',
              title: '내용',
              of: [
                // Portable Text 블록 정의
                createBlockDefinition('standard', 'full', true)
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### 장점 ✅
1. **기존 구조와 일관성**: `imageGrid`, `imageSlider`와 동일한 패턴
2. **리치 텍스트 지원**: Portable Text로 굵게, 링크, 인용 등 지원
3. **유연한 확장**: 나중에 셀별 스타일, 병합 등 추가 가능
4. **에디터 UX**: Sanity Studio에서 직관적인 편집
5. **타입 안정성**: TypeScript로 타입 정의 가능
6. **렌더링 제어**: 프론트엔드에서 완전한 스타일링 제어

#### 단점 ❌
1. 커스텀 컴포넌트 구현 필요 (하지만 기존 패턴 재사용 가능)
2. `sanity-plugin-table`보다 기능이 적을 수 있음 (하지만 요구사항에는 충분)

---

### 방법 2: sanity-plugin-table

#### 구조
```typescript
// 플러그인 설치 후
import table from 'sanity-plugin-table'

// 스키마에 추가
table()
```

#### 장점 ✅
1. 빠른 구현: 플러그인 설치만으로 사용 가능
2. 검증된 솔루션: 많은 프로젝트에서 사용 중
3. 기본 기능 제공: 행/열 추가/삭제, 병합 등

#### 단점 ❌
1. **React 19 호환성 문제**: 현재 설치 오류 발생
   - `@sanity/icons@1.3.10`이 React 16-18만 지원
   - `--legacy-peer-deps` 필요하지만 불안정할 수 있음
2. **리치 텍스트 제한**: 셀 내용이 단순 텍스트로 제한될 수 있음
3. **커스터마이징 제한**: 플러그인 구조에 종속
4. **의존성 관리**: 외부 플러그인 업데이트에 의존

---

### 방법 3: Array of Objects (단순 구조)

#### 구조
```typescript
{
  name: 'tableRows',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        { name: 'label', type: 'string' },
        { name: 'content', type: 'text' } // 단순 텍스트만
      ]
    }
  ]
}
```

#### 장점 ✅
1. 가장 단순한 구현
2. 빠른 개발

#### 단점 ❌
1. **리치 텍스트 불가**: 단순 텍스트만 지원
2. **확장성 부족**: 나중에 기능 추가 어려움
3. **일관성 부족**: Portable Text와 분리된 구조

---

## 결론 및 권장사항

### ✅ **Portable Text + Custom Block 방식 권장**

#### 이유:
1. **기존 프로젝트 구조와 완벽한 일관성**
   - `imageGrid`, `imageSlider`와 동일한 패턴
   - `contentBlocks` 배열에 자연스럽게 통합

2. **요구사항 완벽 충족**
   - 리치 텍스트 지원 (Portable Text)
   - 2열 구조 (라벨 + 내용)
   - 확장 가능한 구조

3. **기술적 안정성**
   - React 19 호환성 문제 없음
   - 의존성 충돌 없음
   - 완전한 타입 안정성

4. **유지보수성**
   - 프로젝트 내부에서 완전한 제어
   - 커스터마이징 자유도 높음
   - 기존 코드 패턴 재사용

---

## 구현 예시

### 스키마 정의 (article.ts에 추가)

```typescript
{
  type: 'object',
  name: 'table',
  title: '표',
  fields: [
    {
      name: 'rows',
      type: 'array',
      title: '행',
      of: [
        {
          type: 'object',
          name: 'tableRow',
          title: '행',
          fields: [
            {
              name: 'label',
              type: 'string',
              title: '라벨',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'content',
              type: 'array',
              title: '내용',
              of: [
                createBlockDefinition('standard', 'full', true),
              ],
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              label: 'label',
              content: 'content',
            },
            prepare({ label, content }) {
              const firstBlock = content?.[0]
              const preview = firstBlock?.children?.[0]?.text || ''
              return {
                title: label || '(라벨 없음)',
                subtitle: preview.substring(0, 50) + (preview.length > 50 ? '...' : ''),
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    },
  ],
  preview: {
    select: {
      rows: 'rows',
    },
    prepare({ rows }) {
      return {
        title: `표 (${rows?.length || 0}행)`,
        subtitle: rows?.[0]?.label || '',
      }
    },
  },
}
```

### 프론트엔드 렌더링 (page.tsx에 추가)

```typescript
table: ({ value }: any) => {
  if (!value?.rows || !Array.isArray(value.rows)) return null

  return (
    <div className="my-8 border-t border-b border-gray-300 dark:border-gray-700">
      {value.rows.map((row: any, index: number) => (
        <div
          key={index}
          className="grid grid-cols-[200px_1fr] gap-4 py-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
        >
          <div className={`font-semibold ${getTextColor(isDarkMode)}`}>
            {row.label}
          </div>
          <div className={getTextColor(isDarkMode)}>
            <PortableText
              value={row.content}
              components={components()}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 최종 권장사항

**Portable Text + Custom Block 방식으로 구현하세요.**

이유:
- ✅ 기존 프로젝트 구조와 완벽한 일관성
- ✅ 리치 텍스트 완벽 지원
- ✅ React 19 호환성 문제 없음
- ✅ 확장 가능하고 유지보수 용이
- ✅ 기존 코드 패턴 재사용 가능
