/**
 * 타이포그래피 클래스 상수
 * 모든 타이포그래피 스타일을 한 곳에서 관리
 */

/**
 * 제목 스타일 (h1~h6)
 */
export const TYPOGRAPHY = {
  // 제목 스타일
  h1: {
    // 직접 렌더링용 (아티클 제목)
    direct: '본문폰트 font-bold md:text-3xl md:leading-[1.5em]',
    // PortableText용
    portable: '본문폰트 font-bold md:text-3xl md:leading-[1.5em]',
  },
  h2: {
    // h2-h6는 direct와 portable 통일 (indent/padding은 필요시 추가)
    direct: '본문폰트 font-bold py-[0.3em]',
    portable: '본문폰트 font-bold py-[0.3em]',
  },
  h3: {
    direct: '본문폰트 indent-[2em] py-[0.3em]',
    portable: '본문폰트 indent-[2em] py-[0.3em]',
  },
  h4: {
    direct: '본문폰트-민부리 indent-[2em] py-[0.3em] font-bold',
    portable: '본문폰트-민부리 indent-[2em] py-[0.3em] font-bold',
  },
  h5: {
    direct: '본문폰트-민부리 pt-[0.7em]',
    portable: '본문폰트-민부리 pt-[0.7em]',
  },
  // 질문
  h6: {
    direct: '본문폰트-민부리 pl-[40%]',
    portable: '본문폰트-민부리 pl-[40%]',
  },

  // 본문 스타일
  body: {
    // 일반 본문 (PortableText normal)
    normal: '본문폰트 my-[0.6em] md:mt-[0.4em] md:mb-6',
    // 직접 렌더링용 본문
    direct: '본문폰트 my-[0.6em] md:mt-[0.4em] md:mb-6',
  },

  // 인용구
  blockquote: {
    // 인용구는 인라인 스타일도 사용하므로 클래스만 제공
    base: '본문폰트',
  },

  // 각주
  footnote: {
    // 각주 텍스트
    text: '각주폰트-민부리',
    // 각주 번호/링크
    link: '각주폰트-민부리',
  },

  // 캡션
  caption: {
    // 기본 캡션
    default: '캡션-민부리 mt-2 md:mt-3 text-center',
    // 이미지 캡션
    image: '캡션-민부리 mt-3 md:mt-4 text-center',
    // 그리드 캡션
    grid: '캡션-민부리 mt-2 md:mt-3 text-center',
  },

  // 메타 정보 (호수, 섹션 등)
  meta: {
    // 호수/섹션 정보
    issueSection: '각주폰트-민부리',
    // 저자 정보
    author: '본문폰트-민부리 md:본문폰트',
  },

  // UI 요소
  ui: {
    // 이미지 카운터
    imageCounter: '각주폰트-민부리',
    // 네비게이션 링크 텍스트
    navLink: '각주폰트-민부리',
    // 발화자/인물 이름
    speaker: '본문폰트-민부리',
    // 참고문헌 제목
    referenceTitle: '각주폰트-민부리',
    // 에러 메시지
    error: '본문폰트',
  },
} as const

/**
 * PortableText components에서 사용할 클래스 조합 헬퍼
 */
export const getTypographyClasses = (
  type: keyof typeof TYPOGRAPHY,
  variant: 'direct' | 'portable' = 'portable'
): string => {
  const typography = TYPOGRAPHY[type]
  if (typeof typography === 'object' && 'direct' in typography && 'portable' in typography) {
    return typography[variant]
  }
  if (typeof typography === 'object' && 'base' in typography) {
    return typography.base
  }
  if (typeof typography === 'object' && 'normal' in typography) {
    return variant === 'direct' ? typography.direct : typography.normal
  }
  if (typeof typography === 'object' && 'text' in typography) {
    return typography.text
  }
  if (typeof typography === 'object' && 'image' in typography) {
    return typography.image
  }
  if (typeof typography === 'object' && 'issueSection' in typography) {
    return typography.issueSection
  }
  return ''
}

/**
 * 제목 클래스 조합 (직접 렌더링용)
 */
export const getHeadingClasses = (level: 1 | 2 | 3 | 4 | 5 | 6 = 2): string => {
  const headingKey = `h${level}` as keyof typeof TYPOGRAPHY
  const heading = TYPOGRAPHY[headingKey]
  if (heading && typeof heading === 'object' && 'direct' in heading) {
    return heading.direct
  }
  return TYPOGRAPHY.h2.direct
}

/**
 * 본문 클래스 조합
 */
export const getBodyClasses = (variant: 'normal' | 'direct' = 'normal'): string => {
  if (variant === 'direct') {
    return TYPOGRAPHY.body.direct
  }
  return TYPOGRAPHY.body.normal
}

/**
 * 각주 클래스 조합
 */
export const getFootnoteClasses = (type: 'text' | 'link' = 'text'): string => {
  return TYPOGRAPHY.footnote[type]
}

/**
 * 캡션 클래스 조합
 */
export const getCaptionClasses = (type: 'image' | 'grid' | 'default' = 'default'): string => {
  return TYPOGRAPHY.caption[type]
}

