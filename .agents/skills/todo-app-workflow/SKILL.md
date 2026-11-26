---
name: todo-app-workflow
description: >-
  Todo 웹앱 개발, 빌드, 테스트 및 QA 검증 워크플로우를 제공하는 프로젝트 전용 스킬.
---

# Todo List 프로젝트 워크플로우

이 스킬은 한국어 TodoList 웹앱의 개발 표준, 검증 시나리오 및 빌드/테스트 절차를 안내합니다.

## 개발 가이드라인
- **디자인 원칙**: `DESIGN.md`의 디자인 토큰(`var(--color-...)`)과 컴포넌트 명세를 엄격히 준수합니다.
- **상태 관리**: 외부 상태 관리 라이브러리 없이 React 내장 hook과 커스텀 hook(`useTodos`)으로 관리합니다.
- **로컬 저장소**: `localStorage`에 스키마(`todo-app:v1`)를 포함하여 저장하며, 안전한 파싱 및 저장 실패 핸들링을 구현합니다.
- **접근성 (a11y)**:
  - WAI-ARIA 속성(`aria-pressed`, `aria-describedby`, `aria-invalid`, `role="status"` 등)을 적극 적용합니다.
  - 대화상자(`dialog`)의 Esc 닫기, 포커스 트랩 및 복귀를 보장합니다.
  - 한글 IME 조합 중 Enter에 의한 의도치 않은 등록을 방지(`isComposing` 점검)합니다.

## 주요 실행 명령어
- 의존성 설치: `npm install`
- 개발 서버 실행: `npm run dev`
- 테스트 실행: `npm test` 또는 `npm run test:run`
- 프로덕션 빌드: `npm run build`
- 린트 및 타입 검사: `npm run typecheck`
