/**
 * 반응형 브레이크포인트 상수
 * Tailwind CSS 기본 브레이크포인트와 일치
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1448,
} as const;

/**
 * 하드코딩된 레이아웃 값들
 */
export const LAYOUT = {
  MAX_WIDTH: 1400,
  ARTICLE_MAX_WIDTH: 800,
  SIDEBAR_WIDTH: 200,
  GRID_GAP_MOBILE: 4,
  GRID_GAP_DESKTOP: 16,
} as const;

/**
 * 간격 상수
 */
export const SPACING = {
  SECTION_GAP_MOBILE: 12,
  SECTION_GAP_DESKTOP: 20,
  CONTENT_GAP: 8,
} as const;

