/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'ko-sans': ['AGCJHMS', '-apple-system', 'BlinkMacSystemFont', 'Malgun Gothic', '맑은 고딕', 'sans-serif'],
        'ko-serif': ['AGCJHS', 'Apple SD Gothic Neo', 'Noto Sans KR', 'serif'],
        'en-sans': ['jjjgothic', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      gridTemplateColumns: {
        '7': 'repeat(7, minmax(0, 1fr))',
        '9': 'repeat(9, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-5': 'span 5 / span 5',
        'span-7': 'span 7 / span 7',
        'span-9': 'span 9 / span 9',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        }
      },
    },
  },
  plugins: [],
}; 