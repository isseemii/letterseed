/**
 * 다크모드에 따른 텍스트 색상 클래스 반환
 */
export function getTextColor(isDarkMode: boolean, variant: 'default' | 'muted' | 'subtle' | 'link' = 'default'): string {
  if (isDarkMode) {
    switch (variant) {
      case 'link':
        return 'text-blue-300 border-b border-dotted border-blue-300';
      case 'muted':
        return 'text-gray-300';
      case 'subtle':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  } else {
    switch (variant) {
      case 'link':
        return 'text-blue-600 border-b border-dotted border-blue-600 hover:opacity-80';
      case 'muted':
        return 'text-gray-800';
      case 'subtle':
        return 'text-gray-600';
      default:
        return 'text-black';
    }
  }
}

/**
 * 다크모드에 따른 배경색 클래스 반환
 */
export function getBgColor(isDarkMode: boolean): string {
  return isDarkMode ? 'bg-[#171717]' : 'bg-white';
}

/**
 * 다크모드에 따른 테두리 색상 클래스 반환
 */
export function getBorderColor(isDarkMode: boolean, variant: 'default' | 'light' = 'default'): string {
  if (isDarkMode) {
    return variant === 'light' ? 'border-gray-700' : 'border-gray-700';
  } else {
    return variant === 'light' ? 'border-gray-200' : 'border-gray-300';
  }
}

/**
 * 다크모드에 따른 호버 텍스트 색상 클래스 반환
 */
export function getHoverTextColor(isDarkMode: boolean, variant: 'default' | 'muted' = 'default'): string {
  if (isDarkMode) {
    return variant === 'muted' ? 'hover:text-gray-300' : 'hover:text-white';
  } else {
    return variant === 'muted' ? 'hover:text-gray-600' : 'hover:text-black';
  }
}

/**
 * 다크모드에 따른 링크 색상 클래스 반환
 */
export function getLinkColor(isDarkMode: boolean): string {
  return isDarkMode ? 'text-gray-300' : 'text-gray-600';
}

