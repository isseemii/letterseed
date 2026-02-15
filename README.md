# letterseed-next

한국타이포그라피학회 학술지 웹 아카이브 프로젝트입니다.  
`Next.js(App Router)` + `Sanity Studio` 기반으로 운영됩니다.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- Sanity CMS (`next-sanity`, `sanity`)

## Requirements

- Node.js 20+
- npm 10+

## Environment Variables

`.env.local` 예시:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-10-17
SANITY_API_READ_TOKEN=your_server_read_token
```

주의:
- `SANITY_API_READ_TOKEN`은 서버 전용입니다. `NEXT_PUBLIC_*`로 선언하지 않습니다.
- 토큰은 최소 권한(read)으로 발급하세요.

## Run

```bash
npm install
npm run dev
```

- 웹: `http://localhost:3000`
- Sanity Studio: `http://localhost:3000/studio`

## Scripts

- `npm run dev`: 개발 서버
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 실행
- `npm run typecheck`: TypeScript 타입 검사
- `npm run test`: 최소 테스트 기반(현재 `typecheck`)

## CI

GitHub Actions에서 아래 순서로 품질 게이트를 실행합니다.

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`

CI에서 빌드를 통과하려면 Repository `Variables/Secrets`에 아래 값을 설정해야 합니다.

- Variables: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`
- Secret: `SANITY_API_READ_TOKEN`

## Content Model

- `issue`: 호 정보
- `section`: 섹션(계층 구조 지원)
- `article`: 아티클 본문/타입별 블록

Studio의 "섹션 (호별)" 메뉴는 이슈 문서를 기준으로 동적으로 생성됩니다.
