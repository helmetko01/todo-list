import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../hooks/useTodos';

describe('useTodos hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('기본 상태 및 0개일 때 진행률 0%를 반환한다', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.completedCount).toBe(0);
    expect(result.current.progressPercent).toBe(0);
  });

  it('새 할 일을 추가하면 최신 항목이 맨 앞에 위치한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('첫 번째 할 일');
    });
    act(() => {
      result.current.addTodo('두 번째 할 일');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0].text).toBe('두 번째 할 일');
    expect(result.current.todos[1].text).toBe('첫 번째 할 일');
    expect(result.current.totalCount).toBe(2);
  });

  it('공백만 있는 입력은 거부한다', () => {
    const { result } = renderHook(() => useTodos());

    let res: { success: boolean; error?: string };
    act(() => {
      res = result.current.addTodo('    ');
    });

    expect(res!.success).toBe(false);
    expect(res!.error).toBe('할 일을 입력해 주세요.');
    expect(result.current.todos).toHaveLength(0);
  });

  it('200자를 초과하는 입력은 거부한다', () => {
    const { result } = renderHook(() => useTodos());

    const longText = 'a'.repeat(201);
    let res: { success: boolean; error?: string };
    act(() => {
      res = result.current.addTodo(longText);
    });

    expect(res!.success).toBe(false);
    expect(res!.error).toContain('최대 200자');
    expect(result.current.todos).toHaveLength(0);
  });

  it('완료 상태 토글 및 진행률 계산이 올바르게 동작한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('할 일 1');
      result.current.addTodo('할 일 2');
    });

    const targetId = result.current.todos[0].id;

    act(() => {
      result.current.toggleTodo(targetId);
    });

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.completedCount).toBe(1);
    expect(result.current.remainingCount).toBe(1);
    expect(result.current.progressPercent).toBe(50);
  });

  it('할 일 내용을 수정하고 빈 내용 저장은 차단한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('원래 내용');
    });

    const targetId = result.current.todos[0].id;

    // 빈 내용 수정 시도
    let res: { success: boolean; error?: string };
    act(() => {
      res = result.current.editTodo(targetId, '   ');
    });
    expect(res!.success).toBe(false);
    expect(result.current.todos[0].text).toBe('원래 내용');

    // 정상 내용 수정
    act(() => {
      res = result.current.editTodo(targetId, '수정된 내용');
    });
    expect(res!.success).toBe(true);
    expect(result.current.todos[0].text).toBe('수정된 내용');
  });

  it('삭제 후 실행 취소 시 원래 위치와 데이터로 복원된다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('A');
      result.current.addTodo('B');
      result.current.addTodo('C');
    });

    // 목록 순서: [C, B, A]
    const targetB = result.current.todos[1]; // B
    expect(targetB.text).toBe('B');

    act(() => {
      result.current.deleteTodo(targetB.id);
    });

    expect(result.current.todos.map((t) => t.text)).toEqual(['C', 'A']);
    expect(result.current.deletedHistory?.todo.text).toBe('B');

    // 실행 취소
    act(() => {
      result.current.undoDelete();
    });

    expect(result.current.todos.map((t) => t.text)).toEqual(['C', 'B', 'A']);
    expect(result.current.deletedHistory).toBeNull();
  });

  it('완료 항목 일괄 삭제가 동작한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('진행 항목');
      result.current.addTodo('완료 항목');
    });

    const completedId = result.current.todos[0].id;
    act(() => {
      result.current.toggleTodo(completedId);
    });

    act(() => {
      result.current.clearCompleted();
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('진행 항목');
  });

  it('상태 필터와 검색어가 교집합으로 적용된다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('사과 사기');
      result.current.addTodo('바나나 사기');
      result.current.addTodo('청소하기');
    });

    // 사과 사기 완료 처리
    const appleId = result.current.todos.find((t) => t.text === '사과 사기')!.id;
    act(() => {
      result.current.toggleTodo(appleId);
    });

    // 검색어: '사기'
    act(() => {
      result.current.setSearchQuery('사기');
    });
    expect(result.current.filteredTodos).toHaveLength(2);

    // 필터: 'active'
    act(() => {
      result.current.setFilter('active');
    });
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('바나나 사기');

    // 필터: 'completed'
    act(() => {
      result.current.setFilter('completed');
    });
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('사과 사기');
  });
});
