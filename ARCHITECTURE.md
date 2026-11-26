# TodoList 웹앱 아키텍처 명세서

## 1. 개요
본 애플리케이션은 서버나 외부 종속성 없이 브라우저 환경에서 동작하는 한국어 개인용 Todo 웹앱입니다.
DESIGN.md에 정의된 디자인 토큰 및 UI/UX 지침을 100% 준수합니다.

## 2. 디렉터리 구조
```
todo-list/
├── .agents/
│   └── skills/
│       └── todo-app-workflow/
│           └── SKILL.md
├── src/
│   ├── components/
│   │   ├── Header.tsx         # 날짜, 제목, 진행률 표시줄
│   │   ├── TodoInput.tsx      # 새 할 일 입력 폼 (IME 대응, 검증)
│   │   ├── FilterSearch.tsx   # 필터 (전체/진행/완료) 및 검색창
│   │   ├── TodoList.tsx       # 할 일 목록 및 빈 상태 표시
│   │   ├── TodoItem.tsx       # 단일 항목 (완료 체크, 수정, 삭제)
│   │   ├── SummaryFooter.tsx  # 남은 할 일 수, 일괄 삭제 버튼, 저장 상태
│   │   ├── ConfirmDialog.tsx  # 일괄 삭제 확인 모달 대화상자
│   │   └── UndoToast.tsx      # 개별 삭제 시 실행 취소 토스트 알림
│   ├── hooks/
│   │   └── useTodos.ts        # Todo 상태, 필터/검색, 로컬 저장소 연동 훅
│   ├── lib/
│   │   └── storage.ts         # localStorage 스키마 검증, 파싱, 안전 저장 유틸
│   ├── types/
│   │   └── todo.ts            # Todo 데이터 모델 및 필터 타입 정의
│   ├── styles/
│   │   ├── tokens.css         # DESIGN.md 기반 CSS custom properties
│   │   └── index.css          # 기본 리셋, 공통 스타일 및 반응형 레이아웃
│   ├── App.tsx                # 최상위 뷰 및 컨테이너
│   ├── main.tsx               # 엔트리포인트
│   └── test/
│       ├── storage.test.ts    # 저장소 유틸리티 테스트
│       ├── useTodos.test.ts   # 비즈니스 로직 훅 테스트
│       └── App.test.tsx       # 전체 통합 및 UI 인터랙션 테스트
├── DESIGN.md                  # 디자인 가이드 및 시스템 토큰 명세
├── README.md                  # 실행 가이드 및 설명서
├── index.html                 # HTML 템플릿
├── vite.config.ts             # Vite 및 Vitest 설정
├── tsconfig.json              # TypeScript 설정
└── package.json               # 프로젝트 의존성 및 스크립트
```

## 3. 데이터 계약 (Data Contract)
```typescript
export interface Todo {
  id: string;          // 고유 식별자 (crypto.randomUUID() 또는 fallback)
  text: string;        // 할 일 내용 (최대 200자)
  completed: boolean;  // 완료 여부
  createdAt: string;   // ISO 8601 생성 일시
  updatedAt: string;   // ISO 8601 최종 수정 일시
}

export interface TodoStoragePayload {
  schemaVersion: 'todo-app:v1';
  tasks: Todo[];
}
```

## 4. 정렬 및 필터 정책
- **기본 정렬**: `createdAt` 내림차순 (최신 항목 상단 표시). 완료 여부나 수정 시각으로 재정렬하지 않음.
- **필터 & 검색**: 필터(`all` | `active` | `completed`)와 검색어의 교집합으로 필터링.
- **실행 취소**: 단일 항목 삭제 시 이전 인덱스/위치 및 데이터를 보존하여 복원.
